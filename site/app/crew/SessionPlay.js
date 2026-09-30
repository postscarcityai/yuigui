"use client";
// Arnold's timed workout on /crew (SITE-141, the web twin of YUI-220): Start today runs a short session on its own
// clock. A work set, the rest countdown with the cue and Next, the next move, no taps between, a finish card.
// The steps and the words are lib/first-plan-play.mjs (sessionFor). Reduce Motion gets a still countdown.
import { useEffect, useMemo, useState } from "react";
import { DEMO, FAIL_LINE, sessionFor } from "../../lib/first-plan-play.mjs";

const clock = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

export default function SessionPlay({ answers, reduced, onAgain }) {
  const session = useMemo(() => sessionFor(answers), [answers]);
  const steps = session.steps;
  const [i, setI] = useState(0);
  const [t0s] = useState(() => Date.now()); // the whole session's start
  const [t0, setT0] = useState(() => Date.now());
  const [now, setNow] = useState(() => Date.now());
  const [paused, setPaused] = useState(null); // the moment Pause was tapped
  const [done, setDone] = useState(null); // { sets, secs } on the finish card

  const step = steps[i];
  const go = () => {
    if (i + 1 >= steps.length) {
      const sets = steps.filter((s) => s.kind !== "rest").length;
      setDone({ sets, secs: Math.round((Date.now() - t0s) / 1000) });
    } else { setI(i + 1); setT0(Date.now()); }
  };

  useEffect(() => {
    if (done || paused) return undefined;
    const id = setInterval(() => setNow(Date.now()), 200);
    return () => clearInterval(id);
  }, [done, paused]);

  const elapsed = Math.max(0, Math.floor(((paused ?? now) - t0) / 1000));
  const left = step ? Math.max(0, step.seconds - elapsed) : 0;
  useEffect(() => {
    if (done || paused || !step) return;
    if (step.kind === "fail" ? elapsed >= DEMO.failAuto : left <= 0) go();
  });

  const pause = () => setPaused(Date.now());
  const resume = () => { setT0(t0 + (Date.now() - paused)); setPaused(null); setNow(Date.now()); };
  const skipRest = () => { setPaused(null); go(); };

  if (done) {
    return (
      <div className="ss ss-done" role="status">
        <h3 className="ss-big">Workout done</h3>
        <div className="ss-stats">
          <div><b>{done.sets} of {done.sets}</b><span>Sets done</span></div>
          <div><b>{clock(done.secs)}</b><span>Time</span></div>
        </div>
        <p className="ss-note">Logged. Nice work. This was the demo clock; the app runs your real sets and rests.</p>
        <button type="button" className="ss-btn ss-main" onClick={onAgain}>Start over</button>
      </div>
    );
  }
  const resting = step.kind === "rest", fail = step.kind === "fail";
  const label = resting ? "Rest" : fail ? "To failure" : "Work";
  const C = 2 * Math.PI * 54;
  const frac = fail || !step.seconds ? 1 : left / step.seconds;
  return (
    <div className={`ss ss-${step.kind}`}>
      <div className="ss-top">
        <span className="ss-badge" role="status" aria-label={label}>{label}</span>
        <span className="ss-where">Move {step.move + 1} of {step.of} · Set {step.set} of {step.sets}</span>
      </div>
      <div className="ss-clockwrap">
        {reduced ? null : (
          <svg className="ss-ring" viewBox="0 0 120 120" aria-hidden="true">
            <circle cx="60" cy="60" r="54" className="ss-track" />
            <circle cx="60" cy="60" r="54" className="ss-arc" strokeDasharray={C} strokeDashoffset={C * (1 - frac)} />
          </svg>
        )}
        <div className="ss-clock" aria-label={fail ? `${elapsed} seconds` : `${left} seconds left`}>{fail ? clock(elapsed) : clock(left)}</div>
      </div>
      <h3 className="ss-move">{resting ? "Rest" : step.name}</h3>
      {fail ? <p className="ss-cue ss-fail">{FAIL_LINE}</p> : null}
      {resting ? <p className="ss-next">{step.next}</p> : null}
      {step.cue ? <p className="ss-cue">{step.cue}</p> : null}
      <div className="ss-acts">
        {fail ? <button type="button" className="ss-btn ss-main" onClick={go}>Stop</button> : null}
        {resting ? <button type="button" className="ss-btn" onClick={skipRest}>Skip rest</button> : null}
        {!fail ? <button type="button" className="ss-btn" onClick={paused ? resume : pause}>{paused ? "Resume" : "Pause"}</button> : null}
      </div>
      <p className="ss-note">Demo clock: short sets, three moves.</p>
    </div>
  );
}
