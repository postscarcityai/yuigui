// Copies files from the repo root into content/ so Vercel (which only uploads site/) can read them.
import { copyFileSync, existsSync, mkdirSync, readdirSync } from "node:fs";
for (const [from, to] of [["../../ROADMAP.md", "ROADMAP.md"], ["../../spec/YL.md", "YL.md"], ["../../spec/CHANNEL.md", "CHANNEL.md"], ["../../spec/channel-eval/RESULTS.md", "CHANNEL-RESULTS.md"]]) {
  const src = new URL(from, import.meta.url);
  const dst = new URL(`../content/${to}`, import.meta.url);
  if (existsSync(src)) { copyFileSync(src, dst); console.log(`synced ${to}`); }
  else console.log(`${from} not found, using committed copy`);
}
// Business docs (docs/business/*.md) render at /business.
const biz = new URL("../../docs/business/", import.meta.url);
if (existsSync(biz)) {
  mkdirSync(new URL("../content/business/", import.meta.url), { recursive: true });
  for (const f of readdirSync(biz).filter((f) => f.endsWith(".md"))) {
    copyFileSync(new URL(f, biz), new URL(`../content/business/${f}`, import.meta.url));
    console.log(`synced business/${f}`);
  }
} else console.log("docs/business not found, using committed copies");
