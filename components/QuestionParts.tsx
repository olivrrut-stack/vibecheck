import ScreenshotCard from "./ScreenshotCard";

// Shared building blocks for both the app and game questionnaires: a selectable
// option row (backed by a real checkbox/radio) and the portrait "screenshot"
// question card. `relative` on the label keeps the sr-only input anchored to its
// row so selecting an option never scrolls the page.

export function OptionRow({
  type,
  name,
  label,
  checked,
  onChange,
}: {
  type: "checkbox" | "radio";
  name: string;
  label: string;
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <label
      className={`group relative flex min-h-[44px] cursor-pointer items-center gap-3 rounded-lg border px-4 py-2.5 text-sm transition-colors has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-ink ${
        checked
          ? "border-accent bg-accent/10 text-ink"
          : "border-line bg-transparent text-ink-muted hover:border-line-strong hover:text-ink"
      }`}
    >
      <input
        type={type}
        name={name}
        checked={checked}
        onChange={onChange}
        className="sr-only"
      />
      <span
        aria-hidden
        className={`flex h-4 w-4 shrink-0 items-center justify-center border ${
          type === "radio" ? "rounded-full" : "rounded-[5px]"
        } ${checked ? "border-accent bg-accent" : "border-line-strong"}`}
      >
        {checked &&
          (type === "radio" ? (
            <span className="h-1.5 w-1.5 rounded-full bg-canvas" />
          ) : (
            <svg viewBox="0 0 12 12" className="h-3 w-3 text-canvas">
              <path
                d="M2.5 6.2l2.3 2.3 4.7-5"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          ))}
      </span>
      <span className="leading-snug">{label}</span>
    </label>
  );
}

export function QuestionCard({
  index,
  title,
  hint,
  footer,
  children,
}: {
  index: number;
  title: string;
  hint?: string;
  /** One-line note pinned to the card's bottom edge naming the guideline. */
  footer: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <ScreenshotCard eyebrow={`Question ${index} of 6${index === 3 ? " · Key" : ""}`}>
      <fieldset className="flex flex-1 flex-col">
        <legend className="text-[17px] font-semibold leading-snug text-ink">
          {title}
        </legend>
        {hint && (
          <p className="mt-2 text-xs leading-relaxed text-ink-muted">{hint}</p>
        )}
        <div className="mt-4 flex flex-1 flex-col gap-2">{children}</div>
        <p className="mt-4 border-t border-line pt-3 text-[11px] leading-snug text-ink-faint">
          {footer}
        </p>
      </fieldset>
    </ScreenshotCard>
  );
}
