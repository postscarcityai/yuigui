// SITE-101: every crew card on /crew draws the look its member ships with (CREW_VISUALS, YUI-180),
// quiet: dimmed under full strength, slow or even pace, never a mic prompt.
import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
// crew-page.mjs imports a JSON file bare node cannot load, so the looks are read from its source.
const src = readFileSync(new URL("./crew-page.mjs", import.meta.url), "utf8");
const MEMBERS = [...src.matchAll(/handle: "(\w+)"[^\n]*?look: "(\w+)"/g)].map(([, handle, look]) => ({ handle, look }));
import { CREW_VISUALS, stageVisual, visualPlan } from "./yl/visual.mjs";

test("each /crew member's look is their default visual", () => {
  assert.equal(MEMBERS.length, 6);
  for (const m of MEMBERS) assert.equal(CREW_VISUALS[m.handle]?.look, m.look, m.handle);
});

test("the crew's default plan is quiet, dim and idles", () => {
  for (const m of MEMBERS) {
    for (const dark of [true, false]) {
      const p = visualPlan(stageVisual(CREW_VISUALS[m.handle]), { dark });
      assert.ok(p.quiet && p.dim < 1 && p.dim > 0, m.handle);
      assert.ok(p.idleFps <= 15 && p.speed <= 1, m.handle);
    }
    assert.equal(visualPlan(stageVisual(CREW_VISUALS[m.handle]), { reduced: true }).still, true);
  }
});
