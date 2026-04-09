export function newsletterWelcomeEmailHtml(
  firstName?: string,
  unsubscribeUrl?: string
): string {
  const greeting = firstName ? `Welcome, ${firstName}` : "Welcome to In Sequence";

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome</title>
</head>
<body style="margin:0;padding:0;background-color:#f5f3f0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:#1a1a1a;-webkit-font-smoothing:antialiased;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="min-height:100vh;">
    <tr>
      <td align="center" style="padding:48px 24px;">

        <!-- Logo -->
        <table role="presentation" width="100%" style="max-width:480px;" cellpadding="0" cellspacing="0">
          <tr>
            <td style="padding-bottom:32px;text-align:center;font-family:'Courier New',monospace;font-size:11px;letter-spacing:0.15em;text-transform:uppercase;color:#555555;">
              IN SEQUENCE
            </td>
          </tr>
        </table>

        <!-- Card -->
        <table role="presentation" width="100%" style="max-width:480px;background-color:#ffffff;border:1px solid #d9d6d1;border-radius:2px;" cellpadding="0" cellspacing="0">
          <tr>
            <td style="padding:40px 36px;">

              <h1 style="margin:0 0 12px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;font-size:22px;font-weight:500;letter-spacing:-0.02em;line-height:1.3;color:#1a1a1a;">
                ${greeting}
              </h1>

              <p style="margin:0 0 20px;font-size:15px;line-height:1.6;color:#555555;">
                You're now on the list. Each edition covers the deal structures, negotiation frameworks, and business models that creative professionals use to capture the value they create.
              </p>

              <p style="margin:0 0 20px;font-size:15px;line-height:1.6;color:#555555;">
                In the meantime, here are a few places to start:
              </p>

              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
                <tr>
                  <td style="padding:0 0 12px;">
                    <span style="font-family:'Courier New',monospace;font-size:11px;letter-spacing:0.1em;color:#999999;">01</span>
                    <a href="https://insequence.so/structures" target="_blank" style="font-size:15px;color:#1a1a1a;padding-left:12px;text-decoration:underline;text-underline-offset:2px;">Browse 35+ deal structures</a>
                  </td>
                </tr>
                <tr>
                  <td style="padding:0 0 12px;">
                    <span style="font-family:'Courier New',monospace;font-size:11px;letter-spacing:0.1em;color:#999999;">02</span>
                    <a href="https://insequence.so/case-studies" target="_blank" style="font-size:15px;color:#1a1a1a;padding-left:12px;text-decoration:underline;text-underline-offset:2px;">Read a case study</a>
                  </td>
                </tr>
                <tr>
                  <td style="padding:0 0 0;">
                    <span style="font-family:'Courier New',monospace;font-size:11px;letter-spacing:0.1em;color:#999999;">03</span>
                    <a href="https://insequence.so/articles" target="_blank" style="font-size:15px;color:#1a1a1a;padding-left:12px;text-decoration:underline;text-underline-offset:2px;">Explore the latest articles</a>
                  </td>
                </tr>
              </table>

              <!-- Divider -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr><td style="padding:0;"><hr style="border:none;border-top:1px solid #e8e5e0;margin:0 0 20px;" /></td></tr>
              </table>

              <p style="margin:0 0 8px;font-size:15px;line-height:1.6;color:#555555;">
                Questions about a deal, a structure, or how to apply any of this to your situation? Just reply to this email.
              </p>
              <p style="margin:0;font-size:15px;line-height:1.6;color:#1a1a1a;font-weight:500;">
                — Neil
              </p>

            </td>
          </tr>
        </table>

        <!-- Footer -->
        <table role="presentation" width="100%" style="max-width:480px;" cellpadding="0" cellspacing="0">
          <tr>
            <td style="padding-top:24px;text-align:center;">
              <span style="font-family:'Courier New',monospace;font-size:10px;letter-spacing:0.1em;color:#999999;">
                &copy; In Sequence
              </span>
              ${unsubscribeUrl ? `<span style="font-family:'Courier New',monospace;font-size:10px;letter-spacing:0.08em;color:#999999;padding-left:16px;"><a href="${unsubscribeUrl}" style="color:#999999;text-decoration:underline;">Unsubscribe</a></span>` : ""}
            </td>
          </tr>
        </table>

      </td>
    </tr>
  </table>
</body>
</html>`;
}
