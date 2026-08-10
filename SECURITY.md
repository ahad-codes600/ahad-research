# Ahad Research — Security notes

## Implemented

- HttpOnly, SameSite=Lax session cookie; `Secure` auto-enabled in production
- 8-hour admin sessions, HMAC-SHA256 signed with a random nonce
- Constant-time comparison for both the signature check and the login
  password/email check (prevents timing attacks that guess credentials
  one byte at a time)
- Production enforcement of a `SESSION_SECRET` of at least 32 characters
  (the app throws on boot if this is missing/weak in production)
- Admin email bound into session verification — a forged/replayed token
  for a different email is rejected
- Login throttling: 8 attempts per IP+email per 10-minute window
- Every article-management API method (GET/POST/PUT/DELETE) requires a
  valid session — including GET, which earlier drafts of this kind of
  app commonly forget to protect
- Security response headers (`next.config.mjs`): HSTS, X-Frame-Options,
  X-Content-Type-Options, Referrer-Policy, Permissions-Policy, COOP
- Admin/API routes excluded from search-engine crawling
- No secrets committed to the repo (`.env.local` is gitignored)
- Article storage can now use a real hosted Postgres table (Supabase)
  instead of a local JSON file — see "Persistent storage" in the README.
  This matters because most free hosts run your app on a filesystem that
  is read-only or gets wiped on every deploy; without this, publishing
  in production would silently not save.

## Known limitations — read before you tell anyone this is "production-grade"

1. **Login rate limiting is per-running-instance, in-memory.** On a
   serverless host (Vercel, Netlify) each request can hit a different,
   short-lived instance, so the attempt counter does not reliably
   accumulate across requests. It will slow down a lazy bot; it will not
   stop a real attack. For this project's actual risk level (a personal
   site with one admin account, not a bank) this is an acceptable
   trade-off, but don't describe it as "rate-limited" without this
   caveat. If you want it to actually hold up: use Vercel's free WAF
   rules, or move counters to Upstash Redis (free tier).
2. **No CSRF token.** The `SameSite=Lax` cookie blocks the common
   cross-site POST attack, but a same-site GET-based attack or a bug in
   `SameSite` handling in an old browser wouldn't be caught by anything
   else here. Low risk for a single-admin site, still a gap.
3. **No 2FA / passkeys.** Planned in the original roadmap, not built.
   For one admin account behind a strong random password this is a
   reasonable line to hold for now, not a reasonable line to hold
   forever.
4. **No automated backups of the Supabase database.** Supabase free
   tier does daily backups for you on some plans but not all — check
   your project's backup settings. If you don't, an accidental `DELETE`
   with no undo is possible.
5. **Yahoo Finance and CFTC endpoints used for market data are
   unofficial/public endpoints, not paid data licenses.** Fine for a
   student research project; don't represent the numbers as
   institutional-grade real-time data if you ever scale this beyond a
   personal statement portfolio piece.

## Before you deploy

1. Generate a random `SESSION_SECRET` (32+ chars) — e.g. `openssl rand -hex 32`.
2. Set a strong, unique `ADMIN_PASSWORD` you don't reuse anywhere else.
3. Set `ADMIN_EMAIL`.
4. Set `NEXT_PUBLIC_SITE_URL` to your real production URL (e.g. your
   `*.vercel.app` address).
5. Set `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` (see README).
6. Do not commit `.env.local`.
