"use client";
// Arnold's workout runner on the web (YUI-246), the twin of Presets/WorkoutRunner.swift `RunnerMoveView`. One move
// full size: what to do, its sets to tick, reps and weight to nudge, the rest timer after a set, and a mic that hears
// "done". The logic is lib/web/runner.mjs (the same rules as the app); this file draws it and keeps the place on the
// device. The rest keeps true time from its end moment, so a tab in the background still rings on time; the screen
// stays on while it runs (Wake Lock).
import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { createListener, speechApi } from "../../lib/web/voice.mjs";
import {
  EXTRAS, addMove, alternates, answersOf, applyEdits, changesOf, chipsAround, clearProgress, emptyProgress, fmt, hearRepsWeight, isSkipped, loadProgress,
  logSet, logStart, logTitle, nameOf, nowPlaying, nudged, repsNudge, restAdd, restLabel, restLeft, restProgress, restStart, saveProgress, setReps, setSets,
  setWeight, skipMove, swapMove, tagOf, targetOf, tickNext, toggle, voiceDone, weightNudge,
} from "../../lib/web/runner.mjs";
import { useTabTitle, useWakeLock } from "./keepawake";

// The runner's progress, kept per plan id on this device. `runner` is runnerPlan(steps) or null.
export function useRunner(runner, planId) {
  const [progress, setProgress] = useState(emptyProgress);
  const loaded = useRef(false);
  useEffect(() => {
    if (!runner) return;
    const kept = loadProgress(planId);
    if (kept) setProgress(kept);
    loaded.current = true;
  }, [!!runner, planId]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { if (runner && loaded.current) saveProgress(planId, progress); }, [progress]); // eslint-disable-line react-hooks/exhaustive-deps
  return {
    progress,
    setProgress,
    answers: runner ? answersOf(runner, progress) : {},
    forget: () => { clearProgress(planId); setProgress(emptyProgress()); },
  };
}

const beep = () => {
  try {
    const C = window.AudioContext || window.webkitAudioContext;
    const ctx = beep.ctx || (beep.ctx = new C());
    const o = ctx.createOscillator(); const g = ctx.createGain();
    o.frequency.value = 880; g.gain.setValueAtTime(0.15, ctx.currentTime); g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.4);
    o.connect(g).connect(ctx.destination); o.start(); o.stop(ctx.currentTime + 0.4);
  } catch { /* no sound here */ }
};

