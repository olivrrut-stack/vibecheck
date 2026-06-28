# CLAUDE.md — VibeCheck

Brief guide for future Claude Code sessions. Covers what isn't obvious from the code.

## What this is

An App Store **rejection-risk checker** for developers who built their app with AI tools
(Cursor, Lovable, Bolt, Claude Code, Replit). The user answers 6 questions; Claude writes a
diagnosis (risk score + specific guideline risks + verdict). The **free check is stateless**
— no account, nothing stored. On top of that sits an **optional paid ($5) deep fix report**:
that path requires a Supabase account and stores the purchased report. So the product as a
whole is no longer "no database, no accounts" — only the free diagnosis is.

The home page (`app/page.tsx` state machine) runs the free flow: `idle` (questionnaire) →
`loading` → `report` | `error`. The report screen upsells the paid fixes.

**Questionnaire numbering:** the UI shows 6 questions, with the new "how did you build it?"
(`buildTool`) as Q1. The system prompt and `buildUserMessage` still label the five *risk*
questions Q1–Q5 (data, Safari-diff, code, WebView, native) exactly as before; the build tool
is passed as an unnumbered context line, not folded into that scheme. References to "Q2 …
Q5" below are those prompt numbers.

## Key facts (don't break these)

- **Model is `claude-sonnet-4-6`** — chosen deliberately per the product brief. Do not
  "upgrade" it without being asked.
- **The Anthropic call is server-side only**, in `app/api/check/route.ts`. The API key comes
  from `ANTHROPIC_API_KEY` (in `.env.local` locally, a Vercel env var in prod) and must
  **never** reach the browser. There is intentionally no key input in the UI.
- **Each "Check my app" is one paid API call** billed to whoever owns the key. Keep that in
  mind before exposing this publicly.
- **Rate limiting** (`lib/ratelimit.ts`) caps each IP at `RATE_LIMIT` (5) checks/hour before
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

## The paid ($5) fix-report flow

Bolted on after the free checker; the free flow above still works with none of this
configured. Path: `UnlockPanel` → `/api/checkout/route.ts` (creates an unpaid row + a Stripe
Checkout session) → Stripe → `/unlock` page → `/api/unlock/route.ts` (verifies payment, marks
paid, calls `lib/generateFixes.ts` for the deep report). **Idempotent by design:** payment is
recorded before the AI call, so a generation timeout never loses the purchase — reload
regenerates with no second charge.

- **Auth/storage is Supabase.** `lib/supabase/{server,client,admin}.ts` — the `admin` client
  is service-role and protected by a `server-only` import so its key can't reach the browser.
  `lib/reports.ts` is the report CRUD. Schema: `supabase/migrations/0001_reports.sql`.
- **Payments** in `lib/stripe.ts` (`FIX_REPORT_PRICE_CENTS = 500`).
- `/api/fixes/route.ts` is a **preview-only** mirror gated by `ENABLE_FIXES_PREVIEW`.

## Layout

- `app/page.tsx` — free-flow client state machine + header/footer + loading/error states
- `app/api/check/route.ts` — server-side Anthropic call, JSON-schema output, validation
- `app/{login,unlock,reports,result,privacy,terms,refund}/` — auth, post-payment unlock,
  the report library, the stateless shareable result (`/result/[level]/[score]` + its
  `opengraph-image`), and legal pages
- `components/` — free-flow chrome (`StoreHeader`, `Questionnaire`, `RiskReport`, `RiskMeter`,
  `Carousel`, `MetaStrip`, `AppIcon`, `Spinner`), paid-flow UI (`UnlockPanel`,
  `FixReportView`, `AccountMenu`, `auth/*`), and `ShareButton`. The UI is an App Store
  product-page pastiche: listing chrome + questions/risks as a swipeable "screenshot" gallery.
- `lib/types.ts` — shared types + questionnaire option lists incl. `BUILD_TOOLS` (single
  source of truth)
- `lib/prompt.ts` — the verbatim `SYSTEM_PROMPT` (diagnosis) + `FIXES_SYSTEM_PROMPT` (paid)
- `lib/{verdict,guidelines,validate,aiJson}.ts` — score/level banding, Apple anchor links,
  request-shape guards, model-output JSON extraction
- `app/globals.css` — Tailwind v4 `@theme` design tokens (dark, risk-color accents,
  Geist Sans + Geist Mono)

## Commands

- `npm run dev` — local dev (needs a real key in `.env.local`)
- `npm run build` — production build + type-check + lint (must pass before shipping)
- `npm run lint`

## Stack & env

Next.js 16 (App Router) · TypeScript · Tailwind CSS v4 · `@anthropic-ai/sdk` · Supabase
(auth + reports) · Stripe (paid unlock) · Upstash Redis (rate limiting) · deploys to Vercel.

Env vars: `ANTHROPIC_API_KEY` (required for the free check). For the paid flow:
`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`,
`STRIPE_SECRET_KEY`. Optional: `UPSTASH_REDIS_REST_URL`/`UPSTASH_REDIS_REST_TOKEN` (or the
`KV_REST_API_*` pair), `DAILY_CHECK_CAP`, `ENABLE_FIXES_PREVIEW`, and
`NEXT_PUBLIC_SITE_URL` (set to `https://vibecheckhq.app` in prod — the code already defaults
to it, so OG/share previews resolve correctly even if it's unset).
