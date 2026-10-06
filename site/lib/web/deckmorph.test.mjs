// YUI-307: the deck morph's matcher and tween (the twin of YuiTests/DeckMorphTests).
//   node site/lib/web/deckmorph.test.mjs     exit 1 on any failure
import { parse } from "../yl/yl.mjs";
import { answerOf } from "../chat/stage.mjs";
import { alive, camera, deckOf, drawing, match, page, retype, scrubTo, settle, tween, turnFor } from "./deckmorph.mjs";

let bad = 0, n = 0;
const eq = (name, got, want) => {
  n++;
  if (JSON.stringify(got) !== JSON.stringify(want)) { bad++; console.log(`FAIL ${name}\n  got  ${JSON.stringify(got)}\n  want ${JSON.stringify(want)}`); }
};
const ok = (name, cond) => eq(name, !!cond, true);
const near = (name, got, want, tol = 1e-6) => ok(`${name} (${got} ~ ${want})`, Math.abs(got - want) <= tol);

const draw = (src) => {
  const ops = parse(src).filter((o) => o.op === "add");
  return page(ops[0].props, ops.slice(1).map((o) => ({ id: o.id, props: o.props })));
};
const W = 360, H = 400;

// ---- matching ----
const one = draw(`shapes
shape@sun circle Sun
shape box Earth
shape arrow
shape text hello`);
const two = draw(`shapes
shape box Moon
shape@sun circle Star
shape arrow
shape text hi`);
const glyph = (pg, label) => pg.glyphs.findIndex((g) => g.label === label);
eq("the page keeps explicit ids only", one.glyphs.map((g) => g.key), ["sun", null, null, null]);
const pairs = match(one.glyphs, two.glyphs).filter((p) => p.a != null && p.b != null);
ok("an @id pairs first, whatever the label", pairs.some((p) => p.a === glyph(one, "Sun") && p.b === glyph(two, "Star")));
const byLabel = match(draw(`shapes
shape circle Earth
shape box Mars`).glyphs, draw(`shapes
shape box Mars
shape circle Earth`).glyphs);
eq("the same label pairs across pages, in any order", byLabel.map((p) => [p.a, p.b]), [[1, 0], [0, 1]]);
const fam = match(draw(`shapes
shape circle
shape arrow from=1,1 to=3,1
shape circle`).glyphs, draw(`shapes
shape arrow from=1,1 to=3,1
shape circle
shape circle`).glyphs);
eq("unlabelled glyphs of one family pair in line order", fam.map((p) => [p.a, p.b]), [[1, 0], [0, 1], [2, 2]]);
const rest = match(draw(`shapes
shape circle A
shape circle B`).glyphs, draw(`shapes
shape circle A
shape circle C`).glyphs);
eq("leaving glyphs come first, arriving glyphs last", rest.map((p) => [p.a, p.b]), [[1, null], [0, 0], [null, 1]]);
const named = match(draw(`shapes
shape@x circle Same
shape circle Same`).glyphs, draw(`shapes
shape@x circle Other
shape circle Same`).glyphs);
eq("a named glyph never takes a label that another page-a glyph owns", named.map((p) => [p.a, p.b]).sort(), [[0, 0], [1, 1]]);

// ---- the tween ----
const a = draw(`shapes
shape@dot circle Start at=2,3 size=2
shape@gone box Old at=7,3 size=2`);
const b = draw(`shapes
shape@dot circle Finish at=8,3 size=3 tone=mint
shape pill New at=3,5 size=3`);
const at0 = tween(a, b, 0, W, H), at5 = tween(a, b, 0.5, W, H), at1 = tween(a, b, 1, W, H);
const find = (inks, key) => inks.find((i) => i.key === key);
const cx = (i) => i.center[0];
near("t=0 draws page a: the shared shape sits where a put it", cx(find(at0, "@dot")), camera(a, W, H).s * a.glyphs[0].center[0] + camera(a, W, H).o[0], 1e-6);
near("t=1 draws page b: the shared shape sits where b put it", cx(find(at1, "@dot")), camera(b, W, H).s * b.glyphs[0].center[0] + camera(b, W, H).o[0], 1e-6);
const x0 = cx(find(at0, "@dot")), x1 = cx(find(at1, "@dot"));
near("t=0.5 is halfway through the eased move", cx(find(at5, "@dot")) > Math.min(x0, x1) && cx(find(at5, "@dot")) < Math.max(x0, x1) ? 1 : 0, 1);
eq("the shared shape recolours, accent to mint", [find(at5, "@dot").toneA, find(at5, "@dot").toneB, find(at0, "@dot").mix, find(at1, "@dot").mix], ["accent", "mint", 0, 1]);
eq("the label retypes: Start at 0, Finish at 1", [find(at0, "@dot").label, find(at1, "@dot").label], ["Start", "Finish"]);
ok("a leaving shape is whole at t=0 and gone by t=1", find(at0, "@gone").opacity === 1 && find(at1, "@gone").opacity === 0);
ok("an arriving shape is invisible at t=0 and drawn on by t=1", at0.find((i) => i.label === "" && i.key.startsWith("b")).opacity === 0
  && at1.find((i) => i.key.startsWith("b")).trim === 1 && at1.find((i) => i.key.startsWith("b")).label === "New");
