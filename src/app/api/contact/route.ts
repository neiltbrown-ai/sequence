import { NextResponse } from "next/server";
import { sendEmail } from "@/lib/email/send";

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

    const inboxEmail = "insequence.so@gmail.com";
    const typeLabel = inquiryType || "General";

    const result = await sendEmail({
      to: inboxEmail,
      subject: `[Contact] ${typeLabel}: ${subject || "No subject"}`,
      html: `
        <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:#1a1a1a;max-width:600px;">
          <p style="font-size:11px;font-family:'Courier New',monospace;letter-spacing:0.1em;text-transform:uppercase;color:#999;">IN SEQUENCE — CONTACT FORM</p>
          <hr style="border:none;border-top:1px solid #e8e5e0;margin:16px 0;" />
          <p><strong>From:</strong> ${name} &lt;${email}&gt;</p>
          <p><strong>Type:</strong> ${typeLabel}</p>
          ${subject ? `<p><strong>Subject:</strong> ${subject}</p>` : ""}
          <hr style="border:none;border-top:1px solid #e8e5e0;margin:16px 0;" />
          <p style="white-space:pre-wrap;line-height:1.6;">${message}</p>
          <hr style="border:none;border-top:1px solid #e8e5e0;margin:16px 0;" />
          <p style="font-size:12px;color:#999;">Reply directly to this email to respond to ${name}.</p>
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
