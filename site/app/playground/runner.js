"use client";
// Arnold's workout runner on the web (YUI-246), the twin of Presets/WorkoutRunner.swift `RunnerMoveView`. One move
// full size: what to do, its sets to tick, reps and weight to nudge, the rest timer after a set, and a mic that hears
// "done". The logic is lib/web/runner.mjs (the same rules as the app); this file draws it and keeps the place on the
// device. The rest keeps true time from its end moment, so a tab in the background still rings on time; the screen
// stays on while it runs (Wake Lock).
import { useCallback, useEffect, useRef, useState } from "react";
import { createListener, speechApi } from "../../lib/web/voice.mjs";
import {
  answersOf, clearProgress, emptyProgress, loadProgress, nudged, restAdd, restLabel, restLeft, restProgress, restStart, saveProgress,
  targetOf, tickNext, toggle, voiceDone,
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
  const tap = (label) => { const o = toggle(progress, label, move); set(o.progress, o.went && label !== move.skip); };

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
      {rest ? (
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
