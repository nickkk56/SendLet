import { html } from "hono/html";
import { config } from "../config";

export function LoginPage(error?: string) {
  return html`
    <html lang="en">
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>Dashboard — ${config.BRAND_NAME}</title>
        <link rel="preconnect" href="https://fonts.googleapis.com">
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600;700&display=swap" rel="stylesheet">
        <style>
          :root {
            --bg-color: #f5f5f7;
            --surface-color: #ffffff;
            --text-main: #1d1d1f;
            --text-secondary: #6e6e73;
            --accent-color: #E8792F;
            --accent-hover: #d26a24;
            --border-color: rgba(0, 0, 0, 0.08);
            --border-radius: 16px;
            --font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
          }
          body {
            font-family: var(--font-family);
            background: var(--bg-color);
            color: var(--text-main);
            margin: 0;
            display: flex;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
            -webkit-font-smoothing: antialiased;
          }
          .login-card {
            background: var(--surface-color);
            padding: 40px;
            border-radius: var(--border-radius);
            border: 1px solid var(--border-color);
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.06);
            width: 100%;
            max-width: 380px;
            margin: 0 24px;
          }
          .subtitle {
            font-size: 0.75rem;
            text-transform: uppercase;
            letter-spacing: 2px;
            color: var(--accent-color);
            font-weight: 600;
            display: block;
            margin-bottom: 8px;
          }
          h1 {
            margin: 0 0 8px;
            font-size: 1.5rem;
            font-weight: 600;
            line-height: 1.12;
            letter-spacing: -0.02em;
          }
          p {
            margin: 0 0 24px;
            color: var(--text-secondary);
            font-size: 0.9rem;
            line-height: 1.6;
          }
          input {
            width: 100%;
            padding: 12px 16px;
            border: 1px solid var(--border-color);
            border-radius: 8px;
            font-family: inherit;
            font-size: 0.95rem;
            box-sizing: border-box;
            background: var(--bg-color);
            color: var(--text-main);
            transition: border-color 0.2s ease;
          }
          input:focus {
            outline: none;
            border-color: var(--accent-color);
            box-shadow: 0 0 0 3px rgba(232, 121, 47, 0.12);
          }
          button {
            width: 100%;
            background: var(--accent-color);
            color: white;
            border: none;
            padding: 14px 30px;
            border-radius: 980px;
            cursor: pointer;
            font-family: inherit;
            font-size: 0.95rem;
            font-weight: 600;
            letter-spacing: 0.01em;
            margin-top: 16px;
            transition: background 0.2s ease, transform 0.2s ease;
          }
          button:hover {
            background: var(--accent-hover);
            transform: scale(1.02);
          }
          .error {
            background: rgba(239, 68, 68, 0.08);
            color: #dc2626;
            padding: 10px 14px;
            border-radius: 8px;
            font-size: 0.85rem;
            margin-bottom: 16px;
          }
        </style>
      </head>
      <body>
        <div class="login-card">
          <span class="subtitle">Dashboard</span>
          <h1>Welcome back</h1>
          <p>Enter your password to continue.</p>
          ${error ? html`<div class="error">${error}</div>` : ""}
          <form method="post" action="/dashboard/login">
            <input type="password" name="password" placeholder="Password" required autofocus />
            <button type="submit">Sign in</button>
          </form>
        </div>
      </body>
    </html>
  `;
}
