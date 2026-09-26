"use client";

// The music presets (spec/MUSIC.md): loop, drums, keys, chords, tuner and
// metronome, playing real sound through the engine (engine.js). Each gets
// resolved props and emit(value); emit is the event that goes back to the
// agent, in the same words the agent writes.
import { useEffect, useRef, useState } from "react";
import { KIT } from "../../../lib/yl/yl.mjs";
import {
  IN_TUNE, PITCHED, chordNotes, detectPitch, fromPattern, inScale, knownTuning, midiName, nearestNote,
  nearestString, noteToMidi, parseKey, pitchRange, pitchWindow, progression, quantize, soundFor,
  stepBeats, stepTime, toPattern, tunerStrings,
} from "../../../lib/music/theory.mjs";
import { audio, clock, note, play, hold, running, session } from "./engine";
import { useLive } from "../stage";
import "./music.css";

const clampInt = (v, lo, hi, d) => { const n = Math.round(Number(v)); return Number.isFinite(n) ? Math.min(hi, Math.max(lo, n)) : d; };
const last32 = (list, x) => [...list, x].slice(-32);

// +play wants sound before anyone has tapped. Browsers hold the audio until a
// gesture, so the first tap anywhere starts it.
function useWakeOnTap(want) {
  const [asleep, setAsleep] = useState(false);
  useEffect(() => {
    if (!want) return undefined;
    audio();
    if (running()) return undefined;
    setAsleep(true);
    const wake = () => { audio(); setAsleep(false); };
    window.addEventListener("pointerdown", wake, { once: true });
    return () => window.removeEventListener("pointerdown", wake);
  }, [want]);
  return asleep;
}

