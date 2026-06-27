"use client";

import {
  BUILD_TOOLS,
  DOWNLOADS_CODE_OPTIONS,
  NATIVE_FEATURES,
  WEBVIEW_OPTIONS,
  type Answers,
  type DownloadsCode,
  type WebViewShell,
} from "@/lib/types";

function Question({
  index,
  title,
  emphasis = false,
  children,
}: {
  index: number;
  title: string;
  emphasis?: boolean;
  children: React.ReactNode;
}) {
  return (
    <fieldset
      aria-labelledby={`q${index}-num q${index}-title`}
      className={`rounded-[var(--radius-card)] border bg-surface p-5 sm:p-6 ${
        emphasis ? "border-line-strong" : "border-line"
      }`}
    >
      <legend className="flex items-baseline gap-2 px-1">
        <span
          id={`q${index}-num`}
          className="font-mono text-xs font-medium text-ink-faint"
        >
          Q{index}
        </span>
      </legend>
      <p
        id={`q${index}-title`}
        className="text-base font-medium text-ink sm:text-[17px]"
      >
        {title}
      </p>
      <div className="mt-4">{children}</div>
    </fieldset>
  );
}

/** Selectable option row backed by a real checkbox/radio for accessibility. */
function OptionRow({
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
      className={`group flex cursor-pointer items-center gap-3 rounded-lg border px-4 py-3 text-sm transition-colors has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-ink ${
        checked
          ? "border-line-strong bg-surface-2 text-ink"
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
        } ${checked ? "border-ink bg-ink" : "border-line-strong"}`}
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

export default function Questionnaire({
  value,
  onChange,
  onSubmit,
}: {
  value: Answers;
  onChange: (next: Answers) => void;
  onSubmit: () => void;
}) {
  const toggle = (key: "buildTools" | "nativeFeatures", option: string) => {
    const current = value[key];
    const next = current.includes(option)
      ? current.filter((o) => o !== option)
      : [...current, option];
    onChange({ ...value, [key]: next });
  };

  const canSubmit = value.safariDiff.trim().length > 0;

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (canSubmit) onSubmit();
      }}
      className="space-y-5"
    >
      <Question index={1} title="How did you build your app?">
        <div className="grid gap-2 sm:grid-cols-2">
          {BUILD_TOOLS.map((tool) => (
            <OptionRow
              key={tool}
              type="checkbox"
              name="buildTools"
              label={tool}
              checked={value.buildTools.includes(tool)}
              onChange={() => toggle("buildTools", tool)}
            />
          ))}
        </div>
      </Question>

      <Question
        index={2}
        emphasis
        title="What does your app do that someone couldn't just do in Safari?"
      >
        <textarea
          value={value.safariDiff}
          onChange={(e) => onChange({ ...value, safariDiff: e.target.value })}
          rows={4}
          placeholder="e.g. it uses the camera, works offline, sends push notifications, accesses health data..."
          className="w-full resize-y rounded-lg border border-line-strong bg-canvas px-4 py-3 text-sm text-ink placeholder:text-ink-faint focus:border-ink"
        />
        <p className="mt-2.5 text-xs leading-relaxed text-ink-muted">
          <span className="font-medium text-ink">Tip:</span> &ldquo;it looks
          nice&rdquo; or &ldquo;it&rsquo;s easy to use&rdquo; are not valid
          answers here. Apple wants to know why it needs to be a native app and
          not just a website.
        </p>
      </Question>

      <Question
        index={3}
        title="Does your app download or execute any code from the internet while it's running?"
      >
        <div className="grid gap-2 sm:grid-cols-3">
          {DOWNLOADS_CODE_OPTIONS.map((opt) => (
            <OptionRow
              key={opt}
              type="radio"
              name="downloadsCode"
              label={opt}
              checked={value.downloadsCode === opt}
              onChange={() =>
                onChange({ ...value, downloadsCode: opt as DownloadsCode })
              }
            />
          ))}
        </div>
      </Question>

      <Question
        index={4}
        title="Is your app's main screen a website or web content loaded inside the app?"
      >
        <div className="grid gap-2">
          {WEBVIEW_OPTIONS.map((opt) => (
            <OptionRow
              key={opt}
              type="radio"
              name="webViewShell"
              label={opt}
              checked={value.webViewShell === opt}
              onChange={() =>
                onChange({ ...value, webViewShell: opt as WebViewShell })
              }
            />
          ))}
        </div>
      </Question>

      <Question index={5} title="Which of these does your app actually use?">
        <div className="grid gap-2 sm:grid-cols-2">
          {NATIVE_FEATURES.map((feature) => (
            <OptionRow
              key={feature}
              type="checkbox"
              name="nativeFeatures"
              label={feature}
              checked={value.nativeFeatures.includes(feature)}
              onChange={() => toggle("nativeFeatures", feature)}
            />
          ))}
        </div>
      </Question>

      <div className="pt-1">
        <button
          type="submit"
          disabled={!canSubmit}
          className="w-full rounded-xl bg-ink px-6 py-4 text-base font-semibold text-canvas transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Check my app
        </button>
        {!canSubmit && (
          <p className="mt-2.5 text-center text-xs text-ink-faint">
            Answer Q2 to run the check — it&rsquo;s the question Apple cares about
            most.
          </p>
        )}
      </div>
    </form>
  );
}
