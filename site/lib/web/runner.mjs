// Arnold's workout runner, the web half (YUI-246): the twin of Presets/WorkoutRunner.swift (YUI-182). The runtime
// sends today's session as one `plan`: a page, then per move a `pick` of its sets ("Set 1".."Set N" and Skip) with
// `slide`s for reps (or seconds) and weight, then how it felt. Any plan shaped like that runs as a workout: one move
// per page, big set rows to tick, reps and weight nudged with - and +, a rest timer that starts on its own after each
// set, and "done" said out loud ticks the next set. The place is kept on the device per plan id, so a reload or a
// trip to another agent comes back to the same set. The answers still go as the plan's one `{plan}`.
// Pure: steps are the plan's members as stepsOf gives them ({ id, preset, props }). Time is passed in.

const SET = /^Set \d{1,2}$/;
export const isSet = (o) => SET.test(String(o));

// A plan read as a workout, or null when it is some other plan.
export function runnerPlan(steps) {
  const moves = [];
  steps.forEach((step, i) => {
    if (step.preset !== "pick") return;
    const opts = Array.isArray(step.props?.options) ? step.props.options.map(String) : [];
    const labels = opts.filter(isSet);
    // Every option a set, bar at most one way out (Skip).
    if (!labels.length || opts.length - labels.length > 1) return;
    const skip = opts.find((o) => !isSet(o)) ?? null;
    // Its nudges: the slides right after it that share its id's move ("e1-sets" -> "e1-").
    const head = String(step.id).endsWith("-sets") ? String(step.id).slice(0, -4) : null;
    const nudges = [];
    for (const next of steps.slice(i + 1)) {
      if (next.preset !== "slide" || !head || !String(next.id).startsWith(head)) break;
      nudges.push(next);
    }
    moves.push({ sets: step, id: step.id, labels, skip, nudges });
  });
  if (!moves.length) return null;
  const words = steps.filter((s) => s.preset === "page").map((s) => s.props?.body).filter((b) => typeof b === "string").join(" ");
  const m = words.match(/[Rr]est (?:about |for )?(\d{1,3}) ?(?:seconds|sec|s)\b/);
  const rest = Math.max(10, Math.min(m ? Number(m[1]) : 90, 600));
  return {
    moves, rest,
    absorbed: new Set(moves.flatMap((mv) => mv.nudges.map((n) => n.id))),
    move: (id) => moves.find((mv) => mv.id === id) || null,
  };
}

// The rest between sets: when it ends and what is left. Time is a moment (ms), so a background tab keeps true time.
export const restStart = (seconds, now) => ({ ends: now + seconds * 1000, total: seconds });
export const restLeft = (r, now) => Math.max(0, Math.ceil((r.ends - now) / 1000));
export const restOver = (r, now) => now >= r.ends;
export const restProgress = (r, now) => (r.total > 0 ? (r.total - restLeft(r, now)) / r.total : 1);
// +15s: a longer rest, and the ring grows with it.
export const restAdd = (r, seconds, now) => ({ ends: Math.max(r.ends, now) + seconds * 1000, total: r.total + seconds });
export const restLabel = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

// "Done" said out loud: every new "done" (or "next set") in the words heard ticks a set.
export const voiceDone = (words) => (String(words).toLowerCase().match(/\b(?:done|next set|set done)\b/g) || []).length;

export const emptyProgress = () => ({ at: 0, ticked: {}, values: {}, rest: null });

// A set row tapped: on, or back off. Returns { progress, went } (went = it went on, so the rest starts).
export function toggle(progress, label, move) {
  let t = [...(progress.ticked[move.id] || [])];
  const on = !t.includes(label);
  if (on) { t = t.filter((x) => x !== move.skip); t.push(label); } else t = t.filter((x) => x !== label);
  const next = label === move.skip && on ? [label] : move.labels.filter((x) => t.includes(x));
  return { progress: { ...progress, ticked: { ...progress.ticked, [move.id]: next } }, went: on };
}

// Ticks the next set not yet ticked (a "done" out loud). went is false when all are.
export function tickNext(progress, move) {
  const t = (progress.ticked[move.id] || []).filter((x) => x !== move.skip);
  const next = move.labels.find((l) => !t.includes(l));
  if (!next) return { progress, went: false };
  return { progress: { ...progress, ticked: { ...progress.ticked, [move.id]: move.labels.filter((l) => [...t, next].includes(l)) } }, went: true };
}

export const nudged = (progress, id, value) => ({ ...progress, values: { ...progress.values, [id]: value } });

// The plan answers it stands for: ticked sets as picks, every nudge as its number.
export function answersOf(runner, progress) {
  const out = {};
  for (const mv of runner.moves) {
    const t = progress.ticked[mv.id];
    if (t?.length) out[mv.id] = t;
    for (const n of mv.nudges) {
      const v = progress.values[n.id] ?? (typeof n.props?.value === "number" ? n.props.value : null);
      if (v != null) out[n.id] = v;
    }
  }
  return out;
}

// "8 reps · 135 lb" from the nudges as they stand now.
export function targetOf(runner, move, progress) {
  return move.nudges.map((c) => {
    const v = progress.values[c.id] ?? c.props?.value;
    if (v == null) return null;
    const unit = c.props?.unit ?? (String(c.id).endsWith("-secs") ? "s" : String(c.id).endsWith("-reps") ? "reps" : null);
    return `${Number.isInteger(v) ? v : Number(v.toFixed(1))}${unit ? (unit === "s" ? unit : ` ${unit}`) : ""}`;
  }).filter(Boolean).join(" · ");
}

// Kept per plan id in the browser (UserDefaults `yui.runner.<id>`).
const key = (plan) => `yui.runner.${plan}`;
export function loadProgress(plan, storage = globalThis.localStorage) {
  try { const v = JSON.parse(storage?.getItem(key(plan)) || "null"); return v && typeof v === "object" ? { ...emptyProgress(), ...v } : null; } catch { return null; }
}
export function saveProgress(plan, progress, storage = globalThis.localStorage) { try { storage?.setItem(key(plan), JSON.stringify(progress)); } catch { /* private mode */ } }
export function clearProgress(plan, storage = globalThis.localStorage) { try { storage?.removeItem(key(plan)); } catch { /* nothing kept */ } }
