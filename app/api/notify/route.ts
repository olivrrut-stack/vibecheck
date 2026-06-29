import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import type { Track } from "@/lib/types";

// Captures "email me when fixes unlock" sign-ups while the paid report is in its
// pre-launch state. Writes to the fix_waitlist table via the service-role
// client (RLS is locked, so this is the only path in). No account required.
export const runtime = "nodejs";

// Pragmatic email shape check: not RFC-perfect, just enough to reject junk.
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(req: Request) {
  let body: { email?: unknown; track?: unknown };
  try {
    body = (await req.json()) as { email?: unknown; track?: unknown };
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const email = typeof body.email === "string" ? body.email.trim() : "";
  if (!email || email.length > 254 || !EMAIL_RE.test(email)) {
    return NextResponse.json(
      { error: "Please enter a valid email address." },
      { status: 400 }
    );
  }
  const track: Track = body.track === "game" ? "game" : "app";

  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return NextResponse.json(
      { error: "Sign-ups aren't configured yet. Please try again later." },
      { status: 503 }
    );
  }

  try {
    const admin = createSupabaseAdminClient();
    // Upsert so a repeat sign-up is a no-op, never a duplicate row.
    const { error } = await admin
      .from("fix_waitlist")
      .upsert(
        { email: email.toLowerCase(), track },
        { onConflict: "email,track", ignoreDuplicates: true }
      );
    if (error) throw error;
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[VibeCheck] notify signup failed:", err);
    return NextResponse.json(
      { error: "Couldn't save your email. Please try again." },
      { status: 500 }
    );
  }
}
