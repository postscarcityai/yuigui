"use client";

// Stage motion (spec/YL.md section 5, YUI-120 step 1): the stage moves with
// the agent. The mood comes from the turn (listen, think, work, found, done,
// ask, error; site/lib/yl/motion.mjs stageMood), the character from the
// agent's look (`theme motion=calm|bouncy|snappy`, motionLook). The same turn
// plays on two agents side by side, so the difference is the character alone.
//
// The reply is the editor's Yui Lines through the real parser, chunked by
// stageChunks and drawn by the real renderers: the motion sits on the stage's
// flexible layout and never replaces it. Reduce Motion gets the still look.

import { useEffect, useMemo, useRef, useState } from "react";
import { apply, initialState, parse } from "../../lib/yl/yl.mjs";
import { stageChunks } from "../../lib/yl/chunks.mjs";
import { CHARACTERS, motionLook, motionVars, stageMood, wordsLook } from "../../lib/yl/motion.mjs";
import { Render } from "./presets";
import { Group, groupNodes } from "./flows";
import { ScreenCtx } from "./science";
import { doings } from "./working";
import "./stagemotion.css";

export const STAGEMOTION_VIEWS = [
  ["side", "Side by side"],
  ["moods", "Every mood"],
  ["moves", "Hand-offs"],
  ["look", "The look"],
];

const ME = "Plan my runs this week";
export const AGENTS = {
  Coach: { name: "Coach", c: "#ff5a36", motion: "snappy" },
  Sage: { name: "Sage", c: "#3f9a6b", motion: "calm" },
  Yui: { name: "Yui", c: "#ff7e8a", motion: "bouncy" },
};
const WHAT = {
  bouncy: "springs in, a double beat",
  calm: "slow, floats, breathes long",
  snappy: "quick, sharp, a tick",
  custom: "from your words",
  still: "Reduce Motion: no movement",
};
const MOOD_WORDS = { idle: "Idle", listen: "Listening", think: "Thinking", work: "Working", found: "Found it", done: "Answer", ask: "Asking", error: "Error" };

export function readReply(text) {
  let s = initialState();
  for (const op of parse(text)) s = apply(s, op);
  const nodes = Object.values(s.screens).flat().sort((a, b) => a.seq - b.seq);
  const heads = new Map(groupNodes(nodes).filter((x) => x.group).map((x) => [x.key, x]));
  return { nodes, heads, ...stageChunks(nodes), doing: doings(text).filter(Boolean) };
}

export function useReduced() {
  const [r, setR] = useState(false);
  useEffect(() => {
    const m = window.matchMedia("(prefers-reduced-motion: reduce)");
    const on = () => setR(m.matches);
    on();
    m.addEventListener("change", on);
    return () => m.removeEventListener("change", on);
  }, []);
  return r;
}

// The shared turn. The agent's events land at the same times for both
// agents (the look changes how a move plays, never when the agent speaks).
const LISTEN = 1800, THINK = 1000, STEP = 1200, FOUND = 700, CHUNK = 2800, ASK = 3400, REST = 1600;
function schedule(reply) {
  const out = [];
  let t = 0;
  const words = ME.split(" ");
  words.forEach((w, i) => out.push({ at: Math.round((i + 1) * (LISTEN / (words.length + 1))), turn: { listening: true, heard: words.slice(0, i + 1).join(" ") } }));
  out.unshift({ at: 0, turn: { listening: true, heard: "" } });
  t = LISTEN;
  out.push({ at: t, turn: { sent: true } });
  t += THINK;
  reply.doing.forEach((d) => { out.push({ at: t, turn: { sent: true, doing: d } }); t += STEP; });
  out.push({ at: t, turn: { sent: true, arrived: true } });
  t += FOUND;
  reply.chunks.forEach((_, i) => { out.push({ at: t, turn: { sent: true, chunk: i } }); t += CHUNK; });
  if (reply.questions.length) { out.push({ at: t, turn: { sent: true, chunk: reply.chunks.length - 1, asking: true } }); t += ASK; }
  out.push({ at: t + REST, end: true });
  return out;
}

export function useTurn(reply, run) {
  const [turn, setTurn] = useState({});
  const [loop, setLoop] = useState(0);
  const timers = useRef([]);
  useEffect(() => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
    if (!run) return undefined;
    for (const s of schedule(reply)) {
      timers.current.push(setTimeout(() => (s.end ? setLoop((n) => n + 1) : setTurn(s.turn)), s.at));
    }
    return () => timers.current.forEach(clearTimeout);
  }, [reply, run, loop]);
  return [turn, () => setLoop((n) => n + 1)];
}

