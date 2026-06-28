"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useAuth } from "./auth/AuthProvider";

// Top-right account control. Logged out: a quiet "Log in" link. Logged in: the
// user's email with a small menu for their report library and logging out.
// Renders nothing until auth state resolves so it never flashes the wrong state.
export default function AccountMenu() {
  const { user, loading, ready, signOut } = useAuth();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [open]);

  if (!ready || loading) return null;

  if (!user) {
    return (
      <Link
        href="/login"
        className="font-mono text-[11px] uppercase tracking-[0.16em] text-ink-muted transition-colors hover:text-ink"
      >
        Log in
      </Link>
    );
  }

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="menu"
        aria-expanded={open}
        className="flex max-w-[180px] items-center gap-1.5 rounded-full border border-line bg-surface px-3 py-1.5 text-xs font-medium text-ink-muted transition-colors hover:border-line-strong hover:text-ink"
      >
        <span
          aria-hidden
          className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-accent text-[10px] font-bold text-white"
        >
          {user.email?.[0]?.toUpperCase() ?? "?"}
        </span>
        <span className="truncate">{user.email}</span>
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 z-20 mt-2 w-44 overflow-hidden rounded-xl border border-line bg-surface py-1 shadow-card"
        >
          <Link
            href="/reports"
            role="menuitem"
            onClick={() => setOpen(false)}
            className="block px-4 py-2.5 text-sm text-ink transition-colors hover:bg-surface-2"
          >
            My reports
          </Link>
          <button
            type="button"
            role="menuitem"
            onClick={async () => {
              setOpen(false);
              await signOut();
            }}
            className="block w-full px-4 py-2.5 text-left text-sm text-ink-muted transition-colors hover:bg-surface-2 hover:text-ink"
          >
            Log out
          </button>
        </div>
      )}
    </div>
  );
}
