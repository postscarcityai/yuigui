// True time for the `timer` preset (YUI-246, Presets/TimerPreset.swift + LiveTimer.swift). The app counts from a start
// timestamp, so a Live Activity and a locked phone agree. A tab in the background has its timers slowed to once a
// second or worse, so counting ticks drifts; the web counts the time that passed between two looks instead, and a
// look after a long absence walks across every phase it missed. Pure.

// Moves a timer on by `dt` seconds. state = { round, phase: "work" | "rest", left, done }; plan = { work, rest, rounds, up }.
// Returns the new state plus `beeps`, the whole seconds the last 3 crossed (3, 2, 1) and `cross`, the phase changes
// ("rest" | "work" | "done") in order, so a caller can sound the last one when the tab comes back.
export function advance(state, plan, dt) {
  if (plan.up) return { ...state, left: state.left + dt, beeps: [], cross: [] };
  let { round, phase, left } = state;
  const cross = []; const beeps = [];
  let rest = Math.max(0, dt);
  while (rest > 1e-9) {
    if (rest < left - 1e-9) {
      const before = Math.ceil(left); left -= rest; rest = 0;
      for (let v = before - 1; v >= Math.ceil(left); v--) if (v <= 3 && v >= 1) beeps.push(v);
      break;
    }
    rest -= left;
    if (phase === "work" && plan.rest > 0 && round < plan.rounds) { phase = "rest"; left = plan.rest; cross.push("rest"); }
    else if (round < plan.rounds) { round += 1; phase = "work"; left = plan.work; cross.push("work"); }
    else { cross.push("done"); return { round, phase, left: 0, done: true, beeps, cross }; }
  }
  return { round, phase, left, done: false, beeps, cross };
}

export const clockLabel = (s) => { const n = Math.max(0, Math.ceil(s)); return `${Math.floor(n / 60)}:${String(n % 60).padStart(2, "0")}`; };

// The tab title while a timer runs (the Live Activity's twin): the time left, then the round, then the page's own title.
export function tabTitle(base, left, round, rounds) {
  return `${clockLabel(left)}${rounds > 1 ? ` · ${round}/${rounds}` : ""} · ${base}`;
}
