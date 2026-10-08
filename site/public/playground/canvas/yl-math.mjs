// YUI-337: math and calc on the living canvas. A `math` (TeX) or `step` answer becomes marks drawn on the same canvas clock as a film:
// the formula writes in term by term in reading order, fraction bars, roots and rules draw as strokes. A `calc` draws its formula, the
// result, a plot of the result against one variable, and one slider per variable. Every term, the result, the plot and every slider is a
// hit target named by its symbol (`term.E`, `calc.result`, `calc.plot`, `calc.r`), so tap, hold, drag, undo and the keyboard model of
// YUI-321/324/330/334 work unchanged.
// The TeX is read by the KaTeX parser the site already ships for the math preset (site/node_modules/katex, copied next to the canvas as
// yl/katex.min.js and loaded the first time a formula plays); the layout and drawing are ours, so the canvas stays one clock with no DOM.
// A slider move is a mark event: `[yui] <ask> canvas drag mark=calc.r value=0.1`. The result and the plot ease to the new value on the clock.
import { parseExpr, evalExpr, names as exprNames, splitFormula, toTeX } from "./yl/expr.mjs";

const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const seg = (t, a, b) => clamp((t - a) / (b - a), 0, 1);
const slug = (s) => String(s).trim().replace(/\^/g, "_").replace(/[^A-Za-z0-9_]+/g, "_").replace(/^_+|_+$/g, "").slice(0, 28) || "x";
const LEAD = 0.15;       // seconds before the first block starts
const TWEEN = 0.22;      // seconds a slider move takes to reach the result and the plot
const KNOB_R = 13;

// ---- the TeX parser (KaTeX, loaded the first time a formula plays) -----------------------------------------------------------

let K = null;
export async function loadTex() {
  if (K) return K;
  if (typeof window === "undefined") {   // node (the tests): the UMD file, evaluated by hand so the file extension does not matter
    const fs = await import("fs");
    const m = { exports: {} };
    new Function("module", "exports", fs.readFileSync(new URL("./yl/katex.min.js", import.meta.url), "utf8"))(m, m.exports);
    K = m.exports;
  } else {
    await import("./yl/katex.min.js");   // sets self.katex
    K = globalThis.katex;
  }
  return K;
}
export const texReady = () => !!K;
const SCI = ["math", "step", "calc"];
export const isSci = (preset) => SCI.includes(preset);
// the nodes of a TeX source, or null when it does not parse (the formula then shows as its source text, as the spec says)
function parseTeX(tex) {
  if (!K) return null;
  try { return K.__parse(String(tex), { strict: "ignore", throwOnError: true }); } catch (e) { return null; }
}

const GREEK = { alpha: "α", beta: "β", gamma: "γ", delta: "δ", epsilon: "ε", varepsilon: "ε", zeta: "ζ", eta: "η", theta: "θ", vartheta: "ϑ", iota: "ι", kappa: "κ", lambda: "λ", mu: "μ", nu: "ν", xi: "ξ", pi: "π", rho: "ρ", sigma: "σ", tau: "τ", phi: "φ", varphi: "φ", chi: "χ", psi: "ψ", omega: "ω", Gamma: "Γ", Delta: "Δ", Theta: "Θ", Lambda: "Λ", Xi: "Ξ", Pi: "Π", Sigma: "Σ", Phi: "Φ", Psi: "Ψ", Omega: "Ω" };
const SYM = { times: "×", cdot: "·", pm: "±", mp: "∓", div: "÷", infty: "∞", le: "≤", leq: "≤", ge: "≥", geq: "≥", ne: "≠", neq: "≠", to: "→", rightarrow: "→", leftarrow: "←", leftrightarrow: "↔", Rightarrow: "⇒", Leftrightarrow: "⇔", approx: "≈", sim: "∼", propto: "∝", partial: "∂", nabla: "∇", sum: "∑", prod: "∏", int: "∫", degree: "°", circ: "∘", ldots: "…", dots: "…", cdots: "⋯", in: "∈", forall: "∀", exists: "∃", equiv: "≡", angle: "∠", perp: "⊥", parallel: "∥", mid: "∣", ll: "≪", gg: "≫", cdotp: "·", ast: "∗", star: "⋆", lbrace: "{", rbrace: "}", langle: "⟨", rangle: "⟩", vert: "|", lvert: "|", rvert: "|", Vert: "‖", "|": "‖", lfloor: "⌊", rfloor: "⌋", lceil: "⌈", rceil: "⌉", "{": "{", "}": "}", "%": "%", "&": "&", "#": "#", "$": "$", _: "_" };
const glyphText = (t) => { t = String(t); if (t[0] === "\\" && t.length > 1) { const n = t.slice(1); return GREEK[n] || SYM[n] || n; } return t === "-" ? "−" : t === "*" ? "∗" : t; };

// ---- layout: boxes of items on a baseline ----------------------------------------------------------------------------------
// A box is { w, a, d, it }: width, height above the baseline, depth below it, and items placed from its left edge with y down from the baseline.
// An item is a glyph run { k: "g", s, x, y, size, ital, wt, w, a, d }, a rule { k: "l", x1, y1, x2, y2, lw }, or a stroke { k: "p", pts, lw }.

const SCRIPT = 0.7, EM = { thin: 0.17, med: 0.22, thick: 0.28 };
const OPEN = new Set(["open"]), CLOSE = new Set(["close"]);

