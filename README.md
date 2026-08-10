# Ahad Research

Independent financial & macroeconomic research site — publishing system,
public research archive, live macro dashboard, and market charts.

## Run locally

1. Copy `.env.example` to `.env.local` and fill in your own values.
2. `npm install`
3. `npm run dev`
4. Open `http://localhost:3000`

Without `SUPABASE_URL`/`SUPABASE_SERVICE_ROLE_KEY` set, articles are stored
in `data/articles.json` — fine for local development, **not** fine for a
public deployment (see below).

## Persistent storage (required before you publish articles in production)

Serverless hosts don't give you a writable, permanent disk. If you deploy
this as-is and hit "Publish" in `/admin`, the article may appear to save
and then vanish on the next deploy or even the next request. Fix this once,
for free, with Supabase:

1. Create a free account at supabase.com and a new project (free tier —
   no card required for the free tier at time of writing, but check
   before you commit to it).
2. In the SQL editor, run:

   ```sql
   create table articles (
     id uuid primary key,
     slug text unique not null,
     title text not null,
     category text not null,
     excerpt text default '',
     content text not null,
     status text not null default 'published',
     published_at timestamptz not null default now(),
     date text not null
   );
   create index articles_status_idx on articles (status);
   create index articles_category_idx on articles (category);
   ```

3. In Project Settings → API, copy the **Project URL** and the
   **service_role key** (not the anon/public key — the service role key
   is what lets the server write articles, and it must stay server-side).
4. Set `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` in `.env.local` for
   local testing, and in your host's environment variables (e.g. Vercel
   Project Settings → Environment Variables) for production.
5. Redeploy. `lib/articles.js` automatically switches from the JSON file
   to Supabase once both variables are present — no other code changes
   needed.

If you later want to migrate your existing `data/articles.json` entries
into Supabase, that's a five-minute script (ask for it when you're ready
— don't hand-copy them).

## Free hosting, no domain budget

You don't need a purchased domain for a personal-statement portfolio
project — a subdomain reads as completely normal for a student project
and nobody serious will hold that against you.

1. Push this repo to GitHub (private or public — public is actually
   better here, it's evidence you built it).
2. Create a free account at vercel.com, "Import Project", pick the repo.
3. Add the environment variables from `.env.example` (real values, not
   the placeholders) in Vercel's dashboard.
4. Deploy. You'll get `your-project-name.vercel.app` on free HTTPS —
   good enough to put directly in a personal statement or CV.
5. If you want a nicer subdomain later, Vercel lets you add any domain
   you own — but you don't need one to launch.

Avoid "free domain" services like Freenom (`.tk`/`.ml`/etc.) — many have
been delisted for abuse and some registrars have mass-revoked them
without warning. A `vercel.app` subdomain is more credible, not less.

## Data sources

Market history uses Yahoo Finance chart feeds and FRED official series.
COT positioning uses the CFTC Public Reporting environment. Market prices
are near-live; CPI/PCE/rates/unemployment are official releases updated
only on their own release schedule; COT is a weekly snapshot. These are
kept visually distinct in the dashboard — see each indicator's
value → date → source line.

## Status

- Publishing system, categories, rich-text editor: done
- Public research platform, search, category pages: done
- Live macro dashboard, charts, COT positioning: done
- SEO (sitemap, robots, structured data, canonical URLs): done
- Production security hardening: see `SECURITY.md`
- Persistent article storage: done (Supabase-backed, see above)
- Deployment: see "Free hosting" above — you still need to actually do this step
