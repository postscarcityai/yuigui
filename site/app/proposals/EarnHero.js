"use client";
// The PROP-5 hero: $U trickling in as you use Yui, in a phone. Nothing counts on the chat itself. The total lives
// in the left drawer, top right, where the gear and the X were, with your profile top left (a tap opens Settings)
// and the agent at the bottom, shown as a drawn coin and a number. Open the drawer and, if you earned since you last
// looked, the number just counts up once from the old total to the new one while the pill fades to green and back.
// No chip, no coins flying. Only new $U animates, so nothing is counted twice. It plays on its own until
// touched. Copy and rates live in lib/earn-hero.mjs. Nothing here records anything.
import { useCallback, useEffect, useRef, useState } from "react";
import { HERO, LOOP, MOVES, RATES, START, streakBonus, streakX } from "../../lib/earn-hero.mjs";
import usePrefs from "./usePrefs";
import "./jev.css";
import "./earn-hero.css";

// The $U coin: a small drawn gold coin with a U on its face, in place of the letters.
const Coin = ({ size = 18 }) => (
  <svg className="eh-coin" width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
    <circle cx="12" cy="12.8" r="10.2" fill="#D9951C" />
    <circle cx="12" cy="11.6" r="10.2" fill="#FFC83D" />
    <circle cx="12" cy="11.6" r="7.6" fill="none" stroke="#E8A626" strokeWidth="1.3" />
    <path d="M8.9 7.6v4.6a3.1 3.1 0 0 0 6.2 0V7.6" fill="none" stroke="#8A5A00" strokeWidth="2.1" strokeLinecap="round" />
    <path d="M6.2 8.2a6.6 6.6 0 0 1 3.4-3.4" fill="none" stroke="#FFF1C2" strokeWidth="1.3" strokeLinecap="round" />
  </svg>
);

const fmt = (n) => Math.floor(n).toLocaleString("en-US");
const TICK = 1500; // ms between moves while it plays on its own
const SLIDE = 450; // ms the drawer takes to open; the count starts once it is in
const fresh = () => ({ ...START, seen: START.balance, thread: [], n: 0, open: false, panel: null, gain: 0 });

// What one move earns, given the day so far.
function earn(move, s) {
  if (move.flat) return { amount: move.flat, trickle: false };
  const base = RATES[move.kind] * streakX(s.day);
  const room = Math.max(0, RATES.softCap - s.today);
  const amount = base <= room ? base : room + (base - room) / 10;
  return { amount: Math.round(amount * 10) / 10, trickle: true };
}

// The total eases from the old number to the new one, after `wait` ms.
// `moving` is true while it climbs, so the pill can fade to green and back.
function useCountUp(target, reduced, wait) {
  const [shown, setShown] = useState(target);
  const [moving, setMoving] = useState(false);
  const from = useRef(target);
  useEffect(() => {
    if (reduced) { setShown(target); from.current = target; return; }
    const start = from.current;
    if (start === target) return;
    const ms = Math.min(1600, 500 + Math.log10(Math.abs(target - start) + 1) * 350);
    let raf, t0;
    const step = (t) => {
      t0 ??= t;
      const k = Math.min(1, (t - t0) / ms), v = start + (target - start) * (1 - Math.pow(1 - k, 3));
      setShown(v); from.current = v;
      if (k < 1) raf = requestAnimationFrame(step);
      else setMoving(false);
    };
    const hold = setTimeout(() => { setMoving(true); raf = requestAnimationFrame(step); }, wait);
    return () => { clearTimeout(hold); cancelAnimationFrame(raf); };
  }, [target, reduced, wait]);
  return [shown, moving];
}

