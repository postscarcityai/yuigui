// YUI-329: a mixed answer on the living canvas. A real reply is rarely one kind: a line of text, a stat, a chart, a list, a question.
// This module plays such a reply as ONE drawing on ONE clock. Each part is the film its own card built (yl-charts, yl-lists, yl-inputs,
// shapes and sketch in yl-canvas): it keeps its own marks and behaviour (a bar tap names it, list rows tick, a choose locks). Here they are
// only laid out in one flow, top to bottom in line order, and started one after the other: no part starts before the one above it has
// finished writing in. The one exception is the picture a question is about: a question written above its picture draws after it.
// Every part draws into its own slot through a shifted copy of the canvas api (the film still thinks it owns the page), and parts are
// drawn in clock order, so the keyboard order (the order hits are made) is the drawing order (YUI-324).
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const seg = (t, a, b) => clamp((t - a) / (b - a), 0, 1);
const slug = (s) => String(s).trim().toLowerCase().replace(/[^a-z0-9]+/g, "_").slice(0, 28);
const GAP = 12, TOP = 100, BOTTOM_PAD = 190, LEAD = 0.1;

// The canvas api as a part sees it: everything it draws or hits moves down by dy, and the page it thinks it has is H tall.
function shifted(api, dy, H) {
  const s = Object.create(api);
  Object.defineProperty(s, "h", { value: H });
  s.dy = (api.dy || 0) + dy;   // YUI-331: charts and shapes note where they really sit
  s.say = () => {};
  s.text = (str, x, y, o) => api.text(str, x, y + dy, o);
  s.label = (str, x, y, o) => api.label(str, x, y + dy, o);
  s.stroke = (pts, o) => api.stroke(pts.map((p) => [p[0], p[1] + dy]), o);
  s.line = (x1, y1, x2, y2, o) => api.line(x1, y1 + dy, x2, y2 + dy, o);
  s.rect = (x, y, w, h, o) => api.rect(x, y + dy, w, h, o);
  s.dot = (x, y, r, o) => api.dot(x, y + dy, r, o);
  s.circle = (x, y, r, o) => api.circle(x, y + dy, r, o);
  s.ellipse = (x, y, rx, ry, o) => api.ellipse(x, y + dy, rx, ry, o);
  s.highlight = (x, y, w, h, o) => api.highlight(x, y + dy, w, h, o);
  s.hit = (id, x, y, r, label, o) => api.hit(id, x, y + dy, r, label, o);
  s.hitBox = (id, x, y, w, h, label) => api.hitBox(id, x, y + dy, w, h, label);
  return s;
}

const isInput = (p) => p.kind === "input";
const isPicture = (p) => p.kind === "fig" || p.kind === "blocks" || p.kind === "draw" || p.kind === "sci";

