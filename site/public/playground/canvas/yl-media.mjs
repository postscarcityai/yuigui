// YUI-338: pictures on the living canvas. An `image`, a `gallery` and a `compare` (spec/YL.md, Media) draw on the same canvas clock as a film:
// the frame strokes in, the picture fades up inside it, the caption writes on, and `+edit` marks (rings, with an arrow and a number) draw on top
// as marks of their own. A gallery lays its pictures out as a strip of marks; with `+pick` a tap picks one and sends a mark event. A compare
// draws before and after in one frame with a divider you drag. Every picture, every ring and the divider is a hit target named by its caption, so
// tap, hold, drag, undo and the keyboard model of YUI-321/324/330/334 work unchanged. Pictures are fetched by URL once (preload) and drawn from
// the browser's image cache; with no network the frame still draws and the picture is a quiet panel. No model calls.
// Mark ids (dotted, like `term.E` and `calc.r`): `image.<caption slug>` and its rings `image.<slug>.ring.<n>`; `gallery.<n>` (1-based);
// `compare.before`, `compare.after`, `compare.divider` and `compare.change.<n>`. A second media block in one answer is not drawn (the first is).

const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const seg = (t, a, b) => clamp((t - a) / (b - a), 0, 1);
const ease = (u) => u * u * (3 - 2 * u);
const eout = (u) => 1 - Math.pow(1 - u, 3);
const now = () => (typeof performance !== "undefined" ? performance.now() : Date.now());
const slug = (s) => String(s).trim().toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_|_$/g, "").slice(0, 24);
const TWEEN = 0.3;   // seconds the divider takes to ease to where it was dropped
const KEY_STEP = 10; // percent per arrow key on the divider

let META = { ask: "" };
export function setMeta(m) { META = { ask: "", ...(m || {}) }; }
const ask = () => META.ask || "media";

// ---- pictures ----------------------------------------------------------------------------------------------------------

