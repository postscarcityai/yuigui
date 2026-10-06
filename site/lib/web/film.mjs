// Motion films on the web (YUI-311, the twin of the app's MotionView, MOTION-1d). Pure, no DOM.
// The wire is spec/MOTION.md 0.5: a `motion` head (title, film=, part=, +last) whose patch carries the scenes as
// text, one row per part, so a film arrives as several thread rows. This reads those rows back into films,
// folds the continuation rows out of the record, and says what the player is owed next (`handoff`), so scene 1
// plays the moment it lands and later scenes append to the same player.

const HEADER = /^===\s*(?:scene\s+)?(\S+?)\s+([\d.]+)\s*===\s*$/i;
export const MAX_DUR = 20;
export const MIN_DUR = 0.5;

// "=== scene hook 4 ===" blocks -> [{ name, dur, code }]. Text before the first header is dropped.
export function parseScenes(source) {
  const out = [];
  let cur = null;
  for (const line of String(source || "").split("\n")) {
    const h = HEADER.exec(line.trim());
    if (h) {
      cur = { name: h[1], dur: Math.min(MAX_DUR, Math.max(MIN_DUR, Number(h[2]) || 5)), lines: [] };
      out.push(cur);
    } else if (cur) cur.lines.push(line.replace(/\r$/, ""));
  }
  return out.map((s) => ({ name: s.name, dur: s.dur, code: s.lines.join("\n").trim() })).filter((s) => s.code);
}

// The words a scene says (`api.say("...")`): a still frame's caption, and what a screen reader reads.
export function says(code) {
  const out = [];
  for (const m of String(code || "").matchAll(/api\.say\(\s*(["'`])((?:\\.|(?!\1)[^\\])*)\1/g)) {
    const t = m[2].replace(/\\(["'`\\])/g, "$1").replace(/\\n/g, " ").trim();
    if (t) out.push(t);
  }
  return out;
}

const motionNodes = (state) => Object.values(state?.screens || {}).flat().filter((n) => n.preset === "motion").sort((a, b) => a.seq - b.seq);
// A head with a film id or scene text is a film's row; a head with neither is the agent's own ask (an old plugin).
const bears = (n) => n.props?.film !== undefined || typeof n.props?.source === "string";

// Films in a run of { id, state } rows (a thread, or a turn's pieces). A film is its rows joined by `film`, scenes in
// part order; it is `done` once a row says `+last`. A row that only says `last` and has no earlier part still counts
// (a phone that missed part 1 starts the film from there). Asks with no film come back as { sketch: true }.
export function filmsOf(rows) {
  const films = new Map();
  const order = [];
  rows.forEach((r, at) => {
    for (const n of motionNodes(r.state)) {
      const p = n.props || {};
      if (!bears(n)) { order.push({ sketch: true, id: `ask:${r.id}`, ask: String(p.title || "").trim(), row: r.id, at }); continue; }
      const key = String(p.film ?? r.id);
      let f = films.get(key);
      if (!f) { f = { id: key, title: "", scenes: [], done: false, rows: [], parts: [], at }; films.set(key, f); order.push(f); }
      if (p.title && !f.title) f.title = String(p.title).trim();
      if (!f.rows.includes(r.id)) f.rows.push(r.id);
      f.parts.push({ part: Number(p.part) || f.parts.length + 1, scenes: parseScenes(p.source) });
      if (p.last === true) f.done = true;
    }
  });
  for (const f of order) {
    if (f.sketch) continue;
    f.parts.sort((a, b) => a.part - b.part);
    f.scenes = f.parts.flatMap((p) => p.scenes);
    delete f.parts;
  }
  return order;
}

export const filmsOfMessages = (messages) => filmsOf(messages.filter((m) => m.state).map((m) => ({ id: m.id, state: m.state })));

// The newest film in a turn's pieces ({ state } each, turnOf), or null. An ask with no film is not one.
export function filmOfPieces(pieces) {
  const all = filmsOf(pieces.filter((p) => p.state).map((p, i) => ({ id: `p${i}`, state: p.state }))).filter((f) => !f.sketch);
  return all.length ? all[all.length - 1] : null;
}

// The record keeps one line per film. A row that holds only a later part of a film (its scenes, or the closing
// `+last`) is left out of what the thread draws; the stage and the pages still read the full list.
export function foldFilmRows(messages) {
  const first = new Map();
  const hide = new Set();
  for (const m of messages) {
    if (!m.state) continue;
    const nodes = motionNodes(m.state);
    if (!nodes.length) continue;
    const all = Object.values(m.state.screens || {}).flat();
    if (all.length !== nodes.length) continue; // the row holds more than the film
    for (const n of nodes) {
      if (!bears(n)) continue;
      const k = String(n.props.film ?? m.id);
      if (!first.has(k)) first.set(k, m.id);
      else if (first.get(k) !== m.id) hide.add(m.id);
    }
  }
  return hide.size ? messages.filter((m) => !hide.has(m.id)) : messages;
}

// What the player is owed. `sent` is what it has already been given ({ theme, scenes, end }); the result is the posts to
// make now and the new `sent`. Scene 1 goes out alone the moment it is there; a later scene appends; `end` follows the
// last scene once the film is done. Nothing is sent twice, and the posts are in the player's own words (player.html).
export const fresh = () => ({ theme: false, scenes: 0, end: false });
export function handoff(film, sent, theme = null) {
  const posts = [];
  const next = { ...sent };
  if (!next.theme && theme) { posts.push({ theme }); next.theme = true; }
  const scenes = film?.scenes || [];
  for (let i = next.scenes; i < scenes.length; i++) posts.push({ scene: { name: scenes[i].name, dur: scenes[i].dur, code: scenes[i].code } });
  next.scenes = Math.max(next.scenes, scenes.length);
  if (film?.done && !next.end && next.scenes > 0 && next.scenes === scenes.length) { posts.push({ end: true }); next.end = true; }
  return { posts, sent: next };
}

// The film's own colours for the player: the agent's accent on the page's ink, dark or light.
export function themeFor(accent, light) {
  const a = /^#[0-9a-f]{6}$/i.test(accent || "") ? accent : "#ff7e8a";
  return light
    ? { ink: "#fbf7ff", panel: "#eee6fa", fg: "#1d1631", dim: "#6a6082", line: "#cdc2e4", accent: a, a2: "#1f9fb0", a3: "#5b4ee0", good: "#1f9d68", bad: "#d6334f", warn: "#c98a00" }
    : { ink: "#0b0813", panel: "#18132b", fg: "#f6eef7", dim: "#a095b8", line: "#3d3460", accent: a, a2: "#5fd3e0", a3: "#8a7dff", good: "#5fe0a0", bad: "#ff5d73", warn: "#ffc857" };
}

// A still frame per scene (Reduce Motion): where in the film each scene starts, which frame to show and its caption.
export function stills(film) {
  let start = 0;
  return (film?.scenes || []).map((s, i) => {
    const out = { i, name: s.name, at: +(start + s.dur * 0.85).toFixed(2), caption: says(s.code).slice(-1)[0] || (i === 0 ? film.title : "") || "" };
    start += s.dur;
    return out;
  });
}
