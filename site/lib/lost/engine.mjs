// The 404's drawing loop (SITE-104). Text in five stacked <pre> layers, one per paint slot: a grid of characters, a
// fixed 30 steps a second, stopped while the tab is hidden. (Not canvas text: a cold canvas font costs seconds of
// main thread on some machines, DOM text does not.) The pointer pushes the art around, a lens applied after the
// scene so a seed replays the same drawing. Reduce Motion draws one still frame.
import { rngFor } from "./rng.mjs";
import { chooseHues, colorsAt } from "./palette.mjs";
import { SCENES } from "./scenes.mjs";

const STEP = 1000 / 30;

const seg = (px, py, ax, ay, bx, by) => {
  const dx = bx - ax, dy = by - ay, t = Math.max(0, Math.min(1, ((px - ax) * dx + (py - ay) * dy) / (dx * dx + dy * dy || 1)));
  return Math.hypot(px - ax - t * dx, py - ay - t * dy);
};
const rrect = (x, y, hw, hh, r) => {
  const qx = Math.abs(x) - hw + r, qy = Math.abs(y) - hh + r;
  return Math.hypot(Math.max(qx, 0), Math.max(qy, 0)) + Math.min(Math.max(qx, qy), 0) - r;
};

// The shape of "404" on the character grid: round-ended strokes, computed, so no font is involved.
function makeMask(cols, rows, cw, ch) {
  const Wpx = cols * cw, Hpx = rows * ch;
  const Hg = 0.74 * Hpx;
  const Wg = Math.min(0.74 * Hg, (0.86 * Wpx) / 3.4), g = 0.2 * Wg, t = Math.max(0.24 * Wg, 2.4 * cw);
  const x0 = (Wpx - (3 * Wg + 2 * g)) / 2, y0 = (Hpx - Hg) / 2, h = t / 2;
  const four = (x, y) => Math.min(seg(x, y, 0.66 * Wg, h, h, 0.68 * Hg), seg(x, y, h, 0.68 * Hg, Wg - h, 0.68 * Hg), seg(x, y, 0.66 * Wg, h, 0.66 * Wg, Hg - h)) <= h;
  const zero = (x, y) => rrect(x - Wg / 2, y - Hg / 2, Wg / 2, Hg / 2, Wg / 2) <= 0 && rrect(x - Wg / 2, y - Hg / 2, Wg / 2 - t, Hg / 2 - t, Wg / 2 - t) > 0;
  const glyph = [four, zero, four];
  const on = new Uint8Array(cols * rows), cells = [], byCol = [];
  let mx0 = cols, mx1 = 0, my0 = rows, my1 = 0;
  for (let j = 0; j < rows; j++) for (let i = 0; i < cols; i++) {
    const px = (i + 0.5) * cw - x0, py = (j + 0.5) * ch - y0;
    const gi = Math.floor(px / (Wg + g));
    const lx = px - gi * (Wg + g);
    if (gi < 0 || gi > 2 || lx > Wg || py < 0 || py > Hg || !glyph[gi](lx, py)) continue;
    on[j * cols + i] = 1; cells.push([i, j]);
    (byCol[i] ||= []).push(j);
    mx0 = Math.min(mx0, i); mx1 = Math.max(mx1, i); my0 = Math.min(my0, j); my1 = Math.max(my1, j);
  }
  byCol.forEach((col) => col && col.sort((a, b) => b - a));
  const has = (i, j) => i >= 0 && j >= 0 && i < cols && j < rows && on[j * cols + i] === 1;
  return { cells, byCol, has, edge: (i, j) => !(has(i - 1, j) && has(i + 1, j) && has(i, j - 1) && has(i, j + 1)), x0: mx0, x1: mx1, y0: my0, y1: my1 };
}

export function sceneFor(seed) {
  const r = rngFor(seed, "scene");
  const idx = Math.floor(r() * SCENES.length);
  return { idx, name: SCENES[idx].name, hues: chooseHues(r) };
}

