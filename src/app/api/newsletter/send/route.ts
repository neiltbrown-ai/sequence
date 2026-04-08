import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { sendEmail, logEmail } from "@/lib/email/send";
import {
  newsletterEmailHtml,
  type NewsletterData,
} from "@/lib/email/templates/newsletter";
import { generateToken } from "@/app/api/newsletter/unsubscribe/route";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://insequence.so";

export async function POST(req: NextRequest) {
  // Verify admin
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const adminClient = createAdminClient();
  const { data: profile } = await adminClient
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") {
    return NextResponse.json({ error: "Admin only" }, { status: 403 });
  }

  const { newsletter, audience, testEmail } = await req.json();

  if (!newsletter?.subject || !newsletter?.intro || !newsletter?.entries?.length) {
    return NextResponse.json(
      { error: "Subject, intro, and at least one entry are required" },
      { status: 400 }
    );
  }

  const data: NewsletterData = newsletter;

  // If testEmail is provided, only send to that address
  if (testEmail) {
    const token = await generateToken(testEmail);
    const unsubscribeUrl = `${APP_URL}/api/newsletter/unsubscribe?email=${encodeURIComponent(testEmail)}&token=${token}`;
    const html = newsletterEmailHtml(data, unsubscribeUrl, "Test");

    const result = await sendEmail({
      to: testEmail,
      subject: `[TEST] ${data.subject}`,
      html,
    });

    return NextResponse.json({
      success: result.success,
      test: true,
      sent: result.success ? 1 : 0,
    });
  }

  // Get recipients based on audience
  let query = adminClient
    .from("newsletter_subscribers")
    .select("email, name, user_id")
    .eq("status", "active");

  if (audience === "members") {
    query = query.not("user_id", "is", null);
  } else if (audience === "free") {
    query = query.is("user_id", null);
  }
  // audience === "all" or undefined sends to everyone

  const { data: subscribers, error } = await query;

  if (error || !subscribers) {
    return NextResponse.json(
      { error: "Failed to fetch subscribers" },
      { status: 500 }
    );
  }

  let sent = 0;
  let failed = 0;

  for (const sub of subscribers) {
    const token = await generateToken(sub.email);
    const unsubscribeUrl = `${APP_URL}/api/newsletter/unsubscribe?email=${encodeURIComponent(sub.email)}&token=${token}`;
    const firstName = sub.name?.split(" ")[0];
    const html = newsletterEmailHtml(data, unsubscribeUrl, firstName);

    const result = await sendEmail({
      to: sub.email,
      subject: data.subject,
      html,
    });

    if (result.success) {
      sent++;
    } else {
      failed++;
    }

    await logEmail(adminClient, {
      userId: sub.user_id || undefined,
      emailType: "newsletter",
      recipientEmail: sub.email,
      subject: data.subject,
      status: result.success ? "sent" : "failed",
    });
  }

  return NextResponse.json({
    success: true,
    total: subscribers.length,
    sent,
    failed,
  });
}
