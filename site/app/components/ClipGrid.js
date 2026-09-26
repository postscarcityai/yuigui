"use client";
// Short screen recordings in a row (home page). A clip plays only while it is on screen and
// downloads nothing until it gets close, so eight of them stay light. Each clip opens on a quiet
// "say hi" screen, so it starts and loops from `start` seconds in, where its screen is already up.
// Reduced motion: posters, and a tap plays one.
import { useEffect, useRef } from "react";

function Clip({ c }) {
  const ref = useRef(null);
  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    let still = false;
    try { still = window.matchMedia("(prefers-reduced-motion: reduce)").matches; } catch {}
    if (still) return;
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) v.play().catch(() => {}); else v.pause();
    }, { threshold: 0.5 });
    io.observe(v);
    return () => io.disconnect();
  }, []);
  const tap = () => { const v = ref.current; if (v) (v.paused ? v.play().catch(() => {}) : v.pause()); };
  const toStart = () => { const v = ref.current; if (v && c.start && v.currentTime < c.start) v.currentTime = c.start; };
  const again = () => { const v = ref.current; if (!v) return; v.currentTime = c.start || 0; v.play().catch(() => {}); };
  return (
    <figure className="clip">
      {/* The caption is burned into the clip itself, so it is the label here, not a second line under it. */}
      <video ref={ref} src={c.src} poster={c.poster} muted playsInline preload="none" aria-label={c.caption}
        onClick={tap} onLoadedMetadata={toStart} onEnded={again} />
    </figure>
  );
}

export default function ClipGrid({ clips }) {
  return (
    <div className="clips" role="list">
      {clips.map((c) => <div role="listitem" key={c.src}><Clip c={c} /></div>)}
    </div>
  );
}
