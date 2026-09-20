import { html } from "hono/html";

export function ConfirmedPage() {
  return html`
    <html lang="en">
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>You're confirmed!</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, sans-serif; display: flex; justify-content: center; align-items: center; min-height: 100vh; margin: 0; background: #f5f5f5; }
          .card { background: white; padding: 2rem; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); text-align: center; max-width: 400px; }
          h1 { color: #22c55e; margin-top: 0; }
        </style>
      </head>
      <body>
        <div class="card">
          <h1>✓ You're confirmed!</h1>
          <p>Welcome aboard. We'll send you updates when there's something worth knowing.</p>
        </div>
      </body>
    </html>
  `;
}
