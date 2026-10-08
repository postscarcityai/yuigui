// YUI-327: lists, tables, timelines and cards on the living canvas. A `list` (with +check), `table`, `timeline` (done / now / next rows)
// or `card` answer becomes marks drawn on the same canvas clock as a film: rows write in one after another, checkboxes draw, the
// timeline spine draws and its Now step pulses, table rules draw before the cells. Every row, cell, check and step is a hit target
// named by its words ('Squat 5x5'), so tap, hold, drag-to-scrub and the keyboard model of YUI-321/324 work unchanged (each one is a
// named hidden button, in order). A +check row ticks on a tap and sends `[yui] <id> yl check <row>`. A `choose` under the picture
// is drawn into it by yl-canvas.mjs (chooseBlock, passed in).
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const seg = (t, a, b) => clamp((t - a) / (b - a), 0, 1);
const slug = (s) => String(s).trim().toLowerCase().replace(/[^a-z0-9]+/g, "_").slice(0, 28);
const ROW = 0.3;        // seconds between one row and the next
const LEAD = 0.5;       // seconds the title and the rules take before the first row
const GAP = 18;         // pixels between two blocks

const cellText = (v) => (typeof v === "number" ? v.toLocaleString("en-US", { maximumFractionDigits: 2 }) : String(v));
const withUnit = (v, u) => (u ? (u.length <= 1 && !/[a-z]/i.test(u) ? u + cellText(v) : cellText(v) + " " + u) : cellText(v));

// ---- reading -------------------------------------------------------------------------------------------------------------

// ops: the parsed list / table / timeline / done / now / next / card ops in line order (steps carry `in` = the timeline id).
function readBlocks(ops) {
  const out = [];
  for (const o of ops) {
    const p = o.props;
    if (o.preset === "list") out.push({ kind: "list", id: o.id, title: String(p.title || ""), items: (p.items || []).map(String), check: !!p.check, num: !!p.num, later: new Set([].concat(p.later === undefined ? [] : p.later).map(String)) });
    else if (o.preset === "table") out.push({ kind: "table", id: o.id, name: String(p.name || ""), cols: (p.cols || []).map(String), rows: (p.rows || []).map((r) => (Array.isArray(r) ? r : [r])), units: (p.units || []).map(String) });
    else if (o.preset === "card") out.push({ kind: "card", id: o.id, title: String(p.title || ""), body: String(p.body || ""), sub: String(p.sub || ""), cta: String(p.cta || "") });
    else if (o.preset === "timeline") out.push({ kind: "timeline", id: o.id, title: String(p.title || ""), mark: String(p.mark || "Now"), steps: [] });
    else if (o.preset === "done" || o.preset === "now" || o.preset === "next") {
      const tl = out.find((b) => b.kind === "timeline" && b.id === o.in) || [...out].reverse().find((b) => b.kind === "timeline");
      if (tl) tl.steps.push({ state: o.preset, text: String(p.text || ""), at: String(p.at || ""), tag: String(p.tag || ""), sub: String(p.sub || "") });
    }
  }
  return out.filter((b) => (b.kind === "list" ? b.items.length : b.kind === "table" ? b.cols.length && b.rows.length : b.kind === "timeline" ? b.steps.length : b.title || b.body));
}

// ---- marks (names, ids and the words a touch says) -----------------------------------------------------------------------

