// YUI-325: Yui Lines on the living canvas. A `shapes` or `sketch` answer becomes marks drawn on the same canvas clock as a film:
// strokes draw in line order, every shape and every row is a hit target (so tap, hold, drag-to-scrub and the keyboard model of
// YUI-321/324 work unchanged), and a `choose` under the drawing is drawn INTO it as tappable marks.
// The page loads this lazily with ?yl=<id>. It parses with the copies of site/lib/yl in ./yl (scripts/sync-canvas-yl.mjs).
// A film here is one scene of the player: the scene code is a one-liner that calls film.draw(t, api) in this module.
import { parse, AUTO_ID } from "./yl/yl.mjs";
import { chartFilm } from "./yl-charts.mjs";
import { listFilm } from "./yl-lists.mjs";
import { inputsFilm } from "./yl-inputs.mjs";
import { mixFilm } from "./yl-mix.mjs";
import { scene, frame, blobPoints, ringPoints, control, bracketPoints, smooth, STEP } from "./yl/shapes.mjs";

const TONE = { accent: "accent", mint: "good", lavender: "a3", butter: "warn", ink: "fg", mute: "dim" };
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const seg = (t, a, b) => clamp((t - a) / (b - a), 0, 1);
const slug = (s) => String(s).trim().toLowerCase().replace(/[^a-z0-9]+/g, "_").slice(0, 28);
const HOLD = 1.4; // seconds the finished picture holds before the film ends

// ---- parse ---------------------------------------------------------------------------------------------------------------

// The first drawing in an answer (shapes or sketch, or the chart and stat lines of YUI-326), the `say` lines before it, and the choose under it.
export function read(text) {
  const r = parse(text), ops = Array.isArray(r) ? r : r.ops || [];
  const out = { says: [], draw: null, figs: [], blocks: [], inputs: [], choose: null, errors: ops.filter((o) => o.op === "error").map((o) => o.message) };
  for (const o of ops) {
    if (o.op !== "add") continue;
    if (o.preset === "say" && !out.draw && !out.figs.length && !out.blocks.length) out.says.push(String(o.props.text || o.props.body || ""));
    else if ((o.preset === "chart" || o.preset === "stat") && !out.draw) out.figs.push(o);
    else if (["list", "table", "timeline", "done", "now", "next", "card"].includes(o.preset) && !out.draw && !out.figs.length) out.blocks.push(o);
    else if ((o.preset === "shapes" || o.preset === "sketch") && !out.draw) out.draw = { kind: o.preset, id: o.id, head: o.props, items: [] };
    else if (["choose", "pick", "ask", "slide", "form"].includes(o.preset) && !o.in && !out.draw && !out.figs.length && !out.blocks.length) out.inputs.push(o);
    else if (out.draw && o.in === out.draw.id && (o.preset === "shape" || o.preset === "row" || o.preset === "after")) out.draw.items.push(o);
    else if (o.preset === "choose" && (out.draw || out.figs.length || out.blocks.length) && !out.choose) out.choose = { id: AUTO_ID.test(o.id) ? "choose" : o.id, q: String(o.props.q || ""), options: (o.props.options || []).map(String) };
  }
  return out;
}

// ---- a mixed answer (YUI-329) ---------------------------------------------------------------------------------------------

const INPUTS = ["choose", "pick", "ask", "slide", "form"];
// Every top-level op of the reply as one part, in line order: say -> text; chart / stat -> fig; list, table, timeline (with its steps)
// and card -> blocks; shapes or sketch (with their rows) -> draw; choose, pick, ask, slide, form -> input.
export function readParts(text) {
  const r = parse(text), ops = Array.isArray(r) ? r : r.ops || [];
  const parts = [], errors = ops.filter((o) => o.op === "error").map((o) => o.message);
  let tl = null, dr = null;
  for (const o of ops) {
    if (o.op !== "add") continue;
    if (dr && o.in === dr.id && (o.preset === "shape" || o.preset === "row" || o.preset === "after")) { dr.items.push(o); continue; }
    if (o.in && !(tl && o.in === tl.ops[0].id)) continue;
    if (o.preset === "done" || o.preset === "now" || o.preset === "next") { if (tl) tl.ops.push(o); continue; }
    if (o.preset === "say") parts.push({ kind: "text", text: String(o.props.text || o.props.body || "") });
    else if (o.preset === "chart" || o.preset === "stat") parts.push({ kind: "fig", ops: [o] });
    else if (o.preset === "timeline") parts.push((tl = { kind: "blocks", ops: [o] }));
    else if (["list", "table", "card"].includes(o.preset)) parts.push({ kind: "blocks", ops: [o] });
    else if (o.preset === "shapes" || o.preset === "sketch") { dr = { kind: "draw", d: { kind: o.preset, id: o.id, head: o.props, items: [] } }; dr.id = o.id; dr.items = dr.d.items; parts.push(dr); }
    else if (INPUTS.includes(o.preset)) parts.push({ kind: "input", ops: [o] });
  }
  return { parts: parts.filter((p) => p.kind !== "text" || p.text), errors };
}

