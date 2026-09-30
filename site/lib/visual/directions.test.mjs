// The shader look, round 2 (spec/SHADER.md): four directions, one uniform set.
//   node site/lib/visual/directions.test.mjs     exit 1 on any failure
import { DIRECTIONS, DIRECTION_IDS } from "./directions.mjs";
import { ACTIONS } from "./action.mjs";

let bad = 0, n = 0;
const ok = (name, cond) => { n++; if (!cond) { bad++; console.log(`FAIL ${name}`); } };
const UNIFORMS = ["u_res", "u_time", "u_since", "u_think", "u_read", "u_run", "u_search", "u_done", "u_size", "u_wobble", "u_grain", "u_glow", "u_voice", "u_dim", "u_a", "u_b", "u_c", "u_ground"];

ok("four directions", DIRECTION_IDS.join() === "currents,terrain,dots,type");
for (const id of DIRECTION_IDS) {
  const d = DIRECTIONS[id];
  ok(`${id}: says every state`, ACTIONS.every((a) => typeof d.states[a] === "string" && d.states[a].length > 8));
  ok(`${id}: names its phone cost`, !!d.cost);
  ok(`${id}: names what the voice drives`, !!d.voice);
  ok(`${id}: one main`, (d.fragment.match(/void main\(\)/g) || []).length === 1);
  // the voice uniform is in the math, not only declared
  ok(`${id}: u_voice moves something`, (d.fragment.match(/u_voice/g) || []).length >= 2);
  for (const u of ["u_think", "u_read", "u_run", "u_search", "u_done"]) ok(`${id}: ${u} is used`, (d.fragment.match(new RegExp(u, "g")) || []).length >= 2);
  ok(`${id}: declares the shared uniforms`, UNIFORMS.every((u) => d.fragment.includes(u)));
  ok(`${id}: WebGL 1 only`, !/#version|texture\(|\bin vec|\bout vec/.test(d.fragment));
  ok(`${id}: no blob`, !/\bbody\b|halo/.test(d.fragment));
}

console.log(`${n - bad}/${n} direction checks pass`);
process.exit(bad ? 1 : 0);
