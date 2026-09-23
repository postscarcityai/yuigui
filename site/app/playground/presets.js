"use client";

// Web renderers for the 12 YL presets, plus say and custom.
// Each preset gets resolved props and emit(value). emit() is the event that
// goes back to the agent.
import { useEffect, useRef, useState } from "react";
import { resolve } from "../../lib/yl/yl.mjs";

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

function Ask({ p, emit }) {
  const [a, setA] = useState(null);
  return (
    <div className="yl-block">
      <div className="yl-q">{p.q}</div>
      <div className="bigbtns">
        {p.options.map((o, i) => (
          <button key={o} className={`bigbtn ${i === 0 ? "p acc" : "s"} ${a && a !== o ? "dim" : ""}`}
            onClick={() => { setA(o); emit({ answer: o }); }}>{o}</button>
        ))}
      </div>
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
  const pickIt = (o, other) => { setSel(o); emit(other ? { choice: o, other: true } : { choice: o }); };
  return (
    <div className="yl-block">
      {p.q ? <div className="yl-q">{p.q}</div> : null}
      <div className="chips big">
        {p.options.map((o) => <button key={o} className={`chip ${sel === o ? "on" : ""}`} onClick={() => pickIt(o)}>{o}</button>)}
        {p.other ? <Other onSubmit={(v) => pickIt(v, true)} /> : null}
      </div>
    </div>
  );
}

function Pick({ p, emit }) {
  const [sel, setSel] = useState([]);
  const [extra, setExtra] = useState([]);
  const tog = (o) => setSel((s) => (s.includes(o) ? s.filter((x) => x !== o) : p.max && s.length >= p.max ? s : [...s, o]));
  return (
    <div className="yl-block">
      {p.q ? <div className="yl-q">{p.q}</div> : null}
      <div className="chips big">
        {[...p.options, ...extra].map((o) => <button key={o} className={`chip ${sel.includes(o) ? "on" : ""}`} onClick={() => tog(o)}>{sel.includes(o) ? "✓ " : ""}{o}</button>)}
        {p.other ? <Other onSubmit={(v) => { setExtra((e) => [...e, v]); setSel((s) => [...s, v]); }} /> : null}
      </div>
      <button className="bigbtn p acc full" onClick={() => emit({ picked: sel })}>{p.submit}{sel.length ? ` (${sel.length})` : ""}</button>
    </div>
  );
}

function Slide({ p, emit }) {
  const [v, setV] = useState(p.value);
  useEffect(() => setV(p.value), [p.value]);
  return (
    <div className="yl-block">
      {p.label ? <div className="yl-q">{p.label}</div> : null}
      <div className="yl-slideval">{v}{p.unit ? ` ${p.unit}` : ""}</div>
      <input type="range" className="yl-range" min={p.min} max={p.max} step={p.step} value={v}
        onChange={(e) => setV(Number(e.target.value))} onPointerUp={() => emit({ value: v })} onKeyUp={() => emit({ value: v })} />
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

function Table({ p }) {
  const bound = !p.cols && p.name ? TABLES[p.name] : null;
  const cols = p.cols || (bound && bound.cols);
  const rows = p.cols ? p.rows : bound ? bound.rows : [];
  return (
    <div className="yl-block">
      <div className="yl-q">{p.name ? human(p.name) : "Table"}{bound ? <span className="yl-bound">bound: {p.name}</span> : null}</div>
      {cols ? (
        <div className="yl-tablewrap">
          <table className="yl-table">
            <thead><tr>{cols.map((c) => <th key={c}>{c}</th>)}</tr></thead>
            <tbody>{rows.map((r, i) => <tr key={i}>{cols.map((_, j) => <td key={j}>{r[j]}</td>)}</tr>)}</tbody>
          </table>
        </div>
      ) : <div className="yl-sub">No rows in "{p.name}" yet.</div>}
    </div>
  );
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

function Image({ p }) {
  return (
    <figure className="yl-image">
      {p.src ? <img src={p.src} alt={p.alt || p.caption || ""} style={{ objectFit: p.fit }} />
        : <div className="yl-imgph"><span>Image to generate</span><b>{p.prompt || "no prompt"}</b></div>}
      {p.caption ? <figcaption>{p.caption}</figcaption> : null}
    </figure>
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

const MAP = { timer: Timer, ask: Ask, choose: Choose, pick: Pick, slide: Slide, form: Form, list: List, table: Table, card: Card, image: Image, camera: Camera, mic: Mic, say: Say };

export function Render({ node, emit }) {
  if (node.preset === "custom") return <Custom spec={node.props.spec} emit={emit} />;
  const C = MAP[node.preset];
  if (!C) return null;
  return <C p={resolve(node.preset, node.props)} emit={emit} />;
}
