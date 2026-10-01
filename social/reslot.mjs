#!/usr/bin/env node
// Slot the queue from today (SOC-7). Per platform and account: one live draft a day, 09:00 America/New_York,
// first free day from today, never past the window. Drafts past the window become `slot: unslotted`
// until Chris approves them. Approved drafts keep a still-valid slot; posted and rejected drafts are left alone.
//
//   node social/reslot.mjs           print the plan
//   node social/reslot.mjs --write   rewrite the slot lines
import { readFileSync, writeFileSync, readdirSync } from "node:fs";
import { join, resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { parseDraft, SLOT_WINDOW_DAYS, UNSLOTTED, etDay, addDays } from "./validate.mjs";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const LIVE = ["draft", "approved"];

// 09:00 on that day in New York, with the right UTC offset for the date.
export function slotAt(day) {
  const noon = new Date(`${day}T12:00:00Z`);
  const part = new Intl.DateTimeFormat("en-US", { timeZone: "America/New_York", timeZoneName: "shortOffset" }).formatToParts(noon).find((p) => p.type === "timeZoneName").value;
  const h = Number(part.replace("GMT", "") || 0);
  return `${day}T09:00:00${h < 0 ? "-" : "+"}${String(Math.abs(h)).padStart(2, "0")}:00`;
}

// drafts: [{file, meta}] in the order they should claim days. Returns Map file -> new slot string.
export function plan(drafts, now = new Date()) {
  const today = etDay(now);
  const last = addDays(today, SLOT_WINDOW_DAYS);
  const taken = new Map(); // "platform|account" -> Set of days
  const claim = (d, day) => {
    const k = `${d.meta.platform}|${d.meta.account}`;
    if (!taken.has(k)) taken.set(k, new Set());
    taken.get(k).add(day);
  };
  const live = drafts.filter((d) => !d.error && LIVE.includes(d.meta.status));
  const out = new Map();
  // Approved drafts with a slot still inside the window keep it.
  for (const d of live) {
    const day = String(d.meta.slot ?? "").slice(0, 10);
    if (d.meta.status === "approved" && day >= today && day <= last) claim(d, day);
  }
  for (const d of live) {
    const day = String(d.meta.slot ?? "").slice(0, 10);
    if (d.meta.status === "approved" && day >= today && day <= last) continue;
    if (d.meta.status === "approved") { out.set(d.file, null); continue; } // needs Chris, flagged by the caller
    const k = `${d.meta.platform}|${d.meta.account}`;
    let pick = null;
    for (let c = today; c <= last; c = addDays(c, 1)) if (!taken.get(k)?.has(c)) { pick = c; break; }
    if (pick) { claim(d, pick); out.set(d.file, slotAt(pick)); } else out.set(d.file, UNSLOTTED);
  }
  return out;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const dir = join(ROOT, "social/queue");
  const files = readdirSync(dir).filter((f) => f.endsWith(".md")).sort().map((f) => join(dir, f));
  const drafts = files.map((f) => parseDraft(readFileSync(f, "utf8"), f));
  // Oldest source first, so older ships get the earlier days.
  const result = plan(drafts);
  let slotted = 0, waiting = 0;
  for (const [file, slot] of result) {
    if (slot === null) { console.log(`NEEDS CHRIS ${file}: approved, slot outside the window`); continue; }
    slot === UNSLOTTED ? waiting++ : slotted++;
    if (process.argv.includes("--write")) {
      const text = readFileSync(file, "utf8");
      writeFileSync(file, text.replace(/^slot:.*$/m, `slot: ${slot}`));
    }
  }
  console.log(`${slotted} slotted, ${waiting} unslotted${process.argv.includes("--write") ? " (written)" : " (dry run)"}`);
}
