// The visual's shaders (spec/VISUAL.md, YUI-124), WebGL 1 fragment shaders.
// One per look. They are the reference the app's Metal ports follow: same
// uniforms, same math, same look. Every one is cheap on purpose: 4-octave
// noise at most, no loops over the screen, drawn at half resolution.
//
// Uniforms (every look):
//   u_res     the canvas size in pixels
//   u_time    seconds, already scaled by the look's pace (visualPlan speed)
//   u_level   0..1, the sound after the look's envelope (visual.mjs follow)
//   u_a u_b u_c  the three colors (visualColors), u_ground the stage's ground
//   u_dim     1 alone, less behind words; u_scrim the ground laid over the
//   words' zone, u_zone its bottom and top edge (fractions of the height from
//   the bottom): full scrim below the first, none above the second
// Each look writes `vec3 look(vec2 frag)` with a mask in `m` (0..1): how much
// of the colors shows at that pixel. The shared tail does the rest.

export const VERTEX = `attribute vec2 p; void main() { gl_Position = vec4(p, 0.0, 1.0); }`;

const HEAD = `precision mediump float;
uniform vec2 u_res;
uniform float u_time, u_level, u_dim, u_scrim;
uniform vec2 u_zone;
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
// Centered, aspect-kept: y runs -0.5..0.5 over the height.
vec2 centered(vec2 frag) { return (frag - 0.5 * u_res) / u_res.y; }
`;

const TAIL = `
void main() {
  float m = 0.0;
  vec3 col = look(gl_FragCoord.xy, m);
  vec3 c = mix(u_ground, col, clamp(m, 0.0, 1.0) * u_dim);
  float zone = 1.0 - smoothstep(u_zone.x, u_zone.y, gl_FragCoord.y / u_res.y);
  gl_FragColor = vec4(mix(c, u_ground, u_scrim * zone), 1.0);
}`;

// A soft ball of light that swells when someone speaks. It sits a little
// above the middle, where the stage's mark lives.
const ORB = `
vec3 look(vec2 frag, out float m) {
  vec2 p = centered(frag) - vec2(0.0, 0.06);
  float r = length(p);
  vec2 dir = p / max(r, 0.0001);
  float R = 0.2 + 0.09 * u_level + 0.012 * sin(u_time * 1.3);
  R += (0.035 + 0.05 * u_level) * (noise(dir * 1.7 + vec2(7.0 + u_time * 0.45, 3.0 - u_time * 0.3)) - 0.5) * 2.0;
  float body = smoothstep(R, R - 0.1, r);
  float glow = exp(-max(r - R, 0.0) * (9.0 - 3.0 * u_level)) * (0.35 + 0.45 * u_level);
  float swirl = fbm(p * 3.2 + vec2(u_time * 0.18, -u_time * 0.12));
  vec3 inside = mix(u_b, u_a, smoothstep(0.0, R, r));
  inside = mix(inside, u_c, smoothstep(0.45, 0.8, swirl) * 0.6);
  m = max(body, glow);
  return mix(u_a, inside, body);
}`;

// Slow ribbons of color across the top, with fine curtains in them.
const AURORA = `
vec3 look(vec2 frag, out float m) {
  vec2 uv = frag / u_res;
  vec3 col = vec3(0.0);
  m = 0.0;
  for (int i = 0; i < 3; i++) {
    float fi = float(i);
    float yc = 0.74 - fi * 0.11 + 0.06 * sin(uv.x * 2.6 + u_time * 0.25 + fi * 1.7)
             + 0.12 * (fbm(vec2(uv.x * 1.8 + u_time * 0.07, fi * 3.1)) - 0.5);
    float w = 0.05 + 0.025 * u_level + 0.02 * fi;
    float band = exp(-pow((uv.y - yc) / w, 2.0));
    float curtain = 0.55 + 0.45 * noise(vec2(uv.x * 38.0 + fi * 11.0, u_time * 0.35));
    float k = band * curtain * (0.55 + 0.6 * u_level);
    vec3 tint = i == 0 ? u_a : (i == 1 ? u_b : u_c);
    col += tint * k;
    m += k;
  }
  m = clamp(m, 0.0, 1.0) * smoothstep(0.05, 0.45, uv.y);
  return col / max(m, 0.001) * smoothstep(0.05, 0.45, uv.y);
}`;

