export interface NewsletterEntry {
  title: string;
  image: string;
  summary: string;
  buttonText: string;
  buttonUrl: string;
}

export interface NewsletterData {
  subject: string;
  headerImage: string;
  intro: string;
  entries: NewsletterEntry[];
}

export function newsletterEmailHtml(
  data: NewsletterData,
  unsubscribeUrl: string,
  recipientName?: string
): string {
  const greeting = recipientName || "there";

  const entriesHtml = data.entries
    .map(
      (entry, i) => `
              <!-- Entry ${i + 1} -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                ${
                  entry.image
                    ? `<tr>
                  <td style="padding-bottom:16px;">
                    <img src="${entry.image}" alt="${entry.title}" width="648" style="width:100%;max-width:648px;height:auto;border-radius:2px;display:block;" />
                  </td>
                </tr>`
                    : ""
                }
                <tr>
                  <td>
                    <h2 style="margin:0 0 12px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;font-size:26px;font-weight:600;letter-spacing:-0.02em;line-height:1.2;color:#1a1a1a;">
                      ${entry.title}
                    </h2>
                    <p style="margin:0 0 16px;font-size:15px;line-height:1.6;color:#555555;">
                      ${entry.summary}
                    </p>
                    <a href="${entry.buttonUrl}" target="_blank" style="display:inline-block;padding:10px 24px;background-color:#1a1a1a;color:#ffffff;font-family:'Courier New',monospace;font-size:11px;letter-spacing:0.12em;text-transform:uppercase;text-decoration:none;border-radius:2px;">
                      ${entry.buttonText}
                    </a>
                  </td>
                </tr>
              </table>${i < data.entries.length - 1 ? `
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td style="padding:24px 0 24px;"><hr style="border:none;border-top:1px solid #e8e5e0;margin:0;" /></td></tr></table>` : ""}`
    )
    .join("\n");

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${data.subject}</title>
</head>
<body style="margin:0;padding:0;background-color:#f5f3f0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:#1a1a1a;-webkit-font-smoothing:antialiased;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
    <tr>
      <td align="center" style="padding:48px 24px;">

        <!-- Logo -->
        <table role="presentation" width="100%" style="max-width:720px;" cellpadding="0" cellspacing="0">
          <tr>
            <td style="padding-bottom:32px;text-align:center;font-family:'Courier New',monospace;font-size:11px;letter-spacing:0.15em;text-transform:uppercase;color:#555555;">
              IN SEQUENCE
            </td>
          </tr>
        </table>

        <!-- Card (header image inside) -->
        <table role="presentation" width="100%" style="max-width:720px;background-color:#ffffff;border:1px solid #d9d6d1;border-radius:2px;" cellpadding="0" cellspacing="0">
          ${
            data.headerImage
              ? `<!-- Header Image -->
          <tr>
            <td style="padding:0;line-height:0;">
              <img src="${data.headerImage}" alt="" width="720" style="width:100%;max-width:720px;height:auto;border-radius:2px 2px 0 0;display:block;" />
            </td>
          </tr>`
              : ""
          }
          <tr>
            <td style="padding:40px 36px;">

              <!-- Intro -->
              <p style="margin:0 0 32px;font-size:15px;line-height:1.6;color:#555555;">
                Hi ${greeting} —
              </p>
              <p style="margin:0 0 32px;font-size:15px;line-height:1.6;color:#555555;">
                ${data.intro}
              </p>

              <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td style="padding:0;"><hr style="border:none;border-top:1px solid #e8e5e0;margin:0 0 32px;" /></td></tr></table>

              <!-- Entries -->
              ${entriesHtml}

              <!-- Closing -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:32px;">
                <tr>
                  <td style="padding-top:28px;border-top:1px solid #e8e5e0;">
                    <p style="margin:0 0 8px;font-size:15px;line-height:1.6;color:#555555;">
                      Questions about a deal, a structure, or how to apply any of this to your situation? Just reply to this email — I read everything and I'm happy to help.
                    </p>
                    <p style="margin:0;font-size:15px;line-height:1.6;color:#1a1a1a;font-weight:500;">
                      — Neil
                    </p>
                  </td>
                </tr>
              </table>

            </td>
          </tr>
        </table>

        <!-- Footer -->
        <table role="presentation" width="100%" style="max-width:720px;background-color:#1a1a1a;border-radius:0 0 2px 2px;" cellpadding="0" cellspacing="0">
          <tr>
            <td style="padding:32px 36px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="font-family:'Courier New',monospace;font-size:11px;letter-spacing:0.15em;text-transform:uppercase;color:#ffffff;">
                    IN SEQUENCE
                  </td>
                  <td style="text-align:right;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;font-size:12px;color:#999999;">
                    <a href="https://insequence.so" target="_blank" style="color:#999999;text-decoration:none;margin-left:16px;">insequence.so</a>
                  </td>
                </tr>
              </table>
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="padding-top:16px;border-top:1px solid #333333;margin-top:16px;">
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td style="height:16px;"></td></tr></table>
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;font-size:11px;color:#777777;line-height:1.5;">
                          Structure changes everything.
                        </td>
                        <td style="text-align:right;">
                          <a href="${unsubscribeUrl}" style="font-family:'Courier New',monospace;font-size:10px;letter-spacing:0.08em;color:#777777;text-decoration:underline;">
                            Unsubscribe
                          </a>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>

      </td>
    </tr>
  </table>
</body>
</html>`;
}
