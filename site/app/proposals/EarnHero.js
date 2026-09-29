"use client";
// The PROP-5 hero: $U trickling in as you use Yui, in a phone. Nothing counts on the chat itself. Open the left
// drawer and what you earned since you last looked flies out of the chat, one coin from each answer, into your
// bank (top right, where the gear and the X were), which counts up as each lands. Your profile is top left (a tap
// opens Settings) and the agent sits at the bottom. It plays on its own until touched. Copy and rates live in
// lib/earn-hero.mjs. Nothing here records anything.
import { useCallback, useEffect, useRef, useState } from "react";
import { HERO, LOOP, MOVES, RATES, START, streakBonus, streakX } from "../../lib/earn-hero.mjs";
import usePrefs from "./usePrefs";
import "./jev.css";
import "./earn-hero.css";

const fmt = (n) => Math.floor(n).toLocaleString("en-US");
const amt = (n) => fmt(Math.max(1, Math.round(n)));
const TICK = 1500; // ms between moves while it plays on its own
const SLIDE = 480; // ms the drawer takes to open, before the first coin leaves
const FLY = 900; // ms one coin takes from the chat to the bank
const GAP = 150; // ms between coins
const MAX_COINS = 8; // more unpaid answers than this ride in one last coin
const fresh = () => ({ ...START, bank: START.balance, thread: [], coins: [], n: 0, open: false, panel: null, gone: 0, lands: 0 });

// What one move earns, given the day so far.
function earn(move, s) {
  if (move.flat) return { amount: move.flat, trickle: false };
  const base = RATES[move.kind] * streakX(s.day);
  const room = Math.max(0, RATES.softCap - s.today);
  const amount = base <= room ? base : room + (base - room) / 10;
  return { amount: Math.round(amount * 10) / 10, trickle: true };
}

