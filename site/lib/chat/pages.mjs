// The site chat's pages (SITE-83, spec/YL.md section 5, Pages; the app's YUI-168/187/189). Screen 1
// stays in the thread; screens 2 to 12 with something on them are pages beside the chat, a swipe
// away. A page keeps what lands on it across replies and takes patches from later ones (a bare
// `~stat` reaches the newest one), `>2 clear` removes it, `>2 talk` keeps the composer on it, and a
// reply that sends a line to a page brings it forward. The dots in the bottom bar are laid out like
// the app's PageDots (StageHome.swift).
import { apply, initialState, lastingIds, pageForward, pageOf, parse } from "../yl/yl.mjs";
import { splitReply } from "./lines.mjs";

// Does this node stay in the reply's own screen? Everything off the pages does, and a workout sent
// to a page still opens on the stage (it has `stage`), so it stays with its reply too.
export const inThread = (screen, node) => pageOf(String(screen)) === 1 || !!node?.stage;

// The pages after a run of replies (the assistant's messages, oldest first):
//   state:   the yl state holding the pages (screens 2 to 12 only, between replies)
//   pages:   page names with something on them, in number order ("2", "5")
//   forward: the page the newest reply brings forward, or null to stay
//   talk:    pages whose composer is on
export function threadPages(replies) {
  let state = initialState();
  let forward = null;
  for (const content of replies) {
    // Only the pages carry over; what a reply drew in the chat is its own. So an old reply's
    // chat never catches a later patch meant for a page.
    const screens = Object.fromEntries(Object.entries(state.screens).filter(([k]) => pageOf(k) > 1));
    state = { ...state, screens: { ...screens, 1: [] }, focus: "1", stage: false };
    const ops = [];
    for (const p of splitReply(content || "")) {
      if (!p.yl) continue;
      for (const op of parse(p.yl, lastingIds(state))) { ops.push(op); state = apply(state, op); }
    }
    forward = pageForward(ops);
  }
  const pages = Object.keys(state.screens)
    .filter((k) => pageOf(k) > 1 && state.screens[k].some((n) => !n.stage))
    .sort((a, b) => a - b);
  const talk = pages.filter((k) => state.talk?.[k]);
  return { state, pages, forward: forward != null && pages.includes(String(forward)) ? String(forward) : null, talk };
}

// ---------- the dots (the app's PageDots) ----------
export const DOTS = { dot: 6, pill: 16, pitch: 14, tight: 10, most: 7, pad: 8 };

// How the row is laid out for n screens in `room` px (background and all; null: all at full pitch).
// The dots close up first (pitch 14 down to 10), then only the nearest seven or fewer show.
export function dotsLayout(n, room = null) {
  const width = (l) => (l.shown - 1) * l.pitch + l.pill;
  const full = { pitch: DOTS.pitch, pill: DOTS.pill, shown: Math.min(n, DOTS.most) };
  full.width = width(full);
  if (room == null || n <= 1) return full;
  const inner = room - 2 * DOTS.pad;
  if (full.width <= inner) return full;
  const p = Math.max(DOTS.tight, Math.min(DOTS.pitch, (inner - 2) / n));
  const pill = Math.min(DOTS.pill, p + 2);
  const fits = Math.floor((inner - pill) / p + 0.001) + 1;
  const l = { pitch: p, pill, shown: Math.max(2, Math.min(n, DOTS.most, fits)) };
  l.width = width(l);
  return l;
}

// Where everything sits at `progress` (in screens: 0 the chat, 1.5 halfway from the first page to
// the second). x values are centers from the row's inner left edge. The window keeps the pill in
// its middle, stopping at the ends; a dot at a cut edge fades and shrinks; between two dots the
// pill stretches toward the next one, most at halfway.
export function dotsView(n, progress, room = null) {
  const l = dotsLayout(n, room);
  const p = Math.min(Math.max(progress, 0), Math.max(0, n - 1));
  const first = Math.min(Math.max(p - (l.shown - 1) / 2, 0), n - l.shown);
  const between = p - Math.floor(p);
  const reach = (1 - Math.abs(2 * between - 1)) * l.pitch * 0.7;
  const dots = [];
  for (let k = 0; k < n; k++) {
    const at = k - first;
    if (!(at > -1 && at < l.shown)) continue;
    const edge = Math.min(at + 1, l.shown - at, 1);
    const cut = (k > 0 && at < 0.5) || (k < n - 1 && at > l.shown - 1.5);
    dots.push({ k, x: l.pill / 2 + at * l.pitch, fade: cut ? Math.min(Math.max(edge, 0), 1) * 0.5 : 1, cut });
  }
  return { ...l, first, dots, pillX: l.pill / 2 + (p - first) * l.pitch, pillW: l.pill + reach };
}

// The dot nearest a tap `x` px from the row's inner left edge.
export function dotAt(n, progress, room, x) {
  const v = dotsView(n, progress, room);
  return Math.min(Math.max(Math.round((x - v.pill / 2) / v.pitch + v.first), 0), n - 1);
}
