#!/usr/bin/env node
// The drafter's high-water mark over site/content/progress.json (BIZ-4 Part 5.1).
// Not a time window: a missed run cannot drop an entry, it just shows up next run.
//
//   node social/pending.mjs              print new entries as JSON, print nothing when there are none
//   node social/pending.mjs --advance K  mark entry keys done (repeat K), move the mark forward
//   node social/pending.mjs --init       mark every current entry done (start from the next ship)
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { join, resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");

export const entryKey = (e) => `${e.date}|${e.card || e.title}`;

export function loadState(file) {
  if (!existsSync(file)) return { floor: null, hwm: null, done: [] };
  return JSON.parse(readFileSync(file, "utf8"));
}

// Entries not yet drafted, dated on or after the floor (the day the drafter started). Oldest first.
// Every done key is kept, so a late or backdated entry still shows up; the floor only stops a first run
// from drafting the whole history.
export function pending(entries, state) {
  const done = new Set(state.done);
  const floor = state.floor ?? "";
  return entries.filter((e) => e.date >= floor && !done.has(entryKey(e))).sort((a, b) => a.date.localeCompare(b.date));
}

// Mark keys done. hwm is the newest drafted entry, for humans reading state.json.
export function advance(state, keys, entries) {
  const done = [...new Set([...state.done, ...keys])].sort();
  const dates = entries.filter((e) => done.includes(entryKey(e))).map((e) => e.date).sort();
  const floor = state.floor ?? dates[0] ?? null;
  return { floor, hwm: dates.at(-1) ?? state.hwm ?? null, updated: new Date().toISOString(), done };
}

export function withMedia(entry, root = ROOT) {
  const media = (entry.images ?? []).map((i) => ({
    path: `site/public${i.src}`,
    alt: i.alt,
    exists: existsSync(join(root, "site/public", i.src)),
  }));
  return { key: entryKey(entry), date: entry.date, card: entry.card ?? null, title: entry.title, body: entry.body, media };
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const stateFile = process.env.SOCIAL_STATE ?? join(ROOT, "social/state.json");
  const entries = JSON.parse(readFileSync(process.env.PROGRESS_JSON ?? join(ROOT, "site/content/progress.json"), "utf8"));
  const state = loadState(stateFile);
  const args = process.argv.slice(2);
  const save = (s) => writeFileSync(stateFile, JSON.stringify(s, null, 2) + "\n");
  if (args[0] === "--init") {
    const newest = entries.map((e) => e.date).sort().at(-1);
    save(advance({ floor: newest, hwm: null, done: [] }, entries.map(entryKey), entries));
    console.error(`state initialized, floor ${newest}`);
  } else if (args[0] === "--advance") {
    const keys = args.slice(1);
    const known = new Set(entries.map(entryKey));
    const unknown = keys.filter((k) => !known.has(k));
    if (!keys.length || unknown.length) {
      console.error(unknown.length ? `unknown keys: ${unknown.join(", ")}` : "usage: --advance KEY [KEY ...]");
      process.exit(2);
    }
    save(advance(state, keys, entries));
    console.error(`marked ${keys.length} done`);
  } else {
    const out = pending(entries, state).map((e) => withMedia(e));
    if (out.length) console.log(JSON.stringify(out, null, 2));
  }
}
