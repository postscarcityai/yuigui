// The mark's motion, as poses over time. Shared by the live loops on /brand and the films.
// Every function is pure: a pose for time t, nothing carried between frames.
import { landPose, ORDER } from "./mark.mjs";

// Pivots in mark space: where an ear hinges, where the tail (the i) is rooted.
export const EAR_L = [262, 262];
export const EAR_R = [370, 262];
export const TAIL = [917, 590];

// When each piece hits its spot in landPose (the back-ease first reaches 1), for the music.
export function landTimes(start = 0, { step = 0.16, dur = 0.7 } = {}) {
  return ORDER.map((k, i) => start + i * step + dur * 0.42);
}

// The ears twitch and the tail flicks around time t0. The one cat moment.
export function wink(t, t0) {
  const a = t - t0;
  const tw = a > 0 && a < 0.6 ? Math.sin((a / 0.6) * Math.PI * 3) * Math.exp(-a * 5) : 0;
  const b = a - 0.4;
  const fl = b > 0 && b < 1 ? Math.sin(b * Math.PI * 2) * Math.exp(-b * 3) : 0;
  return {
    earL: { rot: -tw * 9, origin: EAR_L },
    earR: { rot: tw * 6, origin: EAR_R },
    iBody: { rot: fl * 7, origin: TAIL },
    iDot: { rot: fl * 7, origin: TAIL },
  };
}

// The three loops: splash (the pieces land), loading (they take turns), idle (a wink now and then).
export function posesAt(kind, t) {
  if (kind === "splash") {
    const per = 3.4, tt = t % per;
    const pose = landPose(tt - 0.15, { step: 0.11, dur: 0.6, drop: 90, spin: 10 });
    const out = tt > per - 0.35 ? (per - tt) / 0.35 : 1;
    if (out < 1) for (const n of ORDER) pose[n] = { ...pose[n], s: (pose[n].s ?? 1) * (0.7 + 0.3 * out) };
    return { pose, fade: out };
  }
  if (kind === "loading") {
    const pose = {};
    ORDER.forEach((n, i) => {
      const ph = (t * 1.6 - i * 0.28) % 2.4;
      const b = ph > 0 && ph < 1 ? Math.sin(ph * Math.PI) : 0;
      pose[n] = { dy: -b * 26, s: 1 + b * 0.05 };
    });
    return { pose, fade: 1 };
  }
  return { pose: wink(t % 4.2, 2.2), fade: 1 };
}
