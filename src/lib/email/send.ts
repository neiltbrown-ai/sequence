import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

const FROM_ADDRESS = "In Sequence <hello@insequence.so>";

interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
  replyTo?: string;
}

export async function sendEmail({ to, subject, html, replyTo }: SendEmailOptions) {
  try {
    const { data, error } = await resend.emails.send({
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
