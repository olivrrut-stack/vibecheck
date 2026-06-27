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
import Carousel from "./Carousel";
import ScreenshotCard from "./ScreenshotCard";

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
      className={`group flex cursor-pointer items-center gap-3 rounded-lg border px-4 py-2.5 text-sm transition-colors has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-ink ${
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

/** One question rendered as a portrait screenshot card. */
function QuestionCard({
  index,
  title,
  hint,
  footer,
  children,
}: {
  index: number;
  title: string;
  hint?: string;
  /** One-line note pinned to the card's bottom edge — fills the frame and says
   *  which guideline the question maps to. */
  footer: string;
  children: React.ReactNode;
}) {
  return (
    <ScreenshotCard eyebrow={`Question ${index} of 5${index === 2 ? " · Key" : ""}`}>
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

  const cards = [
    <QuestionCard
      key="q1"
      index={1}
      title="How did you build your app?"
      footer="Context for your review — not scored on its own."
    >
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
    </QuestionCard>,

    <QuestionCard
      key="q2"
      index={2}
      title="What does your app do that someone couldn't just do in Safari?"
      hint="“It looks nice” or “it’s easy to use” aren’t valid answers. Apple wants to know why it has to be a native app and not just a website."
      footer="The single biggest factor in your risk score."
    >
      <textarea
        value={value.safariDiff}
        onChange={(e) => onChange({ ...value, safariDiff: e.target.value })}
        rows={5}
        maxLength={4000}
        placeholder="e.g. it uses the camera, works offline, sends push notifications, accesses health data…"
        className="w-full flex-1 resize-none rounded-lg border border-line-strong bg-canvas px-4 py-3 text-sm text-ink placeholder:text-ink-faint focus:border-ink"
      />
    </QuestionCard>,

    <QuestionCard
      key="q3"
      index={3}
      title="Does your app download or execute any code from the internet while it’s running?"
      footer="Probes Guideline 2.5.2 — code execution. “Yes” is a blocker."
    >
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
    </QuestionCard>,

    <QuestionCard
      key="q4"
      index={4}
      title="Is your app’s main screen a website or web content loaded inside the app?"
      footer="Probes Guideline 4.2 — the web-wrapper test."
    >
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
    </QuestionCard>,

    <QuestionCard
      key="q5"
      index={5}
      title="Which of these does your app actually use?"
      footer="Real native features count in your favor against 4.2."
    >
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
    </QuestionCard>,
  ];

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (canSubmit) onSubmit();
      }}
    >
      <Carousel items={cards} unitLabel="Question" ariaLabel="App questions" />

      <div className="mt-7">
        <button
          type="submit"
          disabled={!canSubmit}
          className="w-full rounded-full bg-accent px-6 py-4 text-base font-semibold text-white transition-colors hover:opacity-90 disabled:cursor-not-allowed disabled:bg-surface-2 disabled:text-ink-muted"
        >
          Check my app
        </button>
        {!canSubmit && (
          <p className="mt-2.5 text-center text-xs text-ink-faint">
            Answer Question 2 to run the check — it’s the one Apple cares about
            most.
          </p>
        )}
      </div>
    </form>
  );
}
