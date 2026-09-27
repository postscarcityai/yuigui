// Each direction's live scene: what the shader draws at time t. Shared by the /brand page
// and the films in videos/13-brand, so a still, a loop and a sting are the same material.
// A scene returns { mark, place, pieceColors, p, q, colors, mouse }.
import { landPose, ease, ORDER } from "./mark.mjs";
import { byId } from "./palettes.mjs";

const clamp = (x) => Math.max(0, Math.min(1, x));
const orbit = (t, r = 0.32, sp = 0.35) => [0.5 + r * Math.cos(t * sp), 0.55 + r * 0.8 * Math.sin(t * sp)];

export const BOJAGI = { earL: "#C8372D", earR: "#2E6B5A", stem: "#D9A441", u: "#2D4E8A", iBody: "#8C6A9E", iDot: "#D98A8A" };

// Gentle drift after landing: each piece breathes on its own phase.
export function drift(t, amp = 4) {
  const pose = {};
  ORDER.forEach((k, i) => { pose[k] = { dy: Math.sin(t * 0.9 + i * 1.3) * amp, rot: Math.sin(t * 0.6 + i) * amp * 0.25 }; });
  return pose;
}

// Land first, then drift. Blends so there is no jump.
export function landThenDrift(t, start = 0.3, amp = 4) {
  const land = landPose(t - start);
  const settle = clamp((t - start - 1.6) / 1.2);
  const d = drift(t, amp * settle);
  const pose = {};
  for (const k of ORDER) {
    const a = land[k], b = d[k];
    pose[k] = { dy: (a.dy || 0) + b.dy, rot: (a.rot || 0) + b.rot, s: a.s };
  }
  return pose;
}

export const SCENES = {
  paper: (t, mouse, o = {}) => ({
    mark: { rough: 1, pose: o.land === false ? drift(t) : landThenDrift(t) },
    place: { pad: 0.13 },
    p: [0.45 + 0.2 * Math.sin(t * 0.7), 1, 0, 0],
    colors: byId.sketch,
  }),

  meok: (t, mouse, o = {}) => {
    const per = o.period || 11;
    const tt = o.once ? t : t % per;
    let b = clamp((tt - 0.4) / 3.4);
    if (!o.once && tt > per - 0.9) b = clamp((per - tt) / 0.9); // wash back to paper before the next bloom
    return {
      mark: { rough: 0.28, tear: 0.35, seed: 3 },
      place: { pad: 0.14 },
      p: [b, 0.45, 1, 0],
      colors: byId.meok,
    };
  },

  quiet: (t, mouse) => ({
    mark: { rough: 0, round: 0.55 },
    place: { pad: 0.16 },
    p: [0.75, 0.6, 0, 0],
    mouse: mouse || orbit(t),
    colors: { ...byId.quiet, c1: "#8C8680", c2: "#C9A48C" },
  }),

  celadon: (t, mouse, o = {}) => ({
    mark: { rough: 0, round: 1 },
    place: { pad: 0.15 },
    p: [clamp((t - 0.5) / 5), ((t % 7) / 7) * 1.3 - 0.15, 0, 0],
    colors: { ...byId.celadon, bg: "#EFE7D2", c1: "#B7D0BE", c2: "#B89F80" },
  }),

  bojagi: (t) => ({
    mark: { rough: 0.12, round: 0.6 },
    place: { pad: 0.15 },
    pieceColors: BOJAGI,
    p: [1, 1, 1, 0],
    colors: { bg: "#EFE7D2", c3: "#D98A8A" },
  }),

  holo: (t, mouse) => ({
    mark: { rough: 0, round: 1 },
    place: { pad: 0.16 },
    p: [1, 1, 0, 0],
    mouse: mouse || orbit(t, 0.4, 0.5),
    colors: byId.pop,
  }),
};

export { ease };
