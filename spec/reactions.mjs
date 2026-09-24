// Writes the "Reactions" section of spec/CHANNEL.md from the table in
// spec/REACTIONS.md, the single source for what each reaction means.
//
//   node spec/reactions.mjs            rewrite the section
//   node spec/reactions.mjs --check    exit 1 if CHANNEL.md (or the app's list) is out of step
//
// The app keeps the same six in Yui/Sources/Chat/Reactions.swift. When the app
// repo sits next to this one (../yui), --check also confirms every emoji and
// meaning there matches.

import { existsSync, readFileSync, writeFileSync } from "node:fs";

const SPEC = new URL("./REACTIONS.md", import.meta.url);
const CHANNEL = new URL("./CHANNEL.md", import.meta.url);
const APP = new URL("../../yui/Yui/Sources/Chat/Reactions.swift", import.meta.url);
const HEAD = "## Reactions";
const BEFORE = "## Change what is already on screen";

export function reactions(md = readFileSync(SPEC, "utf8")) {
  const table = md.split("<!-- reactions:table")[1]?.split("<!-- /reactions:table -->")[0];
  if (!table) throw new Error("REACTIONS.md has no reactions:table block");
  const rows = table.split("\n").filter((l) => l.startsWith("|")).slice(2);
  return rows.map((l) => {
    const [emoji, meaning, does] = l.split("|").slice(1, -1).map((c) => c.trim());
    if (!emoji || !meaning || !does) throw new Error(`bad row: ${l}`);
    return { emoji, meaning, does };
  });
}

export function section(list) {
  const q = (m) => (/\s/.test(m) ? `"${m}"` : m);
  return [
    HEAD,
    "",
    `They can long-press your message and react. It arrives as \`[yui] react msg=<id> emoji=${list[0].emoji} meaning=${q(list[0].meaning)}\` with the start of your message quoted under it. It is their answer to that message, so act on it:`,
    "",
    ...list.map((r) => `- ${r.emoji} ${r.meaning}: ${r.does}`),
    "",
    "`emoji=none` means they took it back. `changed=true`: the newest wins. When `meaning=` differs from this list, follow `meaning=`: it is their own definition. Never ask what a reaction meant.",
    "",
  ].join("\n");
}

function render(channel, list) {
  const text = section(list);
  const at = channel.indexOf(`${HEAD}\n`);
  if (at >= 0) {
    const next = channel.indexOf("\n## ", at + HEAD.length);
    return channel.slice(0, at) + text + (next >= 0 ? "\n" + channel.slice(next + 1) : "");
  }
  const before = channel.indexOf(BEFORE);
  if (before < 0) throw new Error(`CHANNEL.md has no "${BEFORE}" section`);
  return channel.slice(0, before) + text + "\n" + channel.slice(before);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const list = reactions();
  const channel = readFileSync(CHANNEL, "utf8");
  const out = render(channel, list);
  if (process.argv.includes("--check")) {
    let bad = out !== channel ? ["spec/CHANNEL.md Reactions section is stale: run node spec/reactions.mjs"] : [];
    if (existsSync(APP)) {
      const swift = readFileSync(APP, "utf8");
      for (const r of list) if (!swift.includes(`"${r.emoji}"`) || !swift.includes(`"${r.meaning}"`)) bad.push(`app is missing ${r.emoji} ${r.meaning}`);
    }
    for (const b of bad) console.log(b);
    console.log(bad.length ? "STALE" : `up to date: ${list.length} reactions`);
    process.exit(bad.length ? 1 : 0);
  }
  writeFileSync(CHANNEL, out);
  console.log(`wrote the Reactions section (${list.length} reactions) into spec/CHANNEL.md`);
}