function Lay(measure) {
  const cache = new Map();
  const wOf = (s, size, ital, wt) => {
    const key = s + "|" + size.toFixed(1) + "|" + (ital ? 1 : 0) + "|" + wt;
    let w = cache.get(key);
    if (w === undefined) { w = measure(s, size, ital, wt); cache.set(key, w); }
    return w;
  };
  const ctx = { term: -1 };
  const empty = () => ({ w: 0, a: 0, d: 0, it: [] });
  const move = (q, dx, dy) => {
    if (q.k === "g") return { ...q, x: q.x + dx, y: q.y + dy };
    if (q.k === "l") return { ...q, x1: q.x1 + dx, x2: q.x2 + dx, y1: q.y1 + dy, y2: q.y2 + dy };
    return { ...q, pts: q.pts.map((p) => [p[0] + dx, p[1] + dy]) };
  };
  const put = (into, b, dx, dy) => { for (const q of b.it) into.it.push(move(q, dx, dy)); };
  const lw = (size) => Math.max(1.6, size * 0.055);

  function glyph(txt, S, ital, big) {
    const size = S.size * (big || 1), wt = S.bold ? 800 : 600;
    const lower = txt.length === 1 && /[acemnorsuvwxzαγεηικμνοπρσςτυχω]/.test(txt);
    const a = size * (lower ? 0.52 : 0.74), d = /[gjpqy,;()[\]|∫∑∏{}ϑ]/.test(txt) ? size * 0.22 : 0;
    const w = wOf(txt, size, ital, wt);
    return { w, a, d, it: [{ k: "g", s: txt, x: 0, y: 0, size, ital, wt, w, a, d, term: ctx.term }] };
  }
  const sub = (S, f) => ({ ...S, size: S.size * f });

  // the class of a node for the space around it
  const classOf = (n) => {
    if (n.type === "atom") return n.family === "bin" ? "bin" : n.family === "rel" ? "rel" : n.family === "punct" ? "punct" : n.family === "open" ? "open" : n.family === "close" ? "close" : "ord";
    if (n.type === "op" || n.type === "operatorname") return "op";
    return "ord";
  };

  function row(nodes, S) {
    const out = empty();
    let x = 0, prev = null;
    const list = nodes.filter((n) => n.type !== "cr");
    list.forEach((n, i) => {
      let c = classOf(n);
      // a bin at the start, or after another bin / a rel / an open / a punct, is a sign, not an operator
      if (c === "bin" && (prev === null || ["bin", "rel", "open", "punct", "op"].includes(prev))) c = "ord";
      const next = list[i + 1];
      if (c === "bin" && (!next || ["rel", "close", "punct"].includes(classOf(next)))) c = "ord";
      let gap = 0;
      if (prev !== null && !S.script) {
        if (c === "rel" || prev === "rel") gap = EM.thick;
        else if (c === "bin" || prev === "bin") gap = EM.med;
        else if (prev === "punct") gap = EM.thin;
        else if ((prev === "op" && c !== "op") || (c === "op" && prev !== "op" && prev !== "open")) gap = EM.thin;
      }
      x += gap * S.size;
      const b = lay(n, S);
      put(out, b, x, 0);
      x += b.w;
      out.a = Math.max(out.a, b.a); out.d = Math.max(out.d, b.d);
      prev = c;
    });
    out.w = x;
    return out;
  }

  function scripts(n, S) {
    const B = n.base ? lay(n.base, S) : empty();
    const SS = { ...sub(S, SCRIPT), script: true };
    const U = n.sup ? lay(n.sup, SS) : null, D = n.sub ? lay(n.sub, SS) : null;
    const out = empty();
    const lim = n.base && n.base.type === "op" && n.base.limits && n.base.symbol;
    if (lim) {   // a sum or product: the limits sit over and under it
      const w = Math.max(B.w, U ? U.w : 0, D ? D.w : 0);
      put(out, B, (w - B.w) / 2, 0);
      out.a = B.a; out.d = B.d;
      if (U) { const y = -(B.a + U.d + S.size * 0.1); put(out, U, (w - U.w) / 2, y); out.a = B.a + U.a + U.d + S.size * 0.1; }
      if (D) { const y = B.d + D.a + S.size * 0.1; put(out, D, (w - D.w) / 2, y); out.d = B.d + D.a + D.d + S.size * 0.1; }
      out.w = w;
      return out;
    }
    put(out, B, 0, 0);
    out.a = B.a; out.d = B.d;
    const pad = S.size * 0.04, sx = B.w + pad;
    let ww = 0;
    if (U) { const y = -Math.max(S.size * 0.38, B.a - S.size * 0.4); put(out, U, sx, y); out.a = Math.max(out.a, -y + U.a); ww = Math.max(ww, U.w); }
    if (D) { const y = Math.max(S.size * 0.2, B.d + S.size * 0.08); put(out, D, sx, y); out.d = Math.max(out.d, y + D.d); ww = Math.max(ww, D.w); }
    out.w = sx + ww + pad;
    return out;
  }

  function frac(n, S) {
    const FS = { ...sub(S, S.script ? 0.9 : 0.92) };
    const N = lay(n.numer, FS), Dn = lay(n.denom, FS), size = S.size;
    const axis = size * 0.28, gap = size * 0.16, bar = n.hasBarLine !== false;
    const w = Math.max(N.w, Dn.w) + size * 0.24, out = empty();
    const ny = -axis - (bar ? gap : gap * 0.6) - N.d, dy = -axis + (bar ? gap : gap * 0.6) + Dn.a;
    put(out, N, (w - N.w) / 2, ny); put(out, Dn, (w - Dn.w) / 2, dy);
    if (bar) out.it.push({ k: "l", x1: size * 0.06, x2: w - size * 0.06, y1: -axis, y2: -axis, lw: lw(size), term: ctx.term });
    out.a = -ny + N.a; out.d = dy + Dn.d; out.w = w;
    if (n.leftDelim || n.rightDelim) {
      const wrap = empty();
      const L = n.leftDelim ? delim(n.leftDelim, out, S) : empty(), R = n.rightDelim ? delim(n.rightDelim, out, S) : empty();
      put(wrap, L, 0, 0); put(wrap, out, L.w, 0); put(wrap, R, L.w + out.w, 0);
      wrap.w = L.w + out.w + R.w; wrap.a = Math.max(out.a, L.a, R.a); wrap.d = Math.max(out.d, L.d, R.d);
      return wrap;
    }
    return out;
  }

  function sqrt(n, S) {
    const B = lay(n.body, S), size = S.size, I = n.index ? lay(n.index, { ...sub(S, 0.55), script: true }) : null;
    const t = lw(size), rw = size * 0.62, over = size * 0.16, vy = -(B.a + over);
    const ix = I ? Math.max(0, I.w - size * 0.22) : 0, out = empty();
    if (I) put(out, I, 0, -(B.a * 0.55 + I.d));
    put(out, B, ix + rw, 0);
    const x0 = ix, bottom = B.d + size * 0.06;
    out.it.push({ k: "p", lw: t, term: ctx.term, pts: [[x0 + size * 0.04, -size * 0.26], [x0 + size * 0.18, -size * 0.34], [x0 + size * 0.36, bottom], [x0 + rw - size * 0.02, vy], [ix + rw + B.w + size * 0.08, vy]] });
    out.w = ix + rw + B.w + size * 0.1; out.a = -vy + t; out.d = Math.max(B.d, bottom);
    return out;
  }

  // a delimiter as tall as the box it wraps (a glyph scaled up, centred on the box)
  function delim(ch, B, S) {
    const txt = glyphText(ch);
    if (!txt || txt === ".") return empty();
    const need = (B.a + B.d) / (S.size * 0.96), big = clamp(need, 1, 2.6);
    const g = glyph(txt, { ...S, bold: false }, false, big);
    const mid = (-B.a + B.d) / 2;
    g.it[0].y = mid + 0.3 * S.size * big;
    g.a = Math.max(g.a, B.a); g.d = Math.max(g.d, B.d);
    return g;
  }
  function leftright(n, S) {
    const B = row(n.body, S), out = empty();
    const L = delim(n.left, B, S), R = delim(n.right, B, S);
    put(out, L, 0, 0); put(out, B, L.w + S.size * 0.04, 0); put(out, R, L.w + B.w + S.size * 0.08, 0);
    out.w = L.w + B.w + R.w + S.size * 0.08; out.a = Math.max(B.a, L.a, R.a); out.d = Math.max(B.d, L.d, R.d);
    return out;
  }

  function accent(n, S) {
    const B = lay(n.base, S), size = S.size, out = empty(), t = lw(size) * 0.9, label = String(n.label).replace(/^\\/, "");
    put(out, B, 0, 0);
    const cx = B.w / 2, y = -(B.a + size * 0.1);
    if (label === "hat" || label === "widehat") out.it.push({ k: "p", lw: t, term: ctx.term, pts: [[cx - size * 0.16, y + size * 0.06], [cx, y - size * 0.08], [cx + size * 0.16, y + size * 0.06]] });
    else if (label === "vec" || label === "overrightarrow") out.it.push({ k: "p", lw: t, term: ctx.term, pts: [[cx - size * 0.18, y], [cx + size * 0.18, y], [cx + size * 0.1, y - size * 0.07], [cx + size * 0.18, y], [cx + size * 0.1, y + size * 0.07]] });
    else if (label === "bar" || label === "overline") out.it.push({ k: "l", x1: cx - size * 0.2, x2: cx + size * 0.2, y1: y, y2: y, lw: t, term: ctx.term });
    else if (label === "dot") out.it.push({ k: "p", lw: t * 1.8, term: ctx.term, pts: [[cx, y], [cx + 0.01, y]] });
    else if (label === "ddot") out.it.push({ k: "p", lw: t * 1.8, term: ctx.term, pts: [[cx - size * 0.07, y], [cx - size * 0.06, y]] }, { k: "p", lw: t * 1.8, term: ctx.term, pts: [[cx + size * 0.07, y], [cx + size * 0.08, y]] });
    else out.it.push({ k: "p", lw: t, term: ctx.term, pts: [[cx - size * 0.17, y + size * 0.02], [cx - size * 0.06, y - size * 0.05], [cx + size * 0.06, y + size * 0.05], [cx + size * 0.17, y - size * 0.02]] });
    out.w = B.w; out.a = B.a + size * 0.2; out.d = B.d;
    return out;
  }

  function over(n, S, under) {
    const B = lay(n.body, S), out = empty(), y = under ? B.d + S.size * 0.1 : -(B.a + S.size * 0.1);
    put(out, B, 0, 0);
    out.it.push({ k: "l", x1: 0, x2: B.w, y1: y, y2: y, lw: lw(S.size), term: ctx.term });
    out.w = B.w; out.a = under ? B.a : B.a + S.size * 0.18; out.d = under ? B.d + S.size * 0.18 : B.d;
    return out;
  }

  const space = (S, em) => { const b = empty(); b.w = em * S.size; return b; };

  function lay(n, S) {
    switch (n.type) {
      case "ordgroup": return row(n.body, S);
      case "mathord": { const t = glyphText(n.text); return glyph(t, S, !S.upright && t.length === 1 && /[A-Za-zα-ωϑ]/.test(t)); }
      case "textord": case "atom": return glyph(glyphText(n.text), S);
      case "spacing": { const t = String(n.text); return space(S, /quad/.test(t) ? (/qquad/.test(t) ? 2 : 1) : t === "\\," ? EM.thin : t === "\\:" || t === "\\>" ? EM.med : t === "\\;" ? EM.thick : t === "\\!" ? -EM.thin : 0.3); }
      case "kern": { const d = n.dimension || {}; return space(S, d.unit === "em" ? d.number : d.unit === "mu" ? d.number / 18 : d.unit === "ex" ? d.number * 0.5 : d.number / 10); }
      case "text": return row(n.body || [], { ...S, upright: true });
      case "font": { const f = String(n.font); return lay(n.body, { ...S, bold: /bf/.test(f) || S.bold, upright: /rm|bf|sf|tt|text/.test(f) || S.upright }); }
      case "styling": case "color": case "sizing": case "mclass": case "lap": case "phantom":
        return Array.isArray(n.body) ? row(n.body, S) : n.body ? lay(n.body, S) : empty();
      case "operatorname": return row(n.body || [], { ...S, upright: true });
      case "op": {
        if (n.symbol) return glyph(glyphText(n.name), S, false, 1.35);
        if (n.body) return row(n.body, { ...S, upright: true });
        return glyph(glyphText(n.name), { ...S, upright: true });
      }
      case "supsub": return scripts(n, S);
      case "genfrac": return frac(n, S);
      case "sqrt": return sqrt(n, S);
      case "leftright": return leftright(n, S);
      case "delimsizing": return delim(n.delim, empty(), S);
      case "accent": return accent(n, S);
      case "overline": return over(n, S);
      case "underline": return over(n, S, true);
      default:
        if (Array.isArray(n.body)) return row(n.body, S);
        if (n.body && typeof n.body === "object") return lay(n.body, S);
        if (n.text) return glyph(glyphText(n.text), S);
        return empty();
    }
  }

  // ---- terms: what a person touches -------------------------------------------------------------------------------------
  function isTerm(n) {
    if (n.type === "atom") return false;
    if (n.type === "spacing" || n.type === "kern" || n.type === "cr" || n.type === "sizing" || n.type === "styling" || n.type === "color") return false;
    if (n.type === "textord" && /^[\\.,;:!?]/.test(String(n.text)) && !/^\\(infty|alpha|beta|pi|Delta)/.test(String(n.text))) return false;
    return true;
  }
  // the plain name of a node: a symbol, a power, a quotient
  function nameOf(n) {
    switch (n.type) {
      case "ordgroup": return n.body.map(nameOf).join("");
      case "mathord": case "textord": case "atom": return glyphText(n.text);
      case "supsub": return nameOf(n.base || { type: "ordgroup", body: [] }) + (n.sup ? "^" + wrap(nameOf(n.sup)) : "") + (n.sub ? "_" + wrap(nameOf(n.sub)) : "");
      case "genfrac": return wrap(nameOf(n.numer)) + "/" + wrap(nameOf(n.denom));
      case "sqrt": return "sqrt(" + nameOf(n.body) + ")" ;
      case "leftright": return glyphText(n.left) + n.body.map(nameOf).join("") + glyphText(n.right);
      case "op": return glyphText(n.name);
      case "operatorname": case "text": return (n.body || []).map(nameOf).join("");
      case "font": case "accent": case "overline": case "underline": return nameOf(n.body || n.base);
      case "spacing": return " ";
      default: return Array.isArray(n.body) ? n.body.map(nameOf).join("") : n.body ? nameOf(n.body) : n.text ? glyphText(n.text) : "";
    }
  }
  const wrap = (s) => (s.length > 1 && /[+−\-*/ ]/.test(s) ? "(" + s + ")" : s);

  // the lines of a formula: top-level nodes split at `\\`
  function lines(nodes) {
    const out = [[]];
    for (const n of nodes) { if (n.type === "cr") out.push([]); else out[out.length - 1].push(n); }
    return out.filter((l) => l.length);
  }

  // A formula at font size `size`: { w, a, d, items (in reading order), terms: [{ name, x0, x1, y0, y1 }] }. Items sit from the left edge,
  // y down from the first line's baseline; a later line is centred under the one before.
  function formula(nodes, size) {
    const S = { size, script: false }, gap = size * 0.35;
    const ls = lines(nodes).map((l) => top(l, S));
    const out = { w: Math.max(0, ...ls.map((l) => l.b.w)), a: ls.length ? ls[0].b.a : 0, d: 0, items: [], terms: [] };
    let base = 0, n0 = 0;
    ls.forEach((l, i) => {
      if (i > 0) base += ls[i - 1].b.d + gap + l.b.a;
      l.b.it.forEach((q) => out.items.push({ ...move(q, (out.w - l.b.w) / 2, base), term: q.term < 0 ? -1 : q.term + n0 }));
      l.names.forEach((name) => out.terms.push({ name }));
      n0 += l.names.length;
      out.d = base + l.b.d;
    });
    out.terms.forEach((t, j) => {
      let x0 = 1e9, x1 = -1e9, y0 = 1e9, y1 = -1e9;
      const see = (x, y) => { x0 = Math.min(x0, x); x1 = Math.max(x1, x); y0 = Math.min(y0, y); y1 = Math.max(y1, y); };
      out.items.forEach((q) => {
        if (q.term !== j) return;
        if (q.k === "g") { see(q.x, q.y - q.a); see(q.x + q.w, q.y + q.d); }
        else if (q.k === "l") { see(q.x1, q.y1); see(q.x2, q.y2); }
        else q.pts.forEach((p) => see(p[0], p[1]));
      });
      Object.assign(t, { x0, x1, y0, y1 });
    });
    // reading order: left to right, then top to bottom
    out.items.sort((p, q) => xOf(p) - xOf(q) || yOf(p) - yOf(q));
    return out;
  }
  const xOf = (q) => (q.k === "g" ? q.x : q.k === "l" ? Math.min(q.x1, q.x2) : Math.min(...q.pts.map((p) => p[0])));
  const yOf = (q) => (q.k === "g" ? q.y : q.k === "l" ? q.y1 : q.pts[0][1]);
  // one line at the top level: the same spacing as row(), and every touchable node tagged with its term number
  function top(nodes, S) {
    const list = nodes.length === 1 && nodes[0].type === "ordgroup" ? nodes[0].body : nodes;   // `{a+b}` at the top is the formula itself
    const out = empty(), names = [];
    let x = 0, prev = null;
    list.forEach((n, i) => {
      let c = classOf(n);
      if (c === "bin" && (prev === null || ["bin", "rel", "open", "punct", "op"].includes(prev))) c = "ord";
      const next = list[i + 1];
      if (c === "bin" && (!next || ["rel", "close", "punct"].includes(classOf(next)))) c = "ord";
      let gap = 0;
      if (prev !== null) {
        if (c === "rel" || prev === "rel") gap = EM.thick;
        else if (c === "bin" || prev === "bin") gap = EM.med;
        else if (prev === "punct") gap = EM.thin;
        else if ((prev === "op" && c !== "op") || (c === "op" && prev !== "op" && prev !== "open")) gap = EM.thin;
      }
      x += gap * S.size;
      if (isTerm(n)) { ctx.term = names.length; names.push(nameOf(n)); } else ctx.term = -1;
      const b = lay(n, S);
      put(out, b, x, 0);
      x += b.w; out.a = Math.max(out.a, b.a); out.d = Math.max(out.d, b.d);
      prev = c;
    });
    out.w = x; ctx.term = -1;
    return { b: out, names };
  }
  return { formula, text: (s, size, ital, wt) => wOf(s, size, ital, wt || 600) };
}

