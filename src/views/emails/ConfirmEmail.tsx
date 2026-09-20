import { html } from "hono/html";

interface ConfirmEmailProps {
  confirmUrl: string;
}

export function ConfirmEmail({ confirmUrl }: ConfirmEmailProps) {
  return html`
    <div style="font-family: -apple-system, BlinkMacSystemFont, sans-serif; max-width: 600px; margin: 0 auto;">
      <h1 style="color: #333;">Confirm your subscription</h1>
      <p style="color: #555; font-size: 16px; line-height: 1.6;">
        Hi there,
      </p>
      <p style="color: #555; font-size: 16px; line-height: 1.6;">
        Thanks for signing up! Please confirm your email address by clicking the link below:
      </p>
      <p style="margin: 2rem 0;">
        <a href="${confirmUrl}" style="background: #2563eb; color: white; padding: 0.75rem 1.5rem; border-radius: 4px; text-decoration: none; font-size: 16px;">
          Confirm my email
        </a>
      </p>
      <p style="color: #888; font-size: 14px;">
        If you didn't sign up, you can safely ignore this email.
      </p>
      <hr style="border: none; border-top: 1px solid #eee; margin: 2rem 0;" />
      <p style="color: #aaa; font-size: 12px;">
        If you didn't sign up, you can safely ignore this email.
      </p>
    </div>
  `;
}
