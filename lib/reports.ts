import "server-only";
import { createSupabaseAdminClient } from "./supabase/admin";
import type {
  Answers,
  Diagnosis,
  FixReport,
  GameAnswers,
  StoredReport,
} from "./types";

// Server-side data access for the `reports` table, always via the service-role
// admin client (bypasses RLS). Every write to a report goes through here.

/** Create an unpaid report row at checkout time; returns its id. */
export async function createUnpaidReport(
  userId: string,
  answers: Answers | GameAnswers,
  diagnosis: Diagnosis
): Promise<string> {
  const admin = createSupabaseAdminClient();
  const { data, error } = await admin
    .from("reports")
    .insert({ user_id: userId, answers, diagnosis, paid: false })
    .select("id")
    .single();
  if (error) throw new Error(`createUnpaidReport failed: ${error.message}`);
  return data.id as string;
}

/** Record the Stripe Checkout session id against a report. */
export async function attachStripeSession(
  reportId: string,
  sessionId: string
): Promise<void> {
  const admin = createSupabaseAdminClient();
  const { error } = await admin
    .from("reports")
    .update({ stripe_session_id: sessionId })
    .eq("id", reportId);
  if (error) throw new Error(`attachStripeSession failed: ${error.message}`);
}

export async function getReportById(id: string): Promise<StoredReport | null> {
  const admin = createSupabaseAdminClient();
  const { data, error } = await admin
    .from("reports")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error) throw new Error(`getReportById failed: ${error.message}`);
  return (data as StoredReport | null) ?? null;
}

/** Flag a report paid (idempotent: only stamps paid_at the first time). */
export async function markReportPaid(id: string): Promise<void> {
  const admin = createSupabaseAdminClient();
  const { error } = await admin
    .from("reports")
    .update({ paid: true, paid_at: new Date().toISOString() })
    .eq("id", id)
    .is("paid_at", null);
  if (error) throw new Error(`markReportPaid failed: ${error.message}`);
}

/** Persist the generated fix report. */
export async function saveReportFixes(
  id: string,
  fixes: FixReport
): Promise<void> {
  const admin = createSupabaseAdminClient();
  const { error } = await admin
    .from("reports")
    .update({ fixes })
    .eq("id", id);
  if (error) throw new Error(`saveReportFixes failed: ${error.message}`);
}

/** A user's purchased reports, newest first (their library). */
export async function listReportsForUser(
  userId: string
): Promise<StoredReport[]> {
  const admin = createSupabaseAdminClient();
  const { data, error } = await admin
    .from("reports")
    .select("*")
    .eq("user_id", userId)
    .eq("paid", true)
    .order("created_at", { ascending: false });
  if (error) throw new Error(`listReportsForUser failed: ${error.message}`);
  return (data as StoredReport[]) ?? [];
}
