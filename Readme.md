# Sendlet — User Guide

Sendlet is a lightweight, self-hosted mailing list tool. Use it to collect email subscribers from a public form and send broadcast emails. It features double opt-in confirmation, easy unsubscribe management, and a simple dashboard.

## Quick Start

### 1. Install dependencies
```bash
npm install
```

### 2. Configure environment
Copy the example environment file and edit it:
```bash
cp .env.example .env
```
Edit `.env` and set up your preferred settings such as:
```
DASHBOARD_PASSWORD=your-secret-password
EMAIL_FROM=noreply@yourdomain.com   # Sender address for broadcasts
BASE_URL=http://localhost:3000      # Must match your deployment URL
PORT=3000                           # Server port
DATABASE_PATH=./data/subscribers.db # SQLite file location
```

### 3. Run database migration
```bash
npm run db:migrate
```

### 4. Start the server
Development (with hot-reload):
```bash
npm run dev
```
Production:
```bash
npm run build
npm start
```

The server will start at `http://localhost:3000` (or your configured port).

## Using the Subscribe Form

### From an external website
Embed a form on your site that POSTs to your Sendlet instance:

```html
<form id="Sendlet-form" action="https://your-sendlet-url.com/subscribe" method="POST">
  <input type="email" name="email" placeholder="Your email" required />
  <input type="hidden" name="source" value="your-site" />
  <button type="submit">Subscribe</button>
</form>
```

The `source` field is optional but useful for tracking where subscribers come from.

### Subscribe flow
1. Visitor enters email and submits the form.
2. Sendlet creates a subscriber record and sends a confirmation email.
3. Visitor clicks the link in the email to confirm.
4. Subscriber is now confirmed and will receive broadcasts.

## Dashboard

Access the dashboard at: `http://your-url/dashboard`

You will be prompted to enter the `DASHBOARD_PASSWORD` you configured.

### Dashboard features

**Stats cards** — See at a glance:
- **Total**: All subscribers
- **Confirmed**: Subscribers who verified their email and haven't unsubscribed
- **Unsubscribed**: Subscribers who opted out

**Subscribers table** — View all subscribers with their email, subscription date, status (Confirmed / Unconfirmed / Unsubscribed), and source.

**Send Broadcast** — Compose and send email to all confirmed subscribers:
1. Enter a subject line
2. Enter the body (HTML is supported)
3. Click **Send**
4. The result shows how many emails were sent successfully and how many failed

Each broadcast email automatically includes a unique unsubscribe link for each recipient.

## API Reference

Sendlet exposes a simple HTTP API.

### POST /subscribe
Subscribe an email address.

**Request body (JSON):**
```json
{
  "email" : "user@example.com",
  "source": "website"
}
```

**Response:**
- `201` — `{ "message": "Check your email to confirm." }`
- `400` — `{ "error": "Invalid email address" }`
- `409` — `{ "error": "This email has unsubscribed." }` (if email previously unsubscribed)

### GET /confirm/:token
Confirm a subscription using the token from the confirmation email.

**Response:** HTML confirmation page

### GET /unsubscribe/:token
Unsubscribe using the token from an email's unsubscribe link.

**Response:** HTML unsubscribe confirmation page

### GET /dashboard
Dashboard page (requires auth).

**Authentication:** Either a Bearer token or password query parameter:
- Header: `Authorization: Bearer your-password`
- Query: `?password=your-password`

### POST /dashboard/send
Send a broadcast email to all confirmed subscribers (requires auth).

**Request body (JSON):**
```json
{
  "subject": "Your newsletter",
  "body": "<p>Hello subscribers!</p>"
}
```

**Response:**
```json
{
  "sent": 42,
  "failed": 1,
  "total": 43
}
```

### GET /dashboard/subscribers
Get all subscribers as JSON (requires auth).

**Response:** Array of subscriber objects:
```json
[
  {
    "id": 1,
    "email": "user@example.com",
    "confirmed": true,
    "confirmToken": null,
    "unsubscribeToken": "abc123...",
    "subscribedAt": "2026-01-15T10:30:00.000Z",
    "confirmedAt": "2026-01-15T10:35:00.000Z",
    "unsubscribedAt": null,
    "source": "website"
  }
]
```

## Resend Email Setup

Sendlet uses [Resend](https://resend.com) for sending emails.

1. Create a free account at https://resend.com
2. Verify your domain
3. Generate an API key under "API Keys"
4. Set `RESEND_API_KEY` in your `.env` file

**Mock mode:** If `RESEND_API_KEY` is not set, Sendlet logs emails to the console instead of sending them. This is useful for local development without an email provider.

## Production Deployment

### Docker
Create a simple Dockerfile:
```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY dist/ ./dist/
EXPOSE 3000
CMD ["node", "dist/index.js"]
```

### Reverse proxy
For production, put Sendlet behind a reverse proxy (Nginx, Caddy, etc.) with SSL:

Example Nginx config:
```nginx
server {
    listen 443 ssl;
    server_name newsletter.yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

Remember to set `BASE_URL=https://newsletter.yourdomain.com` so confirmation and unsubscribe links in emails point to the correct URL.

## Troubleshooting

### "Environment validation failed" on startup
Check your `.env` file. At minimum, `DASHBOARD_PASSWORD` must be set and non-empty.

### Emails not being sent
- Verify `RESEND_API_KEY` is set correctly
- Check the server console for error messages
- Verify your domain is verified in Resend
- Ensure `EMAIL_FROM` is a valid address on your verified domain

### Confirmation links don't work
- Ensure `BASE_URL` matches the actual URL users access your app at
- If using HTTPS, `BASE_URL` must also use HTTPS
- If behind a reverse proxy, make sure it's properly configured

### Better-sqlite3 build errors
The `better-sqlite3` package requires native compilation. If you encounter build errors:
```bash
npm rebuild better-sqlite3
```

## Project Structure

```
src/
├── index.ts              # Entry point
├── config.ts             # Environment variable validation
├── db/
│   ├── schema.ts         # Database schema (subscribers table)
│   ├── client.ts         # SQLite connection
│   └── migrations/       # Drizzle migrations
├── routes/
│   ├── public.ts         # Public routes (/subscribe, /confirm, /unsubscribe)
│   └── dashboard.ts      # Dashboard routes (protected)
├── services/
│   ├── email.ts          # Resend email integration
│   └── tokens.ts         # Cryptographic token generation
├── middleware/
│   └── auth.ts           # Dashboard authentication
└── views/                # Server-rendered HTML templates
    ├── Dashboard.tsx
    ├── Login.tsx
    ├── ConfirmedPage.tsx
    ├── UnsubscribedPage.tsx
    └── emails/
        ├── ConfirmEmail.tsx
        └── BroadcastEmail.tsx
```

## License

MIT License — see `package.json` for details.
