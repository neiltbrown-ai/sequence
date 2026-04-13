export function bookDeliveryEmailHtml(
  firstName?: string,
  bookDownloadUrl?: string,
  unsubscribeUrl?: string
): string {
  const greeting = firstName ? `Hi ${firstName},` : "Hi there,";

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your copy of In Sequence</title>
</head>
<body style="margin:0;padding:0;background-color:#f5f3f0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:#1a1a1a;-webkit-font-smoothing:antialiased;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
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

              <p style="margin:0 0 20px;font-size:15px;line-height:1.7;color:#555555;">
                ${greeting}
              </p>

              <h1 style="margin:0 0 12px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;font-size:22px;font-weight:500;letter-spacing:-0.02em;line-height:1.3;color:#1a1a1a;">
                Your copy of In Sequence
              </h1>

              <p style="margin:0 0 24px;font-size:15px;line-height:1.7;color:#555555;">
                Here&rsquo;s the book you requested. The link doesn&rsquo;t expire &mdash; download it anytime.
              </p>

              ${bookDownloadUrl ? `
              <!-- Download Button -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
                <tr>
                  <td>
                    <a href="${bookDownloadUrl}" target="_blank" style="display:inline-block;padding:14px 32px;background-color:#1a1a1a;color:#ffffff;font-family:'Courier New',monospace;font-size:11px;letter-spacing:0.12em;text-transform:uppercase;text-decoration:none;border-radius:2px;">
                      Download PDF
                    </a>
                  </td>
                </tr>
              </table>
              ` : ""}

              <!-- Divider -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr><td style="padding:0;"><hr style="border:none;border-top:1px solid #e8e5e0;margin:0 0 20px;" /></td></tr>
              </table>

              <p style="margin:0 0 16px;font-size:15px;line-height:1.7;color:#555555;">
                You&rsquo;ve also been added to the newsletter. Issues go out when there&rsquo;s something worth saying &mdash; deal structures, case studies, and patterns in how creative value is shifting.
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
