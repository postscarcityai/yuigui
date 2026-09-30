"use client";
// The playable first plan on /crew (SITE-118, web parity for PROP-4 / YUI-217): four taps, then the split as a
// table with today's session and a Start button. Every screen is Yui Lines drawn by the site's own renderer
// (LiveScreen); the questions, the split and the lines are lib/first-plan-play.mjs. Nothing here calls an agent.
import dynamic from "next/dynamic";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ASK, askLines, norm, planLines, startLines, wholeLines } from "../../lib/first-plan-play.mjs";
import { encodeYL } from "../../lib/share-code.mjs";
import usePrefs from "../proposals/usePrefs";

const Live = dynamic(() => import("../mockups/LiveScreen"), { ssr: false, loading: () => <div className="fp-wait">Drawing the screen...</div> });

const LABELS = ["Days", "Training", "Gear", "Effort"];

export default function FirstPlanPlay() {
  const { dark, reduced } = usePrefs();
  const [step, setStep] = useState(0); // 0-3 the questions, 4 the saved split, 5 today's session
  const [ans, setAns] = useState({});
  const [code, setCode] = useState("");
  const wait = useRef(null);
  useEffect(() => () => clearTimeout(wait.current), []);
  useEffect(() => { encodeYL(wholeLines(ans)).then(setCode, () => setCode("")); }, [ans]);

  const tap = (value) => {
    if (step < 4 && value.choice != null) {
      const id = ASK[step].id;
      const next = { ...ans, [id]: value.choice };
      setAns(next);
      clearTimeout(wait.current);
      wait.current = setTimeout(() => setStep(step + 1), reduced ? 120 : 520);
    } else if (step === 4 && value.cta) setStep(5);
  };
  const again = () => { clearTimeout(wait.current); setAns({}); setStep(0); };
  const lines = step < 4 ? askLines(step) : step === 4 ? planLines(ans) : startLines(ans);
  const a = norm(ans);

  return (
    <section id="first-plan" className="fp" aria-labelledby="fp-h">
      <div className="fp-text">
        <div className="eyebrow">Try the first plan</div>
        <h2 id="fp-h">The trainer's first plan.</h2>
        <p className="lede">Open the trainer for the first time and it does not start blank. Four taps: days, kind of training, gear and effort. Then your split is saved as a table, with today's session ready.</p>
        <ol className="fp-steps" aria-label="The four taps">
          {LABELS.map((l, i) => (
            <li key={l} className={step > i ? "done" : step === i ? "now" : ""}>
              <b>{i + 1}</b><span>{l}</span>{step > i ? <em>{i === 0 ? `${a.days} days` : a[ASK[i].id].replace(/^Skip.*/, "Default")}</em> : null}
            </li>
          ))}
        </ol>
        <p className="crew-links fp-links">
          {step >= 4 ? <button type="button" className="fp-again" onClick={again}>Start over</button> : null}
          <Link href={code ? `/playground?yl=${code}` : "/playground"} prefetch={false}>Open it in the playground</Link>
          <Link href="/proposals/first-plan-in-every-agent" prefetch={false}>Read the proposal</Link>
        </p>
      </div>
      <div className="crew-demo fp-demo">
        <div className="phone sc-phone" role="group" aria-label="A live demo of the first plan. Answer four questions and the split is saved as a table.">
          <div className="fp-in" key={`${step}${dark}`}>
            <Live yl={lines} agent="Arnold" light={!dark} onTap={tap} />
          </div>
        </div>
        <p className="crew-try">{step < 4 ? "Tap an answer" : step === 4 ? "Tap Start, or start over and change an answer" : "Tick the steps as you go"}</p>
      </div>
    </section>
  );
}
