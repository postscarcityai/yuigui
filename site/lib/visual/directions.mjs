// The shader look, round 2 (spec/SHADER.md, t_b8ab6ac3): four directions
// that are not a blob. Chris, Sep 29: "They're still kind of blobby, and I
// think we can get more interesting." Each direction is one WebGL 1 fragment
// shader for every agent and every state, same uniforms as the round 1 blob
// (actionshader.mjs), so the picker, the eased weights and the agent rows
// carry over. The one he picks becomes the Metal port.
//
// Uniforms (every direction):
//   u_res u_time            canvas pixels, seconds (already scaled by pace)
//   u_a u_b u_c u_ground    the agent's three colors and the stage ground
//   u_think u_read u_run u_search u_done   state weights, 0..1, sum with idle to 1
//   u_since                 seconds since the state changed (done's wave)
//   u_size u_wobble u_grain u_glow          the agent's knobs (scale, warp, grain, line strength)
//   u_voice                 0..1, audio reactive later (the mock leaves it at 0)
//   u_dim                   1 alone, less behind words

export { VERTEX, vec3 } from "./shaders.mjs";
export { ACTION_FRAGMENT } from "./actionshader.mjs";

const HEAD = `precision highp float;
uniform vec2 u_res;
uniform float u_time, u_since, u_think, u_read, u_run, u_search, u_done;
uniform float u_size, u_wobble, u_grain, u_glow, u_voice, u_dim;
uniform vec3 u_a, u_b, u_c, u_ground;
float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float noise(vec2 p) {
  vec2 i = floor(p), f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x), mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);
}
float fbm(vec2 p) {
  float v = 0.0, a = 0.5;
  for (int i = 0; i < 4; i++) { v += a * noise(p); p *= 2.02; a *= 0.5; }
  return v;
}
vec2 rot(vec2 p, float a) { float c = cos(a), s = sin(a); return vec2(c * p.x - s * p.y, s * p.x + c * p.y); }
// Where the search is looking: it wanders the whole stage.
vec2 seek() { float t = u_time * 0.55; return vec2(0.36 * sin(t), 0.24 * sin(t * 1.63 + 0.7)); }
// Reading's place on the page: the line it is on (0 at the top) and how far along it.
vec2 page(float lines) { float pr = u_time * 0.8; return vec2(mod(floor(pr), lines), fract(pr)); }
// Done: one wave out from the middle, then it settles.
float wave(float r) { float d = r - u_since * 0.45; return exp(-d * d / 0.008) * exp(-u_since * 0.9) * u_done; }
// One line of text on a page: row y (cells), column x; ragged ends and word gaps.
float textCell(vec2 id, float cols) {
  float len = floor(cols * (0.45 + 0.5 * hash(vec2(id.y, 3.1))));
  float word = floor((id.x + hash(vec2(id.y, 7.7)) * 4.0) / 4.0);
  float gap = step(0.8, hash(vec2(word, id.y)));
  return step(0.0, id.x) * step(id.x, len - 1.0) * (1.0 - gap);
}
`;

const TAIL = `
  col += (hash(floor(gl_FragCoord.xy) + fract(u_time * 7.0) * 97.0) - 0.5) * u_grain * m;
  gl_FragColor = vec4(mix(u_ground, col, clamp(m, 0.0, 1.0) * u_dim), 1.0);
}`;

