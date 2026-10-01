"use client";
// Make your own on /crew (SITE-159, web twin of Start blank, YUI-138): a dashed tile like the app's row. Tap it and
// the five-question setup plays in a phone, then the new agent greets in the voice picked. Lines: lib/make-your-own.mjs.
import dynamic from "next/dynamic";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ASK, SKIP, askLines, greetLines, wholeLines } from "../../lib/make-your-own.mjs";
import { encodeYL } from "../../lib/share-code.mjs";
import usePrefs from "../proposals/usePrefs";

const Live = dynamic(() => import("../mockups/LiveScreen"), { ssr: false, loading: () => <div className="fp-wait">Drawing the screen...</div> });
const LAST = ASK.length; // the greeting is step 5

export default function MakeYourOwn() {
  const { dark, reduced } = usePrefs();
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);
  const [ans, setAns] = useState({});
  const [code, setCode] = useState("");
  const wait = useRef(null);
  useEffect(() => () => clearTimeout(wait.current), []);
  useEffect(() => { encodeYL(wholeLines(ans)).then(setCode, () => setCode("")); }, [ans]);

  const tap = (value) => {
    if (step >= LAST) return;
    const id = ASK[step].id;
    if (value.cta) setAns({ ...ans, [id]: SKIP });
    else if (value.choice != null) setAns({ ...ans, [id]: value.choice });
    else return;
    clearTimeout(wait.current);
    wait.current = setTimeout(() => setStep((s) => s + 1), reduced ? 120 : 520);
  };
  const again = () => { clearTimeout(wait.current); setAns({}); setStep(0); };
  const lines = step < LAST ? askLines(step) : greetLines(ans);

  return (
    <section id="make-your-own" className="myo" aria-labelledby="myo-h">
      {open ? (
        <div className="myo-open">
          <div className="fp-text">
            <div className="eyebrow">Make your own</div>
            <h2 id="myo-h">Make your own.</h2>
            <p className="lede">You are not stuck with the crew. Add an agent and start blank: five questions, one at a time. Its name, how it talks, its look, the screens it reaches for and its model. Not sure and Skip are always there.</p>
            <ol className="fp-steps" aria-label="The five questions">
              {ASK.map(({ label: l, id }, i) => (
                <li key={l} className={step > i ? "done" : step === i ? "now" : ""}>
                  <b>{i + 1}</b><span>{l}</span>{step > i ? <em>{ans[id]}</em> : null}
                </li>
              ))}
            </ol>
            <p className="crew-links fp-links">
              {step >= 1 ? <button type="button" className="fp-again" onClick={again}>Start over</button> : null}
              <Link href={code ? `/playground?yl=${code}` : "/playground?demo=start-blank"} prefetch={false}>Open it in the playground</Link>
            </p>
          </div>
          <div className="crew-demo fp-demo">
            <div className="phone sc-phone" role="group" aria-label="A live demo of starting a blank agent. Answer five questions and it greets you in the voice you picked.">
              <div className="fp-in" key={`${step}${dark}`}><Live yl={lines} agent="Yui" light={!dark} onTap={tap} /></div>
            </div>
            <p className="crew-try">{step < LAST ? "Tap an answer, Not sure or Skip" : "Meet your new agent. Start over to make another"}</p>
          </div>
        </div>
      ) : (
        <button type="button" className="myo-tile" onClick={() => setOpen(true)} aria-expanded="false" aria-controls="make-your-own">
          <span className="myo-plus" aria-hidden="true">+</span>
          <span className="myo-copy"><b id="myo-h">Make your own</b><span>Start blank. Five taps and it is yours.</span></span>
          <span className="myo-go">Try it</span>
        </button>
      )}
    </section>
  );
}
