"use client";

// Web renderers for the YL presets, plus say and custom.
// Each preset gets resolved props and emit(value). emit() is the event that
// goes back to the agent.
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { resolve } from "../../lib/yl/yl.mjs";
import { Calc, Chart, DataTable, MathBlock, Stat, Steps } from "./science";
import { LonePage, Project } from "./flows";
import { useLive } from "./stage";

// Sample agent data tables, so `table meals` has something to bind to.
export const TABLES = {
  meals: {
    cols: ["Time", "Meal", "Cal", "Protein"],
    rows: [["7:40", "Eggs + toast", 420, 26], ["12:15", "Chicken bowl", 640, 52], ["15:30", "Greek yogurt", 150, 20]],
  },
  workout: {
    cols: ["Lift", "Sets", "Reps", "Weight"],
    rows: [["Back squat", 5, 5, 225], ["Bench", 5, 5, 185], ["Row", 3, 10, 135]],
  },
};

const fmt = (s) => {
  s = Math.max(0, Math.ceil(s));
  const m = Math.floor(s / 60);
  return `${m}:${String(s % 60).padStart(2, "0")}`;
};

function beep(freq = 880, ms = 160) {
  try {
    const Ctx = window.AudioContext || window.webkitAudioContext;
    const ctx = beep.ctx || (beep.ctx = new Ctx());
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.frequency.value = freq;
    g.gain.setValueAtTime(0.15, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + ms / 1000);
    o.connect(g).connect(ctx.destination);
    o.start();
    o.stop(ctx.currentTime + ms / 1000);
  } catch {}
}

