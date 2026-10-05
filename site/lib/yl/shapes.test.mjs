// Shapes drawing kit (YUI-291): closed regions, overlap, contour, bent arrows, bracket, callout.
//   node site/lib/yl/shapes.test.mjs     exit 1 on any failure
import { parse } from "./yl.mjs";
import { along, bracketPoints, control, describe, frame, scene } from "./shapes.mjs";

let bad = 0, n = 0;
const eq = (name, got, want) => {
  n++;
  if (JSON.stringify(got) !== JSON.stringify(want)) { bad++; console.log(`FAIL ${name}\n  got  ${JSON.stringify(got)}\n  want ${JSON.stringify(want)}`); }
};
const draw = (src) => {
  const ops = parse(src).filter((o) => o.op === "add");
  return scene(ops[0].props, ops.slice(1).map((o) => ({ id: o.id, props: o.props })));
};

const venn = draw(`shapes w=10 h=7
shape circle at=3.8,2.6 size=4 +fill
shape circle at=6.2,2.6 size=4 +fill
shape circle at=9,6 size=1 +fill
shape text Both at=5,2.6`);
eq("overlapping fills take the blend", venn.items.map((i) => !!i.blend), [true, true, false, false]);

const apart = draw(`shapes w=10 h=7
shape circle at=2,2 size=2 +fill
shape circle at=8,5 size=2 +fill`);
eq("fills that do not meet stay plain", apart.items.map((i) => !!i.blend), [false, false]);

const open = draw(`shapes w=10 h=7
shape circle at=3.8,2.6 size=4
shape circle at=6.2,2.6 size=4`);
eq("outlines that cross do not blend", open.items.map((i) => !!i.blend), [false, false]);

const zone = draw(`shapes
shape path pts=1,1|3,0.5|4,2 +close +fill
shape path pts=1,1|3,0.5`);
eq("+close needs three points", zone.items.map((i) => !!i.close), [true, false]);

const hill = draw(`shapes w=10 h=6
shape contour at=4,3 size=6,4 rings=20
shape contour`);
eq("a contour has 2 to 8 rings", hill.items.map((i) => i.rings), [8, 4]);
eq("a contour with no at sits in the middle", hill.items[1].at, [5, 3]);

const ring = draw(`shapes
shape@a circle A at=2,3
shape@b circle B at=8,3
shape arc from=a to=b
shape arrow from=a to=b bend=-0.2
shape arrow from=a to=b`);
eq("arc bends by default, an arrow bends when told", ring.items.slice(2).map((i) => i.bend), [0.35, -0.2, undefined]);

const c = control([0, 0], [10, 0], 0.25);
eq("a positive bend pushes up when it runs left to right", c, [5, -5]);
const mid = along([0, 0], c, [10, 0], 0.5).tip;
eq("the curve's middle is bend times length from the chord", mid, [5, -2.5]);
eq("a bracket's ticks run to its side", bracketPoints([1, 3], [1, 5], 1, 0.3).pts, [[1.3, 3], [1, 3], [1, 5], [1.3, 5]]);

const mark = draw(`shapes
shape@a circle A at=2,3
shape callout "Look" at=7,1 to=a
shape callout Nothing at=7,5`);
eq("a callout points at a shape by id", [!!mark.items[1].leader, mark.items[1].to], [true, { ref: 0 }]);
eq("a callout with no to= has no leader", !!mark.items[2].leader, false);
const f = frame(mark, Infinity)[1];
eq("the leader ends on the target", f.b.map((v) => Math.round(v * 100) / 100).length, 2);
eq("a leader is not a chain in the words", describe(mark), "A, Look, Nothing");

console.log(bad ? `${bad} of ${n} failed` : `${n} passed`);
process.exit(bad ? 1 : 0);
