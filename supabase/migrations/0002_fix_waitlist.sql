-- VibeCheck: "notify me when fixes unlock" waitlist.
--
-- Used while the paid fix report is in its pre-launch "Unlocking this week"
-- state (NEXT_PUBLIC_PAYMENTS_LIVE != "true"). Visitors leave an email on the
-- result and get notified the moment checkout goes live.
--
-- Run this ONCE in the Supabase SQL Editor:
--   Supabase dashboard > SQL Editor > New query > paste this > Run.
-- Safe to re-run (everything is "if not exists" / "drop ... if exists").

create extension if not exists "pgcrypto";

create table if not exists public.fix_waitlist (
  id         uuid primary key default gen_random_uuid(),
  email      text not null,
  -- "app" or "game" — which track they were looking at.
  track      text not null default 'app',
  created_at timestamptz not null default now()
);

-- One row per email+track: re-submitting is a no-op, never spams duplicates.
-- Email is always stored lowercased by the server, so a plain unique index is
-- enough (and lets the upsert's ON CONFLICT target match it).
create unique index if not exists fix_waitlist_email_track_key
  on public.fix_waitlist (email, track);

alter table public.fix_waitlist enable row level security;

-- Inserts run through the service-role key on the server (which bypasses RLS),
-- so there are intentionally no public insert/select policies. The list is
-- readable only from the Supabase dashboard / service role.