// ---------- the parts of a stage ----------

function Picture({ reply, node }) {
  if (!node) return null;
  const g = reply.heads.get(node.key);
  const noop = () => () => {};
  return g ? <Group g={g} emitFor={noop} Render={Render} /> : <Render node={node} emit={() => {}} />;
}

// The mark in the agent's color: it breathes, sweeps, builds, bursts, docks.
function Presence({ mood, flavor, face }) {
  return (
    <div className={`mo-presence m-${mood} ${flavor ? `f-${flavor}` : ""}`} aria-hidden="true">
      <span className="mo-halo" />
      <span className="mo-sweep" />
      <span className="mo-orb"><i /><i /><i /></span>
      <span className="mo-spark">{Array.from({ length: 8 }, (_, i) => <b key={i} style={{ "--i": i }} />)}</span>
      <span className="mo-dockface">{face}</span>
    </div>
  );
}

function MiniMic({ live }) {
  return (
    <span className={`mo-mic ${live ? "live" : ""}`} aria-hidden="true">
      <span className="mo-ring" /><span className="mo-ring r2" />
      <svg viewBox="0 0 24 24"><rect x="8.5" y="3" width="7" height="12" rx="3.5" /><path d="M5.5 11.5a6.5 6.5 0 0 0 13 0M12 18v3" fill="none" strokeWidth="2" strokeLinecap="round" /></svg>
    </span>
  );
}

// One agent's stage for one moment of the turn.
export function Stage({ agent, look, reply, turn, compact, onRetry, dir = 1, tag }) {
  const { mood, flavor } = stageMood(turn);
  const chunk = turn.chunk != null ? reply.chunks[Math.min(turn.chunk, reply.chunks.length - 1)] : null;
  const d = turn.doing && !turn.doing.off ? turn.doing : null;
  const opened = mood !== "idle" && mood !== "listen";
  return (
    <div className={`mo-stage p-${look.pulse} e-${look.enter} ${look.reduced ? "mo-still" : ""} ${compact ? "compact" : ""}`}
      style={{ "--mo-c": agent.c, ...motionVars(look) }} data-mood={mood}>
      {opened ? <span className="mo-wash" key={`wash:${turn.sent ? 1 : 0}`} /> : null}
      <div className="mo-head">
        <span className="mo-face" style={{ background: agent.c }}>{agent.name[0]}</span>
        <b>{agent.name}</b>
        <span className="mo-char">{tag || look.character}</span>
      </div>
      {mood === "done" && reply.chunks.length > 1 ? (
        <div className="mo-segs">{reply.chunks.map((c, i) => <i key={c.key} className={i <= turn.chunk ? "on" : ""} />)}</div>
      ) : null}
      {turn.sent ? <div className="mo-me">{ME}</div> : null}
      <div className="mo-center">
        {mood === "done" || mood === "ask" ? null : <Presence mood={mood} flavor={flavor} face={agent.name[0]} />}
        {mood === "listen" ? <div className="mo-heard">{turn.heard || " "}<span className="mo-caret" /></div> : null}
        {mood === "idle" ? <div className="mo-word">Tap the mic and talk.</div> : null}
        {mood === "think" ? <div className="mo-word" key="think">Thinking</div> : null}
        {mood === "work" || (mood === "found" && d) ? (
          <div className="mo-doing" key={d?.text || "w"}>
            <span>{d?.text || "Working"}</span>
            {d?.of ? <span className="mo-bar"><i style={{ width: `${(100 * (d.step || 0)) / d.of}%` }} /></span> : null}
          </div>
        ) : null}
        {mood === "found" && !d ? <div className="mo-word" key="found">Here it is</div> : null}
        {mood === "error" ? (
          <div className="mo-err">
            <div className="mo-word">That didn't go through.</div>
            {onRetry ? <button className="mo-btn" onClick={onRetry}>Try again</button> : null}
          </div>
        ) : null}
        {mood === "done" && chunk ? (
          <div className="mo-chunk" key={`${chunk.key}`} data-dir={dir}>
            {chunk.pic ? <div className="mo-pic"><Picture reply={reply} node={chunk.pic} /></div> : null}
            {chunk.line ? <div className="mo-line">{chunk.line}</div> : null}
          </div>
        ) : null}
        {mood === "ask" ? (
          <div className="mo-qs">
            <div className="mo-qtitle">{reply.questions.length === 1 ? "One thing" : `${reply.questions.length} quick questions`}</div>
            {reply.questions.map((q, i) => (
              <div key={q.key} className="mo-q" style={{ "--n": i }}><Render node={q} emit={() => {}} /></div>
            ))}
          </div>
        ) : null}
      </div>
      <div className="mo-foot">
        <span className="mo-moodtag">{MOOD_WORDS[mood]}{flavor && mood === "work" && flavor !== "work" ? ` · ${flavor === "scan" ? "looking" : "making"}` : ""}</span>
        <MiniMic live={mood === "listen"} />
      </div>
    </div>
  );
}

