# Sendlet — Development Summary

**Project:** Self-hosted mailing list tool (Sendlet)
**Last updated:** 2026-09-20
**Status:** Steps 1–6 complete. 7 code review issues fixed. Step 7 (README) remaining.

---

## Completed Steps

### Step 1: Project Init ✅
- Created `package.json` (name: sendlet, type: module, scripts: dev/build/start/db:migrate/db:generate/db:studio)
- Created `tsconfig.json` (ES2022, ESM modules, strict mode, Hono JSX config)
- Created `drizzle.config.ts` (sqlite dialect, schema path, migrations output)
- Created `.gitignore` (node_modules, dist, data/, .env, IDE files)
- Created `.env.example` (all 6 required env vars documented)
- Created `src/index.ts` (Hono app entry point with route registration)
- Created folder structure: src/db, src/routes, src/services, src/middleware, src/views/emails, data
- Installed all npm dependencies

**Verified:** Server starts and responds at http://localhost:3000

### Step 2: Drizzle Schema & SQLite ✅
- Created `src/db/schema.ts` — subscribers table with fields: id (PK autoincrement), email (unique), confirmed (boolean default false), confirmToken (nullable), unsubscribeToken (unique), subscribedAt, confirmedAt (nullable), unsubscribedAt (nullable), source (nullable)
- Created `src/db/client.ts` — better-sqlite3 connection with WAL mode, exports `db` and `schema`
- Generated migration via `npm run db:generate`
- Applied migration via `npm run db:migrate`

### Step 3: Service Layer ✅
- Created `src/config.ts` — Zod validation of all env vars at startup; exits with clear error if invalid
- Created `src/services/tokens.ts` — `generateToken()` using node:crypto randomBytes, returns 64-char hex string
- Created `src/services/email.ts` — Resend wrapper with console-log mock fallback when RESEND_API_KEY not set

### Step 4: Public Routes ✅
- Created `src/routes/public.ts`:
  - `POST /subscribe` — validates email, generates tokens, upserts subscriber, sends confirmation email in background
  - `GET /confirm/:token` — finds subscriber by confirmToken, marks confirmed, clears token, renders ConfirmedPage
  - `GET /unsubscribe/:token` — finds subscriber by unsubscribeToken, marks unsubscribed, renders UnsubscribedPage
- Created `src/views/ConfirmedPage.tsx` — styled "You're confirmed!" page
- Created `src/views/UnsubscribedPage.tsx` — styled "You're unsubscribed" page

### Step 5: Auth Middleware & Dashboard Routes ✅
- Created `src/middleware/auth.ts` — `dashboardAuth` middleware checking Bearer token or ?password query param against DASHBOARD_PASSWORD
- Created `src/routes/dashboard.ts`:
  - `GET /dashboard` — renders dashboard with stats (total, confirmed, unsubscribed) and subscriber table
  - `POST /dashboard/send` — validates subject+body, sends broadcast to all confirmed non-unsubscribed subscribers, returns {sent, failed, total}
  - `GET /dashboard/subscribers` — returns JSON list of subscribers

### Step 6: Dashboard Views & Email Templates ✅
- Created `src/views/Dashboard.tsx` — full dashboard with stats cards, subscriber table, broadcast form with inline JS
- Created `src/views/emails/ConfirmEmail.tsx` — styled confirmation email template
- Created `src/views/emails/BroadcastEmail.tsx` — broadcast template with auto unsubscribe footer

---

## Remaining Steps

### Step 7: README ⏳
Needs to cover:
- Project description
- Install instructions
- Environment setup (.env configuration)
- Run instructions (dev and production)
- API documentation
- Deployment notes

---

## Known Issues / TODOs

See `.claude/issues.md` for a detailed list. **7 of 13 issues have been fixed.**

### Fixed (2026-09-20)
- ✅ Dashboard broadcast form now sends auth header
- ✅ HTML login page for browser users (was JSON 401)
- ✅ Email template serialization made robust
- ✅ Error handling added to all DB operations
- ✅ Removed fake "48 hour expiration" claim from email
- ✅ EMAIL_FROM validation accepts "Name <email>" format
- ✅ Login form uses POST (password no longer in URL)

### Remaining
- No rate limiting on subscribe endpoint (Minor)
- No input length validation on `source` field (Minor)
- Generic broadcast error message in UI (Minor)
- No test suite
- `public/` directory missing (optional widget)
- `README.md` missing (Step 7)

---

## Verification Status
| Check | Status |
|-------|--------|
| Server starts and responds | ✅ Verified |
| Migration applied successfully | ✅ Verified |
| TypeScript compilation (`tsc --noEmit`) | ✅ No errors |
| Subscribe endpoint (POST /subscribe) | ✅ Returns 201, persists to SQLite |
| Database writes | ✅ Subscriber row confirmed in `data/subscribers.db` |
| Dashboard route (/dashboard) | ✅ Reachable, redirects to login page (auth working) |
| End-to-end subscribe→confirm→unsubscribe flow | ⏳ Not tested |
| Dashboard auth and broadcast | ✅ Login page works, broadcast sends auth header |
| better-sqlite3 native module | ✅ Rebuilt for current Node.js, working |

---

## File Inventory

### Source Files (15)
```
src/index.ts                  # Entry point, route registration
src/config.ts                 # Zod env validation
src/db/schema.ts              # Drizzle schema (subscribers table)
src/db/client.ts              # SQLite connection
src/routes/public.ts          # POST /subscribe, GET /confirm/:token, GET /unsubscribe/:token
src/routes/dashboard.ts       # GET /dashboard, POST /dashboard/send, GET /dashboard/subscribers
src/services/tokens.ts        # generateToken()
src/services/email.ts         # sendConfirmationEmail(), sendBroadcastEmail()
src/middleware/auth.ts        # dashboardAuth middleware
src/views/Dashboard.tsx       # Dashboard page
src/views/Login.tsx           # Dashboard login page
src/views/ConfirmedPage.tsx   # Confirmation success page
src/views/UnsubscribedPage.tsx # Unsubscribe success page
src/views/emails/ConfirmEmail.tsx    # Confirmation email template
src/views/emails/BroadcastEmail.tsx  # Broadcast email template
```

### Config Files (6)
```
package.json
tsconfig.json
drizzle.config.ts
.gitignore
.env.example
.env                          # Local environment (gitignored)
```

### Migrations
```
src/db/migrations/0000_sparkling_jamie_braddock.sql
src/db/migrations/meta/0000_snapshot.json
src/db/migrations/meta/_journal.json
```

### Missing vs Brief
- `src/views/ComposeEmail.tsx` — Brief listed this as separate; broadcast form is inline in Dashboard.tsx instead (acceptable)
- `public/subscribe-widget.js` — Optional per brief, not created
- `README.md` — Required, not created (Step 7)

---

## Environment Variables Required
| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| RESEND_API_KEY | No | — | Resend API key (mock mode if missing) |
| EMAIL_FROM | No | Sendlet <noreply@sendlet.app> | Sender address |
| BASE_URL | No | http://localhost:3000 | Base URL for links in emails |
| DASHBOARD_PASSWORD | **Yes** | — | Password for dashboard access |
| DATABASE_PATH | No | ./data/subscribers.db | SQLite file path |
| PORT | No | 3000 | Server port |
