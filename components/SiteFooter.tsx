import Link from "next/link";

// Shared footer: legal links + the standing "not affiliated with Apple"
// disclaimer. Used on the main page and every legal page so the required links
// are reachable from anywhere.
export default function SiteFooter() {
  return (
    <footer className="mt-16 border-t border-line pt-6">
      <nav className="flex flex-wrap items-center gap-x-5 gap-y-2">
        {[
          { href: "/listing", label: "Listing checker" },
          { href: "/terms", label: "Terms" },
          { href: "/privacy", label: "Privacy" },
          { href: "/refund", label: "Refunds" },
        ].map((l) => (
          <Link
            key={l.href}
            href={l.href}
            className="text-xs font-medium text-ink-muted transition-colors hover:text-ink"
          >
            {l.label}
          </Link>
        ))}
        <a
          href="https://developer.apple.com/app-store/review/guidelines/"
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs font-medium text-ink-muted transition-colors hover:text-ink"
        >
          App Store Review Guidelines
        </a>
      </nav>
      <p className="mt-4 max-w-2xl text-xs leading-relaxed text-ink-faint">
        VibeCheck gives an informed risk estimate based on your answers. It
        isn&rsquo;t affiliated with Apple and doesn&rsquo;t guarantee approval or
        rejection. Always read Apple&rsquo;s guidelines and use your own
        judgment.
      </p>
      <p className="mt-2 max-w-2xl text-xs leading-relaxed text-ink-faint">
        Apple&reg;, App Store&reg;, and related marks are trademarks of Apple
        Inc., registered in the U.S. and other countries. VibeCheck is an
        independent tool and is not affiliated with, endorsed by, sponsored by,
        or approved by Apple Inc. &ldquo;App Store&rdquo; is used only to
        identify the review process this tool helps with.
      </p>
    </footer>
  );
}
