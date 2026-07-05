import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendEmail, logEmail } from "@/lib/email/send";
import { welcomeEmailHtml } from "@/lib/email/templates/welcome";
import { enforceRateLimit, clientIp } from "@/lib/rate-limit";

/**
 * POST /api/codes/redeem
 *
 * Redeems a 100% discount code (Friends & Family).
 * Provisions a Full Access subscription directly — no Stripe involved.
 */
export async function POST(request: Request) {
  const limited = await enforceRateLimit({
    key: `public:codes-redeem:${clientIp(request)}`,
    limit: 10,
    windowSeconds: 3600,
  });
  if (limited) return limited;

  let code: string;
  let signupUserId: string | undefined;
  let signupEmail: string | undefined;

  try {
    const body = await request.json();
    code = body.code?.trim();
    signupUserId = body.signupUserId;
    signupEmail = body.signupEmail;
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  if (!code) {
    return NextResponse.json({ error: "Code is required" }, { status: 400 });
  }

  // Resolve identity from the session, or from the signup fallback used during
  // the email-confirmation-pending flow (no live session yet).
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const admin = createAdminClient();

  let userId: string | undefined;
  let userEmail: string | undefined;

  if (user) {
    userId = user.id;
    userEmail = user.email ?? undefined;
  } else if (signupUserId && signupEmail) {
    // Never trust the client-supplied id/email pair on its own — that would let
    // anyone with a valid code provision Full Access onto an arbitrary account
    // id. Verify the pair against the auth record before accepting it.
    const { data: authUser, error: lookupErr } =
      await admin.auth.admin.getUserById(signupUserId);
    if (
      lookupErr ||
      !authUser?.user ||
      (authUser.user.email ?? "").toLowerCase() !== signupEmail.toLowerCase()
    ) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }
    userId = authUser.user.id;
    userEmail = authUser.user.email ?? undefined;
  }

  if (!userId || !userEmail) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  // Validate the code
  const { data: codeData, error: codeError } = await admin
    .from("discount_codes")
    .select("id, code, discount_type, discount_value, max_uses, current_uses, active, expires_at")
    .ilike("code", code)
    .maybeSingle();

  if (codeError || !codeData) {
    return NextResponse.json({ error: "Invalid code" }, { status: 400 });
  }

  if (!codeData.active) {
    return NextResponse.json({ error: "This code is no longer active" }, { status: 400 });
  }

  const now = new Date().toISOString();
  if (codeData.expires_at && codeData.expires_at < now) {
    return NextResponse.json({ error: "This code has expired" }, { status: 400 });
  }

  if (codeData.max_uses && codeData.current_uses >= codeData.max_uses) {
    return NextResponse.json({ error: "This code has reached its usage limit" }, { status: 400 });
  }

  // Must be a 100% discount
  if (!(codeData.discount_type === "percent" && codeData.discount_value >= 100)) {
    return NextResponse.json(
      { error: "This code cannot be redeemed here — use it at checkout instead" },
      { status: 400 }
    );
  }

  // Check if user already has an active subscription
  const { data: existingSub } = await admin
    .from("subscriptions")
    .select("id, status")
    .eq("user_id", userId)
    .in("status", ["active", "trialing"])
    .maybeSingle();

  if (existingSub) {
    return NextResponse.json({ error: "You already have an active subscription" }, { status: 400 });
  }

  // Provision subscription directly (no Stripe)
  const { error: subError } = await admin
    .from("subscriptions")
    .upsert(
      {
        user_id: userId,
        stripe_customer_id: null,
        stripe_subscription_id: null,
        stripe_price_id: null,
        plan: "full_access",
        status: "active",
        current_period_start: now,
        current_period_end: null, // no expiry for F&F
        cancel_at_period_end: false,
        provisioned_via: "discount_code",
      },
      { onConflict: "user_id" }
    );

  if (subError) {
    console.error("Error provisioning code subscription:", JSON.stringify(subError));
    return NextResponse.json({ error: "Failed to activate subscription" }, { status: 500 });
  }

  // Activate user profile
  await admin
    .from("profiles")
    .update({ status: "active" })
    .eq("id", userId);

  // Increment current_uses
  await admin
    .from("discount_codes")
    .update({ current_uses: (codeData.current_uses || 0) + 1 })
    .eq("id", codeData.id);

  // Log redemption
  await admin.from("code_redemptions").insert({
    user_id: userId,
    code_type: "discount",
    code_id: codeData.id,
    code_value: codeData.code,
  });

  // Auto-subscribe to newsletter
  const { data: existingNewsSub } = await admin
    .from("newsletter_subscribers")
    .select("id")
    .eq("email", userEmail.toLowerCase())
    .maybeSingle();

  if (!existingNewsSub) {
    await admin.from("newsletter_subscribers").insert({
      email: userEmail.toLowerCase(),
      user_id: userId,
      source: "discount_code",
      status: "active",
    });
  } else {
    await admin
      .from("newsletter_subscribers")
      .update({ user_id: userId, status: "active" })
      .eq("id", existingNewsSub.id);
  }

  // Send welcome email
  const { data: profile } = await admin
    .from("profiles")
    .select("email, full_name")
    .eq("id", userId)
    .single();

  if (profile?.email) {
    const subject = "Welcome to In Sequence";
    const firstName = profile.full_name?.split(" ")[0] || undefined;
    const result = await sendEmail({
      to: profile.email,
      subject,
      html: welcomeEmailHtml(firstName),
    });
    await logEmail(admin, {
      userId,
      emailType: "welcome",
      recipientEmail: profile.email,
      subject,
      status: result.success ? "sent" : "failed",
    });
  }

  console.log(`✓ Subscription provisioned via discount code for user ${userId} (code: ${codeData.code})`);

  return NextResponse.json({
    success: true,
    plan: "full_access",
    provisioned_via: "discount_code",
  });
}
