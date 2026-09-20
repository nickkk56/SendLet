import { html } from "hono/html";

interface BroadcastEmailProps {
  subject: string;
  bodyHtml: string;
  unsubscribeUrl: string;
}

export function BroadcastEmail({ bodyHtml, unsubscribeUrl }: BroadcastEmailProps) {
  return html`
    <div style="font-family: -apple-system, BlinkMacSystemFont, sans-serif; max-width: 600px; margin: 0 auto;">
      ${bodyHtml}
      <hr style="border: none; border-top: 1px solid #ddd; margin: 2rem 0;" />
      <p style="font-size: 12px; color: #888; text-align: center;">
        You received this email because you subscribed to our updates.
      </p>
      <p style="font-size: 12px; text-align: center;">
        <a href="${unsubscribeUrl}" style="color: #666; text-decoration: underline;">Unsubscribe</a> if you no longer want to hear from us.
      </p>
    </div>
  `;
}
