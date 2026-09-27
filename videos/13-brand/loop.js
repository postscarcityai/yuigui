// Loops for the app: splash (the pieces land), loading (they take turns), idle (a wink now and then).
// Silent, seamless: frame 0 and the last frame meet. The same poses as the live loops on /brand.
import { inkLayer, ready, posesAt, REEL } from "./lab.js";

const LOOPS = {
  splash: { dur: 3.4, bg: "#FFFFFF", fill: "#1D1B20" },
  loading: { dur: 3.0, bg: "#FFF9F0", fill: "#FF7E8A" },
  idle: { dur: 4.2, bg: "#1D1B20", fill: "#F3EDE1" },
};

export function loop(kind) {
  const cfg = LOOPS[kind];
  const ink = inkLayer({ fill: cfg.fill, pad: REEL ? 0.12 : 0.2 });
  document.getElementById("stage").style.background = cfg.bg;
  function render(t) {
    const { pose, fade } = posesAt(kind, t % cfg.dur);
    ink.set({ rough: 0, round: 0.5, pose });
    ink.show(fade);
  }
  window.ready = ready().then((ok) => { render(0); return ok; });
  window.render = render;
  window.DURATION = cfg.dur;
  window.POSTER = kind === "splash" ? 2.4 : 0.5;
}
