"use client";
// The announcement bar over the nav. One line and one button: the button opens the release film.
// The film is hosted here (public/demo/videos, the id below in videos.json) and loads only when someone
// presses Watch: the landscape cut on a wide screen, the portrait cut on a phone.
// A new announcement is a new KEY, so a closed bar comes back for the next one.
import { useEffect, useState } from "react";
import { trackCta } from "../../lib/track.mjs";
import videos from "../../public/demo/videos/videos.json";

export const KEY = "yui-topbar-0.5.0-crew";
const ID = "film-crew";
const PHONE = "(max-width: 759px), (orientation: portrait)";

export default function TopBar() {
  const [cut, setCut] = useState(null);
  const v = videos[ID];

  useEffect(() => {
    if (!cut) return;
    const onKey = (e) => { if (e.key === "Escape") setCut(null); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [cut]);

  const watch = () => {
    const tall = window.matchMedia(PHONE).matches && v["9x16"];
    setCut(tall ? "9x16" : "16x9");
    trackCta("topbar-050-film", location.pathname);
  };
  const close = () => {
    try { localStorage.setItem(KEY, "1"); } catch (e) {}
    document.documentElement.dataset.topbar = "off";
  };
  const c = cut && v[cut];

  return (
    <>
      <div className="topbar" role="region" aria-label="Announcement">
        <div className="wrap topbar-in">
          <p><strong>Yui 0.5.0:</strong> the crew feels ready.<span> Snap and say, meet each agent, every agent has a home.</span></p>
          <button type="button" className="topbar-watch" onClick={watch}>
            <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M8 5.5v13l11-6.5z" /></svg>
            Watch the film
          </button>
          <button type="button" className="topbar-x" onClick={close} aria-label="Close the announcement">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18" /></svg>
          </button>
        </div>
      </div>
      {c && (
        <div className="topbar-sheet" role="dialog" aria-modal="true" aria-label={v.title} onClick={() => setCut(null)}>
          <div className={`topbar-player${cut === "16x9" ? " wide" : ""}`} onClick={(e) => e.stopPropagation()}>
            <video src={c.src} poster={c.poster} controls autoPlay playsInline aria-label={`${v.title}, a ${Math.round(c.seconds)} second video`} />
          </div>
          <button type="button" className="topbar-sheet-x" onClick={() => setCut(null)} aria-label="Close the video">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18" /></svg>
          </button>
        </div>
      )}
    </>
  );
}
