// Writes spec/shapes/scenes.json: for each input, the scene the JS model
// lays out (site/lib/yl/shapes.mjs), where every part is at a few moments,
// the wrapped label lines and the plain-text description. The app's
// ShapesScene.swift is tested against this file (YuiTests/ShapesSceneTests),
// so both platforms draw the same diagram. `node gen.mjs --check` fails if
// the committed file is stale.
//   cd spec/shapes && node gen.mjs [--check]
import { readFileSync, writeFileSync } from "node:fs";
import { parse } from "../../site/lib/yl/yl.mjs";
import { contour, describe, frame, labelWidth, LABEL, regionLabel, scene, venn, wrap } from "../../site/lib/yl/shapes.mjs";

const INPUTS = [
  ["a row with auto arrows", `shapes "How an ask reaches your phone" caption="You ask, it lands on the board."
shape@you circle You +grow
shape arrow
shape box Board +fill
shape arrow
shape pill Lane +pulse
shape arrow label=ships
shape circle Phone tone=mint +grow`],
  ["a crowded row scales down, labels wrap", `shapes "Heat pump loop"
shape blob "Outside air" tone=mute
shape arrow
shape box "Outdoor coil" tone=lavender +fill
shape arrow
shape pill Compressor +pulse
shape arrow
shape box "Indoor coil" tone=butter +fill`],
  ["placed shapes, ids, a dashed arrow, a path", `shapes "Where the time goes" w=10 h=5 caption="Most of it is thinking."
shape@think blob Thinking at=3,2.5 size=4,3 tone=lavender +fill +grow
shape@draw dot at=8,2.5 tone=mint
shape text "drawing" at=8,3.4
shape arrow from=think to=draw +dash
shape path pts=1,4.6|3,4|5,4.4|7,3.8|9,4.2 tone=mute`],
  ["move, lines between points, a shape kept on the canvas", `shapes "Where your idea is" h=4
shape text Backlog at=1.7,0.5 tone=mute
shape line at=3.35,0.2 to=3.35,3.8 tone=mute +dash
shape pill Shapes at=1.7,2.3 size=2.6 +fill move=5,2.3
shape@dot dot Live at=5,3.4 tone=mint +pulse
shape circle Edge at=10,0`],
  ["unknown kinds draw as boxes, bad connectors are dropped", `shapes w=8 h=3
shape hexagon Six
shape arrow to=nowhere
shape arrow
shape Circle Two
shape path pts=1,1
shape line`],
  ["a lone shape", `shape circle Hello +pulse`],
  ["a Venn of two and a Venn of three, overlaps labelled", `shapes "Where Yui sits" w=12 h=5 caption="Chat and drawing overlap in Yui."
shape venn Yui sets=Chat|Drawing at=3.2,2.5 +grow
shape venn sets=Design|Code|Words pairs=Mock|Sketch|Docs at=9,2.5 size=4.6 tone=mint`],
  ["a Venn in the auto row joins an arrow", `shapes
shape venn Both sets=Ask|Answer
shape arrow
shape circle Done`],
  ["a region, a contour and curved connectors", `shapes "Where the heat is" w=10 h=6 caption="The hot spot sits east of the middle."
shape region Field pts=1,1|6,0.8|8.6,2.4|7.4,5|2.6,5.2|0.8,3.4 tone=butter +fill
shape@hot contour Peak at=6,3 size=3.4,2.6 rings=5 +fill
shape arrow "look here" from=1,5.6 to=hot bend=0.35
shape line from=1,0.5 to=9,0.5 bend=-0.2 tone=mute +dash`],
  ["doodles over a picture, short ones dropped", `shapes "Fix this" img=/demo/site_before_hero.jpg w=16 h=9
shape doodle at=5,3 size=4,2 tone=butter
shape doodle pts=9,7|11,6.2|13,6.8
shape arrow "this one" from=13,2 to=7,3 bend=0.3
shape region pts=1,1|3,1
shape doodle`],
  ["long names are capped and fitted, a region labelled in its widest part", `shapes "Who does what" w=12 h=6
shape venn "The people who design every screen" sets="Product design team"|"Engineering and platform"|Words pairs="Mocks and prototypes"|Sketch|"Docs" at=4,3
shape region "A very long name for a small field" pts=7,1|11.5,1.2|11,5|7.5,4.6
shape contour "The highest point of the whole map" at=9.2,3 size=3,2.4`],
  ["a tap and swipes, one by its direction", `shapes "Hold to talk" w=10 h=6
shape@mic tap "hold to talk" at=5,4.5 +pulse
shape swipe "slide to cancel" at=5,4.5 dir=left
shape swipe from=5,4.5 to=5,1.5 bend=0.2 tone=mint
shape swipe "nowhere" at=5,4.5 dir=sideways`],
  ["a picture with no h takes its own shape", `shapes "Fix this" img=/demo/site_before_hero.jpg
shape doodle at=5,3 size=3,2`, { ratio: 0.5625 }],
];
const TIMES = [0.2, 0.9, 2, 4.3, "still"];
const r = (v) => (typeof v === "number" ? Math.round(v * 1e4) / 1e4 : Array.isArray(v) ? v.map(r) : v && typeof v === "object" ? Object.fromEntries(Object.entries(v).map(([k, x]) => [k, r(x)])) : v);

const out = INPUTS.map(([name, input, opts]) => {
  const ops = parse(input).filter((o) => o.op === "add");
  const lone = ops[0].preset === "shape";
  const head = lone ? {} : ops[0].props;
  const members = (lone ? ops : ops.slice(1)).map((o) => ({ id: o.id, props: o.props }));
  const sc = scene(head, members, opts || {});
  const k = sc.fs / (LABEL * sc.w);
  const frames = {};
  for (const t of TIMES) {
    frames[t] = frame(sc, t === "still" ? Infinity : t).map((f) => {
      const o = { i: f.i, o: f.o, s: f.s, d: f.d };
      if (f.c) o.c = f.c;
      if (f.a) { o.a = f.a; o.b = f.b; }
      if (f.q) o.q = f.q;
      return o;
    });
  }
  const labels = Object.fromEntries(sc.items.filter((it) => it.label).map((it) => [it.i, wrap(it.label, labelWidth(it, k), it.from || it.pts ? sc.fs * 0.9 : sc.fs)]));
  // Where the new kinds put their labels, and how they fit (YUI-276).
  const marks = {};
  for (const it of sc.items) {
    if (it.kind === "venn") marks[it.i] = venn(it, it.at, 1, sc.fs).labels;
    if (it.kind === "region" && it.label) marks[it.i] = [regionLabel(it, sc.fs)];
    if (it.kind === "contour" && it.label) marks[it.i] = [{ at: contour(it, it.at, 1, sc.fs).peak, ...contour(it, it.at, 1, sc.fs).label }];
  }
  return r({ name, input, ...(opts ? { opts } : {}), members, head, scene: sc, frames, labels, marks, text: describe(sc) });
});
const json = JSON.stringify({ about: "Shapes scenes from site/lib/yl/shapes.mjs (YUI-104). Generated by gen.mjs; numbers rounded to 4 places.", scenes: out }, null, 1) + "\n";
const file = new URL("./scenes.json", import.meta.url);
if (process.argv.includes("--check")) {
  const same = readFileSync(file, "utf8") === json;
  console.log(same ? "scenes.json is current" : "scenes.json is stale: run node gen.mjs");
  process.exit(same ? 0 : 1);
}
writeFileSync(file, json);
console.log(`wrote scenes.json: ${out.length} scenes`);
