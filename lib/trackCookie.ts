import { cookies } from "next/headers";
import type { Track } from "./types";

// The section the user is currently browsing, set by CheckerExperience. Shared
// account pages read it so their theme follows the section (app light, game
// dark). Server components only (uses next/headers).
export async function getTrackFromCookie(): Promise<Track> {
  const store = await cookies();
  return store.get("vc_track")?.value === "game" ? "game" : "app";
}
