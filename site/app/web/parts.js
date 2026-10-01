"use client";
// Small pieces the agent screens share (YUI-245): a face, a dialog that traps focus, a switch, a confirm,
// the look picker, a command box with Copy. Each is the web twin of an app view named in its comment.
import { useCallback, useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { SETS } from "../../lib/yl/look.mjs";

// An agent's color: its look's accent, else its color word (AgentBadge).
export function accentOf(agent) {
  return SETS[agent?.theme?.preset]?.accent || SETS[agent?.color]?.accent || "#FF7E8A";
}

export function Face({ agent, size = 40 }) {
  const style = { "--face": accentOf(agent), ...(size !== 40 ? { width: size, height: size, fontSize: Math.round(size * 0.45), borderRadius: Math.round(size * 0.35) } : {}) };
  return <span className="wb-face" style={style} aria-hidden="true">{(agent?.name || "?").slice(0, 1).toUpperCase()}</span>;
}

const FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

// A sheet over the app (a NavigationStack sheet): a full-height sheet at phone width, a centred card on a
// computer. Escape and the scrim close it; Tab stays inside; focus goes back to what opened it.
export function Dialog({ label, onClose, children, wide = false, testid }) {
  const ref = useRef(null);
  const back = useRef(typeof document === "undefined" ? null : document.activeElement);
  useEffect(() => {
    const el = ref.current;
    const first = el?.querySelector("[data-autofocus]") || el?.querySelector(FOCUSABLE);
    (first || el)?.focus();
    const opener = back.current;
    return () => { try { opener?.focus?.(); } catch { /* gone */ } };
  }, []);
  const key = useCallback((e) => {
    if (e.key === "Escape") { e.stopPropagation(); onClose?.(); return; }
    if (e.key !== "Tab") return;
    const items = [...ref.current.querySelectorAll(FOCUSABLE)].filter((n) => n.offsetParent !== null);
    if (!items.length) { e.preventDefault(); return; }
    const a = items[0], z = items[items.length - 1];
    if (e.shiftKey && document.activeElement === a) { e.preventDefault(); z.focus(); }
    else if (!e.shiftKey && document.activeElement === z) { e.preventDefault(); a.focus(); }
  }, [onClose]);
  const host = typeof document === "undefined" ? null : document.querySelector(".web-root") || document.body;
  if (!host) return null;
  return createPortal(
    <div className="ag-layer">
      <button type="button" className="ag-scrim" tabIndex={-1} aria-label="Close" onClick={onClose} />
      <div className={`ag-sheet${wide ? " wide" : ""}`} role="dialog" aria-modal="true" aria-label={label} tabIndex={-1} ref={ref} onKeyDown={key} data-testid={testid}>
        {children}
      </div>
    </div>,
    host,
  );
}

// The sheet's top bar: a title and the buttons the app puts in the toolbar.
export function SheetBar({ title, left = null, right = null }) {
  return (
    <header className="ag-bar">
      <span className="ag-bar-side">{left}</span>
      <h2 className="ag-bar-title">{title}</h2>
      <span className="ag-bar-side end">{right}</span>
    </header>
  );
}

// A confirm in the page: the question, a note, the red button and "Keep it". The safe one is first in tab order.
export function Confirm({ question, note, confirm, keep = "Keep it", onConfirm, onKeep, busy = false, tone = "danger" }) {
  return (
    <Dialog label={question} onClose={onKeep} testid="confirm">
      <div className="ag-confirm">
        <h2>{question}</h2>
        {note ? <p>{note}</p> : null}
        <button type="button" className="ag-btn quiet" data-autofocus onClick={onKeep}>{keep}</button>
        <button type="button" className={`ag-btn${tone === "danger" ? " danger" : ""}`} disabled={busy} onClick={onConfirm} data-testid="confirm-yes">{confirm}</button>
      </div>
    </Dialog>
  );
}

export function Switch({ on, onChange, label, disabled = false }) {
  const id = useId();
  return (
    <button type="button" id={id} role="switch" aria-checked={on} aria-label={label} disabled={disabled} className={`ag-switch${on ? " on" : ""}`} onClick={() => onChange(!on)}>
      <i />
    </button>
  );
}

// "Own" and every named set: a circle of the set's paper and accent (LookPickerRow).
export function LookPicker({ value, onChange, name = "" }) {
  const sets = Object.entries(SETS);
  const chip = (preset, label, s) => {
    const on = (value || null) === preset;
    return (
      <button key={label} type="button" className={`ag-look${on ? " on" : ""}`} aria-label={`${label} look`} aria-pressed={on} onClick={() => onChange(preset)}>
        <span className="ag-look-dot" style={{ "--bg": s.bg, "--ac": s.accent }}><i /></span>
        <small>{label}</small>
      </button>
    );
  };
  return (
    <div className="ag-looks" role="group" aria-label={`Look for ${name || "this agent"}`}>
      {chip(null, "Own", { bg: "#FFF9F0", accent: "#9aa0b8" })}
      {sets.map(([k, s]) => chip(k, k[0].toUpperCase() + k.slice(1), s))}
    </div>
  );
}

// One command to run on the computer, with a Copy button (CommandBox).
export function CommandBox({ command, label = "Copy command", testid }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try { await navigator.clipboard.writeText(command); setCopied(true); setTimeout(() => setCopied(false), 1800); } catch { setCopied(false); }
  };
  return (
    <div className="ag-cmd">
      <code data-testid={testid}>{command}</code>
      <button type="button" className="ag-copy" onClick={copy} aria-label={label}>{copied ? "Copied" : "Copy"}</button>
    </div>
  );
}

export function Spinner({ label }) {
  return <span className="ag-wait" role="status"><i className="ag-spin" aria-hidden="true" />{label}</span>;
}
