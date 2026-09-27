"use client";
// The home hero's video: "Meet Yui", Yui as a whole in one evening (videos/21-meet-yui-home), hosted here.
// The page shows the poster and a play button; the mp4 loads only when someone presses play, so the
// home page stays fast. A new hero video is a new id here (an entry in public/demo/videos/videos.json).
// Landscape on desktop, portrait on a phone: the poster is a <picture> (the browser fetches only the one
// that fits), and the press picks the cut with the same query, so what plays matches what was shown.
import { useState } from "react";
import { trackCta } from "../../lib/track.mjs";
import videos from "../../public/demo/videos/videos.json";

const ID = "film-meet-yui-home";
const PHONE = "(max-width: 759px)";

export default function HeroVideo() {
  const [cut, setCut] = useState(null);
  const v = videos[ID], wide = v["16x9"], tall = v["9x16"] || wide;
  const play = () => {
    const phone = typeof window !== "undefined" && window.matchMedia(PHONE).matches;
    setCut(phone ? tall : wide);
    trackCta("hero-video", "/");
  };
  return (
    <figure className={`hero-video${cut === tall && tall !== wide ? " tall" : ""}`}>
      {cut ? (
        <video src={cut.src} poster={cut.poster} controls autoPlay playsInline aria-label={`${v.title}, a ${Math.round(cut.seconds)} second video`} />
      ) : (
        <button type="button" className="hero-video-play" onClick={play} aria-label={`Play the video: ${v.title}`}>
          <picture>
            <source media={PHONE} srcSet={tall.poster} width="720" height="1280" />
            <img src={wide.poster} alt="" width="1280" height="720" fetchPriority="high" />
          </picture>
          <span className="hero-video-badge" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5.5v13l11-6.5z" /></svg>
          </span>
        </button>
      )}
    </figure>
  );
}
