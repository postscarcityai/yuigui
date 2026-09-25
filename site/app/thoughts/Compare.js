"use client";
// Before/after in a Thought (SITE-30). Two pictures: drag the handle to wipe between them.
// Two bits of text (or a picture and text): side by side, before on the left.
import { useState } from "react";

const Side = ({ s, which }) => (
  <figure className={`th-side ${which}`}>
    <figcaption><span className="pill">{which === "before" ? "Before" : "After"}</span> {s.label}</figcaption>
    {s.src ? <img src={s.src} alt={s.label} loading="lazy" /> : <pre><code>{s.text.replaceAll("\\n", "\n")}</code></pre>}
  </figure>
);

export default function Compare({ before, after }) {
  const [at, setAt] = useState(50);
  if (!(before.src && after.src)) {
    return <div className="th-compare pair"><Side s={before} which="before" /><Side s={after} which="after" /></div>;
  }
  return (
    <figure className="th-compare wipe">
      <div className="th-wipe" style={{ "--at": `${at}%` }}>
        <img src={after.src} alt={`After: ${after.label}`} loading="lazy" />
        <img className="th-before" src={before.src} alt={`Before: ${before.label}`} loading="lazy" />
        <span className="th-handle" aria-hidden="true" />
        <input type="range" min="0" max="100" value={at} onChange={(e) => setAt(Number(e.target.value))} aria-label="Drag to compare before and after" />
      </div>
      <figcaption><span><span className="pill">Before</span> {before.label}</span><span><span className="pill">After</span> {after.label}</span></figcaption>
    </figure>
  );
}
