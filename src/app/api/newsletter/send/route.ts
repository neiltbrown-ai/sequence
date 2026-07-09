import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { sendEmail, logEmail } from "@/lib/email/send";
import {
  newsletterEmailHtml,
  type NewsletterData,
} from "@/lib/email/templates/newsletter";
import { generateToken } from "@/app/api/newsletter/unsubscribe/route";
import { getAppUrl } from "@/lib/app-url";

const APP_URL = getAppUrl();

// Serial send loop over the full active list can run long; keep the function
// alive (Vercel Pro allows up to 300s).
export const maxDuration = 300;

type Subscriber = { email: string; name: string | null; user_id: string | null };

/**
 * Page through a filtered newsletter_subscribers query in 1000-row batches so
 * we never silently truncate at PostgREST's default row cap. `build` must
 * return a FRESH query builder each call (a builder can't be reused after await).
 */
async function fetchAllPaged(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  build: () => any
): Promise<{ data: Subscriber[]; error: unknown }> {
  const PAGE = 1000;
  const out: Subscriber[] = [];
  let offset = 0;
  for (;;) {
    const { data, error } = await build().range(offset, offset + PAGE - 1);
    if (error) return { data: out, error };
    const rows = (data || []) as Subscriber[];
    out.push(...rows);
    if (rows.length < PAGE) break;
    offset += PAGE;
  }
  return { data: out, error: null };
}

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

  // Get recipients based on audience (supports array or string for backward compat)
  const segments: string[] = Array.isArray(audience) ? audience : [audience || "all"];
  const isAll = segments.includes("all") || segments.length === 0;

  let subscribers: Subscriber[] = [];
  let error: unknown = null;

  if (isAll) {
    const result = await fetchAllPaged(() =>
      adminClient
        .from("newsletter_subscribers")
        .select("email, name, user_id")
        .eq("status", "active")
    );
    subscribers = result.data;
    error = result.error;
  } else {
    // Build OR filter for selected segments
    const allResults: Subscriber[] = [];
    const seenEmails = new Set<string>();

    for (const seg of segments) {
      const result = await fetchAllPaged(() => {
        let query = adminClient
          .from("newsletter_subscribers")
          .select("email, name, user_id")
          .eq("status", "active");

        if (seg === "members") {
          query = query.not("user_id", "is", null);
        } else if (seg === "free") {
          query = query.is("user_id", null);
        } else if (seg === "book_download") {
          query = query.eq("source", "book_download");
        }
        return query;
      });

      if (result.error) { error = result.error; break; }
      for (const sub of result.data) {
        if (!seenEmails.has(sub.email)) {
          seenEmails.add(sub.email);
          allResults.push(sub);
        }
      }
    }
    subscribers = allResults;
  }

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
