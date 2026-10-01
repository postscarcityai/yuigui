"use client";

// The stage (YL.md section 5): a full-screen layer over the chat for moments
// that deserve the whole phone. It stays mounted while closed, so a running
// timer keeps running; the chat shows a pill that brings it back.
import { createContext, useContext, useEffect, useRef, useState } from "react";
import { RichText } from "./richtext";
import { useDragDown } from "./dragdown";

// Live one-liners from staged components ("3:12 · Round 2/8"), keyed by
// component key, so the pill in the chat can show what is running.
export const LiveCtx = createContext(null);

// Presets call this with a short status while they are on the stage.
export function useLive(text) {
  const live = useContext(LiveCtx);
  useEffect(() => { if (live) live.report(text); }, [live, text]);
}

// Wraps one staged node so useLive() knows which pill to update.
export function LiveSlot({ id, onLive, children }) {
  const value = useRef(null);
  if (!value.current || value.current.id !== id) value.current = { id, report: (t) => onLive(id, t) };
  return <LiveCtx.Provider value={value.current}>{children}</LiveCtx.Provider>;
}

export function Stage({ open, onClose, agent, children, native = false }) {
  const [drag, setDrag] = useState(0);
  const start = useRef(null);
  const pull = useDragDown(onClose);   // touch: pull the card anywhere down (SITE-98); the bar keeps the mouse drag

  // The keyboard goes when a full screen opens (the app's Keyboard.dismiss), whoever held it.
  useEffect(() => { if (open && native) document.activeElement?.blur?.(); }, [open, native]);
  // The browser's own full screen, behind a button (web only): a window that hides the address bar and tabs.
  const [fs, setFs] = useState(false);
  useEffect(() => {
    if (!native) return undefined;
    const on = () => setFs(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", on);
    return () => document.removeEventListener("fullscreenchange", on);
  }, [native]);
  useEffect(() => { if (!open && document.fullscreenElement) document.exitFullscreen?.().catch(() => {}); }, [open]);
  const toggleFs = (e) => {
    const el = e.currentTarget.closest(".yl-stage");
    if (document.fullscreenElement) document.exitFullscreen?.().catch(() => {});
    else el?.requestFullscreen?.().catch(() => {});
  };

  useEffect(() => {
    if (!open) return;
    const k = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", k);
    return () => window.removeEventListener("keydown", k);
  }, [open, onClose]);

  // Swipe down from anywhere near the top closes it; a short drag springs back.
  const down = (e) => { if (e.pointerType !== "mouse") return; start.current = e.clientY; e.currentTarget.setPointerCapture(e.pointerId); };
  const move = (e) => { if (e.pointerType === "mouse" && start.current != null) setDrag(Math.max(0, e.clientY - start.current)); };
  const up = () => {
    if (start.current == null) return;
    start.current = null;
    if (drag > 90) onClose();
    setDrag(0);
  };

  return (
    <div className={`yl-stage ${open ? "open" : ""}`} aria-hidden={!open} inert={!open}
      data-pull={pull.dragging ? "1" : undefined} {...pull.handlers}
      style={drag ? { transform: `translateY(${drag}px)`, transition: "none" } : pull.style}>
      <div className="yl-stagebar" onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerCancel={up}>
        <span className="yl-stagegrab" />
        <span className="yl-stagewho">{agent}</span>
        {native && typeof document !== "undefined" && document.fullscreenEnabled ? <button className="yl-stagex yl-stagefs" onPointerDown={(e) => e.stopPropagation()} onClick={toggleFs} aria-label={fs ? "Leave the browser's full screen" : "Fill the browser's full screen"} data-testid="stage-fullscreen">{fs ? "⤡" : "⤢"}</button> : null}
        <button className="yl-stagex" onPointerDown={(e) => e.stopPropagation()} onClick={onClose} aria-label="Close full screen">×</button>
      </div>
      <div className="yl-stagebody">{children}</div>
    </div>
  );
}

// In the chat, where staged components would have been: one pill per run.
export function StagePill({ nodes, live, onOpen }) {
  const n = nodes[0];
  const title = n.props.label || n.props.title || n.props.q || n.props.prompt || NAMES[n.preset] || n.preset;
  const status = nodes.map((x) => live[x.key]).find(Boolean);
  return (
    <button className="yl-stagepill" onClick={onOpen}>
      <span className="yl-stagedot" />
      <b>{title}</b>
      {status ? <span className="yl-stagelive">{status}</span> : null}
      {nodes.length > 1 ? <span className="yl-sub">+{nodes.length - 1}</span> : null}
      <span className="yl-stageopen">⤢</span>
    </button>
  );
}

// A sent plan in the chat (YL.md, plan: folding back): what it held, folded.
// Tap to see the pages; Open brings the flow back on the stage.
export function PlanRecord({ rec, onOpen }) {
  const [open, setOpen] = useState(false);
  const n = rec.pages.length;
  const held = [n ? `${n} page${n === 1 ? "" : "s"}` : null, `${rec.answers} answer${rec.answers === 1 ? "" : "s"}`].filter(Boolean).join(", ");
  return (
    <div className={`yl-record ${open ? "open" : ""}`}>
      <button className="yl-recordhead" onClick={() => setOpen(!open)} aria-expanded={open}>
        <span className="yl-stagedot" />
        <b>{rec.title}</b>
        <span className="yl-sub">{held}</span>
        <span className="yl-recordchev">{open ? "▴" : "▾"}</span>
      </button>
      {open ? (
        <div className="yl-recordbody">
          {rec.pages.map((p, i) => (
            <details key={i} className="yl-recordpage">
              <summary>{p.title || `Page ${i + 1}`}</summary>
              {p.body ? <RichText text={p.body} /> : null}
              {p.points.length ? <ul>{p.points.map((t, j) => <li key={j}>{t}</li>)}</ul> : null}
            </details>
          ))}
          <button className="yl-recordopen" onClick={onOpen}>⤢ Open the flow</button>
        </div>
      ) : null}
    </div>
  );
}

const NAMES = { timer: "Timer", camera: "Camera", mic: "Voice note", deck: "Deck", plan: "Plan", flow: "Flow", gallery: "Gallery",
  loop: "Loop", drums: "Drums", keys: "Keys", chords: "Chords", tuner: "Tuner" };