// Words to a look: motion.mjs wordsLook (YUI-123), the same table the
// motion-looks demo uses.
function wordsPart(words) { return wordsLook(words)?.look || null; }

// ---------- the demo ----------

export function StageMotionDemo({ text, view }) {
  const reply = useMemo(() => readReply(text), [text]);
  const reducedOS = useReduced();
  const [still, setStill] = useState(false);
  const reduced = reducedOS || still;
  const [chars, setChars] = useState({ Coach: "snappy", Sage: "calm", Yui: "bouncy" });
  const [custom, setCustom] = useState({});
  const [words, setWords] = useState("");
  const lookOf = (name) => motionLook({ motion: chars[name] }, custom[name] || null, reduced);

  const [turn, replay] = useTurn(reply, view === "side");

  // Every mood: one stage, one mood at a time, looping.
  const [who, setWho] = useState("Yui");
  const [mood, setMood] = useState("work-scan");
  const moodTurn = useMemo(() => {
    const d = reply.doing;
    const pick = (re, i) => d.find((x) => re.test(x.text || "")) || d[i] || { text: "Working" };
    return {
      idle: {},
      listen: { listening: true, heard: ME },
      think: { sent: true },
      "work-scan": { sent: true, doing: pick(/^(read|check|look)/i, 0) },
      "work-make": { sent: true, doing: { text: "Drafting three runs", step: 2, of: 3 } },
      found: { sent: true, arrived: true },
      done: { sent: true, chunk: 0 },
      ask: { sent: true, chunk: 0, asking: true },
      error: { sent: true, failed: true },
    }[mood];
  }, [mood, reply]);
  const [moodKey, setMoodKey] = useState(0);

  // Hand-offs: open the stage, go to the next part, bring the questions.
  const [move, setMove] = useState({ turn: {}, n: 0, dir: 1 });
  const moveTimers = useRef([]);
  const moveClear = () => { moveTimers.current.forEach(clearTimeout); moveTimers.current = []; };
  useEffect(() => moveClear, []);
  const openStage = () => {
    moveClear();
    setMove((m) => ({ ...m, turn: { listening: true, heard: ME }, n: m.n + 1 }));
    moveTimers.current.push(setTimeout(() => setMove((m) => ({ ...m, turn: { sent: true }, n: m.n + 1 })), 700));
  };
  const nextPart = (dir) => setMove((m) => {
    const cur = m.turn.chunk == null || m.turn.asking ? -1 : m.turn.chunk;
    const last = reply.chunks.length - 1;
    const i = dir > 0 ? (cur >= last ? 0 : cur + 1) : Math.max(0, cur - 1);
    return { turn: { sent: true, chunk: i }, n: m.n + 1, dir };
  });
  const bringQs = () => setMove((m) => ({ turn: { sent: true, chunk: reply.chunks.length - 1, asking: true }, n: m.n + 1, dir: 1 }));
  useEffect(() => { if (view === "moves") setMove({ turn: { sent: true, chunk: 0 }, n: 0, dir: 1 }); }, [view]);

  const ctx = { nodes: reply.nodes, tables: {}, data: {}, write: () => {}, agent: "Yui", screen: "full", dispatch: () => {}, fold: () => {}, closeStage: () => {} };
  const stillNote = reducedOS ? <div className="mo-note">Your device asks for Reduce Motion, so both stages hold still.</div> : null;

  let body;
  if (view === "side") {
    body = (
      <div className="mo-wrap">
        <div className="mo-title">Same turn, two characters</div>
        <div className="mo-sub">Coach is snappy, Sage is calm. Same words, same answer.</div>
        <div className="mo-pair">
          <Stage agent={AGENTS.Coach} look={lookOf("Coach")} reply={reply} turn={turn} compact />
          <Stage agent={AGENTS.Sage} look={lookOf("Sage")} reply={reply} turn={turn} compact />
        </div>
        <div className="mo-strip">
          {["listen", "think", "work", "found", "done", "ask"].map((m) => <span key={m} className={stageMood(turn).mood === m ? "on" : ""}>{MOOD_WORDS[m]}</span>)}
        </div>
        {stillNote}
        <button className="mo-btn wide" onClick={replay}>Play the turn again</button>
      </div>
    );
  } else if (view === "moods") {
    const moods = [["listen", "Listen"], ["think", "Think"], ["work-scan", "Look"], ["work-make", "Make"], ["found", "Found"], ["done", "Answer"], ["ask", "Ask"], ["error", "Error"]];
    body = (
      <div className="mo-wrap">
        <div className="mo-chips">
          {Object.keys(AGENTS).map((n) => <button key={n} className={`mo-chip ${who === n ? "on" : ""}`} onClick={() => setWho(n)} style={{ "--mo-c": AGENTS[n].c }}>{n}</button>)}
        </div>
        <div className="mo-single">
          <Stage key={`${who}:${mood}:${moodKey}`} agent={AGENTS[who]} look={lookOf(who)} reply={reply} turn={moodTurn}
            onRetry={() => { setMood("think"); setTimeout(() => setMood("work-scan"), 900); }} />
        </div>
        <div className="mo-chips moods">
          {moods.map(([k, label]) => <button key={k} className={`mo-chip ${mood === k ? "on" : ""}`} onClick={() => { setMood(k); setMoodKey((n) => n + 1); }}>{label}</button>)}
        </div>
        {stillNote}
      </div>
    );
  } else if (view === "moves") {
    body = (
      <div className="mo-wrap">
        <div className="mo-chips">
          {Object.keys(AGENTS).map((n) => <button key={n} className={`mo-chip ${who === n ? "on" : ""}`} onClick={() => setWho(n)} style={{ "--mo-c": AGENTS[n].c }}>{n}</button>)}
        </div>
        <div className="mo-single">
          <Stage key={`${who}:${move.n}`} agent={AGENTS[who]} look={lookOf(who)} reply={reply} turn={move.turn} dir={move.dir} />
        </div>
        <div className="mo-chips moods">
          <button className="mo-chip" onClick={openStage}>Open the stage</button>
          <button className="mo-chip" onClick={() => nextPart(-1)}>‹ Back a part</button>
          <button className="mo-chip" onClick={() => nextPart(1)}>Next part ›</button>
          <button className="mo-chip" onClick={bringQs}>Bring the questions</button>
        </div>
        {stillNote}
      </div>
    );
  } else {
    body = (
      <div className="mo-wrap mo-lookview">
        <div className="mo-title">Each agent moves its own way</div>
        <div className="mo-sub">The look rides on the agent's theme. Pick one, or say it in words.</div>
        {Object.keys(AGENTS).map((n) => {
          const l = lookOf(n);
          return (
            <div key={n} className="mo-lookrow" style={{ "--mo-c": AGENTS[n].c }}>
              <span className="mo-face" style={{ background: AGENTS[n].c }}>{n[0]}</span>
              <div className="mo-lookmain">
                <b>{n}</b> <span className="mo-sub">{WHAT[l.character]}</span>
                <div className="mo-chips tight">
                  {Object.keys(CHARACTERS).map((c) => (
                    <button key={c} className={`mo-chip ${!custom[n] && chars[n] === c ? "on" : ""}`}
                      onClick={() => { setChars((x) => ({ ...x, [n]: c })); setCustom((x) => ({ ...x, [n]: null })); }}>{c}</button>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
        <form className="mo-words" onSubmit={(e) => {
          e.preventDefault();
          const l = wordsPart(words);
          if (l) setCustom((x) => ({ ...x, Coach: l }));
        }}>
          <label className="mo-sub" htmlFor="mo-words">Describe Coach's motion</label>
          <div className="mo-wordsrow">
            <input id="mo-words" value={words} onChange={(e) => setWords(e.target.value)} placeholder="Heavy and punchy" />
            <button className="mo-btn" disabled={!wordsPart(words)}>Try it</button>
          </div>
          <div className="mo-note">{custom.Coach ? `Coach now: ${Object.entries(custom.Coach).map(([k, v]) => `${k} ${v}`).join(", ")}. See it on Side by side.` : "Say it in words. The agent saves it as a theme line; see Motion looks."}</div>
        </form>
        <label className="mo-switch">
          <span>Show the Reduce Motion version</span>
          <input type="checkbox" checked={reduced} disabled={reducedOS} onChange={() => setStill(!still)} />
        </label>
      </div>
    );
  }

  return (
    <ScreenCtx.Provider value={ctx}>
      <div className="mo-app">{body}</div>
    </ScreenCtx.Provider>
  );
}