// `runner` is the plan as edited, `base` as the agent sent it (what an edit is measured against).
export function RunnerMove({ move, runner, base = runner, step, progress, setProgress, active = true }) {
  const [editing, setEditing] = useState(false);
  const anchor = useRef(null);
  const [now, setNow] = useState(() => Date.now());
  const [listening, setListening] = useState(false);
  const [mic, setMic] = useState(typeof window === "undefined" ? "off" : speechApi() ? "idle" : "none"); // idle | on | denied | none
  const rang = useRef(false);
  const heard = useRef(0);
  const ear = useRef(null);
  const p = useRef(progress);
  p.current = progress;
  const rest = progress.rest;
  const left = rest ? restLeft(rest, now) : 0;
  const ticked = progress.ticked[move.id] || [];
  const tag = String(move.id).endsWith("-sets") ? String(move.id).slice(0, -5) : move.id;

  // The rest ticks on the wall clock: a look after the tab was away reads the true time left.
  useEffect(() => {
    if (!rest) return undefined;
    const look = () => setNow(Date.now());
    look();
    const t = setInterval(look, 500);
    document.addEventListener("visibilitychange", look);
    return () => { clearInterval(t); document.removeEventListener("visibilitychange", look); };
  }, [rest]);
  useEffect(() => { if (rest && left === 0 && !rang.current) { rang.current = true; beep(); } }, [rest, left]);
  useTabTitle(rest && left > 0 && active ? (base) => `Rest ${restLabel(left)} · ${base}` : null, rest && left > 0 ? left : "off");
  useWakeLock(active && (!!rest || listening));

  const startRest = () => { rang.current = false; setNow(Date.now()); return restStart(runner.rest, Date.now()); };
  const set = (next, went) => setProgress({ ...next, rest: went ? startRest() : next.rest });
  // A set tapped asks what was done (YUI-304); a ticked set or Skip toggles as before.
  const [logging, setLogging] = useState(null); // the set label being logged, or null
  const tap = (label) => {
    if (label === move.skip || ticked.includes(label)) { setLogging(null); const o = toggle(progress, label, move); set(o.progress, o.went && label !== move.skip); return; }
    setLogging(label);
  };
  const logged = (nums) => { setLogging(null); rang.current = false; setNow(Date.now()); setProgress(logSet(runner, progress, move, logging, nums, Date.now())); };

  // "done" out loud ticks the next set, once per word heard.
  const stop = useCallback(() => { ear.current?.cancel(); ear.current = null; setListening(false); }, []);
  useEffect(() => { if (!active) stop(); return stop; }, [active, stop]);
  const talk = async () => {
    if (listening) { stop(); return; }
    heard.current = 0;
    const l = createListener({
      onWords: (words) => {
        const n = voiceDone(words);
        if (n <= heard.current) return;
        let cur = p.current; let went = false;
        for (let i = heard.current; i < n; i++) { const o = tickNext(cur, move); cur = o.progress; went = went || o.went; }
        heard.current = n;
        setProgress({ ...cur, rest: went ? startRest() : cur.rest });
      },
      onError: (e) => { setMic(e === "denied" ? "denied" : "idle"); stop(); },
      onEnd: () => { ear.current = null; setListening(false); },
    });
    ear.current = l;
    try { await l.start(); setListening(true); } catch { setMic("none"); ear.current = null; }
  };

  const target = (i) => targetOf(runner, move, progress);
  const props = move.sets.props || {};
  return (
    <div className="yl-block yl-runner" data-testid={`runner-${tag}`}>
      {props.tag ? <span className="rn-tag">{props.tag}</span> : null}
      <div className="rn-titlerow">
        <div className="rn-title">{props.title || props.q || props.prompt || tag}</div>
        <button className="rn-edit" data-testid={`runner-${tag}-edit`} onClick={() => setEditing(true)}>Edit</button>
      </div>
      <span ref={anchor} hidden />
      {editing ? <RunnerEditSheet base={base} move={move} progress={progress} setProgress={setProgress} anchor={anchor} onClose={() => setEditing(false)} /> : null}
      {props.body ? <p className="rn-body">{props.body}</p> : null}
      <div className="rn-sets">
        {move.labels.map((label, i) => {
          const on = ticked.includes(label);
          return (
            <button key={label} className={`rn-set${on ? " on" : ""}`} aria-pressed={on} data-testid={`runner-${tag}-set-${i + 1}`} onClick={() => tap(label)}>
              <span className="rn-check" aria-hidden="true">{on ? "✓" : ""}</span>
              <b>{label}</b>
              <span className="rn-target">{target(i)}</span>
            </button>
          );
        })}
      </div>
      {logging ? <RunnerLog move={move} progress={progress} label={logging} tag={tag} onLog={logged} onCancel={() => setLogging(null)} /> : null}
      {rest && !logging ? (
        <div className="rn-rest" data-testid={`runner-${tag}-rest`} role="timer" aria-live="off">
          <span className="rn-ring" style={{ "--p": Math.round(restProgress(rest, now) * 100) }} aria-hidden="true" />
          <span className="rn-resttext"><small>{left > 0 ? "Rest" : "Rest done"}</small><b>{left > 0 ? restLabel(left) : "Next set"}</b></span>
          {left > 0 ? <button data-testid={`runner-${tag}-rest-more`} onClick={() => setProgress({ ...progress, rest: restAdd(rest, 15, Date.now()) })}>+15s</button> : null}
          <button data-testid={`runner-${tag}-rest-skip`} onClick={() => setProgress({ ...progress, rest: null })}>{left > 0 ? "Skip rest" : "Hide"}</button>
        </div>
      ) : null}
      <div className="rn-row">
        {mic !== "none" ? (
          <button className={`rn-voice${listening ? " on" : ""}`} data-testid={`runner-${tag}-voice`} onClick={talk} aria-pressed={listening} disabled={mic === "denied"}>
            {listening ? "Listening for done" : mic === "denied" ? "Mic is off" : "Say done"}
          </button>
        ) : null}
        {move.skip ? (
          <button className={`rn-skip${ticked.includes(move.skip) ? " on" : ""}`} data-testid={`runner-${tag}-skip`} aria-pressed={ticked.includes(move.skip)} onClick={() => tap(move.skip)}>{move.skip}</button>
        ) : null}
      </div>
      {move.nudges.map((n) => {
        const lo = Number.isFinite(n.props?.min) ? n.props.min : 0;
        const hi = Math.max(Number.isFinite(n.props?.max) ? n.props.max : 100, lo + 1);
        const stepBy = Math.max(Number.isFinite(n.props?.step) ? n.props.step : 1, 0.5);
        const v = progress.values[n.id] ?? (typeof n.props?.value === "number" ? n.props.value : lo);
        const key = String(n.id).endsWith("-lb") ? "lb" : String(n.id).endsWith("-secs") ? "secs" : "reps";
        const what = key === "lb" ? "Weight" : key === "secs" ? "Seconds" : "Reps";
        return (
          <div key={n.id} className="rn-nudge">
            <span>{what}</span>
            <button aria-label={`Less ${what.toLowerCase()}`} data-testid={`runner-${tag}-${key}-minus`} disabled={v <= lo} onClick={() => setProgress(nudged(progress, n.id, Math.max(lo, v - stepBy)))}>−</button>
            <b data-testid={`runner-${tag}-${key}-value`}>{Number.isInteger(v) ? v : Number(v.toFixed(1))}{n.props?.unit ? ` ${n.props.unit}` : ""}</b>
            <button aria-label={`More ${what.toLowerCase()}`} data-testid={`runner-${tag}-${key}-plus`} disabled={v >= hi} onClick={() => setProgress(nudged(progress, n.id, Math.min(hi, v + stepBy)))}>+</button>
          </div>
        );
      })}
    </div>
  );
}

