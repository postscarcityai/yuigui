"use client";
// The home hero's video: "The new face of Yui", filmed in the app (SOC-6, videos/12-new-face), hosted here.
// The page shows the poster and a play button; the mp4 loads only when someone presses play, so the
// home page stays fast. A new hero video is a new id here (an entry in public/demo/videos/videos.json).
import { useState } from "react";
import { trackCta } from "../../lib/track.mjs";
import videos from "../../public/demo/videos/videos.json";

const ID = "film-new-face";

export default function HeroVideo() {
  const [on, setOn] = useState(false);
  const v = videos[ID], c = v["16x9"];
  const play = () => { setOn(true); trackCta("hero-video", "/"); };
  return (
    <figure className="hero-video">
      {on ? (
        <video src={c.src} poster={c.poster} controls autoPlay playsInline aria-label={`${v.title}, a ${Math.round(c.seconds)} second video`} />
      ) : (
        <button type="button" className="hero-video-play" onClick={play} aria-label={`Play the video: ${v.title}`}>
          <img src={c.poster} alt="" width="1280" height="720" fetchPriority="high" />
          <span className="hero-video-badge" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5.5v13l11-6.5z" /></svg>
          </span>
        </button>
      )}
    </figure>
  );
}
