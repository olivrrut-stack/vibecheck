"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect } from "react";
import AppIcon, { VIBE_GRADIENT } from "@/components/AppIcon";
import AuthForm from "@/components/auth/AuthForm";
import { useAuth } from "@/components/auth/AuthProvider";

function LoginInner() {
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get("next") || "/reports";
  const { user } = useAuth();

  // Already logged in? Skip the form.
  useEffect(() => {
    if (user) router.replace(next);
  }, [user, next, router]);

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col px-5 py-10 sm:py-16">
      <Link href="/" className="mb-10 flex items-center gap-2.5">
        <AppIcon gradient={VIBE_GRADIENT} size="sm">
          <svg viewBox="0 0 44 64" className="h-7" aria-hidden>
            <rect x="2" y="2" width="40" height="60" rx="9" fill="white" />
            <rect x="16" y="6.5" width="12" height="3.4" rx="1.7" fill="#0a0a0b" />
            <path
              d="M14 33l7 7 13-15.5"
              fill="none"
              stroke="#0a6cff"
              strokeWidth="5.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </AppIcon>
        <span className="text-sm font-semibold tracking-tight text-ink">
          VibeCheck
        </span>
      </Link>

      <div className="vc-rise rounded-[var(--radius-card)] border border-line bg-surface p-6 shadow-card sm:p-8">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-ink-muted">
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
        href="/"
        className="mt-8 text-center text-sm text-ink-muted transition-colors hover:text-ink"
      >
        ← Back to the checker
      </Link>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<main className="min-h-dvh" />}>
      <LoginInner />
    </Suspense>
  );
}
