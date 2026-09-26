"use client";

// The working row (spec/YL.md section 5, YUI-63 step 2): a mock of the app's
// row while an agent works on a turn. It plays the turn: the person's
// message, the row with its working word, each `doing` line taking the
// word's place with a thin bar, then the reply replacing the row.

import { useCallback, useEffect, useRef, useState } from "react";
import { parse } from "../../lib/yl/yl.mjs";
import "./working.css";

// The app's first working word (ChatView.swift, WorkingNote.words).
const WORD = "Pondering";
// Seconds before the first doing, between doings, and after the last one.
const FIRST = 1.6, EVERY = 1.8, LAST = 1.6;

// The doing lines of a reply, in order, as the working row would get them.
export function doings(text) {
  return parse(text).filter((o) => o.op === "doing").map((o) => (o.props.off ? null : o.props));
}

// Plays the turn: `turn` is { doing, secs } while the agent works, null once
// the reply is in. `play()` starts it again from the top.
export function useWorkingTurn(text, on) {
  const [turn, setTurn] = useState(null);
  const timer = useRef(null);
  const play = useCallback(() => {
    clearInterval(timer.current);
    const steps = doings(text);
    const end = FIRST + steps.length * EVERY + LAST - EVERY;
    const t0 = Date.now();
    const tick = () => {
      const secs = (Date.now() - t0) / 1000;
      if (secs >= end) { clearInterval(timer.current); setTurn(null); return; }
      const n = secs < FIRST ? -1 : Math.min(steps.length - 1, Math.floor((secs - FIRST) / EVERY));
      setTurn({ doing: n < 0 ? null : steps[n], secs: Math.floor(secs) });
    };
    tick();
    timer.current = setInterval(tick, 200);
  }, [text]);
  useEffect(() => {
    if (on) play(); else { clearInterval(timer.current); setTurn(null); }
    return () => clearInterval(timer.current);
    // Plays once when the demo opens; Play the turn replays it after edits.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [on]);
  return [turn, play];
}

// One row: the agent's face, three dots, the words (or the working word) and
// the seconds, with a thin bar under them when the agent gave a step.
export function WorkingRow({ agent, color, doing, secs }) {
  const words = doing?.text || WORD;
  const bar = doing && doing.of ? Math.round((doing.step / doing.of) * 100) : null;
  const label = `${words} · ${secs}s`;
  return (
    <div className="wk-row" role="status" aria-label={`${agent}: ${label}`} style={{ "--wk": color }}>
      <span className="wk-face" style={{ background: color }} aria-hidden="true">{agent[0]}</span>
      <div className="wk-main">
        <div className="wk-line" aria-hidden="true">
          <span className="wk-dots"><i /><i /><i /></span>
          <span key={words} className="wk-words">{words}</span>
          <span className="wk-secs">· {secs}s</span>
        </div>
        {bar !== null ? (
          <div className="wk-bar" aria-hidden="true"><span style={{ width: `${bar}%` }} /></div>
        ) : null}
      </div>
    </div>
  );
}
