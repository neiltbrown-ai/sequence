import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

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

    return NextResponse.json({ success: true });
  } catch {
    console.error("Newsletter subscribe error");
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
