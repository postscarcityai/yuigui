// What must never reach yuigui.com. Shared by the exporters in scripts/ (board, builds).
// Words that must never reach the public board: clients, other projects, other agents, people.
export const PRIVATE = [
  "AMC", "Aaron", "Cohen", "Justice Watch", "Docket", "Heathos", "Hubble", "Plannix", "Moon", "imo", "Apollo",
  "Sean Rush", "Luna", "Air Nomadics", "markzaid", "Zaid", "Healing Alliance", "Lending Genie", "WaterDamageIQ",
  "Finesse", "SigEp", "Arnold", "R0SS", "Ross", "Urza", "Monk", "Hank", "Gimp", "Akasha", "Wendy",
  "Mick", "Selene", "Firecrawl",
];
export const PRIVATE_RE = new RegExp(`\\b(${PRIVATE.map((w) => w.replace(/ /g, "\\s+")).join("|")})\\b`, "i");
// Shapes that must never appear anywhere in the output.
export const LEAKS = [
  [/\bt_[0-9a-f]{6,}\b/i, "task id"],
  [/(\/Users\/|~\/|\.hermes|\.openclaw|\/dev\/)/i, "path"],
  [/\$\s?\d|\b\d+\s?(usd|dollars)\b/i, "cost"],
  [/[\w.+-]+@[\w-]+\.[\w.]+/, "email"],
  [/\(\d{3}\)\s?\d{3}-\d{4}|\b\d{3}-\d{3}-\d{4}\b/, "phone"],
  [PRIVATE_RE, "private name"],
];

// First leak in a string, as [what, match], or null.
export function findLeak(text) {
  for (const [re, what] of LEAKS) {
    const hit = text.match(re);
    if (hit) return [what, hit[0]];
  }
  return null;
}

// Specs are published whole (SITE-15). Their examples carry prices, emails-shaped ranges and
// the documented `~/.hermes/...` install paths, so they get a narrower check: names, task ids,
// and paths that only exist on the build machine.
const DOC_LEAKS = [
  [/\bt_[0-9a-f]{6,}\b/i, "task id"],
  [/(\/Users\/|~\/dev\/|\.hermes\/profiles\/(?!yui\b|<))/i, "path"],
  [PRIVATE_RE, "private name"],
];
export function findDocLeak(text) {
  for (const [re, what] of DOC_LEAKS) {
    const hit = text.match(re);
    if (hit) return [what, hit[0]];
  }
  return null;
}
