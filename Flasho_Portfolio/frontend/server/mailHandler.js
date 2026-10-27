import nodemailer from 'nodemailer';
import fs from 'fs';
import path from 'path';

// Helper to load credentials from frontend/.env
function getEnvCredentials() {
  let user = process.env.EMAIL_USER || process.env.VITE_EMAIL_USER;
  let pass = process.env.EMAIL_PASS || process.env.VITE_EMAIL_PASS;
  let from = process.env.EMAIL_FROM || process.env.VITE_EMAIL_FROM;

  if (!user || !pass) {
    try {
      const envPath = path.resolve(process.cwd(), '.env');
      if (fs.existsSync(envPath)) {
        const raw = fs.readFileSync(envPath, 'utf8');
        const lines = raw.split('\n');
        for (const line of lines) {
          const trimmed = line.trim();
          if (trimmed.startsWith('#') || !trimmed.includes('=')) continue;
          const [k, ...v] = trimmed.split('=');
          const val = v.join('=').trim().replace(/^["']|["']$/g, '');
          if (k.trim() === 'EMAIL_USER') user = val;
          if (k.trim() === 'EMAIL_PASS') pass = val;
          if (k.trim() === 'EMAIL_FROM') from = val;
        }
      }
    } catch (e) {
      // ignore
    }
  }

  return {
    user: user || 'flashobusiness09@gmail.com',
    pass: pass || 'lfgkdzfeniindmjn',
    from: from || '"Flasho" <flashobusiness09@gmail.com>'
  };
}

// Reusable Nodemailer transporter pool for fast dispatch
let cachedTransporter = null;
export function createTransporter() {
  if (cachedTransporter) return cachedTransporter;
  const { user, pass } = getEnvCredentials();
  cachedTransporter = nodemailer.createTransport({
    service: 'gmail',
    auth: { user, pass },
    pool: true,
    maxConnections: 3,
    maxMessages: 100
  });
  return cachedTransporter;
}

function getLogoAttachment() {
  try {
    const logoPath = path.resolve(process.cwd(), 'public', 'flasho-logo.png');
    if (fs.existsSync(logoPath)) {
      return [
        {
          filename: 'flasho-logo.png',
          path: logoPath,
          cid: 'flashologo'
        }
      ];
    }
  } catch (err) {
    console.warn('Could not attach logo:', err);
  }
  return [];
}

/**
 * 1. Initial Request Acknowledgment Email (Natural, Clean, Modern)
 */
export async function sendDeletionReceivedEmail({ email, name, phone, requestId }) {
  const { from } = getEnvCredentials();
  const transporter = createTransporter();
  const attachments = getLogoAttachment();

  const formattedDate = new Date().toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });

  const subject = `We received your Flasho account deletion request`;
  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #0d0d0d; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #E0E0E0; -webkit-font-smoothing: antialiased;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #0d0d0d; padding: 40px 16px;">
    <tr>
      <td align="center">
        <!-- Main Card -->
        <table role="presentation" width="100%" style="max-width: 540px; background-color: #141414; border: 1px solid #242424; border-radius: 16px; overflow: hidden;" cellspacing="0" cellpadding="0">
          
          <!-- Header with real logo -->
          <tr>
            <td style="padding: 32px 32px 24px 32px; text-align: left; border-bottom: 1px solid #1f1f1f;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                <tr>
                  <td>
                    <img src="cid:flashologo" alt="Flasho" style="height: 34px; width: auto; display: block; border: 0;" />
                  </td>
                  <td align="right" style="font-size: 12px; color: #FFD233; font-weight: 600; letter-spacing: 0.5px;">
                    Pass hai, fast hai.
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding: 32px;">
              <h1 style="margin: 0 0 16px 0; font-size: 20px; font-weight: 700; color: #FFFFFF; line-height: 1.3;">
                Account deletion request received
              </h1>

              <p style="margin: 0 0 16px 0; font-size: 15px; line-height: 1.6; color: #D0D0D0;">
                Hi ${name ? name.split(' ')[0] : 'there'},
              </p>

              <p style="margin: 0 0 20px 0; font-size: 15px; line-height: 1.6; color: #B0B0B0;">
                We've received your request to delete your Flasho account. If your account is registered with us, our team will review and complete the deletion within <strong style="color: #FFFFFF;">24 hours</strong>.
              </p>

              <!-- Request Details -->
              <table role="presentation" width="100%" style="background-color: #0a0a0a; border: 1px solid #222222; border-radius: 12px; padding: 16px 20px; margin-bottom: 24px;" cellspacing="0" cellpadding="0">
                <tr>
                  <td style="padding: 6px 0; font-size: 13px; color: #888888; width: 38%;">Name:</td>
                  <td style="padding: 6px 0; font-size: 13px; font-weight: 600; color: #FFFFFF;">${name || 'Flasho User'}</td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; font-size: 13px; color: #888888;">Mobile:</td>
                  <td style="padding: 6px 0; font-size: 13px; font-weight: 600; color: #FFFFFF;">${phone || 'Not provided'}</td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; font-size: 13px; color: #888888;">Email:</td>
                  <td style="padding: 6px 0; font-size: 13px; font-weight: 600; color: #FFD233;">${email}</td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; font-size: 13px; color: #888888;">Date:</td>
                  <td style="padding: 6px 0; font-size: 13px; color: #BBBBBB;">${formattedDate}</td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; font-size: 13px; color: #888888;">Estimated Time:</td>
                  <td style="padding: 6px 0; font-size: 13px; font-weight: 600; color: #FFD233;">Within 24 Hours</td>
                </tr>
              </table>

              <p style="margin: 0 0 16px 0; font-size: 14px; line-height: 1.6; color: #B0B0B0;">
                Once the deletion is finished, you will receive a final confirmation email. All your saved profile information, past bookings, and addresses will be permanently removed.
              </p>

              <!-- Did not request this? -->
              <div style="background-color: #1a1414; border-left: 3px solid #EF4444; padding: 14px 16px; border-radius: 8px; margin: 24px 0;">
                <p style="margin: 0; font-size: 13px; line-height: 1.5; color: #FCA5A5;">
                  <strong style="color: #FFFFFF;">Didn't request this?</strong> Please call us immediately at 
                  <a href="tel:+919561850928" style="color: #FFFFFF; font-weight: 700; text-decoration: underline;">+91 9561850928</a> 
                  or reply to this email so we can secure your account.
                </p>
              </div>

              <p style="margin: 28px 0 0 0; font-size: 14px; line-height: 1.6; color: #B0B0B0;">
                Best regards,<br>
                <strong style="color: #FFFFFF;">The Flasho Team</strong>
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 24px 32px; background-color: #0f0f0f; border-top: 1px solid #1f1f1f; text-align: center; font-size: 12px; color: #777777; line-height: 1.6;">
              Flasho • Kolhapur, Maharashtra, India<br>
              <a href="https://flasho.services" style="color: #FFD233; text-decoration: none;">flasho.services</a> • 
              <a href="mailto:hello@flasho.services" style="color: #888888; text-decoration: none;">hello@flasho.services</a> • 
              <a href="tel:+919561850928" style="color: #888888; text-decoration: none;">+91 9561850928</a>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;

  return transporter.sendMail({
    from,
    to: email,
    subject,
    html,
    attachments
  });
}