// What the set just done was: reps (or seconds) and weight, chips around the plan's number, a stepper and a mic.
function RunnerLog({ move, progress, label, tag, onLog, onCancel }) {
  const start = logStart(move, progress);
  const [reps, setReps] = useState(start.reps);
  const [weight, setWeight] = useState(start.weight);
  const [mic, setMic] = useState(typeof window === "undefined" ? "none" : speechApi() ? "idle" : "none");
  const ear = useRef(null);
  const stop = useCallback(() => { ear.current?.cancel(); ear.current = null; setMic((m) => (m === "on" ? "idle" : m)); }, []);
  useEffect(() => stop, [stop]);
  const talk = async () => {
    if (mic === "on") { stop(); return; }
    const l = createListener({
      onWords: (words) => { const h = hearRepsWeight(words); if (!h) return; setReps(Math.min(start.repsMax, Math.max(start.repsMin, h.reps))); if (h.weight != null && start.weight != null) setWeight(h.weight); },
      onError: (e) => { setMic(e === "denied" ? "denied" : "idle"); },
      onEnd: () => { ear.current = null; setMic((m) => (m === "on" ? "idle" : m)); },
    });
    ear.current = l;
    try { await l.start(); setMic("on"); } catch { setMic("none"); ear.current = null; }
  };
  const show = (v) => (Number.isInteger(v) ? v : Number(v.toFixed(1)));
  const row = (what, key, value, setValue, step, lo, hi, unit) => (
    <div className="rn-logrow">
      <div className="rn-nudge">
        <span>{what}</span>
        <button aria-label={`Less ${what.toLowerCase()}`} data-testid={`runner-${tag}-log-${key}-minus`} disabled={value <= lo} onClick={() => setValue(Math.max(lo, value - step))}>−</button>
        <b data-testid={`runner-${tag}-log-${key}-value`}>{show(value)}{unit}</b>
        <button aria-label={`More ${what.toLowerCase()}`} data-testid={`runner-${tag}-log-${key}-plus`} disabled={value >= hi} onClick={() => setValue(Math.min(hi, value + step))}>+</button>
      </div>
      <div className="rn-chips">
        {chipsAround(key === "reps" ? start.reps : start.weight, step, lo, hi).map((v) => (
          <button key={v} className={`rn-chip${v === value ? " on" : ""}`} aria-pressed={v === value} data-testid={`runner-${tag}-log-${key}-chip-${show(v)}`} onClick={() => setValue(v)}>{show(v)}</button>
        ))}
      </div>
    </div>
  );
  return (
    <div className="rn-log" data-testid={`runner-${tag}-log`} role="group" aria-label="Log the set">
      <div className="rn-logtitle" data-testid={`runner-${tag}-log-title`}>{logTitle(move, label)}</div>
      {row(start.timed ? "Seconds" : "Reps", "reps", reps, setReps, start.repsStep, start.repsMin, start.repsMax, start.timed ? "s" : "")}
      {start.weight != null ? row("Weight", "lb", weight, setWeight, start.weightStep, start.weightMin, start.weightMax, " lb") : null}
      {mic !== "none" ? (
        <button className={`rn-voice${mic === "on" ? " on" : ""}`} data-testid={`runner-${tag}-log-voice`} aria-pressed={mic === "on"} disabled={mic === "denied"} onClick={talk}>
          {mic === "on" ? "Listening" : mic === "denied" ? "Mic is off" : "Say reps and weight"}
        </button>
      ) : null}
      <div className="rn-row">
        <button className="rn-logdone" data-testid={`runner-${tag}-log-done`} onClick={() => onLog({ reps, weight: start.weight != null ? weight : null })}>Log set</button>
        <button className="rn-skip" data-testid={`runner-${tag}-log-cancel`} onClick={onCancel}>Not yet</button>
      </div>
    </div>
  );
}