// ---- numbers and units (the same words the site's calc prints; science.js) ----------------------------------------------

const SUPS = { "0": "⁰", "1": "¹", "2": "²", "3": "³", "4": "⁴", "5": "⁵", "6": "⁶", "7": "⁷", "8": "⁸", "9": "⁹", "-": "⁻" };
const prettyUnit = (u) => String(u || "").replace(/\^(-?\d+)/g, (_, n) => [...n].map((c) => SUPS[c]).join("")).replace(/degC\b/g, "°C").replace(/degF\b/g, "°F").replace(/\bdeg\b/g, "°").replace(/\bohm\b/gi, "Ω").replace(/\*/g, "·");
const PREFIX = new Set(["$", "€", "£", "¥"]);
export function fmtNum(v, digits = 4) {
  if (typeof v !== "number" || !Number.isFinite(v)) return String(v ?? "");
  const a = Math.abs(v);
  if (a !== 0 && (a >= 1e6 || a < 1e-3)) {
    const [m, e] = v.toExponential(Math.max(0, digits - 1)).split("e");
    return `${m.replace(/\.?0+$/, "")}×10${[...String(Number(e))].map((c) => SUPS[c]).join("")}`;
  }
  return a >= 1000 ? v.toLocaleString("en-US", { maximumFractionDigits: 2 }) : String(Number(v.toPrecision(digits)));
}
export function withUnit(v, unit, digits) {
  const n = fmtNum(v, digits);
  if (!unit) return n;
  if (PREFIX.has(unit)) return n.startsWith("-") ? `-${unit}${n.slice(1)}` : `${unit}${n}`;
  const u = prettyUnit(unit);
  return /^[%°]/.test(u) && u !== "°C" && u !== "°F" ? `${n}${u}` : `${n} ${u}`;
}
function niceStep(span, count) {
  const raw = span / Math.max(1, count), mag = 10 ** Math.floor(Math.log10(raw || 1)), n = raw / mag;
  return (n <= 1 ? 1 : n <= 2 ? 2 : n <= 2.5 ? 2.5 : n <= 5 ? 5 : 10) * mag;
}
function niceScale(lo, hi, count) {
  if (!isFinite(lo) || !isFinite(hi)) { lo = 0; hi = 1; }
  if (lo === hi) { lo -= 1; hi += 1; }
  const step = niceStep(hi - lo, count), a = Math.floor(lo / step + 1e-9) * step, b = Math.ceil(hi / step - 1e-9) * step, ticks = [];
  for (let v = a; v <= b + step / 2; v += step) ticks.push(Math.abs(v) < step * 1e-9 ? 0 : Number(v.toPrecision(12)));
  return { lo: a, hi: b, ticks };
}
const decimals = (step) => { const s = String(step), i = s.indexOf("."); return i < 0 ? 0 : Math.min(6, s.length - i - 1); };
const isDeg = (u) => u === "deg" || u === "°";
const now = () => (typeof performance !== "undefined" ? performance.now() : Date.now());
const eout = (k) => 1 - Math.pow(1 - k, 3);

