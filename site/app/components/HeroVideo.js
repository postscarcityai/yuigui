"use client";
// The home hero's video, "Meet Yui, a generative user interface", on YouTube. The page shows the video's
// own preview image and a play button; YouTube's player (youtube-nocookie.com) loads only when someone
// presses play, so the home page stays fast and sets no YouTube cookies for people who never watch.
// A new hero video is a new id here.
import { useState } from "react";
import { trackCta } from "../../lib/track.mjs";

const HERO = {
  id: "4wmnzP6TQCw",
  title: "Meet Yui, a generative user interface",
};

export default function HeroVideo() {
  const [on, setOn] = useState(false);
  const play = () => { setOn(true); trackCta("hero-video", "/"); };
  return (
    <figure className="hero-video">
      {on ? (
        <iframe
          src={`https://www.youtube-nocookie.com/embed/${HERO.id}?autoplay=1&rel=0&modestbranding=1&playsinline=1`}
          title={HERO.title}
          allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
          allowFullScreen
          referrerPolicy="strict-origin-when-cross-origin"
        />
      ) : (
        <button type="button" className="hero-video-play" onClick={play} aria-label={`Play the video: ${HERO.title}`}>
          <img src={`https://i.ytimg.com/vi/${HERO.id}/maxresdefault.jpg`} alt="" width="1280" height="720" fetchPriority="high" />
          <span className="hero-video-badge" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5.5v13l11-6.5z" /></svg>
          </span>
        </button>
      )}
    </figure>
  );
}
