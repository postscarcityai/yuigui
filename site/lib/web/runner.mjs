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

// ---- one set at a time (YUI-304, the web twin of WorkoutSession.swift's log step, YUI-303) ----
// A set tapped does not tick at once: the runner asks what was done (reps or seconds, weight), chips around the plan's
// number, a stepper and a mic. "Log set" ticks it, keeps the numbers and starts the rest.

// The reps nudge (reps or seconds) and the weight nudge of a move.
export const repsNudge = (move) => move.nudges.find((n) => !String(n.id).endsWith("-lb")) || null;
export const weightNudge = (move) => move.nudges.find((n) => String(n.id).endsWith("-lb")) || null;
const valueOf = (progress, n) => (n ? progress.values[n.id] ?? (typeof n.props?.value === "number" ? n.props.value : null) : null);

// What the log step starts from: the move's numbers as they stand (the last set's, else the plan's).
export function logStart(move, progress) {
  const r = repsNudge(move), w = weightNudge(move);
  const timed = !!r && String(r.id).endsWith("-secs");
  return {
    timed,
    reps: valueOf(progress, r) ?? 8,
    weight: w ? valueOf(progress, w) ?? 0 : null,
    repsStep: Math.max(Number.isFinite(r?.props?.step) ? r.props.step : 1, 1),
    repsMin: Number.isFinite(r?.props?.min) ? r.props.min : 1,
    repsMax: Math.max(Number.isFinite(r?.props?.max) ? r.props.max : 60, 1),
    weightStep: Math.max(Number.isFinite(w?.props?.step) ? w.props.step : 5, 0.5),
    weightMin: Number.isFinite(w?.props?.min) ? w.props.min : 0,
    weightMax: Number.isFinite(w?.props?.max) ? w.props.max : 500,
  };
}

// The plan's number and two either side, never under the floor or over the ceiling.
export function chipsAround(value, step, lo, hi) {
  return [-2, -1, 0, 1, 2].map((k) => value + k * step).filter((v) => v >= lo && v <= hi).map((v) => Number(v.toFixed(1)));
}

// "8 reps at 135" said out loud: the first number is the reps (or seconds), the second the weight.
export function hearRepsWeight(words) {
  const nums = String(words).match(/\d+(?:\.\d+)?/g) || [];
  if (!nums.length) return null;
  return { reps: Number(nums[0]), weight: nums[1] != null ? Number(nums[1]) : null };
}

// Set `label` of `move` is over and the numbers are given: the row ticks, the numbers are kept for the set and as the
// move's numbers from here on (the next set starts where this one ended), and the rest starts. The next set of this
// move is the first not ticked, so the person is asked set by set.
export function logSet(runner, progress, move, label, { reps, weight }, now) {
  const ticked = toggle({ ...progress, ticked: { ...progress.ticked, [move.id]: (progress.ticked[move.id] || []).filter((x) => x !== label) } }, label, move).progress;
  const tag = String(move.id).endsWith("-sets") ? String(move.id).slice(0, -5) : move.id;
  const n = move.labels.indexOf(label) + 1;
  const values = { ...progress.values };
  const r = repsNudge(move), w = weightNudge(move);
  if (r && reps != null) { values[r.id] = reps; values[`${tag}-s${n}-reps`] = reps; }
  if (w && weight != null) { values[w.id] = weight; values[`${tag}-s${n}-lb`] = weight; }
  return { ...ticked, values, rest: restStart(runner.rest, now) };
}

// Set N of M, the log step's title.
export const logTitle = (move, label) => `Set ${move.labels.indexOf(label) + 1} of ${move.labels.length} done`;

// The next set not yet ticked on a move, or null when it is finished or skipped.
export function nextSet(progress, move) {
  const t = progress.ticked[move.id] || [];
  if (move.skip && t.includes(move.skip)) return null;
  return move.labels.find((l) => !t.includes(l)) || null;
}

// Kept per plan id in the browser (UserDefaults `yui.runner.<id>`).
const key = (plan) => `yui.runner.${plan}`;
export function loadProgress(plan, storage = globalThis.localStorage) {
  try { const v = JSON.parse(storage?.getItem(key(plan)) || "null"); return v && typeof v === "object" ? { ...emptyProgress(), ...v } : null; } catch { return null; }
}
export function saveProgress(plan, progress, storage = globalThis.localStorage) { try { storage?.setItem(key(plan), JSON.stringify(progress)); } catch { /* private mode */ } }
export function clearProgress(plan, storage = globalThis.localStorage) { try { storage?.removeItem(key(plan)); } catch { /* nothing kept */ } }
