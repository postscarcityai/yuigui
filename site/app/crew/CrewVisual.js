"use client";

// A crew member's own blob on /crew (SITE-101, YUI-235): the shader blob the app draws for every agent
// (lib/visual/actionshader.mjs), in the member's colors and knobs (LOOKS_BY_AGENT), idle: a perfect circle
// that breathes. No mic is ever asked; `hears` is a label. It draws only while on screen, Reduce Motion gets
// one still frame, and with no WebGL the card keeps the CSS pattern it had (the .look-orb band underneath).

import { useEffect, useRef, useState } from "react";
import { CREW_VISUALS } from "../../lib/yl/visual.mjs";
import { ActionBlob } from "../playground/shaderlook";
import "../playground/shaderlook.css";

function useFlag(query, attr) {
  const [on, setOn] = useState(false);
  useEffect(() => {
    if (query) {
      const m = window.matchMedia(query);
      const f = () => setOn(m.matches);
      f();
      m.addEventListener("change", f);
      return () => m.removeEventListener("change", f);
    }
    const el = document.documentElement;
    const f = () => setOn(el.getAttribute(attr) === "dark");
    f();
    const mo = new MutationObserver(f);
    mo.observe(el, { attributes: true, attributeFilter: [attr] });
    return () => mo.disconnect();
  }, [query, attr]);
  return on;
}

export default function CrewVisual({ handle }) {
  const wrap = useRef(null);
  const dark = useFlag(null, "data-theme");
  const reduced = useFlag("(prefers-reduced-motion: reduce)");
  const [seen, setSeen] = useState(false);
  const [shown, setShown] = useState(false); // the blob mounts the first time it is near the screen, so six shaders do not compile at load (SITE-148)
  const def = CREW_VISUALS[handle];

  // Draws only while on screen; off screen (or Reduce Motion) it holds one still frame.
  useEffect(() => {
    if (typeof IntersectionObserver === "undefined" || !wrap.current) return undefined;
    const io = new IntersectionObserver(([e]) => { setSeen(e.isIntersecting); if (e.isIntersecting) setShown(true); }, { rootMargin: "80px" });
    io.observe(wrap.current);
    return () => io.disconnect();
  }, []);

  if (!def) return null;
  return (
    <div ref={wrap} className="crew-viz" data-look={def.look} data-still={reduced ? "on" : undefined} aria-hidden="true">
      {shown ? <ActionBlob handle={handle} doing="" dark={dark} still={reduced || !seen} mini /> : null}
    </div>
  );
}
