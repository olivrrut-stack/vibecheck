import AppIcon, { VIBE_GRADIENT } from "./AppIcon";
import MetaStrip from "./MetaStrip";

// The VibeCheck "product page" header — icon, title, developer line, a decorative
// price pill where the App Store "Get" button lives, and the metadata strip.
// This is the chrome that frames the questionnaire as an App Store listing.
export default function StoreHeader() {
  return (
    <header>
      <div className="flex items-start gap-4 sm:gap-5">
        <AppIcon gradient={VIBE_GRADIENT} size="lg">
          {/* Brand check mark, drawn so it matches the favicon exactly. */}
          <svg viewBox="0 0 24 24" className="h-10 w-10" aria-hidden>
            <path
              d="M5 12.5l4.5 4.5L19 7.5"
              fill="none"
              stroke="white"
              strokeWidth="2.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </AppIcon>

        <div className="min-w-0 flex-1 pt-0.5">
          <h1 className="truncate text-xl font-bold tracking-tight text-ink sm:text-2xl">
            VibeCheck
          </h1>
          <p className="mt-0.5 text-sm text-accent">
            App Store Rejection Risk Checker
          </p>
          <div className="mt-3">
            <span className="inline-flex rounded-full bg-accent px-6 py-1.5 text-sm font-semibold text-white">
              FREE
            </span>
          </div>
        </div>
      </div>

      <p className="mt-5 max-w-xl text-[15px] leading-snug text-ink sm:text-base">
        Know what Apple will flag, while every fix still takes minutes.
      </p>

      <div className="mt-5 border-y border-line py-4">
        <MetaStrip
          cells={[
            { value: "FREE", label: "Price" },
            { value: "5", label: "Questions" },
            { value: "~10s", label: "Result" },
            { value: "0", label: "Accounts" },
            { value: "AI", label: "Reviewer" },
          ]}
        />
      </div>
    </header>
  );
}
