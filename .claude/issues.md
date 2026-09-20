# Sendlet — Code Issues

**Date:** 2026-09-20
**Updated:** 2026-09-20
**Found during:** Post-implementation code review

---

## Fixed Issues

### ✅ 1. Dashboard broadcast form fails with 401 (auth header missing)
**Fixed:** Dashboard route now passes auth token to the view; broadcast form includes `Authorization: Bearer <token>` header in fetch requests.

### ✅ 2. Auth middleware returns JSON 401 instead of HTML login page
**Fixed:** Browsers are now redirected to `/dashboard/login` (HTML login page) instead of receiving JSON 401. API clients still receive JSON 401.

### ✅ 3. Email template serialization may not work
**Fixed:** `templateToString()` now explicitly types the parameter, calls `.toString()` directly, and throws a clear error if serialization fails.

### ✅ 4. No error handling on database operations
**Fixed:** All DB operations in `public.ts` and `dashboard.ts` are now wrapped in try/catch with proper logging and 500 error responses.

### ✅ 5. Confirmation link "expiration" is fake
**Fixed:** Removed the false "48 hour expiration" claim from the confirmation email template.

### ✅ 6. EMAIL_FROM validation may reject valid sender formats
**Fixed:** EMAIL_FROM validation now uses a regex that accepts both bare email and `"Name <email>"` formats.

### ✅ 7. Password in query parameter is insecure
**Fixed:** Login form now uses POST instead of GET, so the password is not exposed in the URL on submission.

---

## Remaining Issues

### 8. No `.env` file in repository
**Severity:** Medium
**Problem:** The app requires `DASHBOARD_PASSWORD` and will fail to start if `.env` doesn't exist.
**Fix:** Document clearly in README that `.env` must be created from `.env.example`. (Note: `.env` should NOT be committed — this is correct behavior.)

### 9. No `public/` directory
**Severity:** Minor
**Brief requirement:** `public/subscribe-widget.js` should exist (optional)
**Impact:** Low — widget is optional per brief.

### 10. `subscribedAt` field timestamp handling
**Severity:** Minor
**Problem:** The schema uses `integer` with `{ mode: "timestamp" }`, inserts use `new Date()`. Drizzle should handle conversion, but worth verifying.

### 11. No input sanitization on `source` field
**Severity:** Minor
**Problem:** The `source` field accepts any string without length validation.
**Fix:** Add `z.string().max(255).optional()` validation.

### 12. Broadcast form error message is generic
**Severity:** Minor
**Problem:** On broadcast send failure, the UI only shows "Error sending" without details.
**Fix:** Include the error message or status code in the response display.

### 13. No rate limiting on subscribe endpoint
**Severity:** Minor
**Problem:** `POST /subscribe` can be spammed with unlimited requests.
**Fix:** Add basic rate limiting (e.g., max N subscribes per IP per hour).

---

## Summary

| Status | Severity | Count |
|--------|----------|-------|
| ✅ Fixed | Critical | 2 |
| ✅ Fixed | Important | 3 |
| ✅ Fixed | Medium | 2 |
| Remaining | Medium | 1 |
| Remaining | Minor | 5 |

**Total fixed:** 7 of 13 issues