// Does the answer mix kinds (so it plays as one flow) or is it one kind of picture the older films already draw? A single kind of picture,
// with a leading line and a plain `choose` under it, stays what it was. A line after the first picture, a second kind, or any input but a
// plain choose under a picture, is a mix.
export function isMix(parts) {
  const rest = parts.slice();
  while (rest.length && rest[0].kind === "text") rest.shift();
  if (!rest.length) return false;
  if (rest.some((p, i) => i > 0 && p.kind === "text")) return true;
  const last = rest[rest.length - 1];
  if (rest.length > 1 && last.kind === "input" && last.ops[0].preset === "choose" && rest.slice(0, -1).every((p) => p.kind !== "input")) rest.pop();
  return new Set(rest.map((p) => p.kind)).size > 1;
}

function buildMix(text) {
  const { parts, errors } = readParts(text), r0 = { choose: null, says: [], errors };
  if (!isMix(parts)) return null;
  const seen = {};
  const made = parts.map((p) => {
    if (p.kind === "text") return p;
    if (p.kind === "fig") { const film = chartFilm(p.ops, r0, { chooseBlock, HOLD }); return film && { kind: "fig", film }; }
    if (p.kind === "blocks") { const film = listFilm(p.ops, r0, { chooseBlock, HOLD }); return film && { kind: "blocks", film }; }
    if (p.kind === "draw") { const film = p.d.kind === "shapes" ? shapesFilm(p.d, r0) : sketchFilm(p.d, r0); return { kind: "draw", film, frame: p.d.head.frame }; }
    // two inputs with auto ids would both be "n1": give each its own id
    const o = p.ops[0], id = AUTO_ID.test(o.id) ? o.preset + (seen[o.preset] = (seen[o.preset] || 0) + 1) : o.id;
    const film = inputsFilm([{ ...o, id }], r0, { AUTO_ID, HOLD });
    return film && { kind: "input", film };
  }).filter(Boolean);
  const film = mixFilm(made, { HOLD });
  if (!film) return null;
  film.read = { says: [], errors };
  return { film, scenes: [{ name: "yl", dur: film.total, code: "return window.__yl && window.__yl.draw(t, api);" }] };
}

// ---- shared drawing helpers ----------------------------------------------------------------------------------------------

function sample(pts, closed) {
  if (pts.length < 3) return pts;
  const out = [pts[0]];
  let p0 = pts[0];
  for (const [c1, c2, p] of smooth(pts, closed)) {
    for (let i = 1; i <= 8; i++) {
      const u = i / 8, v = 1 - u;
      out.push([v * v * v * p0[0] + 3 * v * v * u * c1[0] + 3 * v * u * u * c2[0] + u * u * u * p[0], v * v * v * p0[1] + 3 * v * v * u * c1[1] + 3 * v * u * u * c2[1] + u * u * u * p[1]]);
    }
    p0 = p;
  }
  return out;
}

