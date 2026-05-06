import { Resend } from "resend";

/**
 * Lazy Resend client — instantiated on first use rather than at module
 * load. Two reasons:
 *
 *   1. **Build-time safety.** Next.js evaluates route modules during the
 *      "collect page data" build step. If Resend was constructed at
 *      module level (`const resend = new Resend(process.env.RESEND_API_KEY)`)
 *      the SDK throws when the env var is missing — which kills the
 *      entire build, not just the routes that actually need email.
 *      Lazy instantiation keeps the build env-independent: routes that
 *      never call `sendEmail()` at request time don't trip on a missing
 *      key during build.
 *
 *   2. **Runtime parity with the other Resend callsites.** The two other
 *      places that use Resend directly (`/api/book/download`,
 *      `/api/newsletter/subscribe`) already construct the client inside
 *      their request handlers. This module now matches that pattern.
 *
 * Runtime behavior is unchanged: the first call to `sendEmail()` after
 * cold start constructs the client; subsequent calls reuse the cached
 * instance. If the env var is missing at runtime, Resend throws on
 * `.emails.send()` and we catch it in the try/catch below.
 */
let _resend: Resend | null = null;
function getResend(): Resend {
  if (!_resend) {
    _resend = new Resend(process.env.RESEND_API_KEY);
  }
  return _resend;
}

const FROM_ADDRESS = "In Sequence <hello@insequence.so>";

interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
  replyTo?: string;
}

export async function sendEmail({ to, subject, html, replyTo }: SendEmailOptions) {
  try {
    const { data, error } = await getResend().emails.send({
      from: FROM_ADDRESS,
      to,
      subject,
      html,
      replyTo: replyTo || "insequence.so@gmail.com",
    });

    if (error) {
      console.error("Resend error:", error);
      return { success: false, error };
    }

    return { success: true, id: data?.id };
  } catch (err) {
    console.error("Email send failed:", err);
    return { success: false, error: err };
  }
}

export async function logEmail(
  supabase: ReturnType<typeof import("@/lib/supabase/admin").createAdminClient>,
  {
    userId,
    emailType,
    recipientEmail,
    subject,
    status,
  }: {
    userId?: string;
    emailType: string;
    recipientEmail: string;
    subject: string;
    status: "sent" | "failed" | "bounced";
  }
) {
  await supabase.from("email_log").insert({
    user_id: userId || null,
    email_type: emailType,
    recipient_email: recipientEmail,
    subject,
    status,
  });
}
