import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { Resend } from "resend";
import { sendEmail, logEmail } from "@/lib/email/send";
import { newsletterWelcomeEmailHtml } from "@/lib/email/templates/newsletter-welcome";
import { generateToken } from "@/app/api/newsletter/unsubscribe/route";

const RESEND_AUDIENCE_ID = "f91a8f7d-666b-4d30-8a5b-406bff5e9824";
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://insequence.so";

export async function POST(req: NextRequest) {
  try {
    const { email, name, honeypot } = await req.json();

    // Bot prevention — honeypot field should be empty
    if (honeypot) {
      return NextResponse.json({ success: true }); // Silent success for bots
    }

    // Validate email
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { error: "Please enter a valid email address." },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();

    // Check if already subscribed
    const { data: existing } = await supabase
      .from("newsletter_subscribers")
      .select("id, status")
      .eq("email", email.toLowerCase())
      .single();

    if (existing && existing.status === "active") {
      return NextResponse.json({ success: true, already: true });
    }

    // Resubscribe if previously unsubscribed, or insert new
    if (existing) {
      await supabase
        .from("newsletter_subscribers")
        .update({
          status: "active",
          name: name || null,
          unsubscribed_at: null,
          subscribed_at: new Date().toISOString(),
        })
        .eq("id", existing.id);
    } else {
      await supabase.from("newsletter_subscribers").insert({
        email: email.toLowerCase(),
        name: name || null,
        source: "website",
      });
    }

    // Sync to Resend Audience (non-blocking — don't fail signup if this errors)
    try {
      const resend = new Resend(process.env.RESEND_API_KEY);
      const [firstName, ...rest] = (name || "").split(" ");
      await resend.contacts.create({
        audienceId: RESEND_AUDIENCE_ID,
        email: email.toLowerCase(),
        firstName: firstName || undefined,
        lastName: rest.join(" ") || undefined,
        unsubscribed: false,
      });
    } catch {
      // Silent — Resend sync is best-effort
    }

    // Send newsletter welcome email (only for new subscribers, not resubscribes)
    if (!existing) {
      try {
        const token = await generateToken(email.toLowerCase());
        const unsubscribeUrl = `${APP_URL}/api/newsletter/unsubscribe?email=${encodeURIComponent(email.toLowerCase())}&token=${token}`;
        const firstName = name?.split(" ")[0];
        const subject = "Welcome to In Sequence";
        const result = await sendEmail({
          to: email.toLowerCase(),
          subject,
          html: newsletterWelcomeEmailHtml(firstName, unsubscribeUrl),
        });
        await logEmail(supabase, {
          emailType: "newsletter_welcome",
          recipientEmail: email.toLowerCase(),
          subject,
          status: result.success ? "sent" : "failed",
        });
      } catch {
        // Silent — welcome email is best-effort
      }
    }

    return NextResponse.json({ success: true });
  } catch {
    console.error("Newsletter subscribe error");
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
