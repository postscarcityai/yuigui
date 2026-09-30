"use client";
// The playable first plan on /crew (SITE-118, web parity for PROP-4 / YUI-217): five taps, then the built week as a
// table with today's session and a Start button. SITE-123: the same five questions as the app (YUI-217). Every screen is Yui Lines drawn by the site's own renderer
// (LiveScreen); the questions, the split and the lines are lib/first-plan-play.mjs. Nothing here calls an agent.
import dynamic from "next/dynamic";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ASK, SKIPPED, askLines, norm, planLines, startLines, wholeLines } from "../../lib/first-plan-play.mjs";
import { encodeYL } from "../../lib/share-code.mjs";
import usePrefs from "../proposals/usePrefs";

const Live = dynamic(() => import("../mockups/LiveScreen"), { ssr: false, loading: () => <div className="fp-wait">Drawing the screen...</div> });

const LAST = ASK.length; // the week is step 5, today's session step 6

export default function FirstPlanPlay() {
  const { dark, reduced } = usePrefs();
  const [step, setStep] = useState(0); // 0-4 the questions, 5 the built week, 6 today's session
  const [ans, setAns] = useState({});
  const [code, setCode] = useState("");
  const wait = useRef(null);
  useEffect(() => () => clearTimeout(wait.current), []);
  useEffect(() => { encodeYL(wholeLines(ans)).then(setCode, () => setCode("")); }, [ans]);

  const tap = (value) => {
    if (step < LAST && value.cta) { // Skip for now keeps the starter week
      clearTimeout(wait.current);
      setAns(SKIPPED);
      setStep(LAST);
    } else if (step < LAST && value.choice != null) {
      const id = ASK[step].id;
      setAns({ ...ans, [id]: value.choice });
      clearTimeout(wait.current);
      wait.current = setTimeout(() => setStep(step + 1), reduced ? 120 : 520);
    } else if (step === LAST && value.cta) setStep(LAST + 1);
  };
  const again = () => { clearTimeout(wait.current); setAns({}); setStep(0); };
  const lines = step < LAST ? askLines(step) : step === LAST ? planLines(ans) : startLines(ans);
  const a = norm(ans);

  return (
    <section id="first-plan" className="fp" aria-labelledby="fp-h">
      <div className="fp-text">
        <div className="eyebrow">Try the first plan</div>
        <h2 id="fp-h">The trainer's first plan.</h2>
        <p className="lede">Open the trainer for the first time and it does not start blank. Five questions, one at a time: what you train for, how many days, how long per session, what you have and how much you have lifted. Not sure and Skip are always there. Then your week is built as a table, with today's session ready.</p>
        <ol className="fp-steps" aria-label="The five questions">
          {ASK.map(({ label: l }, i) => (
            <li key={l} className={step > i ? "done" : step === i ? "now" : ""}>
              <b>{i + 1}</b><span>{l}</span>{step > i ? <em>{a[ASK[i].id]}</em> : null}
            </li>
          ))}
        </ol>
        <p className="crew-links fp-links">
          {step >= LAST ? <button type="button" className="fp-again" onClick={again}>Start over</button> : null}
          <Link href={code ? `/playground?yl=${code}` : "/playground"} prefetch={false}>Open it in the playground</Link>
          <Link href="/proposals/first-plan-in-every-agent" prefetch={false}>Read the proposal</Link>
        </p>
      </div>
      <div className="crew-demo fp-demo">
        <div className="phone sc-phone" role="group" aria-label="A live demo of the first plan. Answer five questions and your week is built as a table.">
          <div className="fp-in" key={`${step}${dark}`}>
            <Live yl={lines} agent="Arnold" light={!dark} onTap={tap} />
          </div>
        </div>
        <p className="crew-try">{step < LAST ? "Tap an answer, Not sure or Skip" : step === LAST ? "Tap Start, or start over and change an answer" : "Tick the steps as you go"}</p>
      </div>
    </section>
  );
}
