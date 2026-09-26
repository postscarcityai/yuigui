"use client";

// Stage first (spec/YL.md section 5, YUI-119 step 1): a mock of Yui living on
// the full screen. The first send opens the stage at once, the agent works on
// it, the reply plays as chunks (a line and one picture each), the questions
// come last on one screen with one Send, and the chat is only the record, top
// right. The bars are the new ones: settings and the agent top left, the
// record top right, a big mic bottom right with T (type) and + (attach).
//
// The replies are real Yui Lines through the real parser and renderers. The
// "release that" turn is the editor's text, so an edit replays on the phone.
// Nothing leaves the page; answers go to the wire log.

import { useEffect, useMemo, useRef, useState } from "react";
import { apply, initialState, parse } from "../../lib/yl/yl.mjs";
import { stageChunks } from "../../lib/yl/chunks.mjs";
import { Render } from "./presets";
import { Group, groupNodes, question, show, VALUE } from "./flows";
import { ScreenCtx } from "./science";
import { doings } from "./working";
import "./stagefirst.css";

export const STAGEFIRST_VIEWS = [
  ["ask", "Ask"],
  ["working", "Working"],
  ["answer", "Answer"],
  ["release", "Release that"],
  ["questions", "Questions"],
  ["record", "Chat record"],
  ["bars", "The new bars"],
];

// "Am I on the latest build?" (feedback AJq7CcQS8fyM): one chunk, not four pages.
export const LATEST_YL = `doing "Checking TestFlight" 1/2
doing "Asking your devices" 2/2
say "Yes. Build 160, the newest."
shapes w=10 h=6 caption="Your iPad is on 135. Update it in TestFlight."
shape@p box "iPhone 160" at=3,3 size=3,4 tone=mint +fill +grow
shape@i box "iPad 135" at=7.4,3 size=3.6,3 tone=mute +dash`;

const ME = [
  "Am I on the latest build?",
  "OK, yeah go ahead and release that. I want to play with the music tools.",
];
const BARS_ME = "Show me the new layout. Big mic, T for text, + to attach.";

const AGENTS = [
  { name: "Yui", c: "#8b7cff", hi: "Hi Chris. Tap the mic and talk." },
  { name: "Coach", c: "#ff6b3d", hi: "Leg day is waiting. Talk to me." },
  { name: "Scout", c: "#4fd1c5", hi: "Two new leads came in. Ask me." },
];

// One reply, read for the stage: the nodes, the chunks, the questions.
function readReply(text) {
  let s = initialState();
  for (const op of parse(text)) s = apply(s, op);
  const nodes = Object.values(s.screens).flat().sort((a, b) => a.seq - b.seq);
  const heads = new Map(groupNodes(nodes).filter((x) => x.group).map((x) => [x.key, x]));
  return { nodes, heads, ...stageChunks(nodes), doing: doings(text).filter(Boolean) };
}

// ---------- the bars ----------

function Mic({ big, live, onClick }) {
  return (
    <button className={`sf-mic ${big ? "big" : ""} ${live ? "live" : ""}`} onClick={onClick} aria-label={live ? "Stop listening" : "Talk"}>
      <svg viewBox="0 0 24 24" aria-hidden="true"><rect x="8.5" y="3" width="7" height="12" rx="3.5" /><path d="M5.5 11.5a6.5 6.5 0 0 0 13 0M12 18v3" fill="none" strokeWidth="2" strokeLinecap="round" /></svg>
    </button>
  );
}

function BottomBar({ inputs, live, onMic, onType, onAttach, left }) {
  return (
    <div className="sf-bottom">
      <div className="sf-left">{left}</div>
      <div className="sf-inputs">
        {inputs.attach ? <button className="sf-small" onClick={onAttach} aria-label="Attach">+</button> : null}
        {inputs.text ? <button className="sf-small sf-t" onClick={onType} aria-label="Type">T</button> : null}
        {inputs.mic ? <Mic big live={live} onClick={onMic} /> : null}
      </div>
    </div>
  );
}

