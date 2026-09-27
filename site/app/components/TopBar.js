"use client";
// The announcement bar over the nav. One line and one button: the button opens the demo.
// The YouTube player loads only when someone presses Watch, from youtube-nocookie.com (see /privacy).
// A new announcement is a new KEY, so a closed bar comes back for the next one.
import { useEffect, useState } from "react";
import { trackCta } from "../../lib/track.mjs";

export const KEY = "yui-topbar-0.4-voice";
const VIDEO = "m_uOEw3rvbI";

export default function TopBar() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  const watch = () => { setOpen(true); trackCta("topbar-voice-demo", location.pathname); };
  const close = () => {
    try { localStorage.setItem(KEY, "1"); } catch (e) {}
    document.documentElement.dataset.topbar = "off";
  };

  return (
    <>
      <div className="topbar" role="region" aria-label="Announcement">
        <div className="wrap topbar-in">
          <p><strong>Yui 0.4:</strong> voice mode.<span> Talk to your agent, it answers on screen.</span></p>
          <button type="button" className="topbar-watch" onClick={watch}>
            <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M8 5.5v13l11-6.5z" /></svg>
            Watch the demo
          </button>
          <button type="button" className="topbar-x" onClick={close} aria-label="Close the announcement">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18" /></svg>
          </button>
        </div>
      </div>
      {open && (
        <div className="topbar-sheet" role="dialog" aria-modal="true" aria-label="Voice mode demo" onClick={() => setOpen(false)}>
          <div className="topbar-player" onClick={(e) => e.stopPropagation()}>
            <iframe
              src={`https://www.youtube-nocookie.com/embed/${VIDEO}?autoplay=1&playsinline=1&rel=0`}
              title="FPA by voice, a Yui voice mode demo"
              allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
              allowFullScreen
            />
          </div>
          <button type="button" className="topbar-sheet-x" onClick={() => setOpen(false)} aria-label="Close the video">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18" /></svg>
          </button>
        </div>
      )}
    </>
  );
}
