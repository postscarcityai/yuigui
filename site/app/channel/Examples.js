"use client";
// /channel (SITE-23): the guide's own examples, drawn with the playground renderers.
// Each row is a line an agent would write; the phone shows the screen it makes.
import { useState } from "react";
import LivePhone from "../mockups/LivePhone";

export default function Examples({ items }) {
  const [on, setOn] = useState(0);
  const cur = items[on];
  return (
    <section className="qs" aria-labelledby="ex-title">
      <div className="qs-text">
        <h2 id="ex-title">What the guide asks for, drawn</h2>
        <p>These are the guide&rsquo;s own examples. Tap one to draw it. This is what your agent sends back.</p>
        <ol className="qs-lines">
          {items.map((it, i) => (
            <li key={it.key} className={i === on ? "on" : undefined}>
              <button type="button" className="qs-show" aria-pressed={i === on} onClick={() => setOn(i)}>
                <code>{it.title}</code>
                <span>{it.what}</span>
              </button>
            </li>
          ))}
        </ol>
      </div>
      <div className="qs-phone qs-stack">
        <LivePhone key={cur.key} yl={cur.yl} agent={cur.agent} label={`${cur.what} Drawn live from Yui Lines.`} />
        <div className="qs-links">
          {cur.play && <a className="btn soft" href={cur.play}>Open in the playground</a>}
          {cur.share && <a className="btn soft" href={cur.share}>Share link</a>}
        </div>
      </div>
    </section>
  );
}
