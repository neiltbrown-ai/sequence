export function newsletterWelcomeEmailHtml(
  firstName?: string,
  unsubscribeUrl?: string,
  bookDownloadUrl?: string
): string {
  const greeting = firstName ? `Welcome, ${firstName}.` : "Welcome.";

  const bookBlock = bookDownloadUrl
    ? `
              <!-- Book download block -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr><td style="padding:0;"><hr style="border:none;border-top:1px solid #e8e5e0;margin:0 0 24px;" /></td></tr>
              </table>

              <h2 style="margin:0 0 8px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;font-size:18px;font-weight:500;letter-spacing:-0.01em;line-height:1.3;color:#1a1a1a;">
                Your copy of In Sequence
              </h2>
              <p style="margin:0 0 16px;font-size:15px;line-height:1.7;color:#555555;">
                Here's the book you requested. Download anytime &mdash; the link doesn't expire.
              </p>
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
                <tr>
                  <td>
                    <a href="${bookDownloadUrl}" target="_blank" style="display:inline-block;padding:14px 32px;background-color:#1a1a1a;color:#ffffff;font-family:'Courier New',monospace;font-size:11px;letter-spacing:0.12em;text-transform:uppercase;text-decoration:none;border-radius:2px;">
                      Download PDF
                    </a>
                  </td>
                </tr>
              </table>
    `
    : "";

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

              <h1 style="margin:0 0 20px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;font-size:22px;font-weight:500;letter-spacing:-0.02em;line-height:1.3;color:#1a1a1a;">
                ${greeting}
              </h1>

              <p style="margin:0 0 16px;font-size:15px;line-height:1.7;color:#555555;">
                The compression in the creative industry you feel is structural. It's not personal. AI is commoditizing execution. What stays scarce &mdash; genuinely, economically scarce &mdash; is discernment: knowing what's worth making, how to position it, what it means. Capital follows scarcity. Most creatives aren't positioned to capture it. That's the gap In Sequence is built to close.
              </p>

              <p style="margin:0 0 28px;font-size:15px;line-height:1.7;color:#555555;">
                Issues go out when there's something worth saying &mdash; no fixed cadence. Expect deal structures, case studies, and patterns in how creative value is shifting.
              </p>
              ${bookBlock}
              <!-- Divider -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr><td style="padding:0;"><hr style="border:none;border-top:1px solid #e8e5e0;margin:0 0 24px;" /></td></tr>
              </table>

              <p style="margin:0 0 20px;font-size:15px;line-height:1.7;color:#555555;">
                The platform is where this gets applied. Map your position, score any deal, get personalized strategic guidance, and track your creative assets &mdash; all built around the same framework you'll find in the newsletter.
              </p>

              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
                <tr>
                  <td style="padding:0 0 10px;font-size:15px;line-height:1.6;color:#555555;">
                    &bull;&ensp;Personalized strategic guidance
                  </td>
                </tr>
                <tr>
                  <td style="padding:0 0 10px;font-size:15px;line-height:1.6;color:#555555;">
                    &bull;&ensp;Score and analyze any deal
                  </td>
                </tr>
                <tr>
                  <td style="padding:0 0 10px;font-size:15px;line-height:1.6;color:#555555;">
                    &bull;&ensp;Map your position in the progression
                  </td>
                </tr>
                <tr>
                  <td style="padding:0 0 0;font-size:15px;line-height:1.6;color:#555555;">
                    &bull;&ensp;Track and value your creative assets
                  </td>
                </tr>
              </table>

              <!-- Button -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
                <tr>
                  <td>
                    <a href="https://insequence.so/platform" target="_blank" style="display:inline-block;padding:14px 32px;background-color:#1a1a1a;color:#ffffff;font-family:'Courier New',monospace;font-size:11px;letter-spacing:0.12em;text-transform:uppercase;text-decoration:none;border-radius:2px;">
                      Explore the Platform
                    </a>
                  </td>
                </tr>
              </table>

              <!-- Divider -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr><td style="padding:0;"><hr style="border:none;border-top:1px solid #e8e5e0;margin:0 0 20px;" /></td></tr>
              </table>

              <p style="margin:0 0 16px;font-size:15px;line-height:1.7;color:#555555;">
                Questions about your specific situation &mdash; just reply. This goes to a real inbox.
              </p>
              <p style="margin:0 0 4px;font-size:15px;line-height:1.6;color:#1a1a1a;font-weight:500;">
                Neil Brown
              </p>
              <p style="margin:0;font-size:13px;line-height:1.6;color:#999999;">
                In Sequence
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
