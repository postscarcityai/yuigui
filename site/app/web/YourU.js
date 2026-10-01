"use client";
// Your $U on the web (SITE-161, twin of Earn/YourU.swift and EarnStore.swift): the coin and the number in the
// drawer's top right, counting up once when it grew since the last visit, and the Your U sheet behind a tap.
// The number shows only in the drawer, never on the chat. No coins fly, no push, no sound.
// Signed in it reads the person's own rows through their session (lib/web/earn.mjs); on ?demo= it is a sample
// marked as a sample, never a balance.
import { useCallback, useEffect, useRef, useState } from "react";
import {
  COUNT_DELAY_MS, HOW_IT_ADDS_UP, NOTE, countMs, dayWords, fetchSummary, formatU, plan, readSeen, sampleSummary, shortDay, speedWords, streakWords, valueAt, writeSeen,
} from "../../lib/web/earn.mjs";
import { Dialog, SheetBar } from "./parts";
import "./yourU.css";

const reducedNow = () => typeof window !== "undefined" && !!window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

/**
 * The summary and the number on screen. `open`: the drawer is out (a count starts when it opens). `seenOverride`:
 * ?earnseen=<n> on a demo link, the total the person "last saw" (the app's -yuiEarnSeen), so the count can be shown.
 */
export function useEarn({ relay, userId, sample, open, seenOverride = null }) {
  const [summary, setSummary] = useState(sample ? sampleSummary() : null);
  const [shown, setShown] = useState(sample ? sampleSummary().total : 0);
  const [climbing, setClimbing] = useState(false);
  const raf = useRef(0);
  const timer = useRef(0);
  const loaded = useRef(false);
  const stop = useCallback(() => { cancelAnimationFrame(raf.current); clearTimeout(timer.current); }, []);

  const count = useCallback((from, to) => {
    stop();
    setShown(from);
    timer.current = setTimeout(() => {
      setClimbing(true);
      const ms = countMs(from, to), t0 = performance.now();
      const step = (now) => {
        const at = now - t0;
        setShown(valueAt(from, to, at));
        if (at >= ms) { setShown(to); setClimbing(false); return; }
        raf.current = requestAnimationFrame(step);
      };
      raf.current = requestAnimationFrame(step);
    }, COUNT_DELAY_MS);
  }, [stop]);

  // `seeing`: the drawer is out, so the person is looking at the number now. Only then does it count and only
  // then is "what they last saw" written down; a quiet read behind a shut drawer changes nothing they saw.
  const refresh = useCallback(async (seeing) => {
    const next = sample ? sampleSummary() : relay && userId ? await fetchSummary((p, i) => relay.rest(p, i)) : null;
    if (!next) return;
    setSummary(next);
    const storage = typeof window === "undefined" ? null : window.localStorage;
    // A sample never writes down what you "saw": it is not yours.
    const seen = sample ? seenOverride : readSeen(storage, userId);
    if (!sample && seeing) writeSeen(storage, userId, next.total);
    const p = plan({ seen, total: next.total, animate: seeing, reduceMotion: reducedNow() });
    if (p.mode === "count") count(p.from, p.to);
    else { stop(); setClimbing(false); setShown(next.total); }
  }, [relay, userId, sample, seenOverride, count, stop]);

  // One read when the page loads, then one on every opening of the drawer (that one counts).
  useEffect(() => {
    if (open) { loaded.current = true; refresh(true); return; }
    if (!loaded.current) { loaded.current = true; refresh(false); }
  }, [open, refresh]);
  useEffect(() => stop, [stop]);

  return { summary, shown, climbing };
}

