import { NextResponse } from "next/server";
import { sendEmail } from "@/lib/email/send";
import { escapeHtml } from "@/lib/utils/escape-html";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX_FIELD = 5000;

/**
 * POST /api/contact
 *
 * Sends the contact form submission to the team inbox.
 */
export async function POST(request: Request) {
  try {
    const { name, email, inquiryType, subject, message } = await request.json();

    if (!name || !email || !message) {
      return NextResponse.json(
        { error: "Name, email, and message are required" },
        { status: 400 }
      );
    }

    if (
      typeof name !== "string" ||
      typeof email !== "string" ||
      typeof message !== "string" ||
      (subject != null && typeof subject !== "string")
    ) {
      return NextResponse.json({ error: "Invalid field types" }, { status: 400 });
    }

    if (!EMAIL_RE.test(email) || email.length > 320) {
      return NextResponse.json({ error: "Invalid email address" }, { status: 400 });
    }

    if (
      name.length > MAX_FIELD ||
      message.length > MAX_FIELD ||
      (subject && subject.length > MAX_FIELD)
    ) {
      return NextResponse.json({ error: "Input too long" }, { status: 400 });
    }

    const inboxEmail = "insequence.so@gmail.com";
    const typeLabels: Record<string, string> = {
      general: "General Inquiry",
      press: "Press & Media",
      advisory: "Advisory Interest",
      partnership: "Partnership",
      support: "Support",
    };
    const typeLabel = typeLabels[inquiryType] || inquiryType || "General Inquiry";

    const result = await sendEmail({
      to: inboxEmail,
      subject: `Sequence - ${typeLabel}: ${subject || "No subject"}`,
      html: `
        <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:#1a1a1a;max-width:600px;">
          <p style="font-size:11px;font-family:'Courier New',monospace;letter-spacing:0.1em;text-transform:uppercase;color:#999;">IN SEQUENCE — CONTACT FORM</p>
          <hr style="border:none;border-top:1px solid #e8e5e0;margin:16px 0;" />
          <p><strong>From:</strong> ${escapeHtml(name)} &lt;${escapeHtml(email)}&gt;</p>
          <p><strong>Type:</strong> ${escapeHtml(typeLabel)}</p>
          ${subject ? `<p><strong>Subject:</strong> ${escapeHtml(subject)}</p>` : ""}
          <hr style="border:none;border-top:1px solid #e8e5e0;margin:16px 0;" />
          <p style="white-space:pre-wrap;line-height:1.6;">${escapeHtml(message)}</p>
          <hr style="border:none;border-top:1px solid #e8e5e0;margin:16px 0;" />
          <p style="font-size:12px;color:#999;">Reply directly to this email to respond to ${escapeHtml(name)}.</p>
        </div>
      `,
      replyTo: email,
    });

    if (!result.success) {
      console.error("Contact form send failed:", result.error);
      return NextResponse.json(
        { error: "Failed to send message" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Contact form error:", err);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}
