# VibeCheck — Paid Fixes Spec

Status: Draft for build · Date: 2026-06-27

## 1. Goal

Add a paid tier that unlocks **fleshed-out, app-specific fixes** for the
guideline risks VibeCheck flags. The free check stays exactly as it is (score +
risk level + flagged guidelines + "why"). Paying unlocks the **fix report** for
that result.

## 2. Pricing & model

- **$5 one-time, per report.** Each app a user checks is its own $5 unlock.
- A buyer creates an **account (email + password)** at purchase. Their account
  is their **library** — they can log in on any device, forever, and re-open
  every report they bought.
- **Why an account (not just a token):** persistent access kills refund /
  chargeback liability ("I paid $5 and lost access"). They can always log back
  in to what they bought.
- Free users need **no account** — the wall only appears at the $5 step.
- Monthly "Pro" (unlimited) is **out of scope for v1** — possible fast-follow if
  there's demand.

## 3. What's free vs paid

| | Free | Paid ($5/report) |
|---|---|---|
| 5 questions | ✅ | ✅ |
| Rejection-risk score + level | ✅ | ✅ |
| Flagged guidelines + "why" | ✅ | ✅ |
| Share card / link | ✅ | ✅ |
| **Per-guideline fixes (deep)** | 🔒 | ✅ |