// ---- edits on the fly (YUI-309, the web twin of WorkoutEdits.swift's RunnerEditSheet) ----
// Edit the move in focus without leaving the runner: swap it, its sets, reps and weight, add a move after it, skip it.
function RunnerEditSheet({ base, move, progress, setProgress, anchor, onClose }) {
  // Drawn over the whole screen, not inside the page that holds the move (a moving page would clip it).
  const [host, setHost] = useState(null);
  useEffect(() => { setHost((anchor.current && anchor.current.closest(".screen")) || document.body); }, [anchor]);
  useEffect(() => { const k = (e) => { if (e.key === "Escape") onClose(); }; window.addEventListener("keydown", k); return () => window.removeEventListener("keydown", k); }, [onClose]);
  const [other, setOther] = useState("");
  const [adding, setAdding] = useState("");
  const live = applyEdits(base, progress.edits);
  const m = live.move(move.id) || move;
  const tag = tagOf(m);
  const original = base.moves.find((x) => tagOf(x) === tag);
  const added = (progress.edits?.added || []).some((a) => a.tag === tag);
  const apply = (next) => setProgress(next);
  const rn = repsNudge(m), wn = weightNudge(m);
  const timed = !!rn && String(rn.id).endsWith("-secs");
  const val = (n) => (n ? progress.values[n.id] ?? (typeof n.props?.value === "number" ? n.props.value : null) : null);
  const reps = val(rn), lb = val(wn);
  const repsStep = Math.max(Number.isFinite(rn?.props?.step) ? rn.props.step : timed ? 5 : 1, 1);
  const lbStep = Math.max(Number.isFinite(wn?.props?.step) ? wn.props.step : 5, 0.5);
  const stepper = (what, id, value, less, more) => (
    <div className="rn-nudge rn-editrow">
      <span>{what}</span>
      <button aria-label={`Less ${what.toLowerCase()}`} data-testid={`runner-edit-${id}-minus`} disabled={!less} onClick={() => less && less()}>−</button>
      <b data-testid={`runner-edit-${id}-value`}>{value}</b>
      <button aria-label={`More ${what.toLowerCase()}`} data-testid={`runner-edit-${id}-plus`} disabled={!more} onClick={() => more && more()}>+</button>
    </div>
  );
  const name = nameOf(m);
  const options = alternates(original ? nameOf(original) : name).filter((o) => o !== name).slice(0, 3);
  const slug = (o) => o.toLowerCase().replace(/ /g, "-");
  const lines = changesOf(base, progress);
  const field = (hint, text, setText, id, go, run) => (
    <div className="rn-field">
      <input value={text} placeholder={hint} data-testid={id} aria-label={hint} onChange={(e) => setText(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter" && text.trim()) { run(); setText(""); } }} />
      {text.trim() ? <button className="rn-chip on" data-testid={`${id}-go`} onClick={() => { run(); setText(""); }}>{go}</button> : null}
    </div>
  );
  if (!host) return null;
  return createPortal(
    <div className="rn-sheetwrap" data-testid="runner-edit">
      <button className="rn-scrim" aria-label="Back to it" onClick={onClose} />
      <div className="rn-sheet" role="dialog" aria-modal="true" aria-label={`Edit ${name}`}>
        <div className="rn-sheethead">
          <h3 data-testid="runner-edit-title">Edit {name}</h3>
          <button className="rn-logdone rn-back" data-testid="runner-edit-close" onClick={onClose}>Back to it</button>
        </div>
        {stepper("Sets", "sets", m.labels.length,
          m.labels.length > 1 ? () => apply(setSets(base, progress, m, m.labels.length - 1)) : null,
          m.labels.length < 12 ? () => apply(setSets(base, progress, m, m.labels.length + 1)) : null)}
        {reps != null ? stepper(timed ? "Seconds" : "Reps", "reps", `${fmt(reps)}${timed ? "s" : ""}`,
          reps - repsStep >= 1 ? () => apply(setReps(base, progress, m, reps - repsStep)) : null, () => apply(setReps(base, progress, m, reps + repsStep))) : null}
        {lb != null ? stepper("Weight", "lb", `${fmt(lb)} lb`,
          lb - lbStep >= 0 ? () => apply(setWeight(base, progress, m, lb - lbStep)) : null, () => apply(setWeight(base, progress, m, lb + lbStep))) : null}
        {added ? <p className="rn-note">Added in this session.</p> : null}
        <h4>Swap it for</h4>
        <div className="rn-chips rn-left">
          {original && nameOf(original) !== name && progress.edits?.swaps?.[tag] ? (
            <button className="rn-chip" data-testid="runner-edit-unswap" onClick={() => apply(swapMove(base, progress, m, nameOf(original)))}>Back to {nameOf(original)}</button>
          ) : null}
          {options.map((o) => <button key={o} className="rn-chip" data-testid={`runner-edit-swap-${slug(o)}`} onClick={() => apply(swapMove(base, progress, m, o))}>{o}</button>)}
        </div>
        {field("Something else", other, setOther, "runner-edit-swap-other", "Swap", () => apply(swapMove(base, progress, m, other)))}
        <h4>Add a move after it</h4>
        <div className="rn-chips rn-left">
          {EXTRAS.filter((x) => !live.moves.some((mv) => nameOf(mv) === x)).map((x) => (
            <button key={x} className="rn-chip" data-testid={`runner-edit-add-${x.toLowerCase()}`} onClick={() => apply(addMove(base, progress, m, x))}>+ {x}</button>
          ))}
        </div>
        {field("Another move", adding, setAdding, "runner-edit-add-other", "Add", () => apply(addMove(base, progress, m, adding)))}
        {m.skip ? (
          <button className={`rn-skip${isSkipped(progress, m) ? " on" : ""}`} data-testid="runner-edit-skip" aria-pressed={isSkipped(progress, m)} onClick={() => apply(skipMove(progress, m))}>
            {isSkipped(progress, m) ? "Take the skip back" : "Skip this move"}
          </button>
        ) : null}
        <div data-testid="runner-edit-changes">
          {lines.length ? <><h4>Changed</h4>{lines.map((l) => <div key={l} className="rn-change">✎ {l}</div>)}</> : null}
        </div>
      </div>
    </div>,
    host,
  );
}

// ---- music (YUI-309) ----
// The browser cannot drive Apple Music. What it can: a page's own media. The strip shows when this page has audio
// or video playing or paused mid-way (a media element, or a Media Session a page set up), with play or pause and, only
// where the page registered a next-track handler, next. Nothing playing: no strip, nothing dead on screen.
const handlers = {};
function trackSession() {
  if (typeof navigator === "undefined" || !navigator.mediaSession || navigator.mediaSession.__yuiTracked) return;
  const ms = navigator.mediaSession;
  const orig = ms.setActionHandler.bind(ms);
  ms.setActionHandler = (action, fn) => { if (fn) handlers[action] = fn; else delete handlers[action]; return orig(action, fn); };
  ms.__yuiTracked = true;
}
const mediaEl = () => {
  const all = typeof document === "undefined" ? [] : [...document.querySelectorAll("audio, video")];
  return all.find((el) => !el.paused && !el.ended) || all.find((el) => el.paused && el.currentTime > 0 && !el.ended) || null;
};
export function useNowPlaying() {
  const [np, setNp] = useState(null);
  useEffect(() => {
    trackSession();
    const look = () => setNp(nowPlaying(navigator.mediaSession, mediaEl(), handlers));
    look();
    const t = setInterval(look, 1000);
    for (const ev of ["play", "pause", "ended"]) document.addEventListener(ev, look, true);
    return () => { clearInterval(t); for (const ev of ["play", "pause", "ended"]) document.removeEventListener(ev, look, true); };
  }, []);
  return np;
}
export function MusicStrip() {
  const np = useNowPlaying();
  if (!np) return null;
  const toggle = () => {
    const el = mediaEl();
    if (el) { if (el.paused) el.play(); else el.pause(); return; }
    (np.playing ? handlers.pause : handlers.play)?.();
  };
  return (
    <div className="rn-music" data-testid="runner-music" role="group" aria-label="Now playing">
      <span className="rn-musicicon" aria-hidden="true">{np.playing ? "♫" : "♪"}</span>
      <span className="rn-musictext"><b data-testid="runner-music-title">{np.title}</b>{np.artist ? <small>{np.artist}</small> : null}</span>
      {np.canToggle ? <button data-testid="runner-music-play" aria-label={np.playing ? "Pause music" : "Play music"} onClick={toggle}>{np.playing ? "❚❚" : "▶"}</button> : null}
      {np.canNext ? <button data-testid="runner-music-next" aria-label="Next song" onClick={() => handlers.nexttrack?.()}>▶❚</button> : null}
    </div>
  );
}
