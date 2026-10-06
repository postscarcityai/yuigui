"use client";
// A motion film full screen on /web (YUI-311, the twin of the app's MotionView). The player is the one file the app
// bundles (public/demo/motion/player.html) in a sandboxed iframe: no origin, no network, one message verb in. The
// film arrives as rows (lib/web/film.mjs), so scene 1 goes in the moment it is written and every later scene is
// appended to the same player while it runs. Close, Escape, or a tap once the film has ended goes back to the stage.
// Reduce Motion plays nothing: one still frame per scene, near its end, with the words the scene says.
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { fresh, handoff, stills, themeFor } from "../../lib/web/film.mjs";
import "./film.css";

const BASE = "/demo/motion";

export default function MotionStage({ film, accent, light, reduced, onClose, label }) {
  const frame = useRef(null);
  const sent = useRef(fresh());
  const ready = useRef(false);
  const [run, setRun] = useState(0);
  const [paused, setPaused] = useState(false);
  const [ended, setEnded] = useState(false);
  const over = useRef(false);
  const [first, setFirst] = useState(false);
  const [err, setErr] = useState(null);
  const [at, setAt] = useState(0);
  const theme = useMemo(() => themeFor(accent, light), [accent, light]);
  const frames = useMemo(() => (reduced ? stills(film) : []), [reduced, film]);
  const shown = frames[Math.min(at, Math.max(0, frames.length - 1))];

  const post = useCallback((m) => frame.current?.contentWindow?.postMessage(m, "*"), []);
  const feed = useCallback(() => {
    if (!ready.current) return;
    const r = handoff(film, sent.current, theme);
    sent.current = r.sent;
    r.posts.forEach(post);
  }, [film, theme, post]);

  // Whatever the film has now goes in; a later scene, or the closing row, goes in when it lands.
  useEffect(feed, [feed]);

  // A new player (first mount or Replay) is owed everything again.
  useEffect(() => {
    sent.current = fresh(); ready.current = false;
    over.current = false; setEnded(false); setFirst(false); setErr(null); setPaused(false);
    const on = (e) => {
      if (e.source !== frame.current?.contentWindow || !e.data || !e.data.motion) return;
      const m = e.data;
      if (m.motion === "ready") { ready.current = true; feed(); if (reduced) post({ pause: true }); }
      else if (m.motion === "first-frame") setFirst(true);
      else if (m.motion === "need-three") fetch(`${BASE}/three.min.js`).then((r) => r.text()).then((src) => post({ three: src })).catch(() => setErr("The 3D part did not load."));
      else if (m.motion === "ended") { over.current = true; setEnded(true); }
      else if (m.motion === "tap") { if (over.current) onClose?.(); }
      else if (m.motion === "error") setErr(m.message || "A scene did not play.");
    };
    window.addEventListener("message", on);
    return () => window.removeEventListener("message", on);
  }, [run]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const k = (e) => { if (e.key === "Escape") onClose?.(); };
    window.addEventListener("keydown", k);
    return () => window.removeEventListener("keydown", k);
  }, [onClose]);

  // Reduce Motion: show the chosen scene's frame, held.
  useEffect(() => {
    if (!reduced || !shown) return;
    post({ pause: true });
    post({ seek: shown.at });
  }, [reduced, shown?.at, film.scenes.length]); // eslint-disable-line react-hooks/exhaustive-deps

  const toggle = () => { const n = !paused; setPaused(n); post({ pause: n }); };
  const replay = () => { setRun((x) => x + 1); };
  const words = film.title || "A film";

  return (
    <div className="mfs" data-testid="film" data-light={light ? "1" : undefined} data-reduced={reduced ? "1" : undefined} data-ended={ended ? "1" : undefined} role="dialog" aria-modal="true" aria-label={label || words}
      style={{ "--mfs-ink": theme.ink, "--mfs-fg": theme.fg, "--mfs-accent": theme.accent }}>
      <iframe key={run} ref={frame} className="mfs-frame" title={words} src={`${BASE}/player.html`} sandbox="allow-scripts" />
      {!first && !err ? <div className="mfs-wait" aria-hidden="true"><i /></div> : null}
      <header className="mfs-top">
        <button className="mfs-btn" onClick={onClose} data-testid="film-close" aria-label="Close the film">Close</button>
        <span className="mfs-title">{words}</span>
        {reduced ? null : (
          <span className="mfs-tools">
            <button className="mfs-btn" onClick={toggle} aria-pressed={paused} data-testid="film-pause">{paused ? "Play" : "Pause"}</button>
            <button className="mfs-btn" onClick={replay} data-testid="film-replay">Replay</button>
          </span>
        )}
      </header>
      {reduced && shown ? (
        <footer className="mfs-still" data-testid="film-still">
          <p className="mfs-cap" aria-live="polite">{shown.caption || words}</p>
          <div className="mfs-nav">
            <button className="mfs-btn" onClick={() => setAt((i) => Math.max(0, i - 1))} disabled={at === 0} aria-label="Previous scene">‹</button>
            <span>{Math.min(at, frames.length - 1) + 1} of {frames.length}{film.done ? "" : "+"}</span>
            <button className="mfs-btn" onClick={() => setAt((i) => Math.min(frames.length - 1, i + 1))} disabled={at >= frames.length - 1} aria-label="Next scene">›</button>
          </div>
        </footer>
      ) : null}
      {err ? <div className="mfs-err" role="status">{err}</div> : null}
    </div>
  );
}
