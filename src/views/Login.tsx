import { html } from "hono/html";

export function LoginPage(error?: string) {
  return html`
    <html lang="en">
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>Sendlet — Sign in</title>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, sans-serif;
            margin: 0;
            display: flex;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
            background: #f5f5f5;
            color: #333;
          }
          .login-card {
            background: white;
            padding: 2rem;
            border-radius: 8px;
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
            width: 100%;
            max-width: 360px;
          }
          h1 {
            margin: 0 0 0.5rem;
            font-size: 1.5rem;
          }
          p {
            margin: 0 0 1.5rem;
            color: #666;
            font-size: 0.9rem;
          }
          input {
            width: 100%;
            padding: 0.6rem 0.75rem;
            border: 1px solid #ddd;
            border-radius: 4px;
            font-family: inherit;
            font-size: 1rem;
            box-sizing: border-box;
          }
          input:focus {
            outline: none;
            border-color: #2563eb;
            box-shadow: 0 0 0 2px rgba(37,99,235,0.15);
          }
          button {
            width: 100%;
            background: #2563eb;
            color: white;
            border: none;
            padding: 0.6rem;
            border-radius: 4px;
            cursor: pointer;
            font-family: inherit;
            font-size: 1rem;
            margin-top: 0.75rem;
          }
          button:hover {
            background: #1d4ed8;
          }
          .error {
            background: #fef2f2;
            color: #dc2626;
            padding: 0.5rem 0.75rem;
            border-radius: 4px;
            font-size: 0.85rem;
            margin-bottom: 1rem;
          }
        </style>
      </head>
      <body>
        <div class="login-card">
          <h1>Sendlet Dashboard</h1>
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