function listMarks(b) {
  return b.items.map((it, i) => ({
    id: `list:${b.id}:${i}`, label: it, fig: b.id, index: i, check: b.check,
    words: `${b.num ? "Number " + (i + 1) + " of " + b.items.length + ". " : ""}${b.check ? "A checkbox. Tap it to tick it." : i === b.items.length - 1 ? "The last one." : "One of " + b.items.length + "."}`,
  }));
}
function tableMarks(b) {
  const out = [], colU = (c) => b.units[c] || "";
  b.cols.forEach((c, ci) => out.push({ id: `table:${b.id}:h:${ci}`, label: colU(ci) ? `${c} (${colU(ci)})` : c, words: `The ${c} column. ${b.rows.length} rows under it.`, fig: b.id, row: -1, col: ci }));
  b.rows.forEach((r, ri) => b.cols.forEach((c, ci) => {
    const v = r[ci] === undefined ? "" : r[ci], first = String(r[0]), txt = withUnit(v, colU(ci));
    const nums = b.rows.map((x) => x[ci]).filter((x) => typeof x === "number");
    const top = typeof v === "number" && nums.length > 1 && v === Math.max(...nums), low = typeof v === "number" && nums.length > 1 && v === Math.min(...nums);
    out.push({ id: `table:${b.id}:${ri}:${ci}`, label: ci === 0 ? txt : `${first} ${c}: ${txt}`, words: ci === 0 ? `Row ${ri + 1} of ${b.rows.length}. ${b.cols.slice(1).map((cc, k) => cc + " " + withUnit(r[k + 1], colU(k + 1))).join(", ")}.` : `${first}, ${c}: ${txt}.${top ? " The highest in this column." : low ? " The lowest in this column." : ""}`, fig: b.id, row: ri, col: ci });
  }));
  return out;
}
const STATE_WORDS = { done: "Done.", now: "This is the one happening now.", next: "Still to come." };
function timelineMarks(b) {
  return b.steps.map((s, i) => {
    const nowI = b.steps.findIndex((x) => x.state === "now"), nextStep = b.steps.slice(i + 1).find((x) => x.state !== "done");
    const bits = [STATE_WORDS[s.state]];
    if (s.at) bits.push(s.state === "done" ? "Finished " + s.at + "." : "On " + s.at + ".");
    if (s.sub) bits.push(s.sub + ".");
    if (s.state === "now" && nextStep) bits.push("After it: " + nextStep.text + ".");
    else if (s.state === "next" && nowI >= 0 && i === nowI + 1) bits.push("The one after now.");
    return { id: `tl:${b.id}:${i}`, label: s.text, words: bits.join(" "), fig: b.id, index: i, state: s.state };
  });
}
function cardMarks(b) {
  const out = [];
  if (b.title) out.push({ id: `card:${b.id}:title`, label: b.title, words: "What this card is about.", fig: b.id });
  if (b.body) out.push({ id: `card:${b.id}:body`, label: b.body.length > 40 ? b.body.slice(0, 38).trim() + "…" : b.body, words: b.body, fig: b.id });
  if (b.sub) out.push({ id: `card:${b.id}:sub`, label: b.sub, words: "The small print: " + b.sub + ".", fig: b.id });
  if (b.cta) out.push({ id: `card:${b.id}:cta`, label: b.cta, words: "A button. In the app it does the thing: " + b.cta + ".", fig: b.id });
  return out;
}

// ---- timing --------------------------------------------------------------------------------------------------------------

function blockDur(b) {
  if (b.kind === "list") return LEAD + b.items.length * ROW + 0.4;
  if (b.kind === "table") return LEAD + 0.5 + b.rows.length * ROW + 0.4;
  if (b.kind === "timeline") return LEAD + b.steps.length * (ROW + 0.1) + 0.5;
  return 1.8;
}
// when the mark with this index appears, relative to its block start
function markAppear(b, m) {
  if (b.kind === "list") return LEAD + m.index * ROW;
  if (b.kind === "table") return LEAD + 0.5 + (m.row < 0 ? 0 : (m.row + 1) * ROW) + m.col * 0.04;
  if (b.kind === "timeline") return LEAD + m.index * (ROW + 0.1) + 0.2;
  return 0.3 + (m.id.endsWith(":cta") ? 0.8 : m.id.endsWith(":body") ? 0.4 : m.id.endsWith(":sub") ? 0.6 : 0);
}

// ---- layout (needs api.measure, so it runs inside draw) --------------------------------------------------------------------

const LIST_ROW = 44, TL_ROW = 50, TL_ROW2 = 62, TBL_HEAD = 34, TBL_ROW = 40, HEAD = 34;

