import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { Resend } from "resend";
import { sendEmail, logEmail } from "@/lib/email/send";
import { bookDeliveryEmailHtml } from "@/lib/email/templates/book-delivery";
import { generateToken } from "@/app/api/newsletter/unsubscribe/route";

const RESEND_AUDIENCE_ID = "f91a8f7d-666b-4d30-8a5b-406bff5e9824";
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://insequence.so";

export async function POST(req: NextRequest) {
  try {
    const { email, name, honeypot } = await req.json();

    // Bot prevention — honeypot field should be empty
    if (honeypot) {
      return NextResponse.json({ success: true, downloadUrl: null });
    }

    // Validate email
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { error: "Please enter a valid email address." },
        { status: 400 }
      );
    }

    const bookDownloadUrl = process.env.NEXT_PUBLIC_BOOK_DOWNLOAD_URL || null;
    const supabase = createAdminClient();

    // Check if already subscribed
    const { data: existing } = await supabase
      .from("newsletter_subscribers")
      .select("id, status, name")
      .eq("email", email.toLowerCase())
      .maybeSingle();

    let isNewSubscriber = false;

    if (existing) {
      // Update existing record — if previously unsubscribed, reactivate.
      // Update name if provided and not already set.
      const updates: {
        status: string;
        unsubscribed_at: null;
        name?: string;
      } = {
        status: "active",
        unsubscribed_at: null,
      };
      if (name && !existing.name) {
        updates.name = name;
      }
      await supabase
        .from("newsletter_subscribers")
        .update(updates)
        .eq("id", existing.id);
    } else {
      await supabase.from("newsletter_subscribers").insert({
        email: email.toLowerCase(),
        name: name || null,
        source: "book_download",
      });
      isNewSubscriber = true;
    }

    // Sync to Resend Audience (non-blocking — don't fail request if this errors)
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

    // Send welcome email (only for new subscribers — skip repeat submits)
    if (isNewSubscriber) {
      try {
        const token = await generateToken(email.toLowerCase());
        const unsubscribeUrl = `${APP_URL}/api/newsletter/unsubscribe?email=${encodeURIComponent(email.toLowerCase())}&token=${token}`;
        const firstName = name?.split(" ")[0];
        const subject = "Your copy of In Sequence";
        const result = await sendEmail({
          to: email.toLowerCase(),
          subject,
          html: bookDeliveryEmailHtml(
            firstName,
            bookDownloadUrl || undefined,
            unsubscribeUrl
          ),
        });
        await logEmail(supabase, {
          emailType: "book_download",
          recipientEmail: email.toLowerCase(),
          subject,
          status: result.success ? "sent" : "failed",
        });
      } catch {
        // Silent — welcome email is best-effort
      }
    }

    return NextResponse.json({
      success: true,
      downloadUrl: bookDownloadUrl,
      ...(bookDownloadUrl
        ? {}
        : { warning: "Download URL not configured. We'll email it to you shortly." }),
    });
  } catch {
    console.error("Book download error");
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
