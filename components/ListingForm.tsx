"use client";

import type { ListingAnswers } from "@/lib/types";

function CharCounter({ value, max }: { value: string; max: number }) {
  const over = value.length > max;
  return (
    <span
      className={`text-xs tabular-nums transition-colors ${over ? "font-semibold text-[var(--color-risk-high)]" : "text-ink-faint"}`}
    >
      {value.length}/{max}
    </span>
  );
}

const inputCls =
  "w-full rounded-lg border border-line bg-surface-2 px-3.5 py-2.5 text-sm text-ink placeholder:text-ink-faint focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20 transition-colors";

export default function ListingForm({
  value,
  onChange,
  onSubmit,
}: {
  value: ListingAnswers;
  onChange: (next: ListingAnswers) => void;
  onSubmit: () => void;
}) {
  const canSubmit =
    value.appName.trim().length > 0 ||
    value.keywords.trim().length > 0 ||
    value.description.trim().length > 0;

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (canSubmit) onSubmit();
      }}
      className="space-y-4"
    >
      {/* App name */}
      <div className="rounded-[var(--radius-card)] border border-line bg-surface p-5 shadow-card">
        <div className="mb-2.5 flex items-baseline justify-between gap-2">
          <label className="text-sm font-semibold text-ink">App name</label>
          <CharCounter value={value.appName} max={30} />
        </div>
        <input
          type="text"
          className={inputCls}
          placeholder="e.g. Focus Timer Pro"
          value={value.appName}
          onChange={(e) => onChange({ ...value, appName: e.target.value })}
          maxLength={80}
        />
      </div>

      {/* Subtitle */}
      <div className="rounded-[var(--radius-card)] border border-line bg-surface p-5 shadow-card">
        <div className="mb-2.5 flex items-baseline justify-between gap-2">
          <label className="text-sm font-semibold text-ink">Subtitle</label>
          <CharCounter value={value.subtitle} max={30} />
        </div>
        <input
          type="text"
          className={inputCls}
          placeholder="e.g. Deep work and Pomodoro sessions"
          value={value.subtitle}
          onChange={(e) => onChange({ ...value, subtitle: e.target.value })}
          maxLength={80}
        />
      </div>

      {/* Keywords */}
      <div className="rounded-[var(--radius-card)] border border-line bg-surface p-5 shadow-card">
        <div className="mb-2.5 flex items-baseline justify-between gap-2">
          <label className="text-sm font-semibold text-ink">Keywords</label>
          <CharCounter value={value.keywords} max={100} />
        </div>
        <input
          type="text"
          className={inputCls}
          placeholder="e.g. focus,timer,pomodoro,productivity,work"
          value={value.keywords}
          onChange={(e) => onChange({ ...value, keywords: e.target.value })}
          maxLength={200}
        />
        <p className="mt-1.5 text-xs text-ink-faint">
          Comma-separated, exactly as you&apos;d enter them in App Store Connect
        </p>
      </div>

      {/* Promotional text */}
      <div className="rounded-[var(--radius-card)] border border-line bg-surface p-5 shadow-card">
        <div className="mb-2.5 flex items-baseline justify-between gap-2">
          <label className="text-sm font-semibold text-ink">Promotional text</label>
          <span className="text-xs text-ink-faint">optional</span>
        </div>
        <textarea
          className={`${inputCls} resize-none`}
          rows={3}
          placeholder="The short blurb shown above your description (170 chars max in App Store Connect)"
          value={value.promoText}
          onChange={(e) => onChange({ ...value, promoText: e.target.value })}
          maxLength={500}
        />
      </div>

      {/* Description */}
      <div className="rounded-[var(--radius-card)] border border-line bg-surface p-5 shadow-card">
        <div className="mb-2.5 flex items-baseline justify-between gap-2">
          <label className="text-sm font-semibold text-ink">Description</label>
          <span className="text-xs text-ink-faint">optional</span>
        </div>
        <textarea
          className={`${inputCls} resize-none`}
          rows={6}
          placeholder="Paste your full App Store description here"
          value={value.description}
          onChange={(e) => onChange({ ...value, description: e.target.value })}
          maxLength={4000}
        />
      </div>

      <button
        type="submit"
        disabled={!canSubmit}
        className="w-full rounded-full bg-accent px-6 py-4 text-base font-semibold text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
      >
        Check my listing
      </button>
    </form>
  );
}
