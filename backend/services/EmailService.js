const nodemailer = require('nodemailer');
const path = require('path');
require('dotenv').config();
require('dotenv').config({ path: path.resolve(__dirname, '../../Flasho_Portfolio/frontend/.env') });

class EmailService {
  constructor() {
    this.transporter = null;
    this.initTransporter();
  }

  initTransporter() {
    const host = process.env.SMTP_HOST || process.env.EMAIL_HOST || process.env.VITE_SMTP_HOST || process.env.VITE_EMAIL_HOST;
    const user = process.env.SMTP_USER || process.env.EMAIL_USER || process.env.VITE_SMTP_USER || process.env.VITE_EMAIL_USER;
    const pass = process.env.SMTP_PASS || process.env.EMAIL_PASS || process.env.VITE_SMTP_PASS || process.env.VITE_EMAIL_PASS;
    const port = parseInt(process.env.SMTP_PORT || process.env.EMAIL_PORT || process.env.VITE_SMTP_PORT || process.env.VITE_EMAIL_PORT || '587', 10);
    const secure = process.env.SMTP_SECURE === 'true' || process.env.VITE_SMTP_SECURE === 'true' || port === 465;

    if (user && pass) {
      const config = host
        ? {
            host,
            port,
            secure,
            auth: { user, pass },
            tls: { rejectUnauthorized: false }
          }
        : {
            service: 'gmail',
            auth: { user, pass }
          };

      this.transporter = nodemailer.createTransport(config);

      // Verify connection configuration
      this.transporter.verify((error) => {
        if (error) {
          console.warn('⚠️ Nodemailer verify warning (check SMTP credentials):', error.message);
        } else {
          console.log('✅ Nodemailer: Successfully connected to mail server. Ready to dispatch emails.');
        }
      });
      console.log('📧 EmailService: Transporter configured for user:', user);
    } else {
      console.warn('⚠️ EmailService: SMTP credentials not set. Operating in email simulation mode.');
    }
  }

  getSender() {
    return process.env.EMAIL_FROM || process.env.SMTP_FROM || process.env.VITE_EMAIL_FROM || '"Flasho Support" <hello@flasho.services>';
  }

  async sendMail({ to, subject, html, text }) {
    if (!to) {
      console.warn('⚠️ EmailService: Recipient email is missing. Skipped sending.');
      return { success: false, reason: 'Recipient email missing' };
    }

    const mailOptions = {
      from: this.getSender(),
      to,
      subject,
      text: text || html.replace(/<[^>]+>/g, ''),
      html
    };

    if (this.transporter) {
      try {
        const info = await this.transporter.sendMail(mailOptions);
        console.log(`✅ [Nodemailer] Email successfully sent to ${to} (MessageId: ${info.messageId})`);
        return { success: true, messageId: info.messageId };
      } catch (error) {
        console.error(`🔴 [Nodemailer] Email delivery failed to ${to}:`, error.message);
        return { success: false, error: error.message };
      }
    } else {
      console.log('----------------------------------------------------');
      console.log(`📬 [MOCK EMAIL DISPATCHED VIA NODEMAILER SIMULATION]`);
      console.log(`To: ${to}`);
      console.log(`Subject: ${subject}`);
      console.log(`From: ${mailOptions.from}`);
      console.log('----------------------------------------------------');
      return { success: true, simulated: true };
    }
  }

