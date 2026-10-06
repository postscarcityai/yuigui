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

export const emptyProgress = () => ({ at: 0, ticked: {}, values: {}, rest: null, edits: null });

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

// The plan answers it stands for: ticked sets as picks, every nudge as its number. Edited, the moves are the plan as
// edited (an added move answers by its own ids) and `edits` says what changed, one line per change (YUI-309).
export function answersOf(runner, progress) {
  const out = {};
  const changes = changesOf(runner, progress);
  if (changes.length) out.edits = changes;
  for (const mv of applyEdits(runner, progress.edits).moves) {
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

// ---- edits on the fly (YUI-309, the web twin of Presets/WorkoutEdits.swift, YUI-305) ----
// A move can be swapped, its sets, reps and weight changed, a move added after it or skipped, from the runner. The
// edits are kept with the runner's place, the plan is read as edited, and the plan's answer carries one `edits` line
// per change: same keys, same words as the app, so an agent reads one format.

export const emptyEdits = () => ({ swaps: {}, sets: {}, reps: {}, lb: {}, added: [] });
export const editsEmpty = (e) => !e || (!Object.keys(e.swaps || {}).length && !Object.keys(e.sets || {}).length && !Object.keys(e.reps || {}).length && !Object.keys(e.lb || {}).length && !(e.added || []).length);

// A move's tag ("e1-sets" -> "e1") and its name (what the page calls it).
export const tagOf = (move) => (String(move.id).endsWith("-sets") ? String(move.id).slice(0, -5) : String(move.id));
export const nameOf = (move) => String(move.sets.props?.title || move.sets.props?.q || move.sets.props?.prompt || tagOf(move));
// 8 -> "8", 7.5 -> "7.5" (the app's YLComponent.format).
export const fmt = (v) => String(Number(Number(v).toFixed(1)));

// The next free tag for a move added here: add1, add2.
export const nextTag = (e) => `add${Math.max(0, ...(e?.added || []).map((a) => Number(String(a.tag).slice(3)) || 0)) + 1}`;

// Moves to swap to, by what the move is: the first three are offered as chips.
const ALTERNATES = [
  ["squat", ["Leg press", "Split squat", "Box squat"]],
  ["lunge", ["Split squat", "Step-up", "Goblet squat"]],
  ["deadlift", ["Romanian deadlift", "Hip thrust", "Kettlebell swing"]],
  ["push-up", ["Incline push-up", "Bench press", "Knee push-up"]],
  ["push up", ["Incline push-up", "Bench press", "Knee push-up"]],
  ["bench", ["Dumbbell press", "Push-up", "Incline press"]],
  ["overhead", ["Arnold press", "Landmine press", "Pike push-up"]],
  ["press", ["Dumbbell press", "Push-up", "Landmine press"]],
  ["row", ["Cable row", "Band row", "Inverted row"]],
  ["pull", ["Lat pulldown", "Band pull-down", "Inverted row"]],
  ["plank", ["Dead bug", "Side plank", "Hollow hold"]],
  ["curl", ["Hammer curl", "Band curl", "Chin-up"]],
  ["bridge", ["Hip thrust", "Single-leg bridge", "Kettlebell swing"]],
];
export const alternates = (name) => { const n = String(name).toLowerCase(); return (ALTERNATES.find(([k]) => n.includes(k)) || [null, ["Push-up", "Goblet squat", "Plank"]])[1]; };
// Moves to add, the usual fillers.
export const EXTRAS = ["Lunge", "Plank", "Burpee", "Curl"];

// A move added in the runner, as if the plan had sent it: a sets pick and a reps (and weight) slide.
function addedMove(a) {
  const name = String(a.name).replace(/"/g, "");
  const n = Math.max(1, a.sets);
  const labels = Array.from({ length: n }, (_, i) => `Set ${i + 1}`);
  const sets = { id: `${a.tag}-sets`, key: `added-${a.tag}`, preset: "pick", props: { title: name, options: [...labels, "Skip"] } };
  const nudges = [{ id: `${a.tag}-reps`, preset: "slide", props: { label: `${name}: reps per set`, min: 1, max: 60, value: a.reps } }];
  if (a.lb != null) nudges.push({ id: `${a.tag}-lb`, preset: "slide", props: { label: `${name}: weight in lb`, min: 0, max: 500, value: a.lb, step: 5, unit: "lb" } });
  return { sets, id: sets.id, labels, skip: "Skip", nudges, added: true };
}

// The plan as edited: swaps renamed, set counts changed, added moves in after the move they follow.
export function applyEdits(runner, edits) {
  if (!runner || editsEmpty(edits)) return runner;
  let moves = [...runner.moves];
  for (const a of edits.added || []) {
    const m = addedMove(a);
    // After its anchor and after any move added there before it.
    let i = (moves.findIndex((x) => tagOf(x) === a.after) >= 0 ? moves.findIndex((x) => tagOf(x) === a.after) : moves.length - 1) + 1;
    while (i < moves.length && (edits.added || []).some((x) => x.tag === tagOf(moves[i]) && x.after === a.after)) i++;
    moves.splice(Math.min(i, moves.length), 0, m);
  }
  moves = moves.map((m) => {
    const tag = tagOf(m);
    let out = m;
    // The cue and the load call were for the old move.
    if (edits.swaps?.[tag]) out = { ...out, sets: { ...out.sets, props: { ...out.sets.props, title: edits.swaps[tag], body: undefined, why: undefined } } };
    const n = edits.sets?.[tag];
    if (n != null && n !== out.labels.length) out = { ...out, labels: Array.from({ length: Math.max(1, Math.min(n, 12)) }, (_, i) => `Set ${i + 1}`) };
    return out;
  });
  return {
    ...runner,
    moves,
    absorbed: new Set(moves.flatMap((mv) => mv.nudges.map((n) => n.id))),
    move: (id) => moves.find((mv) => mv.id === id) || null,
  };
}

// One line per change, in move order: what the plan's `edits` answer says.
export function changesOf(runner, progress) {
  const e = progress.edits;
  if (!runner || editsEmpty(e)) return [];
  const live = applyEdits(runner, e);
  const out = [];
  for (const m of live.moves) {
    const tag = tagOf(m);
    const base = runner.moves.find((x) => tagOf(x) === tag);
    const t = progress.ticked[m.id] || [];
    const skipped = !!m.skip && t.length === 1 && t[0] === m.skip;
    const a = (e.added || []).find((x) => x.tag === tag);
    if (a) {
      if (skipped) continue;
      const reps = progress.values[`${a.tag}-reps`] ?? a.reps;
      const lbv = progress.values[`${a.tag}-lb`] ?? a.lb;
      out.push(`Added ${nameOf(m)} ${m.labels.length}x${fmt(reps)}${lbv != null ? ` at ${fmt(lbv)} lb` : ""}`);
      continue;
    }
    if (!base) continue;
    if (e.swaps?.[tag]) out.push(`Swapped ${nameOf(base)} for ${e.swaps[tag]}`);
    // A skip is in the move's own answer (its sets pick says Skip).
    if (skipped) continue;
    if (m.labels.length !== base.labels.length) out.push(`${nameOf(m)}: ${m.labels.length} sets (was ${base.labels.length})`);
    const r = repsNudge(base);
    if (e.reps?.[tag] != null && r) {
      const secs = String(r.id).endsWith("-secs");
      const was = typeof r.props?.value === "number" ? fmt(r.props.value) : "?";
      out.push(secs ? `${nameOf(m)}: ${fmt(e.reps[tag])}s (was ${was}s)` : `${nameOf(m)}: ${fmt(e.reps[tag])} reps (was ${was})`);
    }
    const w = weightNudge(base);
    if (e.lb?.[tag] != null && w) {
      const was = typeof w.props?.value === "number" ? fmt(w.props.value) : "?";
      out.push(`${nameOf(m)}: ${fmt(e.lb[tag])} lb (was ${was} lb)`);
    }
  }
  return out;
}

// Change the plan mid-session: `f` edits a copy of the edits, an edited number becomes the move's number from here on
// (undone, it is the plan's again), and sets ticked past a cut are dropped. An added move keeps its own numbers, so the
// change list says "Added Lunge 4x12", not a change on top. Returns the new progress.
export function editPlan(runner, progress, f) {
  const before = progress.edits || emptyEdits();
  const e = structuredClone({ ...emptyEdits(), ...before });
  f(e);
  // Back to the plan's own number: no change left to report.
  for (const m of runner.moves) {
    const tag = tagOf(m);
    if (e.sets[tag] === m.labels.length) delete e.sets[tag];
    const r = repsNudge(m), w = weightNudge(m);
    if (r && e.reps[tag] === r.props?.value) delete e.reps[tag];
    if (w && e.lb[tag] === w.props?.value) delete e.lb[tag];
  }
  for (const a of e.added) {
    if (e.sets[a.tag] != null) { a.sets = e.sets[a.tag]; delete e.sets[a.tag]; }
    if (e.reps[a.tag] != null) { a.reps = e.reps[a.tag]; delete e.reps[a.tag]; }
    if (e.lb[a.tag] != null) { a.lb = e.lb[a.tag]; delete e.lb[a.tag]; }
    delete e.swaps[a.tag];
  }
  const next = { ...progress, edits: editsEmpty(e) ? null : e, ticked: { ...progress.ticked }, values: { ...progress.values } };
  const num = (ed, tag, k) => (ed.added || []).find((a) => a.tag === tag)?.[k === "reps" ? "reps" : "lb"] ?? ed[k]?.[tag];
  for (const m of applyEdits(runner, next.edits).moves) {
    const tag = tagOf(m);
    if (next.ticked[m.id]) next.ticked[m.id] = next.ticked[m.id].filter((x) => m.labels.includes(x) || x === m.skip);
    const r = repsNudge(m), w = weightNudge(m);
    if (r && num(before, tag, "reps") !== num(e, tag, "reps")) next.values[r.id] = num(e, tag, "reps") ?? r.props?.value;
    if (w && num(before, tag, "lb") !== num(e, tag, "lb")) next.values[w.id] = num(e, tag, "lb") ?? w.props?.value;
  }
  return next;
}

// The common edits, as the sheet offers them. Each returns the new progress.
export const swapMove = (runner, progress, move, name) => {
  const to = String(name).trim();
  if (!to) return progress;
  const tag = tagOf(move);
  const base = runner.moves.find((x) => tagOf(x) === tag);
  return editPlan(runner, progress, (e) => {
    const a = e.added.find((x) => x.tag === tag);
    if (a) { a.name = to; return; }
    if (base && to === nameOf(base)) delete e.swaps[tag]; else e.swaps[tag] = to;
  });
};
export const setSets = (runner, progress, move, n) => editPlan(runner, progress, (e) => { e.sets[tagOf(move)] = Math.max(1, Math.min(12, n)); });
export const setReps = (runner, progress, move, v) => editPlan(runner, progress, (e) => { e.reps[tagOf(move)] = v; });
export const setWeight = (runner, progress, move, v) => editPlan(runner, progress, (e) => { e.lb[tagOf(move)] = v; });
export function addMove(runner, progress, move, name) {
  const nm = String(name).trim();
  if (!nm) return progress;
  const timed = /plank|hold/i.test(nm);
  return editPlan(runner, progress, (e) => { e.added.push({ tag: nextTag(e), name: nm, sets: 3, reps: timed ? 30 : 10, lb: null, after: tagOf(move) }); });
}
// Skip the move (its sets pick says Skip), or take the skip back. A move with no way out has no skip.
export const skipMove = (progress, move) => (move.skip ? toggle(progress, move.skip, move).progress : progress);
export const isSkipped = (progress, move) => !!move.skip && (progress.ticked[move.id] || []).includes(move.skip);

// The steps of a plan with the added moves drawn in after the move they follow (and after earlier adds there).
export function withAdded(steps, edits) {
  const out = [...steps];
  for (const a of edits?.added || []) {
    const step = addedMove(a).sets;
    let i = out.findIndex((s) => s.id === `${a.after}-sets`);
    i = (i >= 0 ? i : out.length - 1) + 1;
    while (i < out.length && (edits.added || []).some((x) => out[i].id === `${x.tag}-sets` && x.after === a.after)) i++;
    out.splice(i, 0, step);
  }
  return out;
}

// What the browser is playing, as a strip would show it: null when nothing is (no strip, no dead control). `audio` is a
// media element on the page, `session` the page's Media Session, `handlers` the actions the page registered on it. A
// button shows only where there is something behind it: next needs a "nexttrack" handler.
export function nowPlaying(session, audio, handlers = {}) {
  const md = session?.metadata;
  const playing = session?.playbackState === "playing" || (!!audio && !audio.paused && !audio.ended);
  const paused = session?.playbackState === "paused" || (!!audio && audio.paused && audio.currentTime > 0 && !audio.ended);
  if (!playing && !paused) return null;
  const canToggle = !!audio || !!(playing ? handlers.pause : handlers.play);
  return { title: md?.title || audio?.title || "Music", artist: md?.artist || "", playing, canToggle, canNext: !!handlers.nexttrack };
}
