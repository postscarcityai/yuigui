"use client";
// The Speed readout (YUI-250): on while the Speed switch is on (?perf=1). A small line at the bottom, out of the
// way of touches, one number a second. Never rendered for a person.
import { useEffect, useRef, useState } from "react";
import { frameStats, hudLine, pageTimings } from "../../lib/web/perf.mjs";

export default function PerfHud() {
  const [line, setLine] = useState("");
  const stamps = useRef([]);
  useEffect(() => {
    let raf = 0;
    const tick = (t) => { stamps.current.push(t); if (stamps.current.length > 120) stamps.current.shift(); raf = requestAnimationFrame(tick); };
    raf = requestAnimationFrame(tick);
    const every = setInterval(() => {
      const cut = performance.now() - 1000;
      const lately = stamps.current.filter((t) => t >= cut);
      const text = hudLine(frameStats(lately), pageTimings());
      setLine(text);
      console.info("[yui perf]", text);
    }, 1000);
    return () => { cancelAnimationFrame(raf); clearInterval(every); };
  }, []);
  return <div className="wb-perf" data-testid="perf-hud" aria-hidden="true">{line}</div>;
}
