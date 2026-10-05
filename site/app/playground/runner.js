"use client";
// Arnold's workout runner on the web (YUI-246), the twin of Presets/WorkoutRunner.swift `RunnerMoveView`. One move
// full size: what to do, its sets to tick, reps and weight to nudge, the rest timer after a set, and a mic that hears
// "done". The logic is lib/web/runner.mjs (the same rules as the app); this file draws it and keeps the place on the
// device. The rest keeps true time from its end moment, so a tab in the background still rings on time; the screen
// stays on while it runs (Wake Lock).
import { useCallback, useEffect, useRef, useState } from "react";
import { createListener, speechApi } from "../../lib/web/voice.mjs";
import {
  answersOf, chipsAround, clearProgress, emptyProgress, hearRepsWeight, loadProgress, logSet, logStart, logTitle, nudged, restAdd, restLabel, restLeft,
  restProgress, restStart, saveProgress, targetOf, tickNext, toggle, voiceDone,
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

export function RunnerMove({ move, runner, step, progress, setProgress, active = true }) {
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
      <div className="rn-title">{props.title || props.q || props.prompt || tag}</div>
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
