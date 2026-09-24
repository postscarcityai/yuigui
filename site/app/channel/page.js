import { readFileSync } from "node:fs";
import path from "node:path";
import { renderMd } from "../../lib/md.mjs";

export const metadata = { title: "Channel guide | Yui" };

// The guide text every agent gets on the Yui channel (spec/CHANNEL.md), and
// the eval that scores it (spec/channel-eval/RESULTS.md). `npm run sync` copies both.
export default function ChannelGuide() {
  const read = (f) => readFileSync(path.join(process.cwd(), "content", f), "utf8");
  const guide = read("CHANNEL.md");
  const results = read("CHANNEL-RESULTS.md");
  return (
    <>
      <div className="eyebrow">Spec | rendered from spec/CHANNEL.md | grammar in the <a href="/yl">YL spec</a></div>
      <article className="md" dangerouslySetInnerHTML={{ __html: renderMd(guide) }} />
      <article className="md" dangerouslySetInnerHTML={{ __html: renderMd(results) }} />
    </>
  );
}