const IMGS = new Map();
export function imageOf(src) {
  if (!src || typeof Image === "undefined") return null;
  let e = IMGS.get(src);
  if (!e) { const img = new Image(); e = { img, done: null }; e.done = new Promise((res) => { img.onload = img.onerror = () => res(e); }); img.src = src; IMGS.set(src, e); }
  return e;
}
const ready = (e) => !!(e && e.img.complete && e.img.naturalWidth);
const ratioOf = (e, fallback) => (ready(e) ? e.img.naturalWidth / e.img.naturalHeight : fallback);
// Every picture URL a media answer names (same rule as the parser: a token that starts with /, http:// or https://), fetched before the film is built.
const MEDIA = /^\s*(image|gallery|compare)\b/m;
export const isMedia = (text) => MEDIA.test(String(text));
export function prepare(text) {
  if (!isMedia(text)) return Promise.resolve(null);
  const urls = [...new Set([...String(text).matchAll(/(?:^|[\s|"=])((?:\/|https?:\/\/)[^\s|"]+\.(?:jpe?g|png|webp|gif|svg)(?:\?[^\s|"]*)?)/gi)].map((m) => m[1]))];
  return Promise.race([Promise.all(urls.map((u) => (imageOf(u) || { done: null }).done)), new Promise((res) => setTimeout(res, 4000))]);
}

// ---- reading ---------------------------------------------------------------------------------------------------------------

const boxesOf = (hl) => (Array.isArray(hl) ? hl : typeof hl === "string" ? hl.split("|") : []).map((b) => (Array.isArray(b) ? b : String(b).split(",")).map(Number)).filter((b) => b.length === 4 && b.every(Number.isFinite));
const pct = (v) => Math.round(v * 100);

// A ring on a picture drawn at x,y,w,h: the ellipse round the box (percent of the picture), where its number and arrow sit, and where it is hit.
function ringGeo(b, x, y, w, h, pic) {
  const cx = x + ((b[0] + b[2] / 2) / 100) * w, cy = y + ((b[1] + b[3] / 2) / 100) * h;
  const rx = Math.min(Math.max(16, (b[2] / 200) * w * 1.12 + 3), cx - x + 5, x + w - cx + 5), ry = Math.min(Math.max(16, (b[3] / 200) * h * 1.12 + 3), cy - y + 5, y + h - cy + 5);
  let dx = cx - (pic ? pic.x + pic.w / 2 : cx), dy = cy - (pic ? pic.y + pic.h / 2 : cy - 1);
  const L = Math.hypot(dx, dy) || 1; dx /= L; dy /= L;
  const edge = (rx * ry) / Math.hypot(ry * dx, rx * dy);
  return { cx, cy, rx, ry, from: [cx + dx * (edge + 44), cy + dy * (edge + 44)], to: [cx + dx * (edge + 5), cy + dy * (edge + 5)] };
}
const ellipse = (cx, cy, rx, ry) => { const P = []; for (let i = 0; i <= 40; i++) { const a = -Math.PI / 2 + (i / 40) * Math.PI * 2; P.push([cx + Math.cos(a) * rx, cy + Math.sin(a) * ry]); } return P; };

// the frame strokes in, the picture fades up inside it (a quiet panel while it loads or when it will not)
function picture(api, e, x, y, w, h, kFrame, kFade, on) {
  if (on) api.rect(x - 3, y - 3, w + 6, h + 6, { c: "warn", w: 5, a: 0.8, r: 12, rough: 0 });
  api.rect(x - 2, y - 2, w + 4, h + 4, { c: "fg", w: 2.5, r: 10, k: kFrame, rough: 0, a: 0.9 });
  if (kFade <= 0) return;
  if (!(ready(e) && api.image && api.image(e.img, x, y, w, h, { a: ease(kFade), r: 8 }))) api.rect(x, y, w, h, { c: "line", w: 0, fill: "panel", r: 8, a: ease(kFade), rough: 0 });
}
function ringsOn(api, rings, geos, t, t0, ids, base, on) {
  rings.forEach((b, i) => {
    const g = geos[i], k = seg(t, t0 + i * 0.7, t0 + i * 0.7 + 0.5), ka = seg(t, t0 + i * 0.7 + 0.45, t0 + i * 0.7 + 0.75);
    if (k <= 0) return;
    const lit = on === ids[i];
    if (lit) api.stroke(ellipse(g.cx, g.cy, g.rx + 3, g.ry + 3), { c: "fg", w: 6, a: 0.9, close: true, rough: 0 });
    api.stroke(ellipse(g.cx, g.cy, g.rx, g.ry), { c: "warn", w: 3, k, close: true, rough: 0 });
    if (ka > 0) { api.arrow(g.from[0], g.from[1], g.to[0], g.to[1], { c: "warn", w: 2.5, k: ka, head: true, rough: 0 }); api.pin(i + 1, g.from[0], g.from[1], { k: ka, r: 11, c: "warn" }); }
    if (ka > 0.6) api.hit(ids[i], g.from[0], g.from[1], 16, base.labels[i]);   // the numbered badge is the mark: the picture under the ring stays touchable as itself
  });
}

// d: { id, preset, props }. read0: { says, choose }. host: { chooseBlock, HOLD }.
export function mediaFilm(d, read0, host) {
  const p = d.props || {};
  if (d.preset === "image") return imageFilm(d, p, read0, host);
  if (d.preset === "gallery") return galleryFilm(d, p, read0, host);
  if (d.preset === "compare") return compareFilm(d, p, read0, host);
  return null;
}

const area = (api, film, cH) => ({ top: 120, bottom: api.h - 196 - cH });
function frameChoose(film, host, api, t, from, cH, y) { if (film.choose) host.chooseBlock(api, film, t, from, 20, y, api.w - 40, false); }

// ---- image -------------------------------------------------------------------------------------------------------------------

function imageFilm(d, p, read0, host) {
  const e = imageOf(p.src), cap = String(p.caption || "").trim(), label = String(p.alt || cap || "Picture"), base = "image." + (slug(cap) || "picture");
  const rings = p.edit || p.hl ? boxesOf(p.hl) : [];
  const ids = rings.map((_, i) => `${base}.ring.${i + 1}`), labels = rings.map((_, i) => `Change ${i + 1}`);
  const R0 = 2.6, total = (rings.length ? R0 + rings.length * 0.7 + 0.4 : cap ? 2.6 : 1.7) + (read0.choose ? 1.2 : 0) + host.HOLD;
  const marks = [{ id: base, label, words: `${cap || "A picture"}.${p.edit ? " Circle what to change." : ""}`, appear: 0.8 }];
  rings.forEach((_, i) => marks.push({ id: ids[i], label: labels[i], words: `Change ${i + 1}: circled on the picture.`, appear: R0 + i * 0.7 + 0.4 }));
  const film = {
    kind: "media", media: "image", total, marks, choose: read0.choose, chosen: null, onShapes: false, says: read0.says, title: "", caption: cap,
    draw(t, api) {
      const W = api.w, H = api.h, cH = film.choose ? host.chooseBlock(api, film, t, 0, 0, 0, W - 40, true) : 0, capH = cap ? 46 : 0;
      const A = area(api, film, cH), aw = W - 40, ah = Math.max(140, A.bottom - A.top - capH - 6), r = ratioOf(e, 4 / 3);
      const w = Math.min(aw, ah * r), h = w / r, x = (W - w) / 2, y = A.top + Math.min((ah - h) / 2, 40) + 4;
      const on = api.marked;
      picture(api, e, x, y, w, h, seg(t, 0, 0.8), seg(t, 0.6, 1.5), on === base);
      if (t > 0.9) api.hitBox(base, x + w / 2, y + h / 2, w, h, label);
      if (cap) api.text(cap, W / 2, y + h + 26, { size: 18, c: "fg", weight: 600, type: true, k: seg(t, 1.4, 2.5), free: true, noHit: true, maxw: aw });
      const geos = rings.map((b) => ringGeo(b, x, y, w, h, { x, y, w, h }));
      ringsOn(api, rings, geos, t, R0, ids, { labels }, on);
      frameChoose(film, host, api, t, R0 + rings.length * 0.7, cH, y + h + capH + 10);
      film.says.slice(0, 1).forEach((s0) => api.say(s0, 0.3, Math.min(total - 0.5, 3.6), { y: "bottom", size: 20 }));
    },
  };
  return film;
}

// ---- gallery -----------------------------------------------------------------------------------------------------------------

function galleryFilm(d, p, read0, host) {
  const items = (p.items || []).map(String), caps = (p.caps || []).map(String), n = items.length;
  if (!n) return null;
  const es = items.map(imageOf), pick = !!p.pick, max = p.max > 0 ? +p.max : n, title = String(p.title || "").trim();
  const ids = items.map((_, i) => `gallery.${i + 1}`), labels = items.map((_, i) => caps[i] || `Picture ${i + 1}`);
  const picked = new Set();
  const total = 0.3 * (n - 1) + 1.9 + (read0.choose ? 1.2 : 0) + host.HOLD;
  const wordsOf = (i) => `${labels[i]}${n > 1 ? `, ${i + 1} of ${n}` : ""}.${pick ? (picked.has(ids[i]) ? " Picked." : " Tap to pick.") : ""}`;
  const marks = ids.map((id, i) => ({ id, label: labels[i], words: wordsOf(i), appear: 0.3 * i + 0.7 }));
  const film = {
    kind: "media", media: "gallery", total, marks, choose: read0.choose, chosen: null, onShapes: false, says: read0.says, title, caption: "",
    checked: picked,   // the page copies this set into a redrawn film, so a pick survives a hold
    wordsFor(label) { const i = labels.indexOf(label); return i < 0 ? null : wordsOf(i); },
    touch(id) {
      const i = ids.indexOf(id); if (i < 0 || !pick) return null;
      if (picked.has(id)) { picked.delete(id); return { say: `${labels[i]}: not picked.`, line: `[yui] ${ask()} canvas unpick mark=${id}` }; }
      if (picked.size >= max) return { say: `Pick up to ${max}. Unpick one first.`, line: null };
      picked.add(id);
      return { say: `${labels[i]}: picked${max < n ? `, ${picked.size} of ${max}` : ""}.`, line: `[yui] ${ask()} canvas pick mark=${id}` };
    },
    draw(t, api) {
      const W = api.w, cH = film.choose ? host.chooseBlock(api, film, t, 0, 0, 0, W - 40, true) : 0, capH = caps.some(Boolean) ? 24 : 0;
      const A = area(api, film, cH), gap = 12, cols = n <= 3 ? n : n === 4 ? 2 : 3, rows = Math.ceil(n / cols), titleH = title ? 30 : 0;
      const ah = Math.max(160, A.bottom - A.top - titleH - 6), aw = W - 40, r0 = ratioOf(es[0], 0.8);
      let tw = Math.min(176, (aw - gap * (cols - 1)) / cols); const th0 = Math.min(tw / r0, (ah - rows * (capH + gap)) / rows); tw = Math.min(tw, th0 * r0);
      const th = tw / r0, gw = cols * tw + (cols - 1) * gap, gh = rows * (th + capH) + (rows - 1) * gap, x0 = (W - gw) / 2, y0 = A.top + titleH + Math.min((ah - gh) / 2, 40) + 4;
      if (title) api.text(title, W / 2, A.top - 8, { size: 24, weight: 800, k: seg(t, 0, 0.5), maxw: aw });
      items.forEach((it, i) => {
        const col = i % cols, row = Math.floor(i / cols), x = x0 + col * (tw + gap), y = y0 + row * (th + capH + gap), a = 0.3 * i;
        const on = api.marked === ids[i], pk = picked.has(ids[i]);
        picture(api, es[i], x, y, tw, th, seg(t, a, a + 0.6), seg(t, a + 0.4, a + 1.1), on);
        if (pk) {
          api.rect(x - 4, y - 4, tw + 8, th + 8, { c: "accent", w: 4, r: 12, rough: 0 });
          api.dot(x + tw - 4, y + 4, 12, { c: "accent" });
          api.stroke([[x + tw - 9, y + 4], [x + tw - 5, y + 8], [x + tw + 2, y - 1]], { c: "ink", w: 2.6, rough: 0 });
        }
        if (caps[i]) api.text(caps[i], x + tw / 2, y + th + 14, { size: 13, c: "dim", weight: 600, type: true, k: seg(t, a + 1, a + 1.6), free: true, noHit: true, maxw: tw + gap });
        if (t > a + 0.7) api.hitBox(ids[i], x + tw / 2, y + th / 2, tw, th, labels[i]);
      });
      frameChoose(film, host, api, t, total - 2.4, cH, y0 + gh + 12);
      film.says.slice(0, 1).forEach((s0) => api.say(s0, 0.3, Math.min(total - 0.5, 3.6), { y: "bottom", size: 20 }));
    },
  };
  return film;
}

// ---- compare -----------------------------------------------------------------------------------------------------------------

function compareFilm(d, p, read0, host) {
  const eb = imageOf(p.before), ea = imageOf(p.after), title = String(p.title || "").trim(), labs = [String((p.labels || [])[0] || "Before"), String((p.labels || [])[1] || "After")];
  const rings = boxesOf(p.hl), notes = (p.notes || []).map(String), ids = rings.map((_, i) => `compare.change.${i + 1}`);
  const labels = rings.map((_, i) => notes[i] || `Change ${i + 1}`);
  const R0 = 2.4, total = (rings.length ? R0 + rings.length * 0.7 + 0.4 : 2.4) + (read0.choose ? 1.2 : 0) + host.HOLD;
  let at = Number.isFinite(+p.at) && p.at !== undefined ? clamp(Math.round(+p.at), 4, 96) : 50, base = at, tw = null, geo = null, shown = at / 100;
  const marks = [
    { id: "compare.before", label: labs[0], words: `${labs[0]}${title ? `: ${title}` : ""}.`, appear: 1.2 },
    { id: "compare.after", label: labs[1], words: `${labs[1]}${title ? `: ${title}` : ""}.`, appear: 1.2 },
    { id: "compare.divider", label: "Divider", words: "", appear: 1.9 },
  ];
  rings.forEach((_, i) => marks.push({ id: ids[i], label: labels[i], words: `Change ${i + 1}: ${labels[i]}.`, appear: R0 + i * 0.7 + 0.4 }));
  const step = () => {
    if (!tw) return;
    const u = clamp((now() - tw.t0) / (TWEEN * 1000), 0, 1);
    shown = tw.from + (tw.to - tw.from) * eout(u);
    if (u >= 1) { shown = tw.to; tw = null; }
  };
  const setAt = (v) => {
    const val = clamp(Math.round(v), 4, 96); if (val === at) return val;
    step(); tw = { from: shown, to: val / 100, t0: now() }; at = val; return val;
  };
  const dividerWords = () => `Divider at ${at}%. ${at}% ${labs[0]}, ${100 - at}% ${labs[1]}.`;
  const commit = () => {
    if (at === base) return null;
    base = at;
    return { say: dividerWords(), line: `[yui] ${ask()} canvas drag mark=compare.divider value=${at}`, step: true, id: "compare.divider" };
  };
  const film = {
    kind: "media", media: "compare", total, marks, choose: read0.choose, chosen: null, onShapes: false, says: read0.says, title, caption: "",
    wordsFor(label) { return label === "Divider" || /^Divider\b/.test(label) ? dividerWords() : null; },
    // the divider: a drag (x is a screen pixel; the line is sent when it ends) or an arrow key (dir -1 or +1, one line per step)
    drag(dd) {
      if (dd.id !== "compare.divider" || !geo) return null;
      setAt(((dd.x - geo.x) / geo.w) * 100);
      return dd.phase === "end" ? commit() : null;
    },
    nudge(dd) {
      if (dd.id !== "compare.divider") return null;
      setAt(at + (dd.dir < 0 ? -1 : 1) * KEY_STEP);
      return commit();
    },
    busy() { return !!tw; },
    // test hooks (the spec test sets the divider and lets go): the same pair a drag ends with
    setValue(id, v) { return id === "compare.divider" ? setAt(Number(v)) : null; },
    commit(id) { return id === "compare.divider" ? commit() : null; },
    value() { return at; },
    // the same text with the divider where it is now
    retext(text) {
      const lines = String(text).split("\n"), i = lines.findIndex((l) => /^\s*compare\b/.test(l));
      if (i < 0) return text;
      lines[i] = /\bat=-?\d+(\.\d+)?/.test(lines[i]) ? lines[i].replace(/\bat=-?\d+(\.\d+)?/, `at=${at}`) : `${lines[i]} at=${at}`;
      return lines.join("\n");
    },
    draw(t, api) {
      step();
      const W = api.w, cH = film.choose ? host.chooseBlock(api, film, t, 0, 0, 0, W - 40, true) : 0;
      const A = area(api, film, cH), titleH = title ? 30 : 0, aw = W - 40, ah = Math.max(160, A.bottom - A.top - titleH - 6), r = ratioOf(eb, 4 / 3);
      const w = Math.min(aw, ah * r), h = w / r, x = (W - w) / 2, y = A.top + titleH + Math.min((ah - h) / 2, 40) + 4, edge = x + w * shown, on = api.marked;
      geo = { x, w };
      if (title) api.text(title, W / 2, A.top - 8, { size: 24, weight: 800, k: seg(t, 0, 0.5), maxw: aw });
      const kf = seg(t, 0, 0.8), kp = seg(t, 0.6, 1.5);
      picture(api, ea, x, y, w, h, kf, kp, false);
      if (kp > 0 && ready(eb) && api.clipRect && api.image) api.clipRect(x, y, edge - x, h, () => api.image(eb.img, x, y, w, h, { a: ease(kp), r: 8 }));
      else if (kp > 0 && !ready(eb)) api.clipRect(x, y, edge - x, h, () => api.rect(x, y, w, h, { c: "line", w: 0, fill: "dim", r: 8, a: 0.5 * ease(kp), rough: 0 }));
      if (on === "compare.before") api.rect(x - 3, y - 3, edge - x + 3, h + 6, { c: "warn", w: 5, a: 0.8, r: 10, rough: 0 });
      if (on === "compare.after") api.rect(edge, y - 3, x + w - edge + 3, h + 6, { c: "warn", w: 5, a: 0.8, r: 10, rough: 0 });
      // the two labels sit on the picture, and give way when the divider comes close
      const kl = seg(t, 1.2, 1.7);
      if (kl > 0) {
        api.text(labs[0], x + 12, y + 18, { size: 13, weight: 800, c: "fg", bg: "panel", border: "line", align: "left", k: kl * seg(shown, 0.12, 0.26), free: true, noHit: true });
        api.text(labs[1], x + w - 12, y + 18, { size: 13, weight: 800, c: "fg", bg: "panel", border: "line", align: "right", k: kl * seg(1 - shown, 0.12, 0.26), free: true, noHit: true });
      }
      const kd = seg(t, 1.4, 1.9);
      if (kd > 0) {
        const cy = y + h / 2, lit = on === "compare.divider";
        api.line(edge, y - 8, edge, y + h + 8, { c: lit ? "warn" : "fg", w: lit ? 5 : 3, k: kd, rough: 0 });
        api.dot(edge, cy, 17 * Math.min(1, kd * 1.4), { c: lit ? "warn" : "fg" });
        if (kd > 0.7) {
          api.stroke([[edge - 4, cy - 6], [edge - 9, cy], [edge - 4, cy + 6]], { c: "ink", w: 2.4, rough: 0 });
          api.stroke([[edge + 4, cy - 6], [edge + 9, cy], [edge + 4, cy + 6]], { c: "ink", w: 2.4, rough: 0 });
        }
      }
      // hits: the two sides first (big boxes), the divider on top (a drag mark), then the rings
      if (t > 1.3) {
        if (edge - x > 28) api.hitBox("compare.before", x + (edge - x) / 2, y + h / 2, edge - x, h, labs[0]);
        if (x + w - edge > 28) api.hitBox("compare.after", edge + (x + w - edge) / 2, y + h / 2, x + w - edge, h, labs[1]);
      }
      if (kd > 0.5) api.hit("compare.divider", edge, y + h / 2, 24, `Divider, ${at}% ${labs[0]}`, { drag: true });
      const geos = rings.map((b) => ringGeo(b, x, y, w, h, { x, y, w, h }));
      ringsOn(api, rings, geos, t, R0, ids, { labels }, on);
      frameChoose(film, host, api, t, R0 + rings.length * 0.7, cH, y + h + 14);
      film.says.slice(0, 1).forEach((s0) => api.say(s0, 0.3, Math.min(total - 0.5, 3.6), { y: "bottom", size: 20 }));
    },
  };
  return film;
}
