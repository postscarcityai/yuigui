// Copies files from the repo root into content/ so Vercel (which only uploads site/) can read them.
import { copyFileSync, existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { findDocLeak } from "../lib/public-guard.mjs";
import { lint, readThought } from "../lib/thoughts.mjs";
for (const [from, to] of [["../../ROADMAP.md", "ROADMAP.md"], ["../../spec/channel-eval/RESULTS.md", "CHANNEL-RESULTS.md"]]) {
  const src = new URL(from, import.meta.url);
  const dst = new URL(`../content/${to}`, import.meta.url);
  if (existsSync(src)) { copyFileSync(src, dst); console.log(`synced ${to}`); }
  else console.log(`${from} not found, using committed copy`);
}
// Every spec (spec/*.md) renders under Developers (SITE-15), business docs (docs/business/*.md)
// at /business, thoughts (docs/thoughts/*.md, SITE-30) at /thoughts. Drafts in docs/thoughts/drafts/ stay put.
for (const [from, name] of [["../../spec/", "spec"], ["../../docs/business/", "business"], ["../../docs/thoughts/", "thoughts"]]) {
  const src = new URL(from, import.meta.url);
  if (!existsSync(src)) { console.log(`${from} not found, using committed copies`); continue; }
  mkdirSync(new URL(`../content/${name}/`, import.meta.url), { recursive: true });
  for (const f of readdirSync(src).filter((f) => f.endsWith(".md"))) {
    // A spec is published word for word, so a private name or a machine path stops the sync.
    const text = readFileSync(new URL(f, src), "utf8");
    const leak = (name === "spec" || name === "thoughts") && findDocLeak(text);
    if (leak) { console.error(`${name}/${f}: ${leak[0]} "${leak[1]}" must not reach the site`); process.exit(1); }
    // A thought opens with a visual and never runs long between visuals (lib/thoughts.mjs).
    const broke = name === "thoughts" && lint(readThought(f, text));
    if (broke?.length) { console.error(`thoughts/${f}: ${broke.join("; ")}`); process.exit(1); }
    copyFileSync(new URL(f, src), new URL(`../content/${name}/${f}`, import.meta.url));
    console.log(`synced ${name}/${f}`);
  }
}
// The community gallery (OSS-5): only entries that pass community/check.mjs reach the site,
// so one bad merge can never break a deploy. CI blocks them at the pull request anyway.
{
  const src = new URL("../../community/gallery.json", import.meta.url);
  if (!existsSync(src)) console.log("community/gallery.json not found, using committed copy");
  else {
    const { checkEntry } = await import("../../community/check.mjs");
    const g = JSON.parse(readFileSync(src, "utf8"));
    const entries = g.entries.filter((e) => {
      const p = checkEntry(e);
      if (p.length) console.warn(`gallery: skipped ${e.id}: ${p.join("; ")}`);
      return !p.length;
    });
    writeFileSync(new URL("../content/gallery.json", import.meta.url), `${JSON.stringify({ ...g, entries }, null, 2)}\n`);
    console.log(`synced gallery.json (${entries.length} entries)`);
  }
}
