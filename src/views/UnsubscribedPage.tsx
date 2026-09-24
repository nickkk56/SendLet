import { html } from "hono/html";
import { config } from "../config";

export function UnsubscribedPage() {
  return html`
    <html lang="en">
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>You're unsubscribed — ${config.BRAND_NAME}</title>
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600;700&display=swap" rel="stylesheet">
        <style>
          :root {
            --bg-color: #f5f5f7;
            --surface-color: #ffffff;
            --text-main: #1d1d1f;
            --text-secondary: #6e6e73;
            --accent-color: #E8792F;
            --border-color: rgba(0, 0, 0, 0.08);
            --border-radius: 16px;
            --font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
          }
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body {
            font-family: var(--font-family);
            background: var(--bg-color);
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
            color: var(--text-main);
          }
          .card {
            background: var(--surface-color);
            padding: 48px 40px;
            border-radius: var(--border-radius);
            border: 1px solid var(--border-color);
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.06);
            text-align: center;
            max-width: 440px;
            width: 100%;
          }
          .icon {
            width: 64px;
            height: 64px;
            background: rgba(239, 68, 68, 0.12);
            border-radius: 50%;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            margin-bottom: 24px;
          }
          .icon::after {
            content: "✕";
            font-size: 1.5rem;
            color: #ef4444;
            font-weight: 600;
          }
          h1 {
            font-size: 1.5rem;
            font-weight: 600;
            margin-bottom: 12px;
            color: var(--text-main);
            line-height: 1.12;
          }
          p {
            font-size: 1rem;
            color: var(--text-secondary);
            line-height: 1.6;
          }
        </style>
      </head>
      <body>
        <div class="card">
          <div class="icon"></div>
          <h1>You're unsubscribed</h1>
          <p>You won't receive any more emails from us. If this was a mistake, contact us to resubscribe.</p>
        </div>
      </body>
    </html>
  `;
}
