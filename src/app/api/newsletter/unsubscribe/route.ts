import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(req: NextRequest) {
  const email = req.nextUrl.searchParams.get("email");
  const token = req.nextUrl.searchParams.get("token");

  if (!email || !token) {
    return new NextResponse(unsubscribePage("Invalid unsubscribe link."), {
      headers: { "Content-Type": "text/html" },
    });
  }

  // Verify token matches (simple HMAC to prevent abuse)
  const expectedToken = await generateToken(email);
  if (token !== expectedToken) {
    return new NextResponse(unsubscribePage("Invalid unsubscribe link."), {
      headers: { "Content-Type": "text/html" },
    });
  }

  const supabase = createAdminClient();

  await supabase
    .from("newsletter_subscribers")
    .update({
      status: "unsubscribed",
      unsubscribed_at: new Date().toISOString(),
    })
    .eq("email", email.toLowerCase());

  return new NextResponse(
    unsubscribePage("You've been unsubscribed. You won't receive further emails."),
    { headers: { "Content-Type": "text/html" } }
  );
}

export async function generateToken(email: string): Promise<string> {
  const secret = process.env.RESEND_API_KEY || "fallback-secret";
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const signature = await crypto.subtle.sign(
    "HMAC",
    key,
    encoder.encode(email.toLowerCase())
  );
  return Buffer.from(signature).toString("hex").slice(0, 32);
}

function unsubscribePage(message: string): string {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Unsubscribe — In Sequence</title>
</head>
<body style="margin:0;padding:0;background-color:#f5f3f0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:#1a1a1a;display:flex;align-items:center;justify-content:center;min-height:100vh;">
  <div style="max-width:480px;padding:40px 36px;background:#ffffff;border:1px solid #d9d6d1;border-radius:2px;text-align:center;">
    <div style="font-family:'Courier New',monospace;font-size:11px;letter-spacing:0.15em;text-transform:uppercase;color:#555555;margin-bottom:24px;">IN SEQUENCE</div>
    <p style="font-size:15px;line-height:1.6;color:#555555;margin:0;">${message}</p>
  </div>
</body>
</html>`;
}