export default function EarnHero({ children }) {
  const { reduced } = usePrefs();
  const [s, setS] = useState(fresh);
  const [auto, setAuto] = useState(false);
  const [wait, setWait] = useState(0);
  const loopAt = useRef(0);
  const threadRef = useRef(null);
  // Closed, the drawer holds what you saw last; open, it shows now.
  const [shown, rising] = useCountUp(s.open ? s.balance : s.seen, reduced, wait);

  const play = useCallback((id) => {
    if (id === "open" || id === "sheet") {
      setWait(SLIDE);
      return setS((p) => (p.open ? { ...p, panel: id === "sheet" ? "u" : null } : { ...p, open: true, panel: id === "sheet" ? "u" : null, gain: p.balance - p.seen }));
    }
    if (id === "close") return setS((p) => ({ ...p, open: false, panel: null, seen: p.balance, gain: 0 }));
    const move = MOVES.find((m) => m.id === id);
    setWait(0);
    setS((p) => {
      const { amount, trickle } = earn(move, p);
      const n = p.n + 1;
      const thread = [...p.thread, { k: `u${n}`, who: "me", text: move.say, tap: move.tap }, { k: `a${n}`, who: "agent", text: move.reply }].slice(-8);
      // With the drawer open you are looking at it: the number moves now, and that counts as seen.
      return { ...p, n, thread, balance: p.balance + amount, seen: p.open ? p.balance + amount : p.seen, gain: p.open ? p.gain + amount : p.gain, today: trickle ? p.today + amount : p.today };
    });
  }, []);

  const nextDay = useCallback(() => {
    setWait(0);
    setS((p) => {
      const day = p.day + 1, bonus = streakBonus(day), amount = RATES.firstOfDay + bonus;
      const n = p.n + 1;
      const text = bonus ? `Day ${day}. First visit +${RATES.firstOfDay}, streak bonus +${bonus}.` : `Day ${day}. First visit today, +${RATES.firstOfDay}.`;
      return { ...p, n, day, today: 0, balance: p.balance + amount, seen: p.open ? p.balance + amount : p.seen, gain: p.open ? p.gain + amount : p.gain, thread: [{ k: `d${n}`, who: "day", text }] };
    });
  }, []);

  const touch = (fn) => () => { setAuto(false); fn(); };
  const reset = () => { setAuto(false); loopAt.current = 0; setWait(0); setS(fresh()); };

  useEffect(() => { setAuto(!window.matchMedia("(prefers-reduced-motion: reduce)").matches); }, []);
  useEffect(() => {
    if (!auto || reduced) return;
    const t = setTimeout(() => { play(LOOP[loopAt.current % LOOP.length]); loopAt.current += 1; }, loopAt.current === 0 ? 700 : TICK);
    return () => clearTimeout(t);
  }, [auto, reduced, s, play]);
  useEffect(() => { const el = threadRef.current; if (el) el.scrollTop = el.scrollHeight; }, [s.thread]);

  const x = streakX(s.day);
  const capPct = Math.min(100, (s.today / RATES.softCap) * 100);
  const past = s.today >= RATES.softCap;

  const moves = (chips) => (
    <ul className={chips ? "jv-chips" : "jv-picks"} aria-label={HERO.pickLabel}>
      <li>
        <button type="button" className="eh-open" onClick={touch(() => play(s.open ? "close" : "open"))}>
          <span className="jv-say">{s.open ? HERO.closeDrawer : HERO.openDrawer}</span>
          {chips ? null : <small>{HERO.drawerHint}</small>}
        </button>
      </li>
      {MOVES.map((m) => (
        <li key={m.id}>
          <button type="button" onClick={touch(() => play(m.id))}>
            <span className="jv-say">{m.label}</span>
            {chips ? null : <small>{m.hint}</small>}
          </button>
        </li>
      ))}
      <li>
        <button type="button" className="eh-day" onClick={touch(nextDay)}>
          <span className="jv-say">{HERO.nextDay}</span>
          {chips ? null : <small>{HERO.nextDayHint(s.day)}</small>}
        </button>
      </li>
    </ul>
  );

  return (
    <section className={`prop-hero jv eh ${reduced ? "still" : ""}`} data-slot="hero" aria-labelledby="prop-h">
      <div className="prop-hero-text">
        {children}
        <div className="jv-pickbox"><h2 className="jv-h">{HERO.pickLabel}</h2>{moves(false)}</div>
      </div>

      <div className="prop-hero-phone jv-col">
        <div className="phone sc-phone jv-phone eh-phone" onPointerDownCapture={() => setAuto(false)}>
          <div className={`eh-screen ${s.open ? "open" : ""}`}>
            {/* the chat: no counter anywhere */}
            <div className="eh-chat">
              <header className="eh-top">
                <button type="button" className="eh-burger" aria-label={HERO.openDrawer} onClick={touch(() => play("open"))}><i /><i /><i /></button>
                <span className="eh-agent"><i aria-hidden="true">B</i>{HERO.agent}</span>
                <span className="eh-top-pad" />
              </header>
              <div className="eh-thread" ref={threadRef}>
                {s.thread.length === 0 ? <p className="eh-empty">Say anything to Basil.<br />Every move counts, quietly.</p> : null}
                {s.thread.map((m) => (
                  <p key={m.k} className={`eh-msg ${m.who} ${m.tap ? "tap" : ""}`}>{m.tap ? `Tapped: ${m.text}` : m.text}</p>
                ))}
              </div>
              <footer className="eh-composer"><span>Message Basil</span><i aria-hidden="true" /></footer>
              <button type="button" className="eh-sliver" aria-label={HERO.closeDrawer} tabIndex={s.open ? 0 : -1} onClick={touch(() => play("close"))} />
            </div>

            {/* the left drawer */}
            <aside className="eh-drawer" aria-label="The drawer" aria-hidden={!s.open}>
              <div className="eh-me">
                <button type="button" className="eh-profile" onClick={touch(() => setS((p) => ({ ...p, panel: p.panel === "settings" ? null : "settings" })))}>
                  <i aria-hidden="true">{HERO.you[0]}</i><span>{HERO.you}</span>
                </button>
                <button type="button" className={`eh-u ${rising ? "rising" : ""}`} aria-live="polite" aria-label={`${fmt(s.balance)} $U`} onClick={touch(() => setS((p) => ({ ...p, panel: p.panel === "u" ? null : "u" })))}>
                  <Coin /><b>{fmt(shown)}</b>
                </button>
              </div>

              <div className="eh-tabs" role="tablist">{HERO.tabs.map((t, k) => <span key={t} className={k === 0 ? "on" : ""}>{t}</span>)}</div>
              <ul className="eh-rows">
                {HERO.home.map((r) => (
                  <li key={r.title}><i aria-hidden="true">{r.icon}</i><span><b>{r.title}</b><small>{r.sub}</small></span></li>
                ))}
              </ul>
              <div className="eh-switch"><i aria-hidden="true">B</i><b>{HERO.agent}</b><span aria-hidden="true">⌃</span></div>

              {s.panel === "u" ? (
                <div className="eh-panel" role="dialog" aria-label={HERO.sheetTitle}>
                  <h3>{HERO.sheetTitle}</h3>
                  <p className="eh-big"><Coin size={30} /><b>{fmt(shown)}</b></p>
                  <div className="eh-row"><span>{HERO.todayLabel} +{fmt(s.today)}</span><span>{past ? HERO.slower : `${fmt(RATES.softCap - s.today)} to full-speed cap`}</span></div>
                  <div className="eh-meter"><span style={{ width: `${capPct}%` }} className={past ? "full" : ""} /></div>
                  <div className="eh-row">
                    <span className="eh-streak"><span className="eh-dots" aria-hidden="true">{Array.from({ length: 7 }, (_, k) => <i key={k} className={k < Math.min(s.day, 7) ? "on" : ""} />)}</span>{HERO.streakLabel(s.day)}</span>
                    {x > 1 ? <span className="eh-x">x{x}</span> : null}
                  </div>
                  <p className="eh-fine">{HERO.note}</p>
                </div>
              ) : null}
              {s.panel === "settings" ? (
                <div className="eh-panel" role="dialog" aria-label={HERO.settingsTitle}>
                  <h3>{HERO.settingsTitle}</h3>
                  <ul className="eh-set">{HERO.settings.map((t) => <li key={t}>{t}<span aria-hidden="true">›</span></li>)}</ul>
                  <p className="eh-fine">{HERO.settingsNote}</p>
                </div>
              ) : null}
            </aside>
          </div>
        </div>

        <div className="jv-pickdots">{moves(true)}</div>
        <p className="jv-note">{HERO.note}</p>
        <p className={`jv-hint ${auto ? "on" : ""}`} aria-live="polite">{HERO.hint(auto)}</p>
        <div className="jv-mode" role="group" aria-label="Replay"><button type="button" onClick={reset}>{HERO.replay}</button></div>
        <p className="jv-claim">{HERO.claim}</p>
      </div>
    </section>
  );
}
