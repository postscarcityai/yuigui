import { readFileSync } from "node:fs";
import path from "node:path";
import DocShell from "../components/DocShell";
import Examples from "./Examples";
import { findSample, sampleSlug, cleanYL, shareItem, shareUrl } from "../../lib/share.mjs";

export const metadata = {
  title: "Channel guide | Yui",
  description: "The guide every agent gets on the Yui channel: how to answer with screens, taps, reactions, plans, screens 2 and 3, and saved screens.",
};

// Lines taken from spec/CHANNEL.md, plus the playground samples that show the rest.
const LINES = [
  ['pick "What do you have?" Dumbbells|Barbell|Bands|"Pull-up bar" +other', "Gear as taps, with +other for the rest."],
  ['choose "Where?" "Camera roll"|Drafts|"Sent already"', "Options are one token joined by |. Quote the ones with spaces."],
  ['card "Sunday plan" body="3 sessions, 40 min" cta="Start"', "One highlight. The button does something."],
];
const SAMPLES = [
  ["plan-findings", "plan", "Findings, then questions, in one plan. One submit at the end."],
  ["Demo: screens (>) and save/show", ">2", "Screens 2 and 3 sit beside the chat. The playground has the tabs."],
  ["shelf", "save", "save puts a screen on the shelf. show brings it back, forget takes it off."],
];

function examples() {
  const out = LINES.map(([yl, what]) => ({ key: yl, title: yl, what, yl, agent: "Coach", play: `/playground?yl=${encodeURIComponent(yl)}`, share: null }));
  for (const [k, head, what] of SAMPLES) {
    const s = findSample(k);
    if (!s) continue;
    const slug = sampleSlug(s);
    const yl = cleanYL(s.yl);
    out.push({
      key: slug, title: yl.split("\n").find((l) => l.startsWith(head)) || yl.split("\n")[0], what, yl, agent: s.agent || "Yui",
      play: s.slug ? `/playground?demo=${s.slug}` : `/playground?yl=${encodeURIComponent(yl)}`,
      share: shareItem(`try-${slug}`) ? shareUrl(`try-${slug}`) : null,
    });
  }
  return out;
}

// The guide text every agent gets on the Yui channel (spec/CHANNEL.md), and
// the eval that scores it (spec/channel-eval/RESULTS.md). `npm run sync` copies both.
export default function ChannelGuide() {
  const results = readFileSync(path.join(process.cwd(), "content", "CHANNEL-RESULTS.md"), "utf8");
  return (
    <>
      <Examples items={examples()} />
      <DocShell
        slug="channel"
        after={results}
        eyebrow="Developers | Channel guide | rendered from spec/CHANNEL.md"
        links={[["/yl", "Yui Lines spec"], ["/playground", "Playground"], ["/reactions", "Reactions"], ["/start", "Connect your agent"]]}
      />
    </>
  );
}
