import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import BrandBar from "@/components/BrandBar";
import FixReportView from "@/components/FixReportView";
import TrackTheme from "@/components/TrackTheme";
import { getReportById } from "@/lib/reports";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Track } from "@/lib/types";
import { VERDICT } from "@/lib/verdict";

// One purchased report's deep fixes. Server rendered with a strict ownership +
// paid check, so a logged-in user can only ever read their own unlocked report.
export const dynamic = "force-dynamic";

export default async function ReportDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect(`/login?next=/reports/${id}`);

  const report = await getReportById(id);
  // Hide existence of others' reports: not found, not "forbidden".
  if (!report || report.user_id !== user.id || !report.paid) notFound();

  const v = VERDICT[report.diagnosis.riskLevel];
  const track: Track = report.diagnosis.track === "game" ? "game" : "app";
  const date = new Date(report.created_at).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  return (
    <TrackTheme track={track}>
      <main className="mx-auto w-full max-w-2xl px-5 py-6 sm:px-8 sm:py-12">
        <BrandBar />

        <Link
          href="/reports"
          className="mb-5 inline-flex items-center gap-1 text-sm text-ink-muted transition-colors hover:text-ink"
        >
          ← My reports
        </Link>

      <header className="mb-6">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-ink-muted">
          Fix report · {date}
        </p>
        <div className="mt-2 flex flex-wrap items-center gap-3">
          <h1 className="text-2xl font-bold tracking-tight text-ink">
            Your fixes
          </h1>
          <span
            className="inline-flex rounded-full px-4 py-1 text-xs font-semibold text-white"
            style={{ backgroundColor: v.colorVar }}
          >
            {v.pill}
          </span>
        </div>
      </header>

      {report.fixes ? (
        <FixReportView report={report.fixes} />
      ) : (
        <div className="rounded-[var(--radius-card)] border border-line bg-surface px-6 py-12 text-center shadow-card">
          <p className="text-base font-medium text-ink">
            Your fixes are still being finalized.
          </p>
          <p className="mx-auto mt-2 max-w-sm text-sm text-ink-muted">
            This usually means the last write timed out. Reload in a moment and
            they&rsquo;ll appear, no extra charge.
          </p>
        </div>
      )}
      </main>
    </TrackTheme>
  );
}
