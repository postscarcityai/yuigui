"use client";
// The PROP-5 hero: $U trickling in as you use Yui, in a phone. Every message, tap and finished job drops a coin
// into the counter, a streak speeds it up, and a day meter shows the soft cap. It plays on its own until touched.
// Copy and rates live in lib/earn-hero.mjs. Nothing here records anything.
import { useCallback, useEffect, useRef, useState } from "react";
import { HERO, LOOP, MOVES, RATES, START, streakBonus, streakX } from "../../lib/earn-hero.mjs";
import usePrefs from "./usePrefs";
import "./jev.css";
import "./earn-hero.css";

const fmt = (n) => Math.floor(n).toLocaleString("en-US");
const TICK = 1700; // ms between moves while it plays on its own

// What one move earns, given the day so far.
function earn(move, s) {
  if (move.flat) return { amount: move.flat, trickle: false };
  const base = RATES[move.kind] * streakX(s.day);
  const room = Math.max(0, RATES.softCap - s.today);
  const amount = base <= room ? base : room + (base - room) / 10;
  return { amount: Math.round(amount * 10) / 10, trickle: true };
}

// The counter eases toward its target, so the number visibly climbs.
function useCountUp(target, reduced) {
  const [shown, setShown] = useState(target);
  const from = useRef(target);
  useEffect(() => {
    if (reduced) { setShown(target); from.current = target; return; }
    const start = from.current, t0 = performance.now(), ms = Math.min(1400, 350 + Math.log10(Math.abs(target - start) + 1) * 300);
    let raf;
    const step = (t) => {
      const k = Math.min(1, (t - t0) / ms), v = start + (target - start) * (1 - Math.pow(1 - k, 3));
      setShown(v); from.current = v;
      if (k < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [target, reduced]);
  return shown;
}

export default function EarnHero({ children }) {
  const { reduced } = usePrefs();
  const [s, setS] = useState({ ...START, thread: [], coins: [], n: 0, bump: 0 });
  const [auto, setAuto] = useState(false);
  const loopAt = useRef(0);
  const threadRef = useRef(null);
  const shown = useCountUp(s.balance, reduced);

  const play = useCallback((id) => {
    const move = MOVES.find((m) => m.id === id);
    setS((p) => {
      const { amount, trickle } = earn(move, p);
      const n = p.n + 1;
      const thread = [...p.thread, { k: `u${n}`, who: "me", text: move.say, tap: move.tap }, { k: `a${n}`, who: "agent", text: move.reply }].slice(-8);
      const coins = [...p.coins, { k: n, text: `+${amount >= 100 ? fmt(amount) : amount}`, big: move.big }].slice(-6);
      return { ...p, n, thread, coins, balance: p.balance + amount, today: trickle ? p.today + amount : p.today, bump: p.bump + 1 };
    });
  }, []);

  const nextDay = useCallback(() => {
    setS((p) => {
      const day = p.day + 1, bonus = streakBonus(day), amount = RATES.firstOfDay + bonus;
      const n = p.n + 1;
      const text = bonus ? `Day ${day}. First visit +${RATES.firstOfDay}, streak bonus +${bonus}.` : `Day ${day}. First visit today, +${RATES.firstOfDay}.`;
      return { ...p, n, day, today: 0, balance: p.balance + amount, bump: p.bump + 1, thread: [{ k: `d${n}`, who: "day", text }], coins: [...p.coins, { k: n, text: `+${amount}`, big: !!bonus }].slice(-6) };
    });
  }, []);

  const reset = () => { setAuto(false); setS({ ...START, thread: [], coins: [], n: 0, bump: 0 }); };
  const touch = (fn) => () => { setAuto(false); fn(); };

  useEffect(() => { setAuto(!window.matchMedia("(prefers-reduced-motion: reduce)").matches); }, []);
  useEffect(() => {
    if (!auto || reduced) return;
    const t = setTimeout(() => { play(LOOP[loopAt.current % LOOP.length]); loopAt.current += 1; }, s.n === 0 ? 700 : TICK);
    return () => clearTimeout(t);
  }, [auto, reduced, s.n, play]);
  useEffect(() => { const el = threadRef.current; if (el) el.scrollTop = el.scrollHeight; }, [s.thread]);

  const x = streakX(s.day);
  const capPct = Math.min(100, (s.today / RATES.softCap) * 100);
  const past = s.today >= RATES.softCap;

  const moves = (chips) => (
    <ul className={chips ? "jv-chips" : "jv-picks"} aria-label={HERO.pickLabel}>
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
          <div className="eh-screen">
            <header className="eh-top">
              <span className="eh-agent"><i aria-hidden="true">B</i>{HERO.agent}</span>
              <span className={`eh-pill ${s.bump ? "bump" : ""}`} key={s.bump} aria-live="polite" aria-label={`${fmt(s.balance)} $U`}>
                <b>{fmt(shown)}</b> $U
              </span>
            </header>

            <div className="eh-coins" aria-hidden="true">
              {s.coins.map((c) => <span key={c.k} className={`eh-coin ${c.big ? "big" : ""}`}>{c.text}</span>)}
            </div>

            <div className="eh-thread" ref={threadRef}>
              {s.thread.length === 0 ? <p className="eh-empty">Say anything to Basil.<br />Every move adds a little.</p> : null}
              {s.thread.map((m) => (
                <p key={m.k} className={`eh-msg ${m.who} ${m.tap ? "tap" : ""}`}>{m.tap ? `Tapped: ${m.text}` : m.text}</p>
              ))}
            </div>

            <footer className="eh-bottom">
              <div className="eh-row">
                <span className="eh-streak" title="Streak">
                  <span className="eh-dots" aria-hidden="true">{Array.from({ length: 7 }, (_, k) => <i key={k} className={k < Math.min(s.day, 7) ? "on" : ""} />)}</span>
                  {HERO.streakLabel(s.day)}
                </span>
                {x > 1 ? <span className="eh-x">x{x}</span> : null}
              </div>
              <div className="eh-meter" role="img" aria-label={`${HERO.todayLabel}: ${fmt(s.today)} of ${RATES.softCap} at full speed`}>
                <span style={{ width: `${capPct}%` }} className={past ? "full" : ""} />
              </div>
              <div className="eh-row small">
                <span>{HERO.todayLabel} +{fmt(s.today)}</span>
                <span>{past ? HERO.slower : `${fmt(RATES.softCap - s.today)} to go at full speed`}</span>
              </div>
            </footer>
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
