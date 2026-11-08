import { env } from '../config/env.js';

export async function sendPasswordResetEmail({ toEmail, toName, resetToken }) {
  const resetUrl = `${env.FRONTEND_URL}/reset-password?token=${resetToken}`;

  // Fallback for local development or when Brevo API key is not configured
  if (!env.BREVO_API_KEY || env.BREVO_API_KEY.includes('placeholder')) {
    console.log(`[DevEmailService] Brevo API key not set. Reset URL for ${toEmail}: ${resetUrl}`);
    return { success: true, simulated: true };
  }

  const payload = {
    sender: {
      name: env.BREVO_SENDER_NAME,
      email: env.BREVO_SENDER_EMAIL
    },
    to: [
      {
        email: toEmail,
        name: toName || 'PharmaPulse User'
      }
    ],
    subject: 'PharmaPulse — Password Reset Request',
    htmlContent: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 560px; margin: 0 auto; padding: 24px; border: 1px solid #e3e8e1; rounded: 8px;">
        <h2 style="color: #355b48; margin-bottom: 16px;">PharmaPulse Password Reset</h2>
        <p style="color: #272e29; font-size: 14px; line-height: 1.5;">Hello ${toName || 'User'},</p>
        <p style="color: #272e29; font-size: 14px; line-height: 1.5;">We received a request to reset your password. This link will expire in 1 hour.</p>
        <div style="margin: 24px 0;">
          <a href="${resetUrl}" style="background-color: #355b48; color: #ffffff; text-decoration: none; padding: 10px 20px; font-size: 14px; font-weight: 600; border-radius: 6px; display: inline-block;">
            Reset My Password
          </a>
        </div>
        <p style="color: #737d75; font-size: 12px; line-height: 1.4;">If you did not request this, please ignore this email. Your current password remains secure.</p>
      </div>
    `
  };

  const response = await fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: {
      'accept': 'application/json',
      'api-key': env.BREVO_API_KEY,
      'content-type': 'application/json'
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const errorBody = await response.text();
    console.error(`[EmailService] Brevo API error (${response.status}):`, errorBody);
    throw new Error('Failed to send transactional email via Brevo');
  }

  return { success: true };
}