// 1. Currents: hairlines along a curl-noise flow (the isolines of a stream
// function are the flow's own lines). Cost: 3 fbm (12 value noises) a pixel.
const CURRENTS = `${HEAD}
float field(vec2 p) {
  vec2 f = seek(), d = p - f;
  float lens = exp(-dot(d, d) / 0.02) * u_search;
  vec2 q = f + d * (1.0 - 0.6 * lens);
  float r = length(q);
  q = rot(q, u_think * 1.6 * exp(-r * 3.0) * (0.6 + 0.4 * sin(u_time * 0.7)));
  float t = u_time * (0.05 + 0.1 * u_think);
  float n = fbm(q * 1.5 * u_size + vec2(t, -t * 0.6)) - 0.5;
  float psi = q.y * (0.9 - 0.5 * u_think) + n * (0.45 * u_wobble + 0.3 * u_voice) * (1.0 - 0.9 * u_read - 0.5 * u_run);
  return psi + u_think * 0.5 * r;
}
void main() {
  vec2 p = (gl_FragCoord.xy - 0.5 * u_res) / u_res.y;
  float e = 2.0 / u_res.y;
  float v = field(p);
  vec2 g = (vec2(field(p + vec2(e, 0.0)), field(p + vec2(0.0, e))) - v) / e;
  float N = 26.0;
  float dist = abs(fract(v * N + 0.5) - 0.5) / max(N * length(g), 0.001);
  float px = 1.2 / u_res.y;
  float w = (0.0016 + 0.0012 * u_voice) * u_glow;
  float L = 1.0 - smoothstep(w, w + px, dist);
  float idx = floor(v * N + 0.5);
  float bright = 0.5 + 0.2 * sin(idx * 1.7 + u_time * 0.8);
  // reading: the page fills in, line by line, left to right
  vec2 pg = page(10.0);
  float rowY = 0.4 - pg.x * 0.088;
  float done_ = step(rowY + 0.03, p.y);
  float cur = (1.0 - smoothstep(0.02, 0.04, abs(p.y - rowY))) * step(p.x, mix(-0.55, 0.55, pg.y));
  bright = mix(bright, 0.14 + 0.75 * max(done_, cur) + 0.6 * cur, u_read);
  // running: packets race along every line on a beat
  float lane = fract(p.x * 2.0 - u_time * (1.2 + hash(vec2(idx, 2.9))) + hash(vec2(idx, 1.3)) * 3.0);
  float pack = smoothstep(0.0, 0.03, lane) * (1.0 - smoothstep(0.12, 0.25, lane));
  bright = mix(bright, 0.2, 0.6 * u_run);
  bright += u_run * (1.5 * pack + 0.15 * pow(0.5 + 0.5 * sin(u_time * 5.6), 4.0) - 0.1);
  // searching: a lens that magnifies where it looks
  float lr = length(p - seek());
  bright += u_search * (0.9 * exp(-lr * lr / 0.012) + 1.2 * exp(-pow((lr - 0.12) / 0.004, 2.0)) - 0.12);
  bright += 1.4 * wave(length(p)) + 0.3 * u_voice;
  vec3 col = mix(u_a, u_b, 0.5 + 0.5 * sin(idx * 0.9));
  col = mix(col, u_c, 0.35 * noise(p * 3.0 + idx));
  float m = L * clamp(bright, 0.0, 1.4) + 0.05 * u_read * cur;
  float ring = u_search * exp(-pow((lr - 0.12) / 0.004, 2.0));
  m = max(m, ring * 0.9);
${TAIL}`;

