"use client";
// The home hero's horizontal video. Today it is a placeholder, Yui in 15 seconds. The real hero video
// replaces public/demo/hero/hero-16x9.mp4 and its poster hero-16x9.jpg; nothing in the code changes.
// Muted, looping, with a pause button. With reduced motion it waits for a tap.
import { useEffect, useRef, useState } from "react";

const HERO = {
  src: "/demo/hero/hero-16x9.mp4",
  poster: "/demo/hero/hero-16x9.jpg",
  label: "Yui on an iPhone: an agent answers with screens you can tap",
};

export default function HeroVideo() {
  const ref = useRef(null);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    let still = false;
    try { still = window.matchMedia("(prefers-reduced-motion: reduce)").matches; } catch {}
    if (!still) v.play().catch(() => {});
  }, []);

  const toggle = () => {
    const v = ref.current;
    if (!v) return;
    if (v.paused) v.play().catch(() => {}); else v.pause();
  };

  return (
    <figure className="hero-video">
      <video
        ref={ref}
        src={HERO.src}
        poster={HERO.poster}
        muted
        loop
        playsInline
        preload="metadata"
        aria-label={HERO.label}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onClick={toggle}
      />
      <button type="button" className="hero-video-toggle" onClick={toggle} aria-label={playing ? "Pause the video" : "Play the video"}>
        <svg viewBox="0 0 24 24" aria-hidden="true" fill="currentColor">
          {playing ? <path d="M7 5h3.5v14H7zM13.5 5H17v14h-3.5z" /> : <path d="M8 5.5v13l11-6.5z" />}
        </svg>
      </button>
    </figure>
  );
}