function TopBar({ agent, count, onMenu, onAgents, onRecord }) {
  return (
    <div className="sf-top">
      <button className="sf-round" onClick={onMenu} aria-label="Settings">
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 7h14M5 12h14M5 17h14" strokeWidth="2.2" strokeLinecap="round" /></svg>
      </button>
      <button className="sf-agent" onClick={onAgents} aria-label={`${agent.name}, switch agent`}>
        <span className="sf-face" style={{ background: agent.c }}>{agent.name[0]}</span>
        <b>{agent.name}</b>
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 10l5 5 5-5" strokeWidth="2.2" fill="none" strokeLinecap="round" /></svg>
      </button>
      <span className="sf-grow" />
      <button className="sf-round sf-rec" onClick={onRecord} aria-label="Chat record">
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 5.5h14a1.5 1.5 0 0 1 1.5 1.5v8a1.5 1.5 0 0 1-1.5 1.5H10l-4 3v-3H5A1.5 1.5 0 0 1 3.5 15V7A1.5 1.5 0 0 1 5 5.5z" strokeWidth="2" fill="none" strokeLinejoin="round" /></svg>
        {count ? <i>{count}</i> : null}
      </button>
    </div>
  );
}

// ---------- a chunk ----------

function Picture({ reply, node, emitFor }) {
  if (!node) return null;
  const g = reply.heads.get(node.key);
  return g ? <Group g={g} emitFor={emitFor} Render={Render} /> : <Render node={node} emit={emitFor(node)} />;
}

function Chunk({ reply, c, emitFor }) {
  return (
    <div className="sf-chunk" key={c.key}>
      {c.pic ? <div className="sf-pic"><Picture reply={reply} node={c.pic} emitFor={emitFor} /></div> : null}
      {c.line ? <div className={`sf-line ${c.pic ? "" : "alone"}`}>{c.line}</div> : null}
      {c.page?.body ? <div className="sf-body">{c.page.body}</div> : null}
      {c.page?.points?.length ? <ul className="sf-points">{[].concat(c.page.points).map((t, i) => <li key={i}>{t}</li>)}</ul> : null}
    </div>
  );
}

function Segs({ n, at, onPick }) {
  if (n < 2) return null;
  return (
    <div className="sf-segs">
      {Array.from({ length: n }, (_, i) => <button key={i} className={i < at ? "d" : i === at ? "now" : ""} onClick={() => onPick(i)} aria-label={`Part ${i + 1}`} />)}
    </div>
  );
}

// ---------- the new bars, drawn (Chris: "I want to see the new layout") ----------

function BarsDrawing({ step }) {
  const [words, setWords] = useState(0);
  const said = "Show me the new layout".split(" ");
  useEffect(() => {
    if (step !== 0) return;
    setWords(said.length);
    const t = setInterval(() => setWords((w) => (w >= said.length + 3 ? 0 : w + 1)), 420);
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step]);
  if (step === 0) {
    return (
      <div className="sf-draw">
        <div className="sf-draw-said">{said.slice(0, words).join(" ")}<span className="sf-caret" /></div>
        <div className="sf-draw-bar">
          <span className="sf-small ghost">+</span>
          <span className="sf-small ghost sf-t">T</span>
          <span className="sf-mic big live huge"><svg viewBox="0 0 24 24" aria-hidden="true"><rect x="8.5" y="3" width="7" height="12" rx="3.5" /><path d="M5.5 11.5a6.5 6.5 0 0 0 13 0M12 18v3" fill="none" strokeWidth="2" strokeLinecap="round" /></svg></span>
        </div>
        <div className="sf-note r">bigger, bottom right</div>
      </div>
    );
  }
  if (step === 1) {
    return (
      <div className="sf-draw">
        <div className="sf-draw-field on"><span>Plan my runs this week</span><span className="sf-caret" /><b className="sf-send">↑</b></div>
        <div className="sf-kb">{["QWERTYUIOP", "ASDFGHJKL", "ZXCVBNM"].map((r) => <div key={r}>{r.split("").map((k) => <i key={k}>{k}</i>)}</div>)}</div>
        <div className="sf-note l">the field opens full width, only when you want it</div>
      </div>
    );
  }
  if (step === 2) {
    return (
      <div className="sf-draw">
        <div className="sf-draw-field on tall">
          <div className="sf-thumbs"><i className="a" /><i className="b" /></div>
          <div><span>Which of these for the site?</span><span className="sf-caret" /></div>
          <b className="sf-send">↑</b>
        </div>
        <div className="sf-attach">
          <span>Photos</span><span>Camera</span><span>Files</span>
        </div>
        <div className="sf-note r">photos ride along while you type</div>
      </div>
    );
  }
  return (
    <div className="sf-draw">
      <div className="sf-draw-top">
        <span className="sf-round"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 7h14M5 12h14M5 17h14" strokeWidth="2.2" strokeLinecap="round" /></svg></span>
        <span className="sf-agent"><span className="sf-face" style={{ background: "#8b7cff" }}>Y</span><b>Yui</b></span>
        <span className="sf-grow" />
        <span className="sf-round sf-rec"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 5.5h14a1.5 1.5 0 0 1 1.5 1.5v8a1.5 1.5 0 0 1-1.5 1.5H10l-4 3v-3H5A1.5 1.5 0 0 1 3.5 15V7A1.5 1.5 0 0 1 5 5.5z" strokeWidth="2" fill="none" strokeLinejoin="round" /></svg></span>
      </div>
      <div className="sf-callouts">
        <span className="c1">settings</span><span className="c2">your agents</span><span className="c3">the chat</span>
      </div>
    </div>
  );
}

