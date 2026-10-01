"use client";
// Try a crew member's first plan (SITE-124): a button under each card's demo swaps the phone for that member's
// first-plan questions (the saved flows of YUI-227), one tap a screen with Not sure and Skip, then a small example
// result labelled as one. Screens are Yui Lines drawn by the site's own renderer (lib/crew-first-plans.mjs).
import dynamic from "next/dynamic";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ask, askLines, hasTimer, resultLines, skipped, startLines, wholeLines } from "../../lib/crew-first-plans.mjs";
import { encodeYL } from "../../lib/share-code.mjs";
import usePrefs from "../proposals/usePrefs";

const Live = dynamic(() => import("../mockups/LiveScreen"), { ssr: false, loading: () => <div className="fp-wait">Drawing the screen...</div> });

export default function CrewFirstPlan({ handle, name, children }) {
  const { dark, reduced } = usePrefs();
  const [on, setOn] = useState(false);
  const [step, setStep] = useState(0);
  const [ans, setAns] = useState({});
  const [go, setGo] = useState(false);
  const [code, setCode] = useState("");
  const wait = useRef(null);
  const qs = ask(handle), LAST = qs.length;
  useEffect(() => () => clearTimeout(wait.current), []);
  useEffect(() => { if (on) encodeYL(wholeLines(handle, ans)).then(setCode, () => setCode("")); }, [on, handle, ans]);

  const start = () => { clearTimeout(wait.current); setAns({}); setStep(0); setGo(false); setOn(true); };
  const tap = (value) => {
    if (step >= LAST) { if (value.cta && hasTimer(handle)) setGo(true); return; } // Start today opens the timer
    clearTimeout(wait.current);
    if (value.cta) { setAns(skipped(handle)); setStep(LAST); } // Skip for now keeps the starter plan
    else if (value.choice != null) {
      setAns({ ...ans, [qs[step].id]: value.choice });
      wait.current = setTimeout(() => setStep(step + 1), reduced ? 120 : 520);
    }
  };
  const lines = step < LAST ? askLines(handle, step) : go ? startLines(handle, ans) : resultLines(handle, ans);

  return (
    <>
      {on ? (
        <>
          <div className="phone sc-phone" role="group" aria-label={`A live demo of ${name}'s first plan. Answer ${LAST} questions and a small example plan is built.`}>
            <div className="fp-in" key={`${step}${go}${dark}`}>
              <Live yl={lines} agent={name} light={!dark} onTap={tap} />
            </div>
          </div>
          <p className="crew-try">{step < LAST ? `Question ${step + 1} of ${LAST}. Tap an answer, Not sure or Skip` : "Start over and change an answer"}</p>
          <p className="crew-links">
            <button type="button" className="fp-again" onClick={start}>Start over</button>
            <button type="button" className="fp-again" onClick={() => setOn(false)}>Back to {name}'s demo</button>
            <Link href={code ? `/playground?yl=${code}` : "/playground"} prefetch={false}>Open it in the playground</Link>
          </p>
        </>
      ) : (
        <>
          {children}
          <p className="crew-links crew-firstplan">
            <button type="button" className="fp-try" onClick={start}>Try their first plan</button>
          </p>
        </>
      )}
    </>
  );
}