// The $U coin, drawn on a 24 point grid like the app's UCoin and the earn hero: a gold coin with a U on its face.
export function UCoin({ size = 20 }) {
  return (
    <svg className="u-coin" viewBox="0 0 24 24" width={size} height={size} aria-hidden="true" focusable="false">
      <circle cx="12" cy="12.8" r="10.2" fill="#d9951c" />
      <circle cx="12" cy="11.6" r="10.2" fill="#ffc83d" />
      <circle cx="12" cy="11.6" r="7.6" fill="none" stroke="#e8a626" strokeWidth="1.3" />
      <path d="M8.9 7.6v4.6a3.1 3.1 0 0 0 6.2 0V7.6" fill="none" stroke="#8a5a00" strokeWidth="2.1" strokeLinecap="round" />
      <path d="M7.6 8.6a6.6 6.6 0 0 1 3.2-2.7" fill="none" stroke="#fff1c2" strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  );
}

/** The pill in the drawer's top right: the coin and the number. Fades to green while the number climbs. */
export function UPill({ earn, onOpen }) {
  const { summary, shown, climbing } = earn;
  if (!summary) return null;
  return (
    <button type="button" className={`u-pill${climbing ? " climbing" : ""}${summary.sample ? " sample" : ""}`} onClick={onOpen} data-testid="drawer-u"
      aria-label={summary.sample ? "Your U, a sample" : "Your U"} title={summary.sample ? "A sample number, not a balance" : "Your U"}>
      <UCoin size={20} />
      <span className="u-num" data-testid="u-shown" aria-live="off">{formatU(shown)}</span>
      {summary.sample ? <small className="u-tag" data-testid="u-sample-tag">sample</small> : null}
    </button>
  );
}

const Row = ({ l, r, testid }) => <div className="u-row"><span>{l}</span><b data-testid={testid}>{r}</b></div>;

/** Your $U (twin of YourUView): total, today against the soft cap, streak, per-day history, how it adds up. */
export function YourU({ earn, onClose }) {
  const s = earn.summary;
  if (!s) return null;
  const pct = Math.min(100, Math.round((Math.min(s.today, s.softCap) / Math.max(s.softCap, 1)) * 100));
  return (
    <Dialog label="Your U" onClose={onClose} testid="your-u">
      <SheetBar title="Your U" right={<button type="button" className="ag-barbtn" onClick={onClose} data-testid="your-u-done">Done</button>} />
      <div className="ag-body u-body">
        <div className="u-hero"><UCoin size={38} /><b data-testid="u-total">{formatU(s.total)}</b></div>
        {s.sample ? <p className="u-sample" data-testid="u-sample-note">A sample, so you can see how it reads. Sign in to see your own.</p> : null}
        <section className="u-card">
          <Row l="Today" r={`${s.today} of ${s.softCap}`} testid="u-today" />
          <div className="u-bar" role="progressbar" aria-label="Today against the daily cap" aria-valuemin={0} aria-valuemax={s.softCap} aria-valuenow={Math.min(s.today, s.softCap)}><i style={{ width: `${pct}%` }} /></div>
          <p className="u-soft">After {s.softCap} a day, each one counts a tenth.</p>
        </section>
        <section className="u-card">
          <Row l="Streak" r={streakWords(s.streak)} testid="u-streak" />
          <Row l="Speed" r={speedWords(s.mult)} testid="u-speed" />
        </section>
        {s.built.length ? (
          <>
            <h3 className="u-h">You helped build</h3>
            <section className="u-card" data-testid="u-built">{s.built.map((b) => <Row key={b.day + b.words} l={shortDay(b.day)} r={b.words} />)}</section>
          </>
        ) : null}
        <h3 className="u-h">Each day</h3>
        <section className="u-card" data-testid="u-days">
          {s.days.length ? s.days.map((d) => <Row key={d.day} l={shortDay(d.day)} r={dayWords(d)} />) : <p className="u-soft">Use Yui and it shows up here.</p>}
        </section>
        <h3 className="u-h">How it adds up</h3>
        <section className="u-card" data-testid="u-formula">
          {HOW_IT_ADDS_UP.map((rows, i) => <div key={i} className="u-table">{rows.map(([l, r]) => <Row key={l} l={l} r={r} />)}</div>)}
        </section>
        <p className="u-note" data-testid="u-note">{NOTE}</p>
      </div>
    </Dialog>
  );
}