// The bank eases toward what has landed, so the number visibly climbs with each coin.
function useCountUp(target, reduced) {
  const [shown, setShown] = useState(target);
  const from = useRef(target);
  useEffect(() => {
    if (reduced) { setShown(target); from.current = target; return; }
    const start = from.current, t0 = performance.now(), ms = Math.min(900, 250 + Math.log10(Math.abs(target - start) + 1) * 220);
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
  const screenRef = useRef(null);
  const bankRef = useRef(null);
  const timers = useRef([]);
  const wasOpen = useRef(false);
  const shown = useCountUp(s.bank, reduced);

  const later = (fn, ms) => timers.current.push(setTimeout(fn, ms));
  const clear = () => { timers.current.forEach(clearTimeout); timers.current = []; };

  const play = useCallback((id) => {
    if (id === "open") return setS((p) => ({ ...p, open: true, panel: null }));
    if (id === "close") return setS((p) => ({ ...p, open: false, panel: null }));
    if (id === "sheet") return setS((p) => ({ ...p, open: true, panel: "u" }));
    const move = MOVES.find((m) => m.id === id);
    setS((p) => {
      const { amount, trickle } = earn(move, p);
      const n = p.n + 1;
      // The answer carries what the move earned: use counts once the agent answers.
      let thread = [...p.thread, { k: `u${n}`, who: "me", text: move.say, tap: move.tap }, { k: `a${n}`, who: "agent", text: move.reply, earn: amount, big: move.big }];
      let gone = p.gone;
      while (thread.length > 8) { const [old] = thread.splice(0, 1); if (old.earn && !old.paid) gone += old.earn; }
      return { ...p, n, thread, gone, balance: p.balance + amount, today: trickle ? p.today + amount : p.today };
    });
  }, []);

  const nextDay = useCallback(() => {
    setS((p) => {
      const day = p.day + 1, bonus = streakBonus(day), amount = RATES.firstOfDay + bonus;
      const n = p.n + 1;
      const text = bonus ? `Day ${day}. First visit +${RATES.firstOfDay}, streak bonus +${bonus}.` : `Day ${day}. First visit today, +${RATES.firstOfDay}.`;
      const gone = p.gone + p.thread.reduce((t, m) => t + (m.earn && !m.paid ? m.earn : 0), 0);
      return { ...p, n, day, today: 0, gone, balance: p.balance + amount, thread: [{ k: `d${n}`, who: "day", text, earn: amount, big: !!bonus }] };
    });
  }, []);

  // While the drawer is open, every unpaid answer sends its coin from the chat to the bank.
  useEffect(() => {
    const opening = s.open && !wasOpen.current;
    wasOpen.current = s.open;
    if (!s.open) return;
    const unpaid = s.thread.filter((m) => m.earn && !m.paid);
    if (!unpaid.length && !s.gone) return;
    if (reduced) {
      setS((p) => ({ ...p, bank: p.balance, gone: 0, thread: p.thread.map((m) => (m.earn ? { ...m, paid: true } : m)) }));
      return;
    }
    const keys = new Set(unpaid.map((m) => m.k));
    const gone = s.gone;
    // Mark them paid now so a second pass never sends them twice; the bank only grows as each coin lands.
    setS((p) => ({ ...p, gone: 0, thread: p.thread.map((m) => (keys.has(m.k) ? { ...m, paid: true } : m)) }));
    later(() => {
      const scr = screenRef.current, bank = bankRef.current;
      if (!scr || !bank) return;
      const sr = scr.getBoundingClientRect(), br = bank.getBoundingClientRect();
      const x1 = br.left - sr.left + br.width / 2 - 22, y1 = br.top - sr.top + br.height / 2 - 13;
      const sliver = sr.width * 0.78 + 10;
      const from = (k) => {
        const el = scr.querySelector(`[data-k="${k}"]`);
        if (!el) return { x0: sliver, y0: sr.height * 0.7 };
        const r = el.getBoundingClientRect();
        const y = Math.min(Math.max(r.top - sr.top + r.height / 2 - 13, 90), sr.height - 110);
        return { x0: Math.max(r.left - sr.left + 8, sliver), y0: y };
      };
      let flights = unpaid.map((m) => ({ ...from(m.k), amount: m.earn, big: m.big }));
      let extra = gone;
      if (flights.length > MAX_COINS) {
        extra += flights.slice(0, flights.length - MAX_COINS).reduce((t, f) => t + f.amount, 0);
        flights = flights.slice(-MAX_COINS);
      }
      if (extra) flights.unshift({ x0: sliver, y0: sr.height - 120, amount: extra, big: extra >= 100 });
      flights.forEach((f, i) => {
        const k = `c${Date.now()}${i}`;
        later(() => setS((p) => ({ ...p, coins: [...p.coins, { k, text: `+${amt(f.amount)}`, big: f.big, x0: f.x0, y0: f.y0, x1, y1 }] })), i * GAP);
        later(() => setS((p) => ({ ...p, bank: p.bank + f.amount, lands: p.lands + 1, coins: p.coins.filter((c) => c.k !== k) })), i * GAP + FLY);
      });
    }, opening ? SLIDE : 220);
  }, [s.open, s.thread, s.gone, reduced]);

  const touch = (fn) => () => { setAuto(false); fn(); };
  const reset = () => { setAuto(false); clear(); loopAt.current = 0; wasOpen.current = false; setS(fresh()); };

  useEffect(() => { setAuto(!window.matchMedia("(prefers-reduced-motion: reduce)").matches); return clear; }, []);
  useEffect(() => {
    if (!auto || reduced) return;
    const t = setTimeout(() => { play(LOOP[loopAt.current % LOOP.length]); loopAt.current += 1; }, loopAt.current === 0 ? 700 : TICK);
    return () => clearTimeout(t);
  }, [auto, reduced, s.n, s.open, s.panel, play]);
  useEffect(() => { const el = threadRef.current; if (el) el.scrollTop = el.scrollHeight; }, [s.thread.length, s.n]);

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
          <div className={`eh-screen ${s.open ? "open" : ""}`} ref={screenRef}>
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
                  <p key={m.k} data-k={m.k} className={`eh-msg ${m.who} ${m.tap ? "tap" : ""}`}>{m.tap ? `Tapped: ${m.text}` : m.text}</p>
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
                <button type="button" ref={bankRef} className="eh-u" aria-live="polite" aria-label={`${HERO.bank}: ${fmt(s.balance)} $U`} onClick={touch(() => setS((p) => ({ ...p, panel: p.panel === "u" ? null : "u" })))}>
                  <b key={s.lands} className={s.lands ? "land" : ""}>{fmt(shown)}</b> $U
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

            {/* coins in flight, from the chat to the bank, over both */}
            <div className="eh-coins" aria-hidden="true">
              {s.coins.map((c) => (
                <span key={c.k} className={`eh-coin ${c.big ? "big" : ""}`} style={{ "--x0": `${c.x0}px`, "--y0": `${c.y0}px`, "--x1": `${c.x1}px`, "--y1": `${c.y1}px`, "--fly": `${FLY}ms` }}>{c.text}</span>
              ))}
            </div>
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
