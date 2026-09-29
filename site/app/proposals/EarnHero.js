"use client";
// The PROP-5 hero: $U trickling in as you use Yui, in a phone. Nothing counts on the chat itself: the total lives
// in the left drawer, top right, where the gear and the X used to be, with your profile top left (a tap there opens
// Settings) and the agent at the bottom. Open the drawer and the total climbs from what you last saw; keep going
// with it open and coins drop in. It plays on its own until touched. Copy and rates live in lib/earn-hero.mjs.
// Nothing here records anything.
import { useCallback, useEffect, useRef, useState } from "react";
import { HERO, LOOP, MOVES, RATES, START, streakBonus, streakX } from "../../lib/earn-hero.mjs";
import usePrefs from "./usePrefs";
import "./jev.css";
import "./earn-hero.css";

const fmt = (n) => Math.floor(n).toLocaleString("en-US");
const TICK = 1500; // ms between moves while it plays on its own
const fresh = () => ({ ...START, seen: START.balance, thread: [], coins: [], n: 0, open: false, panel: null });

// What one move earns, given the day so far.
function earn(move, s) {
  if (move.flat) return { amount: move.flat, trickle: false };
  const base = RATES[move.kind] * streakX(s.day);
  const room = Math.max(0, RATES.softCap - s.today);
  const amount = base <= room ? base : room + (base - room) / 10;
  return { amount: Math.round(amount * 10) / 10, trickle: true };
}

// The total eases toward its target, so the number visibly climbs.
function useCountUp(target, reduced) {
  const [shown, setShown] = useState(target);
  const from = useRef(target);
  useEffect(() => {
    if (reduced) { setShown(target); from.current = target; return; }
    const start = from.current, t0 = performance.now(), ms = Math.min(1600, 400 + Math.log10(Math.abs(target - start) + 1) * 320);
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
  const [s, setS] = useState(fresh);
  const [auto, setAuto] = useState(false);
  const loopAt = useRef(0);
  const threadRef = useRef(null);
  // Closed, the drawer holds what you last saw; open, it catches up to now.
  const shown = useCountUp(s.open ? s.balance : s.seen, reduced);

  const play = useCallback((id) => {
    if (id === "open") return setS((p) => ({ ...p, open: true, panel: null }));
    if (id === "close") return setS((p) => ({ ...p, open: false, panel: null, seen: p.balance }));
    if (id === "sheet") return setS((p) => ({ ...p, open: true, panel: "u" }));
    const move = MOVES.find((m) => m.id === id);
    setS((p) => {
      const { amount, trickle } = earn(move, p);
      const n = p.n + 1;
      const thread = [...p.thread, { k: `u${n}`, who: "me", text: move.say, tap: move.tap }, { k: `a${n}`, who: "agent", text: move.reply }].slice(-8);
      // A coin only when the drawer is open: the chat itself never shows $U.
      const coins = p.open ? [...p.coins, { k: n, text: `+${amount >= 100 ? fmt(amount) : amount}`, big: move.big }].slice(-6) : p.coins;
      return { ...p, n, thread, coins, balance: p.balance + amount, today: trickle ? p.today + amount : p.today };
    });
  }, []);

  const nextDay = useCallback(() => {
    setS((p) => {
      const day = p.day + 1, bonus = streakBonus(day), amount = RATES.firstOfDay + bonus;
      const n = p.n + 1;
      const text = bonus ? `Day ${day}. First visit +${RATES.firstOfDay}, streak bonus +${bonus}.` : `Day ${day}. First visit today, +${RATES.firstOfDay}.`;
      return { ...p, n, day, today: 0, balance: p.balance + amount, thread: [{ k: `d${n}`, who: "day", text }], coins: p.open ? [...p.coins, { k: n, text: `+${amount}`, big: !!bonus }].slice(-6) : p.coins };
    });
  }, []);

  const touch = (fn) => () => { setAuto(false); fn(); };
  const reset = () => { setAuto(false); loopAt.current = 0; setS(fresh()); };

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
  const gained = s.balance - s.seen;

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
                <button type="button" className="eh-u" aria-live="polite" aria-label={`${fmt(s.balance)} $U`} onClick={touch(() => setS((p) => ({ ...p, panel: p.panel === "u" ? null : "u" })))}>
                  <b>{fmt(shown)}</b> $U
                  {s.open && gained > 0 ? <em key={s.balance}>+{fmt(gained)}</em> : null}
                </button>
              </div>
              <div className="eh-coins" aria-hidden="true">
                {s.coins.map((c) => <span key={c.k} className={`eh-coin ${c.big ? "big" : ""}`}>{c.text}</span>)}
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
                  <p className="eh-big"><b>{fmt(shown)}</b> $U</p>
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
