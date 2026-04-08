# Supabase Email Templates — In Sequence

Paste each template into **Supabase Dashboard → Authentication → Email Templates**.

For each template type, set the **Subject** and paste the **Body (HTML)** below.

---

## 1. Confirm Email

**Subject:** `Confirm your In Sequence account`

**Body:**

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Confirm your email</title>
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
                Confirm your email
              </h1>

              <p style="margin:0 0 28px;font-size:15px;line-height:1.6;color:#555555;">
                You're one step away from accessing your deal structures, case studies, and strategic tools. Confirm your email to get started.
              </p>

              <!-- Button -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center">
                    <a href="{{ .ConfirmationURL }}" target="_blank" style="display:inline-block;padding:14px 32px;background-color:#1a1a1a;color:#ffffff;font-family:'Courier New',monospace;font-size:11px;letter-spacing:0.12em;text-transform:uppercase;text-decoration:none;border-radius:2px;">
                      Confirm Email
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin:28px 0 0;font-size:13px;line-height:1.6;color:#999999;">
                If you didn't create an In Sequence account, you can safely ignore this email.
              </p>

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
</html>
```

---

## 2. Invite User

**Subject:** `You've been invited to In Sequence`

**Body:**

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>You've been invited</title>
</head>
<body style="margin:0;padding:0;background-color:#f5f3f0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:#1a1a1a;-webkit-font-smoothing:antialiased;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="min-height:100vh;">
    <tr>
      <td align="center" style="padding:48px 24px;">

        <table role="presentation" width="100%" style="max-width:480px;" cellpadding="0" cellspacing="0">
          <tr>
            <td style="padding-bottom:32px;text-align:center;font-family:'Courier New',monospace;font-size:11px;letter-spacing:0.15em;text-transform:uppercase;color:#555555;">
              IN SEQUENCE
            </td>
          </tr>
        </table>

        <table role="presentation" width="100%" style="max-width:480px;background-color:#ffffff;border:1px solid #d9d6d1;border-radius:2px;" cellpadding="0" cellspacing="0">
          <tr>
            <td style="padding:40px 36px;">

              <h1 style="margin:0 0 12px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;font-size:22px;font-weight:500;letter-spacing:-0.02em;line-height:1.3;color:#1a1a1a;">
                You've been invited
              </h1>

              <p style="margin:0 0 28px;font-size:15px;line-height:1.6;color:#555555;">
                Someone has invited you to join In Sequence — a membership platform for creative professionals navigating deals, ownership, and leverage. Accept the invitation to set up your account.
              </p>

              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center">
                    <a href="{{ .ConfirmationURL }}" target="_blank" style="display:inline-block;padding:14px 32px;background-color:#1a1a1a;color:#ffffff;font-family:'Courier New',monospace;font-size:11px;letter-spacing:0.12em;text-transform:uppercase;text-decoration:none;border-radius:2px;">
                      Accept Invitation
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin:28px 0 0;font-size:13px;line-height:1.6;color:#999999;">
                If you weren't expecting this invitation, you can safely ignore this email.
              </p>

            </td>
          </tr>
        </table>

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
</html>
```

---

## 3. Magic Link

**Subject:** `Your In Sequence sign-in link`

**Body:**

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Sign-in link</title>
</head>
<body style="margin:0;padding:0;background-color:#f5f3f0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:#1a1a1a;-webkit-font-smoothing:antialiased;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="min-height:100vh;">
    <tr>
      <td align="center" style="padding:48px 24px;">

        <table role="presentation" width="100%" style="max-width:480px;" cellpadding="0" cellspacing="0">
          <tr>
            <td style="padding-bottom:32px;text-align:center;font-family:'Courier New',monospace;font-size:11px;letter-spacing:0.15em;text-transform:uppercase;color:#555555;">
              IN SEQUENCE
            </td>
          </tr>
        </table>

        <table role="presentation" width="100%" style="max-width:480px;background-color:#ffffff;border:1px solid #d9d6d1;border-radius:2px;" cellpadding="0" cellspacing="0">
          <tr>
            <td style="padding:40px 36px;">

              <h1 style="margin:0 0 12px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;font-size:22px;font-weight:500;letter-spacing:-0.02em;line-height:1.3;color:#1a1a1a;">
                Sign in to In Sequence
              </h1>

              <p style="margin:0 0 28px;font-size:15px;line-height:1.6;color:#555555;">
                Click the link below to sign in. This link expires in 24 hours and can only be used once.
              </p>

              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center">
                    <a href="{{ .ConfirmationURL }}" target="_blank" style="display:inline-block;padding:14px 32px;background-color:#1a1a1a;color:#ffffff;font-family:'Courier New',monospace;font-size:11px;letter-spacing:0.12em;text-transform:uppercase;text-decoration:none;border-radius:2px;">
                      Sign In
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin:28px 0 0;font-size:13px;line-height:1.6;color:#999999;">
                If you didn't request this link, you can safely ignore this email.
              </p>

            </td>
          </tr>
        </table>

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
</html>
```

---

## 4. Change Email Address

**Subject:** `Confirm your new email address`

