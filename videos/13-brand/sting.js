// A sting: the six pieces land one by one (ears, stem, u, i, dot), then the material takes over.
// 6.5 s, 16:9 or ?reel. The music reads window.SCORE (the land times) so every note hits a piece.
import { shaderLayer, inkLayer, label, inOut, ready, SCENES, BOJAGI, byId, landPose, landTimes, ease, prog, mix, clamp, REEL, W, H } from "./lab.js";

const T_LAND = 0.5;
const LAND = { step: 0.16, dur: 0.7 };

const STINGS = {
  ink: {
    shader: "meok", name: "Hanji and meok", color: byId.meok.ink, voice: "gayageum",
    scene: (t) => {
      const s = SCENES.meok(t, null, { once: true });
      s.mark.pose = landPose(t - T_LAND, { ...LAND, drop: 0, spin: 0 });
      s.p = [clamp((t - 0.55) / 3.2), 0.45, 1, 0];
      s.place = { pad: REEL ? 0.1 : 0.16, scale: mix(0.97, 1.03, ease.inOut(prog(t, 0, 6.5))) };
      return s;
    },
  },
  quiet: {
    shader: "quiet", name: "Seoul quiet", color: byId.quiet.ink, voice: "bell",
    scene: (t) => {
      const s = SCENES.quiet(t, null);
      s.mark.pose = landPose(t - T_LAND, { ...LAND, drop: 60, spin: 6 });
      const u = ease.inOut(prog(t, 0.6, 5.6));
      s.mouse = [mix(-0.1, 1.05, u), mix(0.25, 0.95, u)];
      s.p = [mix(0.25, 0.8, ease.out(prog(t, 1.2, 3))), mix(0.1, 0.6, ease.inOut(prog(t, 2.2, 4.5))), 0, 0];
      s.place = { pad: REEL ? 0.12 : 0.18 };
      return s;
    },
  },
  celadon: {
    shader: "celadon", name: "Celadon", color: byId.celadon.ink, voice: "celadon",
    scene: (t) => {
      const s = SCENES.celadon(t, null);
      s.mark.pose = landPose(t - T_LAND, { ...LAND, drop: 80, spin: 10 });
      s.p = [clamp((t - 1.8) / 3.2), mix(-0.1, 1.2, ease.inOut(prog(t, 2.3, 4.8))), 0, 0];
      s.place = { pad: REEL ? 0.12 : 0.17 };
      return s;
    },
  },
  bojagi: {
    shader: "bojagi", name: "Bojagi", color: "#2F4A40", voice: "rhodes",
    scene: (t) => {
      const s = SCENES.bojagi(t, null);
      s.mark.pose = landPose(t - T_LAND, { ...LAND, drop: 40, spin: 4 });
      s.p = [1, mix(0.2, 1, ease.inOut(prog(t, 1.5, 4.5))), clamp((t - 2) / 1.2), 0];
      s.place = { pad: REEL ? 0.12 : 0.17 };
      return s;
    },
  },
  pop: {
    shader: "holo", name: "Pop, sprinkled", color: byId.pop.ink, voice: "sparkle",
    scene: (t) => {
      const s = SCENES.holo(t, null);
      s.mark.pose = landPose(t - T_LAND, { ...LAND, drop: 170, spin: 28 });
      const a = t * 1.4;
      s.mouse = [0.5 + 0.42 * Math.cos(a), 0.5 + 0.35 * Math.sin(a * 1.3)];
      s.place = { pad: REEL ? 0.12 : 0.17 };
      return s;
    },
  },
};

export function sting(kind) {
  const cfg = STINGS[kind];
  const layer = shaderLayer(cfg.shader);
  const l1 = label(cfg.name, "l", cfg.color);
  const l2 = label("yuigui.com/brand", "r", cfg.color);
  function render(t) {
    layer.draw(t, cfg.scene(t));
    inOut(l1, t, 3.4, 99, 10);
    inOut(l2, t, 3.6, 99, 10);
  }
  window.SCORE = { bpm: 122, land: landTimes(T_LAND, LAND), voice: cfg.voice, duration: 6.5 };
  window.ready = ready().then((ok) => { render(0); return ok; });
  window.render = render;
  window.DURATION = 6.5;
  window.POSTER = 5.2;
}

// The Apple one: pure ink on white. The pieces land, the word steps back, the Y becomes the icon.
export function stingMark() {
  const ink = inkLayer({ fill: "#1D1B20", pad: REEL ? 0.1 : 0.16 });
  const l2 = label("yuigui.com/brand", "r", "#1D1B20");
  const NS = ink.NS;
  const sq = document.createElementNS(NS, "rect");
  ink.back.appendChild(sq);
  sq.setAttribute("fill", "#1D1B20");
  const T = 0.5, STEP = { step: 0.22, dur: 0.8 };
  const YC = [316, 324], MC = [500, 300];
  function render(t) {
    document.getElementById("stage").style.background = "#FFFFFF";
    const pose = landPose(t - T, { ...STEP, drop: 70, spin: 0 });
    const u = ease.inOut(prog(t, 3.4, 4.6));
    const alpha = {};
    for (const k of ["u", "iBody", "iDot"]) { alpha[k] = 1 - prog(t, 3.2, 3.9); pose[k] = { ...pose[k], dy: (pose[k].dy || 0) + 30 * ease.inOut(prog(t, 3.2, 3.9)) }; }
    for (const k of ["earL", "earR", "stem"]) {
      pose[k] = { ...pose[k], origin: YC, s: (pose[k].s ?? 1) * mix(1, 0.62, u), dx: (MC[0] - YC[0]) * u, dy: (pose[k].dy || 0) + (MC[1] - YC[1]) * u };
    }
    ink.set({ rough: 0, round: 0.5, pose }, null, alpha);
    // the squircle grows in behind the Y and the Y turns white
    const v = ease.back(prog(t, 4.5, 5.3), 1.2);
    const side = 520 * v;
    sq.setAttribute("x", MC[0] - side / 2); sq.setAttribute("y", MC[1] - side / 2);
    sq.setAttribute("width", Math.max(0, side)); sq.setAttribute("height", Math.max(0, side));
    sq.setAttribute("rx", side * 0.225);
    ink.g.setAttribute("fill", prog(t, 4.6, 4.9) > 0.5 ? "#FFFFFF" : "#1D1B20");
    inOut(l2, t, 5.4, 99, 10);
  }
  window.SCORE = { bpm: 122, land: landTimes(T, STEP), voice: "bell", icon: 4.6, duration: 7 };
  window.ready = ready().then((ok) => { render(0); return ok; });
  window.render = render;
  window.DURATION = 7;
  window.POSTER = 2.8;
}
