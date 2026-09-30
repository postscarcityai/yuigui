// The shader blob (spec/SHADER.md, YUI-232 round 3): one blob in the middle,
// drawn by the shader behind the stage, and its SHAPE says what the agent is
// doing. Chris, Sep 30: "a perfect circle, a football, and so on, one shape per
// action". WebGL 1, the same math as the app's Metal port (Visual.metal
// visualOrb). One fragment shader for every agent and every state.
//
// Each state is a shape, written as a distance to its edge (below 0 inside).
// The shapes blend by the eased weights, so the blob morphs from one to the
// next and never snaps:
//   idle       a perfect circle that breathes
//   thinking   a cloud of five puffs, turning slowly
//   reading    a football lying on its side; a band of light reads across it
//   running    a rounded square that turns a quarter on every beat
//   searching  a drop whose point sweeps round, the blob leaning after it
//   talking    a tall pill that stretches with the voice
//   done       the circle again, one pop and one ring
//
// Uniforms:
//   u_res u_time            canvas pixels, seconds (already scaled by pace)
//   u_a u_b u_c u_ground    the agent's three colors and the stage ground
//   u_think u_read u_run u_search u_talk u_done   state weights, 0..1, sum with idle to 1
//   u_since                 seconds since the state changed (the done ring)
//   u_size u_wobble u_grain u_glow          the agent's knobs
//   u_voice                 0..1, the voice after a smooth follower (talking swells with it)
//   u_dim                   1 alone, less behind words

export { VERTEX, vec3 } from "./shaders.mjs";

export const ACTION_FRAGMENT = `precision mediump float;
uniform vec2 u_res;
uniform float u_time, u_since, u_think, u_read, u_run, u_search, u_talk, u_done;
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
// A lens on its side: half as long as l, half as wide as w (w < l).
float football(vec2 p, float l, float w) {
  float r = 0.5 * (l * l / w + w), d = r - w;
  p = abs(p.yx);
  float b = sqrt(r * r - d * d);
  return ((p.y - b) * d > p.x * b) ? length(p - vec2(0.0, b)) : length(p - vec2(-d, 0.0)) - r;
}
float roundBox(vec2 p, float h, float k) {
  vec2 q = abs(p) - vec2(h - k);
  return length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - k;
}
void main() {
  vec2 p = (gl_FragCoord.xy - 0.5 * u_res) / u_res.y - vec2(0.0, 0.04);
  float t = u_time;
  float idle = clamp(1.0 - u_think - u_read - u_run - u_search - u_talk - u_done, 0.0, 1.0);
  float R = 0.19 * u_size * (1.0 + 0.1 * u_voice);

  // Searching leans the whole blob toward where its point looks.
  float look = t * 1.3 + 0.6 * sin(t * 0.65);
  vec2 q = p - vec2(cos(look), sin(look)) * 0.03 * u_search;
  float a = atan(q.y, q.x), r = length(q);

  // The shapes.
  float dIdle = r - R * (1.0 + 0.025 * sin(t * 1.3));
  float dThink = r - R * (0.9 + 0.17 * abs(sin(2.5 * (a - t * 0.35))));
  float dRead = football(rot(q, -0.18 + 0.08 * sin(t * 0.7)), 1.42 * R, 0.72 * R);
  float beat = t * 0.85;
  float turn = (floor(beat) + smoothstep(0.0, 0.3, fract(beat))) * 1.5707963;
  float squeeze = 1.0 - 0.06 * exp(-fract(beat) * 7.0);
  float dRun = roundBox(rot(q, turn) / squeeze, 0.86 * R, 0.3 * R) * squeeze;
  float dSearch = r - R * (0.84 + 0.72 * pow(max(cos(a - look), 0.0), 12.0));
  float dTalk = length(q / vec2(0.78 - 0.06 * u_voice, 1.16 + 0.22 * u_voice)) - R;
  dTalk -= 0.012 * u_voice * sin(a * 6.0 + t * 5.0);
  float pop = 1.0 + 0.14 * exp(-u_since * 4.0) * cos(u_since * 13.0);
  float dDone = r - R * pop;
  float d = idle * dIdle + u_think * dThink + u_read * dRead + u_run * dRun + u_search * dSearch + u_talk * dTalk + u_done * dDone;

  // A soft living edge, kept small so the shape still reads.
  // The circle (idle, done) stays perfect; the working shapes live a little more.
  float wob = (0.002 + 0.008 * (1.0 - idle - u_done) + 0.01 * u_think + 0.01 * u_voice) * u_wobble;
  d -= wob * (noise(vec2(a * 1.6, 0.0) + vec2(t * 0.45, 3.0 - t * 0.3)) - 0.5) * 2.0;
  float body = 1.0 - smoothstep(-0.05, 0.004, d);
  float halo = exp(-max(d, 0.0) * 10.0) * (0.3 + 0.2 * u_voice) * u_glow;

  // Inside: the colors mixed in a slow swirl. Thinking turns it over faster.
  float ts = t * (0.16 + 0.3 * u_think);
  float swirl = fbm(p * 3.2 + vec2(ts, -ts * 0.7) + 2.0 * u_think * vec2(cos(ts), sin(ts)));
  vec3 inside = mix(u_b, u_a, smoothstep(0.0, R * 1.2, r));
  inside = mix(inside, u_c, smoothstep(0.42, 0.78, swirl) * (0.55 + 0.3 * u_think));
  inside += 0.1 * u_voice;

  // Reading: a band of light reads across the football, left to right.
  float bx = -1.4 * R + mod(t * 0.5, 1.0) * 2.8 * R;
  float band = exp(-pow((q.x - bx) / (0.22 * R), 2.0)) * (0.6 + 0.4 * sin(q.y * 150.0));
  inside = mix(inside, u_b + 0.18, band * 0.7 * u_read);

  // Done: one bright ring, then it settles.
  float dr = R + u_since * 0.42;
  float ring = exp(-pow((length(p) - dr) / 0.02, 2.0)) * exp(-u_since * 2.6) * u_done;

  float m = max(max(body, halo), ring);
  vec3 col = mix(u_a, inside, body);
  col = mix(col, u_b, clamp(ring, 0.0, 1.0) * 0.85);
  col += (hash(floor(gl_FragCoord.xy) + fract(t * 7.0) * 97.0) - 0.5) * u_grain * body;
  gl_FragColor = vec4(mix(u_ground, col, clamp(m, 0.0, 1.0) * u_dim), 1.0);
}`;
