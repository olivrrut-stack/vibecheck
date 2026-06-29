"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import BrandIcon from "@/components/BrandIcon";
import TrackTheme from "@/components/TrackTheme";
import AuthForm from "@/components/auth/AuthForm";
import { useAuth } from "@/components/auth/AuthProvider";
import type { Track } from "@/lib/types";

function LoginInner() {
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get("next") || "/reports";
  const { user } = useAuth();

  // Follow the section you came from (cookie set on / and /games). Read after
  // mount to avoid a hydration mismatch; a brief flash on login is acceptable.
  const [track, setTrack] = useState<Track>("app");
  useEffect(() => {
    if (/(?:^|;\s*)vc_track=game/.test(document.cookie)) setTrack("game");
  }, []);

  // Already logged in? Skip the form.
  useEffect(() => {
    if (user) router.replace(next);
  }, [user, next, router]);

  return (
    <TrackTheme track={track}>
      <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col px-5 py-10 sm:py-16">
        <Link
          href={track === "game" ? "/games" : "/"}
          className="mb-10 flex items-center gap-2.5"
        >
          <BrandIcon track={track} size="sm" />
          <span className="text-sm font-semibold tracking-tight text-ink">
            VibeCheck
          </span>
        </Link>

      <div className="vc-rise rounded-[var(--radius-card)] border border-line bg-surface p-6 shadow-card sm:p-8">
        <p className="font-display text-xs uppercase tracking-[0.2em] text-ink-muted">
          Your account
        </p>
        <AuthForm
          initialMode="login"
          heading="Log in to your reports"
          subheading="Your account is your library of unlocked fix reports."
          onAuthed={() => router.replace(next)}
        />
      </div>

        <Link
          href={track === "game" ? "/games" : "/"}
          className="mt-8 text-center text-sm text-ink-muted transition-colors hover:text-ink"
        >
          ← Back to the checker
        </Link>
      </main>
    </TrackTheme>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<main className="min-h-dvh" />}>
      <LoginInner />
    </Suspense>
  );
}
