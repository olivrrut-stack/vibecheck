import Link from "next/link";
import type { Track } from "@/lib/types";

// Top-right toggle between the app-dev checker (phone, light) and the game-dev
// checker (controller, dark). The active side is filled with the track accent.
function PhoneIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
      <rect x="7" y="2.5" width="10" height="19" rx="2.6" />
      {/* notch at the top */}
      <line x1="10.4" y1="4.7" x2="13.6" y2="4.7" strokeLinecap="round" />
    </svg>
  );
}

// Top-down view of a gamepad: rounded body with two lower grips, a d-pad cross
// on the left and two action buttons on the right.
function ControllerIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-[18px] w-[18px]"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M8 8h8a5 5 0 0 1 5 5c0 1.66-1.34 3-3 3-1.02 0-1.92-.51-2.46-1.29L14.8 14H9.2l-.74.71A2.98 2.98 0 0 1 6 16c-1.66 0-3-1.34-3-3a5 5 0 0 1 5-5z" />
      <path d="M6.4 11.5v2M5.4 12.5h2" />
      <circle cx="15" cy="11.4" r="0.75" fill="currentColor" stroke="none" />
      <circle cx="16.9" cy="13" r="0.75" fill="currentColor" stroke="none" />
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
