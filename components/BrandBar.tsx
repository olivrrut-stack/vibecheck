import Link from "next/link";
import AccountMenu from "./AccountMenu";
import AppIcon, { VIBE_GRADIENT } from "./AppIcon";

// Slim top bar shared by the secondary pages (login aside): brand link on the
// left, account menu on the right. Mirrors the top bar on the main page.
export default function BrandBar() {
  return (
    <div className="mb-8 flex items-center justify-between gap-3">
      <Link href="/" className="flex items-center gap-2.5">
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
      <AccountMenu />
    </div>
  );
}
