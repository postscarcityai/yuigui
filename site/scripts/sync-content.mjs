// Copies files from the repo root into content/ so Vercel (which only uploads site/) can read them.
import { copyFileSync, existsSync, mkdirSync, readFileSync, readdirSync } from "node:fs";
import { findDocLeak } from "../lib/public-guard.mjs";
for (const [from, to] of [["../../ROADMAP.md", "ROADMAP.md"], ["../../spec/channel-eval/RESULTS.md", "CHANNEL-RESULTS.md"]]) {
  const src = new URL(from, import.meta.url);
  const dst = new URL(`../content/${to}`, import.meta.url);
  if (existsSync(src)) { copyFileSync(src, dst); console.log(`synced ${to}`); }
  else console.log(`${from} not found, using committed copy`);
}
// Every spec (spec/*.md) renders under Developers (SITE-15), business docs (docs/business/*.md)
// at /business, notes (docs/notes/*.md) at /notes.
for (const [from, name] of [["../../spec/", "spec"], ["../../docs/business/", "business"], ["../../docs/notes/", "notes"]]) {
  const src = new URL(from, import.meta.url);
  if (!existsSync(src)) { console.log(`${from} not found, using committed copies`); continue; }
  mkdirSync(new URL(`../content/${name}/`, import.meta.url), { recursive: true });
  for (const f of readdirSync(src).filter((f) => f.endsWith(".md"))) {
    // A spec is published word for word, so a private name or a machine path stops the sync.
    const leak = name === "spec" && findDocLeak(readFileSync(new URL(f, src), "utf8"));
    if (leak) { console.error(`spec/${f}: ${leak[0]} "${leak[1]}" must not reach the site`); process.exit(1); }
    copyFileSync(new URL(f, src), new URL(`../content/${name}/${f}`, import.meta.url));
    console.log(`synced ${name}/${f}`);
  }
}
