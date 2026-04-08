import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe/client";
import { createAdminClient } from "@/lib/supabase/admin";
import { priceIdToPlan } from "@/lib/plans";
import { sendEmail, logEmail } from "@/lib/email/send";
import { welcomeEmailHtml } from "@/lib/email/templates/welcome";
import { paymentFailedEmailHtml } from "@/lib/email/templates/payment-failed";
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

  const supabase = createAdminClient();

  switch (event.type) {
    // ── New subscription from checkout ──────────────────
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      const userId = session.metadata?.supabase_user_id;
      const planFromMeta = session.metadata?.plan;
      const customerId =
        typeof session.customer === "string"
          ? session.customer
          : session.customer?.id;
      const subscriptionId =
        typeof session.subscription === "string"
          ? session.subscription
          : session.subscription?.id;

      if (!userId || !customerId || !subscriptionId) {
        console.error("Checkout missing required metadata:", {
          userId,
          customerId,
          subscriptionId,
        });
        break;
      }

      // Fetch full subscription for period and price details
      const subscription =
        await getStripe().subscriptions.retrieve(subscriptionId);
      const firstItem = subscription.items.data[0];
      const priceId = firstItem?.price?.id ?? null;

      // Resolve plan: prefer metadata, fall back to price ID mapping
      const plan = planFromMeta || priceIdToPlan(priceId);

      const periodStart = firstItem?.current_period_start;
      const periodEnd = firstItem?.current_period_end;

      const { error: subError } = await supabase
        .from("subscriptions")
        .upsert(
          {
            user_id: userId,
            stripe_customer_id: customerId,
            stripe_subscription_id: subscriptionId,
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
        console.error("Error upserting subscription:", JSON.stringify(subError));
        console.error("Upsert payload:", JSON.stringify({ user_id: userId, plan, priceId, status: subscription.status }));
      }

      // Activate user profile
      await supabase
        .from("profiles")
        .update({ status: "active" })
        .eq("id", userId);

      console.log(`✓ Subscription provisioned for user ${userId} (plan: ${plan})`);

      // Track code redemption if checkout was initiated with a code
      const codeId = session.metadata?.code_id;
      const codeType = session.metadata?.code_type;
      if (codeId && codeType) {
        // Increment current_uses
        const codeTable = codeType === "university" ? "university_codes" : "discount_codes";
        const { data: codeRow } = await supabase
          .from(codeTable)
          .select("current_uses, code")
          .eq("id", codeId)
          .maybeSingle();

        if (codeRow) {
          await supabase
            .from(codeTable)
            .update({ current_uses: (codeRow.current_uses || 0) + 1 })
            .eq("id", codeId);

          // Log redemption
          await supabase.from("code_redemptions").insert({
            user_id: userId,
            code_type: codeType,
            code_id: codeId,
            code_value: codeRow.code,
          });

          console.log(`✓ Code redemption tracked: ${codeRow.code} (${codeType})`);
        }
      }

      // Auto-subscribe to newsletter
      const { data: existingNewsletterSub } = await supabase
        .from("newsletter_subscribers")
        .select("id")
        .eq("email", session.customer_details?.email || "")
        .maybeSingle();

      if (!existingNewsletterSub) {
        await supabase.from("newsletter_subscribers").insert({
          email: (session.customer_details?.email || "").toLowerCase(),
          name: session.customer_details?.name || null,
          user_id: userId,
          source: "checkout",
          status: "active",
        });
      } else {
        // Link existing subscriber to user account
        await supabase
          .from("newsletter_subscribers")
          .update({ user_id: userId, status: "active" })
          .eq("id", existingNewsletterSub.id);
      }

      // Send welcome email
      const { data: profile } = await supabase
        .from("profiles")
        .select("email, first_name")
        .eq("id", userId)
        .single();

      if (profile?.email) {
        const subject = "Welcome to In Sequence";
        const result = await sendEmail({
          to: profile.email,
          subject,
          html: welcomeEmailHtml(profile.first_name),
        });
        await logEmail(supabase, {
          userId,
          emailType: "welcome",
          recipientEmail: profile.email,
          subject,
          status: result.success ? "sent" : "failed",
        });
      }

      break;
    }

    // ── Subscription updated (plan change, renewal, etc.) ──
    case "customer.subscription.updated": {
      const subscription = event.data.object as Stripe.Subscription;
      const userId = subscription.metadata?.supabase_user_id;
      const subItem = subscription.items.data[0];
      const updPriceId = subItem?.price?.id ?? null;
      const updPeriodStart = subItem?.current_period_start;
      const updPeriodEnd = subItem?.current_period_end;

      // Detect plan from subscription metadata first (set during checkout), then fall back to price ID
      const planFromSubMeta = subscription.metadata?.plan as string | undefined;
      const updatedPlan = planFromSubMeta || priceIdToPlan(updPriceId);

      const updatePayload = {
        status: subscription.status as string,
        stripe_price_id: updPriceId,
        plan: updatedPlan,
        current_period_start: updPeriodStart
          ? new Date(updPeriodStart * 1000).toISOString()
          : null,
        current_period_end: updPeriodEnd
          ? new Date(updPeriodEnd * 1000).toISOString()
          : null,
        cancel_at_period_end: subscription.cancel_at_period_end,
      };

      if (!userId) {
        const { data: existing } = await supabase
          .from("subscriptions")
          .select("user_id")
          .eq("stripe_subscription_id", subscription.id)
          .maybeSingle();

        if (!existing) {
          console.error(
            "No user found for subscription:",
            subscription.id
          );
          break;
        }

        await supabase
          .from("subscriptions")
          .update(updatePayload)
          .eq("stripe_subscription_id", subscription.id);
      } else {
        await supabase
          .from("subscriptions")
          .update(updatePayload)
          .eq("user_id", userId);
      }

      console.log(`✓ Subscription updated: ${subscription.id} (plan: ${updatedPlan})`);
      break;
    }

    // ── Subscription canceled/expired ──────────────────
    case "customer.subscription.deleted": {
      const subscription = event.data.object as Stripe.Subscription;

      const { error: delError } = await supabase
        .from("subscriptions")
        .update({ status: "canceled" })
        .eq("stripe_subscription_id", subscription.id);

      if (delError) {
        console.error("Error revoking subscription:", delError);
      }

      console.log(`✓ Subscription canceled: ${subscription.id}`);
      break;
    }

    // ── Payment failed ──────────────────────────────────
    case "invoice.payment_failed": {
      const invoice = event.data.object as Stripe.Invoice;
      const subRef = invoice.parent?.subscription_details?.subscription;
      const failedSubId =
        typeof subRef === "string" ? subRef : subRef?.id;

      if (failedSubId) {
        await supabase
          .from("subscriptions")
          .update({ status: "past_due" })
          .eq("stripe_subscription_id", failedSubId);
      }

      console.log(`⚠ Payment failed for invoice: ${invoice.id}`);

      // Send payment failed email
      if (failedSubId) {
        const { data: failedSub } = await supabase
          .from("subscriptions")
          .select("user_id")
          .eq("stripe_subscription_id", failedSubId)
          .single();

        if (failedSub?.user_id) {
          const { data: failedProfile } = await supabase
            .from("profiles")
            .select("email, first_name")
            .eq("id", failedSub.user_id)
            .single();

          if (failedProfile?.email) {
            const subject = "Payment issue — In Sequence";
            const result = await sendEmail({
              to: failedProfile.email,
              subject,
              html: paymentFailedEmailHtml(failedProfile.first_name),
            });
            await logEmail(supabase, {
              userId: failedSub.user_id,
              emailType: "payment_failed",
              recipientEmail: failedProfile.email,
              subject,
              status: result.success ? "sent" : "failed",
            });
          }
        }
      }

      break;
    }

    default:
      console.log(`Unhandled event type: ${event.type}`);
  }

  return NextResponse.json({ received: true });
}
