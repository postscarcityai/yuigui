"use client";
// The shelf at the top of the thread (YUI-246, Presets/Shelf.swift `ShelfBar`): the agent's saved screens as chips.
// A tap reopens one on the stage with no turn and no token. Hold it (a long press, a right click or Delete on the
// focused chip) for Remove: the chip turns into a Remove button for a few seconds, so a finger needs no hover.
import { useEffect, useRef, useState } from "react";

const HOLD_MS = 500;

export default function ShelfBar({ screens, onOpen, onRemove }) {
  const [asked, setAsked] = useState(null);
  const timer = useRef(null);
  const held = useRef(false);
  useEffect(() => {
    if (!asked) return undefined;
    const t = setTimeout(() => setAsked(null), 5000);
    return () => clearTimeout(t);
  }, [asked]);
  useEffect(() => () => clearTimeout(timer.current), []);
  if (!screens.length) return null;
  const down = (name) => { held.current = false; clearTimeout(timer.current); timer.current = setTimeout(() => { held.current = true; setAsked(name); }, HOLD_MS); };
  const up = () => clearTimeout(timer.current);
  return (
    <nav className="wb-shelf" data-testid="shelf" aria-label="Saved screens">
      {screens.map((s) => asked === s.name ? (
        <span key={s.name} className="wb-shelf-ask">
          <button className="wb-shelf-rm" data-testid={`shelf-remove-${s.name}`} onClick={() => { setAsked(null); onRemove(s.name); }}>Remove {s.name}</button>
          <button className="wb-shelf-keep" onClick={() => setAsked(null)} aria-label="Keep it">Keep</button>
        </span>
      ) : (
        <button key={s.name} className="wb-shelf-chip" data-testid={`shelf-${s.name}`} aria-label={`Open ${s.name}`} title="Saved screen. Opens full screen. Hold to remove."
          onPointerDown={() => down(s.name)} onPointerUp={up} onPointerLeave={up} onPointerCancel={up}
          onContextMenu={(e) => { e.preventDefault(); setAsked(s.name); }}
          onKeyDown={(e) => { if (e.key === "Delete" || e.key === "Backspace") { e.preventDefault(); setAsked(s.name); } }}
          onClick={() => { if (held.current) { held.current = false; return; } onOpen(s.name); }}>
          <span aria-hidden="true">{s.stage ? "🏃" : "★"}</span>{s.name}
        </button>
      ))}
    </nav>
  );
}