function Timer({ p, emit }) {
  const [round, setRound] = useState(1);
  const [phase, setPhase] = useState("work");
  const [left, setLeft] = useState(p.up ? 0 : p.work);
  const [run, setRun] = useState(!!p.auto);
  const [done, setDone] = useState(false);
  const st = useRef({});
  st.current = { round, phase, left, p };

  // A patch changes the plan without restarting: clamp what is left.
  useEffect(() => {
    if (p.up) return;
    const dur = phase === "work" ? p.work : p.rest;
    setLeft((l) => (run ? Math.min(l, dur) : dur));
    setRound((r) => Math.min(r, p.rounds));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [p.work, p.rest, p.rounds]);

  useEffect(() => {
    if (!run) return;
    const t = setInterval(() => {
      const { round, phase, left, p } = st.current;
      if (p.up) { setLeft(left + 0.1); return; }
      const nl = left - 0.1;
      if (nl > 0.05) {
        if (p.sound && Math.ceil(nl) !== Math.ceil(left) && Math.ceil(nl) <= 3) beep(660, 90);
        setLeft(nl);
        return;
      }
      if (phase === "work" && p.rest > 0 && round < p.rounds) {
        setPhase("rest"); setLeft(p.rest); if (p.sound) beep(440, 260);
      } else if (round < p.rounds) {
        setRound(round + 1); setPhase("work"); setLeft(p.work); if (p.sound) beep(990, 260);
      } else {
        setLeft(0); setRun(false); setDone(true); if (p.sound) beep(1200, 500);
        emit({ done: true, rounds: p.rounds });
      }
    }, 100);
    return () => clearInterval(t);
  }, [run, emit]);

  const dur = phase === "work" ? p.work : p.rest;
  const pct = p.up ? 100 : dur ? (left / dur) * 100 : 0;
  const col = phase === "work" ? "var(--arnold)" : "var(--accent2)";
  const reset = () => { setRun(false); setDone(false); setRound(1); setPhase("work"); setLeft(p.up ? 0 : p.work); };
  // What the stage pill in the chat shows while this timer is on the stage.
  useLive(done ? "Done" : run ? `${fmt(left)}${p.rounds > 1 ? ` · ${round}/${p.rounds}` : ""}` : null);

  return (
    <div className="yl-timer">
      {p.label ? <div className="lbl" style={{ color: col }}>{p.label}</div> : null}
      {p.rounds > 1 ? <div className="yl-sub">Round {round} of {p.rounds}</div> : null}
      <div className="ring" style={{ background: `conic-gradient(${col} 0 ${pct}%, #24273a ${pct}% 100%)` }}>
        <div className="innr">
          <div className="t">{fmt(left)}</div>
          <div className="ph" style={{ color: col }}>{done ? "DONE" : p.up ? "ELAPSED" : phase === "work" ? (p.rest ? "WORK" : "GO") : "REST"}</div>
        </div>
      </div>
      {p.rounds > 1 ? (
        <div className="rounds">{Array.from({ length: p.rounds }, (_, i) => <span key={i} className={i + 1 < round || done ? "d" : ""} />)}</div>
      ) : null}
      <div className="bigbtns">
        <button className="bigbtn s" onClick={reset}>Reset</button>
        <button className="bigbtn p" onClick={() => { if (done) reset(); setRun(!run); if (!run) emit({ started: true }); }}>
          {run ? "Pause" : done ? "Again" : "Start"}
        </button>
      </div>
    </div>
  );
}

// Quiz: with answer= set, a pick is graded. The event carries `correct` and
// the card shows the right option and the `why` line. Answers stay open, so
// the person can try again.
const graded = (p) => p.answer !== undefined && p.answer !== true;
const same = (a, b) => a.length === b.length && a.every((x) => b.includes(x));
const quizClass = (p, o, chosen) => {
  if (!graded(p) || !chosen) return "";
  const right = Array.isArray(p.answer) ? p.answer.includes(o) : o === p.answer;
  return right ? "ok" : chosen.includes(o) ? "no" : "";
};
function QuizNote({ p, correct }) {
  if (!graded(p) || correct == null) return null;
  return <div className={`yl-quiznote ${correct ? "ok" : "no"}`}><b>{correct ? "Right." : "Not quite."}</b> {p.why || (correct ? "" : `It's ${Array.isArray(p.answer) ? p.answer.join(", ") : p.answer}.`)}</div>;
}

// Answers can change (YL.md section 7): every answer after the first goes
// back with `changed: true` and the agent treats the newest as the answer.
// `+lock` freezes the component: the answer shown stays, taps do nothing.
function useAnswer(emit) {
  const n = useRef(0);
  return (v) => emit(n.current++ ? { ...v, changed: true } : v);
}

function Ask({ p, emit }) {
  const [a, setA] = useState(null);
  const send = useAnswer(emit);
  const quiz = graded(p);
  return (
    <div className={`yl-block ${p.lock ? "locked" : ""}`}>
      <div className="yl-q">{p.q}</div>
      <div className="bigbtns">
        {p.options.map((o, i) => (
          <button key={o} disabled={!!p.lock} className={`bigbtn ${i === 0 && !quiz ? "p acc" : "s"} ${a && a !== o && !quiz ? "dim" : ""} ${quizClass(p, o, a ? [a] : null)}`}
            onClick={() => { if (a === o) return; setA(o); send(quiz ? { answer: o, correct: o === p.answer } : { answer: o }); }}>{o}</button>
        ))}
      </div>
      <QuizNote p={p} correct={a == null ? null : a === p.answer} />
    </div>
  );
}

function Other({ onSubmit }) {
  const [open, setOpen] = useState(false);
  const [v, setV] = useState("");
  if (!open) return <button className="chip" onClick={() => setOpen(true)}>Type your own</button>;
  return (
    <form className="yl-otherin" onSubmit={(e) => { e.preventDefault(); if (v.trim()) onSubmit(v.trim()); }}>
      <input autoFocus value={v} onChange={(e) => setV(e.target.value)} placeholder="Type it" />
      <button className="chip on">Send</button>
    </form>
  );
}

function Choose({ p, emit }) {
  const [sel, setSel] = useState(null);
  const send = useAnswer(emit);
  const quiz = graded(p);
  const pickIt = (o, other) => {
    if (sel === o) return;
    setSel(o);
    send({ choice: o, ...(other ? { other: true } : {}), ...(quiz ? { correct: o === p.answer } : {}) });
  };
  return (
    <div className={`yl-block ${p.lock ? "locked" : ""}`}>
      {p.q ? <div className="yl-q">{p.q}</div> : null}
      <div className="chips big">
        {p.options.map((o) => <button key={o} disabled={!!p.lock} className={`chip ${sel === o && !quiz ? "on" : ""} ${quizClass(p, o, sel ? [sel] : null)}`} onClick={() => pickIt(o)}>{o}</button>)}
        {sel && !p.options.includes(sel) ? <button className="chip on" disabled>{sel}</button> : null}
        {p.other && !p.lock ? <Other onSubmit={(v) => pickIt(v, true)} /> : null}
      </div>
      <QuizNote p={p} correct={sel == null ? null : sel === p.answer} />
    </div>
  );
}

function Pick({ p, emit }) {
  const [sel, setSel] = useState([]);
  const [extra, setExtra] = useState([]);
  const [sent, setSent] = useState(null);
  const [shown, setShown] = useState(null); // the last sent picks, for the quiz marks
  const send = useAnswer(emit);
  const quiz = graded(p);
  const tog = (o) => { setShown(null); setSel((s) => (s.includes(o) ? s.filter((x) => x !== o) : p.max && s.length >= p.max ? s : [...s, o])); };
  const fresh = sel.length > 0 && !(sent && same(sel, sent));
  const done = () => {
    if (!fresh) return;
    setSent(sel);
    setShown(sel);
    send(quiz ? { picked: sel, correct: same(sel, p.answer) } : { picked: sel });
  };
  return (
    <div className={`yl-block ${p.lock ? "locked" : ""}`}>
      {p.q ? <div className="yl-q">{p.q}</div> : null}
      <div className="chips big">
        {[...p.options, ...extra].map((o) => <button key={o} disabled={!!p.lock} className={`chip ${sel.includes(o) && !(quiz && shown) ? "on" : ""} ${quizClass(p, o, shown)}`} onClick={() => tog(o)}>{sel.includes(o) ? "✓ " : ""}{o}</button>)}
        {p.other && !p.lock ? <Other onSubmit={(v) => { setShown(null); setExtra((e) => [...e, v]); setSel((s) => [...s, v]); }} /> : null}
      </div>
      {p.lock ? null : <button className="bigbtn p acc full" disabled={!fresh} onClick={done}>{sent && !fresh ? "Sent" : `${p.submit}${sel.length ? ` (${sel.length})` : ""}`}</button>}
      <QuizNote p={p} correct={shown == null || !quiz ? null : same(shown, p.answer)} />
    </div>
  );
}

function Slide({ p, emit }) {
  const [v, setV] = useState(p.value);
  const last = useRef(null);
  const send = useAnswer(emit);
  const release = () => { if (v === last.current) return; last.current = v; send({ value: v }); };
  useEffect(() => setV(p.value), [p.value]);
  return (
    <div className={`yl-block ${p.lock ? "locked" : ""}`}>
      {p.label ? <div className="yl-q">{p.label}</div> : null}
      <div className="yl-slideval">{v}{p.unit ? ` ${p.unit}` : ""}</div>
      <input type="range" className="yl-range" min={p.min} max={p.max} step={p.step} value={v} disabled={!!p.lock}
        onChange={(e) => setV(Number(e.target.value))} onPointerUp={release} onKeyUp={release} />
      <div className="slabels"><span>{p.lo ?? p.min}</span><span>{p.hi ?? p.max}</span></div>
    </div>
  );
}

// Voice input via the Web Speech API where the browser has it.
function useSpeech(onText) {
  const [on, setOn] = useState(false);
  const rec = useRef(null);
  const ok = typeof window !== "undefined" && (window.SpeechRecognition || window.webkitSpeechRecognition);
  const start = () => {
    if (!ok) return false;
    const R = window.SpeechRecognition || window.webkitSpeechRecognition;
    const r = new R();
    r.interimResults = true;
    r.onresult = (e) => onText(Array.from(e.results).map((x) => x[0].transcript).join(" "), e.results[e.results.length - 1].isFinal);
    r.onend = () => setOn(false);
    r.start();
    rec.current = r;
    setOn(true);
    return true;
  };
  const stop = () => { rec.current && rec.current.stop(); setOn(false); };
  return { on, ok: !!ok, start, stop };
}

function MicIcon() {
  return <svg viewBox="0 0 24 24" width="18" height="18" fill="#fff"><path d="M12 14a3 3 0 0 0 3-3V5a3 3 0 1 0-6 0v6a3 3 0 0 0 3 3zm5-3a5 5 0 0 1-10 0H5a7 7 0 0 0 6 6.92V21h2v-3.08A7 7 0 0 0 19 11h-2z" /></svg>;
}

function VoiceField({ value, onChange }) {
  const sp = useSpeech((t) => onChange(t));
  return (
    <div className="yl-voicefield">
      <input value={value || ""} onChange={(e) => onChange(e.target.value)} placeholder={sp.ok ? "Talk or type" : "Type (voice needs Chrome/Safari)"} />
      <button type="button" className={`mic ${sp.on ? "live" : ""}`} onClick={() => (sp.on ? sp.stop() : sp.start())}><MicIcon /></button>
    </div>
  );
}

const human = (k) => k.replace(/_/g, " ").replace(/^./, (c) => c.toUpperCase());

function Form({ p, emit }) {
  const [v, setV] = useState({});
  const [err, setErr] = useState("");
  const set = (k, x) => setV((o) => ({ ...o, [k]: x }));
  const submit = (e) => {
    e.preventDefault();
    const miss = p.fields.filter((f) => f.required && (v[f.key] == null || v[f.key] === "")).map((f) => f.label || human(f.key));
    if (miss.length) return setErr(`Needed: ${miss.join(", ")}`);
    setErr("");
    emit({ form: v });
  };
  return (
    <form className="yl-block yl-form" onSubmit={submit}>
      {p.title ? <div className="yl-q">{p.title}</div> : null}
      {p.fields.map((f) => {
        const label = (f.label || human(f.key)) + (f.required ? " *" : "");
        const t = f.type || "text";
        let input;
        if (t === "voice") input = <VoiceField value={v[f.key]} onChange={(x) => set(f.key, x)} />;
        else if (t === "long") input = <textarea rows={3} value={v[f.key] || ""} onChange={(e) => set(f.key, e.target.value)} />;
        else if (t === "yes") input = (
          <button type="button" className={`yl-toggle ${v[f.key] ? "on" : ""}`} onClick={() => set(f.key, !v[f.key])}><span /></button>
        );
        else if (t === "range") {
          const cur = v[f.key] ?? Math.round((f.min + f.max) / 2);
          input = (
            <div className="yl-inlinerange">
              <input type="range" className="yl-range" min={f.min} max={f.max} value={cur} onChange={(e) => set(f.key, Number(e.target.value))} />
              <b>{cur}</b>
            </div>
          );
        } else if (t === "choice") input = (
          <div className="chips">{f.options.map((o) => <button type="button" key={o} className={`chip ${v[f.key] === o ? "on" : ""}`} onClick={() => set(f.key, o)}>{o}</button>)}</div>
        );
        else if (t === "photo") input = <input type="file" accept="image/*" capture="environment" onChange={(e) => set(f.key, e.target.files[0] && e.target.files[0].name)} />;
        else {
          const map = { number: "number", email: "email", phone: "tel", date: "date", time: "time", url: "url" };
          input = <input type={map[t] || "text"} value={v[f.key] || ""} onChange={(e) => set(f.key, t === "number" ? Number(e.target.value) : e.target.value)} />;
        }
        return (
          <label key={f.key} className={`yl-field ${t === "yes" ? "row" : ""}`}>
            <span className="lbl">{label}</span>
            {input}
          </label>
        );
      })}
      {err ? <div className="yl-err">{err}</div> : null}
      <button className="bigbtn p acc full">{p.submit}</button>
    </form>
  );
}

function List({ p, emit }) {
  const [done, setDone] = useState({});
  const Tag = p.num ? "ol" : "ul";
  return (
    <div className="yl-block">
      {p.title ? <div className="yl-q">{p.title}</div> : null}
      <Tag className={`yl-list ${p.check ? "check" : ""}`}>
        {p.items.map((it, i) => (
          <li key={i} className={done[i] ? "done" : ""}
            onClick={p.check ? () => { const n = !done[i]; setDone({ ...done, [i]: n }); emit({ item: it, checked: n }); } : undefined}>
            {p.check ? <span className="box">{done[i] ? "✓" : ""}</span> : null}
            <span>{it}</span>
          </li>
        ))}
      </Tag>
    </div>
  );
}

function Table({ p, emit }) {
  const bound = !p.cols && p.name ? TABLES[p.name] : null;
  return <DataTable p={p} emit={emit} bound={bound} human={human} />;
}

function Card({ p, emit }) {
  return (
    <div className="yl-card">
      {p.img ? <img src={p.img} alt="" /> : null}
      <div className="yl-cardbody">
        {p.tag ? <span className="pill now">{p.tag}</span> : null}
        {p.sub ? <div className="yl-sub">{p.sub}</div> : null}
        <div className="yl-q">{p.title}</div>
        {p.body ? <div className="yl-text">{p.body}</div> : null}
        {p.cta ? <button className="bigbtn p acc full" onClick={() => emit({ cta: p.cta })}>{p.cta}</button> : null}
      </div>
    </div>
  );
}

function Image({ p, emit }) {
  if (p.edit && p.src) return <ImageEdit p={p} emit={emit} />;
  return (
    <figure className="yl-image">
      {p.src ? <img src={p.src} alt={p.alt || p.caption || ""} style={{ objectFit: p.fit }} />
        : <div className="yl-imgph"><span>Image to generate</span><b>{p.prompt || "no prompt"}</b></div>}
      {p.caption ? <figcaption>{p.caption}</figcaption> : null}
    </figure>
  );
}

// ---------- media ----------

const isVideo = (src) => /\.(mp4|webm|mov|m4v)(\?|#|$)/i.test(src || "");
const r1 = (n) => Math.round(n * 10) / 10;

function Media({ src, alt, className, controls, onClick }) {
  if (isVideo(src)) return <video src={src} className={className} playsInline muted loop autoPlay={!controls} controls={controls} onClick={onClick} />;
  return <img src={src} alt={alt || ""} className={className} onClick={onClick} draggable={false} />;
}

// Full-screen viewer, drawn over the phone screen (not the page).
function Lightbox({ items, caps = [], index, onClose, onIndex, anchor }) {
  const [host, setHost] = useState(null);
  useEffect(() => { setHost((anchor.current && anchor.current.closest(".screen")) || document.body); }, [anchor]);
  useEffect(() => {
    const k = (e) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight" && index < items.length - 1) onIndex(index + 1);
      if (e.key === "ArrowLeft" && index > 0) onIndex(index - 1);
    };
    window.addEventListener("keydown", k);
    return () => window.removeEventListener("keydown", k);
  }, [index, items.length, onClose, onIndex]);
  if (!host) return null;
  return createPortal(
    <div className="yl-lb" onClick={onClose}>
      <button className="yl-lb-x" onClick={onClose} aria-label="Close">×</button>
      <div className="yl-lb-media" onClick={(e) => e.stopPropagation()}>
        <Media src={items[index]} alt={caps[index]} controls />
      </div>
      <div className="yl-lb-foot" onClick={(e) => e.stopPropagation()}>
        <button disabled={index === 0} onClick={() => onIndex(index - 1)} aria-label="Previous">‹</button>
        <span>{caps[index] || `${index + 1} of ${items.length}`}</span>
        <button disabled={index >= items.length - 1} onClick={() => onIndex(index + 1)} aria-label="Next">›</button>
      </div>
    </div>,
    host,
  );
}

function useViewer(emit) {
  const [open, setOpen] = useState(null);
  const anchor = useRef(null);
  const show = (i) => { setOpen(i); emit({ open: true, index: i }); };
  return { anchor, show, open, close: () => setOpen(null), setIndex: setOpen };
}

function Gallery({ p, emit }) {
  const [sel, setSel] = useState([]);
  const [cur, setCur] = useState(0);
  const v = useViewer(emit);
  const drag = useRef(null);
  const n = p.items.length;
  const tog = (i) => setSel((s) => (s.includes(i) ? s.filter((x) => x !== i) : p.max && s.length >= p.max ? s : [...s, i]));

  const tile = (src, i, style, onClick) => (
    <div key={i} className={`yl-gtile ${sel.includes(i) ? "on" : ""}`} style={style}>
      <Media src={src} alt={p.caps[i]} onClick={onClick || (() => v.show(i))} />
      {p.caps[i] && p.layout !== "grid" ? <div className="yl-gcap">{p.caps[i]}</div> : null}
      {p.pick ? <button className="yl-gpick" onClick={(e) => { e.stopPropagation(); tog(i); }} aria-label="Pick">{sel.includes(i) ? "✓" : ""}</button> : null}
    </div>
  );

  let body;
  if (!n) body = <div className="yl-imgph"><span>Gallery</span><b>No media yet</b></div>;
  else if (p.layout === "row3d") {
    // Coverflow: the current item faces front, neighbours turn away.
    const down = (e) => { drag.current = e.clientX; };
    const up = (e) => {
      if (drag.current == null) return;
      const dx = e.clientX - drag.current;
      drag.current = null;
      if (dx < -30 && cur < n - 1) setCur(cur + 1);
      if (dx > 30 && cur > 0) setCur(cur - 1);
    };
    body = (
      <>
        <div className="yl-g3d" onPointerDown={down} onPointerUp={up} onPointerLeave={() => (drag.current = null)}>
          {p.items.map((src, i) => {
            const o = i - cur;
            const a = Math.abs(o);
            return tile(src, i, {
              transform: `translateX(${o * 46}%) translateZ(${-a * 90}px) rotateY(${o === 0 ? 0 : o > 0 ? -38 : 38}deg)`,
              zIndex: 100 - a,
              opacity: a > 2 ? 0 : 1,
            }, () => (o === 0 ? v.show(i) : setCur(i)));
          })}
        </div>
        <div className="yl-gdots">{p.items.map((_, i) => <button key={i} className={i === cur ? "on" : ""} onClick={() => setCur(i)} aria-label={`Item ${i + 1}`} />)}</div>
      </>
    );
  } else body = <div className={`yl-g yl-g-${p.layout}`}>{p.items.map((src, i) => tile(src, i))}</div>;

  return (
    <div className="yl-block yl-gallery" ref={v.anchor}>
      {p.title ? <div className="yl-q">{p.title}</div> : null}
      {body}
      {p.pick ? <button className="bigbtn p acc full" onClick={() => emit({ picked: sel })}>{p.submit}{sel.length ? ` (${sel.length})` : ""}</button> : null}
      {v.open != null ? <Lightbox items={p.items} caps={p.caps} index={v.open} onClose={v.close} onIndex={v.setIndex} anchor={v.anchor} /> : null}
    </div>
  );
}

function Video({ p, emit }) {
  const played = useRef(false);
  if (!p.src) return <figure className="yl-image"><div className="yl-imgph"><span>Video to generate</span><b>{p.prompt || "no prompt"}</b></div></figure>;
  return (
    <figure className="yl-image yl-video">
      <video src={p.src} poster={p.poster} controls playsInline loop={p.loop} autoPlay={p.auto} muted={p.mute || p.auto}
        onPlay={() => { if (!played.current) { played.current = true; emit({ played: true }); } }}
        onEnded={() => emit({ ended: true })} />
      {p.caption ? <figcaption>{p.caption}</figcaption> : null}
    </figure>
  );
}

// Numbered highlight boxes, in percent of the image.
function Boxes({ hl }) {
  return hl.map((b, i) => (
    <div key={i} className="yl-hl" style={{ left: `${b[0]}%`, top: `${b[1]}%`, width: `${b[2]}%`, height: `${b[3]}%` }}><span>{i + 1}</span></div>
  ));
}

function Compare({ p, emit }) {
  const [x, setX] = useState(50);
  const [showAfter, setShowAfter] = useState(true);
  const [mode, setMode] = useState(p.mode);
  const [chose, setChose] = useState(null);
  const box = useRef(null);
  useEffect(() => setMode(p.mode), [p.mode]);
  const [la, lb] = [p.labels[0] || "Before", p.labels[1] || "After"];
  const move = (e) => {
    if (e.type === "pointermove" && !e.buttons) return;
    const r = box.current.getBoundingClientRect();
    setX(Math.max(0, Math.min(100, ((e.clientX - r.left) / r.width) * 100)));
  };

  let view;
  if (mode === "side") view = (
    <div className="yl-cside">
      <div className="yl-cpane"><img src={p.before} alt={la} /><span className="yl-ctag">{la}</span></div>
      <div className="yl-cpane"><img src={p.after} alt={lb} /><Boxes hl={p.hl} /><span className="yl-ctag r">{lb}</span></div>
    </div>
  );
  else if (mode === "toggle") view = (
    <>
      <div className="yl-cpane" onClick={() => setShowAfter(!showAfter)}>
        <img src={showAfter ? p.after : p.before} alt={showAfter ? lb : la} />
        {showAfter ? <Boxes hl={p.hl} /> : null}
        <span className="yl-ctag">{showAfter ? lb : la}</span>
      </div>
      <div className="yl-seg">
        <button className={!showAfter ? "on" : ""} onClick={() => setShowAfter(false)}>{la}</button>
        <button className={showAfter ? "on" : ""} onClick={() => setShowAfter(true)}>{lb}</button>
      </div>
    </>
  );
  else view = (
    <div className="yl-cpane yl-cslider" ref={box} onPointerDown={move} onPointerMove={move}>
      <img src={p.after} alt={lb} draggable={false} />
      <img className="yl-cbefore" src={p.before} alt={la} draggable={false} style={{ clipPath: `inset(0 ${100 - x}% 0 0)` }} />
      <Boxes hl={p.hl} />
      <div className="yl-cbar" style={{ left: `${x}%` }}><span>‹ ›</span></div>
      <span className="yl-ctag">{la}</span><span className="yl-ctag r">{lb}</span>
    </div>
  );

  return (
    <div className="yl-block yl-compare">
      {p.title ? <div className="yl-q">{p.title}</div> : null}
      {view}
      <div className="yl-seg sm">
        {["slider", "side", "toggle"].map((m) => <button key={m} className={mode === m ? "on" : ""} onClick={() => setMode(m)}>{m}</button>)}
      </div>
      {p.notes.length ? (
        <ol className="yl-cnotes">{p.notes.map((t, i) => <li key={i}><b>{i + 1}</b>{t}</li>)}</ol>
      ) : null}
      {p.pick ? (
        <div className="bigbtns">
          {[la, lb].map((l) => <button key={l} className={`bigbtn s ${chose && chose !== l ? "dim" : ""} ${chose === l ? "p acc" : ""}`} onClick={() => { setChose(l); emit({ choice: l }); }}>{l}</button>)}
        </div>
      ) : null}
    </div>
  );
}

function Storyboard({ p, emit }) {
  const count = Math.max(p.frames.length, p.notes.length);
  const [order, setOrder] = useState(() => Array.from({ length: count }, (_, i) => i));
  const [moved, setMoved] = useState(false);
  const [open, setOpen] = useState(null); // frame whose comment box is open
  const [said, setSaid] = useState({});
  const v = useViewer(emit);
  useEffect(() => { setOrder(Array.from({ length: count }, (_, i) => i)); setMoved(false); }, [count]);
  const swap = (at, d) => {
    const o = [...order];
    [o[at], o[at + d]] = [o[at + d], o[at]];
    setOrder(o);
    setMoved(true);
  };
  const send = (e, f) => {
    e.preventDefault();
    const t = e.target.c.value.trim();
    if (!t) return;
    setSaid((s) => ({ ...s, [f]: [...(s[f] || []), t] }));
    emit({ frame: f, comment: t });
    setOpen(null);
  };
  return (
    <div className="yl-block yl-story" ref={v.anchor}>
      {p.title ? <div className="yl-q">{p.title}<span className="yl-bound">{count} frames</span></div> : null}
      {order.map((f, at) => (
        <div key={f} className="yl-frame">
          <div className="yl-fnum">{at + 1}</div>
          {p.frames[f] ? <Media src={p.frames[f]} className="yl-fthumb" onClick={() => v.show(f)} /> : <div className="yl-fthumb ph">{f + 1}</div>}
          <div className="yl-fbody">
            <div className="yl-fnote">{p.notes[f] || <span className="yl-sub">Frame {f + 1}</span>}</div>
            {(said[f] || []).map((c, i) => <div key={i} className="yl-fcom">{c}</div>)}
            {open === f ? (
              <form className="yl-otherin" onSubmit={(e) => send(e, f)}>
                <input name="c" autoFocus placeholder="Comment on this frame" />
                <button className="chip on">Send</button>
              </form>
            ) : p.comment ? <button className="yl-flink" onClick={() => setOpen(f)}>Comment</button> : null}
          </div>
          {p.reorder ? (
            <div className="yl-fmove">
              <button disabled={at === 0} onClick={() => swap(at, -1)} aria-label="Move up">▲</button>
              <button disabled={at === order.length - 1} onClick={() => swap(at, 1)} aria-label="Move down">▼</button>
            </div>
          ) : null}
        </div>
      ))}
      {p.reorder ? <button className="bigbtn p acc full" disabled={!moved} onClick={() => { emit({ order }); setMoved(false); }}>{moved ? "Save order" : "Order saved"}</button> : null}
      {v.open != null ? <Lightbox items={p.frames} caps={p.notes} index={v.open} onClose={v.close} onIndex={v.setIndex} anchor={v.anchor} /> : null}
    </div>
  );
}

// image URL +edit: circle or box an area, say what to change. The agent gets
// the box (percent of the image), the lasso path when drawn freehand, and the
// instruction, runs the edit, and can answer with a compare.
function ImageEdit({ p, emit }) {
  const [tool, setTool] = useState("circle");
  const [pts, setPts] = useState([]);
  const [rect, setRect] = useState(null);
  const [sent, setSent] = useState(false);
  const [text, setText] = useState("");
  const area = useRef(null);
  const drawing = useRef(false);
  const at = (e) => {
    const r = area.current.getBoundingClientRect();
    return [Math.max(0, Math.min(100, ((e.clientX - r.left) / r.width) * 100)), Math.max(0, Math.min(100, ((e.clientY - r.top) / r.height) * 100))];
  };
  const down = (e) => {
    e.preventDefault();
    e.currentTarget.setPointerCapture(e.pointerId);
    drawing.current = true;
    setSent(false);
    const q = at(e);
    if (tool === "circle") { setPts([q]); setRect(null); } else { setRect([q, q]); setPts([]); }
  };
  const moveTo = (e) => {
    if (!drawing.current) return;
    const q = at(e);
    if (tool === "circle") setPts((s) => [...s, q]); else setRect((r) => [r[0], q]);
  };
  const up = () => { drawing.current = false; };
  const bbox = () => {
    const src = tool === "circle" ? pts : rect || [];
    if (src.length < 2) return null;
    const xs = src.map((q) => q[0]);
    const ys = src.map((q) => q[1]);
    const x = Math.min(...xs), y = Math.min(...ys);
    const w = Math.max(...xs) - x, h = Math.max(...ys) - y;
    return w < 1 || h < 1 ? null : [r1(x), r1(y), r1(w), r1(h)];
  };
  const b = bbox();
  const submit = (e) => {
    e.preventDefault();
    if (!b || !text.trim()) return;
    const edit = { box: b, instruction: text.trim() };
    if (tool === "circle" && pts.length > 2) {
      const step = Math.max(1, Math.ceil(pts.length / 24));
      edit.path = pts.filter((_, i) => i % step === 0).map((q) => [r1(q[0]), r1(q[1])]);
    }
    emit({ edit });
    setSent(true);
  };
  const clear = () => { setPts([]); setRect(null); setSent(false); };
  return (
    <div className="yl-block yl-edit">
      {p.caption ? <div className="yl-q">{p.caption}</div> : null}
      <div className="yl-editarea" ref={area} onPointerDown={down} onPointerMove={moveTo} onPointerUp={up} onPointerCancel={up}>
        <img src={p.src} alt={p.alt || ""} draggable={false} />
        <svg viewBox="0 0 100 100" preserveAspectRatio="none">
          {pts.length > 1 ? <polygon points={pts.map((q) => q.join(",")).join(" ")} className="yl-lasso" /> : null}
          {rect ? <rect x={Math.min(rect[0][0], rect[1][0])} y={Math.min(rect[0][1], rect[1][1])} width={Math.abs(rect[1][0] - rect[0][0])} height={Math.abs(rect[1][1] - rect[0][1])} className="yl-lasso" /> : null}
        </svg>
        {!b ? <div className="yl-edithint">{tool === "circle" ? "Circle" : "Drag a box around"} what to change</div> : null}
      </div>
      <div className="yl-seg sm">
        <button className={tool === "circle" ? "on" : ""} onClick={() => { setTool("circle"); clear(); }}>Circle</button>
        <button className={tool === "box" ? "on" : ""} onClick={() => { setTool("box"); clear(); }}>Box</button>
        <button onClick={clear}>Clear</button>
      </div>
      <form className="yl-otherin" onSubmit={submit}>
        <input value={text} onChange={(e) => setText(e.target.value)} placeholder={b ? "What should change here?" : "Mark an area first"} />
        <button className={`chip ${b && text.trim() ? "on" : ""}`}>{sent ? "Sent" : "Send"}</button>
      </form>
    </div>
  );
}

function Camera({ p, emit }) {
  const vid = useRef(null);
  const [stream, setStream] = useState(null);
  const [shot, setShot] = useState(null);
  const [fallback, setFallback] = useState(false);
  useEffect(() => () => stream && stream.getTracks().forEach((t) => t.stop()), [stream]);
  const open = async () => {
    try {
      const s = await navigator.mediaDevices.getUserMedia({ video: { facingMode: p.facing === "front" ? "user" : "environment" } });
      setStream(s);
      setTimeout(() => { if (vid.current) { vid.current.srcObject = s; vid.current.play(); } }, 0);
    } catch { setFallback(true); }
  };
  const snap = () => {
    const v = vid.current;
    const c = document.createElement("canvas");
    c.width = v.videoWidth; c.height = v.videoHeight;
    c.getContext("2d").drawImage(v, 0, 0);
    const url = c.toDataURL("image/jpeg", 0.7);
    setShot(url);
    stream.getTracks().forEach((t) => t.stop());
    setStream(null);
    emit({ photo: `jpeg ${Math.round(url.length * 0.75 / 1024)} KB`, scan: p.scan });
  };
  const file = (e) => {
    const f = e.target.files[0];
    if (!f) return;
    setShot(URL.createObjectURL(f));
    emit({ photo: `${f.type} ${Math.round(f.size / 1024)} KB`, scan: p.scan });
  };
  return (
    <div className="yl-block">
      <div className="yl-q">{p.prompt}</div>
      <div className="yl-cam">
        {shot ? <img src={shot} alt="capture" /> : stream ? <video ref={vid} playsInline muted /> : (
          <div className="yl-camph">{p.scan ? "Document scan" : "Camera"} · {p.facing}</div>
        )}
      </div>
      {stream ? <button className="bigbtn p acc full" onClick={snap}>Capture</button>
        : fallback ? <input type="file" accept="image/*" capture={p.facing === "front" ? "user" : "environment"} onChange={file} />
        : <button className="bigbtn p acc full" onClick={shot ? () => { setShot(null); open(); } : open}>{shot ? "Retake" : "Open camera"}</button>}
    </div>
  );
}

function Mic({ p, emit }) {
  const [text, setText] = useState("");
  const [typed, setTyped] = useState(false);
  const sp = useSpeech((t, fin) => { setText(t); if (fin) emit({ transcript: t }); });
  useEffect(() => { if (p.auto) sp.start(); /* eslint-disable-next-line */ }, []);
  return (
    <div className="yl-block yl-mic">
      <div className="yl-q">{p.prompt}</div>
      <button className={`yl-micbig ${sp.on ? "live" : ""}`} onClick={() => (sp.on ? sp.stop() : sp.ok ? sp.start() : setTyped(true))}>
        <MicIcon />
      </button>
      <div className="yl-sub">{sp.on ? "Listening..." : sp.ok ? "Tap to talk" : "Voice needs Chrome or Safari. Type instead."}</div>
      {text ? <div className="b in">{text}</div> : null}
      {typed || !sp.ok ? (
        <form className="yl-otherin" onSubmit={(e) => { e.preventDefault(); const t = e.target.t.value.trim(); if (t) { setText(t); emit({ transcript: t, typed: true }); e.target.reset(); } }}>
          <input name="t" placeholder="Type it" />
          <button className="chip on">Send</button>
        </form>
      ) : null}
    </div>
  );
}

function Say({ p }) {
  return <div className="b in yl-say">{p.text}</div>;
}

// custom {json}: a tiny fixed vocabulary of primitives. Anything else shows
// as raw JSON so the gap is visible (and gets logged for promotion).
function Custom({ spec, emit }) {
  const r = (n, i) => {
    if (n == null) return null;
    if (typeof n === "string") return <span key={i}>{n}</span>;
    const kids = (n.children || []).map(r);
    switch (n.type) {
      case "stack": return <div key={i} className="yl-cstack">{kids}</div>;
      case "row": return <div key={i} className="yl-crow">{kids}</div>;
      case "text": return <div key={i} className={`yl-ctext ${n.size || ""}`}>{n.text}</div>;
      case "badge": return <span key={i} className="pill now" style={{ alignSelf: "flex-start" }}>{n.text}</span>;
      case "stat": return <div key={i} className="yl-cstat"><b>{n.value}</b><span>{n.label}</span></div>;
      case "image": return <img key={i} src={n.src} alt={n.alt || ""} className="yl-cimg" />;
      case "divider": return <hr key={i} className="yl-cdiv" />;
      case "button": return <button key={i} className="bigbtn p acc full" onClick={() => emit({ action: n.action || n.text })}>{n.text}</button>;
      default: return <pre key={i} className="yl-craw">{JSON.stringify(n)}</pre>;
    }
  };
  return <div className="yl-block yl-custom"><span className="yl-bound">custom</span>{r(spec, 0)}</div>;
}

const MAP = { timer: Timer, ask: Ask, choose: Choose, pick: Pick, slide: Slide, form: Form, list: List, table: Table, card: Card, image: Image, camera: Camera, mic: Mic, say: Say,
  gallery: Gallery, video: Video, compare: Compare, storyboard: Storyboard,
  chart: Chart, stat: Stat, math: MathBlock, calc: Calc,
  page: LonePage, project: Project };

export function StepGroup({ nodes, emitFor }) {
  return <Steps nodes={nodes} emitFor={emitFor} resolveProps={(n) => resolve("step", n.props)} />;
}

export function Render({ node, emit }) {
  if (node.preset === "custom") return <Custom spec={node.props.spec} emit={emit} />;
  const C = MAP[node.preset];
  if (!C) return null;
  return <C p={resolve(node.preset, node.props)} emit={emit} />;
}
