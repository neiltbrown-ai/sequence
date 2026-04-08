import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getStripe } from "@/lib/stripe/client";
import { STRIPE_PRICES } from "@/lib/plans";

/**
 * POST /api/stripe/checkout
 *
 * Creates a Stripe Checkout Session for the authenticated user.
 * Accepts { plan, billing } in the request body:
 *   plan: "library" | "full_access"
 *   billing: "monthly" | "annual" (only for full_access)
 */
export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!process.env.STRIPE_SECRET_KEY) {
    return NextResponse.json(
      { error: "Stripe is not configured" },
      { status: 503 }
    );
  }

  // Parse plan selection from body
  let plan = "full_access";
  let billing = "annual";
  let signupUserId: string | undefined;
  let signupEmail: string | undefined;
  let couponId: string | undefined;
  let codeId: string | undefined;
  let codeType: string | undefined;
  let returnPath: string | undefined;
  try {
    const body = await request.json();
    if (body.plan === "library" || body.plan === "full_access") {
      plan = body.plan;
    }
    if (body.billing === "monthly" || body.billing === "annual") {
      billing = body.billing;
    }
    signupUserId = body.signupUserId;
    signupEmail = body.signupEmail;
    couponId = body.couponId;
    codeId = body.codeId;
    codeType = body.codeType;
    returnPath = body.returnPath;
  } catch {
    // No body or invalid JSON — use defaults
  }

  // Use authenticated user, or fall back to signup context (email confirmation pending)
  const userId = user?.id || signupUserId;
  const userEmail = user?.email || signupEmail;

  if (!userId || !userEmail) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  // Resolve the Stripe price ID
  let priceId: string | undefined;
  if (plan === "library") {
    priceId = STRIPE_PRICES.library_annual;
  } else if (billing === "monthly") {
    priceId = STRIPE_PRICES.full_access_monthly;
  } else {
    priceId = STRIPE_PRICES.full_access_annual;
  }

  // Fallback to legacy single price ID
  if (!priceId) {
    priceId = process.env.STRIPE_PRICE_ID;
  }

  if (!priceId) {
    return NextResponse.json(
      { error: "No Stripe price configured for this plan" },
      { status: 503 }
    );
  }

  const stripe = getStripe();
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  try {
    // Check if user already has a Stripe customer ID
    const { data: existingSub } = await supabase
      .from("subscriptions")
      .select("stripe_customer_id")
      .eq("user_id", userId)
      .maybeSingle();

    let customerId = existingSub?.stripe_customer_id;

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: userEmail,
        metadata: {
          supabase_user_id: userId,
        },
      });
      customerId = customer.id;
    }

    const successBase = returnPath || "/signup";
    const cancelBase = returnPath || "/signup";

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const sessionConfig: any = {
      customer: customerId,
      mode: "subscription",
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: `${appUrl}${successBase}?step=confirmation&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl}${cancelBase}?step=payment&canceled=true`,
      subscription_data: {
        metadata: {
          supabase_user_id: userId,
          plan,
        },
      },
      metadata: {
        supabase_user_id: userId,
        plan,
        ...(codeId && { code_id: codeId }),
        ...(codeType && { code_type: codeType }),
      },
    };

    // Apply coupon or allow promotion codes (mutually exclusive)
    if (couponId) {
      sessionConfig.discounts = [{ coupon: couponId }];
    } else {
      sessionConfig.allow_promotion_codes = true;
    }

    const session = await stripe.checkout.sessions.create(sessionConfig);

    return NextResponse.json({ url: session.url });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Checkout failed";
    console.error("Stripe checkout error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
