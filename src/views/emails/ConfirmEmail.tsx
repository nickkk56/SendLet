import { html } from "hono/html";
import { config } from "../../config";

interface ConfirmEmailProps {
  confirmUrl: string;
}

export function ConfirmEmail({ confirmUrl }: ConfirmEmailProps) {
  return html`
    <div style="font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif; max-width: 560px; margin: 0 auto; background: #ffffff; border: 1px solid rgba(0, 0, 0, 0.08); border-radius: 16px; overflow: hidden;">
      <div style="background: #f5f5f7; padding: 24px 32px; border-bottom: 1px solid rgba(0, 0, 0, 0.08);">
        <span style="font-size: 0.75rem; text-transform: uppercase; letter-spacing: 2px; color: #E8792F; font-weight: 600;">
          ${config.BRAND_NAME}
        </span>
      </div>
      <div style="padding: 32px;">
        <h1 style="font-size: 1.5rem; font-weight: 600; color: #1d1d1f; margin: 0 0 16px; line-height: 1.12;">
          Confirm your subscription
        </h1>
        <p style="font-size: 1rem; color: #6e6e73; line-height: 1.6; margin: 0 0 24px;">
          Thanks for signing up! Please confirm your email address by clicking the link below:
        </p>
        <p style="margin: 2rem 0; text-align: center;">
          <a href="${confirmUrl}" style="display: inline-block; background: #E8792F; color: #ffffff; padding: 14px 30px; border-radius: 980px; text-decoration: none; font-weight: 600; font-size: 0.95rem; letter-spacing: 0.01em;">
            Confirm my email
          </a>
        </p>
        <p style="font-size: 0.85rem; color: #999999; margin: 0;">
          If you didn't sign up, you can safely ignore this email.
        </p>
      </div>
      <div style="background: #f5f5f7; padding: 16px 32px; border-top: 1px solid rgba(0, 0, 0, 0.08); text-align: center;">
        <p style="font-size: 0.75rem; color: #999999; margin: 0;">
          &copy; 2026 ${config.BRAND_NAME}. All rights reserved.
        </p>
      </div>
    </div>
  `;
}