function tableCols(api, b, inner) {
  const ws = b.cols.map((c, ci) => {
    let w = api.measure(b.units[ci] ? `${c} (${b.units[ci]})` : c, { size: 13, weight: 800 }).w;
    b.rows.forEach((r) => { w = Math.max(w, api.measure(cellText(r[ci] === undefined ? "" : r[ci]), { size: 16, weight: 600 }).w); });
    return w + 20;
  });
  const sum = ws.reduce((a, c) => a + c, 0), f = sum ? inner / sum : 1;
  return ws.map((w) => w * f);
}

function cardLayout(api, b, inner) {
  const pad = 18, tw = inner - pad * 2;
  const t = b.title ? api.measure(b.title, { size: 22, weight: 800, maxw: tw }) : { h: 0 };
  const body = b.body ? api.measure(b.body, { size: 16, weight: 500, maxw: tw }) : { h: 0 };
  const sub = b.sub ? api.measure(b.sub, { size: 13, weight: 700, maxw: tw }) : { h: 0 };
  const ctaW = b.cta ? Math.min(tw, api.measure(b.cta, { size: 16, weight: 800 }).w + 44) : 0;
  const parts = [t.h, body.h, sub.h, b.cta ? 42 : 0].filter((x) => x), h = pad * 2 + parts.reduce((a, c) => a + c, 0) + (parts.length - 1) * 10;
  return { pad, tw, t, body, sub, ctaW, h };
}

function blockHeight(api, b, inner) {
  if (b.kind === "list") return (b.title ? HEAD : 0) + b.items.length * LIST_ROW;
  if (b.kind === "table") return (b.name ? HEAD : 0) + TBL_HEAD + b.rows.length * TBL_ROW;
  if (b.kind === "timeline") return (b.title ? HEAD : 0) + b.steps.reduce((a, s) => a + (s.sub || s.tag ? TL_ROW2 : TL_ROW), 0);
  return cardLayout(api, b, inner).h;
}

// ---- drawing -------------------------------------------------------------------------------------------------------------

function box(api, id, x, y, w, h, label) { api.hitBox(id, x + w / 2, y + h / 2, w, h, label); }

function drawList(api, b, mk, t, x, y, w, f, checked) {
  if (b.title) api.text(b.title, x + 4, y + HEAD / 2, { size: 22, weight: 800, align: "left", k: seg(t, 0, 0.4), maxw: w });
  let yy = y + (b.title ? HEAD : 0);
  const ph = LIST_ROW * f;
  b.items.forEach((it, i) => {
    const m = mk[i], k = seg(t, markAppear(b, m), markAppear(b, m) + 0.35);
    if (k > 0) {
      const cy = yy + ph / 2, on = checked.has(m.id), soft = !!b.later && b.later.has(it);
      let tx = x + 6;
      api.line(x, yy + ph, x + w, yy + ph, { c: "line", w: 1.5, k, a: 0.55, rough: 0 });
      if (b.check) {
        api.rect(x + 6, cy - 12, 24, 24, { r: 7, c: on ? "good" : soft ? "dim" : "accent", w: 3, k, fill: on ? "good" : null, fa: 0.22 });
        if (on) api.stroke([[x + 12, cy], [x + 17, cy + 6], [x + 26, cy - 6]], { c: "good", w: 4, k: 1, rough: 0 });
        tx = x + 44;
      } else if (b.num) { api.text(`${i + 1}.`, x + 6, cy, { size: 17, weight: 800, c: "accent", align: "left", k, free: true, noHit: true }); tx = x + 38; }
      else { api.dot(x + 14, cy, 4.5, { c: "accent", a: k }); tx = x + 34; }
      api.text(it, tx, cy, { size: 18, weight: 600, align: "left", c: on || soft ? "dim" : "fg", k, free: true, noHit: true, maxw: w - (tx - x) - 6 });
      if (soft && !on) { const tw3 = Math.min(w - (tx - x) - 6, api.measure(it, { size: 18, weight: 600 }).w); api.line(tx - 2, cy, tx + tw3 + 2, cy, { c: "dim", w: 2, k, rough: 0 }); }   // YUI-332: "later" strikes the row soft
      if (on) { const tw2 = Math.min(w - (tx - x) - 6, api.measure(it, { size: 18, weight: 600 }).w); api.line(tx - 2, cy, tx + tw2 + 2, cy, { c: "good", w: 2.5, k: 1, rough: 0 }); }
      if (k > 0.4) box(api, m.id, x, yy + 2, w, ph - 4, m.label);
    }
    yy += ph;
  });
  return yy;
}

