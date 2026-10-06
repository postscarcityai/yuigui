"use client";

// One motion film, played by the real player (public/demo/motion/player.html) in a sandboxed iframe.
// The player is the same file the app bundles. A film is a list of scenes the model wrote; they are
// posted in as they were written (`stream`: on the recorded clock, so scene 1 shows in seconds) or all at once.
import { useEffect, useRef, useState } from "react";
import "../motion/motion.css";

const BASE = "/demo/motion";

export default function MotionFilm({ film, stream = false, autoPlay = true, onFirst, label, fill = false }) {
  const frame = useRef(null);
  const [data, setData] = useState(null);
  const [run, setRun] = useState(0);
  const [paused, setPaused] = useState(false);
  const [err, setErr] = useState(null);
  const [info, setInfo] = useState(null);

  useEffect(() => {
    let live = true;
    setData(null); setErr(null);
    fetch(`${BASE}/gallery/${film}.json`).then((r) => r.json()).then((j) => live && setData(j)).catch(() => live && setErr("film missing"));
    return () => { live = false; };
  }, [film]);

  useEffect(() => {
    if (!data) return undefined;
    const timers = [];
    let t0 = 0;
    const on = (e) => {
      const w = frame.current?.contentWindow;
      if (e.source !== w || !e.data || !e.data.motion) return;
      const m = e.data;
      if (m.motion === "ready") {
        t0 = performance.now();
        if (data.theme) w.postMessage({ theme: data.theme }, "*");
        const at = (s) => (stream ? s.at * 1000 : 0);
        data.scenes.forEach((s) => timers.push(setTimeout(() => w.postMessage({ scene: { name: s.name, dur: s.dur, code: s.code } }, "*"), at(s))));
        timers.push(setTimeout(() => w.postMessage({ end: true }, "*"), stream ? data.stats.total_s * 1000 : 0));
        if (!autoPlay) timers.push(setTimeout(() => w.postMessage({ pause: true }, "*"), 0));
      }
      if (m.motion === "first-frame") {
        const first = (performance.now() - t0) / 1000;
        window.__moFirst = performance.now();
        setInfo({ first });
        onFirst?.(first);
      }
      if (m.motion === "need-three") fetch(`${BASE}/three.min.js`).then((r) => r.text()).then((src) => w.postMessage({ three: src }, "*")).catch(() => setErr("three.js missing"));
      if (m.motion === "error") setErr(`${m.scene}: ${m.message}`);
    };
    window.addEventListener("message", on);
    return () => { window.removeEventListener("message", on); timers.forEach(clearTimeout); };
  }, [data, run, stream, autoPlay, onFirst]);

  const toggle = () => {
    const next = !paused;
    setPaused(next);
    frame.current?.contentWindow?.postMessage({ pause: next }, "*");
  };

  return (
    <div className={`mf${fill ? " fill" : ""}`}>
      {data ? (
        <iframe key={run} ref={frame} className="mf-frame" title={label || data.ask} src={`${BASE}/player.html`} sandbox="allow-scripts" />
      ) : (
        <div className="mf-wait">{err || "Loading"}</div>
      )}
      <div className="mf-tools">
        <button onClick={() => { setErr(null); setInfo(null); setPaused(false); setRun((x) => x + 1); }} aria-label="Replay">Replay</button>
        <button onClick={toggle} aria-pressed={paused}>{paused ? "Play" : "Pause"}</button>
      </div>
      {err && data ? <div className="mf-error">{err}</div> : null}
      {info && stream ? <div className="mf-note">Scene 1 written in {data?.scenes?.[0]?.at} s, on screen {info.first.toFixed(1)} s after the player loads.</div> : null}
    </div>
  );
}
