// Rules for scripts/freshness.mjs that need no files, so a test can feed them text (SITE-157).
const KEY = "\\b((?:YUI|SITE|OSS|INT|MVP|BIZ|FLOW|SOC|WAR|INV)-\\d+)\\b";

// Cards named with a progress.json entry: "card" is one id or a list of them.
export const progressCards = (entries) => new Set(entries.flatMap((e) => [].concat(e.card || [])));

// "YUI-191 (backlog, Chris Sep 28)", "Step 2 is YUI-105 (backlog)": the card key carries a backlog label in its
// own parentheses. A label that mentions a step ("YUI-41 (step 1 shipped; step 2 backlog)") is a split card, skipped.
// Returns the keys in `cards` that this line still calls backlog.
export function backlogLabelled(text, cards) {
  const out = [];
  for (const m of text.matchAll(new RegExp(`${KEY}\\s*\\(([^)]{0,120})\\)?`, "g")))
    if (cards.has(m[1]) && /\bbacklog\b/i.test(m[2]) && !/\bstep\b/i.test(m[2])) out.push(m[1]);
  return out;
}

const MONTHS = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"];

// "## Where Yui is now (Oct 5)": the heading's date is older than `maxDays` before `today` (a Date).
// Returns the age in days when stale, else null. The year is the one of `today`, or the one before when the
// date would land in the future.
export function staleWhereHeading(text, today, maxDays = 3) {
  const m = text.match(/^#+\s*Where Yui is now\s*\(\s*([A-Za-z]{3})[a-z]*\.?\s+(\d{1,2})\s*\)/i);
  if (!m) return null;
  const mo = MONTHS.indexOf(m[1].toLowerCase());
  if (mo < 0) return null;
  const day = Date.UTC(today.getUTCFullYear(), mo, Number(m[2]));
  let t = day > Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate()) ? Date.UTC(today.getUTCFullYear() - 1, mo, Number(m[2])) : day;
  const age = Math.round((Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate()) - t) / 86400000);
  return age > maxDays ? age : null;
}

// "- **On phones:** Yui 0.6.4, build 535, ...": the build this line calls the newest on phones, or null.
export function onPhonesBuild(text) {
  const m = text.match(/^\s*-\s*\*\*On phones:?\*\*:?\s.*?\bbuild\s+(\d+)\b/i);
  return m ? Number(m[1]) : null;
}
