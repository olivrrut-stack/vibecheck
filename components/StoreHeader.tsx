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
          {/* White phone with a notch and a blue check, matching the favicon. */}
          <svg viewBox="0 0 44 64" className="h-16" aria-hidden>
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