// 2. Terrain: a topographic map, filled terraces and contour lines, every
// fourth one heavier. Cost: 3 terrain samples (9 fbm) a pixel; the dearest.
const TERRAIN = `${HEAD}
float terr(vec2 p) {
  vec2 q = p * 1.3 * u_size;
  float t = u_time * (0.03 + 0.16 * u_think);
  vec2 w = vec2(fbm(q * 1.2 + vec2(t, 0.0)), fbm(q * 1.2 + vec2(5.2, -t))) - 0.5;
  float h = fbm(q + (0.3 + 0.8 * u_think) * u_wobble * w + vec2(0.0, t * 0.4));
  h += u_voice * 0.12 * sin(length(p) * 10.0);
  h = mix(h, p.y * 0.95 - u_time * 0.07 + 0.1 * h, 0.88 * u_read);
  float r = length(p);
  h = mix(h, r * 1.2 - u_time * 0.3 + 0.08 * h, 0.85 * u_run);
  vec2 d = p - seek();
  h += u_search * 0.32 * exp(-dot(d, d) / 0.018);
  return mix(h, 0.5 + (h - 0.5) * 0.35, u_done * (1.0 - exp(-u_since * 2.0)));
}
void main() {
  vec2 p = (gl_FragCoord.xy - 0.5 * u_res) / u_res.y;
  float e = 2.0 / u_res.y;
  float h = terr(p);
  vec2 g = (vec2(terr(p + vec2(e, 0.0)), terr(p + vec2(0.0, e))) - h) / e;
  float N = 11.0;
  float lv = floor(h * N);
  float dist = abs(fract(h * N + 0.5) - 0.5) / max(N * length(g), 0.001);
  float idx = floor(h * N + 0.5);
  float major = 1.0 - step(0.5, mod(idx, 4.0));
  float px = 1.2 / u_res.y;
  float w = (0.0014 + 0.0016 * major) * u_glow;
  float L = 1.0 - smoothstep(w, w + px, dist);
  float fill = 0.06 + 0.09 * fract(lv * 0.25 + 0.1);
  float bright = 0.55 + 0.35 * major;
  // reading: strata scroll up like a page; the line at eye level lights
  bright += u_read * (1.2 * (1.0 - smoothstep(0.0, 0.05, abs(p.y + 0.02))) - 0.1);
  // running: rings leave the middle, each flashes as it goes
  bright += u_run * 0.5 * pow(0.5 + 0.5 * sin(idx * 2.1 + u_time * 6.0), 3.0);
  // searching: the peak it climbs is lit
  float lr = length(p - seek());
  bright += u_search * (1.0 * exp(-lr * lr / 0.02) - 0.15);
  fill += u_search * 0.15 * exp(-lr * lr / 0.02);
  bright += 1.5 * wave(length(p)) + 0.3 * u_voice;
  vec3 col = mix(u_c, u_a, clamp(h * 1.2 - 0.1, 0.0, 1.0));
  col = mix(col, u_b, 0.5 * major);
  float m = max(L * clamp(bright, 0.0, 1.5), fill);
${TAIL}`;

// 3. Dots: a halftone screen. Each dot's size is the field under it.
// Cost: 1 fbm a pixel; cheap.
const DOTS = `${HEAD}
float dotMask(vec2 g, float v, float px) {
  vec2 f = fract(g) - 0.5;
  float r = 0.5 * sqrt(clamp(v, 0.0, 1.0));
  return 1.0 - smoothstep(r - px, r, length(f));
}
void main() {
  vec2 p = (gl_FragCoord.xy - 0.5 * u_res) / u_res.y;
  float cells = 30.0 / u_size;
  float px = 1.5 * cells / u_res.y;
  vec2 g = p * cells;
  vec2 id = floor(g);
  vec2 c = (id + 0.5) / cells;
  float cols = floor(0.5 * u_res.x / u_res.y * cells);
  // idle and thinking: a drifting field; thinking swirls it and sends waves through
  float t = u_time * 0.06;
  float v = fbm(rot(c, u_think * 0.6 * sin(u_time * 0.5)) * 2.4 * u_wobble + vec2(t, -t * 0.7));
  v = smoothstep(0.38, 0.8, v) * 0.55 + 0.04;
  v += u_think * 0.35 * pow(0.5 + 0.5 * sin(length(c) * 16.0 - u_time * 3.0), 3.0);
  v += 0.3 * u_voice;
  float m = dotMask(g, v, px);
  float tone = v;
  // reading: a page of text; the dots it has read are lit, row by row
  vec2 tid = vec2(id.x + cols - 2.0, floor(cells * 0.36) - id.y);
  float row = mod(tid.y, 2.0) < 0.5 ? tid.y * 0.5 : -1.0;
  float text = row >= 0.0 && row < 12.0 ? textCell(vec2(tid.x, row), 2.0 * cols - 4.0) : 0.0;
  vec2 pg = page(12.0);
  float lit = step(row, pg.x - 1.0) + step(abs(row - pg.x), 0.1) * step(tid.x, pg.y * (2.0 * cols - 4.0));
  float rv = text * (0.28 + 0.62 * clamp(lit, 0.0, 1.0));
  m = mix(m, dotMask(g, rv, px), u_read);
  tone = mix(tone, rv + 0.3 * lit, u_read);
  // running: output scrolls up fast, one row at a time
  vec2 sg = vec2(g.x, g.y - u_time * 7.0);
  vec2 sid = floor(sg);
  float out_ = textCell(vec2(sid.x + cols - 2.0, sid.y), 2.0 * cols - 4.0) * (0.35 + 0.5 * step(0.7, hash(vec2(sid.y, 9.0))));
  out_ *= smoothstep(-0.5, 0.2, -c.y + 0.1) * 0.4 + 0.6;
  m = mix(m, dotMask(sg, out_, px), u_run);
  tone = mix(tone, out_, u_run);
  // searching: a spotlight sweeps; the dots under it swell
  float lr = length(c - seek());
  float spot = exp(-lr * lr / 0.012);
  float sv = v * 0.3 + 1.1 * exp(-lr * lr / 0.02);
  m = mix(m, dotMask(g, sv, px), u_search);
  tone = mix(tone, sv, u_search);
  // done: a bloom from the middle
  float bl = wave(length(c)) * 1.2;
  m = max(m, dotMask(g, bl, px));
  tone += bl;
  vec3 col = mix(u_c, u_a, clamp(tone * 1.4, 0.0, 1.0));
  col = mix(col, u_b, clamp(tone * 1.6 - 1.0, 0.0, 1.0));
  m *= 0.6 + 0.4 * u_glow;
${TAIL}`;