/**
 * 2. Final Deletion Confirmation Email (Clean, Modern, Real Startup Tone)
 */
export async function sendAccountDeletedEmail({ email, name, phone }) {
  const { from } = getEnvCredentials();
  const transporter = createTransporter();
  const attachments = getLogoAttachment();

  const formattedDate = new Date().toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });

  const subject = `Your Flasho account has been permanently deleted`;
  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #0d0d0d; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #E0E0E0; -webkit-font-smoothing: antialiased;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #0d0d0d; padding: 40px 16px;">
    <tr>
      <td align="center">
        <!-- Main Card -->
        <table role="presentation" width="100%" style="max-width: 540px; background-color: #141414; border: 1px solid #242424; border-radius: 16px; overflow: hidden;" cellspacing="0" cellpadding="0">
          
          <!-- Header with real logo -->
          <tr>
            <td style="padding: 32px 32px 24px 32px; text-align: left; border-bottom: 1px solid #1f1f1f;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                <tr>
                  <td>
                    <img src="cid:flashologo" alt="Flasho" style="height: 34px; width: auto; display: block; border: 0;" />
                  </td>
                  <td align="right" style="font-size: 12px; color: #FFD233; font-weight: 600; letter-spacing: 0.5px;">
                    Pass hai, fast hai.
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding: 32px;">
              <!-- Status Pill -->
              <div style="display: inline-block; background-color: rgba(34, 197, 94, 0.12); border: 1px solid rgba(34, 197, 94, 0.3); color: #22C55E; font-size: 12px; font-weight: 700; padding: 5px 12px; border-radius: 20px; margin-bottom: 16px;">
                ✓ Deletion Complete
              </div>

              <h1 style="margin: 0 0 16px 0; font-size: 20px; font-weight: 700; color: #FFFFFF; line-height: 1.3;">
                Your Flasho account has been deleted
              </h1>

              <p style="margin: 0 0 16px 0; font-size: 15px; line-height: 1.6; color: #D0D0D0;">
                Hi ${name ? name.split(' ')[0] : 'there'},
              </p>

              <p style="margin: 0 0 20px 0; font-size: 15px; line-height: 1.6; color: #B0B0B0;">
                As requested, your Flasho account linked to <strong style="color: #FFFFFF;">${phone || email}</strong> has now been permanently deleted. Your personal profile, contact details, and past booking records have been wiped from our systems.
              </p>

              <!-- Deletion Summary Card -->
              <table role="presentation" width="100%" style="background-color: #0a0a0a; border: 1px solid #222222; border-radius: 12px; padding: 16px 20px; margin-bottom: 24px;" cellspacing="0" cellpadding="0">
                <tr>
                  <td style="padding: 6px 0; font-size: 13px; color: #888888; width: 38%;">Name:</td>
                  <td style="padding: 6px 0; font-size: 13px; font-weight: 600; color: #FFFFFF;">${name || 'Flasho User'}</td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; font-size: 13px; color: #888888;">Mobile:</td>
                  <td style="padding: 6px 0; font-size: 13px; font-weight: 600; color: #FFFFFF;">${phone || 'N/A'}</td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; font-size: 13px; color: #888888;">Email:</td>
                  <td style="padding: 6px 0; font-size: 13px; font-weight: 600; color: #FFD233;">${email}</td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; font-size: 13px; color: #888888;">Status:</td>
                  <td style="padding: 6px 0; font-size: 13px; font-weight: 700; color: #22C55E;">Permanently Deleted</td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; font-size: 13px; color: #888888;">Completion Date:</td>
                  <td style="padding: 6px 0; font-size: 13px; color: #BBBBBB;">${formattedDate}</td>
                </tr>
              </table>

              <p style="margin: 0 0 20px 0; font-size: 14px; line-height: 1.6; color: #B0B0B0;">
                We're sorry to see you go! Thank you for having been part of Flasho. If you ever need doorstep services, home repairs, or maintenance in the future, you're always welcome to create a fresh account anytime.
              </p>

              <!-- Visit Website CTA -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin: 24px 0;">
                <tr>
                  <td>
                    <a href="https://flasho.services" style="display: inline-block; background-color: #FFD233; color: #0a0a0a; font-size: 14px; font-weight: 700; text-decoration: none; padding: 12px 24px; border-radius: 10px;">
                      Visit Flasho Website
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin: 28px 0 0 0; font-size: 14px; line-height: 1.6; color: #B0B0B0;">
                Best regards,<br>
                <strong style="color: #FFFFFF;">The Flasho Team</strong>
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 24px 32px; background-color: #0f0f0f; border-top: 1px solid #1f1f1f; text-align: center; font-size: 12px; color: #777777; line-height: 1.6;">
              Flasho • Kolhapur, Maharashtra, India<br>
              Questions? Contact <a href="mailto:hello@flasho.services" style="color: #FFD233; text-decoration: none;">hello@flasho.services</a> or call <a href="tel:+919561850928" style="color: #888888; text-decoration: none;">+91 9561850928</a>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;

  return transporter.sendMail({
    from,
    to: email,
    subject,
    html,
    attachments
  });
}