// parts: [{ kind: "text", text } | { kind: "fig" | "blocks" | "draw" | "input", film }] in line order. host: { HOLD }.
export function mixFilm(parts, host) {
  if (!parts.length) return null;
  const HOLD = host.HOLD;
  const revealOf = (p) => clamp(0.3 + p.text.length * 0.03, 0.6, 1.8);
  const durOf = (p) => (p.kind === "text" ? revealOf(p) + 0.2 : Math.max(0.6, p.film.total - HOLD));
  // the clock order: line order, except a question written above its picture comes after the picture
  const order = parts.map((_, i) => i);
  for (let i = 0; i + 1 < parts.length; i++) {
    const a = order.indexOf(i), b = order.indexOf(i + 1);
    if (isInput(parts[i]) && isPicture(parts[i + 1]) && a < b) { order[a] = i + 1; order[b] = i; }
  }
  const start = [], ends = [];
  let at = LEAD;
  for (const i of order) { start[i] = at; at += durOf(parts[i]); ends[i] = at; }
  const total = at + 0.2 + HOLD;
  const marks = [];
  parts.forEach((p, i) => {
    p.start = start[i]; p.dy = 0;
    if (p.kind === "text") marks.push({ id: "mark:text:" + slug(p.text), label: p.text, words: "What the answer says first.", appear: start[i], part: i });
    else p.film.marks.forEach((m) => marks.push({ ...m, appear: m.appear + start[i], part: i }));
  });
  const films = parts.filter((p) => p.film).map((p) => p.film);
  const firstTitle = parts.map((p) => (p.kind === "text" ? p.text : p.film.title)).find(Boolean) || "";

  // ---- geometry: how tall each part is and how it is drawn into its slot (k < 1 squeezes the parts that can give) --------------------
  const geo = (api, p, k) => {
    const W = api.w, f = p.film;
    if (p.kind === "text") {
      const m = api.measure(p.text, { size: 21, weight: 700, maxw: W - 40 });
      return { h: m.h + 6, give: false, draw: (y, tt) => { p.dy = y; api.text(p.text, 20, y, { size: 21, weight: 700, align: "left", base: "top", maxw: W - 40, type: true, k: seg(tt, 0, revealOf(p)) }); } };
    }
    if (p.kind === "fig") {
      const f0 = f.figs[0], stat = f0.kind === "stat", pie = f0.type === "pie" || f0.type === "donut";
      const avail = Math.max(160, Math.round(stat ? 160 : Math.max(180, (pie ? 260 : 240) * k))), used = f.height(avail), S = avail + 4;
      return { h: used, give: !stat, draw: (y, tt) => { p.dy = y - 112 - (avail - used) / 2; f.draw(tt, shifted(api, p.dy, S + 308)); } };
    }
    if (p.kind === "blocks") {
      const nat = f.height(api), card = f.blocks[0].kind === "card";
      const availS = Math.max(160, Math.round(card ? nat : nat * k)), ff = nat > availS ? clamp(availS / nat, 0.62, 1) : 1, used = card ? nat : nat * ff, S = availS + 4;
      return { h: used, give: !card, draw: (y, tt) => { p.dy = y - 112 - (availS - used) / 2; f.draw(tt, shifted(api, p.dy, S + 308)); } };
    }
    if (p.kind === "sci") {   // YUI-337: formulas and calcs take the height they need, squeezed to fit like a chart
      const used = Math.round(f.height(api) * (k < 1 ? clamp(k, 0.7, 1) : 1)), S = used + 4;
      return { h: used, give: true, draw: (y, tt) => { p.dy = y - 112; f.draw(tt, shifted(api, p.dy, S + 308)); } };
    }
    if (p.kind === "draw" && (f.kind === "shapes" || f.kind === "map")) {   // YUI-336: a map fits its slot the way a shapes drawing does
      const sc = f.sc, full = sc.h * Math.min((W - 28) / sc.w, 84), aH = Math.max(120, Math.min(full, 250 * k)), S = (sc.title ? 24 : 0) + aH + 6, ft = f.fit(W, S), head = sc.title ? 22 : 0;
      return { h: head + (sc.title ? 24 : 0) + ft.drawH + 6, give: true, draw: (y, tt) => { p.dy = y - 112 + head - ft.shift; f.draw(tt, shifted(api, p.dy, S + 308)); } };
    }
    if (p.kind === "draw") {
      const fh = f.natural(api), S = Math.round(fh) + 54, bubble = String(p.frame || "") === "bubble";
      return { h: 41 + fh + (bubble ? 16 : 6), give: false, draw: (y, tt) => { p.dy = y - 110; f.draw(tt, shifted(api, p.dy, S + 308)); } };
    }
    // inputs: the stack is pinned to the top of a slot that already has room for the line the answer sends
    const hnow = f.height(api), ans = !!f.state.line[f.blocks[0].id], S = hnow - (ans ? 26 : 0) + 26;
    return { h: S, give: false, draw: (y, tt) => { p.dy = y - 112 - (S - hnow) / 2; f.draw(tt, shifted(api, p.dy, S + 308)); } };
  };

  // routes a touch to the part whose marks own the id
  const ask = (name, ...args) => { for (const p of parts) { const r = p.film && p.film[name] ? p.film[name](...args) : null; if (r) return r; } return null; };

  const film = {
    kind: "mix", total, marks, choose: null, chosen: null, onShapes: false, says: [], title: firstTitle, parts, order, starts: start, ends,
    tick: (id) => ask("tick", id),
    touch(id) {
      for (const p of parts) {
        const r = p.film && p.film.touch ? p.film.touch(id) : null;
        if (r) return r.edit && r.edit.rect ? { ...r, edit: { ...r.edit, rect: { ...r.edit.rect, y: r.edit.rect.y + p.dy } } } : r;
      }
      return null;
    },
    drag: (d) => ask("drag", d),
    nudge: (d) => ask("nudge", d),
    // YUI-337: a slider in one part: the words it says now, the text with the sliders where they are, and whether a tween is running
    wordsFor: (label) => { for (const p of parts) { const w = p.film && p.film.wordsFor ? p.film.wordsFor(label) : null; if (w) return w; } return null; },
    retext: (text) => parts.reduce((tx, p) => (p.film && p.film.retext ? p.film.retext(tx) : tx), text),
    busy: () => parts.some((p) => p.film && p.film.busy && p.film.busy()),
    setText: (key, text) => ask("setText", key, text),
    draw(t, api) {
      const bottom = api.h - BOTTOM_PAD;
      let g = null;
      for (const k of [1, 0.85, 0.7, 0.6]) {
        g = parts.map((p) => geo(api, p, k));
        if (g.reduce((a, x) => a + x.h, 0) + GAP * (g.length - 1) <= bottom - TOP) break;
      }
      const ys = [];
      let y = TOP;
      g.forEach((x, i) => { ys[i] = y; y += x.h + GAP; });
      film.slots = g.map((x, i) => ({ y: ys[i], h: x.h }));   // YUI-330: where each part sits, so a redraw can tell which part changed height
      for (const i of order) if (t >= start[i]) g[i].draw(ys[i], t - start[i]);
    },
  };
  film.films = films;
  return film;
}
