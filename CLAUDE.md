# CLAUDE.md — VibeCheck

Brief guide for future Claude Code sessions. Covers what isn't obvious from the code.

## What this is

A free, no-account App Store **rejection-risk checker** for developers who built their app
with AI tools (Cursor, Lovable, Bolt, Claude Code, Replit). The user answers 5 questions;
Claude writes a diagnosis (risk score + specific guideline risks + verdict). Stateless — no
database, no accounts, no user data stored.

Two UI states, one page (`app/page.tsx` state machine): `idle` (questionnaire) → `loading`
→ `report` | `error`.

## Key facts (don't break these)

- **Model is `claude-sonnet-4-6`** — chosen deliberately per the product brief. Do not
  "upgrade" it without being asked.
- **The Anthropic call is server-side only**, in `app/api/check/route.ts`. The API key comes
  from `ANTHROPIC_API_KEY` (in `.env.local` locally, a Vercel env var in prod) and must
  **never** reach the browser. There is intentionally no key input in the UI.
- **Each "Check my app" is one paid API call** billed to whoever owns the key. Keep that in
  mind before exposing this publicly.
- **The system prompt is product-critical** — it's the verbatim reviewer-expert prompt in
  `lib/prompt.ts`. Edit deliberately and keep the strict JSON output contract
  `{ riskLevel, risks[], verdict }`. The API route enforces that shape via
  `output_config.format` (JSON schema) plus defensive validation (`isValidDiagnosis`).

## The 4 guidelines that drive the product

- **4.3** Minimum Functionality / spam — the #1 rejection for vibe-coded apps. Weak/vague Q2
  answer = major red flag.
- **2.5.2** Code execution — downloading/running code after review. Q3 = "Yes" is a blocker.
- **4.2** Minimum Functionality performance — placeholder/broken/WebView-shell apps. Q4 =
  "website in a shell" = high risk for both 4.2 and 4.3.
- **5.1.1** Privacy — undisclosed data collection.
- **Q2 is the most important signal.** Q5 native features (camera, IAP, offline…) count in
  the app's favor.

## Layout

- `app/page.tsx` — client state machine + header/footer + loading/error states
- `app/api/check/route.ts` — server-side Anthropic call, JSON-schema output, validation
- `components/` — `Questionnaire`, `RiskReport`, `RiskBadge`, `Spinner`
- `lib/types.ts` — shared types + questionnaire option lists (single source of truth)
- `lib/prompt.ts` — the verbatim system prompt
- `app/globals.css` — Tailwind v4 `@theme` design tokens (dark, risk-color accents,
  Geist Sans + Geist Mono)

## Commands

- `npm run dev` — local dev (needs a real key in `.env.local`)
- `npm run build` — production build + type-check + lint (must pass before shipping)
- `npm run lint`

## Stack

Next.js 16 (App Router) · TypeScript · Tailwind CSS v4 · `@anthropic-ai/sdk` · deploys to Vercel.
