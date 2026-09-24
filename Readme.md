# Sendlet

A lightweight, self-hosted mailing list tool. Collect email subscribers via a public form and send broadcast emails with double opt-in, easy unsubscribe management, and a simple dashboard.

## Features

- **Double opt-in** — subscribers confirm via email before being active
- **Easy unsubscribe** — every broadcast includes a unique unsubscribe link
- **Subscriber dashboard** — manage subscribers, view stats, send broadcasts
- **Email provider support** — Resend or SMTP (Gmail, Mailgun, Postmark, etc.)
- **SQLite backend** — zero-dependency database, single file
- **Source tracking** — track where subscribers come from
- **Docker ready** — production Dockerfile included, migrations run automatically

## Tech Stack

- [Hono](https://hono.dev/) — web framework
- [Drizzle ORM](https://orm.drizzle.team/) — database ORM
- [better-sqlite3](https://github.com/WiseLibs/better-sqlite3) — SQLite driver
- [esbuild](https://esbuild.github.io/) — bundler
- [TypeScript](https://www.typescriptlang.org/) — type safety

## Quick Start

### Local Development

```bash
# 1. Install dependencies
npm install

# 2. Configure environment
cp .env.example .env
# Edit .env with your settings (see Environment Variables below)

# 3. Run database migrations
npm run db:migrate

# 4. Start dev server (hot-reload)
npm run dev
```

The server will start at `http://localhost:3000`.

### Production (Node.js)

```bash
npm run build
npm start
```

### Production (Docker)

```bash
# Build the image
docker build -t sendlet .

# Run the container
docker run -d \
  -p 3001:3001 \
  --env-file .env \
  -v ./data:/app/data \
  --name sendlet \
  sendlet
```

The Docker container automatically runs migrations on startup before starting the server.

> **Note:** Use `docker-compose.yml` for local development or if you want a persistent database volume with auto-restart.

### Docker Compose (Optional)

```bash
docker compose up -d
```

## Embedding the Subscribe Form

Add this form to any page on your website:

```html
<form action="https://your-sendlet-url.com/subscribe" method="POST">
  <input type="email" name="email" placeholder="Your email" required />
  <input type="hidden" name="source" value="your-site" />
  <button type="submit">Subscribe</button>
</form>
```

The `source` field is optional and helps you track where subscribers come from.

### Subscribe Flow

1. Visitor enters email and submits the form
2. Sendlet creates a subscriber record and sends a confirmation email
3. Visitor clicks the confirmation link
4. Subscriber is confirmed and will receive broadcasts

## Dashboard

Access at: `http://your-url/dashboard`

You'll be prompted for the `DASHBOARD_PASSWORD` you configured.

### Features

- **Stats cards** — Total, Confirmed, and Unsubscribed subscriber counts
- **Subscribers table** — View all subscribers with email, date, status, and source
- **Send Broadcast** — Compose and send HTML email to all confirmed subscribers

Each broadcast automatically includes a unique unsubscribe link per recipient.

## Environment Variables

| Variable | Required | Default | Description |
|---|---|---|---|
| `PORT` | No | `3000` | Server port |
| `DATABASE_PATH` | No | `./data/subscribers.db` | SQLite database file path |
| `BASE_URL` | Yes | — | Public URL of your Sendlet instance (used for confirm/unsubscribe links) |
| `EMAIL_FROM` | Yes | — | Sender email address for broadcasts |
| `EMAIL_PROVIDER` | Yes | — | Email provider: `resend` or `smtp` |
| `RESEND_API_KEY` | If resend | — | Resend API key |
| `SMTP_HOST` | If smtp | — | SMTP server hostname |
| `SMTP_PORT` | If smtp | `587` | SMTP server port |
| `SMTP_USER` | If smtp | — | SMTP username |
| `SMTP_PASS` | If smtp | — | SMTP password or app password |
| `SMTP_SECURE` | If smtp | `false` | Use SSL/TLS for SMTP |
| `DASHBOARD_PASSWORD` | Yes | — | Password for dashboard access |
| `BRAND_NAME` | No | `Sendlet` | Brand name shown in UI and emails |

## API Reference

### POST /subscribe
Subscribe an email address.

**Request (JSON):**
```json
{
  "email": "user@example.com",
  "source": "website"
}
```

**Responses:**
- `201` — `{ "message": "Check your email to confirm." }`
- `400` — Invalid email
- `409` — Email previously unsubscribed

### GET /confirm/:token
Confirm a subscription.

### GET /unsubscribe/:token
Unsubscribe using the link from a broadcast email.

### GET /dashboard
Dashboard page. Requires authentication.

**Auth:** Bearer token or query param:
- Header: `Authorization: Bearer your-password`
- Query: `?password=your-password`

### POST /dashboard/send
Send a broadcast to all confirmed subscribers.

**Request (JSON):**
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
Get all subscribers as JSON.

## Reverse Proxy

For production, put Sendlet behind a reverse proxy with SSL. Example Nginx config:

```nginx
server {
    listen 443 ssl;
    server_name newsletter.yourdomain.com;

    location / {
        proxy_pass http://localhost:3001;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

Set `BASE_URL=https://newsletter.yourdomain.com` so confirmation links in emails are correct.

## Troubleshooting

### "Environment validation failed" on startup
Check your `.env` file. At minimum, `DASHBOARD_PASSWORD`, `EMAIL_FROM`, `EMAIL_PROVIDER`, and `BASE_URL` must be set.

### Emails not being sent
- Verify `RESEND_API_KEY` or SMTP credentials are correct
- Check server console for errors
- Ensure your domain is verified (Resend) or SMTP is configured correctly

### Confirmation links don't work
- `BASE_URL` must match the actual URL users access
- If using HTTPS, `BASE_URL` must also use HTTPS

### better-sqlite3 build errors
```bash
npm rebuild better-sqlite3
```

## Project Structure

```
src/
├── index.ts              # Entry point
├── config.ts             # Environment validation
├── db/
│   ├── schema.ts         # Database schema
│   ├── client.ts         # SQLite connection
│   └── migrations/       # Drizzle migrations
├── routes/
│   ├── public.ts         # Public routes
│   └── dashboard.ts      # Protected dashboard routes
├── services/
│   ├── email.ts          # Email sending (Resend/SMTP)
│   └── tokens.ts         # Token generation
├── middleware/
│   └── auth.ts           # Dashboard authentication
└── views/                # Server-rendered HTML (Hono JSX)
    ├── Dashboard.tsx
    ├── Login.tsx
    ├── ConfirmedPage.tsx
    ├── UnsubscribedPage.tsx
    └── emails/
        ├── ConfirmEmail.tsx
        └── BroadcastEmail.tsx
```

## License

MIT
