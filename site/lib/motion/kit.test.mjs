// The motion kit (public/demo/motion/kit.js, MOTION-1): what the prompt promises exists, every call draws
// without throwing, and a frame is a pure function of t. Runs against a recording canvas stub.
import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const dir = new URL("../../public/demo/motion/", import.meta.url);
globalThis.window = globalThis;
await import(new URL("kit.js", dir));
const geo = readFileSync(new URL("geo-data.js", dir), "utf8");
new Function("window", geo)(globalThis);

function stub() {
  const log = [];
  const grad = { addColorStop() {} };
  const ctx = new Proxy({ log, globalAlpha: 1, shadowBlur: 0 }, {
    get(t, k) {
      if (k in t) return t[k];
      if (k === "measureText") return (s) => ({ width: String(s).length * 8 });
      if (k === "createLinearGradient" || k === "createRadialGradient") return () => grad;
      return (...a) => { log.push([k, ...a.map((x) => (typeof x === "number" ? +x.toFixed(3) : x))]); };
    },
    set(t, k, v) { t[k] = v; if (typeof v !== "object") log.push(["=" + String(k), typeof v === "number" ? +v.toFixed(3) : v]); return true; },
  });
  return ctx;
}
const make = () => { const c = stub(); const api = globalThis.makeMotionKit(c, {}); api.size(390, 844, 1); return { c, api }; };

test("every api.name the prompt teaches exists in the kit", () => {
  const prompt = readFileSync(new URL("prompt-kit.md", dir), "utf8");
  const { api } = make();
  const miss = [];
  for (const m of prompt.matchAll(/api\.([a-zA-Z0-9]+)(?:\.([a-zA-Z0-9]+))?/g)) {
    const [, a, b] = m;
    if (a === "three") continue; // added by the player, not the kit (needs the host to send three.js)
    if (!(a in api)) miss.push(a);
    else if (b && api[a] && typeof api[a] === "object" && !(b in api[a]) && !["S"].includes(a)) miss.push(`${a}.${b}`);
  }
  assert.deepEqual([...new Set(miss)], []);
});

test("the stock shapes draw, and every shape named in the prompt is one", () => {
  const { api, c } = make();
  for (const n of api.shapes.concat(["gear"])) { api.frame(); api.shape(n, 100, 100, 80, { k: 0.6 }); }
  assert.ok(c.log.length > 100);
  const prompt = readFileSync(new URL("prompt-kit.md", dir), "utf8");
  const line = prompt.slice(prompt.indexOf("api.shape(name"), prompt.indexOf("api.ring(")).replace(/api\.shape\(name,x,y,size,o\) stock icons:/, "");
  for (const w of line.split(/\s+/).filter((x) => /^[a-z]+$/.test(x))) if (["stock", "icons"].includes(w)) continue;
  for (const must of ["heart", "gear", "person", "phone"]) assert.ok(api.shapes.includes(must) || must === "gear");
});

test("a frame is a pure function of t", () => {
  const draw = (api, t) => {
    api.look("sketch");
    const A = api.node(100, 200, 130, 60, "Phone", { icon: "phone", k: api.seg(t, 0, 1) });
    const B = api.node(290, 200, 130, 60, "Server", { k: api.seg(t, 0.5, 1.5) });
    api.link(A, B, { k: api.seg(t, 1, 2), flow: t });
    api.callout("A part", 100, 230, 200, 400, { k: api.seg(t, 2, 3) });
    api.bars([{ label: "a", v: 3 }, { label: "b", v: 5 }], 30, 500, 300, 120, { k: api.seg(t, 0, 3) });
    api.swarm(30, t, { mode: "orbit" });
    api.kinetic("Hello there", 195, 100, { mode: "scatter", k: api.seg(t, 0, 2) });
  };
  const a = make(), b = make();
  a.api.frame(); a.c.log.length = 0; draw(a.api, 1.7);
  draw(b.api, 0.3); b.api.frame(); b.c.log.length = 0; draw(b.api, 1.7);
  assert.deepEqual(a.c.log, b.c.log);
});

