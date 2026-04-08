export function welcomeEmailHtml(firstName?: string): string {
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
                Your membership is active. You now have access to deal structures, case studies, and strategic tools designed to help you capture the value you create.
              </p>

              <p style="margin:0 0 28px;font-size:15px;line-height:1.6;color:#555555;">
                Here's where to start:
              </p>

              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
                <tr>
                  <td style="padding:0 0 12px;">
                    <span style="font-family:'Courier New',monospace;font-size:11px;letter-spacing:0.1em;color:#999999;">01</span>
                    <span style="font-size:15px;color:#1a1a1a;padding-left:12px;">Browse the structure library</span>
                  </td>
                </tr>
                <tr>
                  <td style="padding:0 0 12px;">
                    <span style="font-family:'Courier New',monospace;font-size:11px;letter-spacing:0.1em;color:#999999;">02</span>
                    <span style="font-size:15px;color:#1a1a1a;padding-left:12px;">Read a case study that fits your situation</span>
                  </td>
                </tr>
                <tr>
                  <td style="padding:0 0 0;">
                    <span style="font-family:'Courier New',monospace;font-size:11px;letter-spacing:0.1em;color:#999999;">03</span>
                    <span style="font-size:15px;color:#1a1a1a;padding-left:12px;">Map your position with the assessment</span>
                  </td>
                </tr>
              </table>

              <!-- Button -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center">
                    <a href="https://insequence.so/dashboard" target="_blank" style="display:inline-block;padding:14px 32px;background-color:#1a1a1a;color:#ffffff;font-family:'Courier New',monospace;font-size:11px;letter-spacing:0.12em;text-transform:uppercase;text-decoration:none;border-radius:2px;">
                      Go to Dashboard
                    </a>
                  </td>
                </tr>
              </table>

            </td>
          </tr>
        </table>

        <!-- Footer -->
        <table role="presentation" width="100%" style="max-width:480px;" cellpadding="0" cellspacing="0">
          <tr>
            <td style="padding-top:24px;text-align:center;font-family:'Courier New',monospace;font-size:10px;letter-spacing:0.1em;color:#999999;">
              &copy; In Sequence
            </td>
          </tr>
        </table>

      </td>
    </tr>
  </table>
</body>
</html>`;
}
