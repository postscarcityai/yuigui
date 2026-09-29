// The 404's dice (SITE-104). One seed per load; every random choice comes from it, so ?seed=<hex> replays a page.
export function hashStr(s) {
  let h = 1779033703 ^ s.length;
  for (let i = 0; i < s.length; i++) { h = Math.imul(h ^ s.charCodeAt(i), 3432918353); h = (h << 13) | (h >>> 19); }
  h = Math.imul(h ^ (h >>> 16), 2246822507);
  h = Math.imul(h ^ (h >>> 13), 3266489909);
  return (h ^ (h >>> 16)) >>> 0;
}
export function mulberry32(a) {
  return function () {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
// Separate streams per job, so the line never depends on how much the scene rolled.
export const rngFor = (seed, tag) => mulberry32(hashStr(`${seed}:${tag}`));
export const parseSeed = (s) => (/^[0-9a-f]{1,8}$/i.test(s || "") ? s.toLowerCase() : null);
export function newSeed() {
  const a = new Uint32Array(1);
  crypto.getRandomValues(a);
  return (a[0] & 0xffffff).toString(16).padStart(6, "0");
}
export const pick = (rng, list) => list[Math.floor(rng() * list.length)];