function drawTable(api, b, mk, t, x, y, w, f) {
  if (b.name) api.text(b.name, x + 4, y + HEAD / 2, { size: 22, weight: 800, align: "left", k: seg(t, 0, 0.4), maxw: w });
  let yy = y + (b.name ? HEAD : 0);
  const cw = tableCols(api, b, w), xs = cw.reduce((a, c, i) => (a.push(i ? a[i - 1] + cw[i - 1] : x), a), []);
  const hh = TBL_HEAD * f, rh = TBL_ROW * f, bottom = yy + hh + rh * b.rows.length;
  // the rules draw first: top, under the header, one under each row, then the column ticks
  const kr = seg(t, 0.1, LEAD + 0.5);
  api.line(x, yy, x + w, yy, { c: "dim", w: 2.5, k: kr, rough: 0 });
  api.line(x, yy + hh, x + w, yy + hh, { c: "dim", w: 2.5, k: kr, rough: 0 });
  b.rows.forEach((_, ri) => api.line(x, yy + hh + rh * (ri + 1), x + w, yy + hh + rh * (ri + 1), { c: "line", w: 1.5, k: seg(t, 0.2 + ri * 0.08, 0.7 + ri * 0.08), a: 0.7, rough: 0 }));
  const num = b.cols.map((_, ci) => b.rows.every((r) => typeof r[ci] === "number"));
  let ci0 = 0;
  const cell = (m, str, cx0, cy0, cwid, chei, o) => {
    const k = seg(t, markAppear(b, m), markAppear(b, m) + 0.3);
    if (k <= 0) return;
    const right = o.right, tx = right ? cx0 + cwid - 10 : cx0 + 10;
    api.text(str, tx, cy0 + chei / 2, { size: o.size, weight: o.weight, c: o.c, align: right ? "right" : "left", k, free: true, noHit: true, maxw: cwid - 14 });
    if (k > 0.4) box(api, m.id, cx0 + 1, cy0 + 1, cwid - 2, chei - 2, m.label);
  };
  b.cols.forEach((c, ci) => cell(mk[ci], b.units[ci] ? `${c} (${b.units[ci]})` : c, xs[ci], yy, cw[ci], hh, { size: 13, weight: 800, c: "dim", right: num[ci] }));
  b.rows.forEach((r, ri) => b.cols.forEach((c, ci) => {
    const m = mk[b.cols.length + ri * b.cols.length + ci];
    cell(m, cellText(r[ci] === undefined ? "" : r[ci]), xs[ci], yy + hh + rh * ri, cw[ci], rh, { size: 16, weight: ci === 0 ? 800 : 600, c: "fg", right: num[ci] });
  }));
  ci0 = bottom;
  return ci0;
}