Gating is enforced **server-side** — locked fixes are never sent to a
non-purchaser (can't be read from the network tab).

## 4. The fix report (the $5 deliverable)

The free check no longer generates fixes. On unlock, a **second, deeper AI call**
writes the report from the saved answers (+ optional extra context). For each
flagged guideline it produces:

1. **Root cause** — why *this* app trips the clause, tied to their answers.
2. **Exactly what to change** — concrete, step-by-step, plain English.
3. **A worked example** — specific to the app's category (inferred from Q2).
4. **What the reviewer wants to see** — how to demonstrate compliance.
5. **App Review notes wording** — what to write so the reviewer pre-clears it.
6. The exact Apple guideline link.

### Short / vague Q2 handling
Fixes are driven mainly by the **flagged guideline + the structured answers
(Q1/Q3/Q4/Q5)**, so even a one-sentence Q2 (e.g. "it's a budgeting app") yields
specific, category-appropriate fixes. Two safety nets:
- The fix prompt is instructed to **infer plausible specifics** from sparse input
  and frame them as "for an app like yours," never retreat to generic advice.
- An **optional "Anything else about your app?" free-text box** at the unlock
  step. If Q2 was brief, nudge it ("Your answer was short — add a line for
  sharper fixes"). Skippable.

## 5. Architecture & stack

- **Anthropic (Claude Sonnet 4-6)** — two calls:
  - Free `diagnosis` call: score + level + flags + why (no fixes).
  - Paid `fixes` call: the deep remediation report.
- **Supabase** — email/password **auth** + **Postgres** to store users and their
  purchased reports forever (storage is text, ~5–10 KB/report; the free tier
  holds ~50k reports = $250k of unlocks, so storage cost is a rounding error).
- **Stripe** — the $5 one-time Checkout.
- **Upstash** (already live) — per-IP + daily rate limiting and a short-TTL cache
  of the free diagnosis so we can persist it on purchase without re-running.

## 6. Data model (Supabase / Postgres)

- `auth.users` — Supabase-managed (email, password hash, etc.).
- `reports`
  - `id` uuid (pk)
  - `user_id` uuid → auth.users (set at purchase)
  - `answers` jsonb — the 5 answers (+ optional extra context)
  - `diagnosis` jsonb — score, level, flags (guideline + reason)
  - `fixes` jsonb — the deep fix report (null until paid)
  - `paid` boolean default false
  - `stripe_session_id` text
  - `created_at`, `paid_at` timestamps

Row-Level Security: a user can only read their own `reports`. Fix generation +
writes happen via the service role on the server.

## 7. Flows

### Free check (unchanged UX)
5 questions → `/api/check` → score + level + flags + why. Result is cached in
Upstash under a random `diagnosisId` (1h TTL) so it can be persisted on purchase.

### Unlock ($5)
1. User taps **"Get fixes — $5"** on the locked result.
2. **Account step:** create account (email + password) or log in.
3. Optional **"tell us more"** box.
4. `/api/checkout` creates a Stripe Checkout session ($5) carrying the
   `diagnosisId` (and userId) in metadata → redirect to Stripe.
5. On success redirect, server **verifies the session with Stripe**. If paid:
   persist the diagnosis as a `reports` row for the user, run the **fixes** AI
   call, save `fixes`, mark `paid`.
6. Show "writing your fixes…" then reveal the full report.

### Returning user
Log in → **My reports** lists their purchased reports → open any to re-read the
fixes (served only if `report.user_id === authedUser && report.paid`).

## 8. API endpoints

- `POST /api/check` — free diagnosis (existing; stop returning `fix` text).
- `POST /api/checkout` — create Stripe Checkout session for a `diagnosisId`
  (requires auth). Returns the Checkout URL.
- `GET /api/unlock?session_id=…` (or the success route) — verify payment,
  persist report, generate + save fixes. Idempotent.
- `GET /api/reports` — list the authed user's reports.
- `GET /api/reports/[id]` — one report's fixes (auth + ownership + paid checks).
- (Optional) `POST /api/stripe/webhook` — backstop for payment confirmation.

## 9. UI changes

- **Result page:** the App Review Notes show guideline + why for free; each
  fix section is replaced by a 🔒 **"Unlock all fixes — $5"** state. One primary
  CTA. Share + score stay free.
- **Auth screens:** minimal sign-up / log-in (Supabase UI or custom).
- **Unlock flow:** account step → optional context box → Stripe → loading →
  revealed fixes.
- **My reports:** a simple logged-in list of purchased reports.
- **Account menu:** log out; (Stripe receipt is emailed by Stripe).

## 10. Legal (required once we take money)

- `/terms` — Terms of Service.
- `/privacy` — Privacy Policy (we now collect email + process payment via
  Stripe; no card data touches our servers).
- `/refund` — short refund policy (e.g. "fixes are generated on purchase; refund
  within X days if the report failed to generate").
- Footer links to all three. Drafted as part of the build.

## 11. Env vars (added to Vercel)

- `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`,
  `SUPABASE_SERVICE_ROLE_KEY`
- `STRIPE_SECRET_KEY`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`, `STRIPE_PRICE_ID`,
  (optional) `STRIPE_WEBHOOK_SECRET`
- Existing: `ANTHROPIC_API_KEY`, `UPSTASH_REDIS_REST_URL/TOKEN`,
  `NEXT_PUBLIC_SITE_URL`, `DAILY_CHECK_CAP`

## 12. Build phases

1. **Split the AI**: free `/api/check` returns score/level/flags/why only; new
   `fixes` prompt + schema for the deep report.
2. **Supabase**: project, `reports` table + RLS, auth (email/password), client.
3. **Stripe**: $5 Product/Price, `/api/checkout`, success verify, idempotent
   unlock that generates + saves fixes.
4. **UI**: locked-fix state + "Get fixes $5", account step, optional context box,
   reveal, My reports.
5. **Legal pages** + footer links.
6. **Test** in Stripe test mode end-to-end → flip to live keys.

## 13. What the owner sets up

- **Supabase** account → new project → copy URL + anon + service-role keys.
- **Stripe** account → one $5 Product/Price → copy keys.
- Paste all keys into Vercel env vars (same as before).

## 14. Open decisions / notes

- Confirmed: **$5 per report** (not $5-forever). Account = library of purchases.
- Auth = **email + password** via Supabase (no rolling our own password store).
- Webhook vs success-redirect verify: start with **redirect verify** (simpler);
  add the webhook later as a robustness backstop if needed.
- Out of scope v1: monthly Pro, Android/Play Store, team accounts.