ok("halfway the arriving outline is part drawn", at5.find((i) => i.key.startsWith("b")).trim > 0 && at5.find((i) => i.key.startsWith("b")).trim < 1);
eq("the outline always has the same point count, so it morphs", [find(at0, "@dot").pts.length, find(at5, "@dot").pts.length, find(at1, "@dot").pts.length], [72, 72, 72]);
eq("an id is one key on both sides of a turn", [!!find(at0, "@dot"), !!find(at1, "@dot")], [true, true]);

// Reduce Motion: a cross-fade, no shape moves.
const still0 = tween(a, b, 0.25, W, H, true), still1 = tween(a, b, 0.75, W, H, true);
ok("still: page a fades out while b fades in, shapes stay where each page put them", still0.every((i) => i.mix === 0) && still0.some((i) => i.opacity > 0.7) && still1.some((i) => i.opacity > 0.7));
eq("still: nothing at t=0 but page a", tween(a, b, 0, W, H, true).every((i) => i.opacity === 1), true);

// A page with nothing to draw (null) dissolves or draws on.
ok("a page with no shapes: a leaves and nothing arrives", tween(a, null, 1, W, H).every((i) => i.opacity === 0));
eq("both pages empty: nothing", tween(null, null, 0.5, W, H), []);
eq("a contour page is a cross-fade page (null)", draw(`shapes\nshape contour`), null);

// retype
eq("retype backs out then types in", [retype("Start", "Finish", 0), retype("Start", "Finish", 0.25).text, retype("Start", "Finish", 0.5), retype("Start", "Finish", 1).text], [{ text: "Start", opacity: 1 }, "Sta", { text: "", opacity: 0 }, "Finish"]);

// alive keeps the drawing near where it was
const rest0 = tween(null, a, 1, W, H);
const breathing = alive(rest0, 3.3, 2.2);
ok("at rest the drawing breathes, a few px at most", breathing.every((i, k) => i.pts.every((p, j) => Math.hypot(p[0] - rest0[k].pts[j][0], p[1] - rest0[k].pts[j][1]) < 12)) && breathing.some((i, k) => i.pts[0][0] !== rest0[k].pts[0][0]));

// ---- the scrub and the taps ----
eq("a drag of half the width scrubs half a page", scrubTo(1, -180, 360, 4), 1.5);
eq("the scrub stays inside the deck", [scrubTo(0, 400, 360, 4), scrubTo(3, -400, 360, 4)], [0, 3]);
eq("a release settles on the nearest page", [settle(1.4, 0, 360, 4), settle(1.6, 0, 360, 4)], [1, 2]);
eq("a flick carries it one more", settle(1.3, -900, 360, 4), 2);
eq("a tap in the left third goes back, the rest goes on, ends stay", [turnFor(10, 0, 390, 2, 4), turnFor(380, 0, 390, 2, 4), turnFor(10, 0, 390, 0, 4), turnFor(380, 0, 390, 3, 4)], [1, 3, null, null]);

// drawing(): at rest and in transit
const pages = [{ page: a }, { page: b }, { page: null }];
eq("at rest on page 2 the shared shape keeps its key", drawing(pages, 1, W, H).some((i) => i.key === "@dot"), true);
eq("a page without shapes draws nothing at rest", drawing(pages, 2, W, H), []);
eq("a size of nothing draws nothing", drawing(pages, 0, 0, 0), []);

// ---- a reply as a deck ----
const reply = answerOf([{ yl: `deck "Orbits"
page "Sun and Earth"
shapes
shape@sun circle Sun
shape@earth circle Earth
page "Moon"
shapes
shape@earth circle Earth
shape circle Moon` }]);
const deck = deckOf(reply);
eq("a lone deck of shapes pages is a morph deck", deck && deck.map((p) => [p.title, !!p.page]), [["Sun and Earth", true], ["Moon", true]]);
eq("the same @id sits on both pages", deck.map((p) => p.page.glyphs.some((g) => g.key === "earth")), [true, true]);
eq("a reply with a quiz question keeps the stage player", deckOf(answerOf([{ yl: `deck "Q"\npage "A"\nshapes\nshape circle A\nchoose "Which?" a|b` }])), null);
eq("a lone page is not a deck", deckOf(answerOf([{ yl: `page "Hi"\nshapes\nshape circle A` }])), null);
eq("plain words are not a deck", deckOf(answerOf([{ text: "Hello there." }])), null);

console.log(`${n - bad} passed, ${bad} failed`);
process.exit(bad ? 1 : 0);
