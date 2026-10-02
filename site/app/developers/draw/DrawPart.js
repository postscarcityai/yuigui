"use client";
// One /developers/draw example you can edit. Typing redraws the phone beside it within ~150 ms with the
// same LivePhone the page already uses. A line that fails keeps the last good drawing on screen and
// says which line failed. Reset puts the example back; Open in playground carries the edited lines.
import Link from "next/link";
import { useEffect, useId, useState } from "react";
import LivePhone from "../../mockups/LivePhone";
import { checkLines, failText } from "../../../lib/draw-edit.mjs";
import { playgroundHref } from "../../../lib/draw-examples.mjs";

export default function DrawPart({ d }) {
  const id = useId();
  const [text, setText] = useState(d.yl);
  const [good, setGood] = useState(d.yl);
  const [fail, setFail] = useState(null);

  useEffect(() => {
    const t = setTimeout(() => {
      const r = checkLines(text);
      if (r.ok) { setFail(null); if (text.trim()) setGood(text); }
      else setFail(r);
    }, 150);
    return () => clearTimeout(t);
  }, [text]);

  const rows = Math.min(16, Math.max(5, text.split("\n").length + 1));
  const edited = text !== d.yl;

  return (
    <>
      <div className="dr-media">
        <LivePhone key={good} yl={good} label={`${d.title}, drawn live from Yui Lines`} />
      </div>
      <div className="dr-text">
        <h2 id={`${d.id}-h`}>{d.title} <a href={`#${d.id}`} className="sc-hash" aria-label={`Link to ${d.title}`}>#</a></h2>
        <p>{d.what}</p>
        <p className="dr-parts"><b>Parts:</b> {d.parts}</p>
        <label htmlFor={id} className="dr-lbl">Yui Lines for {d.title}. Edit them and the drawing changes.</label>
        <textarea
          id={id}
          className="dr-edit"
          value={text}
          rows={rows}
          spellCheck={false}
          autoCapitalize="off"
          autoCorrect="off"
          aria-describedby={`${id}-s`}
          aria-invalid={fail ? "true" : undefined}
          onChange={(e) => setText(e.target.value)}
        />
        <p id={`${id}-s`} className={`dr-status ${fail ? "bad" : ""}`} role="status">
          {fail ? failText(fail) : edited ? "Drawn from your lines." : ""}
        </p>
        <p className="dr-open">
          <button type="button" className="dr-reset" onClick={() => { setText(d.yl); setGood(d.yl); setFail(null); }} disabled={!edited}>Reset</button>
          <Link href={playgroundHref(text)}>Open in playground</Link>
        </p>
      </div>
    </>
  );
}
