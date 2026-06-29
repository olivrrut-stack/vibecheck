import BrandBar from "./BrandBar";
import SiteFooter from "./SiteFooter";

// Shared shell for the Terms / Privacy / Refund pages: brand bar, page title
// with a "last updated" line, prose styling, and the footer. Prose styling is
// applied with arbitrary variants so the pages can be written as plain h2/p/ul.
export default function LegalLayout({
  title,
  updated,
  children,
}: {
  title: string;
  updated: string;
  children: React.ReactNode;
}) {
  return (
    <main className="mx-auto w-full max-w-2xl px-5 py-6 sm:px-8 sm:py-12">
      <BrandBar />

      <header className="mb-6">
        <p className="font-display text-xs uppercase tracking-[0.2em] text-ink-muted">
          Legal
        </p>
        <h1 className="mt-1.5 text-2xl font-bold tracking-tight text-ink">
          {title}
        </h1>
        <p className="mt-1 text-sm text-ink-faint">Last updated {updated}</p>
      </header>

      <div
        className="text-sm leading-relaxed text-ink-muted [&_a]:font-medium [&_a]:text-accent hover:[&_a]:underline [&_h2]:mt-8 [&_h2]:text-base [&_h2]:font-bold [&_h2]:text-ink [&_li]:mt-1 [&_p]:mt-3 [&_strong]:font-semibold [&_strong]:text-ink [&_ul]:mt-3 [&_ul]:list-disc [&_ul]:pl-5"
      >
        {children}
      </div>

      <SiteFooter />
    </main>
  );
}
