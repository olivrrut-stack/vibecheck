"use client";

import {
  BUILD_TOOLS,
  DATA_PRACTICES,
  DOWNLOADS_CODE_OPTIONS,
  NATIVE_FEATURES,
  WEBVIEW_OPTIONS,
  type Answers,
  type DownloadsCode,
  type WebViewShell,
} from "@/lib/types";
import { useEffect, useRef, useState } from "react";
import Carousel, { type CarouselHandle } from "./Carousel";
import { OptionRow, QuestionCard } from "./QuestionParts";

export default function Questionnaire({
  value,
  onChange,
  onSubmit,
}: {
  value: Answers;
  onChange: (next: Answers) => void;
  onSubmit: () => void;
}) {
  // "Other" is its own radio backed by a free-text input. We can't derive its
  // selected state purely from value.buildTool (a half-typed custom value would
  // flicker the radio off), so track it locally. Initialize on for a restored
  // custom value that isn't one of the listed tools.
  const [otherMode, setOtherMode] = useState(
    value.buildTool !== "" &&
      !(BUILD_TOOLS as readonly string[]).includes(value.buildTool)
  );

  // Auto-advance to the next card after a single-select answer, with a short
  // beat so the selection visibly registers before the gallery slides. Only the
  // single-choice questions advance; multi-selects and free text stay manual.
  const carouselRef = useRef<CarouselHandle>(null);
  const advanceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const advance = () => {
    if (advanceTimer.current) clearTimeout(advanceTimer.current);
    advanceTimer.current = setTimeout(() => carouselRef.current?.next(), 250);
  };
  useEffect(
    () => () => {
      if (advanceTimer.current) clearTimeout(advanceTimer.current);
    },
    []
  );

  const toggle = (key: "dataPractices" | "nativeFeatures", option: string) => {
    const current = value[key];
    const next = current.includes(option)
      ? current.filter((o) => o !== option)
      : [...current, option];
    onChange({ ...value, [key]: next });
  };

  const answeredFlags = [
    value.buildTool !== "",
    value.dataPractices.length > 0,
    value.safariDiff.trim().length > 0,
    value.downloadsCode !== "",
    value.webViewShell !== "",
    value.nativeFeatures.length > 0,
  ];
  const answeredCount = answeredFlags.filter(Boolean).length;
  // Only the "what can your app do that a website can't" answer gates submission.
  const canSubmit = answeredFlags[2];

  const q2Footer = canSubmit ? (
    <span className="flex items-center gap-1.5 font-medium text-risk-low">
      <svg viewBox="0 0 16 16" className="h-3.5 w-3.5" aria-hidden>
        <path
          d="M3.5 8.5l3 3 6-7"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      Ready to run your check
    </span>
  ) : (
    <span className="flex items-center gap-1.5 font-medium text-accent">
      <span className="inline-block h-1.5 w-1.5 rounded-full bg-accent" />
      Answer this to run your check
    </span>
  );

  const cards = [
    <QuestionCard
      key="buildTool"
      index={1}
      title="How did you build your app?"
      footer="Sets the context. VibeCheck is tuned for AI-built apps."
    >
      <div className="grid grid-cols-2 gap-2">
        {BUILD_TOOLS.map((tool) => (
          <OptionRow
            key={tool}
            type="radio"
            name="buildTool"
            label={tool}
            checked={!otherMode && value.buildTool === tool}
            onChange={() => {
              setOtherMode(false);
              onChange({ ...value, buildTool: tool });
              advance();
            }}
          />
        ))}
        <OptionRow
          type="radio"
          name="buildTool"
          label="Other"
          checked={otherMode}
          onChange={() => {
            setOtherMode(true);
            onChange({ ...value, buildTool: "" });
          }}
        />
      </div>
      {otherMode && (
        <input
          type="text"
          value={value.buildTool}
          onChange={(e) => onChange({ ...value, buildTool: e.target.value })}
          maxLength={60}
          placeholder="Which tool did you use?"
          aria-label="The tool you used to build your app"
          className="w-full rounded-lg border border-line-strong bg-surface-2 px-4 py-2.5 text-sm text-ink placeholder:text-ink-faint focus:border-accent"
        />
      )}
    </QuestionCard>,

    <QuestionCard
      key="q1"
      index={2}
      title="Does your app collect data or have accounts?"
      footer="Probes Guideline 5.1.1, privacy and data."
    >
      {DATA_PRACTICES.map((practice) => (
        <OptionRow
          key={practice}
          type="checkbox"
          name="dataPractices"
          label={practice}
          checked={value.dataPractices.includes(practice)}
          onChange={() => toggle("dataPractices", practice)}
        />
      ))}
    </QuestionCard>,

    <QuestionCard
      key="q2"
      index={3}
      title="What can your app do that a website can't?"
      hint="“Looks nice” or “easy to use” don’t count. Apple wants a real reason it must be native."
      footer={q2Footer}
    >
      <textarea
        value={value.safariDiff}
        onChange={(e) => onChange({ ...value, safariDiff: e.target.value })}
        rows={5}
        maxLength={4000}
        placeholder="e.g. it uses the camera, works offline, sends push notifications, accesses health data…"
        className="w-full flex-1 resize-none rounded-lg border border-line-strong bg-surface-2 px-4 py-3 text-sm text-ink placeholder:text-ink-faint focus:border-accent"
      />
    </QuestionCard>,

    <QuestionCard
      key="q3"
      index={4}
      title="Does your app download or run code from the internet?"
      footer="Probes Guideline 2.5.2, code execution. “Yes” is a blocker."
    >
      {DOWNLOADS_CODE_OPTIONS.map((opt) => (
        <OptionRow
          key={opt}
          type="radio"
          name="downloadsCode"
          label={opt}
          checked={value.downloadsCode === opt}
          onChange={() => {
            onChange({ ...value, downloadsCode: opt as DownloadsCode });
            advance();
          }}
        />
      ))}
    </QuestionCard>,

    <QuestionCard
      key="q4"
      index={5}
      title="Is your main screen a website inside the app?"
      footer="Probes Guideline 4.2, the web-wrapper test."
    >
      {WEBVIEW_OPTIONS.map((opt) => (
        <OptionRow
          key={opt}
          type="radio"
          name="webViewShell"
          label={opt}
          checked={value.webViewShell === opt}
          onChange={() => {
            onChange({ ...value, webViewShell: opt as WebViewShell });
            advance();
          }}
        />
      ))}
    </QuestionCard>,

    <QuestionCard
      key="q5"
      index={6}
      title="Which of these does your app use?"
      footer="Real native features count in your favor against 4.2."
    >
      <div className="grid grid-cols-2 gap-2">
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
    </QuestionCard>,

    <QuestionCard
      key="codePaste"
      index={7}
      title="Paste anything suspicious (optional)"
      hint="Info.plist, WebView setup, download logic — anything you're unsure about. Used as primary evidence."
      footer={
        <span className="text-ink-faint">
          Optional. Skip and hit &ldquo;Check my app&rdquo; below if you don&rsquo;t have anything to paste.
        </span>
      }
    >
      <textarea
        value={value.codePaste ?? ""}
        onChange={(e) => onChange({ ...value, codePaste: e.target.value })}
        rows={7}
        maxLength={4000}
        placeholder={"<!-- paste Info.plist, AppDelegate.swift, WKWebView setup, etc. -->"}
        className="w-full flex-1 resize-none rounded-lg border border-line-strong bg-surface-2 px-4 py-3 font-mono text-xs text-ink placeholder:text-ink-faint focus:border-accent"
      />
      {(value.codePaste?.length ?? 0) > 0 && (
        <p className="mt-1.5 text-right font-mono text-[10px] text-ink-faint">
          {value.codePaste?.length ?? 0}/4000
        </p>
      )}
    </QuestionCard>,
  ];

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (canSubmit) onSubmit();
      }}
    >
      <div className="mb-3">
        <div className="flex items-center justify-between">
          <span className="font-display text-[11px] uppercase tracking-[0.16em] text-ink-muted">
            Progress
          </span>
          <span className="font-display text-[11px] tabular-nums text-ink-muted">
            {answeredCount} / 6 answered
          </span>
        </div>
        <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-surface-2">
          <div
            className="h-full rounded-full bg-risk-low transition-all duration-300"
            style={{ width: `${(answeredCount / 6) * 100}%` }}
          />
        </div>
      </div>

      <Carousel
        ref={carouselRef}
        items={cards}
        unitLabel="Question"
        ariaLabel="App questions"
        answered={answeredFlags}
      />

      <div className="mx-auto mt-7 max-w-md">
        <button
          type="submit"
          disabled={!canSubmit}
          className="w-full rounded-full bg-accent px-6 py-4 text-base font-semibold text-white transition-colors hover:opacity-90 disabled:cursor-not-allowed disabled:bg-surface-2 disabled:text-ink-muted"
        >
          Check my app
        </button>
      </div>
    </form>
  );
}