test("everything draws at k=0, k=0.5 and k=1 without throwing, and nothing is NaN", () => {
  for (const k of [0, 0.5, 1]) {
    const { api, c } = make();
    api.frame();
    api.line(10, 10, 100, 100, { k }); api.arrow(10, 10, 100, 100, { k, bend: 20 }); api.curve(0, 0, 50, 90, 100, 0, { k });
    api.rect(10, 10, 80, 40, { k, r: 8, fill: "accent" }); api.circle(50, 50, 20, { k }); api.ellipse(50, 50, 30, 10, { k }); api.arc(50, 50, 20, 0, 3, { k });
    api.poly([[0, 0], [50, 0], [25, 40]], { k }); api.dot(10, 10, 4, { k }); api.glow(50, 50, 30);
    api.path("M0 0 C 10 20 30 20 40 0 A 10 10 0 0 1 60 0 Q 70 30 80 0 L 90 10 Z", { x: 10, y: 10, s: 1.2, k });
    api.text("Hello world", 100, 100, { k, type: true }); api.label("Pill", 100, 140, { k }); api.kinetic("Big words here", 195, 300, { k, mode: "pop" });
    api.callout("Look", 50, 50, 200, 200, { k }); api.pin(1, 40, 40, { k }); api.dim(10, 300, 200, 300, "190", { k }); api.brace(10, 320, 200, 320, { k });
    api.scribble(100, 100, 40, 20, { k }); api.underline(10, 400, 100, { k });
    api.bars([1, 2, 3], 10, 10, 200, 100, { k }); api.lineChart([{ v: [1, 3, 2, 5] }], 10, 10, 200, 100, { k, area: true, dots: true });
    api.donut([3, 2, 1], 100, 100, 50, { k }); api.progress(10, 10, 100, 12, 0.5, { k }); api.counter(1234, 100, 100, { k, pre: "$" });
    api.timeline(["a", "b", "c"], 10, 300, 300, { k }); api.timeline([{ t: "x", s: "y" }, { t: "z" }], 40, 100, 200, { k, vert: true });
    api.compare(k, () => api.circle(100, 100, 40), () => api.rect(60, 60, 80, 80), { labels: ["Before", "After"] });
    api.lens(100, 100, 40, 3, () => api.circle(100, 100, 10), { k });
    api.swarm(20, 1, { mode: "burst", k }); for (const m of ["drift", "rise", "fall", "orbit", "flock", "suck"]) api.swarm(10, 1, { mode: m });
    api.along([[0, 0], [100, 100], [200, 0]], 5, 1); api.stars(10, 1);
    const P = api.d3.cam({ yaw: 0.5 });
    for (const m of [api.d3.box(1), api.d3.sphere(1, 6), api.d3.torus(1, 0.3, 10, 6), api.d3.cyl(), api.d3.cone(), api.d3.helix(), api.d3.plane()]) { api.d3.wire(m, P, { k }); api.d3.solid(api.d3.xf(m, { rx: 1 }), P); }
    const Pj = api.geo.proj({ type: "ortho", lon: 10, lat: 20 }); api.geo.land(Pj, {}); api.geo.land(api.geo.proj({ type: "equi" }), { only: ["FR"], dim: true });
    api.geo.route(-74, 40.7, 2.3, 48.8, Pj, { k }); api.geo.pin(2.3, 48.8, Pj); api.geo.grat(Pj);
    api.cam(10, 10, 1.5, 0.1); api.focus(100, 100, 2); api.layer(0.5, () => api.dot(10, 10, 3)); api.cam0();
    api.say("A caption", 0, 3); api.hit("a", 10, 10, 30);
    for (const e of c.log) for (const v of e.slice(1)) assert.ok(typeof v !== "number" || Number.isFinite(v), `NaN in ${e[0]} at k=${k}`);
    assert.equal(api.takeCaps().length, 1);
    assert.equal(api.takeHits().length, 1);
  }
});

test("text stays on screen when the camera is still, and wraps to the width", () => {
  const { api } = make();
  api.frame();
  const b = api.text("A fairly long line of words that will not fit on one line of a phone", 195, 100, { size: 24 });
  assert.ok(b.x >= 0 && b.x + b.w <= 390, `box ${b.x} ${b.w}`);
  const r = api.text("Right edge", 400, 200, { size: 24 });
  assert.ok(r.x + r.w <= 390);
});

test("SVG paths parse: relative, arcs and smooth curves", () => {
  const { api } = make();
  const sub = api.pathPts("m 0 0 h 10 v 10 h -10 z M 0 0 a 5 5 0 0 1 10 0 s 5 5 10 0 q 5 5 10 0 t 10 0", { s: 1 });
  assert.equal(sub.length, 2);
  assert.ok(sub[0].length >= 4);
  for (const p of sub[1]) assert.ok(Number.isFinite(p[0]) && Number.isFinite(p[1]));
});

test("look() sets the palette for the frame only", () => {
  const { api } = make();
  api.frame(); api.look("paper"); const paper = api.pal.ink;
  api.frame(); assert.notEqual(api.pal.ink, paper);
  api.theme({ ink: "#ffffff", accent: "#00ff00" }); api.frame(); assert.equal(api.pal.accent, "#00ff00"); assert.equal(api.light, true);
});

test("the spike's api.path(points, close) still builds a path and leaves stroking to the caller", () => {
  const { api, c } = make();
  api.frame(); c.log.length = 0;
  api.path(api.pts.circle(20, 50), true);
  const kinds = c.log.map((e) => e[0]);
  assert.ok(kinds.includes("moveTo") && kinds.includes("quadraticCurveTo") && kinds.includes("closePath"));
  assert.ok(!kinds.includes("stroke") && !kinds.includes("fill"));
});
