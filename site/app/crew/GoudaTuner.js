"use client";
// Gouda's last screen is the Tuner (SITE-151, web twin of YUI-252). The demo shows the beat flow; a Tune up button
// under it jumps straight to the tuner screen, the same `tuner guitar` the playground draws. No chat turn, nothing
// typed, no mic until the person taps Start. A second button goes back to the beat.
import { useState } from "react";
import LivePhone from "../mockups/LivePhone";
import usePrefs from "../proposals/usePrefs";
import { TUNER_YL } from "../../lib/crew-first-plans.mjs";

export default function GoudaTuner({ name, label, children }) {
  const { dark } = usePrefs();
  const [on, setOn] = useState(false);
  return (
    <>
      {on ? <LivePhone key={`tuner${dark}`} yl={TUNER_YL} agent={name} light={!dark} eager label={`${name}'s tuner, the last screen. Tap Start, then play a string.`} /> : children}
      <p className="crew-links crew-firstplan">
        {on
          ? <button type="button" className="fp-try" onClick={() => setOn(false)}>Back to the beat</button>
          : <button type="button" className="fp-try" onClick={() => setOn(true)} aria-label={label}>Tune up</button>}
      </p>
    </>
  );
}
