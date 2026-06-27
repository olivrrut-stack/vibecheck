# VibeCheck

**Find out if your AI-built app will get rejected before Apple does.**

A free, no-account web app that estimates your App Store rejection risk. Answer 5 questions
about your app and Claude returns a risk score, the specific Apple guidelines you're likely to
hit, and the exact fixes — in plain English. Built for developers shipping apps from Cursor,
Lovable, Bolt, Claude Code, and Replit.

It focuses on the judgment calls that actually sink AI-built apps — **Guideline 4.3**
(minimum functionality / "does this deserve to be a native app?") and **Guideline 2.5.2**
(running code Apple didn't review) — not just code-level checks.

## Tech stack

- Next.js 16 (App Router) + TypeScript
- Tailwind CSS v4
- Anthropic API via `@anthropic-ai/sdk` (model: `claude-sonnet-4-6`), called server-side only
- No database — stateless, no accounts

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
   your key (Production + Preview).
3. Deploy. No other configuration needed — there's no database or backend to provision.

## License

For your own use. Not affiliated with Apple. VibeCheck gives an informed estimate and does not
guarantee approval or rejection — always read the
[App Store Review Guidelines](https://developer.apple.com/app-store/review/guidelines/).
