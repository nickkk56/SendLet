import { html } from "hono/html";
import { config } from "../../config";

interface BroadcastEmailProps {
  subject: string;
  bodyHtml: string;
  unsubscribeUrl: string;
}

export function BroadcastEmail({ bodyHtml, unsubscribeUrl }: BroadcastEmailProps) {
  return html`
    <div style="font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif; max-width: 560px; margin: 0 auto; background: #ffffff; border: 1px solid rgba(0, 0, 0, 0.08); border-radius: 16px; overflow: hidden;">
      <div style="background: #f5f5f7; padding: 24px 32px; border-bottom: 1px solid rgba(0, 0, 0, 0.08);">
        <span style="font-size: 0.75rem; text-transform: uppercase; letter-spacing: 2px; color: #E8792F; font-weight: 600;">
          ${config.BRAND_NAME}
        </span>
      </div>
      <div style="padding: 32px;">
        ${bodyHtml}
      </div>
      <div style="background: #f5f5f7; padding: 20px 32px; border-top: 1px solid rgba(0, 0, 0, 0.08); text-align: center;">
        <p style="font-size: 0.8rem; color: #999999; margin: 0 0 8px;">
          You received this email because you subscribed to our updates.
        </p>
        <p style="font-size: 0.8rem; color: #999999; margin: 0;">
          <a href="${unsubscribeUrl}" style="color: #E8792F; text-decoration: none; font-weight: 500;">Unsubscribe</a> if you no longer want to hear from us.
        </p>
      </div>
    </div>
  `;
}