const BARS = [
  "A bigger mic, bottom right. Tap and talk; your words stream in.",
  "T opens the text field.",
  "+ attaches. Photos sit in the field while you type.",
  "Up top: settings, your agents, and the chat.",
];

// ---------- the demo ----------

export function StageFirstDemo({ text, view, onEvent }) {
  const release = useMemo(() => readReply(text), [text]);
  const latest = useMemo(() => readReply(LATEST_YL), []);
  const replies = [latest, release];

  const [agentName, setAgentName] = useState("Yui");
  const agent = AGENTS.find((a) => a.name === agentName) || AGENTS[0];
  const [inputs, setInputs] = useState({ mic: true, text: true, attach: true });
  const [sheet, setSheet] = useState(null); // settings | agents | attach
  const [scene, setScene] = useState("idle"); // idle listen type work play ask
  const [turn, setTurn] = useState(0); // 0 latest, 1 release, 2 the bars
  const [done, setDone] = useState(0); // turns sent so far (they are in the record)
  const [at, setAt] = useState(0);
  const [heard, setHeard] = useState("");
  const [typed, setTyped] = useState("");
  const [photos, setPhotos] = useState(0);
  const [answers, setAnswers] = useState({});
  const [sent, setSent] = useState(null); // the answers as the person's message
  const [record, setRecord] = useState(false);
  const [toast, setToast] = useState(null);
  const [secs, setSecs] = useState(0);
  const [hold, setHold] = useState(false); // the Working tab keeps the working state on screen
  const timers = useRef([]);
  const clear = () => { timers.current.forEach(clearTimeout); timers.current.forEach(clearInterval); timers.current = []; };
  const later = (f, ms) => timers.current.push(setTimeout(f, ms));
  useEffect(() => clear, []);

  const reply = turn < 2 ? replies[turn] : null;
  const chunkCount = turn === 2 ? BARS.length : reply.chunks.length;

  // The tabs jump to a moment of the story.
  useEffect(() => {
    clear();
    setSheet(null); setRecord(false); setToast(null); setHold(false); setHeard(""); setTyped(""); setPhotos(0);
    if (view === "ask") { setTurn(0); setDone(0); setScene("idle"); setAnswers({}); setSent(null); }
    if (view === "working") { setTurn(0); setDone(1); setScene("work"); setHold(true); setSecs(3); }
    if (view === "answer") { setTurn(0); setDone(1); setScene("play"); setAt(0); }
    if (view === "release") { setTurn(1); setDone(2); setScene("play"); setAt(0); setAnswers({}); setSent(null); }
    if (view === "questions") { setTurn(1); setDone(2); setScene("ask"); setAnswers({}); setSent(null); }
    if (view === "record") {
      setTurn(1); setDone(2); setScene("idle"); setRecord(true);
      setAnswers({ ping: "Yes, ping me", try: "Keys" }); setSent("Ping you when it lands? Yes, ping me\nWhat do you want to try first? Keys");
    }
    if (view === "bars") { setTurn(2); setDone(2); setScene("play"); setAt(0); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [view]);

  // Send: the stage is already full screen, so the turn starts right here.
  const send = (t) => {
    clear();
    setSheet(null);
    const next = done >= 2 ? 1 : done;
    setTurn(next);
    setDone(next + 1);
    setAnswers({}); setSent(null);
    setHeard(t || ME[next]); setTyped(""); setPhotos(0);
    setScene("work"); setSecs(0);
    const t0 = Date.now();
    timers.current.push(setInterval(() => setSecs(Math.floor((Date.now() - t0) / 1000)), 250));
    later(() => { clear(); setScene("play"); setAt(0); }, 1400 + replies[next].doing.length * 1300);
  };

  // The mic: words stream in as you talk, then it sends by itself.
  const listen = () => {
    if (scene === "listen") return;
    clear();
    setSheet(null);
    const words = ME[done >= 1 ? 1 : 0].split(" ");
    setScene("listen"); setHeard("");
    words.forEach((w, i) => later(() => setHeard(words.slice(0, i + 1).join(" ")), 250 + i * 230));
    later(() => send(words.join(" ")), 250 + words.length * 230 + 700);
  };

  const nextChunk = () => {
    if (at < chunkCount - 1) return setAt(at + 1);
    if (turn < 2 && reply.questions.length) setScene("ask");
  };
  const backChunk = () => setAt(Math.max(0, at - 1));

  const emitFor = (node) => (v) => onEvent({ id: node.id, preset: node.preset, ...v });
  const capture = (q) => (v) => setAnswers((a) => ({ ...a, [q.id]: v[VALUE[q.preset]] }));
  const answerText = (a) => release.questions.filter((q) => a[q.id] !== undefined).map((q) => {
    const Q = question(q);
    return `${Q}${/[?:]$/.test(Q) ? "" : ":"} ${show(a[q.id])}`;
  }).join("\n") || "Sent";
  const submit = () => {
    const picked = Object.fromEntries(release.questions.filter((q) => answers[q.id] !== undefined).map((q) => [q.id, answers[q.id]]));
    if (release.plan) onEvent({ id: release.plan.id, preset: "plan", plan: picked });
    else release.questions.forEach((q) => answers[q.id] !== undefined && onEvent({ id: q.id, preset: q.preset, [VALUE[q.preset]]: answers[q.id] }));
    setSent(answerText(answers));
    setScene("idle");
    setToast("Your answers are in the chat.");
  };

  const reopen = (t, i) => { clear(); setRecord(false); setTurn(t); setScene("play"); setAt(i); };

  const ctx = { nodes: reply ? reply.nodes : [], tables: {}, data: {}, write: () => {}, agent: agent.name, screen: "full", dispatch: () => {}, fold: () => {}, closeStage: () => {} };
  const shownMe = heard || (turn === 2 ? BARS_ME : ME[turn]);
  const other = agent.name !== "Yui";

  let body;
  if (other) {
    body = (
      <div className="sf-idle">
        <span className="sf-bigface" style={{ background: agent.c }}>{agent.name[0]}</span>
        <div className="sf-hi">{agent.hi}</div>
        <div className="sf-sub">Each agent has its own stage. Switch back to Yui to replay the demo.</div>
      </div>
    );
  } else if (scene === "idle" || scene === "type") {
    body = (
      <div className="sf-idle">
        <span className="sf-bigface" style={{ background: agent.c }}>Y</span>
        <div className="sf-hi">{done ? "Anything else?" : agent.hi}</div>
        <div className="sf-sub">{done ? "Everything so far is in the chat, top right." : "I answer right here, on the whole screen."}</div>
        {done < 2 ? <button className="sf-try" onClick={() => send(ME[done])}>“{ME[done]}”</button> : null}
      </div>
    );
  } else if (scene === "listen") {
    body = (
      <div className="sf-idle">
        <div className="sf-heard">{heard}<span className="sf-caret" /></div>
        <div className="sf-wave">{Array.from({ length: 9 }, (_, i) => <i key={i} style={{ animationDelay: `${i * 0.09}s` }} />)}</div>
        <div className="sf-sub">Listening. It sends when you stop.</div>
      </div>
    );
  } else if (scene === "work") {
    const steps = replies[turn].doing;
    const n = hold ? steps.length - 1 : Math.min(steps.length - 1, Math.floor(Math.max(0, secs * 1000 - 1400) / 1300));
    const d = secs * 1000 < 1400 && !hold ? null : steps[n];
    body = (
      <div className="sf-work">
        <div className="sf-me">{shownMe}</div>
        <div className="sf-orb" style={{ "--sf": agent.c }}><i /><i /><i /></div>
        <div className="sf-doing">{d ? d.text : "Pondering"} <span>· {secs}s</span></div>
        {d && d.of ? <div className="sf-dbar"><span style={{ width: `${(100 * (d.step || 0)) / d.of}%` }} /></div> : null}
        <div className="sf-handoff">The motion here is YUI-120.</div>
      </div>
    );
  } else if (scene === "play") {
    const c = turn === 2 ? null : reply.chunks[Math.min(at, reply.chunks.length - 1)];
    body = (
      <div className="sf-play">
        <Segs n={chunkCount} at={at} onPick={setAt} />
        <div className="sf-me">{shownMe}</div>
        <div className="sf-stagearea">
          {turn === 2 ? (
            <div className="sf-chunk" key={`bars:${at}`}>
              <div className="sf-pic"><BarsDrawing step={at} /></div>
              <div className="sf-line">{BARS[at]}</div>
            </div>
          ) : c ? <Chunk key={`${turn}:${c.key}`} reply={reply} c={c} emitFor={emitFor} /> : null}
          <button className="sf-tapback" onClick={backChunk} aria-label="Back" disabled={at === 0} />
          <button className="sf-tapnext" onClick={nextChunk} aria-label="Next" />
        </div>
      </div>
    );
  } else if (scene === "ask") {
    const title = release.plan ? release.plan.props.title : "A few things";
    const got = Object.keys(answers).length;
    body = (
      <div className="sf-ask">
        <Segs n={chunkCount + 1} at={chunkCount} onPick={(i) => { if (i < chunkCount) { setScene("play"); setAt(i); } }} />
        <div className="sf-asktitle">{title}</div>
        <div className="sf-sub">{release.questions.length} quick {release.questions.length === 1 ? "question" : "questions"}, one Send.</div>
        <div className="sf-qs">
          {release.questions.map((q) => (
            <div key={q.key} className={`sf-q ${answers[q.id] !== undefined ? "got" : ""}`}><Render node={q} emit={capture(q)} /></div>
          ))}
        </div>
        <button className="sf-sendall" disabled={!got} onClick={submit}>{release.plan?.props.submit || "Send"}{got ? ` · ${got} of ${release.questions.length}` : ""}</button>
      </div>
    );
  }

  // One chunk and nothing to ask (a status answer) needs no arrows.
  const playing = scene === "play" && !other && (chunkCount > 1 || (turn < 2 && reply.questions.length > 0));
  const left = playing ? (
    <div className="sf-nav">
      <button className="sf-small" onClick={backChunk} disabled={at === 0} aria-label="Back">‹</button>
      <button className="sf-small acc" onClick={nextChunk} aria-label="Next" disabled={at >= chunkCount - 1 && !(turn < 2 && reply.questions.length)}>›</button>
    </div>
  ) : null;

  // The record: everything the stage showed, written down, newest last.
  const recordTurns = [];
  for (let t = 0; t < Math.min(done, 2); t++) recordTurns.push(t);

  return (
    <ScreenCtx.Provider value={ctx}>
      <div className="sf-app" style={{ "--sf": agent.c }}>
        <TopBar agent={agent} count={done ? done * 2 + (sent ? 1 : 0) : 0} onMenu={() => setSheet("settings")} onAgents={() => setSheet("agents")} onRecord={() => setRecord(true)} />
        <div className="sf-body-wrap">{body}</div>
        {scene === "type" ? null : (
          <BottomBar inputs={inputs} live={scene === "listen"} left={left}
            onMic={listen} onType={() => { clear(); setScene("type"); }} onAttach={() => setSheet("attach")} />
        )}
        {scene === "type" ? (
          <div className="sf-typing">
            <form className="sf-field" onSubmit={(e) => { e.preventDefault(); if (typed.trim() || photos) send(typed.trim() || "Here's a photo"); }}>
              {photos ? <div className="sf-thumbs">{Array.from({ length: photos }, (_, i) => <i key={i} className={i % 2 ? "b" : "a"} />)}</div> : null}
              <div className="sf-fieldrow">
                <button type="button" className="sf-small" onClick={() => setSheet("attach")} aria-label="Attach">+</button>
                <input autoFocus value={typed} onChange={(e) => setTyped(e.target.value)} placeholder="Say something nice" aria-label="Message" />
                <button className="sf-send" aria-label="Send" disabled={!typed.trim() && !photos}>↑</button>
              </div>
            </form>
            <button className="sf-back" onClick={() => setScene("idle")}>Back to the mic</button>
          </div>
        ) : null}

        {record ? (
          <div className="sf-record" role="dialog" aria-label="Chat record">
            <div className="sf-rechead"><b>Chat with {agent.name}</b><span className="sf-sub">the record</span><span className="sf-grow" /><button className="sf-round" onClick={() => setRecord(false)} aria-label="Back to the stage">×</button></div>
            <div className="sf-recscroll">
              {!recordTurns.length ? <div className="sf-sub sf-center">Nothing yet. What you say and what {agent.name} shows land here.</div> : null}
              {recordTurns.map((t) => (
                <div key={t} className="sf-recturn">
                  <div className="sf-recme">{ME[t]}</div>
                  {replies[t].chunks.map((c, i) => (
                    <button key={c.key} className="sf-recrow" onClick={() => reopen(t, i)}>
                      {c.pic ? <span className="sf-recpic"><span className="sf-recpic-in"><Picture reply={replies[t]} node={c.pic} emitFor={() => () => {}} /></span></span> : null}
                      <span className="sf-rectext">{c.line}</span>
                    </button>
                  ))}
                  {t === 1 && replies[1].questions.length ? (
                    <div className="sf-recplan">{release.plan ? release.plan.props.title : "Questions"} · {replies[1].questions.length} questions{sent ? ", sent" : ""}</div>
                  ) : null}
                  {t === 1 && sent ? <div className="sf-recme">{sent.split("\n").map((l, i) => <div key={i}>{l}</div>)}</div> : null}
                </div>
              ))}
            </div>
          </div>
        ) : null}

        {toast ? (
          <div className="sf-toast"><span>{toast}</span><button onClick={() => { setToast(null); setRecord(true); }}>Open chat</button></div>
        ) : null}

        {sheet ? (
          <div className="sf-shade" onClick={() => setSheet(null)}>
            <div className="sf-sheet" onClick={(e) => e.stopPropagation()}>
              {sheet === "settings" ? (
                <>
                  <div className="sf-sheet-h">Settings</div>
                  <div className="sf-sub">Pick what sits beside the mic.</div>
                  {[["mic", "Mic"], ["text", "T, the text field"], ["attach", "+, attach"]].map(([k, label]) => (
                    <label key={k} className="sf-switch">
                      <span>{label}</span>
                      <input type="checkbox" checked={inputs[k]} onChange={() => setInputs((x) => {
                        const n = { ...x, [k]: !x[k] };
                        return n.mic || n.text ? n : x; // keep one way to talk
                      })} />
                    </label>
                  ))}
                </>
              ) : sheet === "agents" ? (
                <>
                  <div className="sf-sheet-h">Your agents</div>
                  {AGENTS.map((a) => (
                    <button key={a.name} className={`sf-agentrow ${a.name === agent.name ? "on" : ""}`} onClick={() => { setAgentName(a.name); setSheet(null); }}>
                      <span className="sf-face" style={{ background: a.c }}>{a.name[0]}</span><b>{a.name}</b>
                      {a.name === agent.name ? <span className="sf-sub">here now</span> : null}
                    </button>
                  ))}
                </>
              ) : (
                <>
                  <div className="sf-sheet-h">Attach</div>
                  <div className="sf-attachrow">
                    {["Photos", "Camera", "Files"].map((k) => (
                      <button key={k} className="sf-attachbtn" onClick={() => { setPhotos((p) => Math.min(p + 1, 4)); setSheet(null); setScene("type"); }}>{k}</button>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        ) : null}
      </div>
    </ScreenCtx.Provider>
  );
}
