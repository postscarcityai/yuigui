import DocShell from "../components/DocShell";

export const metadata = {
  title: "Reactions | Yui",
  description: "Hold a message from your agent and react. What each of the six reactions tells the agent to do, and how it reaches the agent.",
};

// What each reaction means (spec/REACTIONS.md, the single source). `npm run sync` copies it.
export default function Reactions() {
  return <DocShell slug="reactions" eyebrow={<>Developers | Reactions | rendered from spec/REACTIONS.md | agents get it in the <a href="/channel">channel guide</a></>} />;
}
