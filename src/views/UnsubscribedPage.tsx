import { html } from "hono/html";

export function UnsubscribedPage() {
  return html`
    <html lang="en">
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>You're unsubscribed</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, sans-serif; display: flex; justify-content: center; align-items: center; min-height: 100vh; margin: 0; background: #f5f5f5; }
          .card { background: white; padding: 2rem; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); text-align: center; max-width: 400px; }
          h1 { color: #ef4444; margin-top: 0; }
        </style>
      </head>
      <body>
        <div class="card">
          <h1>You're unsubscribed</h1>
          <p>You won't receive any more emails from us. If this was a mistake, contact us to resubscribe.</p>
        </div>
      </body>
    </html>
  `;
}
