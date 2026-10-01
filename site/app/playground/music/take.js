"use client";
// Record, then Stop and send (YUI-246): the browser's twin of Presets/MusicTake.swift `TakeControl`. It records what
// the engine plays (engine.js startTake, never the mic), and on Stop uploads the audio and the notes' .mid to the
// thread's media and sends the event the phone sends: `audio`, `midi` (signed links), `seconds`. One take at a time.
// With no thread to upload to (the playground) the take stays here as two downloads. Browsers that cannot record
// the engine (no MediaRecorder) show nothing, the way a phone with no mic permission shows a quiet button.
import { useEffect, useRef, useState } from "react";
import { MIN_TAKE_SECONDS, MAX_TAKE_SECONDS, midiFile, takeClock, takeEcho, takeFields } from "../../../lib/music/take.mjs";
import { takeHost } from "../../../lib/web/take-host.mjs";
import { startTake, stopTake, takeIsOn, takeSeconds, takeSupport } from "./engine";

let owner = null;

// A pattern take's audio and midi as the fields the event carries: uploaded to the thread's media when there is one,
// else null (the playground keeps the take off the wire). `take` is the promise stopTake() gave.
export async function sendTake(take, bpm) {
  const host = takeHost();
  const t = await take;
  if (!host || !t || t.seconds < MIN_TAKE_SECONDS) return null;
  try {
    const audio = await host.upload(t.audio, t.mime, t.ext);
    const midi = t.notes.length ? await host.upload(new Blob([midiFile(t.notes, bpm)], { type: "audio/midi" }), "audio/midi", "mid").catch(() => null) : null;
    return takeFields({ audio, midi, seconds: t.seconds });
  } catch { return null; }
}

export function TakeControl({ bpm = 120, extra = null, emit, locked = false }) {
  const me = useRef({});
  const [phase, setPhase] = useState("idle"); // idle | rec | sending | sent | failed
  const [secs, setSecs] = useState(0);
  const [note, setNote] = useState("");
  const [files, setFiles] = useState(null);
  const [can, setCan] = useState(false);
  useEffect(() => setCan(takeSupport()), []);
  useEffect(() => () => { if (owner === me.current && takeIsOn()) { owner = null; stopTake(); } }, []);
  useEffect(() => {
    if (phase !== "rec") return undefined;
    const t = setInterval(() => { const s = takeSeconds(); setSecs(s); if (s >= MAX_TAKE_SECONDS) stop(); }, 250);
    return () => clearInterval(t);
  }); // eslint-disable-line react-hooks/exhaustive-deps

  const start = () => {
    if (owner && owner !== me.current) return;
    if (!startTake()) { setPhase("failed"); setNote("Couldn't record. Try again."); return; }
    owner = me.current; setFiles(null); setSecs(0); setPhase("rec"); setNote("");
  };
  const stop = async () => {
    if (owner !== me.current) return;
    owner = null;
    const take = await stopTake();
    if (!take || take.seconds < MIN_TAKE_SECONDS) { setPhase("failed"); setNote("Too short. Play, then stop."); return; }
    const mid = new Blob([midiFile(take.notes, bpm)], { type: "audio/midi" });
    const host = takeHost();
    if (!host) {
      setFiles({ audio: URL.createObjectURL(take.audio), midi: URL.createObjectURL(mid), ext: take.ext, seconds: take.seconds });
      setPhase("sent"); setSecs(take.seconds); setNote("");
      return;
    }
    setPhase("sending"); setSecs(take.seconds);
    try {
      const audio = await host.upload(take.audio, take.mime, take.ext);
      const midi = take.notes.length ? await host.upload(mid, "audio/midi", "mid").catch(() => null) : null;
      emit({ ...takeFields({ audio, midi, seconds: take.seconds }, extra ? extra() : {}), _echo: takeEcho(take.seconds) });
      setPhase("sent");
    } catch { setPhase("failed"); setNote("Couldn't send it. Try again."); }
  };

  if (!can) return null;
  const rec = phase === "rec";
  const text = rec ? takeClock(secs) : phase === "sending" ? "Sending the take" : phase === "sent" ? (files ? `Take ready, ${takeClock(secs)}` : `Take sent, ${takeClock(secs)}`) : note;
  return (
    <div className="mu-take" data-testid="take">
      <button className={`mu-btn mu-send${rec ? " rec" : ""}`} data-testid="take-record" disabled={locked || phase === "sending"} onClick={rec ? stop : start}>
        {rec ? "■ Stop and send" : phase === "sending" ? "Sending" : phase === "sent" ? "● Record again" : "● Record"}
      </button>
      {text ? <span className="mu-take-status" data-testid="take-status" aria-live="polite">{rec ? <i aria-hidden="true" /> : null}{text}</span> : null}
      {files ? <span className="mu-take-files"><a href={files.audio} download={`take.${files.ext}`}>.{files.ext}</a><a href={files.midi} download="take.mid">.mid</a></span> : null}
    </div>
  );
}
