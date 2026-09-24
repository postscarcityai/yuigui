// Copies files from the repo root into content/ so Vercel (which only uploads site/) can read them.
import { copyFileSync, existsSync, mkdirSync, readdirSync } from "node:fs";
for (const [from, to] of [["../../ROADMAP.md", "ROADMAP.md"], ["../../spec/YL.md", "YL.md"], ["../../spec/CHANNEL.md", "CHANNEL.md"], ["../../spec/REACTIONS.md", "REACTIONS.md"], ["../../spec/channel-eval/RESULTS.md", "CHANNEL-RESULTS.md"]]) {
  const src = new URL(from, import.meta.url);
  const dst = new URL(`../content/${to}`, import.meta.url);
  if (existsSync(src)) { copyFileSync(src, dst); console.log(`synced ${to}`); }
  else console.log(`${from} not found, using committed copy`);
}
// Business docs (docs/business/*.md) render at /business, notes (docs/notes/*.md) at /notes.
for (const name of ["business", "notes"]) {
  const src = new URL(`../../docs/${name}/`, import.meta.url);
  if (!existsSync(src)) { console.log(`docs/${name} not found, using committed copies`); continue; }
  mkdirSync(new URL(`../content/${name}/`, import.meta.url), { recursive: true });
  for (const f of readdirSync(src).filter((f) => f.endsWith(".md"))) {
    copyFileSync(new URL(f, src), new URL(`../content/${name}/${f}`, import.meta.url));
    console.log(`synced ${name}/${f}`);
  }
}