// The choose under a drawing, drawn into it: the question in hand writing, then one pill per option. Returns the height it took.
function chooseBlock(api, film, t, from, x0, y0, w, measureOnly) {
  const ch = film.choose; if (!ch) return 0;
  const size = 16, pads = 34, gap = 10;
  const ws = ch.options.map((o) => Math.min(w, api.measure(o, { size, weight: 700 }).w + pads));
  const one = ws.reduce((a, b) => a + b, 0) + gap * (ws.length - 1) <= w;
  const rowH = 40, qH = ch.q ? 26 : 0, h = qH + (one ? rowH : ch.options.length * (rowH + 6) - 6) + 8;
  if (measureOnly) return h;
  const k = seg(t, from, from + 0.5);
  if (k <= 0) return h;
  if (ch.q) api.text(ch.q, x0 + w / 2, y0 + 10, { size: 15, c: "dim", font: "hand", weight: 700, k, free: true, noHit: true, maxw: w });
  const chosen = film.chosen;
  let x = x0 + (w - (one ? ws.reduce((a, b) => a + b, 0) + gap * (ws.length - 1) : 0)) / 2, y = y0 + qH + rowH / 2 + 2;
  ch.options.forEach((o, i) => {
    const kk = seg(t, from + 0.15 + i * 0.12, from + 0.65 + i * 0.12), on = chosen === o;
    const cx = one ? x + ws[i] / 2 : x0 + w / 2;
    api.label(o, cx, y, { size, weight: 800, k: kk, bg: on ? "good" : "panel", c: on ? "ink" : "fg", border: on ? "good" : "accent", a: chosen && !on ? 0.4 : 1 });
    if (one) x += ws[i] + gap; else y += rowH + 6;
  });
  return h;
}

// ---- shapes ---------------------------------------------------------------------------------------------------------------