// ---------- loop ----------
export function Loop({ p, emit }) {
  const steps = clampInt(p.steps, 4, 16, 8);
  const rows = (Array.isArray(p.rows) && p.rows.length ? p.rows : KIT.slice(0, 8)).slice(0, 16);
  const sig = JSON.stringify([p.p, rows, steps]);
  const [grid, setGrid] = useState(() => fromPattern(p.p, rows, steps));
  const [bpm, setBpm] = useState(clampInt(p.bpm, 40, 240, 96));
  const [swing, setSwing] = useState(clampInt(p.swing, 0, 75, 0));
  const [playing, setPlaying] = useState(false);
  const [head, setHead] = useState(-1);
  const [sent, setSent] = useState(false);
  const clk = useRef(null);
  const live = useRef(null);
  live.current = { grid, bpm, swing, steps, rows, sound: p.sound };

  // A patch lands without stopping the music: the grid, tempo or swing change
  // and the clock keeps going.
  const first = useRef(true);
  useEffect(() => { if (first.current) { first.current = false; return; } setGrid(fromPattern(p.p, rows, steps)); }, [sig]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { setBpm(clampInt(p.bpm, 40, 240, 96)); }, [p.bpm]);
  useEffect(() => { setSwing(clampInt(p.swing, 0, 75, 0)); }, [p.swing]);

  const sound = (row, when, s = live.current) => {
    const m = noteToMidi(row);
    if (m !== null) note(s.sound, m, { when, dur: (60 / s.bpm) * stepBeats(s.steps) * 0.9 });
    else play(row, { when, vel: 0.9 });
  };
  const start = () => {
    audio();
    clk.current?.stop();
    clk.current = clock({
      gap: (i) => { const s = live.current; const k = i % s.steps; return stepTime(k + 1, s.bpm, s.steps, s.swing) - stepTime(k, s.bpm, s.steps, s.swing); },
      onTick: (i, t) => { const s = live.current; const k = i % s.steps; s.rows.forEach((r, ri) => { if (s.grid[ri]?.[k]) sound(r, t, s); }); },
      onShow: (i) => setHead(i % live.current.steps),
    });
    setPlaying(true);
  };
  const stop = () => { clk.current?.stop(); clk.current = null; setPlaying(false); setHead(-1); };
  useEffect(() => () => clk.current?.stop(), []);
  useEffect(() => { if (p.play) start(); }, []); // eslint-disable-line react-hooks/exhaustive-deps
  const asleep = useWakeOnTap(!!p.play);
  useLive(playing ? `${bpm} BPM` : null);

  // More than 8 steps wrap into a second bank under the first, so cells stay
  // big enough for a thumb.
  const banks = steps > 8 ? [[0, 8], [8, steps]] : [[0, steps]];
  const toggle = (r, k) => {
    audio();
    const on = !grid[r][k];
    if (on && !playing) sound(rows[r]);
    setGrid(grid.map((row, ri) => (ri === r ? row.map((x, ki) => (ki === k ? on : x)) : row)));
    setSent(false);
  };
  const send = () => {
    emit({ bpm, swing, steps, rows, p: toPattern(grid) });
    setSent(true);
  };

  return (
    <div className="yl-block mu mu-loop">
      <div className="mu-head">
        <div className="yl-q">{p.title || "Loop"}</div>
        <span className="yl-sub">{bpm} BPM{swing ? ` · swing ${swing}%` : ""}</span>
      </div>
      {asleep ? <div className="mu-note">Tap anywhere to hear it.</div> : null}
      {banks.map(([from, to], bi) => (
        <div key={bi} className="mu-grid" style={{ gridTemplateColumns: `50px repeat(${Math.min(steps, 8)}, minmax(0, 1fr))` }} role="grid"
          aria-label={banks.length > 1 ? `Steps ${from + 1} to ${to}` : "Pattern"}>
          {rows.map((r, ri) => [
            <button key={`n${ri}`} className="mu-rowname" onPointerDown={() => { audio(); sound(r); }} aria-label={`Hear ${r}`}>{r}</button>,
            ...Array.from({ length: to - from }, (_, j) => {
              const k = from + j;
              return (
                <button key={`${ri}:${k}`} aria-pressed={!!grid[ri][k]} aria-label={`${r}, step ${k + 1}`}
                  className={`mu-cell${grid[ri][k] ? " on" : ""}${k === head ? " head" : ""}${k % 4 === 0 ? " beat" : ""}`}
                  style={{ "--mu-row": `var(--yl-c${(ri % 6) + 1})` }}
                  onClick={() => toggle(ri, k)} />
              );
            }),
          ])}
        </div>
      ))}
      <div className="mu-bar">
        <button className={`mu-btn mu-play${playing ? " on" : ""}`} onClick={playing ? stop : start}>{playing ? "■ Stop" : "▶ Play"}</button>
        <div className="mu-step" role="group" aria-label="Tempo">
          <button className="mu-btn" aria-label="Slower" onClick={() => setBpm((b) => Math.max(40, b - 2))}>−</button>
          <span>{bpm}</span>
          <button className="mu-btn" aria-label="Faster" onClick={() => setBpm((b) => Math.min(240, b + 2))}>+</button>
        </div>
        <button className="mu-btn" onClick={() => setSwing((s) => (s >= 75 ? 0 : s + 25))} aria-label="Swing">Swing {swing}%</button>
      </div>
      <button className="mu-btn mu-send" onClick={send}>{sent ? "Sent ✓" : "Send"}</button>
    </div>
  );
}