// ---- reading -----------------------------------------------------------------------------------------------------------

const SIZES = { sm: 26, md: 36, lg: 46 };
function readBlocks(ops) {
  const out = [];
  for (const o of ops) {
    const p = o.props || {};
    if (o.preset === "math") out.push({ kind: "math", id: o.id, tex: String(p.tex || ""), caption: String(p.caption || ""), size: SIZES[p.size] || SIZES.md });
    else if (o.preset === "step") out.push({ kind: "step", id: o.id, tex: String(p.tex || ""), title: String(p.text || "") });
    else if (o.preset === "calc") {
      const vars = Object.entries(p).filter(([k, v]) => !["title", "f", "plot", "unit", "digits", "color"].includes(k) && v && typeof v === "object" && !Array.isArray(v) && "value" in v).map(([name, v]) => {
        const slider = v.min !== undefined, step = slider ? niceStep(v.max - v.min, 200) : 0;
        return { name, slider, min: v.min, max: v.max, unit: v.unit || "", value: v.value, base: v.value, step, dec: decimals(step), keyStep: slider ? niceStep(v.max - v.min, 20) : 0 };
      });
      let ast = null, out0 = "", err = "";
      try { const sp = splitFormula(p.f || ""); out0 = sp.out; ast = parseExpr(sp.expr); } catch (e) { err = e.message; }
      const sl = vars.filter((v) => v.slider), plotVar = p.plot === false ? null : (sl.find((v) => v.name === p.plot) || sl[0] || null);
      const tex = err ? String(p.f || "") : `${out0 ? `${toTeX({ v: out0 })} = ` : ""}${toTeX(ast)}`;
      out.push({ kind: "calc", id: o.id, title: String(p.title || ""), f: String(p.f || ""), tex, ast, out: out0, err, unit: String(p.unit || ""), digits: p.digits || 3, vars, plotVar: plotVar && plotVar.name, tw: {}, free: ast ? [...exprNames(ast)].filter((n) => !vars.find((v) => v.name === n) && n !== "pi" && n !== "e") : [] });
    }
  }
  return out.filter((b) => b.tex);
}

