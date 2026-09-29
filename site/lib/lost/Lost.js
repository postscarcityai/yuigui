"use client";
// The 404 (SITE-104): Yui's sketchbook. Every visit draws a new ASCII scene in a new mix of the brand colors,
// with a new line from Yui. ?seed=<hex> replays one. The art is aria-hidden; the heading and the line are text.
import { useCallback, useEffect, useRef, useState } from "react";
import { newSeed, parseSeed, rngFor } from "./rng.mjs";
import { makeLine, shortPath } from "./lines.mjs";
import { runLost } from "./engine.mjs";
import "./lost.css";

const FIRST = "That page isn't here.";

export default function Lost({ promised = {} }) {
  const stage = useRef(null);
  const [seed, setSeed] = useState(null);
  const [line, setLine] = useState({ text: FIRST });
  const [tag, setTag] = useState(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const q = parseSeed(new URLSearchParams(location.search).get("seed"));
    setSeed(q || newSeed());
  }, []);

  useEffect(() => {
    if (!seed) return;
    const path = location.pathname;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches || new URLSearchParams(location.search).has("still");
    const run = runLost({ stage: stage.current, seed, reduced, hour: new Date().getHours(), path: shortPath(path) });
    setLine(makeLine(rngFor(seed, "line"), path, promised));
    setTag({ n: run.idx + 1, name: run.name });
    history.replaceState(history.state, "", `${path}?seed=${seed}${location.hash}`);
    return () => run.stop();
  }, [seed, promised]);

  const again = useCallback(() => setSeed((s) => { let n = newSeed(); while (n === s) n = newSeed(); return n; }), []);

  useEffect(() => {
    const onKey = (e) => {
      if (e.code !== "Space" || e.target.closest?.("button,a,input,textarea,select,[contenteditable]") || document.querySelector(".yc-layer")) return;
      e.preventDefault(); again();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [again]);

  const copy = () => {
    const url = `${location.origin}${location.pathname}?seed=${seed}`;
    const done = () => { setCopied(true); setTimeout(() => setCopied(false), 1600); };
    if (navigator.clipboard?.writeText) navigator.clipboard.writeText(url).then(done, () => {});
    else { const t = document.createElement("textarea"); t.value = url; document.body.appendChild(t); t.select(); try { document.execCommand("copy"); done(); } catch {} t.remove(); }
  };
  const ask = () => { const fab = document.querySelector(".yc-fab"); if (fab) fab.click(); else location.assign("/help"); };

  return (
    <section className="lost">
      <div className="lost-art" aria-hidden="true">
        <div className="lost-stage" ref={stage} />
        <div className="lost-tag">
          <span>{tag ? `scene ${tag.n} (${tag.name}), seed ${seed}` : " "}</span>
          <button type="button" tabIndex={-1} onClick={copy}>{copied ? "Copied" : "Copy link"}</button>
        </div>
      </div>
      <div className="lost-copy">
        <h1>Page not found</h1>
        <p className="lost-line" aria-live="polite">
          {line.text}
          {line.link && <> <a href={line.link.href}>{line.link.label}</a></>}
        </p>
        <div className="lost-actions">
          <button type="button" className="btn" onClick={again}>Draw another</button>
          <a className="btn lost-ghost" href="/">Home</a>
          <a className="btn lost-ghost" href="/playground">Playground</a>
          <button type="button" className="btn lost-ghost" onClick={ask}>Tell me what you were looking for</button>
        </div>
      </div>
    </section>
  );
}