// ---------- drums ----------
export function Drums({ p, emit }) {
  const [rs, cs] = String(p.grid || "2x2").toLowerCase().split("x").map((n) => clampInt(n, 1, 4, 2));
  const n = rs * cs;
  const given = (Array.isArray(p.pads) ? p.pads : []).slice(0, n);
  const pads = [...given, ...KIT.filter((k) => !given.includes(k))].slice(0, n);
  const bpm = clampInt(p.bpm, 40, 240, 96);
  const [lit, setLit] = useState({});
  const [phase, setPhase] = useState("idle"); // idle | count | rec | done | empty
  const [pos, setPos] = useState(0);
  const rec = useRef(null);
  const clk = useRef(null);

  const hitPad = (i, e) => {
    e?.preventDefault();
    const c = audio();
    play(pads[i], { vel: 1 });
    setLit((l) => ({ ...l, [i]: (l[i] || 0) + 1 }));
    setTimeout(() => setLit((l) => ({ ...l, [i]: Math.max(0, (l[i] || 1) - 1) })), 120);
    if (rec.current && c) {
      const t = c.currentTime - rec.current.at;
      if (t > -(60 / bpm) / 8) rec.current.hits.push({ pad: pads[i], t });
    }
  };

  // One bar of count-in on the tick, two bars recorded, snapped to 16ths.
  const record = () => {
    audio();
    const d = 60 / bpm / 4;
    clk.current?.stop();
    let finish = null;
    clk.current = clock({
      gap: () => d,
      onTick: (i, t) => {
        if (i < 16) { if (i % 4 === 0) play("tick", { when: t, vel: i === 0 ? 1 : 0.6, hz: i === 0 ? 3000 : 2000 }); }
        else if (i < 48) { if (i % 4 === 0) play("tick", { when: t, vel: 0.3, hz: 2000 }); }
        else if (!finish) finish = setTimeout(done, Math.max(0, (t - audio().currentTime) * 1000));
      },
      onShow: (i) => { setPos(i); if (i === 16) setPhase("rec"); },
    });
    rec.current = { at: clk.current.start + 16 * d, hits: [] };
    setPhase("count");
    setPos(0);
  };
  const done = () => {
    clk.current?.stop();
    const take = quantize(rec.current?.hits || [], pads, bpm, 32);
    rec.current = null;
    if (!take.rows.length) { setPhase("empty"); return; }
    setPhase("done");
    emit(take);
  };
  useEffect(() => () => clk.current?.stop(), []);
  useLive(phase === "count" ? "Count in" : phase === "rec" ? "Recording" : null);

  const busy = phase === "count" || phase === "rec";
  const status = phase === "count" ? `Count in ${Math.floor(pos / 4) + 1}` : phase === "rec" ? `Recording, bar ${pos < 32 ? 1 : 2} of 2`
    : phase === "done" ? "Take sent." : phase === "empty" ? "No hits. Try again." : null;

  return (
    <div className="yl-block mu mu-drums">
      <div className="mu-head">
        <div className="yl-q">{p.title || "Drums"}</div>
        <span className="yl-sub">{p.record ? `${bpm} BPM` : ""}</span>
      </div>
      <div className={`mu-pads mu-c${cs}`} style={{ gridTemplateColumns: `repeat(${cs}, 1fr)` }}>
        {pads.map((w, i) => (
          <button key={i} className={`mu-pad${lit[i] ? " hit" : ""}`} style={{ "--mu-row": `var(--yl-c${(i % 6) + 1})` }}
            onPointerDown={(e) => hitPad(i, e)} onKeyDown={(e) => { if (e.key === " " || e.key === "Enter") hitPad(i, e); }}
            aria-label={`${w} pad`}>{w}</button>
        ))}
      </div>
      {p.record ? (
        <>
          {busy ? <div className="mu-progress"><i style={{ width: `${phase === "rec" ? ((pos - 16) / 32) * 100 : (pos / 16) * 100}%` }} /></div> : null}
          {status ? <div className="mu-note" aria-live="polite">{status}</div> : null}
          <button className={`mu-btn mu-send${busy ? " rec" : ""}`} disabled={busy} onClick={record}>{busy ? "● Recording" : phase === "done" ? "Record again" : "● Record"}</button>
        </>
      ) : null}
    </div>
  );
}