function drawTimeline(api, b, mk, t, x, y, w, f) {
  if (b.title) api.text(b.title, x + 4, y + HEAD / 2, { size: 22, weight: 800, align: "left", k: seg(t, 0, 0.4), maxw: w });
  let yy = y + (b.title ? HEAD : 0);
  const sx = x + 22, rows = b.steps.map((s) => (s.sub || s.tag ? TL_ROW2 : TL_ROW) * f), centres = [];
  rows.reduce((acc, h) => (centres.push(acc + h / 2), acc + h), yy);
  const first = centres[0], last = centres[centres.length - 1];
  // the spine draws down the page as the steps arrive
  if (last > first) api.line(sx, first, sx, last, { c: "line", w: 3, k: seg(t, LEAD, LEAD + b.steps.length * (ROW + 0.1)), rough: 0 });
  b.steps.forEach((s, i) => {
    const m = mk[i], k = seg(t, markAppear(b, m), markAppear(b, m) + 0.35), cy = centres[i], top = cy - rows[i] / 2;
    if (k <= 0) return;
    const now = s.state === "now", done = s.state === "done";
    if (now) api.rect(x + 40, top + 3, w - 40, rows[i] - 6, { r: 14, c: "accent", w: 2, k, fill: "accent", fa: 0.1, rough: 0 });
    if (done) { api.dot(sx, cy, 11, { c: "good", a: k }); api.stroke([[sx - 5, cy], [sx - 1.5, cy + 4], [sx + 5, cy - 4]], { c: "ink", w: 2.8, k, rough: 0 }); }
    else if (now) { const pulse = 0.5 + 0.5 * Math.sin(t * 5); api.dot(sx, cy, 11, { c: "accent", a: k }); api.circle(sx, cy, 15 + 4 * pulse, { c: "accent", w: 3, a: (0.9 - 0.55 * pulse) * k, rough: 0 }); }
    else api.circle(sx, cy, 10, { c: "dim", w: 3, k, rough: 0 });
    const tx = x + 54, sub = [s.tag, s.sub].filter(Boolean).join("  ·  ");
    const line1 = sub ? cy - 11 : cy;
    api.text(s.text, tx, line1, { size: now ? 19 : 17, weight: now ? 800 : 700, c: done ? "dim" : "fg", align: "left", k, free: true, noHit: true, maxw: w - 54 - (s.at ? 80 : 0) });
    if (sub) api.text(sub, tx, cy + 13, { size: 13, weight: 600, c: "dim", align: "left", k: seg(k, 0.3, 1), free: true, noHit: true, maxw: w - 62 });
    if (s.at) api.text(s.at, x + w - 12, line1, { size: 13, weight: 700, c: now ? "accent" : "dim", align: "right", k, free: true, noHit: true });
    else if (now) api.text(b.mark.toUpperCase(), x + w - 12, line1, { size: 12, weight: 800, c: "accent", align: "right", k, free: true, noHit: true });
    if (k > 0.4) box(api, m.id, x + 38, top + 2, w - 38, rows[i] - 4, m.label);
  });
  return yy + rows.reduce((a, c) => a + c, 0);
}

function drawCard(api, b, mk, t, x, y, w) {
  const L = cardLayout(api, b, w), k0 = seg(t, 0, 0.4);
  if (k0 <= 0) return y;
  api.rect(x, y, w, L.h, { r: 20, c: "line", w: 2.5, k: k0, fill: "panel", fa: 0.9, rough: 0 });
  let yy = y + L.pad;
  const id = (suf) => mk.find((m) => m.id.endsWith(":" + suf));
  const part = (suf, h, draw) => {
    const m = id(suf); if (!m) return;
    const k = seg(t, markAppear(b, m), markAppear(b, m) + 0.35);
    if (k > 0) { draw(k); if (k > 0.4) box(api, m.id, x + 6, yy - 4, w - 12, h + 8, m.label); }
    yy += h + 10;
  };
  part("title", L.t.h, (k) => api.text(b.title, x + L.pad, yy, { size: 22, weight: 800, align: "left", base: "top", k, free: true, noHit: true, maxw: L.tw }));
  part("body", L.body.h, (k) => api.text(b.body, x + L.pad, yy, { size: 16, weight: 500, c: "fg", align: "left", base: "top", k, free: true, noHit: true, maxw: L.tw }));
  part("sub", L.sub.h, (k) => api.text(b.sub, x + L.pad, yy, { size: 13, weight: 700, c: "dim", align: "left", base: "top", k, free: true, noHit: true, maxw: L.tw }));
  if (b.cta) {
    const m = id("cta"), k = seg(t, markAppear(b, m), markAppear(b, m) + 0.4);
    if (k > 0) {
      api.rect(x + L.pad, yy, L.ctaW, 42, { r: 21, c: "accent", w: 2.5, k, fill: "accent", fa: 0.9, rough: 0 });
      api.text(b.cta, x + L.pad + L.ctaW / 2, yy + 21, { size: 16, weight: 800, c: "ink", k: seg(k, 0.4, 1), free: true, noHit: true, maxw: L.ctaW - 20 });
      if (k > 0.4) box(api, m.id, x + L.pad, yy, L.ctaW, 42, m.label);
    }
  }
  return y + L.h;
}

