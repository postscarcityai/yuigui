"use client";

// Web renderers for the YL group presets: deck (presentations), plan (a
// guided sequence of questions that ends in a project), narrate (a spoken
// walkthrough), plus page and project. A group gets its member nodes from
// groupNodes(); members render with the normal preset renderers, passed in as
// `Render` so this file does not import presets.js.
import { useContext, useEffect, useRef, useState } from "react";
import { GROUPS, resolve } from "../../lib/yl/yl.mjs";
import { ScreenCtx } from "./science";
import { Timeline } from "./timeline";
import { Sketch } from "./sketch";

const isVideo = (src) => /\.(mp4|webm|mov|m4v)(\?|#|$)/i.test(src || "");
const Media = ({ src, className }) => (isVideo(src)
  ? <video src={src} className={className} playsInline muted loop autoPlay />
  : <img src={src} alt="" className={className} draggable={false} />);

// Nodes in, render items out. A group head collects every later node whose
// `in` names it (a deck inside a narrate is both a member and a group).
// Consecutive `step` nodes still become one stepper.
export function groupNodes(nodes) {
  const out = [];
  const open = new Map();
  for (const n of nodes) {
    const g = GROUPS[n.preset] ? { key: n.key, group: n, members: [] } : null;
    const parent = n.in && open.get(n.in);
    const last = out[out.length - 1];
    if (parent) parent.members.push(g || n);
    else if (g) out.push(g);
    else if (n.preset === "step" && last && last.steps) last.steps.push(n);
    else out.push(n.preset === "step" ? { key: n.key, steps: [n] } : n);
    if (g) open.set(n.id, g);
  }
  return out;
}

// Full screen: the block itself becomes an overlay over the phone screen
// (CSS), so nothing remounts and answers, page and playback carry over.
function FullClose({ onClose }) {
  useEffect(() => {
    const k = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", k);
    return () => window.removeEventListener("keydown", k);
  }, [onClose]);
  return <button className="yl-lb-x yl-fullx" onClick={onClose} aria-label="Close">×</button>;
}

// ---------- page ----------

export function Page({ p }) {
  const layout = p.layout || (p.img && !p.body && !p.points.length ? "cover" : p.img ? "split" : "text");
  return (
    <div className={`yl-page ${layout}`}>
      {p.img ? <Media src={p.img} className="yl-pageimg" /> : null}
      <div className="yl-pagetext">
        {p.title ? <div className="yl-pagetitle">{p.title}</div> : null}
        {p.body ? <div className="yl-pagebody">{p.body}</div> : null}
        {p.points.length ? <ul className="yl-pagepts">{p.points.map((t, i) => <li key={i}>{t}</li>)}</ul> : null}
      </div>
    </div>
  );
}

// A page outside a deck: one slide with its notes behind a toggle.
export function LonePage({ p }) {
  const [notes, setNotes] = useState(false);
  return (
    <div className="yl-block yl-deck">
      <div className="yl-slidebox"><Page p={p} /></div>
      {p.notes ? <Notes text={p.notes} open={notes} onToggle={() => setNotes(!notes)} /> : null}
    </div>
  );
}

function Notes({ text, open, onToggle }) {
  return (
    <div className="yl-notes">
      <button className="yl-flink" onClick={onToggle}>{open ? "Hide notes" : "Speaker notes"}</button>
      {open ? <div className="yl-notestext">{text}</div> : null}
    </div>
  );
}

// ---------- deck ----------

const QUIZ = new Set(["ask", "choose", "pick"]);

// `index` and `onIndex` make the deck controlled (a narrate drives it).
export function Deck({ g, emitFor, Render, index, onIndex, bare }) {
  const p = resolve("deck", g.group.props);
  const pages = g.members.filter((m) => !m.group);
  const n = pages.length;
  const [own, setOwn] = useState(0);
  const cur = Math.min(index ?? own, Math.max(0, n - 1));
  const go = (i) => { const j = Math.max(0, Math.min(n - 1, i)); (onIndex || setOwn)(j); };
  const [full, setFull] = useState(!!p.full);
  const [notes, setNotes] = useState(!!p.notes);
  const [seen, setSeen] = useState(() => new Set());
  const [marks, setMarks] = useState({}); // quiz page id -> correct?
  const sent = useRef(false);
  const drag = useRef(null);

  useEffect(() => { setSeen((s) => (s.has(cur) ? s : new Set([...s, cur]))); }, [cur]);
  const quizzes = pages.filter((m) => QUIZ.has(m.preset));
  const answered = Object.keys(marks).length;
  useEffect(() => {
    if (sent.current || !n || seen.size < n || answered < quizzes.length) return;
    sent.current = true;
    const graded = Object.values(marks).filter((v) => v !== null);
    emitFor(g.group)({ done: true, pages: n, ...(graded.length ? { score: graded.filter(Boolean).length, of: graded.length } : {}) });
  }, [seen, marks, n, answered, quizzes.length, emitFor, g.group]);

  // Quiz pages emit their own event and also report whether it was right.
  const quizEmit = (m) => (v) => {
    setMarks((s) => ({ ...s, [m.id]: typeof v.correct === "boolean" ? v.correct : null }));
    emitFor(m)(v);
  };

  useEffect(() => {
    if (!full) return;
    const k = (e) => { if (e.key === "ArrowRight") go(cur + 1); if (e.key === "ArrowLeft") go(cur - 1); };
    window.addEventListener("keydown", k);
    return () => window.removeEventListener("keydown", k);
  });

  const down = (e) => { drag.current = e.clientX; };
  const up = (e) => {
    if (drag.current == null) return;
    const dx = e.clientX - drag.current;
    drag.current = null;
    if (dx < -40) go(cur + 1);
    if (dx > 40) go(cur - 1);
  };

  const slide = (m) => (QUIZ.has(m.preset)
    ? <div className="yl-quizpage"><span className="yl-quiztag">Quiz</span><Render node={m} emit={quizEmit(m)} /></div>
    : <Page p={resolve("page", m.props)} />);
  const curNotes = pages[cur] && pages[cur].preset === "page" ? resolve("page", pages[cur].props).notes : "";

  const body = (big) => (
    <>
      {p.title ? <div className={big ? "yl-stagetitle" : "yl-q"}>{p.title}<span className="yl-bound">{n} page{n === 1 ? "" : "s"}</span></div> : null}
      {!n ? <div className="yl-imgph"><span>Deck</span><b>No pages yet</b></div> : p.layout === "scroll" && !big ? (
        <div className="yl-deckscroll">{pages.map((m) => <div key={m.key} className="yl-slidebox">{slide(m)}</div>)}</div>
      ) : (
        <>
          <div className="yl-slidebox yl-track" onPointerDown={down} onPointerUp={up} onPointerLeave={() => (drag.current = null)}>
            <div className="yl-trackin" style={{ transform: `translateX(${-cur * 100}%)` }}>
              {pages.map((m, i) => <div key={m.key} className="yl-trackpage" aria-hidden={i !== cur}>{slide(m)}</div>)}
            </div>
          </div>
          <div className="yl-deckbar">
            <button onClick={() => go(cur - 1)} disabled={cur === 0} aria-label="Previous">‹</button>
            <div className="yl-gdots">{pages.map((m, i) => <button key={m.key} className={i === cur ? "on" : ""} onClick={() => go(i)} aria-label={`Page ${i + 1}`} />)}</div>
            <button onClick={() => go(cur + 1)} disabled={cur >= n - 1} aria-label="Next">›</button>
          </div>
        </>
      )}
      {curNotes && !(p.layout === "scroll" && !big) ? <Notes text={curNotes} open={notes} onToggle={() => setNotes(!notes)} /> : null}
    </>
  );

  if (bare) return <div className="yl-deck">{body(false)}</div>;
  return (
    <div className={`yl-block yl-deck ${full ? "yl-full" : ""}`}>
      {full ? <FullClose onClose={() => setFull(false)} /> : null}
      {body(full)}
      <div className="yl-deckfoot">
        <span className="yl-sub">{n ? `${cur + 1} / ${n}` : ""}{quizzes.length ? ` · quiz ${answered}/${quizzes.length}` : ""}</span>
        {!full ? <button className="yl-flink" onClick={() => setFull(true)}>⤢ Full screen</button> : null}
      </div>
    </div>
  );
}

// ---------- plan ----------

// What each member's answer is, taken from the event it would have sent.
const VALUE = { ask: "answer", choose: "choice", pick: "picked", slide: "value", form: "form", mic: "transcript", camera: "photo" };
const question = (m) => { const p = m.props; return p.q || p.label || p.title || p.prompt || ""; };
const show = (v) => (v == null ? "" : Array.isArray(v) ? v.join(", ") : typeof v === "object" ? Object.entries(v).map(([k, x]) => `${k}: ${x}`).join(", ") : String(v));

// The fold-back (YL.md, plan): what the person answered, as the message they
// would have typed. One line per answered question, in step order.
export function foldText(steps, ans) {
  const lines = steps.filter((m) => m.preset !== "page" && ans[m.id] !== undefined)
    .map((m) => {
      const q = question(m) || m.id;
      // "Next? Files" and "Budget: 5", never "Next?: Files".
      return `${q}${/[?:]$/.test(q) ? "" : ":"} ${m.preset === "camera" ? "Photo" : show(ans[m.id])}`;
    });
  return lines.length ? lines.join("\n") : "Sent";
}

export function Plan({ g, emitFor, Render }) {
  const p = resolve("plan", g.group.props);
  const steps = g.members.filter((m) => !m.group);
  // Pages are steps to read; only questions are answered and reviewed.
  const questions = steps.filter((m) => m.preset !== "page");
  const n = steps.length;
  const screen = useContext(ScreenCtx);
  const [at, setAt] = useState(0);
  const [ans, setAns] = useState({});
  const [done, setDone] = useState(false);
  const cur = Math.min(at, n);
  const has = (m) => ans[m.id] !== undefined;

  const submit = (a) => {
    const plan = Object.fromEntries(questions.filter((m) => a[m.id] !== undefined).map((m) => [m.id, a[m.id]]));
    emitFor(g.group)({ plan });
    setDone(true);
    // Fold back into the chat: a summary chip plus the answers as the person's message.
    screen?.fold?.(g.group.key, {
      title: p.title || "Plan",
      pages: steps.filter((m) => m.preset === "page").map((m) => resolve("page", m.props)),
      answers: questions.length,
      text: foldText(steps, a),
    });
    screen?.closeStage?.();
  };
  const next = (a = ans) => {
    if (cur >= n - 1 && !p.review) return submit(a);
    // Back from an edit: once every question has an answer, go straight to review.
    if (p.review && questions.length && cur >= steps.indexOf(questions[0]) && questions.every((m) => a[m.id] !== undefined)) return setAt(n);
    setAt(Math.min(cur + 1, n));
  };
  const capture = (m) => (v) => {
    const a = { ...ans, [m.id]: v[VALUE[m.preset]] };
    setAns(a);
    // One tap answers ask and choose; move on by itself.
    if (m.preset === "ask" || m.preset === "choose") setTimeout(() => next(a), 380);
    else if (m.preset !== "slide") next(a);
  };
  const nextOk = cur < n && (has(steps[cur]) || steps[cur].preset === "slide" || steps[cur].preset === "page");
  const onNext = () => {
    const m = steps[cur];
    if (m.preset === "slide" && !has(m)) {
      const a = { ...ans, [m.id]: resolve("slide", m.props).value };
      setAns(a);
      return next(a);
    }
    next();
  };

  if (done) {
    return (
      <div className="yl-block yl-project">
        <div className="yl-projhead"><span className="pill done">Sent</span><span className="yl-sub">{questions.length} answers</span></div>
        <div className="yl-q">{p.title || "Project"}</div>
        <Facts rows={questions.map((m) => [question(m) || m.id, show(ans[m.id])])} />
        <button className="bigbtn s full" onClick={() => { setDone(false); setAt(n > 0 && p.review ? n : 0); }}>Edit answers</button>
      </div>
    );
  }

  const review = cur >= n && p.review;
  return (
    <div className="yl-block yl-plan">
      <div className="yl-stephead">
        {p.title ? <div className="yl-q">{p.title}</div> : null}
        <div className="yl-sub">{!n ? "Waiting for questions" : review ? "Review" : `Step ${cur + 1} of ${n}`}</div>
        <div className="yl-plansegs">
          {steps.map((m, i) => <button key={m.key} className={`${i < cur || has(m) ? "d" : ""} ${i === cur ? "now" : ""}`} onClick={() => setAt(i)} aria-label={`Step ${i + 1}`} />)}
          {p.review ? <button className={review ? "now" : ""} onClick={() => setAt(n)} aria-label="Review" /> : null}
        </div>
      </div>
      {steps.map((m, i) => (
        <div key={m.key} className="yl-planstep" style={{ display: i === cur ? undefined : "none" }}>
          {m.preset === "page" ? <div className="yl-planpage"><Page p={resolve("page", m.props)} /></div> : <Render node={m} emit={capture(m)} />}
        </div>
      ))}
      {review ? (
        <div className="yl-planreview">
          {steps.map((m, i) => m.preset === "page" ? null : (
            <button key={m.key} className="yl-planrow" onClick={() => setAt(i)}>
              <span className="lbl">{question(m) || `Step ${i + 1}`}</span>
              <b>{has(m) ? show(ans[m.id]) : <i>Not answered</i>}</b>
              <span className="yl-flink">Edit</span>
            </button>
          ))}
        </div>
      ) : null}
      <div className="bigbtns">
        <button className="bigbtn s" disabled={cur === 0} onClick={() => setAt(cur - 1)}>Back</button>
        {review ? <button className="bigbtn p acc" onClick={() => submit(ans)}>{p.submit}</button>
          : <button className="bigbtn p acc" disabled={!nextOk} onClick={onNext}>{cur >= n - 1 ? (p.review ? "Review" : p.submit) : "Next"}</button>}
      </div>
    </div>
  );
}

function Facts({ rows }) {
  return (
    <div className="yl-facts">
      {rows.map(([k, v], i) => <div key={i} className="yl-fact"><span>{k}</span><b>{v || "—"}</b></div>)}
    </div>
  );
}

// ---------- project ----------

// A project card the agent can show any time. With open=<saved screen> the
// button reopens that screen on the device and tells the agent.
export function Project({ p, emit }) {
  const ctx = useContext(ScreenCtx);
  const rows = p.facts.map((f) => { const i = String(f).indexOf(":"); return i > 0 ? [f.slice(0, i).trim(), f.slice(i + 1).trim()] : [f, ""]; });
  const pct = typeof p.progress === "number" ? Math.max(0, Math.min(100, p.progress)) : null;
  const tap = () => {
    if (p.open) {
      if (ctx.dispatch) ctx.dispatch({ op: "show", screen: ctx.screen || "1", name: p.open, line: `show ${p.open}` });
      emit({ open: p.open });
    } else emit({ cta: p.cta });
  };
  return (
    <div className="yl-card yl-project">
      {p.img ? <img src={p.img} alt="" /> : null}
      <div className="yl-cardbody">
        <div className="yl-projhead">
          {p.status ? <span className="pill now">{p.status}</span> : null}
          {pct != null ? <span className="yl-sub">{pct}%</span> : null}
        </div>
        <div className="yl-q">{p.title || "Project"}</div>
        {pct != null ? <div className="yl-stepbar"><span style={{ width: `${pct}%` }} /></div> : null}
        {p.body ? <div className="yl-text">{p.body}</div> : null}
        {rows.length ? <Facts rows={rows} /> : null}
        {p.next.length ? (
          <div className="yl-projnext"><div className="lbl">Next</div><ul>{p.next.map((t, i) => <li key={i}>{t}</li>)}</ul></div>
        ) : null}
        {p.cta ? <button className="bigbtn p acc full" onClick={tap}>{p.cta}</button> : null}
      </div>
    </div>
  );
}

// ---------- narrate ----------

// The line a step speaks: its own `say`, else what it already shows.
function speech(m) {
  const p = m.props;
  if (typeof p.say === "string" && p.say) return p.say;
  const j = (...xs) => xs.filter(Boolean).map((x) => String(x).replace(/[.!?]?$/, (e) => e || ".")).join(" ");
  switch (m.preset) {
    case "page": return p.notes || j(p.title, p.body, ...(Array.isArray(p.points) ? p.points : []));
    case "compare": return j(p.title, ...(Array.isArray(p.notes) ? p.notes : []));
    case "card": return j(p.title, p.body);
    case "stat": return j(p.label, `${p.value}${p.unit ? ` ${p.unit}` : ""}`);
    case "image": case "video": return j(p.caption);
    case "chart": return j(p.title);
    case "math": return j(p.caption);
    default: return j(p.q, p.title);
  }
}

// Steps of a walkthrough: a deck speaks page by page, a storyboard frame by
// frame, a gallery item by item; anything else is one step.
function narrSteps(members) {
  const out = [];
  for (const m of members) {
    if (m.group) {
      m.members.filter((x) => !x.group).forEach((pg, i) => out.push({ key: `${m.key}:${i}`, kind: "deck", deck: m, index: i, node: pg, text: speech(pg) }));
    } else if (m.preset === "storyboard" || m.preset === "gallery") {
      const p = resolve(m.preset, m.props);
      const items = m.preset === "storyboard" ? p.frames : p.items;
      const caps = m.preset === "storyboard" ? p.notes : p.caps;
      const c = Math.max(items.length, caps.length);
      for (let i = 0; i < c; i++) out.push({ key: `${m.key}:${i}`, kind: "frame", node: m, index: i, src: items[i], title: p.title, text: caps[i] || "" });
    } else out.push({ key: m.key, kind: "node", node: m, text: speech(m) });
  }
  return out;
}

// Per-agent voice for voice=agent. The app gives each agent its own voice;
// on the web we pick the closest system voice by name.
const AGENT_VOICES = {
  Yui: ["Samantha", "Google US English", "Karen", "Zira"],
  Scout: ["Daniel", "Google UK English Male", "Arthur", "Oliver"],
  Coach: ["Fred", "Alex", "Google US English"],
};
function pickVoice(voices, want, agent, lang) {
  if (!voices.length) return null;
  const find = (name) => voices.find((v) => v.name.toLowerCase().includes(String(name).toLowerCase()));
  if (want && want !== "agent") return find(want) || voices.find((v) => v.lang === want) || null;
  for (const name of AGENT_VOICES[agent] || []) { const v = find(name); if (v) return v; }
  return voices.find((v) => v.lang === (lang || "en-US")) || voices.find((v) => v.lang.startsWith("en")) || null;
}

function useVoices() {
  const [voices, setVoices] = useState([]);
  useEffect(() => {
    const s = typeof window !== "undefined" && window.speechSynthesis;
    if (!s) return;
    const load = () => setVoices(s.getVoices());
    load();
    s.addEventListener("voiceschanged", load);
    return () => s.removeEventListener("voiceschanged", load);
  }, []);
  return voices;
}

// Speaks one line. Reports word positions for the captions, and always ends:
// with no speech engine (or a blocked one) it times the words instead.
function speak(text, { voice, rate, lang, silent, onWord, onEnd }) {
  let over = false;
  const end = () => { if (!over) { over = true; clearTimeout(guard); clearInterval(tick); onEnd(); } };
  const words = [...text.matchAll(/\S+/g)].map((m) => m.index);
  const perWord = 390 / (rate || 1);
  let tick = null;
  const timed = () => {
    let w = 0;
    tick = setInterval(() => { if (w < words.length) onWord(words[w++]); else end(); }, perWord);
  };
  const guard = setTimeout(end, words.length * perWord * 2.2 + 4000);
  const s = typeof window !== "undefined" && window.speechSynthesis;
  if (!s || !text || silent) { timed(); return () => { over = true; clearTimeout(guard); clearInterval(tick); }; }
  const u = new SpeechSynthesisUtterance(text);
  if (voice) u.voice = voice;
  if (lang) u.lang = lang;
  u.rate = rate || 1;
  u.onboundary = (e) => { if (e.name === "word" || e.name === undefined) onWord(e.charIndex); };
  u.onend = end;
  u.onerror = (e) => { if (e.error === "interrupted" || e.error === "canceled") return; if (!over) timed(); };
  s.cancel();
  s.speak(u);
  return () => { over = true; clearTimeout(guard); clearInterval(tick); s.cancel(); };
}

function Caption({ text, at }) {
  if (at < 0) return <div className="yl-caption">{text}</div>;
  const cut = text.indexOf(" ", at + 1);
  const upto = cut < 0 ? text.length : cut;
  return <div className="yl-caption"><span className="said">{text.slice(0, upto)}</span>{text.slice(upto)}</div>;
}

export function Narrate({ g, emitFor, Render }) {
  const p = resolve("narrate", g.group.props);
  const ctx = useContext(ScreenCtx);
  const voices = useVoices();
  const steps = narrSteps(g.members);
  const n = steps.length;
  const [cur, setCur] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [word, setWord] = useState(-1);
  const [full, setFull] = useState(false);
  const played = useRef(false);
  const at = Math.min(cur, Math.max(0, n - 1));
  const step = steps[at];
  const voice = pickVoice(voices, p.voice, ctx.agent, p.lang);

  // +auto: start on arrival (a browser may block speech until a tap; the
  // captions then run on their own timing).
  useEffect(() => { if (p.auto && n) setPlaying(true); /* eslint-disable-next-line */ }, [n > 0]);

  useEffect(() => {
    if (!playing || !step) return;
    if (!played.current) { played.current = true; emitFor(g.group)({ played: true }); }
    setWord(-1);
    const interactive = step.kind !== "frame" && QUIZ.has(step.node.preset);
    return speak(step.text, {
      voice, rate: p.rate, lang: p.lang,
      // No system voices (some headless browsers): captions only, on timing.
      silent: !voices.length,
      onWord: setWord,
      onEnd: () => {
        setWord(step.text.length);
        if (at >= n - 1) { setPlaying(false); emitFor(g.group)({ done: true, steps: n }); return; }
        // A question waits for its answer before the walkthrough goes on.
        if (interactive) { setPlaying(false); return; }
        setTimeout(() => setCur((c) => Math.min(c + 1, n - 1)), 650);
      },
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playing, at, n, voice && voice.name, voices.length > 0]);

  const jump = (i) => { setWord(-1); setCur(Math.max(0, Math.min(n - 1, i))); };

  const view = () => {
    if (!step) return <div className="yl-imgph"><span>Walkthrough</span><b>No steps yet</b></div>;
    if (step.kind === "deck") {
      return <Deck key={step.deck.key} g={step.deck} emitFor={emitFor} Render={Render} bare index={step.index} onIndex={(i) => jump(steps.findIndex((s) => s.deck === step.deck && s.index === i))} />;
    }
    if (step.kind === "frame") {
      return (
        <div className="yl-narrframe">
          {step.title ? <div className="yl-q">{step.title}</div> : null}
          {step.src ? <Media src={step.src} className="yl-narrmedia" /> : <div className="yl-fthumb ph big">{step.index + 1}</div>}
        </div>
      );
    }
    return <Render key={step.node.key} node={step.node} emit={emitFor(step.node)} />;
  };

  const controls = (
    <>
      {p.captions && step ? <Caption text={step.text} at={word} /> : null}
      <div className="yl-narrsegs">{steps.map((s, i) => <button key={s.key} className={`${i < at ? "d" : ""} ${i === at ? "now" : ""}`} onClick={() => jump(i)} aria-label={`Step ${i + 1}`} />)}</div>
      <div className="yl-narrbar">
        <button onClick={() => jump(at - 1)} disabled={at === 0} aria-label="Previous">⏮</button>
        <button className="play" onClick={() => setPlaying(!playing)} aria-label={playing ? "Pause" : "Play"}>{playing ? "❚❚" : "▶"}</button>
        <button onClick={() => jump(at + 1)} disabled={at >= n - 1} aria-label="Next">⏭</button>
      </div>
      <div className="yl-deckfoot">
        <span className="yl-sub">{n ? `${at + 1} / ${n}` : ""} · voice: {p.voice === "agent" ? `${ctx.agent || "agent"}${voice ? ` (${voice.name})` : ""}` : p.voice}</span>
        {!full ? <button className="yl-flink" onClick={() => setFull(true)}>⤢ Full screen</button> : null}
      </div>
    </>
  );

  return (
    <div className={`yl-block yl-narrate ${full ? "yl-full" : ""}`}>
      {full ? <FullClose onClose={() => setFull(false)} /> : null}
      {p.title ? <div className={full ? "yl-stagetitle" : "yl-q"}><span className="yl-narrdot" data-on={playing} />{p.title}</div> : null}
      <div className="yl-narrstage">{view()}</div>
      {controls}
    </div>
  );
}

export function Group({ g, emitFor, Render }) {
  const C = { deck: Deck, plan: Plan, narrate: Narrate, timeline: Timeline, sketch: Sketch }[g.group.preset];
  return C ? <C g={g} emitFor={emitFor} Render={Render} /> : null;
}
