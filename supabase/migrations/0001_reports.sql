-- VibeCheck: paid reports table + row-level security.
--
-- Run this ONCE in the Supabase SQL Editor:
--   Supabase dashboard > SQL Editor > New query > paste this > Run.
-- Safe to re-run (everything is "if not exists" / "drop ... if exists").

create extension if not exists "pgcrypto";

create table if not exists public.reports (
  id                uuid primary key default gen_random_uuid(),
  -- The buyer. Set when the report is persisted at purchase.
  user_id           uuid not null references auth.users (id) on delete cascade,
  -- The 5 questionnaire answers (+ any optional extra context).
  answers           jsonb not null,
  -- score, level, flagged guidelines + reasons.
  diagnosis         jsonb not null,
  -- The deep fix report. Null until paid + generated.
  fixes             jsonb,
  paid              boolean not null default false,
  stripe_session_id text,
  created_at        timestamptz not null default now(),
  paid_at           timestamptz
);

-- Fast "my reports, newest first" lookups.
create index if not exists reports_user_id_created_at_idx
  on public.reports (user_id, created_at desc);

-- A Stripe Checkout session maps to exactly one report, so unlock is idempotent.
create unique index if not exists reports_stripe_session_id_key
  on public.reports (stripe_session_id)
  where stripe_session_id is not null;

alter table public.reports enable row level security;

-- A logged-in user can read ONLY their own reports. Every write (insert, mark
-- paid, save fixes) runs through the service-role key on the server, which
-- bypasses RLS, so there are intentionally no insert/update policies for
-- regular users here.
drop policy if exists "reports_select_own" on public.reports;
create policy "reports_select_own"
  on public.reports for select
  to authenticated
  using (auth.uid() = user_id);
