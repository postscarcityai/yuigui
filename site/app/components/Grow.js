"use client";
// "Watch Yui grow" (SITE-16): one screenshot per shipped change, oldest first, with running totals.
// Play steps through on its own, the slider scrubs. Nothing moves until you press Play.
import { useEffect, useState } from "react";

const when = (iso) => new Date(iso).toLocaleString("en-US", { timeZone: "America/New_York", weekday: "short", hour: "numeric", minute: "2-digit" });

export default function Grow({ frames }) {
  const [i, setI] = useState(0);
  const [playing, setPlaying] = useState(false);
  const last = frames.length - 1;
  const f = frames[i];

  useEffect(() => {
    if (!playing) return;
    if (i >= last) { setPlaying(false); return; }
    const t = setTimeout(() => setI((n) => Math.min(n + 1, last)), 1400);
    return () => clearTimeout(t);
  }, [playing, i, last]);

  function toggle() {
    if (!playing && i >= last) setI(0);
    setPlaying((p) => !p);
  }

  return (
    <section className="grow" aria-label="Watch Yui grow">
      <div className="grow-stage">
        <img key={f.src} src={f.src} alt={f.alt} />
      </div>
      <div className="grow-side">
        <div className="grow-when">{when(f.at)}{f.card && <span className="bkey">{f.card}</span>}</div>
        <a className="grow-title" href={`#${f.anchor}`}>{f.title}</a>
        <dl className="grow-stats">
          <div><dt>App commits</dt><dd>{f.totals.app}</dd></div>
          <div><dt>Site commits</dt><dd>{f.totals.site}</dd></div>
          <div><dt>Builds</dt><dd>{f.totals.builds}</dd></div>
          <div><dt>Shipped</dt><dd>{f.totals.shipped}</dd></div>
        </dl>
        <div className="grow-ctl">
          <button type="button" className="grow-play" onClick={toggle} aria-label={playing ? "Pause" : "Play"}>
            {playing ? "❚❚" : "▶"}
          </button>
          <input
            type="range" min="0" max={last} value={i} aria-label="Scrub through time"
            aria-valuetext={`${i + 1} of ${frames.length}: ${f.title}`}
            onChange={(e) => { setPlaying(false); setI(Number(e.target.value)); }}
          />
          <span className="grow-n">{i + 1}/{frames.length}</span>
        </div>
      </div>
    </section>
  );
}
