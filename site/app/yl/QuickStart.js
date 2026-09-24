"use client";
// Quick start for /yl (SITE-15): five lines, five screens. Tap a line to draw it, copy it into your agent.
import { useState } from "react";
import LivePhone from "../mockups/LivePhone";

const LINES = [
  ["timer 40/20x8 Tabata", "An interval timer: 40 seconds on, 20 off, 8 rounds."],
  ['ask "Log this set?"', "A yes or no question. The tap comes back to the agent."],
  ['choose "What are we training?" Push|Pull|Legs +other', "A quick choice, with room to type your own."],
  ['list Today "Squat 5x5" "Bench 5x5" "Row 5x5" +check', "A checklist the person ticks off."],
  ['chart line "Weight" x=Mon|Tue|Wed|Thu y=180|179|178.5|178 unit=lb', "A chart, straight from the numbers."],
];

function useCopy() {
  const [copied, setCopied] = useState(null);
  const copy = (key, text) => navigator.clipboard?.writeText(text).then(() => {
    setCopied(key);
    setTimeout(() => setCopied(null), 1500);
  });
  return [copied, copy];
}

export default function QuickStart() {
  const [on, setOn] = useState(0);
  const [copied, copy] = useCopy();
  return (
    <section className="qs" aria-labelledby="qs-title">
      <div className="qs-text">
        <h2 id="qs-title">Quick start: five lines, five screens</h2>
        <p>Each line is a whole screen. Tap one to draw it, or copy it into your agent&rsquo;s reply.</p>
        <ol className="qs-lines">
          {LINES.map(([yl, what], i) => (
            <li key={yl} className={i === on ? "on" : undefined}>
              <button type="button" className="qs-show" aria-pressed={i === on} onClick={() => setOn(i)}>
                <code>{yl}</code>
                <span>{what}</span>
              </button>
              <button type="button" className="qs-copy" aria-label={`Copy: ${yl}`} onClick={() => copy(i, yl)}>{copied === i ? "Copied" : "Copy"}</button>
            </li>
          ))}
        </ol>
        <button type="button" className="btn soft" onClick={() => copy("all", LINES.map(([yl]) => yl).join("\n"))}>
          {copied === "all" ? "Copied all five" : "Copy all five"}
        </button>
      </div>
      <div className="qs-phone">
        <LivePhone key={on} yl={LINES[on][0]} label={`${LINES[on][1]} Drawn live from Yui Lines.`} />
      </div>
    </section>
  );
}
