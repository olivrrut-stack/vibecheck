import type { Metadata } from "next";
import CheckerExperience from "@/components/CheckerExperience";

export const metadata: Metadata = {
  title: "VibeCheck for games: App Store rejection risk checker",
  description:
    "Find out if your AI-built game will get rejected before Apple does. Free check, with deep fixes for $7.99. IP, loot boxes, gambling, kids, and more.",
};

// Game-dev track (dark theme). The data-track wrapper flips the color tokens and
// darkens the page background so the whole checker reuses as-is.
export default function GamesPage() {
  return (
    <div data-track="game">
      <CheckerExperience track="game" />
    </div>
  );
}
