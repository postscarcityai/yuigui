"use client";
// One answer on the site chat's stage (SITE-66, spec/YL.md section 5, Stage first): the chunks play one
// at a time, a line and one picture each, drawn with the playground's renderers. A tap goes on, a tap
// on the left quarter goes back, the arrow keys too. Questions come after the last chunk, under it, with
// one Send (a single question sends on its own tap). The chat under it is the record (ChatFab).
// SITE-99: the answer's own time sits above it in small type, so an old answer never reads as new.
// Its own file so the renderers load only when there is an answer to play.
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { readAnswer } from "../../lib/chat/stage.mjs";
import { stageTime } from "../../lib/chat/when.mjs";
import { boundTables } from "../../lib/yl/tables.mjs";
import { Render, TABLES } from "../playground/presets";
import { Group, groupNodes, question, show, VALUE } from "../playground/flows";
import { ScreenCtx } from "../playground/science";
import { RichText } from "../playground/richtext";
import { textRole } from "../../lib/yl/readtext.mjs";
import { CrewOr } from "./ChatCrew";
import { useDragDown } from "../playground/dragdown";
import "../playground/flows.css";

function Picture({ part, node, emitFor }) {
  const heads = useMemo(() => new Map(groupNodes(part.nodes).filter((x) => x.group).map((x) => [x.key, x])), [part]);
  const g = heads.get(node.key);
  return g ? <Group g={g} emitFor={emitFor} Render={Render} /> : <Render node={node} emit={emitFor(node)} />;
}

function Ctx({ part, agent, home, children }) {
  const value = useMemo(() => ({
    nodes: part ? part.nodes : [], tables: { ...TABLES, ...boundTables(part?.state.data || {}) }, data: part?.state.data || {},
    write: () => {}, agent, screen: "full", dispatch: () => {}, fold: () => {}, closeStage: () => home?.(),
  }), [part, agent, home]);
  return <ScreenCtx.Provider value={value}>{children}</ScreenCtx.Provider>;
}

function Chunk({ a, c, dir, emitFor, Text, go, small, home, agent }) {
  const part = c.part != null ? a.parts[c.part] : null;
  const words = c.text || c.line;
  const long = textRole(words || "") === "body";
  return (
    <div className={`mo-chunk ys-chunk${small ? " small" : ""}`} data-dir={dir}>
      {c.pic && part ? <div className="ys-pic yc-screen pg-screen"><Ctx part={part} agent={agent} home={home}><Picture part={part} node={c.pic} emitFor={emitFor} /></Ctx></div> : null}
      {c.text ? <div className={`ys-line ys-text${long ? " long" : ""}`}><Text text={c.text} go={go} /></div> : null}
      {c.line ? <div className={`ys-line${long ? " long" : ""}`}><RichText text={c.line} go={go} /></div> : null}
      {c.page?.body ? <div className="ys-body"><RichText text={c.page.body} go={go} /></div> : null}
      {c.page?.points?.length ? <ul className="ys-points">{[].concat(c.page.points).map((t, i) => <li key={i}>{t}</li>)}</ul> : null}
    </div>
  );
}

