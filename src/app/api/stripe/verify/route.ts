import { NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe/client";
import { createAdminClient } from "@/lib/supabase/admin";
import { priceIdToPlan } from "@/lib/plans";

/**
 * POST /api/stripe/verify
 *
 * Fallback subscription provisioning for when webhooks can't reach the server
 * (e.g. localhost dev, webhook misconfiguration). Called from the signup
 * confirmation page with the Stripe checkout session_id.
 *
 * If the subscription already exists (webhook beat us), this is a no-op.
 */
export async function POST(request: Request) {
  try {
    const { sessionId } = await request.json();

    if (!sessionId || typeof sessionId !== "string") {
      return NextResponse.json(
        { error: "Missing session_id" },
        { status: 400 }
      );
    }

    const stripe = getStripe();
    const supabase = createAdminClient();

    // Retrieve the checkout session with expanded subscription
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ["subscription"],
    });

    if (session.payment_status !== "paid") {
      return NextResponse.json(
        { error: "Payment not completed" },
        { status: 400 }
      );
    }

    const userId = session.metadata?.supabase_user_id;
    const planFromMeta = session.metadata?.plan;
    const customerId =
      typeof session.customer === "string"
        ? session.customer
        : session.customer?.id;
    const subscription = session.subscription as
      | import("stripe").Stripe.Subscription
      | null;

    if (!userId || !customerId || !subscription) {
      return NextResponse.json(
        { error: "Missing checkout data" },
        { status: 400 }
      );
    }

    // Check if subscription already exists (webhook may have already handled it)
    const { data: existing } = await supabase
      .from("subscriptions")
      .select("id, plan")
      .eq("user_id", userId)
      .maybeSingle();

    if (existing && existing.plan) {
      // Already provisioned by webhook — return success
      return NextResponse.json({
        status: "already_provisioned",
        plan: existing.plan,
      });
    }

    // Provision the subscription
    const firstItem = subscription.items.data[0];
    const priceId = firstItem?.price?.id ?? null;
    const plan = planFromMeta || priceIdToPlan(priceId);
    const periodStart = firstItem?.current_period_start;
    const periodEnd = firstItem?.current_period_end;

    const { error: subError } = await supabase.from("subscriptions").upsert(
      {
        user_id: userId,
        stripe_customer_id: customerId,
        stripe_subscription_id: subscription.id,
        stripe_price_id: priceId,
        plan,
        status: subscription.status as string,
        current_period_start: periodStart
          ? new Date(periodStart * 1000).toISOString()
          : null,
        current_period_end: periodEnd
          ? new Date(periodEnd * 1000).toISOString()
          : null,
        cancel_at_period_end: subscription.cancel_at_period_end,
      },
      { onConflict: "user_id" }
    );

    if (subError) {
      console.error("Error upserting subscription via verify:", JSON.stringify(subError));
      console.error("Verify upsert payload:", JSON.stringify({ user_id: userId, plan, priceId, status: subscription.status }));
      return NextResponse.json(
        { error: "Failed to provision subscription" },
        { status: 500 }
      );
    }

    // Activate user profile
    await supabase
      .from("profiles")
      .update({ status: "active" })
      .eq("id", userId);

    console.log(
      `✓ Subscription provisioned via verify for user ${userId} (plan: ${plan})`
    );

    return NextResponse.json({ status: "provisioned", plan });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Verification failed";
    console.error("Stripe verify error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
