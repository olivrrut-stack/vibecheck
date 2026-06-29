import type { Track } from "@/lib/types";

// Wraps a page in the game (dark) theme when track === "game", else renders the
// children as-is (app/light). bg-canvas resolves to the dark token inside the
// data-track wrapper, covering the viewport so there's no white edge.
export default function TrackTheme({
  track,
  children,
}: {
  track: Track;
  children: React.ReactNode;
}) {
  if (track !== "game") return <>{children}</>;
  return (
    <div data-track="game" className="min-h-dvh bg-canvas">
      {children}
    </div>
  );
}