// 4. Type: a field of small made-up glyphs, like text seen from far away.
// Cost: hashes only, no noise but one fbm; the cheapest.
const TYPE = `${HEAD}
float glyph(vec2 f, float gid) {
  // 5 x 7 bits, mirrored left to right so they read as letters
  vec2 s = floor(f * vec2(7.0, 9.0)) - 1.0;
  if (s.x < 0.0 || s.x > 4.0 || s.y < 0.0 || s.y > 6.0) return 0.0;
  float mx = min(s.x, 4.0 - s.x);
  return step(0.52, hash(vec2(mx, s.y) + gid * vec2(7.13, 3.71)));
}
void main() {
  vec2 p = (gl_FragCoord.xy - 0.5 * u_res) / u_res.y;
  float rows = 19.0 / u_size;
  vec2 csz = vec2(0.72, 1.0) / rows;
  vec2 g = p / csz;
  vec2 id = floor(g);
  vec2 f = fract(g);
  vec2 c = (id + 0.5) * csz;
  float cols = floor(0.5 * u_res.x / u_res.y / csz.x);
  // how often glyphs change: rare at rest, fast when thinking, still when done
  float rate = 0.25 + 5.0 * u_think + 8.0 * u_search + 2.0 * u_voice;
  rate *= 1.0 - u_done * (1.0 - exp(-u_since * 1.5));
  float gid = floor(hash(id) * 50.0 + u_time * rate * (0.5 + hash(id + 3.0)));
  // idle and thinking: a sparse drifting cloud of letters
  float cloud = fbm(c * 2.2 * u_wobble + vec2(u_time * 0.05, 0.0));
  float show = step(0.5 - 0.12 * u_think, cloud + 0.2 * hash(id + 11.0));
  float bright = 0.45 + 0.5 * u_think * smoothstep(0.5, 0.75, cloud);
  // reading: lines of text; what is read is lit
  vec2 tid = vec2(id.x + cols - 1.0, floor(rows * 0.36) - id.y);
  float row = mod(tid.y, 2.0) < 0.5 ? tid.y * 0.5 : -1.0;
  float text = row >= 0.0 && row < 12.0 ? textCell(vec2(tid.x, row), 2.0 * cols - 2.0) : 0.0;
  vec2 pg = page(12.0);
  float lit = clamp(step(row, pg.x - 1.0) + step(abs(row - pg.x), 0.1) * step(tid.x, pg.y * (2.0 * cols - 2.0)), 0.0, 1.0);
  float caret = step(abs(row - pg.x), 0.1) * step(abs(tid.x - floor(pg.y * (2.0 * cols - 2.0))), 0.1);
  show = mix(show, text, u_read);
  bright = mix(bright, 0.1 + 0.8 * lit + 0.6 * caret, u_read);
  // running: output prints and scrolls up fast
  vec2 sg = vec2(g.x, g.y - u_time * 6.0);
  vec2 sid = floor(sg);
  float outRow = textCell(vec2(sid.x + cols - 1.0, sid.y), 2.0 * cols - 2.0);
  float runGlyph = glyph(fract(sg), floor(hash(sid) * 50.0));
  // searching: everything scrambles but a lens, where one letter holds still and glows
  float lr = length(c - seek());
  float lens = 1.0 - smoothstep(0.09, 0.11, lr);
  float gidS = mix(gid, 7.0, lens * u_search);
  show = mix(show, mix(0.35, 1.0, lens), u_search);
  bright = mix(bright, 0.18 + 0.9 * lens, u_search);
  float gl = glyph(f, floor(gidS)) * show;
  gl = mix(gl, runGlyph * outRow, u_run);
  bright = mix(bright, 0.35 + 0.5 * step(0.75, hash(vec2(sid.y, 2.0))), u_run);
  // done: every letter shows for a moment in one wave
  float wv = wave(length(c));
  gl = max(gl, glyph(f, floor(gid)) * wv * 1.5);
  bright += 1.4 * wv + 0.3 * u_voice;
  vec3 col = mix(u_c, u_a, clamp(bright, 0.0, 1.0));
  col = mix(col, u_b, clamp(bright * 1.4 - 0.9, 0.0, 1.0));
  float m = gl * clamp(bright + 0.15, 0.0, 1.3) * (0.7 + 0.3 * u_glow);
${TAIL}`;

