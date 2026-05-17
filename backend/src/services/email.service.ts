import { env } from '../config/env';
import { logger } from '../utils/logger';

const RESEND_API = 'https://api.resend.com/emails';
const FROM = env.EMAIL_FROM || 'Kinmel <onboarding@resend.dev>';

interface EmailParams {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

function isConfigured(): boolean {
  return !!env.RESEND_API_KEY;
}

async function send(params: EmailParams): Promise<{ ok: boolean; id?: string; error?: string }> {
  if (!isConfigured()) {
    logger.warn(`Email service not configured — would have sent to ${params.to}: ${params.subject}`);
    return { ok: false, error: 'not_configured' };
  }

  try {
    const res = await fetch(RESEND_API, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: FROM,
        to: [params.to],
        subject: params.subject,
        html: params.html,
        text: params.text,
      }),
    });

    if (!res.ok) {
      const body = await res.text();
      logger.error(`Resend ${res.status}: ${body}`);
      return { ok: false, error: `resend_${res.status}` };
    }

    const data = (await res.json()) as { id?: string };
    return { ok: true, id: data.id };
  } catch (e) {
    logger.error('Email send failed', e);
    return { ok: false, error: 'network' };
  }
}

const baseTemplate = (title: string, body: string, ctaUrl?: string, ctaLabel?: string) => `
<!doctype html>
<html>
<head><meta charset="utf-8"><title>${title}</title></head>
<body style="margin:0;padding:0;background:#F4F4F4;font-family:'Inter',-apple-system,BlinkMacSystemFont,sans-serif;color:#0A0A0A;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#F4F4F4;padding:40px 20px;">
    <tr><td align="center">
      <table width="520" cellpadding="0" cellspacing="0" style="background:#FFFFFF;border:1px solid rgba(10,10,10,0.1);">
        <tr><td style="padding:32px 36px;border-bottom:1px solid rgba(10,10,10,0.1);">
          <div style="font-family:'Inter',sans-serif;font-weight:900;font-size:18px;letter-spacing:-0.02em;color:#0A0A0A;">
            KINMEL<span style="color:#E63946;">®</span>
          </div>
        </td></tr>
        <tr><td style="padding:36px;">
          <p style="font-family:monospace;font-size:10px;letter-spacing:0.22em;text-transform:uppercase;color:#E63946;margin:0 0 16px;">◆ ${title}</p>
          <div style="font-size:15px;line-height:1.6;color:#0A0A0A;">${body}</div>
          ${
            ctaUrl
              ? `<div style="margin:28px 0;"><a href="${ctaUrl}" style="display:inline-block;background:#0A0A0A;color:#FFFFFF;padding:14px 28px;text-decoration:none;font-family:monospace;font-size:11px;font-weight:700;letter-spacing:0.22em;text-transform:uppercase;">${ctaLabel ?? 'Continue'} →</a></div>`
              : ''
          }
          ${
            ctaUrl
              ? `<p style="font-size:12px;color:rgba(10,10,10,0.55);word-break:break-all;margin:16px 0 0;">Or paste this link: <br><span style="font-family:monospace;font-size:11px;color:#0A0A0A;">${ctaUrl}</span></p>`
              : ''
          }
        </td></tr>
        <tr><td style="padding:20px 36px;border-top:1px solid rgba(10,10,10,0.1);">
          <p style="font-family:monospace;font-size:10px;letter-spacing:0.22em;text-transform:uppercase;color:rgba(10,10,10,0.45);margin:0;">
            Kinmel® · KTM × LA · ${new Date().getFullYear()}
          </p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>
`;

export const emailService = {
  isConfigured,

  async sendPasswordReset(to: string, resetUrl: string) {
    return send({
      to,
      subject: 'Reset your Kinmel password',
      html: baseTemplate(
        'Password Reset',
        `Someone — hopefully you — asked to reset the password for this account.<br><br>This link expires in 1 hour. If you didn't request this, ignore this email.`,
        resetUrl,
        'Reset password'
      ),
      text: `Reset your Kinmel password: ${resetUrl}\n\nLink expires in 1 hour.`,
    });
  },

  async sendEmailVerification(to: string, verifyUrl: string) {
    return send({
      to,
      subject: 'Verify your Kinmel email',
      html: baseTemplate(
        'Verify Email',
        `Welcome to Kinmel. Confirm your email to activate your account.<br><br>This link expires in 1 hour.`,
        verifyUrl,
        'Verify email'
      ),
      text: `Verify your Kinmel email: ${verifyUrl}\n\nLink expires in 1 hour.`,
    });
  },
};
