// The action shader (spec/SHADER.md): the blob in the middle, WebGL 1, same
// math the Metal port will use. One fragment shader for every agent and every
// state. The state comes in as five eased weights (idle is what is left), the
// agent as five knobs. Cheap on purpose: one 4-octave noise, no screen loops.
//
// Uniforms:
//   u_res u_time            canvas pixels, seconds (already scaled by pace)
//   u_a u_b u_c u_ground    the agent's three colors and the stage ground
//   u_think u_read u_run u_search u_done   state weights, 0..1, sum with idle to 1
//   u_since                 seconds since the state changed (the done ring)
//   u_size u_wobble u_grain u_glow          the agent's knobs
//   u_voice                 0..1, audio reactive later (the mock leaves it at 0)
//   u_dim                   1 alone, less behind words

export { VERTEX, vec3 } from "./shaders.mjs";

export const ACTION_FRAGMENT = `precision mediump float;
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
void main() {
  vec2 p = (gl_FragCoord.xy - 0.5 * u_res) / u_res.y - vec2(0.0, 0.04);
  float r = length(p);
  vec2 dir = p / max(r, 0.0001);

  // Where the searching light is: it circles, the blob leans toward it.
  float sa = u_time * 1.6;
  vec2 orbit = vec2(cos(sa), sin(sa));
  vec2 lean = orbit * 0.035 * u_search;

  // The base blob: a soft body with a wandering edge and a halo.
  float R = 0.2 * u_size + 0.012 * sin(u_time * 1.3) + 0.06 * u_voice;
  R *= 1.0 - 0.06 * u_run + 0.05 * u_done * exp(-u_since * 3.0);
  vec2 q = p - lean;
  float qr = length(q);
  vec2 qd = q / max(qr, 0.0001);
  float wob = (0.03 + 0.05 * u_think + 0.04 * u_voice) * u_wobble;
  R += wob * (noise(qd * 1.7 + vec2(7.0 + u_time * 0.45, 3.0 - u_time * 0.3)) - 0.5) * 2.0;
  float body = smoothstep(R, R - 0.1, qr);
  float halo = exp(-max(qr - R, 0.0) * (9.0 - 2.0 * u_voice)) * (0.32 + 0.25 * u_voice) * u_glow;

  // Inside: the colors mixed in a slow swirl. Thinking turns it over faster.
  float ts = u_time * (0.16 + 0.34 * u_think);
  float swirl = fbm(p * 3.2 + vec2(ts, -ts * 0.7) + 2.0 * u_think * vec2(cos(ts), sin(ts)));
  vec3 inside = mix(u_b, u_a, smoothstep(0.0, R, qr));
  inside = mix(inside, u_c, smoothstep(0.42, 0.78, swirl) * (0.55 + 0.3 * u_think));
  inside += 0.12 * u_voice;

  // Reading: a band of light sweeps down the blob, in fine lines.
  float bandY = 0.32 - mod(u_time * 0.55, 1.0) * 0.64;
  float band = exp(-pow((p.y - bandY) / 0.045, 2.0));
  float lines = 0.6 + 0.4 * sin(p.y * 160.0);
  inside = mix(inside, u_b + 0.18, band * lines * 0.75 * u_read);

  // Running: rings leave the blob on a steady beat.
  float ph = fract(u_time * 0.9);
  float ringR = R + ph * 0.26;
  float ring = exp(-pow((r - ringR) / 0.014, 2.0)) * (1.0 - ph) * u_run;
  float ph2 = fract(u_time * 0.9 + 0.5);
  ring += exp(-pow((r - (R + ph2 * 0.26)) / 0.014, 2.0)) * (1.0 - ph2) * u_run * 0.7;

  // Searching: the small light itself.
  vec2 lp = orbit * (R + 0.075);
  float dot_ = exp(-dot(p - lp, p - lp) / 0.0009) * u_search;

  // Done: one bright ring, then it settles.
  float dr = R + u_since * 0.42;
  float burst = exp(-pow((r - dr) / 0.02, 2.0)) * exp(-u_since * 2.6) * u_done;

  float m = max(max(body, halo), max(max(ring, dot_), burst));
  vec3 col = mix(u_a, inside, body);
  col = mix(col, u_b, clamp(ring + dot_ + burst, 0.0, 1.0) * 0.85);
  col += (hash(floor(gl_FragCoord.xy) + fract(u_time * 7.0) * 97.0) - 0.5) * u_grain * body;
  vec3 c = mix(u_ground, col, clamp(m, 0.0, 1.0) * u_dim);
  gl_FragColor = vec4(c, 1.0);
}`;