// Layered lines that ripple with the sound, low on the screen.
const WAVES = `
vec3 look(vec2 frag, out float m) {
  vec2 uv = frag / u_res;
  vec3 col = u_a;
  m = 0.0;
  for (int i = 0; i < 5; i++) {
    float fi = float(i);
    float amp = (0.018 + 0.075 * u_level) * (1.0 - fi * 0.13);
    float y = 0.2 + fi * 0.075 + amp * sin(uv.x * (5.0 + fi * 1.7) + u_time * (0.9 + fi * 0.25)) * sin(uv.x * 2.3 - u_time * 0.6 + fi);
    float d = abs(uv.y - y) * u_res.y;
    float line = smoothstep(2.4, 0.4, d) + exp(-d * 0.09) * 0.28;
    vec3 tint = mix(u_a, u_c, fi / 4.0);
    tint = mix(tint, u_b, 0.35 * sin(uv.x * 3.0 + fi + u_time * 0.3) + 0.2);
    float k = line * (1.0 - fi * 0.12);
    col = mix(col, tint, clamp(k / max(m + k, 0.001), 0.0, 1.0));
    m = max(m, k);
  }
  return col;
}`;

// A soft gradient of three slow lights, with film grain. It barely moves.
const GRAIN = `
vec3 look(vec2 frag, out float m) {
  vec2 p = centered(frag);
  float t = u_time * 0.06;
  vec2 p1 = vec2(0.28 * sin(t * 1.1), 0.25 + 0.12 * cos(t * 0.9));
  vec2 p2 = vec2(-0.3 + 0.1 * cos(t * 0.7), -0.2 + 0.1 * sin(t * 1.3));
  vec2 p3 = vec2(0.25 * cos(t * 0.5 + 2.0), -0.05 + 0.2 * sin(t * 0.8));
  float w1 = 1.0 / (dot(p - p1, p - p1) + 0.04);
  float w2 = 1.0 / (dot(p - p2, p - p2) + 0.04);
  float w3 = 1.0 / (dot(p - p3, p - p3) + 0.04);
  vec3 col = (u_a * w1 + u_b * w2 + u_c * w3) / (w1 + w2 + w3);
  float g = hash(floor(frag) + fract(u_time * 7.0) * 97.0) - 0.5;
  col += g * 0.07;
  m = 0.78 + 0.12 * u_level;
  return col;
}`;

// Petals of light that open on the beat.
const BLOOM = `
vec3 look(vec2 frag, out float m) {
  vec2 p = centered(frag) - vec2(0.0, 0.04);
  float r = length(p), a = atan(p.y, p.x);
  float open = 0.17 + 0.17 * u_level + 0.015 * sin(u_time * 0.9);
  float petal = open * pow(0.5 + 0.5 * cos(6.0 * a + u_time * 0.22), 1.4);
  float inner = open * 0.62 * pow(0.5 + 0.5 * cos(6.0 * a - u_time * 0.3 + 0.52), 1.6);
  float outer = smoothstep(petal + 0.02, petal - 0.03, r);
  float mid = smoothstep(inner + 0.02, inner - 0.03, r);
  float heart = smoothstep(0.05 + 0.02 * u_level, 0.0, r);
  float glow = exp(-r * 6.0) * (0.25 + 0.5 * u_level);
  vec3 col = mix(u_a, u_c, mid);
  col = mix(col, u_b, heart);
  m = max(max(outer, mid), max(heart, glow));
  return mix(u_a, col, max(max(outer, mid), heart));
}`;

export const SHADERS = { orb: ORB, aurora: AURORA, waves: WAVES, grain: GRAIN, bloom: BLOOM };

// The full fragment source for a look.
export function fragment(look) {
  return HEAD + (SHADERS[look] || ORB) + TAIL;
}

// Hex to the vec3 a uniform takes.
export function vec3(hex) {
  const v = parseInt(String(hex).slice(1), 16);
  return [((v >> 16) & 255) / 255, ((v >> 8) & 255) / 255, (v & 255) / 255];
}
