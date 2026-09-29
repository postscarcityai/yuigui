"use client";
// The PROP-4 hero: Arnold's first-open flow, five screens in a phone. Pick a step or walk Next. All copy and
// lines live in lib/first-plan.mjs. Nothing here calls an agent.
import dynamic from "next/dynamic";
import { useState } from "react";
import { HERO, STEPS } from "../../lib/first-plan.mjs";
import usePrefs from "./usePrefs";
import "./jev.css";

const Live = dynamic(() => import("../mockups/LiveScreen"), { ssr: false, loading: () => <div className="jv-wait">Drawing the screen...</div> });

export default function FirstPlanHero({ children }) {
  const { dark } = usePrefs();
  const [i, setI] = useState(0);
  const step = STEPS[i];
  const last = i === STEPS.length - 1;
  return (
    <section className="prop-hero jv" data-slot="hero" aria-labelledby="prop-h">
      <div className="prop-hero-text">
        {children}
        <div className="jv-pickbox">
          <h2 className="jv-h">{HERO.pickLabel}</h2>
          <ul className="jv-picks" aria-label={HERO.pickLabel}>
            {STEPS.map((s, k) => (
              <li key={s.id}>
                <button type="button" className={k === i ? "on" : ""} aria-pressed={k === i} onClick={() => setI(k)}>
                  <span className="jv-say">{k + 1}. {s.label}</span>
                  <small>{s.hint}</small>
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="prop-hero-phone jv-col">
        <div className="jv-stack">
          <div className="phone sc-phone jv-phone drawn">
            <div className="jv-phone-in" key={`${step.id}${dark}`}>
              <Live yl={step.yl} agent="Arnold" light={!dark} />
            </div>
          </div>
        </div>
        <div className="jv-mode" role="group" aria-label="Steps">
          <button type="button" disabled={i === 0} onClick={() => setI(i - 1)}>{HERO.back}</button>
          <button type="button" className="on" onClick={() => setI(last ? 0 : i + 1)}>{last ? HERO.replay : HERO.next}</button>
        </div>
        <p className="jv-note">{HERO.note}</p>
      </div>
    </section>
  );
}
