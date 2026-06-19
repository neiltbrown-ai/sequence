import posthog from "posthog-js";

/**
 * Public-site acquisition funnel events.
 *
 * Pageviews + CTA clicks are handled automatically by PostHog autocapture —
 * these are the funnel milestones autocapture can't infer from the DOM.
 * Build the funnel in PostHog as: $pageview(/) → $pageview(/pricing) →
 * signup_account_created → checkout_started → signup_completed.
 *
 * Portal/product events are intentionally NOT defined here yet — they ship in
 * the deliberate portal pass (with session-replay masking on financial surfaces).
 */
export const AnalyticsEvent = {
  SignupAccountCreated: "signup_account_created",
  SignupPlanSelected: "signup_plan_selected",
  CheckoutStarted: "checkout_started",
  SignupCompleted: "signup_completed",
} as const;

export type AnalyticsEventName =
  (typeof AnalyticsEvent)[keyof typeof AnalyticsEvent];

/**
 * Safe capture wrapper. No-ops cleanly when PostHog isn't initialized (e.g. no
 * NEXT_PUBLIC_POSTHOG_KEY in local/dev, or an ad-blocker blocked the script) so
 * call sites never need their own guard.
 */
export function capture(
  event: AnalyticsEventName,
  properties?: Record<string, unknown>,
): void {
  if (typeof window === "undefined") return;
  if (!posthog.__loaded) return;
  posthog.capture(event, properties);
}