  /**
   * 1. Acknowledgment email sent immediately upon form submission
   */
  async sendDeletionRequestReceived({ email, name, phone, requestId }) {
    const subject = `⚡ Flasho - Account Deletion Request Received`;
    const html = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${subject}</title>
      </head>
      <body style="margin:0; padding:0; background-color:#080808; font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color:#E4E4E7;">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color:#080808; padding:32px 16px;">
          <tr>
            <td align="center">
              <table role="presentation" width="100%" style="max-width:580px; background-color:#111111; border:1px solid #27272A; border-radius:24px; overflow:hidden; box-shadow:0 20px 40px rgba(0,0,0,0.6);" cellspacing="0" cellpadding="0">
                
                <!-- Brand Header -->
                <tr>
                  <td style="background:#0D0D0D; padding:36px 32px; text-align:center; border-bottom:1px solid #1F1F23;">
                    <table role="presentation" align="center" cellspacing="0" cellpadding="0">
                      <tr>
                        <td style="background:#FFD233; color:#0A0A0A; font-weight:900; font-size:22px; width:44px; height:44px; line-height:44px; text-align:center; border-radius:12px; box-shadow:0 4px 14px rgba(255,210,51,0.35);">
                          ⚡
                        </td>
                        <td style="padding-left:12px; text-align:left;">
                          <div style="font-size:24px; font-weight:900; color:#FFFFFF; letter-spacing:-0.5px; font-style:italic;">
                            Flasho<span style="color:#FFD233;">.</span>
                          </div>
                          <div style="font-size:11px; color:#A1A1AA; font-weight:600; text-transform:uppercase; letter-spacing:1px; margin-top:2px;">
                            Pass hai, fast hai.
                          </div>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <!-- Content Body -->
                <tr>
                  <td style="padding:36px 32px;">
                    <!-- Badge -->
                    <div style="display:inline-block; background:rgba(255,210,51,0.12); border:1px solid rgba(255,210,51,0.3); color:#FFD233; font-size:12px; font-weight:700; padding:6px 14px; border-radius:20px; margin-bottom:18px;">
                      ⏳ Request Registered • 24-Hour Review Window
                    </div>

                    <h2 style="margin:0 0 14px; font-size:22px; font-weight:800; color:#FFFFFF; letter-spacing:-0.4px;">
                      Account Deletion Request Received
                    </h2>

                    <p style="margin:0 0 18px; font-size:14px; line-height:1.6; color:#D4D4D8;">
                      Hello <strong>${name || 'Valued User'}</strong>,
                    </p>

                    <p style="margin:0 0 22px; font-size:14px; line-height:1.6; color:#A1A1AA;">
                      We have received a formal request to permanently delete your Flasho account and associated data.
                    </p>

                    <!-- Important Highlight Box -->
                    <div style="background:rgba(255,210,51,0.06); border-left:4px solid #FFD233; padding:16px 18px; border-radius:10px; margin-bottom:24px;">
                      <p style="margin:0; font-size:13px; line-height:1.6; color:#F4F4F5;">
                        <strong style="color:#FFD233;">Please Note:</strong> If your account is registered with Flasho, our administrative team will verify and permanently delete your account within the next <strong style="color:#FFFFFF;">24 hours</strong>. Once deleted, you will receive an official deletion confirmation email.
                      </p>
                    </div>

                    <!-- Details Card -->
                    <table role="presentation" width="100%" style="background-color:#0A0A0A; border:1px solid #1F1F23; border-radius:14px; padding:16px 20px; margin-bottom:24px;" cellspacing="0" cellpadding="0">
                      <tr>
                        <td style="padding:6px 0; font-size:13px; color:#71717A; width:40%;">Full Name:</td>
                        <td style="padding:6px 0; font-size:13px; font-weight:600; color:#FFFFFF;">${name}</td>
                      </tr>
                      <tr>
                        <td style="padding:6px 0; font-size:13px; color:#71717A; border-top:1px dashed #27272A;">Registered Phone:</td>
                        <td style="padding:6px 0; font-size:13px; font-weight:600; color:#FFFFFF; border-top:1px dashed #27272A; font-family:monospace;">${phone}</td>
                      </tr>
                      <tr>
                        <td style="padding:6px 0; font-size:13px; color:#71717A; border-top:1px dashed #27272A;">Notification Email:</td>
                        <td style="padding:6px 0; font-size:13px; font-weight:600; color:#FFD233; border-top:1px dashed #27272A; font-family:monospace;">${email}</td>
                      </tr>
                      ${requestId ? `
                      <tr>
                        <td style="padding:6px 0; font-size:13px; color:#71717A; border-top:1px dashed #27272A;">Request Reference:</td>
                        <td style="padding:6px 0; font-size:12px; font-weight:600; color:#A1A1AA; border-top:1px dashed #27272A; font-family:monospace;">${requestId}</td>
                      </tr>
                      ` : ''}
                      <tr>
                        <td style="padding:6px 0; font-size:13px; color:#71717A; border-top:1px dashed #27272A;">Expected Resolution:</td>
                        <td style="padding:6px 0; font-size:13px; font-weight:700; color:#22C55E; border-top:1px dashed #27272A;">Within 24 Hours</td>
                      </tr>
                    </table>

                    <p style="margin:0 0 10px; font-size:13px; font-weight:700; color:#FFFFFF;">What happens next?</p>
                    <ul style="margin:0 0 24px; padding-left:18px; font-size:13px; line-height:1.6; color:#A1A1AA;">
                      <li style="margin-bottom:6px;">Our compliance administrator reviews active bookings, wallet credits, or pending orders.</li>
                      <li style="margin-bottom:6px;">If your registered account exists, all personal profiles, saved addresses, and authentication tokens will be permanently wiped.</li>
                      <li>You will receive a final confirmation receipt right here at <strong>${email}</strong>.</li>
                    </ul>

                    <!-- Security Alert -->
                    <div style="background:rgba(239,68,68,0.1); border:1px solid rgba(239,68,68,0.25); border-radius:12px; padding:14px 18px; margin-bottom:28px;">
                      <div style="font-size:12px; font-weight:700; color:#F87171; margin-bottom:4px;">Did not request this?</div>
                      <div style="font-size:12px; line-height:1.5; color:#FCA5A5;">
                        If you did not initiate this request, contact our security desk immediately via phone/WhatsApp at 
                        <a href="https://wa.me/919561850928" style="color:#FFFFFF; font-weight:700; text-decoration:underline;">+91 9561850928</a> 
                        or email <a href="mailto:hello@flasho.services" style="color:#FFFFFF; font-weight:700; text-decoration:underline;">hello@flasho.services</a>.
                      </div>
                    </div>

                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                      <tr>
                        <td align="center">
                          <a href="https://wa.me/919561850928?text=Hello%20Flasho%20Support,%20regarding%20my%20account%20deletion%20request" style="display:inline-block; background:#FFD233; color:#0A0A0A; font-size:13px; font-weight:800; text-decoration:none; padding:12px 24px; border-radius:10px; box-shadow:0 4px 12px rgba(255,210,51,0.2);">
                            💬 Chat with Flasho Support on WhatsApp
                          </a>
                        </td>
                      </tr>
                    </table>

                    <p style="margin:28px 0 0; font-size:13px; color:#71717A;">
                      Warm regards,<br>
                      <strong style="color:#FFFFFF;">Team Flasho</strong>
                    </p>
                  </td>
                </tr>

                <!-- Footer -->
                <tr>
                  <td style="background:#0D0D0D; padding:24px 32px; text-align:center; border-top:1px solid #1F1F23; font-size:12px; color:#71717A; line-height:1.6;">
                    © 2026 Flasho Technologies. All rights reserved.<br>
                    Kolhapur, Maharashtra, India • <a href="https://flasho.services" style="color:#FFD233; text-decoration:none;">flasho.services</a><br>
                    Support: <a href="tel:+919561850928" style="color:#A1A1AA; text-decoration:none;">+91 9561850928</a> | <a href="mailto:hello@flasho.services" style="color:#A1A1AA; text-decoration:none;">hello@flasho.services</a>
                  </td>
                </tr>

              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `;

    return this.sendMail({ to: email, subject, html });
  }

  /**
   * 2. Final confirmation email dispatched when admin accepts and deletes the account
   */
  async sendAccountDeletedConfirmation({ email, name, phone }) {
    const subject = `✅ Flasho - Your Account Has Been Permanently Deleted`;
    const html = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${subject}</title>
      </head>
      <body style="margin:0; padding:0; background-color:#080808; font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color:#E4E4E7;">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color:#080808; padding:32px 16px;">
          <tr>
            <td align="center">
              <table role="presentation" width="100%" style="max-width:580px; background-color:#111111; border:1px solid #27272A; border-radius:24px; overflow:hidden; box-shadow:0 20px 40px rgba(0,0,0,0.6);" cellspacing="0" cellpadding="0">
                
                <!-- Brand Header -->
                <tr>
                  <td style="background:#0D0D0D; padding:36px 32px; text-align:center; border-bottom:1px solid #1F1F23;">
                    <table role="presentation" align="center" cellspacing="0" cellpadding="0">
                      <tr>
                        <td style="background:#FFD233; color:#0A0A0A; font-weight:900; font-size:22px; width:44px; height:44px; line-height:44px; text-align:center; border-radius:12px; box-shadow:0 4px 14px rgba(255,210,51,0.35);">
                          ⚡
                        </td>
                        <td style="padding-left:12px; text-align:left;">
                          <div style="font-size:24px; font-weight:900; color:#FFFFFF; letter-spacing:-0.5px; font-style:italic;">
                            Flasho<span style="color:#FFD233;">.</span>
                          </div>
                          <div style="font-size:11px; color:#A1A1AA; font-weight:600; text-transform:uppercase; letter-spacing:1px; margin-top:2px;">
                            Pass hai, fast hai.
                          </div>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <!-- Content Body -->
                <tr>
                  <td style="padding:36px 32px;">
                    <!-- Badge -->
                    <div style="display:inline-block; background:rgba(34,197,94,0.12); border:1px solid rgba(34,197,94,0.3); color:#22C55E; font-size:12px; font-weight:700; padding:6px 14px; border-radius:20px; margin-bottom:18px;">
                      ✓ Deletion Completed
                    </div>

                    <h2 style="margin:0 0 14px; font-size:22px; font-weight:800; color:#FFFFFF; letter-spacing:-0.4px;">
                      Your Account Has Been Permanently Deleted
                    </h2>

                    <p style="margin:0 0 18px; font-size:14px; line-height:1.6; color:#D4D4D8;">
                      Hello <strong>${name || 'User'}</strong>,
                    </p>

                    <p style="margin:0 0 22px; font-size:14px; line-height:1.6; color:#A1A1AA;">
                      This email confirms that your Flasho account linked to <strong style="color:#FFFFFF;">${phone || email}</strong> and all associated personal data have been <strong>permanently purged</strong> from our platform by our administrative team.
                    </p>

                    <!-- Summary Card -->
                    <div style="background-color:#0A0A0A; border:1px solid #1F1F23; border-radius:14px; padding:20px; margin-bottom:24px;">
                      <h4 style="margin:0 0 12px; font-size:13px; font-weight:700; color:#FFD233; text-transform:uppercase; letter-spacing:0.5px;">
                        Data Removal Confirmation Summary:
                      </h4>
                      <ul style="margin:0; padding-left:18px; font-size:13px; line-height:1.6; color:#D4D4D8;">
                        <li style="margin-bottom:6px;">Personal identity credentials, phone number, and email wiped.</li>
                        <li style="margin-bottom:6px;">Saved delivery addresses and GPS telemetry records removed.</li>
                        <li style="margin-bottom:6px;">Active sessions, OTP devices, and authentication tokens revoked.</li>
                        <li>Past service records and profile data permanently disassociated.</li>
                      </ul>
                    </div>

                    <p style="margin:0 0 24px; font-size:13px; line-height:1.6; color:#A1A1AA;">
                      We are sad to see you go! Thank you for having been part of the Flasho journey. If you ever require rapid doorstep maintenance, cleaning, or electrical services again, you are always welcome to sign up with a new account anytime.
                    </p>

                    <!-- CTA Button -->
                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-bottom:28px;">
                      <tr>
                        <td align="center">
                          <a href="https://flasho.services" style="display:inline-block; background:#FFD233; color:#0A0A0A; font-size:13px; font-weight:800; text-decoration:none; padding:12px 28px; border-radius:10px; box-shadow:0 4px 14px rgba(255,210,51,0.25);">
                            Visit Flasho Website
                          </a>
                        </td>
                      </tr>
                    </table>

                    <p style="margin:0; font-size:13px; color:#71717A;">
                      Warm regards,<br>
                      <strong style="color:#FFFFFF;">The Flasho Team</strong>
                    </p>
                  </td>
                </tr>

                <!-- Footer -->
                <tr>
                  <td style="background:#0D0D0D; padding:24px 32px; text-align:center; border-top:1px solid #1F1F23; font-size:12px; color:#71717A; line-height:1.6;">
                    © 2026 Flasho Technologies • Kolhapur, Maharashtra, India<br>
                    Need assistance? Call/WhatsApp: <a href="https://wa.me/919561850928" style="color:#FFD233; text-decoration:none;">+91 9561850928</a> | <a href="mailto:hello@flasho.services" style="color:#A1A1AA; text-decoration:none;">hello@flasho.services</a>
                  </td>
                </tr>

              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `;

    return this.sendMail({ to: email, subject, html });
  }
}

module.exports = new EmailService();