// ---------- keys ----------
const WHITE = [0, 2, 4, 5, 7, 9, 11, 12, 14, 16];
const BLACK = [[1, 1], [3, 2], [6, 4], [8, 5], [10, 6], [13, 8], [15, 9]]; // semitone, sits left of white n
export function Keys({ p, emit }) {
  const key = parseKey(p.key);
  const scale = p.scale || (key.minor ? "minor" : "major");
  const [octave, setOctave] = useState(clampInt(p.octave, 1, 7, 4));
  const [sound, setSound] = useState(soundFor(p.sound, true));
  const [down, setDown] = useState({});
  const [played, setPlayed] = useState([]);
  const [sent, setSent] = useState(false);
  const voices = useRef(new Map());
  const base = 12 * (octave + 1);
  const playable = (m) => scale === "chromatic" || inScale(m, key, scale);
  useEffect(() => { setSound(soundFor(p.sound, true)); }, [p.sound]);
  useEffect(() => { setOctave(clampInt(p.octave, 1, 7, 4)); }, [p.octave]);

  const on = (id, m) => {
    const v = voices.current.get(id);
    if (v && v.m === m) return;
    if (v) off(id);
    if (m == null || !playable(m)) return;
    audio();
    voices.current.set(id, { m, release: hold(sound, m) });
    setDown((d) => ({ ...d, [m]: (d[m] || 0) + 1 }));
    setPlayed((l) => last32(l, midiName(m, key.flats)));
    setSent(false);
  };
  const off = (id) => {
    const v = voices.current.get(id);
    if (!v) return;
    v.release();
    voices.current.delete(id);
    setDown((d) => ({ ...d, [v.m]: Math.max(0, (d[v.m] || 1) - 1) }));
  };
  useEffect(() => () => { for (const v of voices.current.values()) v.release(); }, []);
  const at = (e) => {
    const el = document.elementFromPoint(e.clientX, e.clientY)?.closest?.("[data-midi]");
    return el ? Number(el.dataset.midi) : null;
  };
  // Each finger is a pointer. Sliding plays every playable key it crosses,
  // and passes over dimmed keys in silence.
  const fingers = useRef(new Set());
  const pd = (e) => { e.preventDefault(); e.currentTarget.setPointerCapture?.(e.pointerId); fingers.current.add(e.pointerId); on(e.pointerId, at(e)); };
  const pm = (e) => { if (fingers.current.has(e.pointerId)) on(e.pointerId, at(e)); };
  const pu = (e) => { fingers.current.delete(e.pointerId); off(e.pointerId); };

  const keyEl = (m, cls, style) => {
    const ok = playable(m);
    return (
      <div key={m} data-midi={m} role="button" aria-label={midiName(m, key.flats)} aria-disabled={!ok}
        className={`${cls}${ok ? "" : " off"}${down[m] ? " down" : ""}${(m - key.root) % 12 === 0 ? " root" : ""}`} style={style}>
        {cls === "mu-white" && m % 12 === 0 ? <span>{midiName(m)}</span> : null}
      </div>
    );
  };

  return (
    <div className="yl-block mu mu-keys">
      <div className="mu-head">
        <div className="yl-q">{p.title || "Keys"}</div>
        <span className="yl-sub">{key.name} {scale}</span>
      </div>
      <div className="mu-sounds" role="radiogroup" aria-label="Sound">
        {PITCHED.map((s) => <button key={s} role="radio" aria-checked={s === sound} className={`mu-chip${s === sound ? " on" : ""}`} onClick={() => { setSound(s); audio(); note(s, base + key.root, { dur: 0.4 }); }}>{s}</button>)}
      </div>
      <div className="mu-kbd" onPointerDown={pd} onPointerMove={pm} onPointerUp={pu} onPointerCancel={pu} onLostPointerCapture={pu}>
        {WHITE.map((s, i) => keyEl(base + s, "mu-white", { left: `${i * 10}%` }))}
        {BLACK.map(([s, w]) => keyEl(base + s, "mu-black", { left: `calc(${w * 10}% - 3.2%)` }))}
      </div>
      <div className="mu-bar">
        <button className="mu-btn" aria-label="Octave down" disabled={octave <= 1} onClick={() => setOctave((o) => o - 1)}>‹</button>
        <span className="mu-oct">C{octave}</span>
        <button className="mu-btn" aria-label="Octave up" disabled={octave >= 7} onClick={() => setOctave((o) => o + 1)}>›</button>
        <span className="mu-played">{played.slice(-6).join(" ")}</span>
      </div>
      {p.send ? <button className="mu-btn mu-send" disabled={!played.length} onClick={() => { emit({ played, key: key.name, scale }); setSent(true); }}>{sent ? "Sent ✓" : "Send"}</button> : null}
    </div>
  );
}

