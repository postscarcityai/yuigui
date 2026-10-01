// Gouda's last screen on /crew is the guitar tuner (SITE-151, web twin of YUI-252): the Tune up button draws TUNER_YL.
import assert from "node:assert/strict";
import { initialState, apply, parse } from "./yl/yl.mjs";
import { TUNER_YL } from "./crew-first-plans.mjs";

let s = initialState();
for (const op of parse(TUNER_YL)) s = apply(s, op);
const nodes = Object.values(s.screens).flat();
assert.equal(nodes.length, 1, "the tuner is the whole screen");
assert.equal(nodes[0].preset, "tuner", "it is the tuner preset");
assert.equal(nodes[0].stage, undefined, "inline, not behind a pill");
assert.ok(JSON.stringify(nodes[0]).includes("guitar"), "tuned for guitar");
console.log("crew-tuner ok");
