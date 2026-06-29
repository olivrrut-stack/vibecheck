"use client";

import {
  EXISTING_IP_OPTIONS,
  GAME_AUDIENCE_DATA,
  GAME_BUILD_TOOLS,
  GAME_GAMBLING_OPTIONS,
  GAME_MONETIZATION,
  type GameAnswers,
  type GameGambling,
} from "@/lib/types";
import { useState } from "react";
import Carousel from "./Carousel";
import { OptionRow, QuestionCard } from "./QuestionParts";

type MultiKey = "existingIP" | "monetization" | "audienceData";

export default function GameQuestionnaire({
  value,
  onChange,
  onSubmit,
}: {
  value: GameAnswers;
  onChange: (next: GameAnswers) => void;
  onSubmit: () => void;
}) {
  const [otherMode, setOtherMode] = useState(
    value.buildTool !== "" &&
      !(GAME_BUILD_TOOLS as readonly string[]).includes(value.buildTool)
  );

  const toggle = (key: MultiKey, option: string) => {
    const current = value[key];
    const next = current.includes(option)
      ? current.filter((o) => o !== option)
      : [...current, option];
    onChange({ ...value, [key]: next });
  };

  const answeredFlags = [
    value.buildTool !== "",
    value.existingIP.length > 0,
    value.originality.trim().length > 0,
    value.monetization.length > 0,
    value.gambling !== "",
    value.audienceData.length > 0,
  ];
  const answeredCount = answeredFlags.filter(Boolean).length;
  const canSubmit = answeredFlags[2];

  const q3Footer = canSubmit ? (
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
      title="How did you build your game?"
      footer="Sets the context. VibeCheck is tuned for AI-built games."
    >
      <div className="grid grid-cols-2 gap-2">
        {GAME_BUILD_TOOLS.map((tool) => (
          <OptionRow
            key={tool}
            type="radio"
            name="buildTool"
            label={tool}
            checked={!otherMode && value.buildTool === tool}
            onChange={() => {
              setOtherMode(false);
              onChange({ ...value, buildTool: tool });
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
          placeholder="Which engine or tool did you use?"
          aria-label="The tool you used to build your game"
          className="w-full rounded-lg border border-line-strong bg-surface-2 px-4 py-2.5 text-sm text-ink placeholder:text-ink-faint focus:border-accent"
        />
      )}
    </QuestionCard>,

    <QuestionCard
      key="existingIP"
      index={2}
      title="Does it use characters, art, music, or names from existing games or brands?"
      footer="Probes Guideline 5.2 and 4.1, intellectual property."
    >
      {EXISTING_IP_OPTIONS.map((opt) => (
        <OptionRow
          key={opt}
          type="checkbox"
          name="existingIP"
          label={opt}
          checked={value.existingIP.includes(opt)}
          onChange={() => toggle("existingIP", opt)}
        />
      ))}
    </QuestionCard>,

    <QuestionCard
      key="originality"
      index={3}
      title="What makes your game original and worth playing?"
      hint="“It’s fun” or “like [popular game]” won’t cut it. Apple rejects clones and thin games."
      footer={q3Footer}
    >
      <textarea
        value={value.originality}
        onChange={(e) => onChange({ ...value, originality: e.target.value })}
        rows={5}
        maxLength={4000}
        placeholder="e.g. a rhythm roguelike where the level layout is generated from the song you pick…"
        className="w-full flex-1 resize-none rounded-lg border border-line-strong bg-surface-2 px-4 py-3 text-sm text-ink placeholder:text-ink-faint focus:border-accent"
      />
    </QuestionCard>,

    <QuestionCard
      key="monetization"
      index={4}
      title="How does your game make money?"
      footer="Probes Guideline 3.1.1, in-app purchase and loot box odds."
    >
      {GAME_MONETIZATION.map((opt) => (
        <OptionRow
          key={opt}
          type="checkbox"
          name="monetization"
          label={opt}
          checked={value.monetization.includes(opt)}
          onChange={() => toggle("monetization", opt)}
        />
      ))}
    </QuestionCard>,

    <QuestionCard
      key="gambling"
      index={5}
      title="Does it involve gambling, betting, or casino-style chance?"
      footer="Probes Guideline 5.3, gaming, gambling, and lotteries."
    >
      {GAME_GAMBLING_OPTIONS.map((opt) => (
        <OptionRow
          key={opt}
          type="radio"
          name="gambling"
          label={opt}
          checked={value.gambling === opt}
          onChange={() =>
            onChange({ ...value, gambling: opt as GameGambling })
          }
        />
      ))}
    </QuestionCard>,

    <QuestionCard
      key="audienceData"
      index={6}
      title="Who is it for, and what does it collect?"
      footer="Probes Guideline 5.1.4 Kids and 5.1.1 data."
    >
      <div className="grid grid-cols-2 gap-2">
        {GAME_AUDIENCE_DATA.map((opt) => (
          <OptionRow
            key={opt}
            type="checkbox"
            name="audienceData"
            label={opt}
            checked={value.audienceData.includes(opt)}
            onChange={() => toggle("audienceData", opt)}
          />
        ))}
      </div>
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
        items={cards}
        unitLabel="Question"
        ariaLabel="Game questions"
        answered={answeredFlags}
      />

      <div className="mx-auto mt-7 max-w-md">
        <button
          type="submit"
          disabled={!canSubmit}
          className="w-full rounded-full bg-accent px-6 py-4 text-base font-semibold text-white transition-colors hover:opacity-90 disabled:cursor-not-allowed disabled:bg-surface-2 disabled:text-ink-muted"
        >
          Check my game
        </button>
      </div>
    </form>
  );
}