// ---------- chords ----------
export function Chords({ p, emit }) {
  const key = parseKey(p.key);
  const list = progression({ key: key.name, prog: p.prog || [], chords: p.chords || [] });
  const [played, setPlayed] = useState([]);
  const [lit, setLit] = useState(-1);
  const [sent, setSent] = useState(false);
  const strum = p.strum === "up" || p.strum === "off" ? p.strum : "down";

  const tap = (i, e) => {
    e?.preventDefault();
    const c = audio();
    if (!c) return;
    const name = list[i].name;
    const notes = chordNotes(name) || chordNotes(name.replace(/[^A-G#b].*$/, "")) || [48, 60, 64, 67];
    const order = strum === "up" ? [...notes].reverse() : notes;
    const t = c.currentTime;
    order.forEach((m, k) => note(p.sound, m, { when: t + (strum === "off" ? 0 : k * 0.025), dur: 1.4, vel: 0.75 }));
    setLit(i);
    setTimeout(() => setLit((x) => (x === i ? -1 : x)), 220);
    setPlayed((l) => last32(l, name));
    setSent(false);
  };

  return (
    <div className="yl-block mu mu-chords">
      <div className="mu-head">
        <div className="yl-q">{p.title || "Chords"}</div>
        <span className="yl-sub">{list.some((c) => c.numeral) ? `in ${key.name}` : ""}{strum !== "down" ? ` · strum ${strum}` : ""}</span>
      </div>
      <div className="mu-chordgrid">
        {list.map((c, i) => (
          <button key={i} className={`mu-chord${lit === i ? " hit" : ""}`} style={{ "--mu-row": `var(--yl-c${(i % 6) + 1})` }}
            onPointerDown={(e) => tap(i, e)} onKeyDown={(e) => { if (e.key === " " || e.key === "Enter") tap(i, e); }}>
            <b>{c.name}</b>{c.numeral ? <small>{c.numeral}</small> : null}
          </button>
        ))}
      </div>
      {played.length ? <div className="mu-played">{played.slice(-8).join(" · ")}</div> : null}
      {p.send ? <button className="mu-btn mu-send" disabled={!played.length} onClick={() => { emit({ played, key: key.name }); setSent(true); }}>{sent ? "Sent ✓" : "Send"}</button> : null}
    </div>
  );
}

// ---------- tuner ----------
export function Tuner({ p, emit }) {
  const instrument = ["guitar", "ukulele", "bass", "chromatic"].includes(p.instrument) ? p.instrument : "guitar";
  const chromatic = instrument === "chromatic";
  const custom = Array.isArray(p.strings) && p.strings.length > 0;
  const tuning = p.tuning || "standard";
  const strings = chromatic && !custom ? [] : tunerStrings({ instrument, tuning, strings: p.strings || [] });
  const fellBack = !custom && !chromatic && !knownTuning(instrument, tuning);
  const a4 = Number(p.a4) > 300 && Number(p.a4) < 600 ? Number(p.a4) : 440;
  const [phase, setPhase] = useState("idle"); // idle | asking | on | denied
  const [read, setRead] = useState(null);
  const [tuned, setTuned] = useState({});
  const mic = useRef(null);
  const hold1 = useRef({ index: -1, since: 0 });
  const tunedRef = useRef({});
  const sentRef = useRef(false);

  const stop = () => {
    const m = mic.current;
    if (m) { clearInterval(m.timer); m.stream.getTracks().forEach((t) => t.stop()); m.src.disconnect(); }
    mic.current = null;
    session("playback");
  };
  useEffect(() => stop, []);

  const start = async () => {
    const c = audio();
    if (!c || !navigator.mediaDevices?.getUserMedia) { setPhase("denied"); return; }
    setPhase("asking");
    session("play-and-record");
    let stream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false } });
    } catch {
      session("playback");
      setPhase("denied");
      return;
    }
    const size = pitchWindow(instrument);
    const src = c.createMediaStreamSource(stream);
    const an = c.createAnalyser();
    an.fftSize = size;
    src.connect(an);
    const buf = new Float32Array(size);
    const range = pitchRange(instrument, strings, a4);
    // 75% overlap: a new window every quarter window.
    const every = Math.max(12, ((size / 4) / c.sampleRate) * 1000);
    const timer = setInterval(() => {
      an.getFloatTimeDomainData(buf);
      const r = detectPitch(buf, c.sampleRate, range);
      if (!r) { setRead(null); hold1.current = { index: -1, since: 0 }; return; }
      if (strings.length) {
        const s = nearestString(r.hz, strings, a4);
        setRead({ hz: r.hz, note: s.note, cents: s.cents, index: s.index });
        track(s.index, s.cents);
      } else {
        const s = nearestNote(r.hz, a4);
        setRead({ hz: r.hz, note: s.note, cents: s.cents, index: -1 });
      }
    }, every);
    mic.current = { stream, src, timer };
    setPhase("on");
  };

  // A string counts as tuned once it holds within 3 cents for a second. When
  // they all have, one event goes back. The chromatic tuner never sends.
  const track = (index, c) => {
    const h = hold1.current;
    const t = performance.now();
    if (Math.abs(c) > IN_TUNE || h.index !== index) { hold1.current = { index: Math.abs(c) <= IN_TUNE ? index : -1, since: t }; return; }
    if (t - h.since < 1000) return;
    tunedRef.current = { ...tunedRef.current, [index]: c };
    setTuned(tunedRef.current);
    if (!sentRef.current && !chromatic && strings.every((_, i) => i in tunedRef.current)) {
      sentRef.current = true;
      emit({ tuned: true, instrument, tuning: custom ? "custom" : fellBack ? "standard" : tuning, strings, cents: strings.map((_, i) => Math.round(tunedRef.current[i])) });
    }
  };

  const ref = (m) => { audio(); note("pluck", m + 12 * Math.log2(a4 / 440), { dur: 2 }); };
  const cents = read ? Math.max(-50, Math.min(50, read.cents)) : 0;
  const good = read && Math.abs(read.cents) <= IN_TUNE;
  const allTuned = strings.length > 0 && strings.every((_, i) => i in tuned);

  return (
    <div className="yl-block mu mu-tuner">
      <div className="mu-head">
        <div className="yl-q">{p.title || "Tuner"}</div>
        <span className="yl-sub">{custom ? "custom" : chromatic ? "chromatic" : `${instrument}, ${fellBack ? "standard" : tuning}`}{a4 !== 440 ? ` · A4 ${a4}` : ""}</span>
      </div>
      {fellBack ? <div className="mu-note">No tuning called {tuning}, so this is standard.</div> : null}
      <div className={`mu-dial${good ? " good" : ""}`} aria-live="polite">
        <svg viewBox="0 0 200 110" aria-hidden="true">
          <path d="M20 100 A80 80 0 0 1 180 100" className="mu-arc" />
          {[-50, -25, 0, 25, 50].map((c) => {
            const a = ((c / 50) * 60 - 90) * (Math.PI / 180);
            return <line key={c} x1={100 + 72 * Math.cos(a)} y1={100 + 72 * Math.sin(a)} x2={100 + 82 * Math.cos(a)} y2={100 + 82 * Math.sin(a)} className="mu-tick" />;
          })}
          <line x1="100" y1="100" x2="100" y2="28" className="mu-needle" style={{ transform: `rotate(${(cents / 50) * 60}deg)`, opacity: read ? 1 : 0.25 }} />
          <circle cx="100" cy="100" r="5" className="mu-hub" />
        </svg>
        <div className="mu-read">
          {read ? <b>{read.note.replace(/-?\d+$/, "")}<sub>{read.note.match(/-?\d+$/)?.[0]}</sub></b> : null}
          <span>{read ? `${read.cents > 0 ? "+" : ""}${Math.round(read.cents)} cents · ${read.hz.toFixed(1)} Hz` : phase === "on" ? "Play a string" : "Tap Start, then play a string."}</span>
        </div>
      </div>
      {strings.length ? (
        <div className="mu-strings" style={{ gridTemplateColumns: `repeat(${strings.length}, 1fr)` }}>
          {strings.map((s, i) => (
            <button key={i} className={`mu-string${read?.index === i ? " near" : ""}${i in tuned ? " done" : ""}`} onClick={() => ref(noteToMidi(s))} aria-label={`Hear ${s}`}>
              {s}{i in tuned ? <small>✓</small> : null}
            </button>
          ))}
        </div>
      ) : (
        <div className="mu-strings" style={{ gridTemplateColumns: "1fr" }}>
          <button className="mu-string" onClick={() => ref(69)}>Hear A4</button>
        </div>
      )}
      {phase === "denied" ? <div className="mu-note">The mic is off. Tap a string to tune by ear.</div> : null}
      {allTuned && !chromatic ? <div className="mu-note good">All strings in tune.</div> : null}
      {phase === "on" ? <button className="mu-btn mu-send" onClick={() => { stop(); setPhase("idle"); setRead(null); }}>Stop listening</button>
        : <button className="mu-btn mu-send" disabled={phase === "asking"} onClick={start}>{phase === "asking" ? "Asking for the mic..." : phase === "denied" ? "Try the mic again" : "Start"}</button>}
    </div>
  );
}

