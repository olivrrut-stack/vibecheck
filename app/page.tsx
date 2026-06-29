import CheckerExperience from "@/components/CheckerExperience";

// App-dev track (light theme). The whole experience lives in CheckerExperience,
// shared with the game-dev track at /games.
export default function Home() {
  return <CheckerExperience track="app" />;
}