**Body:**

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Change email</title>
</head>
<body style="margin:0;padding:0;background-color:#f5f3f0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:#1a1a1a;-webkit-font-smoothing:antialiased;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="min-height:100vh;">
    <tr>
      <td align="center" style="padding:48px 24px;">

        <table role="presentation" width="100%" style="max-width:480px;" cellpadding="0" cellspacing="0">
          <tr>
            <td style="padding-bottom:32px;text-align:center;font-family:'Courier New',monospace;font-size:11px;letter-spacing:0.15em;text-transform:uppercase;color:#555555;">
              IN SEQUENCE
            </td>
          </tr>
        </table>

        <table role="presentation" width="100%" style="max-width:480px;background-color:#ffffff;border:1px solid #d9d6d1;border-radius:2px;" cellpadding="0" cellspacing="0">
          <tr>
            <td style="padding:40px 36px;">

              <h1 style="margin:0 0 12px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;font-size:22px;font-weight:500;letter-spacing:-0.02em;line-height:1.3;color:#1a1a1a;">
                Confirm your new email
              </h1>

              <p style="margin:0 0 28px;font-size:15px;line-height:1.6;color:#555555;">
                You requested to change the email address on your In Sequence account. Confirm this change by clicking the link below.
              </p>

              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center">
                    <a href="{{ .ConfirmationURL }}" target="_blank" style="display:inline-block;padding:14px 32px;background-color:#1a1a1a;color:#ffffff;font-family:'Courier New',monospace;font-size:11px;letter-spacing:0.12em;text-transform:uppercase;text-decoration:none;border-radius:2px;">
                      Confirm New Email
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin:28px 0 0;font-size:13px;line-height:1.6;color:#999999;">
                If you didn't request this change, your account may be compromised. Please reset your password immediately.
              </p>

            </td>
          </tr>
        </table>

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
</html>
```

---

## 5. Reset Password

**Subject:** `Reset your In Sequence password`

**Body:**

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Reset password</title>
</head>
<body style="margin:0;padding:0;background-color:#f5f3f0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:#1a1a1a;-webkit-font-smoothing:antialiased;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="min-height:100vh;">
    <tr>
      <td align="center" style="padding:48px 24px;">

        <table role="presentation" width="100%" style="max-width:480px;" cellpadding="0" cellspacing="0">
          <tr>
            <td style="padding-bottom:32px;text-align:center;font-family:'Courier New',monospace;font-size:11px;letter-spacing:0.15em;text-transform:uppercase;color:#555555;">
              IN SEQUENCE
            </td>
          </tr>
        </table>

        <table role="presentation" width="100%" style="max-width:480px;background-color:#ffffff;border:1px solid #d9d6d1;border-radius:2px;" cellpadding="0" cellspacing="0">
          <tr>
            <td style="padding:40px 36px;">

              <h1 style="margin:0 0 12px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;font-size:22px;font-weight:500;letter-spacing:-0.02em;line-height:1.3;color:#1a1a1a;">
                Reset your password
              </h1>

              <p style="margin:0 0 28px;font-size:15px;line-height:1.6;color:#555555;">
                We received a request to reset the password for your In Sequence account. Click the link below to choose a new password.
              </p>

              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center">
                    <a href="{{ .ConfirmationURL }}" target="_blank" style="display:inline-block;padding:14px 32px;background-color:#1a1a1a;color:#ffffff;font-family:'Courier New',monospace;font-size:11px;letter-spacing:0.12em;text-transform:uppercase;text-decoration:none;border-radius:2px;">
                      Reset Password
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin:28px 0 0;font-size:13px;line-height:1.6;color:#999999;">
                If you didn't request a password reset, you can safely ignore this email. Your password will remain unchanged.
              </p>

            </td>
          </tr>
        </table>

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
</html>
```

---

## 6. Reauthentication

**Subject:** `Confirm your identity — In Sequence`

**Body:**

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Reauthentication</title>
</head>
<body style="margin:0;padding:0;background-color:#f5f3f0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:#1a1a1a;-webkit-font-smoothing:antialiased;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="min-height:100vh;">
    <tr>
      <td align="center" style="padding:48px 24px;">

        <table role="presentation" width="100%" style="max-width:480px;" cellpadding="0" cellspacing="0">
          <tr>
            <td style="padding-bottom:32px;text-align:center;font-family:'Courier New',monospace;font-size:11px;letter-spacing:0.15em;text-transform:uppercase;color:#555555;">
              IN SEQUENCE
            </td>
          </tr>
        </table>

        <table role="presentation" width="100%" style="max-width:480px;background-color:#ffffff;border:1px solid #d9d6d1;border-radius:2px;" cellpadding="0" cellspacing="0">
          <tr>
            <td style="padding:40px 36px;">

              <h1 style="margin:0 0 12px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;font-size:22px;font-weight:500;letter-spacing:-0.02em;line-height:1.3;color:#1a1a1a;">
                Confirm your identity
              </h1>

              <p style="margin:0 0 28px;font-size:15px;line-height:1.6;color:#555555;">
                To continue with a sensitive action on your account, please verify your identity by clicking the link below.
              </p>

              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center">
                    <a href="{{ .ConfirmationURL }}" target="_blank" style="display:inline-block;padding:14px 32px;background-color:#1a1a1a;color:#ffffff;font-family:'Courier New',monospace;font-size:11px;letter-spacing:0.12em;text-transform:uppercase;text-decoration:none;border-radius:2px;">
                      Verify Identity
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin:28px 0 0;font-size:13px;line-height:1.6;color:#999999;">
                If you didn't initiate this request, please reset your password immediately to secure your account.
              </p>

            </td>
          </tr>
        </table>

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
</html>
```
