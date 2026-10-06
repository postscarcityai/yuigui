import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { camAt, evalScene, parseScene } from "./scene.mjs";

const src = readFileSync(new URL("../../public/demo/motion/eli5-string.scene", import.meta.url), "utf8");

test("the ELI5 scene parses and every frame is finite", () => {
  const sc = parseScene(src);
  assert.equal(sc.dur, 40);
  for (let t = 0; t <= sc.dur; t += 0.5) {
    const f = evalScene(sc, t);
    for (const v of Object.values(f.cam)) assert.ok(Number.isFinite(v), `cam at ${t}`);
    for (const s of f.shapes) assert.ok(!/NaN|Infinity/.test(s.d), `${s.id} at ${t}`);
  }
});

test("the camera dives to the string and pulls back to the cup", () => {
  const sc = parseScene(src);
  const deep = evalScene(sc, 33).cam.z, home = evalScene(sc, 40).cam.z;
  assert.ok(deep > 50000, `deep ${deep}`);
  assert.ok(Math.abs(home - 1) < 1e-6);
});

test("a typo is an error, not a silent blank", () => {
  assert.throws(() => parseScene('wiggle@a'), /unknown scene line/);
  assert.throws(() => parseScene('shape@a circle of=nope'), /no parent/);
  assert.throws(() => parseScene('shape@a circle\nkey b t=1 op=0'), /no shape b/);
});

test("a morph from loop to string moves the points", () => {
  const sc = parseScene('shape@s circle into=wave r=10 morph=0\nkey s t=0 dur=1 morph=1 ease=linear');
  const a = evalScene(sc, 0).shapes[0].d, b = evalScene(sc, 1).shapes[0].d;
  assert.notEqual(a, b);
  assert.ok(a.endsWith("Z") && !b.endsWith("Z"));
});