// The four directions, in the order the picker shows them. `cost` is what a
// phone pays per pixel at the stage's 0.6 scale; `voice` is what u_voice would
// move once agents speak.
export const DIRECTIONS = {
  currents: {
    name: "Currents",
    idea: "Hairlines along a slow current, like wind on a map.",
    states: {
      idle: "The lines drift.",
      thinking: "The current curls into an eddy in the middle.",
      reading: "The lines lie flat like a page and light up line by line, left to right.",
      running: "Bright packets race along every line on a beat.",
      searching: "A lens drifts over the lines and magnifies where it looks.",
      done: "One bright wave, then the lines go calm.",
    },
    cost: "3 fbm a pixel (12 noise). Mid.",
    voice: "line width, the current's strength, brightness",
    fragment: CURRENTS,
  },
  terrain: {
    name: "Terrain",
    idea: "A topographic map, filled terraces with contour lines.",
    states: {
      idle: "The land shifts very slowly.",
      thinking: "The land folds and heaves.",
      reading: "The contours turn into strata and scroll up like a page; the line at eye level lights.",
      running: "Rings leave the middle one after another, each flashing as it goes.",
      searching: "A peak rises and roams; the contours crowd around it.",
      done: "One wave, and the land flattens out.",
    },
    cost: "9 fbm a pixel. The dearest; fine at 0.6 scale, the first to drop to 30 fps.",
    voice: "the land's height, rings from the middle",
    fragment: TERRAIN,
  },
  dots: {
    name: "Dots",
    idea: "A halftone screen, every dot sized by what is under it.",
    states: {
      idle: "Soft patches of dots drift.",
      thinking: "The patches swirl and waves roll out through the dots.",
      reading: "The dots form a page of text; the read part lights up, row by row.",
      running: "Rows of output print and scroll up fast.",
      searching: "A spotlight sweeps and the dots under it swell.",
      done: "The dots bloom out from the middle, then settle.",
    },
    cost: "1 fbm a pixel. Cheap.",
    voice: "every dot's size",
    fragment: DOTS,
  },
  type: {
    name: "Type",
    idea: "A field of tiny made-up letters, like text seen from far away.",
    states: {
      idle: "A few letters drift and change now and then.",
      thinking: "A cloud of letters flickers through ideas.",
      reading: "Letters sit in lines; a caret reads through them and lights what it has read.",
      running: "Output prints and scrolls up fast.",
      searching: "Everything scrambles except a lens, where one letter holds still and glows.",
      done: "Every letter shows at once in one wave, then they stop changing.",
    },
    cost: "1 fbm and a few hashes a pixel, drawn at a sharper scale so the letters stay crisp. Cheap.",
    voice: "how fast the letters change, their brightness",
    fragment: TYPE,
  },
};

export const DIRECTION_IDS = Object.keys(DIRECTIONS);