function shapesFilm(d, read0) {
  const members = d.items.map((o) => ({ id: AUTO_ID.test(o.id) ? null : o.id, props: o.props }));
  const sc = scene(d.head, members);
  const names = new Map(sc.items.map((it) => [it.i, it.label || it.id || it.kind]));
  const markName = (it) => {
    if (it.leader) return it.label || "callout";
    if (it.from) { const a = names.get(it.from.ref), b = names.get(it.to.ref); return it.label || (a && b ? a + " to " + b : it.kind); }
    return it.label || (it.id ? it.id : it.kind);
  };
  const itemMarks = sc.items.map((it) => {
    const label = markName(it);
    let words = label;
    if (it.at && !it.mark) {
      const out = sc.items.filter((c) => c.from && !c.leader && c.from.ref === it.i && names.get(c.to.ref)).map((c) => names.get(c.to.ref));
      const inn = sc.items.filter((c) => c.from && !c.leader && c.to.ref === it.i && names.get(c.from.ref)).map((c) => names.get(c.from.ref));
      const bits = [];
      if (inn.length) bits.push("Comes from " + inn.join(" and ") + ".");
      if (out.length) bits.push("Goes on to " + out.join(" and ") + ".");
      words = bits.length ? bits.join(" ") : "A " + it.kind + (it.label ? " called " + it.label : "") + ".";
    } else if (it.from && !it.leader) words = "A " + it.kind + " from " + (names.get(it.from.ref) || "here") + " to " + (names.get(it.to.ref) || "there") + ".";
    return { id: "yl:" + (it.id || it.kind + "-" + (it.i + 1)), label, words, item: it.i, appear: it.start };
  });
  const marks = itemMarks.slice();
  if (sc.title) marks.push({ id: "mark:text:" + slug(sc.title), label: sc.title, words: "What this picture is about.", appear: 0 });
  const total = sc.total + (read0.choose ? 1.2 : 0) + HOLD;
  // A choose whose options are all labels of closed shapes is answered by tapping the shapes themselves (no pills under the picture).
  const byLabel = (o) => itemMarks.find((m) => m.label === o && sc.items[m.item].at && !sc.items[m.item].mark);
  const onShapes = !!read0.choose && read0.choose.options.length > 0 && read0.choose.options.every(byLabel);
  const film = {
    kind: "shapes", total, marks, sc, choose: read0.choose, chosen: null, onShapes,
    says: read0.says, title: sc.title, caption: sc.caption,
    // YUI-329: the picture's size in a slot S tall (what draw() will use), so a mixed answer can lay it out and pin it to the slot top
    fit(W, S) {
      const aH = Math.max(120, S - (sc.title ? 24 : 0) - 6), s = Math.min((W - 28) / sc.w, aH / sc.h, 84);
      return { drawH: sc.h * s, shift: (aH - sc.h * s) / 2, head: (sc.title ? 24 : 0) + 6 };
    },
    draw(t, api) {
      const W = api.w, H = api.h, top = 120, areaB = H - 196;
      const cH = film.choose ? (onShapes ? 30 : chooseBlock(api, film, t, 0, 0, 0, W - 40, true)) : 0;
      if (sc.title) api.text(sc.title, W / 2, top - 8, { size: 24, weight: 800, k: seg(t, 0, 0.5), maxw: W - 40 });
      const aT = top + (sc.title ? 24 : 0), aH = Math.max(120, areaB - aT - cH - 6);
      const s = Math.min((W - 28) / sc.w, aH / sc.h, 84), ox = (W - sc.w * s) / 2, oy = aT + (areaB - aT - (sc.h * s + cH + 6)) / 2;
      const drawH = sc.h * s;
      film.xf = { ox, oy, s, dy: api.dy || 0 };   // YUI-331: screen px <-> picture units, so a dropped part gets its new at=
      const P = (p) => [ox + p[0] * s, oy + p[1] * s];
      const frames = frame(sc, t);
      frames.forEach((f, idx) => {
        if (f.o <= 0) return;
        const col = TONE[f.tone] || "accent", it = f, mk = itemMarks[idx];
        const base = { c: col, w: 3, a: f.motion === "fade" ? f.o : 1, k: f.motion === "draw" ? f.d : 1, rough: it.hand ? 1.6 : 0, dash: it.dash ? [8, 7] : undefined };
        const isOn = api.marked === mk.id;
        const ringIt = (pts, close) => { if (isOn) api.stroke(pts, { c: "warn", w: 6, a: 0.9, close: !!close }); };
        let hx, hy, hr;
        if (it.mark) {
          const pts = it.pts.map(P);
          api.stroke(pts, { ...base, w: it.mark === "underline" ? 4 : 3.5, fill: it.mark === "scribble" && it.fill ? col : null, fa: 0.25 });
          const e = pts[pts.length - 1]; hx = e[0]; hy = e[1]; hr = 16;
          if (isOn) api.dot(hx, hy, 12, { c: "warn", a: 0.8 });
        } else if (it.from && !it.leader) {
          const a = P(it.a), b = P(it.b);
          const head = it.kind === "arrow" || it.kind === "arc";
          if (it.kind === "bracket") {
            const br = bracketPoints(a, b, it.side || 1, 0.3 * s);
            api.stroke(br.pts, { ...base });
            const mx = (a[0] + b[0]) / 2 - br.n[0] * 0.55 * s, my = (a[1] + b[1]) / 2 - br.n[1] * 0.55 * s;
            if (it.label) api.text(it.label, mx, my, { size: sc.fs * s, c: col, k: f.o, free: true, noHit: true, weight: 700 });
            hx = (a[0] + b[0]) / 2; hy = (a[1] + b[1]) / 2; hr = clamp(Math.hypot(b[0] - a[0], b[1] - a[1]) / 4, 18, 40);
          } else if (it.bend !== undefined || it.kind === "arc") {
            const bend = it.bend === undefined ? 0.35 : it.bend, c = control(it.a, it.b, bend), q = [];
            for (let i = 0; i <= 24; i++) { const u = i / 24, v = 1 - u; q.push(P([v * v * it.a[0] + 2 * v * u * c[0] + u * u * it.b[0], v * v * it.a[1] + 2 * v * u * c[1] + u * u * it.b[1]])); }
            api.stroke(q, { ...base, head: head ? 11 : false });
            const m = q[12]; hx = m[0]; hy = m[1]; hr = 22;
            if (it.label) api.text(it.label, m[0], m[1] - 14, { size: sc.fs * s * 0.9, c: "dim", k: f.o, free: true, noHit: true, weight: 700 });
          } else {
            api.stroke([a, b], { ...base, head: head ? 11 : false });
            hx = (a[0] + b[0]) / 2; hy = (a[1] + b[1]) / 2; hr = clamp(Math.hypot(b[0] - a[0], b[1] - a[1]) / 3, 18, 40);
            if (it.label) api.text(it.label, hx, hy - 14, { size: sc.fs * s * 0.9, c: "dim", k: f.o, free: true, noHit: true, weight: 700 });
          }
          if (isOn) api.stroke([a, b], { c: "warn", w: 6, a: 0.7 });
        } else if (it.kind === "path") {
          const pts = it.pts.map(P), line = it.sharp ? pts : sample(pts, !!it.close);
          api.stroke(line, { ...base, close: !!it.close, fill: it.fill ? col : null, fa: 0.3 });
          const m = pts[Math.floor(pts.length / 2)]; hx = m[0]; hy = m[1]; hr = 24;
          ringIt(line, it.close);
        } else {
          const c = P(it.c), sw = it.size[0] * s * f.s, sh = it.size[1] * s * f.s;
          hx = c[0]; hy = c[1]; hr = clamp(Math.max(sw, sh) / 2, 18, 80);
          const fillc = it.fill ? col : null, o = { ...base, fill: fillc, fa: 0.32 };
          const fs = sc.fs * s, lab = it.label;
          if (it.kind === "circle") { api.ellipse(c[0], c[1], sw / 2, sh / 2, o); ringIt(sample(Array.from({ length: 24 }, (_, i) => [c[0] + Math.cos(i / 24 * 6.2832) * sw / 2, c[1] + Math.sin(i / 24 * 6.2832) * sh / 2]), true), true); }
          else if (it.kind === "box" || it.kind === "pill") { api.rect(c[0] - sw / 2, c[1] - sh / 2, sw, sh, { ...o, r: it.kind === "pill" ? sh / 2 : Math.min(14, sh / 4) }); if (isOn) api.rect(c[0] - sw / 2 - 4, c[1] - sh / 2 - 4, sw + 8, sh + 8, { c: "warn", w: 5, r: 14 }); }
          else if (it.kind === "blob") { const pts = blobPoints(sw, sh, it.i).map((p) => [c[0] + p[0], c[1] + p[1]]); const line = sample(pts, true); api.stroke(line, { ...o, close: true }); ringIt(line, true); }
          else if (it.kind === "dot") { api.dot(c[0], c[1], Math.max(5, sw / 2), { c: col, a: f.o }); if (isOn) api.dot(c[0], c[1], Math.max(5, sw / 2) + 6, { c: "warn", a: 0.5 }); }
          else if (it.kind === "contour") {
            for (let r = it.rings - 1; r >= 0; r--) {
              const pts = ringPoints(sw, sh, it.i, r, it.rings).map((p) => [c[0] + p[0], c[1] + p[1]]);
              api.stroke(sample(pts, true), { ...o, close: true, k: base.k, fill: it.fill ? col : null, fa: 0.1, a: base.a * (0.45 + 0.55 * (r + 1) / it.rings) });
            }
          } else if (it.kind === "callout") {
            const m = api.label(lab || "", c[0], c[1], { size: fs, c: "fg", bg: "panel", border: col, k: f.o, free: true, noHit: true });
            if (it.a && it.b) api.stroke([P(it.a), P(it.b)], { c: col, w: 2.5, k: f.o, head: 9 });
            hr = clamp(((m && m.w) || sw) / 2, 20, 70);
            if (isOn) api.rect(c[0] - hr, c[1] - 18, hr * 2, 36, { c: "warn", w: 4, r: 16 });
          }
          if (lab && it.kind !== "callout") {
            if (it.kind === "dot") api.text(lab, c[0], c[1] + Math.max(5, sw / 2) + fs, { size: fs, c: "fg", k: f.o, free: true, noHit: true, weight: 700, maxw: 140 });
            else if (it.kind === "text") api.text(lab, c[0], c[1], { size: fs * 1.15, c: it.tone === "ink" || !it.tone ? "fg" : col, k: f.o, free: true, noHit: true, weight: 800, maxw: sw + 20 });
            else api.text(lab, c[0], c[1], { size: fs, c: "fg", k: f.o, free: true, noHit: true, weight: 700, maxw: Math.max(40, sw * 0.82) });
            if (it.kind === "text") hr = clamp(api.measure(lab, { size: fs * 1.15, weight: 800 }).w / 2, 18, 80);
          }
        }
        if (hx !== undefined && f.d > 0.5) api.hit(mk.id, hx, hy, hr, mk.label);
        if (onShapes && hx !== undefined && film.choose.options.includes(mk.label) && t > sc.total - 0.3) {
          const on = film.chosen === mk.label, pulse = 0.5 + 0.5 * Math.sin(t * 5);
          api.ellipse(hx, hy, hr + 9 + (on ? 0 : 3 * pulse), hr + 9 + (on ? 0 : 3 * pulse), { c: on ? "good" : "warn", w: on ? 5 : 3, dash: on ? undefined : [6, 6], a: film.chosen && !on ? 0.25 : 0.9 });
        }
      });
      if (film.choose && onShapes) api.text(film.choose.q + (film.chosen ? "" : "  (tap one)"), W / 2, oy + drawH + 24, { size: 15, c: "dim", font: "hand", weight: 700, k: seg(t, sc.total - 0.1, sc.total + 0.4), free: true, noHit: true, maxw: W - 40 });
      else if (film.choose) chooseBlock(api, film, t, sc.total - 0.1, 20, oy + drawH + 6, W - 40, false);
      film.says.slice(0, 1).forEach((s0) => api.say(s0, 0.3, Math.min(total - 0.5, 3.6), { y: "bottom", size: 20 }));
      if (sc.caption) api.say(sc.caption, film.says.length ? 3.8 : 0.3, total + 1, { y: "bottom", size: 20 });
    },
  };
  return film;
}