// TeX source -> nodes; a source that does not parse is its own text, one touchable thing (the spec: "shows as its source text")
function nodesOf(tex) {
  const n = parseTeX(tex);
  if (n && n.length) return n;
  return [{ type: "text", font: "\\text", body: [...String(tex)].map((c) => (c === " " ? { type: "spacing", text: " " } : { type: "textord", text: c })) }];
}

// ---- the film ----------------------------------------------------------------------------------------------------------

let META = { ask: "", terms: {} };
// The page sets this once per sample: the word in the event lines and the canned meaning of each term (yl-samples.json "terms").
export function setMeta(m) { META = { ask: "", terms: {}, ...(m || {}) }; }

const dummy = Lay((s, size) => s.length * size * 0.55);

// ops: the math / step / calc lines of the answer in line order. host: { chooseBlock, HOLD }.
export function sciFilm(ops, read0, host) {
  const blocks = readBlocks(ops);
  if (!blocks.length) return null;
  const meta = META, HOLD = host.HOLD, ask = () => film.ask || meta.ask || "calc";
  const marks = [], used = new Map();
  const markId = (base) => { const n = (used.get(base) || 0) + 1; used.set(base, n); return n === 1 ? base : base + "." + n; };

  // the clock: blocks play one after another; a formula writes in item by item
  let at = LEAD;
  const meaningOf = (name, blk) => {
    const keys = [name, name.replace(/[\^_].*$/, ""), ...(name.match(/[A-Za-zα-ωΑ-Ω]/g) || [])];
    for (const k of keys) if (typeof meta.terms[k] === "string") return meta.terms[k];
    const v = blk.kind === "calc" && blk.vars.find((x) => keys.includes(x.name));
    if (v) return v.slider ? `${v.name} is ${withUnit(v.value, v.unit, 4)} now. Slide it below.` : `${v.name} is a constant: ${withUnit(v.value, v.unit, 6)}.`;
    return `${name}. One term of the formula.`;
  };
  blocks.forEach((blk, bi) => {
    blk.i = bi; blk.t0 = at;
    blk.nodes = nodesOf(blk.tex);
    const f = dummy.formula(blk.nodes, 30), N = Math.max(1, f.items.length);
    blk.n = N; blk.step = clamp(1.8 / N, 0.04, 0.16);
    const pre = blk.kind === "step" ? 0.45 : 0.08;
    blk.fT = pre;                                   // the formula's first item
    blk.fEnd = pre + N * blk.step + 0.3;
    const nS = blk.kind === "calc" ? blk.vars.filter((v) => v.slider).length : 0;
    blk.dur = blk.kind === "calc" ? blk.fEnd + 1.3 + nS * 0.3 : blk.kind === "math" && blk.caption ? blk.fEnd + 0.5 : blk.fEnd + 0.15;
    at += blk.dur + 0.2;
    if (blk.kind === "step") {
      const sid = markId("step." + (blocks.slice(0, bi).filter((b) => b.kind === "step").length + 1));
      blk.stepId = sid;
      marks.push({ id: sid, label: blk.title || `Step ${bi + 1}`, words: `Step ${blocks.slice(0, bi + 1).filter((b) => b.kind === "step").length} of ${blocks.filter((b) => b.kind === "step").length}${blk.title ? ": " + blk.title : ""}.`, appear: blk.t0 });
    }
    blk.tids = f.terms.map((tm, j) => {
      const first = f.items.findIndex((q) => q.term === j);
      const id = markId("term." + slug(tm.name));
      const m = { id, label: tm.name, words: meaningOf(tm.name, blk), appear: blk.t0 + pre + Math.max(0, first) * blk.step + 0.15, term: true };
      marks.push(m);
      return id;
    });
    if (blk.kind === "calc") {
      const out = blk.out || "Result";
      const rid = "calc.result";
      blk.rid = rid;
      marks.push({ id: rid, label: "Result", words: `${out} is the result.`, appear: blk.t0 + blk.fEnd, dyn: () => `${out} is ${resultText(blk)} now.${blk.vars.map((v) => ` ${v.name} is ${withUnit(v.value, v.unit, 4)}.`).join("")}`, hitLabel: () => `${out}: ${resultText(blk)}` });
      if (blk.plotVar) {
        blk.pid = "calc.plot";
        marks.push({ id: blk.pid, label: `${out || "Result"} against ${blk.plotVar}`, words: `A plot of ${out || "the result"} against ${blk.plotVar}.`, appear: blk.t0 + blk.fEnd + 0.7, dyn: () => `${out || "Result"} against ${blk.plotVar}. At ${blk.plotVar} = ${withUnit(varOf(blk, blk.plotVar).value, varOf(blk, blk.plotVar).unit, 4)}, ${out || "the result"} is ${resultText(blk)}.` });
      }
      blk.vars.forEach((v, j) => {
        v.id = "calc." + v.name;
        marks.push({ id: v.id, label: v.name, words: meaningOf(v.name, blk), appear: blk.t0 + blk.fEnd + 1.0 + j * 0.3, dyn: v.slider ? () => `${meaningOf(v.name, blk).replace(/ Slide it below\.$/, "")} ${v.name} is ${withUnit(v.value, v.unit, 4)}, from ${withUnit(v.min, v.unit, 4)} to ${withUnit(v.max, v.unit, 4)}.` : undefined, hitLabel: () => `${v.name}: ${withUnit(v.value, v.unit, 4)}` });
      });
    }
  });
  const total = at + 0.1 + HOLD + (read0.choose ? 1.2 : 0);
  const varOfBlk = (id) => { for (const b of blocks) { const v = b.vars && b.vars.find((x) => x.id === id); if (v) return { b, v }; } return null; };

  // ---- the calc maths --------------------------------------------------------------------------------------------------
  function varOf(blk, name) { return blk.vars.find((v) => v.name === name); }
  const env = (blk, shown) => { const o = {}; for (const v of blk.vars) { const x = shown ? (blk.tw[v.name] ? blk.disp[v.name] : v.value) : v.value; o[v.name] = isDeg(v.unit) ? (x * Math.PI) / 180 : x; } return o; };
  function evalAt(blk, e) { if (!blk.ast || blk.free.length) return NaN; try { const r = evalExpr(blk.ast, e); return Number.isFinite(r) ? r : NaN; } catch (er) { return NaN; } }
  const resultNow = (blk, shown) => evalAt(blk, env(blk, shown));
  function resultText(blk) { const r = resultNow(blk, false); return Number.isFinite(r) ? withUnit(r, blk.unit, blk.digits) : blk.free.length ? `needs ${blk.free.join(", ")}` : "undefined"; }
  blocks.forEach((b) => { if (b.kind === "calc") b.disp = Object.fromEntries(b.vars.map((v) => [v.name, v.value])); });

  // a value to a slider (snapped to its step); the shown value eases to it on the clock
  function setValue(id, value) {
    const f = varOfBlk(id); if (!f || !f.v.slider) return null;
    const { b, v } = f;
    const x = clamp(Math.round(Number(value) / v.step) * v.step, v.min, v.max), val = Number(x.toFixed(v.dec));
    if (val === v.value) return val;
    const shown = b.tw[v.name] ? b.disp[v.name] : v.value;
    v.value = val;
    b.tw[v.name] = { from: shown, to: val, t0: now() };
    return val;
  }
  function tween(b) {
    const t = now();
    for (const v of b.vars) {
      const w = b.tw[v.name]; if (!w) continue;
      const u = clamp((t - w.t0) / (TWEEN * 1000), 0, 1);
      b.disp[v.name] = w.from + (w.to - w.from) * eout(u);
      if (u >= 1) { b.disp[v.name] = w.to; delete b.tw[v.name]; }
    }
  }
  // the slider is let go: one line, or nothing when it did not move
  function commit(id) {
    const f = varOfBlk(id); if (!f) return null;
    const { b, v } = f;
    if (v.value === v.base) return null;
    v.base = v.value;
    return { say: `${v.name} is ${withUnit(v.value, v.unit, 4)}. ${b.out || "The result"} is ${resultText(b)}.`, line: `[yui] ${ask()} canvas drag mark=${id} value=${v.value}`, step: true, id };
  }

  // ---- geometry --------------------------------------------------------------------------------------------------------
  let L = null, LW = 0;
  const layOf = (api) => (L ||= Lay((s, size, ital, wt) => api.measure(s, { size, weight: wt, italic: ital, nowrap: true }).w));
  const fitCache = new Map();
  function fit(api, blk, size, maxw) {
    const key = blk.i + "|" + size.toFixed(1) + "|" + maxw.toFixed(0) + "|" + LW;
    let f = fitCache.get(key);
    if (!f) {
      f = layOf(api).formula(blk.nodes, size);
      if (f.w > maxw) { const s2 = size * (maxw / f.w) * 0.97; f = layOf(api).formula(blk.nodes, s2); f.size = s2; } else f.size = size;
      fitCache.set(key, f);
    }
    return f;
  }
  const SLIDER_H = 62, RESULT_H = 54, GAPB = 18;
  function heights(api, k, S) {
    const W = api.w, fw = W - 40;
    return blocks.map((b) => {
      if (b.kind === "calc") {
        const f = fit(api, b, 30 * k, fw), ns = b.vars.filter((v) => v.slider).length, nc = b.vars.length - ns;
        const fixed = (b.title ? 30 : 0) + f.a + f.d + 14 + RESULT_H + ns * SLIDER_H * k + (nc ? 34 : 0);
        const ph = b.plotVar ? clamp((S || 520) - fixed - 8, 96, 190) * (k < 1 ? 0.85 : 1) : 0;
        return { f, h: fixed + ph + (ph ? 8 : 0), ph };
      }
      const size = (b.kind === "step" ? 30 : b.size) * k, f = fit(api, b, size, fw);
      return { f, h: f.a + f.d + 16 + (b.kind === "step" ? 26 : 0) + (b.kind === "math" && b.caption ? 6 : 0), ph: 0 };
    });
  }
  const chooseH = (api) => (film.choose ? host.chooseBlock(api, film, 0, 0, 0, 0, api.w - 40, true) + 6 : 0);
  function plan(api, avail) {
    LW = Math.round(api.w);
    let hs = null, kk = 1;
    for (const k of [1, 0.85, 0.7, 0.6]) {
      kk = k; hs = heights(api, k, avail);
      if (hs.reduce((a, x) => a + x.h, 0) + GAPB * (blocks.length - 1) <= avail) break;
    }
    return { hs, k: kk };
  }

  // ---- drawing ---------------------------------------------------------------------------------------------------------
  const geo = {};
  function drawFormula(api, blk, f, ox, oy, tt, t) {
    const marked = api.marked;
    f.items.forEach((q, i) => {
      const s0 = blk.fT + i * blk.step, k = seg(tt, s0, s0 + (q.k === "g" ? 0.3 : 0.4));
      if (k <= 0) return;
      if (q.k === "g") api.text(q.s, ox + q.x, oy + q.y - q.size * 0.3, { size: q.size, weight: q.wt, italic: q.ital, c: "fg", align: "left", k, free: true, noHit: true, nowrap: true, rise: 6 });
      else if (q.k === "l") api.line(ox + q.x1, oy + q.y1, ox + q.x2, oy + q.y2, { c: "fg", w: q.lw, k, rough: 0 });
      else api.stroke(q.pts.map((p) => [ox + p[0], oy + p[1]]), { c: "fg", w: q.lw, k, rough: 0 });
    });
    f.terms.forEach((tm, j) => {
      const id = blk.tids[j], first = f.items.findIndex((q) => q.term === j), ap = blk.fT + Math.max(0, first) * blk.step + 0.15;
      if (tt < ap) return;
      const w = tm.x1 - tm.x0, h = tm.y1 - tm.y0, cx = ox + (tm.x0 + tm.x1) / 2, cy = oy + (tm.y0 + tm.y1) / 2;
      if (marked === id) api.rect(ox + tm.x0 - 3, oy + tm.y0 - 4, w + 6, h + 8, { c: "warn", w: 3.5, r: 10, rough: 0, a: 0.95 });
      api.hitBox(id, cx, cy, Math.max(w + 10, 34), Math.max(h + 8, 34), tm.name);
    });
  }

  function drawCalc(api, blk, H, y, t, tt, W) {
    tween(blk);
    const fw = W - 40, f = H.f, marked = api.marked;
    let yy = y;
    if (blk.title) { api.text(blk.title, W / 2, yy + 14, { size: 22, weight: 800, k: seg(tt, 0, 0.4), maxw: fw, free: true, noHit: true }); yy += 30; }
    const ox = (W - f.w) / 2, oy = yy + f.a;
    drawFormula(api, blk, f, ox, oy, tt, t);
    yy += f.a + f.d + 14;
    // the result
    const kr = seg(tt, blk.fEnd, blk.fEnd + 0.4), shown = resultNow(blk, true);
    const rtxt = Number.isFinite(shown) ? withUnit(shown, blk.unit, blk.digits) : resultText(blk);
    if (kr > 0) {
      const name = blk.out ? blk.out + " =" : "", nw = name ? api.measure(name, { size: 22, weight: 700 }).w + 10 : 0, vw = api.measure(rtxt, { size: 40, weight: 800, nowrap: true }).w, x0 = (W - nw - vw) / 2;
      if (marked === blk.rid) api.rect(x0 - 10, yy + 2, nw + vw + 20, 46, { c: "warn", w: 3.5, r: 12, rough: 0 });
      if (name) api.text(name, x0, yy + 26, { size: 22, weight: 700, c: "dim", align: "left", k: kr, free: true, noHit: true, nowrap: true });
      api.text(rtxt, x0 + nw, yy + 26, { size: 40, weight: 800, c: "accent", align: "left", k: kr, free: true, noHit: true, nowrap: true, rise: 0 });
      if (kr > 0.4) api.hitBox(blk.rid, W / 2, yy + 26, Math.min(fw, 240), 48, `${blk.out || "Result"}: ${resultText(blk)}`);
    }
    yy += RESULT_H;
    // the plot of the result against one variable
    if (blk.plotVar && H.ph) {
      const pv = varOf(blk, blk.plotVar), ph = H.ph, ka = seg(tt, blk.fEnd + 0.1, blk.fEnd + 0.7), kc = seg(tt, blk.fEnd + 0.4, blk.fEnd + 1.3);
      const px0 = 20 + 40, px1 = W - 28, py0 = yy + 22, py1 = yy + ph - 22, N = 60;
      if (ka > 0) {
        const xs = [], ys = [], e = env(blk, true);
        for (let i = 0; i <= N; i++) { const x = pv.min + ((pv.max - pv.min) * i) / N; xs.push(x); e[pv.name] = isDeg(pv.unit) ? (x * Math.PI) / 180 : x; ys.push(evalAt(blk, e)); }
        const fin = ys.filter(Number.isFinite);
        if (fin.length) {
          const sc = niceScale(Math.min(...fin), Math.max(...fin), 3), X = (x) => px0 + ((x - pv.min) / (pv.max - pv.min || 1)) * (px1 - px0), Y = (v) => py1 - ((v - sc.lo) / (sc.hi - sc.lo || 1)) * (py1 - py0);
          api.text(`${blk.out || "result"} against ${blk.plotVar}`, px0, yy + 8, { size: 12, weight: 700, c: "dim", align: "left", k: ka, free: true, noHit: true, nowrap: true });
          api.line(px0, py1, px0 + (px1 - px0) * ka, py1, { c: "dim", w: 2.5, rough: 0 });
          api.line(px0, py1, px0, py1 - (py1 - py0) * ka, { c: "dim", w: 2.5, rough: 0 });
          sc.ticks.forEach((v) => { const yv = Y(v); if (v !== sc.lo) api.line(px0, yv, px1, yv, { c: "line", w: 1.2, a: 0.7 * ka, rough: 0 }); api.text(fmtNum(v, 3), px0 - 8, yv, { size: 11, weight: 600, c: "dim", align: "right", k: ka, free: true, noHit: true, nowrap: true }); });
          [pv.min, (pv.min + pv.max) / 2, pv.max].forEach((v, i) => api.text(fmtNum(v, 3), X(v), py1 + 13, { size: 11, weight: 600, c: "dim", align: i === 0 ? "left" : i === 2 ? "right" : "center", k: ka, free: true, noHit: true, nowrap: true }));
          const pts = []; ys.forEach((y2, i) => { if (Number.isFinite(y2)) pts.push([X(xs[i]), Y(y2)]); });
          if (pts.length > 1) api.stroke(pts, { c: "accent", w: 3.5, k: kc, rough: 0 });
          const cur = pv.slider ? (blk.tw[pv.name] ? blk.disp[pv.name] : pv.value) : pv.value;
          if (Number.isFinite(shown) && kc >= 1) {
            const mx = X(cur), my = Y(clamp(shown, sc.lo, sc.hi));
            api.line(mx, py1, mx, my, { c: "good", w: 1.8, dash: [5, 5], a: 0.8, rough: 0 });
            api.line(px0, my, mx, my, { c: "good", w: 1.8, dash: [5, 5], a: 0.8, rough: 0 });
            api.dot(mx, my, 6.5, { c: "good" }); api.circle(mx, my, 11, { c: "good", w: 2, a: 0.5, rough: 0 });
          }
        }
        if (marked === blk.pid) api.rect(px0 - 4, py0 - 6, px1 - px0 + 8, py1 - py0 + 12, { c: "warn", w: 3.5, r: 10, rough: 0, a: 0.9 });
        if (ka > 0.5) api.hitBox(blk.pid, (px0 + px1) / 2, (py0 + py1) / 2, px1 - px0, py1 - py0, `${blk.out || "Result"} against ${blk.plotVar}`);
      }
      yy += ph + 8;
    }
    // one slider per variable, then the constants
    let j = 0;
    blk.vars.filter((v) => v.slider).forEach((v) => {
      const ts = blk.fEnd + 0.3 + j * 0.3, kt = seg(tt, ts, ts + 0.5), kk = seg(tt, ts + 0.3, ts + 0.7); j++;
      const x0 = 34, x1 = W - 34, ty = yy + 44, row = yy;
      geo[v.id] = { x0, x1, y: ty };
      if (kt > 0) {
        api.text(v.name, 26, row + 14, { size: 20, weight: 800, italic: true, align: "left", k: kt, free: true, noHit: true, nowrap: true });
        api.text(withUnit(v.value, v.unit, 4), W - 26, row + 14, { size: 18, weight: 800, c: "accent", align: "right", k: kt, free: true, noHit: true, nowrap: true });
        api.line(x0, ty, x1, ty, { c: "line", w: 6, k: kt, rough: 0 });
        if (kk > 0) {
          const kx = x0 + (x1 - x0) * ((v.value - v.min) / ((v.max - v.min) || 1));
          if (kx > x0) api.line(x0, ty, kx, ty, { c: "accent", w: 6, rough: 0 });
          api.dot(kx, ty, KNOB_R, { c: "accent", a: kk }); api.circle(kx, ty, KNOB_R + 5, { c: "accent", w: 2.5, a: 0.5 * kk, rough: 0 });
          if (marked === v.id) api.circle(kx, ty, KNOB_R + 10, { c: "warn", w: 3, a: 0.9, rough: 0 });
          if (kk > 0.5) api.hit(v.id, kx, ty, KNOB_R + 12, `${v.name}: ${withUnit(v.value, v.unit, 4)}`, { drag: true });
        }
      }
      yy += SLIDER_H * (HK < 1 ? HK : 1);
    });
    const consts = blk.vars.filter((v) => !v.slider);
    if (consts.length) {
      let cx = 24;
      consts.forEach((v) => {
        const txt = `${v.name} = ${withUnit(v.value, v.unit, 6)}`, m = api.measure(txt, { size: 15, weight: 700, nowrap: true }), kc2 = seg(tt, blk.fEnd + 0.4, blk.fEnd + 0.8);
        if (kc2 > 0) {
          api.text(txt, cx, yy + 14, { size: 15, weight: 700, c: "dim", align: "left", k: kc2, free: true, noHit: true, nowrap: true });
          if (marked === v.id) api.rect(cx - 6, yy + 2, m.w + 12, 24, { c: "warn", w: 3, r: 8, rough: 0 });
          if (kc2 > 0.5) api.hitBox(v.id, cx + m.w / 2, yy + 14, m.w + 12, 30, `${v.name}: ${withUnit(v.value, v.unit, 6)}`);
        }
        cx += m.w + 20;
      });
    }
  }
  let HK = 1;   // the scale the page needed for this frame (heights above shrink with it)

  function drawBlocks(t, api, avail, top) {
    const W = api.w, cH = chooseH(api), pl = plan(api, avail - cH);
    HK = pl.k;
    const sum = pl.hs.reduce((a, x) => a + x.h, 0) + GAPB * (blocks.length - 1);
    let y = top + Math.max(0, (avail - cH - sum) / 2);
    blocks.forEach((blk, bi) => {
      const H = pl.hs[bi], tt = t - blk.t0;
      if (tt >= 0) {
        if (blk.kind === "calc") drawCalc(api, blk, H, y, t, tt, W);
        else {
          let yy = y;
          if (blk.kind === "step" && blk.title) { api.text(blk.title, W / 2, yy + 10, { size: 15, weight: 700, c: "dim", k: seg(tt, 0, 0.4), free: true, noHit: true, maxw: W - 40 }); yy += 26; if (tt > 0.2) api.hitBox(blk.stepId, W / 2, yy - 16, Math.min(W - 40, api.measure(blk.title, { size: 15, weight: 700 }).w + 20), 30, blk.title); }
          drawFormula(api, blk, H.f, (W - H.f.w) / 2, yy + H.f.a + 4, tt, t);
        }
      }
      y += H.h + GAPB;
    });
    if (film.choose) host.chooseBlock(api, film, t, total - HOLD - 1.3, 20, top + avail - cH + 4, W - 40, false);
    return pl;
  }

  const cap = blocks.find((b) => b.kind === "math" && b.caption);
  const film = {
    kind: "sci", total, marks, blocks, choose: read0.choose, chosen: null, onShapes: false, says: read0.says, title: "", caption: cap ? cap.caption : "",
    ask: "",
    // YUI-329: how tall the answer wants to be (no cap), so a mixed answer can give it a slot
    height(api) { LW = Math.round(api.w); return heights(api, 1, 520).reduce((a, x) => a + x.h, 0) + GAPB * (blocks.length - 1) + chooseH(api); },
    draw(t, api) {
      const H = api.h, top = 112, areaB = H - 196;
      drawBlocks(t, api, areaB - top, top);
      film.says.slice(0, 1).forEach((s0) => api.say(s0, 0.3, Math.min(total - 0.5, 3.6), { y: "bottom", size: 20 }));
      if (cap) api.say(cap.caption, Math.max(film.says.length ? 3.8 : 0.3, cap.t0 + cap.fEnd - 0.2), total + 1, { y: "bottom", size: 20 });
    },
    // a slider: a drag (x is a screen pixel; the line is sent when it ends) or an arrow key (dir -1 or +1, one line per step)
    drag(d) {
      const f = varOfBlk(d.id), g = geo[d.id]; if (!f || !g) return null;
      const u = clamp((d.x - g.x0) / (g.x1 - g.x0), 0, 1);
      setValue(d.id, f.v.min + u * (f.v.max - f.v.min));
      return d.phase === "end" ? commit(d.id) : null;
    },
    nudge(d) {
      const f = varOfBlk(d.id); if (!f || !f.v.slider) return null;
      setValue(d.id, f.v.value + (d.dir < 0 ? -1 : 1) * f.v.keyStep);
      return commit(d.id);
    },
    // test and page hooks: set a slider by value; the same text with the sliders where they are now
    setValue, commit,
    busy() { return blocks.some((b) => b.kind === "calc" && Object.keys(b.tw).length > 0); },
    retext(text) {
      let out = text;
      for (const b of blocks) if (b.kind === "calc") for (const v of b.vars) if (v.slider) out = out.replace(new RegExp("(\\b" + v.name + "=)(-?\\d+(?:\\.\\d+)?-(?:-?\\d+(?:\\.\\d+)?))(?:@-?\\d+(?:\\.\\d+)?)?"), (_m, a, r) => `${a}${r}@${v.value}`);
      return out;
    },
    wordsFor(label) {
      const m = marks.find((x) => x.label === label || x.id === label || (x.hitLabel && x.hitLabel() === label));
      return m ? (m.dyn ? m.dyn() : m.words) : null;
    },
    values() { const o = {}; blocks.forEach((b) => b.kind === "calc" && b.vars.forEach((v) => { o[v.name] = v.value; })); return o; },
  };
  film.sizeOf = () => blocks.length;
  return film;
}
