"use client";
// The PROP-2 hero (SITE-94): the Jev layer routing one turn at a time, in a phone. Pick a message. The typed
// decision chips spring in, then the real Yui Lines screen draws. Flip to Without Jev to see the guess the
// guide alone tends to make. All copy and lines live in lib/jev-hero.mjs. Nothing here calls Jev.
import dynamic from "next/dynamic";
import { useCallback, useEffect, useRef, useState } from "react";
import { CLAIM, EXAMPLES, HERO } from "../../lib/jev-hero.mjs";
import usePrefs from "./usePrefs";
import "./jev.css";

const Live = dynamic(() => import("../mockups/LiveScreen"), { ssr: false, loading: () => <div className="jv-wait">Drawing the screen...</div> });

const STEP = 170; // ms between chips springing in
const LOOP = 8200; // ms each example plays while nobody has touched it

export default function JevHero({ children, title }) {
  const { reduced, dark } = usePrefs();
  const [i, setI] = useState(0);
  const [jev, setJev] = useState(true);
  const [auto, setAuto] = useState(false);
  const [phase, setPhase] = useState("drawn"); // chips | drawn
  const timers = useRef([]);
  const ex = EXAMPLES[i];

  const clear = () => { timers.current.forEach(clearTimeout); timers.current = []; };
  const stop = useCallback(() => { clear(); setAuto(false); }, []);

  // A new example (or a flip) restarts the little show: chips first, then the screen.
  useEffect(() => {
    clear();
    if (reduced) { setPhase("drawn"); return; }
    setPhase("chips");
    const n = jev ? ex.decision.length + 2 : 2;
    timers.current.push(setTimeout(() => setPhase("drawn"), 300 + n * STEP));
    return clear;
  }, [i, jev, reduced, ex.decision.length]);

  useEffect(() => {
    if (!auto || reduced) return;
    const t = setTimeout(() => setI((k) => (k + 1) % EXAMPLES.length), LOOP);
    return () => clearTimeout(t);
  }, [auto, i, reduced]);
  useEffect(() => { setAuto(!window.matchMedia("(prefers-reduced-motion: reduce)").matches); return clear; }, []);

  const pick = (k) => { stop(); setI(k); };
  const flip = (v) => { stop(); setJev(v); };
  const yl = jev ? ex.yl : ex.guess.yl;
  const shown = jev ? ex.decision.find((d) => d.q === "shape").a : ex.guess.shape;

  const list = (chips) => (
    <ul className={chips ? "jv-chips" : "jv-picks"} aria-label={HERO.pickLabel}>
      {EXAMPLES.map((e, k) => (
        <li key={e.id}>
          <button type="button" className={k === i ? "on" : ""} aria-pressed={k === i} onClick={() => pick(k)}>
            <span className="jv-say">{chips ? e.say : `"${e.say}"`}</span>
            {chips ? null : <small>{e.to}</small>}
          </button>
        </li>
      ))}
    </ul>
  );

  return (
    <section className={`prop-hero jv ${reduced ? "still" : ""}`} data-slot="hero" aria-labelledby="prop-h">
      <div className="prop-hero-text">
        {children}
        <div className="jv-pickbox"><h2 className="jv-h">{HERO.pickLabel}</h2>{list(false)}</div>
      </div>

      <div className="prop-hero-phone jv-col">
        <div className="jv-mode" role="group" aria-label="With or without the Jev layer">
          <button type="button" className={jev ? "on" : ""} aria-pressed={jev} onClick={() => flip(true)}>{HERO.withLabel}</button>
          <button type="button" className={!jev ? "on" : ""} aria-pressed={!jev} onClick={() => flip(false)}>{HERO.withoutLabel}</button>
        </div>

        <div className="jv-stack" onPointerDownCapture={stop} onKeyDownCapture={stop}>
          <aside className={`jv-strip ${jev ? "with" : "without"}`} aria-label={`${HERO.layer}: the typed decision`} aria-live="polite" key={`${ex.id}${jev}${reduced}`}>
            <div className="jv-strip-head">
              <b>{jev ? HERO.layer : "Guessing"}</b>
              <span className="jv-msg">"{ex.say}"</span>
            </div>
            {jev ? (
              <>
                <ul className="jv-dec">
                  {ex.decision.map((d, k) => (
                    <li key={d.q} style={{ "--i": k }}><code className="jv-q">{d.q}</code><code className="jv-a">{d.a}</code><small>{d.c}</small></li>
                  ))}
                </ul>
                <p className="jv-ms" style={{ "--i": ex.decision.length }}><b>{ex.ms}</b> {HERO.ms}<span>claimed 70 to 500</span></p>
                <p className="jv-line" style={{ "--i": ex.decision.length + 1 }}>{ex.hint}</p>
              </>
            ) : (
              <>
                <ul className="jv-dec">
                  <li style={{ "--i": 0 }}><code className="jv-q">shape</code><code className="jv-a miss">{ex.guess.shape}</code><small>guess</small></li>
                </ul>
                <p className="jv-line miss" style={{ "--i": 1 }}>{ex.guess.note}</p>
              </>
            )}
          </aside>

          <div className={`phone sc-phone jv-phone ${phase}`} data-shown={shown}>
            <div className="jv-phone-in" key={`${ex.id}${jev}${dark}`}>
              {phase === "drawn" ? (
                <Live yl={yl} agent="Yui" light={!dark} />
              ) : (
                <div className="jv-think" role="status"><span className="jv-dots" aria-hidden="true"><i /><i /><i /></span>{jev ? "Jev is deciding" : "The model is guessing"}</div>
              )}
            </div>
          </div>
        </div>

        <div className="jv-pickdots">{list(true)}</div>
        <p className="jv-note">{jev ? HERO.withNote : HERO.withoutNote}</p>
        <p className={`jv-hint ${auto ? "on" : ""}`} aria-live="polite">{HERO.hint(auto)}</p>
        <p className="jv-claim">{CLAIM}</p>
      </div>
    </section>
  );
}