export default function ChatStage({ content, answer, agent = "Yui", live, onTap, onAnswers, Text, go, active = true, onEdge, onHome, onEnd, at: sentAt }) {
  // `answer` is an answer already read (the web thread builds its own from the screens it holds, YUI-243).
  const a = useMemo(() => answer || readAnswer(content), [answer, content]);
  const n = a.chunks.length;
  const [at, setAt] = useState(0);
  const [dir, setDir] = useState(1);
  const [answers, setAnswers] = useState({});
  const [sent, setSent] = useState(false);
  const box = useRef(null);
  const last = Math.max(0, n - 1);
  const asking = a.questions.length > 0 && at >= last && !sent;

  const pull = useDragDown(() => onHome?.());
  // Past the last part (and its questions sent), the chat shows a quiet Back to home under the content (SITE-98, SITE-108).
  // A plan or flow plays its own steps and sends at its own end, so it is never "the end" here.
  const runs = /^(plan|flow|steps)$/.test(a.chunks[Math.min(at, last)]?.pic?.preset || "");
  const atEnd = at >= last && !runs && (a.questions.length === 0 || sent);
  useEffect(() => { onEnd?.(atEnd); }, [atEnd, onEnd]);

  const step = useCallback((d) => {
    setDir(d);
    setAt((i) => Math.min(last, Math.max(0, i + d)));
  }, [last]);

  // The arrow keys page the stage when nobody is typing. Past the last part, right goes on to the
  // chat's pages (SITE-83, onEdge).
  useEffect(() => {
    if (!active) return undefined;
    const onKey = (e) => {
      if (/^(INPUT|TEXTAREA|SELECT)$/.test(e.target?.tagName || "") || e.target?.isContentEditable) return;
      if (e.key === "ArrowRight") { if (at >= last) onEdge?.(1); else step(1); }
      else if (e.key === "ArrowLeft") step(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [active, step, at, last, onEdge]);

  const emitFor = useCallback((node) => (value) => { if (live) onTap?.({ id: node.id, preset: node.preset, ...value, ...(node.saved ? { saved: node.saved } : {}) }); }, [live, onTap]);

  // A tap on the stage itself: the left quarter goes back, anywhere else goes on. Taps inside a picture
  // or a question belong to it.
  const onStageTap = (e) => {
    if (e.target.closest("button, a, input, textarea, select, label, [role=button], .ys-pic, .ys-qs")) return;
    const r = box.current?.getBoundingClientRect();
    if (r && e.clientX - r.left < r.width / 4) step(-1);
    else step(1);
  };

  const one = a.questions.length === 1;
  const capture = (q) => (v) => setAnswers((x) => ({ ...x, [q.node.id]: v[VALUE[q.node.preset]] }));
  const got = a.questions.filter((q) => answers[q.node.id] !== undefined);
  const submit = () => {
    if (!live || !got.length) return;
    const label = got.map((q) => { const Q = question(q.node); return `${Q}${/[?:]$/.test(Q) ? "" : ":"} ${show(answers[q.node.id])}`; }).join("\n");
    const events = a.plan
      ? [{ id: a.plan.node.id, preset: "plan", plan: Object.fromEntries(got.map((q) => [q.node.id, answers[q.node.id]])) }]
      : got.map((q) => ({ id: q.node.id, preset: q.node.preset, [VALUE[q.node.preset]]: answers[q.node.id] }));
    setSent(true);
    onAnswers?.(events, label);
  };

  const c = a.chunks[Math.min(at, last)];
  return (
    <div className="ys-play" ref={box} onClick={onStageTap} data-asking={asking ? "1" : undefined} data-pull={pull.dragging ? "1" : undefined} style={pull.style} {...pull.handlers}>
      {onHome ? <button className="ys-homex" onClick={onHome} aria-label="Back to home">Back to home</button> : null}
      {n > 1 ? (
        <div className="mo-segs ys-segs" aria-label={`Part ${at + 1} of ${n}`}>
          {a.chunks.map((x, i) => <i key={x.key} className={i <= at ? "on" : ""} />)}
        </div>
      ) : null}
      <div className="ys-scroll">
        {sentAt ? <time className="ys-when" dateTime={new Date(sentAt).toISOString()}>{stageTime(sentAt)}</time> : null}
        {c ? <Chunk key={`${c.key}:${at}`} a={a} c={c} dir={dir} emitFor={emitFor} Text={Text} go={go} small={asking} home={onHome} agent={agent} /> : null}
        {asking ? (
          <div className="ys-qs">
            {a.questions.map((q, i) => (
              <div key={q.node.key} className="mo-q" style={{ "--n": i }}>
                <Ctx part={a.parts[q.part]} agent={agent} home={onHome}>
                  <div className="yc-screen pg-screen"><CrewOr node={q.node} emit={one ? emitFor(q.node) : capture(q)} Render={Render} /></div>
                </Ctx>
              </div>
            ))}
            {!one && live ? (
              <button className="ys-sendall" disabled={!got.length} onClick={submit}>
                {a.plan?.node.props.submit || "Send"}{got.length ? ` · ${got.length} of ${a.questions.length}` : ""}
              </button>
            ) : null}
          </div>
        ) : null}
      </div>
      {n > 1 ? (
        <div className="ys-nav">
          <button onClick={() => step(-1)} disabled={at === 0} aria-label="Back a part">‹</button>
          <button className="acc" onClick={() => step(1)} disabled={at >= last} aria-label="Next part">›</button>
        </div>
      ) : null}
    </div>
  );
}
