// Shapes drawing kit (YUI-291): closed regions, overlap, contour, bent arrows, bracket, callout.
//   node site/lib/yl/shapes.test.mjs     exit 1 on any failure
import { parse } from "./yl.mjs";
import { HAND, along, bracketPoints, control, describe, frame, handOutline, rough, scene } from "./shapes.mjs";

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

// Hand drawn shapes and marks (YUI-298).
const hand = draw(`shapes w=10 h=6
shape@a box Sketch +hand
shape circle Plain
shape text Words +hand
shape scribble to=a
shape underline to=a
shape check to=a
shape scribble at=5,4 size=2,1 +fill
shape underline to=nowhere
shape check`);
eq("+hand marks closed shapes, not text", hand.items.slice(0, 3).map((i) => !!i.hand), [true, false, false]);
eq("marks are drawn on, in order", hand.items.slice(3).map((i) => [i.kind, i.mark || null, i.motion]), [["scribble", "scribble", "draw"], ["underline", "underline", "draw"], ["check", "check", "draw"], ["scribble", "scribble", "draw"]]);
eq("a mark with no target is dropped", hand.items.length, 7);
eq("marks take no slot in the row", hand.items.slice(0, 2).map((i) => i.at[1]), [3, 3]);
eq("a scribble fill is a fill", hand.items.slice(3).map((i) => i.fill), [false, false, false, true]);
eq("a check is mint unless told", hand.items.slice(3).map((i) => i.tone), ["accent", "accent", "mint", "accent"]);
const w = hand.items[0];
eq("an underline sits under its shape", hand.items[4].pts.every((q) => q[1] > w.at[1] + w.size[1] / 2), true);
eq("a check sits beside its shape", hand.items[5].pts.every((q) => q[0] > w.at[0] + w.size[0] / 2), true);
eq("a mark finishes drawn when still", frame(hand, Infinity).slice(3).map((f) => f.d), [1, 1, 1, 1]);
eq("a mark is mid-draw partway", frame(hand, hand.items[3].start + 0.1)[3].d > 0 && frame(hand, hand.items[3].start + 0.1)[3].d < 1, true);
eq("the same drawing gives the same wobble", JSON.stringify(draw(`shapes\nshape@a box A\nshape scribble to=a`).items[1].pts) === JSON.stringify(draw(`shapes\nshape@a box A\nshape scribble to=a`).items[1].pts), true);
const line0 = [[0, 0], [4, 0]];
const rl = rough(line0, 3, 0.14);
eq("rough keeps the ends close and the wobble within bounds", [Math.abs(rl[0][1]) <= 0.14, rl.every((q) => Math.abs(q[1]) <= 0.14 + 1e-9), rl.length > 4], [true, true, true]);
eq("rough is deterministic and seed dependent", [JSON.stringify(rough(line0, 3, 0.14)) === JSON.stringify(rl), JSON.stringify(rough(line0, 4, 0.14)) === JSON.stringify(rl)], [true, false]);
eq("a hand box is a closed outline", handOutline("box", [3, 2], 1, 0.14).closed, true);
eq("hand wobble is under 1% of the width", HAND < 0.01, true);
eq("marks are not read as words", describe(hand), "Sketch, Plain, Words");

console.log(bad ? `${bad} of ${n} failed` : `${n} passed`);
process.exit(bad ? 1 : 0);
