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
