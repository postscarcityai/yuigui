// Copies files from the repo root into content/ so Vercel (which only uploads site/) can read them.
import { copyFileSync, existsSync } from "node:fs";
for (const [from, to] of [["../../ROADMAP.md", "ROADMAP.md"], ["../../spec/YL.md", "YL.md"]]) {
  const src = new URL(from, import.meta.url);
  const dst = new URL(`../content/${to}`, import.meta.url);
  if (existsSync(src)) { copyFileSync(src, dst); console.log(`synced ${to}`); }
  else console.log(`${from} not found, using committed copy`);
}
