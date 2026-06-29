import Link from "next/link";
import { redirect } from "next/navigation";
import BrandBar from "@/components/BrandBar";
import { listReportsForUser } from "@/lib/reports";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { guidelineNumber } from "@/lib/guidelines";
import { VERDICT } from "@/lib/verdict";

// A logged-in user's library of purchased reports, newest first. Server
// rendered: the session comes from cookies, the rows from the service role.
export const dynamic = "force-dynamic";

export default async function ReportsPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/reports");

  const reports = await listReportsForUser(user.id);

  return (
    <main className="mx-auto w-full max-w-2xl px-5 py-6 sm:px-8 sm:py-12">
      <BrandBar />

      <header className="mb-6">
        <p className="font-display text-xs uppercase tracking-[0.2em] text-ink-muted">
          Your library
        </p>
        <h1 className="mt-1.5 text-2xl font-bold tracking-tight text-ink">
          My reports
        </h1>
      </header>

      {reports.length === 0 ? (
        <div className="rounded-[var(--radius-card)] border border-line bg-surface px-6 py-16 text-center shadow-card">
          <p className="text-base font-medium text-ink">No reports yet.</p>
          <p className="mx-auto mt-2 max-w-sm text-sm text-ink-muted">
            Run a check and unlock the fixes, and they&rsquo;ll live here for
            good.
          </p>
          <Link
            href="/"
            className="mt-6 inline-flex rounded-full bg-accent px-6 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90"
          >
            Check an app
          </Link>
        </div>
      ) : (
        <ul className="space-y-3">
          {reports.map((report) => {
            const v = VERDICT[report.diagnosis.riskLevel];
            const risks = report.diagnosis.risks;
            const top = risks.length ? guidelineNumber(risks[0].guideline) : "None";
            const date = new Date(report.created_at).toLocaleDateString(undefined, {
              year: "numeric",
              month: "short",
              day: "numeric",
            });
            return (
              <li key={report.id}>
                <Link
                  href={`/reports/${report.id}`}
                  className="flex items-center gap-4 rounded-[var(--radius-card)] border border-line bg-surface p-4 shadow-card transition-colors hover:border-line-strong"
                >
                  <span
                    className="grid h-11 w-11 shrink-0 place-items-center rounded-xl text-sm font-bold text-white"
                    style={{ backgroundColor: v.colorVar }}
                  >
                    {report.diagnosis.score}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-ink">{v.pill}</p>
                    <p className="mt-0.5 text-xs text-ink-muted">
                      {risks.length} {risks.length === 1 ? "flag" : "flags"} · Top
                      issue {top} · {date}
                    </p>
                  </div>
                  <svg
                    viewBox="0 0 24 24"
                    className="h-5 w-5 shrink-0 text-ink-faint"
                    aria-hidden
                  >
                    <path
                      d="M9 6l6 6-6 6"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </main>
  );
}