// ---- sketch ---------------------------------------------------------------------------------------------------------------

function sketchFilm(d, read0) {
  const head = d.head, sides = [{ label: head.before || "Before", rows: [] }];
  for (const o of d.items) {
    if (o.preset === "after") sides.push({ label: String(o.props.label || "After"), rows: [] });
    else sides[sides.length - 1].rows.push(o.props);
  }
  const hasAfter = sides.length > 1;
  const ROW = 0.55, T0 = 0.8;
  const tSwitch = hasAfter ? T0 + sides[0].rows.length * ROW + 1.6 : 0;
  const starts = sides.map((s, si) => s.rows.map((_, j) => (si === 0 ? T0 : tSwitch + 0.6) + j * ROW));
  const lastRow = Math.max(0, ...starts.flat());
  const chooseAt = lastRow + 0.8;
  const total = (read0.choose ? chooseAt + 1 : lastRow + 0.8) + HOLD;
  let n = 0;
  const marks = [];
  sides.forEach((s, si) => s.rows.forEach((r, j) => {
    const text = String(r.text || "");
    const words = r.note ? String(r.note) : r.x ? "This one goes." : r.hi ? "This is the one to look at." : r.button ? "A button." : r.dim ? "Quiet on purpose." : text;
    marks.push({ id: "mark:text:" + slug(text), label: text, words, side: si, appear: starts[si][j], n: ++n });
  }));
  if (head.title) marks.unshift({ id: "mark:text:" + slug(head.title), label: String(head.title), words: "What this picture is about.", side: -1, appear: 0 });
  const film = {
    kind: "sketch", total, marks, sides, choose: read0.choose, chosen: null, says: read0.says, title: String(head.title || ""), caption: "",
    // YUI-329: how tall the frame wants to be (no cap), so a mixed answer can give it a slot
    natural(api) {
      const W = api.w, pad = 18, inner = W - 40 - pad * 2, size = 17;
      const rowsH = Math.max(...sides.map((s) => s.rows.reduce((a, r) => a + api.measure(String(r.text || ""), { size, weight: 600, maxw: inner - (r.button ? 28 : 0) }).h + (r.button ? 20 : 0) + (r.note ? 18 : 0) + 12, 0)));
      const frameKind = String(head.frame || "window");
      return (frameKind === "phone" || frameKind === "window" ? 34 : 14) + (hasAfter ? 30 : 0) + rowsH + pad * 1.5;
    },
    draw(t, api) {
      const W = api.w, H = api.h, fx = 20, fw = W - 40, pad = 18, inner = fw - pad * 2, size = 17;
      // lay both sides out once so the frame holds the taller one
      const lay = sides.map((s) => {
        let y = 0;
        return s.rows.map((r) => {
          const m = api.measure(String(r.text || ""), { size, weight: 600, maxw: inner - (r.button ? 28 : 0) });
          const tall = m.h + (r.button ? 20 : 0), h = tall + (r.note ? 18 : 0) + 12, row = { y, h, tall, tw: m.w, th: m.h };
          y += h; return row;
        });
      });
      const rowsH = Math.max(...lay.map((l) => (l.length ? l[l.length - 1].y + l[l.length - 1].h : 0)));
      const frameKind = String(head.frame || "window"), headH = frameKind === "phone" ? 34 : frameKind === "window" ? 34 : 14;
      const cH = film.choose ? chooseBlock(api, film, t, 0, 0, 0, inner, true) + 8 : 0;
      const badgeH = hasAfter ? 30 : 0;
      const fh = Math.min(H - 330, headH + badgeH + rowsH + cH + pad * 1.5);
      const fy = 150 + Math.max(0, (H - 360 - fh) / 2);
      if (film.title) api.text(film.title, W / 2, fy - 26, { size: 22, weight: 800, k: seg(t, 0, 0.5), maxw: W - 40 });
      const r0 = frameKind === "phone" ? 34 : frameKind === "bubble" ? 26 : 14;
      api.rect(fx, fy, fw, fh, { r: r0, c: "line", w: 3, k: seg(t, 0.1, 0.8), fill: "panel", fa: 0.85 });
      if (frameKind === "window") [0, 1, 2].forEach((i) => api.dot(fx + 20 + i * 16, fy + 17, 4.5, { c: ["bad", "warn", "good"][i], k: seg(t, 0.5, 0.9) }));
      if (frameKind === "phone") api.line(W / 2 - 22, fy + 16, W / 2 + 22, fy + 16, { c: "line", w: 5, k: seg(t, 0.5, 0.9) });
      if (frameKind === "bubble") api.stroke([[fx + 34, fy + fh], [fx + 22, fy + fh + 16], [fx + 54, fy + fh]], { c: "line", w: 3, k: seg(t, 0.6, 1) });
      const upto = hasAfter && t >= tSwitch ? 1 : 0;
      if (hasAfter) {
        const bk = seg(t, 0.8, 1.2) * (upto ? seg(t, tSwitch + 0.4, tSwitch + 0.8) : 1);
        const lab = sides[upto].label;
        api.label(lab.toUpperCase(), fx + fw - 62, fy + headH + 6, { size: 12, weight: 800, c: upto ? "ink" : "ink", bg: upto ? "good" : "bad", border: null, k: bk, free: true, noHit: true });
      }
      const rowTop = fy + headH + badgeH;
      // the side leaving fades while the strikes land; the side arriving draws row by row
      [0, 1].forEach((si) => {
        if (si >= sides.length) return;
        const fade = si === 0 && hasAfter ? 1 - seg(t, tSwitch, tSwitch + 0.5) : 1;
        if (fade <= 0) return;
        sides[si].rows.forEach((r, j) => {
          const t0 = starts[si][j], k = seg(t, t0, t0 + 0.45), L = lay[si][j], x = fx + pad, y = rowTop + L.y;
          if (k <= 0) return;
          const text = String(r.text || ""), dimmed = r.dim || r.x, col = dimmed ? "dim" : "fg";
          const strikeK = r.x && hasAfter && si === 0 ? seg(t, tSwitch - 1.3, tSwitch - 0.7) : r.x ? seg(t, t0 + 0.3, t0 + 0.75) : 0;
          if (r.hi) api.highlight(x - 8, y - 2, inner + 16, L.tall + 3, { c: "warn", a: 0.3 * fade, k: seg(t, t0 + 0.1, t0 + 0.6) });
          if (r.button) {
            api.rect(x, y, inner, L.tall, { r: 14, c: r.hi ? "accent" : "line", w: 2.5, k, a: fade, fill: "ink", fa: 0.6 });
            api.text(text, x + inner / 2, y + L.tall / 2, { size, weight: 700, c: col, k, a: fade, maxw: inner - 28, align: "center" });
          } else {
            api.text(text, x, y, { size, weight: 600, c: col, k, a: fade, align: "left", base: "top", maxw: inner });
          }
          if (strikeK > 0) api.line(x - 2, y + L.th / 2, x + Math.min(inner, L.tw) + 2, y + L.th / 2, { c: "bad", w: 3, k: strikeK, a: fade });
          if (r.note) api.text(String(r.note), x + (r.button ? 8 : 2), y + L.tall + 3, { size: 12, c: r.x ? "bad" : "a2", weight: 700, align: "left", base: "top", k: seg(t, t0 + 0.3, t0 + 0.7), a: fade, free: true, noHit: true });
        });
      });
      if (film.choose) chooseBlock(api, film, t, chooseAt, fx + pad, fy + fh - cH - pad * 0.6 + 4, inner, false);
      film.says.slice(0, 1).forEach((s0) => api.say(s0, 0.3, Math.min(total - 0.5, 3.6), { y: "bottom", size: 20 }));
    },
  };
  return film;
}

