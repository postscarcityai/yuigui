// My flows (YUI-238, spec/FLOWS.md section 8): the app's list of saved flows, as pure functions
// so the web mock and its tests share them. Each starter in order, its variants under it, theirs
// under those. A starter cannot be removed; a variant goes alone, and one with variants of its own
// takes them along. Mirrors Yui/Sources/Presets/MyFlows.swift.

export const MAX_DEPTH = 5;

// The app's order: the starters it ships, then the variants hang under their base.
export const APP_STARTERS = [
  "website-intake", "self-scope", "workout-checkin", "first-plan", "first-meals",
  "first-practice", "first-week", "first-study", "onboarding", "connect",
];

const slug = (s) => String(s || "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

// starters: [{name, title}]; variants: [{name, title, base}]; removed: names the person removed;
// steps: (name) => count (0 when the base is gone). Rows are {name, title, steps, starter, depth, from, variants}.
export function listRows({ starters, variants, removed = [], steps = () => 0 }) {
  const live = variants.filter((v) => !removed.includes(v.name));
  const under = (parent) => live.filter((v) => slug(v.base) === slug(parent));
  const count = (name, seen) => under(name).filter((v) => !seen.has(v.name)).reduce((n, v) => n + 1 + count(v.name, new Set([...seen, v.name])), 0);
  const out = [];
  const placed = new Set();
  const place = (name, title, starter, depth, from) => {
    if (placed.has(name) || depth > MAX_DEPTH) return;
    placed.add(name);
    out.push({ name, title, steps: steps(name), starter, depth, from, variants: count(name, new Set([name])) });
    for (const v of under(name)) place(v.name, v.title, false, depth + 1, title);
  };
  for (const s of starters) place(s.name, s.title, true, 0, null);
  // A variant whose base is gone cannot run; it stays listed so it can be removed.
  for (const v of live) if (!placed.has(v.name)) place(v.name, v.title, false, 1, v.base);
  return out;
}

// The names a Remove of `name` takes: itself and every variant under it. Empty for a starter.
export function removal(rows, name) {
  const i = rows.findIndex((r) => r.name === name);
  if (i < 0 || rows[i].starter) return [];
  const names = [name];
  for (let j = i + 1; j < rows.length && rows[j].depth > rows[i].depth; j++) names.push(rows[j].name);
  return names;
}

export const rowSub = (r) => `${r.steps === 0 ? "Its base flow is gone" : `${r.steps} steps`} · ${r.from ? `from ${r.from}` : "Starter"}`;

export const confirmText = (r) => ({
  title: `Remove “${r.title}”?`,
  message: r.variants > 0
    ? `Its ${r.variants === 1 ? "variant goes" : `${r.variants} variants go`} with it. A run already started keeps going.`
    : "Your agent can send it again any time.",
});