// ---- the film for the page -----------------------------------------------------------------------------------------------

// ops: parsed list / table / timeline / done / now / next / card ops in line order. host: { chooseBlock, HOLD } from yl-canvas.mjs.
export function listFilm(ops, read0, host) {
  const blocks = readBlocks(ops);
  if (!blocks.length) return null;
  const starts = [], durs = blocks.map(blockDur);
  blocks.reduce((acc, _, i) => (starts.push(acc), acc + durs[i] - 0.3), 0);
  const end = Math.max(...blocks.map((_, i) => starts[i] + durs[i]));
  const total = end + (read0.choose ? 1.2 : 0) + host.HOLD;
  const marks = [];
  blocks.forEach((b, i) => {
    b.marks = b.kind === "list" ? listMarks(b) : b.kind === "table" ? tableMarks(b) : b.kind === "timeline" ? timelineMarks(b) : cardMarks(b);
    const head = b.kind === "table" ? b.name : b.title;
    if (head && b.kind !== "card") marks.push({ id: "mark:text:" + slug(head), label: head, words: "What this " + (b.kind === "list" ? "list" : b.kind) + " is about.", appear: starts[i] });
    b.marks.forEach((m) => marks.push({ ...m, appear: starts[i] + markAppear(b, m) }));
  });
  const checked = new Set();
  const film = {
    kind: "lists", total, marks, choose: read0.choose, chosen: null, onShapes: false, says: read0.says, title: blocks.find((b) => b.title || b.name)?.title || "", blocks, checked,
    // a tap on a +check row ticks or unticks it; returns { row, on } for the line the app sends, or null for any other mark
    tick(id) {
      const m = marks.find((x) => x.id === id && x.check);
      if (!m) return null;
      if (checked.has(id)) checked.delete(id); else checked.add(id);
      return { row: m.label, on: checked.has(id) };
    },
    // YUI-329: the height the blocks want at full pitch, so a mixed answer can give them a slot
    height(api) { return blocks.map((b) => blockHeight(api, b, api.w - 40)).reduce((a, c) => a + c, 0) + GAP * (blocks.length - 1); },
    draw(t, api) {
      const W = api.w, H = api.h, top = 112, areaB = H - 196, fx = 20, fw = W - 40;
      const cH = film.choose ? host.chooseBlock(api, film, t, 0, 0, 0, W - 40, true) : 0;
      const avail = Math.max(160, areaB - top - cH - 4);
      const hs = blocks.map((b) => blockHeight(api, b, fw)), nat = hs.reduce((a, c) => a + c, 0) + GAP * (blocks.length - 1);
      // too tall for the phone: the row pitch shrinks, the type does not
      const f = nat > avail ? clamp(avail / nat, 0.62, 1) : 1;
      const used = nat * f;
      let yy = top + Math.max(0, (avail - used) / 2);
      blocks.forEach((b, i) => {
        const tt = t - starts[i];
        const bottom = yy + hs[i] * (b.kind === "card" ? 1 : f);
        if (tt >= 0) {
          if (b.kind === "list") drawList(api, b, b.marks, tt, fx, yy, fw, f, checked);
          else if (b.kind === "table") drawTable(api, b, b.marks, tt, fx, yy, fw, f);
          else if (b.kind === "timeline") drawTimeline(api, b, b.marks, tt, fx, yy, fw, f);
          else drawCard(api, b, b.marks, tt, fx, yy, fw);
        }
        yy = bottom + GAP * f;
      });
      if (film.choose) host.chooseBlock(api, film, t, end - 0.1, 20, areaB - cH, W - 40, false);
      film.says.slice(0, 1).forEach((s0) => api.say(s0, 0.3, Math.min(total - 0.5, 3.6), { y: "bottom", size: 20 }));
    },
  };
  return film;
}
