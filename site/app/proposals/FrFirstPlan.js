"use client";
// Open on a crew card lands on the first plan question (SITE-126, web parity for YUI-225). In the first-run phone's
// thread, until the plan is built, the agent shows its first question (step 1 of N) instead of only the hello line.
// Questions and results are the same Yui Lines as /crew (lib/first-plan-play.mjs for the trainer, lib/crew-first-plans.mjs
// for the rest), drawn by LiveScreen. Yui and brought agents have no first plan and keep the hello.
import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import * as trainer from "../../lib/first-plan-play.mjs";
import * as others from "../../lib/crew-first-plans.mjs";

const Live = dynamic(() => import("../mockups/LiveScreen"), { ssr: false, loading: () => <div className="fr-live-wait">Drawing the screen...</div> });

export const hasFirstPlan = (handle) => handle === "arnold" || others.HANDLES.includes(handle);

export default function FrFirstPlan({ handle, name, light, reduced }) {
  const mine = handle === "arnold";
  const qs = mine ? trainer.ASK : others.ask(handle), LAST = qs.length;
  const [step, setStep] = useState(0);
  const [ans, setAns] = useState({});
  const wait = useRef(null);
  useEffect(() => () => clearTimeout(wait.current), []);

  const tap = (value) => {
    if (step >= LAST) return;
    clearTimeout(wait.current);
    if (value.cta) { setAns(mine ? trainer.SKIPPED : others.skipped(handle)); setStep(LAST); }
    else if (value.choice != null) {
      setAns({ ...ans, [qs[step].id]: value.choice });
      wait.current = setTimeout(() => setStep(step + 1), reduced ? 120 : 520);
    }
  };
  const lines = step < LAST
    ? (mine ? trainer.askLines(step) : others.askLines(handle, step))
    : (mine ? trainer.planLines(ans) : others.resultLines(handle, ans));

  return (
    <div className="fr-firstplan">
      <p className="fr-step" aria-live="polite">{step < LAST ? `Your first plan, step ${step + 1} of ${LAST}` : "Your first plan, built"}</p>
      <div className="fr-live" key={`${step}${light}`}><Live yl={lines} agent={name} light={light} onTap={tap} /></div>
    </div>
  );
}
