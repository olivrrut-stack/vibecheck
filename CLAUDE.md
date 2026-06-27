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
- **Rate limiting** (`lib/ratelimit.ts`) caps each IP at `RATE_LIMIT` (3) checks/hour before
  the paid call. It uses Upstash Redis when `UPSTASH_REDIS_REST_URL` + `UPSTASH_REDIS_REST_TOKEN`
  (or the `KV_REST_API_*` pair) are set, else an in-memory fallback (per-instance, weaker on
  serverless). Each check logs a usage line; with Redis it also increments a daily
  `vibecheck:checks:<date>` counter. Set the Upstash env vars in Vercel for real protection.
- **The system prompt is product-critical** — it's the verbatim reviewer-expert prompt in
  `lib/prompt.ts`. Edit deliberately and keep the strict JSON output contract
  `{ riskLevel, risks[], verdict }`. The API route enforces that shape via
  `output_config.format` (JSON schema) plus defensive validation (`isValidDiagnosis`).

## The guidelines that drive the product

Verbatim from Apple's live App Store Review Guidelines (verified 2026-06). The system
prompt in `lib/prompt.ts` pins these to a closed list with exact titles so the model can
never cite a fake clause.

- **4.2 Minimum Functionality** — the #1 rejection for vibe-coded apps: repackaged
  websites / web wrappers / "could just be a Safari bookmark." Weak or vague Q2 answer, or a
  Q4 "website in a shell," is the major red flag. (Earlier docs mislabeled this as 4.3 —
  4.2 is the real web-wrapper clause; 4.3 is Spam.)
- **4.3 Spam** — duplicate or indistinguishable apps. 4.3(a) many near-identical apps;
  4.3(b) crowded categories that must be meaningfully different.
- **2.5.2 Software Requirements** — may not download/install/execute code that changes
  features after review. Q3 = "Yes" is a blocker.
- **5.1.1 Data Collection and Storage** — undisclosed data collection; needs a privacy
  policy, consent, minimization, account deletion.
- **4.1 Copycats**, **2.3.1 Accurate Metadata** (no hidden features), **3.1.1 In-App
  Purchase** (unlocks must use Apple IAP) round out the closed list.
- **Q2 is the most important signal.** Q5 native features (camera, IAP, offline…) count in
  the app's favor against 4.2.

## Layout

- `app/page.tsx` — client state machine + header/footer + loading/error states
- `app/api/check/route.ts` — server-side Anthropic call, JSON-schema output, validation
- `components/` — `StoreHeader`, `Questionnaire`, `RiskReport`, `Carousel` (screenshot
  gallery), `AppIcon` (squircle), `MetaStrip` (App Store rating row), `Spinner`. The UI is
  an App Store product-page pastiche: listing chrome + the questions and the result's risks
  rendered as a swipeable "screenshot" gallery.
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