// ---------- metronome ----------
export function Metronome({ p, emit }) {
  const [bpm, setBpm] = useState(clampInt(p.bpm, 30, 300, 100));
  const beats = clampInt(p.beats, 1, 12, 4);
  const sub = clampInt(p.sub, 1, 4, 1);
  const [on, setOn] = useState(false);
  const [beat, setBeat] = useState(-1);
  const [msg, setMsg] = useState(null);
  const clk = useRef(null);
  const since = useRef(0);
  const taps = useRef([]);
  const live = useRef(null);
  live.current = { bpm, beats, sub };
  useEffect(() => { setBpm(clampInt(p.bpm, 30, 300, 100)); }, [p.bpm]);

  const start = () => {
    audio();
    clk.current?.stop();
    clk.current = clock({
      gap: () => 60 / live.current.bpm / live.current.sub,
      onTick: (i, t) => {
        const s = live.current;
        const k = i % (s.beats * s.sub);
        if (k === 0) play("tick", { when: t, vel: 1, hz: 3000 });
        else if (k % s.sub === 0) play("tick", { when: t, vel: 0.65, hz: 2000 });
        else play("tick", { when: t, vel: 0.3, hz: 2000 });
      },
      onShow: (i) => { const s = live.current; setBeat(Math.floor((i % (s.beats * s.sub)) / s.sub)); },
    });
    since.current = Date.now();
    setOn(true);
    setMsg(null);
  };
  const stop = () => {
    clk.current?.stop();
    clk.current = null;
    setOn(false);
    setBeat(-1);
    const seconds = Math.round((Date.now() - since.current) / 1000);
    if (seconds >= 10) { emit({ bpm, beats, sub, seconds }); setMsg(`Practice sent: ${seconds} s at ${bpm}.`); }
  };
  useEffect(() => () => clk.current?.stop(), []);
  useEffect(() => { if (p.play) start(); }, []); // eslint-disable-line react-hooks/exhaustive-deps
  const asleep = useWakeOnTap(!!p.play);
  useLive(on ? `${bpm} BPM` : null);

  const tap = () => {
    audio();
    const t = performance.now();
    const list = taps.current.filter((x) => t - x < 2000);
    list.push(t);
    taps.current = list.slice(-5);
    if (taps.current.length >= 2) {
      const gaps = taps.current.slice(1).map((x, i) => x - taps.current[i]);
      setBpm(Math.max(30, Math.min(300, Math.round(60000 / (gaps.reduce((a, b) => a + b, 0) / gaps.length)))));
    }
    if (!on) play("tick", { vel: 0.6, hz: 2000 });
  };

  return (
    <div className="yl-block mu mu-metro">
      <div className="mu-head">
        <div className="yl-q">{p.title || "Metronome"}</div>
        <span className="yl-sub">{beats}/4{sub > 1 ? ` · ${["", "", "eighths", "triplets", "sixteenths"][sub]}` : ""}</span>
      </div>
      {asleep ? <div className="mu-note">Tap anywhere to hear it.</div> : null}
      <div className="mu-bpm">
        <button className="mu-btn mu-round" aria-label="Slower" onClick={() => setBpm((b) => Math.max(30, b - 1))}>−</button>
        <div><b>{bpm}</b><span>BPM</span></div>
        <button className="mu-btn mu-round" aria-label="Faster" onClick={() => setBpm((b) => Math.min(300, b + 1))}>+</button>
      </div>
      <div className="mu-dots" aria-hidden="true">
        {Array.from({ length: beats }, (_, i) => <i key={i} className={`${i === 0 ? "first" : ""}${i === beat ? " on" : ""}`} />)}
      </div>
      <div className="mu-bar">
        <button className={`mu-btn mu-play${on ? " on" : ""}`} onClick={on ? stop : start}>{on ? "■ Stop" : "▶ Start"}</button>
        <button className="mu-btn" onClick={tap}>Tap tempo</button>
      </div>
      {msg ? <div className="mu-note">{msg}</div> : null}
    </div>
  );
}

// The playground's stand-in agent for the music demo: a saved beat gets a
// short reply on its page.
export function musicReply(ev) {
  if (ev.preset === "loop" && ev.id === "beat" && Array.isArray(ev.p)) return `>2 say "Saved. Want a bassline under it?"`;
  return null;
}

export const MUSIC = { loop: Loop, drums: Drums, keys: Keys, chords: Chords, tuner: Tuner, metronome: Metronome };