// Draws a scene into `stage` (an empty positioned div). Returns { stop, name, idx }.
export function runLost({ stage, seed, reduced, hour, path }) {
  const pick = sceneFor(seed);
  const host = stage.parentElement;
  let raf = 0, timer = 0, ro = null, stopped = false, live = null;
  const ptr = { x: -99, y: -99, s: 0, on: false, press: 0 };
  const theme = () => (document.documentElement.dataset.theme === "dark" ? "dark" : "light");
  const layers = Array.from({ length: 5 }, () => { const p = document.createElement("pre"); p.className = "lost-layer"; return p; });
  layers.forEach((p) => stage.appendChild(p));
  const shown = layers.map(() => ({ text: null, color: null }));

  function build() {
    const box = stage.getBoundingClientRect();
    const Wpx = Math.max(160, Math.floor(box.width)), Hpx = Math.max(160, Math.floor(box.height));
    const fs = Wpx < 520 ? 12 : 15, ch = Math.round(fs * 1.22);
    stage.style.setProperty("--lost-fs", `${fs}px`); stage.style.setProperty("--lost-lh", `${ch}px`);
    const probe = layers[0];
    probe.textContent = "M".repeat(100);
    const cw = probe.getBoundingClientRect().width / 100;
    const cols = Math.floor(Wpx / cw), rows = Math.floor(Hpx / ch);
    const offx = (Wpx - cols * cw) / 2, offy = (Hpx - rows * ch) / 2;
    layers.forEach((p) => { p.style.left = `${offx}px`; p.style.top = `${offy}px`; });
    shown.forEach((s) => { s.text = null; });
    const mask = makeMask(cols, rows, cw, ch);
    const rng = rngFor(seed, "draw");
    const scene = SCENES[pick.idx].make({ cols, rows, rng, mask, path, hour, theme: theme() });
    const code = new Uint8Array(cols * rows), slot = new Uint8Array(cols * rows);
    const out = new Uint8Array(cols * rows), outSlot = new Uint8Array(cols * rows);
    const put = (x, y, chr, s) => { if (x < 0 || y < 0 || x >= cols || y >= rows) return; const k = y * cols + x; code[k] = chr.charCodeAt(0); slot[k] = s; };
    live = { scene, cols, rows, cw, ch, offx, offy, code, slot, out, outSlot, put, Wpx, Hpx, n: 0, acc: 0 };
  }

  function paint(t) {
    const L = live, { cols, rows, cw, ch } = L;
    L.code.fill(0);
    L.scene.draw(L.put, L.n);
    let src = L.code, ss = L.slot;
    if (ptr.s > 0.02) {
      const R = L.Wpx < 520 ? 80 : 120, px = ptr.x, py = ptr.y, k0 = 0.5 + 0.4 * ptr.press;
      L.out.set(L.code); L.outSlot.set(L.slot);
      const ci = Math.max(0, Math.floor(px - R / cw)), cj = Math.max(0, Math.floor(py - R / ch));
      for (let j = cj; j < Math.min(rows, Math.ceil(py + R / ch)); j++) for (let i = ci; i < Math.min(cols, Math.ceil(px + R / cw)); i++) {
        const d = Math.hypot((i - px) * cw, (j - py) * ch);
        if (d >= R) continue;
        const k = (1 - d / R) ** 2 * k0 * ptr.s;
        const sx = Math.round(px + (i - px) * (1 - k)), sy = Math.round(py + (j - py) * (1 - k)), a = j * cols + i;
        if (sx < 0 || sy < 0 || sx >= cols || sy >= rows) { L.out[a] = 0; continue; }
        L.out[a] = L.code[sy * cols + sx]; L.outSlot[a] = L.slot[sy * cols + sx];
      }
      src = L.out; ss = L.outSlot;
    }
    const colors = colorsAt(pick.hues, theme(), t / 1000);
    for (let s = 0; s < 5; s++) {
      const lines = [];
      for (let j = 0; j < rows; j++) {
        let line = "";
        for (let i = 0; i < cols; i++) { const k = j * cols + i; line += src[k] && ss[k] === s ? String.fromCharCode(src[k]) : " "; }
        lines.push(line.trimEnd());
      }
      const text = lines.join("\n");
      if (shown[s].text !== text) { layers[s].textContent = text; shown[s].text = text; }
      if (shown[s].color !== colors[s]) { layers[s].style.color = colors[s]; shown[s].color = colors[s]; }
    }
  }

  const stillFrame = () => {
    const L = live;
    if (L.scene.step) for (let i = 1; i <= L.scene.still; i++) L.scene.step(i);
    L.n = L.scene.still;
    paint(L.n * STEP);
  };

  let last = 0;
  // Frames are spaced by a timer, so the main thread rests between them (a chained rAF never does).
  function schedule() {
    if (ptr.on || ptr.s > 0.02) raf = requestAnimationFrame(frame);
    else timer = setTimeout(() => { raf = requestAnimationFrame(frame); }, STEP * 0.8);
  }
  function frame(ts) {
    raf = 0; timer = 0;
    schedule();
    const L = live;
    let dt = ts - last; last = ts;
    if (dt > 250) dt = 250;
    L.acc += dt;
    let stepped = false;
    while (L.acc >= STEP) { L.acc -= STEP; L.n++; L.scene.step && L.scene.step(L.n); stepped = true; }
    if (!ptr.on) ptr.s *= 0.9;
    ptr.press *= 0.94;
    if (stepped || ptr.s > 0.02) paint(L.n * STEP);
  }
  const start = () => { if (stopped || raf || timer || reduced) return; last = performance.now(); raf = requestAnimationFrame(frame); };
  const halt = () => { cancelAnimationFrame(raf); clearTimeout(timer); raf = 0; timer = 0; };
  const onVis = () => (document.hidden ? halt() : start());

  function setup() { build(); if (reduced) stillFrame(); else { paint(0); start(); } }
  setup();

  const cell = (e) => { const b = stage.getBoundingClientRect(); ptr.x = (e.clientX - b.left - live.offx) / live.cw; ptr.y = (e.clientY - b.top - live.offy) / live.ch; };
  const move = (e) => { cell(e); ptr.on = true; ptr.s = 1; if (reduced) paint(live.n * STEP); };
  const leave = () => { ptr.on = false; if (reduced) { ptr.s = 0; paint(live.n * STEP); } };
  const down = (e) => { cell(e); ptr.on = true; ptr.s = 1; ptr.press = 1; };
  const evs = [["pointermove", move], ["pointerdown", down], ["pointerleave", leave], ["pointerup", leave], ["pointercancel", leave]];
  evs.forEach(([n, f]) => host.addEventListener(n, f));
  document.addEventListener("visibilitychange", onVis);

  let rt = 0, w0 = live.Wpx, h0 = live.Hpx;
  ro = new ResizeObserver(() => {
    const b = stage.getBoundingClientRect();
    if (Math.abs(b.width - w0) < 2 && Math.abs(b.height - h0) < 2) return;
    clearTimeout(rt);
    rt = setTimeout(() => { halt(); setup(); w0 = live.Wpx; h0 = live.Hpx; }, 150);
  });
  ro.observe(host);
  const mo = new MutationObserver(() => reduced && paint(live.n * STEP));
  mo.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });

  return {
    idx: pick.idx, name: pick.name,
    stop() {
      stopped = true; halt(); clearTimeout(rt); ro.disconnect(); mo.disconnect();
      evs.forEach(([n, f]) => host.removeEventListener(n, f));
      document.removeEventListener("visibilitychange", onVis);
      layers.forEach((p) => p.remove());
    },
  };
}
