// The brand films' runtime. Every frame is a pure function of t, like the rest of the kit.
// The materials, the mark and its motion come from site/lib/brand, the same code as yuigui.com/brand.
import { brandStage } from "../../site/lib/brand/gl.mjs";
import { markPaths, VIEWBOX, SPEC, landPose, ease, ORDER } from "../../site/lib/brand/mark.mjs";
import { SCENES, BOJAGI } from "../../site/lib/brand/scenes.mjs";
import { byId } from "../../site/lib/brand/palettes.mjs";
import { wink, landTimes, posesAt } from "../../site/lib/brand/motion.mjs";

export { SCENES, BOJAGI, byId, landPose, ease, ORDER, wink, landTimes, posesAt, SPEC };
export const Q = new URLSearchParams(location.search);
export const REEL = Q.has("reel");
if (REEL) document.body.classList.add("reel");
export const W = REEL ? 1080 : 1920, H = REEL ? 1920 : 1080;
export const stage = document.getElementById("stage");
export const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
export const prog = (t, a, b) => clamp((t - a) / (b - a));
export const mix = (a, b, u) => a + (b - a) * u;

// A full-frame shader layer. draw(t, scene) takes a scene object like lib/brand/scenes.mjs returns.
export function shaderLayer(name) {
  const c = document.createElement("canvas");
  c.className = "layer";
  stage.appendChild(c);
  const st = brandStage(c, name, { maxSide: 1920 });
  st.resize(W, H);
  let key = "";
  return {
    el: c,
    draw(t, sc) {
      const k = JSON.stringify([sc.mark, sc.place, sc.pieceColors]);
      if (k !== key) { st.setMark(sc.mark, sc.place, sc.pieceColors); key = k; }
      st.draw(t, { p: sc.p, q: sc.q, mouse: sc.mouse || [0.5, 0.5], colors: sc.colors });
    },
    show(o) { c.style.opacity = o; c.style.visibility = o > 0.001 ? "visible" : "hidden"; },
  };
}

// The vector mark in one color, filling the frame like the shaders do (pad is a share of the short side).
export function inkLayer({ fill = "#1D1B20", pad = 0.14 } = {}) {
  const NS = "http://www.w3.org/2000/svg";
  const svg = document.createElementNS(NS, "svg");
  svg.setAttribute("class", "layer");
  const room = Math.min(W, H) * pad;
  const [bx, by, bw, bh] = VIEWBOX.split(" ").map(Number);
  const s = Math.min((W - room * 2) / bw, (H - room * 2) / bh);
  const vw = W / s, vh = H / s;
  svg.setAttribute("viewBox", `${bx + bw / 2 - vw / 2} ${by + bh / 2 - vh / 2} ${vw} ${vh}`);
  const back = document.createElementNS(NS, "g");
  const g = document.createElementNS(NS, "g");
  const front = document.createElementNS(NS, "g");
  g.setAttribute("fill", fill);
  svg.append(back, g, front);
  const paths = ORDER.map(() => { const p = document.createElementNS(NS, "path"); g.appendChild(p); return p; });
  stage.appendChild(svg);
  return {
    el: svg, back, front, g, NS,
    set(opts = {}, fillNow, alpha = {}) {
      const ps = markPaths(opts);
      const by = Object.fromEntries(ps.map((p) => [p.name, p.d]));
      ORDER.forEach((n, i) => { paths[i].setAttribute("d", by[n]); paths[i].setAttribute("opacity", alpha[n] ?? 1); });
      if (fillNow) g.setAttribute("fill", fillNow);
    },
    show(o) { svg.style.opacity = o; svg.style.visibility = o > 0.001 ? "visible" : "hidden"; },
  };
}

// Words: in, hold, out. Old text out before new text in (kit rule).
export function cap(text, cls = "low", color = "#1D1B20") {
  const d = document.createElement("div");
  d.className = "bcap " + cls;
  d.style.color = color;
  d.textContent = text;
  stage.appendChild(d);
  return d;
}
export function label(text, side = "l", color = "#1D1B20") {
  const d = document.createElement("div");
  d.className = "label " + side;
  d.style.color = color;
  d.textContent = text;
  stage.appendChild(d);
  return d;
}
export function inOut(el, t, a, b, rise = 24) {
  const i = ease.out(prog(t, a, a + 0.45)), o = prog(t, b - 0.3, b);
  const v = i * (1 - o);
  el.style.opacity = v;
  el.style.transform = `translateY(${(1 - i) * rise}px)`;
  return v;
}

export function ready() {
  return (async () => {
    await document.fonts.load('800 40px "YuiRounded"');
    await document.fonts.load('600 40px "YuiMono"');
    await document.fonts.ready;
    return document.fonts.check('800 40px "YuiRounded"');
  })();
}
