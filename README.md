# VibeCheck

**Find out if your AI-built app will get rejected before Apple does.**

A web app that estimates your App Store rejection risk. The check is free and needs no
account: answer 6 questions about your app and Claude returns a risk score, the specific Apple
guidelines you're likely to hit, and the exact fixes — in plain English. An optional $5 deep
fix report (which does require an account) goes further. Built for developers shipping apps
from Cursor, Lovable, Bolt, Claude Code, and Replit.

It focuses on the judgment calls that actually sink AI-built apps — **Guideline 4.2**
(minimum functionality / "does this deserve to be a native app?") and **Guideline 2.5.2**
(running code Apple didn't review) — not just code-level checks.

## Tech stack

- Next.js 16 (App Router) + TypeScript
- Tailwind CSS v4
- Anthropic API via `@anthropic-ai/sdk` (model: `claude-sonnet-4-6`), called server-side only
- The free check is stateless (no database, no account)
- Paid $5 fix report: Supabase (auth + report storage), Stripe (checkout), Upstash Redis
  (rate limiting)

## Local setup

1. Install dependencies:
   ```bash
   npm install
   ```
2. Add your Anthropic API key to `.env.local` (the file is already created with a placeholder
   and is gitignored). Get a key at https://console.anthropic.com/settings/keys:
   ```
   ANTHROPIC_API_KEY=sk-ant-...
   ```
   That's all the free check needs. The optional paid fix report additionally requires
   `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`,
   and `STRIPE_SECRET_KEY`. In production also set `NEXT_PUBLIC_SITE_URL=https://vibecheckhq.app`
   so share/OG previews resolve to the live domain.
3. Run the dev server:
   ```bash
   npm run dev
   ```
   Open http://localhost:3000.

> The key is read **server-side only** in `app/api/check/route.ts` and never reaches the
> browser. There is no key input in the UI by design.

## How it works

`app/page.tsx` is a small state machine: questionnaire → loading → report (or error). On
submit it POSTs the answers to `app/api/check/route.ts`, which calls Claude with a fixed
expert system prompt (`lib/prompt.ts`) and a JSON-schema-constrained output, then returns
`{ riskLevel, risks[], verdict }` for the report screen.

**Note:** every check is one paid Anthropic API call billed to your key.

## Build

```bash
npm run build   # production build + type-check + lint
npm run lint
```

## Deploy to Vercel

1. Push this repo to GitHub and import it at https://vercel.com/new (or run `vercel`).
2. In the Vercel project's **Settings → Environment Variables**, add `ANTHROPIC_API_KEY` with
   your key (Production + Preview). For the paid flow also add the Supabase + Stripe vars
   listed under Local setup, and `NEXT_PUBLIC_SITE_URL`. For durable rate limiting across
   serverless instances, add the Upstash Redis vars too.
3. Provision the Supabase database by running the migration in `supabase/migrations/`.
4. Deploy.

## License

For your own use. Not affiliated with Apple. VibeCheck gives an informed estimate and does not
guarantee approval or rejection — always read the
[App Store Review Guidelines](https://developer.apple.com/app-store/review/guidelines/).
