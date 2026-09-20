# Sendlet — Self-Hosted Mailing List Tool

## Context and Goal

We're building a lightweight, self-hosted tool for collecting email subscribers and sending broadcast emails. The main goal: quickly set up a waitlist on a website to validate demand for an upcoming product (software/toolkit) before its release. The project will eventually be published as open source on GitHub, so the code should be clean, understandable, and easy for others to deploy.

**Priority: shipping a working MVP fast, not feature completeness.** Do not add anything not explicitly described in this document without discussing it first.

## Functional Requirements

1. **Subscribe form** — a public endpoint accepts an email, creates a record in the database with an "unconfirmed" status, and generates a unique confirmation token.
2. **Double opt-in verification** — immediately after subscribing, a confirmation email is sent automatically in the background (without blocking the response to the user) with a confirmation link. Clicking the link marks the subscriber as confirmed.
3. **Unsubscribe** — every broadcast email contains a unique unsubscribe link that marks the subscriber as unsubscribed (the record is not deleted — the unsubscribe date is recorded instead).
4. **Dashboard** — a password/token-protected page showing:
   - total subscriber count, confirmed count, unsubscribed count;
   - a table of subscribers (email, subscription date, status, source).
5. **Broadcast email** — a form in the dashboard (subject + body) that, on submit, sends the email to every confirmed, non-unsubscribed subscriber via the email provider.

## Tech Stack

- **Runtime**: Node.js + TypeScript
- **Web framework**: Hono
- **UI rendering**: Hono JSX (server-side rendering, no separate frontend/SPA project)
- **Database**: SQLite
- **ORM**: Drizzle ORM (+ drizzle-kit for migrations)
- **Validation**: Zod (form input and env variables)
- **Email provider**: Resend (via the official JS/TS SDK)
- **Package manager**: npm (or pnpm if preferred — flexible at init time)

## Architectural Principles

- Separate **public** routes (`/subscribe`, `/confirm/:token`, `/unsubscribe/:token`) from **private** dashboard routes (`/dashboard/*`, protected by an auth middleware). Private routes must never be reachable without passing through the auth middleware.
- All email sending goes through a service layer (`services/email.ts`) — routes must not call the Resend SDK directly.
- All environment variables (Resend API key, dashboard auth secret, database path, base URL used for links in emails) are validated via Zod at startup — if something is missing, the app should fail immediately with a clear error, not at runtime on the first request.
- Confirmation and unsubscribe tokens are cryptographically random strings (not sequential IDs), so they can't be guessed or enumerated.
- No ORM-agnostic abstractions "for the future" — write directly against Drizzle + SQLite, don't over-engineer for a hypothetical Postgres migration.
- The dashboard is server-rendered (SSR via Hono JSX), no client-side framework. Minimal vanilla JS is acceptable only for the subscribe form, if it's embedded on an external site as a widget.

## File Structure

```
mailing-list/
├── src/
│   ├── index.ts                 # entry point, Hono app init, route registration
│   ├── config.ts                # env variable loading and Zod validation
│   ├── db/
│   │   ├── schema.ts             # Drizzle schema: subscribers table
│   │   ├── client.ts             # SQLite connection via Drizzle
│   │   └── migrations/           # auto-generated Drizzle migrations
│   │
│   ├── routes/
│   │   ├── public.ts             # POST /subscribe, GET /confirm/:token, GET /unsubscribe/:token
│   │   └── dashboard.ts          # GET /dashboard, POST /dashboard/send, GET /dashboard/subscribers
│   │
│   ├── services/
│   │   ├── email.ts              # sendConfirmationEmail(), sendBroadcastEmail() — Resend wrapper
│   │   └── tokens.ts             # generateToken() — crypto-random tokens for confirm/unsubscribe
│   │
│   ├── middleware/
│   │   └── auth.ts               # password/token check for /dashboard/* access
│   │
│   └── views/                    # JSX components
│       ├── Dashboard.tsx          # subscriber list + counters
│       ├── ComposeEmail.tsx       # broadcast form (subject + body)
│       ├── ConfirmedPage.tsx      # "you're subscribed" page after confirmation
│       ├── UnsubscribedPage.tsx   # "you're unsubscribed" page
│       └── emails/
│           ├── ConfirmEmail.tsx   # confirmation email template
│           └── BroadcastEmail.tsx # broadcast email template (auto-includes unsubscribe link)
│
├── public/
│   └── subscribe-widget.js       # optional: subscribe form script to embed on an external site
├── data/
│   └── subscribers.db            # SQLite file (add to .gitignore)
├── .env
├── .env.example                  # template with no real values — required for the open source repo
├── drizzle.config.ts
├── package.json
├── tsconfig.json
├── .gitignore
└── README.md                     # install/run instructions for other users
```

## Data Schema (reference for `db/schema.ts`)

`subscribers` table:
- `id` — primary key
- `email` — unique, required
- `confirmed` — boolean, defaults to false
- `confirmToken` — string, used for confirmation, cleared after confirmation
- `unsubscribeToken` — string, unique per subscriber, permanent (used in every email)
- `subscribedAt` — timestamp
- `confirmedAt` — timestamp, nullable
- `unsubscribedAt` — timestamp, nullable
- `source` — string, where the subscription came from (for analytics, can be a free-form field for now)

## Environment Variables (reference for `.env.example`)

- `RESEND_API_KEY` — Resend API key
- `EMAIL_FROM` — sender address for broadcasts
- `BASE_URL` — base URL of the service (used to build confirm/unsubscribe links in emails)
- `DASHBOARD_PASSWORD` — password for dashboard access
- `DATABASE_PATH` — path to the SQLite file
- `PORT` — port the server listens on

## Out of Scope for MVP (intentionally deferred)

- Subscriber segmentation, tags, custom fields.
- Open/click tracking analytics for emails.
- Queues/retries for broadcasts (synchronous sending via Resend is enough at MVP volume).
- Multi-user dashboard access (a single owner password is sufficient for now).
- CSV import/export (can be added later if needed).

## Order of Work

Please work step by step and don't jump ahead:
1. Project init (package.json, tsconfig, dependencies, folder structure).
2. Drizzle schema and SQLite connection, first migration.
3. Service layer: `tokens.ts`, then `email.ts` (with real Resend integration, but a console-log mock is fine if the API key isn't set up yet).
4. Public routes: `/subscribe`, `/confirm/:token`, `/unsubscribe/:token`.
5. Auth middleware and protected dashboard routes.
6. Dashboard JSX views: subscriber list, broadcast form.
7. README with install/deploy instructions for other users.

After each step, give a short summary of what was done and what should be manually checked before moving to the next step.
