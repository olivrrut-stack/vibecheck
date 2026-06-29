import Link from "next/link";
import type { Track } from "@/lib/types";

// Top-right toggle between the app-dev checker (phone, light) and the game-dev
// checker (controller, dark). The active side is filled with the track accent.
function PhoneIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
      <rect x="7" y="2.5" width="10" height="19" rx="2.6" />
      <line x1="10.5" y1="18.5" x2="13.5" y2="18.5" strokeLinecap="round" />
    </svg>
  );
}

function ControllerIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden>
      <path
        d="M7 8h10a4.5 4.5 0 0 1 4.5 4.5 3.2 3.2 0 0 1-5.8 1.9l-.5-.7H8.8l-.5.7A3.2 3.2 0 0 1 2.5 12.5 4.5 4.5 0 0 1 7 8z"
        strokeLinejoin="round"
      />
      <line x1="6.4" y1="11" x2="6.4" y2="13.4" strokeLinecap="round" />
      <line x1="5.2" y1="12.2" x2="7.6" y2="12.2" strokeLinecap="round" />
      <circle cx="15.6" cy="11.4" r="0.95" fill="currentColor" stroke="none" />
      <circle cx="17.6" cy="13" r="0.95" fill="currentColor" stroke="none" />
    </svg>
  );
}

function Segment({
  href,
  active,
  label,
  children,
}: {
  href: string;
  active: boolean;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      aria-label={label}
      title={label}
      className={`flex h-7 w-9 items-center justify-center rounded-full transition-colors ${
        active
          ? "bg-accent text-white"
          : "text-ink-muted hover:text-ink"
      }`}
    >
      {children}
    </Link>
  );
}

export default function TrackSwitcher({ active }: { active: Track }) {
  return (
    <div
      className="inline-flex items-center gap-0.5 rounded-full border border-line bg-surface p-0.5"
      role="group"
      aria-label="Switch between the app checker and the game checker"
    >
      <Segment href="/" active={active === "app"} label="App checker">
        <PhoneIcon />
      </Segment>
      <Segment href="/games" active={active === "game"} label="Game checker">
        <ControllerIcon />
      </Segment>
    </div>
  );
}