// ---- the film for the page --------------------------------------------------------------------------------------------

// text: Yui Lines. Returns { film, scenes } for the player, or { error } when there is nothing to draw.
export function build(text) {
  const mixed = buildMix(text);
  if (mixed) return mixed;
  const r = read(text);
  if (!r.draw && r.figs.length) {
    const cf = chartFilm(r.figs, r, { chooseBlock, HOLD });
    if (!cf) return { error: "nothing to draw" };
    cf.read = r;
    if (cf.choose) cf.choose.options.forEach((o) => cf.marks.push({ id: "mark:text:" + slug(o), label: o, words: "Tap to choose " + o + ".", choice: o, appear: cf.total - 3 }));
    return { film: cf, scenes: [{ name: "yl", dur: cf.total, code: "return window.__yl && window.__yl.draw(t, api);" }] };
  }
  if (!r.draw && r.blocks.length) {
    const lf = listFilm(r.blocks, r, { chooseBlock, HOLD });
    if (!lf) return { error: "nothing to draw" };
    lf.read = r;
    if (lf.choose) lf.choose.options.forEach((o) => lf.marks.push({ id: "mark:text:" + slug(o), label: o, words: "Tap to choose " + o + ".", choice: o, appear: lf.total - 3 }));
    return { film: lf, scenes: [{ name: "yl", dur: lf.total, code: "return window.__yl && window.__yl.draw(t, api);" }] };
  }
  if (!r.draw && r.inputs.length) {
    const inf = inputsFilm(r.inputs, r, { AUTO_ID, HOLD });
    if (!inf) return { error: "nothing to draw" };
    inf.read = r;
    return { film: inf, scenes: [{ name: "yl", dur: inf.total, code: "return window.__yl && window.__yl.draw(t, api);" }] };
  }
  if (!r.draw) return { error: r.errors[0] || "nothing to draw" };
  const film = r.draw.kind === "shapes" ? shapesFilm(r.draw, r) : sketchFilm(r.draw, r);
  film.read = r;
  // the choose options are marks too: a tap on one is the answer
  if (film.choose && !film.onShapes) film.choose.options.forEach((o, i) => film.marks.push({ id: "mark:text:" + slug(o), label: o, words: "Tap to choose " + o + ".", choice: o, appear: film.total - 3 }));
  return { film, scenes: [{ name: "yl", dur: film.total, code: "return window.__yl && window.__yl.draw(t, api);" }] };
}

// What a touched mark says (the canned lines of this prototype; in the app the agent writes them).
export function wordsFor(film, label) {
  const m = film.marks.find((x) => x.label === label || x.id === label);
  return m ? m.words : label;
}
// A tap on a +check row: ticks it, returns { row, on } (or null when the mark is not a checkbox). The page sends `[yui] <id> yl check <row>`.
export function tick(film, id) { return film.tick ? film.tick(id) : null; }
// YUI-328: the inputs of choose / pick / ask / slide / form. touch(id) answers a tap ({ say, line } | { edit } | null); drag, nudge and
// setText are the knob and the text overlay. Each returns what the page says and the Yui event line it sends, or null.
export function touch(film, id) { return film.touch ? film.touch(id) : null; }
export function drag(film, d) { return film.drag ? film.drag(d) : null; }
export function nudge(film, d) { return film.nudge ? film.nudge(d) : null; }
export function setText(film, key, text) { return film.setText ? film.setText(key, text) : null; }
export function isChoice(film, label) { return !!(film.choose && film.choose.options.includes(label)); }
