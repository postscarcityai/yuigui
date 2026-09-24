import { readFileSync } from "node:fs";
import path from "node:path";
import DocShell from "../components/DocShell";

export const metadata = { title: "Channel guide | Yui" };

// The guide text every agent gets on the Yui channel (spec/CHANNEL.md), and
// the eval that scores it (spec/channel-eval/RESULTS.md). `npm run sync` copies both.
export default function ChannelGuide() {
  const results = readFileSync(path.join(process.cwd(), "content", "CHANNEL-RESULTS.md"), "utf8");
  return <DocShell slug="channel" after={results} eyebrow={<>Developers | Channel guide | rendered from spec/CHANNEL.md | grammar in the <a href="/yl">YL spec</a></>} />;
}
