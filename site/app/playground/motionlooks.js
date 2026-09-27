"use client";

// Motion looks (spec/YL.md section 4 theme and section 5 Stage motion,
// YUI-123): the person says how an agent moves, in words, and the agent saves
// it as a look, one `theme` line with pace, ease, enter and pulse. Two agents
// whose looks were said in words play the same turn side by side; a box turns
// a new description into a look (motion.mjs wordsLook, a small rule table, no
// model call) and the stage moves that way at once. Reduce Motion holds both
// stages still.

import { useMemo, useState } from "react";
import { lookLine, lookWords, motionLook, stageMood, wordsLook } from "../../lib/yl/motion.mjs";
import { ScreenCtx } from "./science";
import { AGENTS, readReply, Stage, useReduced, useTurn } from "./stagemotion";
import "./stagemotion.css";

const WHO = ["Coach", "Sage"];
const FIRST = { Coach: "Heavy and punchy", Sage: "Drifts like water" };
const IDEAS = ["Heavy and punchy", "Drifts like water", "Quick and crisp", "Playful, a bit bouncy", "Serious, no bounce", "Slow like a sleepy cat"];
const STEPS = { listen: "Listening", think: "Thinking", work: "Working", found: "Found it", done: "Answer", ask: "Asking" };

export function MotionLooksDemo({ text }) {
  const reply = useMemo(() => readReply(text), [text]);
  const reducedOS = useReduced();
  const [still, setStill] = useState(false);
  const reduced = reducedOS || still;
  const [said, setSaid] = useState(FIRST);
  const [who, setWho] = useState("Coach");
  const [draft, setDraft] = useState("");
  const [note, setNote] = useState(null);
  const [turn, replay] = useTurn(reply, true);

  // What each agent saved: its character plus the keys its words gave.
  const saved = (n) => ({ motion: AGENTS[n].motion, ...(wordsLook(said[n])?.look || {}) });
  const lookOf = (n) => motionLook(saved(n), null, reduced);
  const heard = wordsLook(draft);

  const say = (words) => {
    const r = wordsLook(words);
    if (!r) {
      setNote({ bad: true, text: "No motion words in that yet. Try heavy, floaty, quick, playful or still." });
      return;
    }
    setSaid((x) => ({ ...x, [who]: words }));
    setNote({ text: `Heard ${r.heard.join(", ")}. ${who} saves it as its look and plays the turn again.` });
    setDraft("");
    replay();
  };

  const ctx = { nodes: reply.nodes, tables: {}, data: {}, write: () => {}, agent: "Yui", screen: "full", dispatch: () => {}, fold: () => {}, closeStage: () => {} };
  const mood = stageMood(turn).mood;

  return (
    <ScreenCtx.Provider value={ctx}>
      <div className="mo-app">
        <div className="mo-wrap">
          <div className="mo-title">Say how each agent moves</div>
          <div className="mo-sub">Same turn, two looks. Each one came from a few words.</div>
          <div className="mo-pair">
            {WHO.map((n) => (
              <Stage key={n} agent={AGENTS[n]} look={lookOf(n)} reply={reply} turn={turn} compact tag={reduced ? "still" : "words"} />
            ))}
          </div>
          <div className="mo-strip">
            {Object.entries(STEPS).map(([m, w]) => <span key={m} className={mood === m ? "on" : ""}>{w}</span>)}
          </div>
          <div className="mo-pair">
            {WHO.map((n) => {
              const l = lookOf(n);
              return (
                <div key={n} className="ml-said" style={{ "--mo-c": AGENTS[n].c }}>
                  <div className="ml-quote">&ldquo;{said[n]}&rdquo;</div>
                  <div className="mo-note">{lookWords(l)}</div>
                  <code className="ml-line">{lookLine(saved(n))}</code>
                </div>
              );
            })}
          </div>
          <form className="mo-words ml-form" style={{ "--mo-c": AGENTS[who].c }} onSubmit={(e) => { e.preventDefault(); say(draft); }}>
            <div className="mo-chips tight">
              {WHO.map((n) => (
                <button type="button" key={n} className={`mo-chip ${who === n ? "on" : ""}`} style={{ "--mo-c": AGENTS[n].c }}
                  onClick={() => { setWho(n); setNote(null); }}>{n}</button>
              ))}
            </div>
            <label className="mo-sub" htmlFor="ml-words">How should {who} move?</label>
            <div className="mo-wordsrow">
              <input id="ml-words" value={draft} onChange={(e) => { setDraft(e.target.value); setNote(null); }} placeholder="Heavy and punchy" autoComplete="off" />
              <button className="mo-btn" disabled={!draft.trim()}>Try it</button>
            </div>
            {draft.trim() && heard ? <code className="ml-line">{lookLine(heard.look)}</code> : null}
            {note ? <div className={`mo-note ${note.bad ? "ml-bad" : ""}`} role="status">{note.text}</div> : null}
            <div className="mo-chips tight">
              {IDEAS.map((w) => <button type="button" key={w} className="mo-chip ml-idea" onClick={() => say(w)}>{w}</button>)}
            </div>
          </form>
          <label className="mo-switch">
            <span>Show the Reduce Motion version</span>
            <input type="checkbox" checked={reduced} disabled={reducedOS} onChange={() => setStill(!still)} />
          </label>
          {reducedOS ? <div className="mo-note">Your device asks for Reduce Motion, so both stages hold still.</div> : null}
          <button className="mo-btn wide" style={{ "--mo-c": AGENTS[who].c }} onClick={replay}>Play the turn again</button>
        </div>
      </div>
    </ScreenCtx.Provider>
  );
}
