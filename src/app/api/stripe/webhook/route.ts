import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe/client";
import Stripe from "stripe";

export async function POST(request: Request) {
  const body = await request.text();
  const headersList = await headers();
  const signature = headersList.get("stripe-signature");

  if (!signature) {
    return NextResponse.json(
      { error: "Missing stripe-signature header" },
      { status: 400 }
    );
  }

  let event: Stripe.Event;

  try {
    event = getStripe().webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error(`Webhook signature verification failed: ${message}`);
    return NextResponse.json({ error: message }, { status: 400 });
  }

  // Handle the event
  switch (event.type) {
    case "checkout.session.completed": {
      // TODO: Provision access — update subscription in database
      console.log("Checkout session completed:", event.data.object.id);
      break;
    }
    case "customer.subscription.updated": {
      // TODO: Sync subscription status
      console.log("Subscription updated:", event.data.object.id);
      break;
    }
    case "customer.subscription.deleted": {
      // TODO: Revoke access
      console.log("Subscription deleted:", event.data.object.id);
      break;
    }
    case "invoice.payment_failed": {
      // TODO: Handle failed payment — notify user
      console.log("Payment failed:", event.data.object.id);
      break;
    }
    default:
      console.log(`Unhandled event type: ${event.type}`);
  }

  return NextResponse.json({ received: true });
}
