"use client";

import Link from "next/link";
import { useState } from "react";
import { useAuth } from "./AuthProvider";

type Mode = "login" | "signup";

// Email + password sign-up / log-in, used both on the /login page and inline in
// the unlock flow. Handles either Supabase email-confirmation setting: if
// sign-up returns a session, we proceed; if it doesn't (confirm-email is on),
// we tell the user to confirm and switch to log-in.
export default function AuthForm({
  initialMode = "login",
  onAuthed,
  heading,
  subheading,
}: {
  initialMode?: Mode;
  /** Called once the user has a live session. */
  onAuthed?: () => void;
  heading?: string;
  subheading?: string;
}) {
  const { client, ready } = useAuth();
  const [mode, setMode] = useState<Mode>(initialMode);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!client) return;
    setBusy(true);
    setError(null);
    setNotice(null);

    try {
      if (mode === "signup") {
        const { data, error } = await client.auth.signUp({ email, password });
        if (error) {
          setError(error.message);
        } else if (data.session) {
          // Email confirmation is off: we're logged in immediately.
          onAuthed?.();
        } else {
          // Email confirmation is on: account made, needs verifying.
          setNotice(
            "Account created. Check your email to confirm it, then log in here."
          );
          setMode("login");
        }
      } else {
        const { error } = await client.auth.signInWithPassword({
          email,
          password,
        });
        if (error) {
          setError(error.message);
        } else {
          onAuthed?.();
        }
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  if (!ready) {
    return (
      <p className="text-sm text-ink-muted">
        Accounts aren&rsquo;t configured yet. Add the Supabase keys to enable
        sign in.
      </p>
    );
  }

  return (
    <div>
      {heading && (
        <h2 className="text-lg font-bold tracking-tight text-ink">{heading}</h2>
      )}
      {subheading && (
        <p className="mt-1 text-sm text-ink-muted">{subheading}</p>
      )}

      <form onSubmit={handleSubmit} className={heading ? "mt-5" : ""}>
        <label className="block">
          <span className="font-display text-[11px] uppercase tracking-[0.16em] text-ink-muted">
            Email
          </span>
          <input
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="mt-1.5 w-full rounded-lg border border-line-strong bg-surface-2 px-4 py-3 text-sm text-ink placeholder:text-ink-faint focus:border-accent"
          />
        </label>

        <label className="mt-4 block">
          <span className="font-display text-[11px] uppercase tracking-[0.16em] text-ink-muted">
            Password
          </span>
          <input
            type="password"
            required
            minLength={8}
            autoComplete={mode === "signup" ? "new-password" : "current-password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder={mode === "signup" ? "At least 8 characters" : "Your password"}
            className="mt-1.5 w-full rounded-lg border border-line-strong bg-surface-2 px-4 py-3 text-sm text-ink placeholder:text-ink-faint focus:border-accent"
          />
        </label>

        {error && (
          <p className="mt-3 text-sm text-risk-high">{error}</p>
        )}
        {notice && (
          <p className="mt-3 text-sm text-risk-low">{notice}</p>
        )}

        <button
          type="submit"
          disabled={busy}
          className="mt-5 w-full rounded-full bg-accent px-6 py-3.5 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {busy
            ? "Working…"
            : mode === "signup"
              ? "Create account"
              : "Log in"}
        </button>

        {mode === "signup" && (
          <p className="mt-3 text-center text-xs leading-relaxed text-ink-faint">
            By creating an account you agree to our{" "}
            <Link href="/terms" className="text-ink-muted underline hover:text-ink">
              Terms
            </Link>{" "}
            and{" "}
            <Link
              href="/privacy"
              className="text-ink-muted underline hover:text-ink"
            >
              Privacy Policy
            </Link>
            .
          </p>
        )}
      </form>

      <p className="mt-4 text-center text-sm text-ink-muted">
        {mode === "signup" ? "Already have an account?" : "New to VibeCheck?"}{" "}
        <button
          type="button"
          onClick={() => {
            setMode(mode === "signup" ? "login" : "signup");
            setError(null);
            setNotice(null);
          }}
          className="font-semibold text-accent hover:underline"
        >
          {mode === "signup" ? "Log in" : "Create one"}
        </button>
      </p>
    </div>
  );
}
