"use client";
// Quick actions (Agents/QuickActions.swift, YUI-191): the shortcuts your agents put in their drawers, as a
// command palette. Cmd or Ctrl + K opens it anywhere; the drawer has a button for a phone. Type to narrow,
// Up and Down to move, Enter to run, Escape to close.
import { useEffect, useId, useMemo, useRef, useState } from "react";
import { entries } from "../../lib/web/quick.mjs";
import { Dialog } from "./parts";

const KIND = { shortcut: "✦", agent: "→", do: "•" };

export default function Palette({ agents, menus, loading, open, used, light, can, controls, onRun, onClose }) {
  const [query, setQuery] = useState("");
  const [at, setAt] = useState(0);
  const list = useMemo(() => entries({ agents, menus, open, used, query, light, can, controls }), [agents, menus, open, used, query, light, can, controls]);
  const box = useRef(null);
  const id = useId();
  useEffect(() => { setAt(0); }, [query]);
  useEffect(() => { box.current?.querySelector(`[data-i="${at}"]`)?.scrollIntoView({ block: "nearest" }); }, [at]);
  const key = (e) => {
    if (e.key === "ArrowDown") { e.preventDefault(); setAt((i) => Math.min(list.length - 1, i + 1)); }
    else if (e.key === "ArrowUp") { e.preventDefault(); setAt((i) => Math.max(0, i - 1)); }
    else if (e.key === "Enter" && !e.nativeEvent.isComposing) { e.preventDefault(); if (list[at]) onRun(list[at]); }
  };
  return (
    <Dialog label="Quick actions" onClose={onClose} testid="palette">
      <div className="pal">
        <div className="pal-field">
          <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="6.5" fill="none" strokeWidth="2.2" /><path d="M16 16l4.5 4.5" strokeWidth="2.2" strokeLinecap="round" /></svg>
          <input data-autofocus value={query} onChange={(e) => setQuery(e.target.value)} onKeyDown={key} placeholder="Find a shortcut, an agent, an action" aria-label="Find a shortcut, an agent or an action"
            role="combobox" aria-expanded="true" aria-controls={`${id}-list`} aria-activedescendant={list[at] ? `${id}-${at}` : undefined} aria-autocomplete="list" autoComplete="off" autoCapitalize="none" spellCheck="false" enterKeyHint="go" data-testid="palette-input" />
          <button type="button" className="pal-x" onClick={onClose} aria-label="Close quick actions">Esc</button>
        </div>
        <ul className="pal-list" id={`${id}-list`} role="listbox" aria-label="Results" ref={box} data-testid="palette-list">
          {list.map((r, i) => (
            <li key={r.id} id={`${id}-${i}`} data-i={i} role="option" aria-selected={i === at} className={i === at ? "on" : ""} data-testid={`pal-${r.id}`}
              onMouseMove={() => setAt(i)} onClick={() => onRun(r)}>
              <span className="pal-ico" aria-hidden="true">{KIND[r.kind]}</span>
              <span className="pal-words"><b>{r.title}</b><small>{r.sub}</small></span>
            </li>
          ))}
        </ul>
        {!list.length ? <p className="pal-empty" role="status">{loading ? "Looking through your agents…" : query ? "Nothing matches that." : "Nothing here yet."}</p> : null}
        {list.length && loading ? <p className="pal-empty" role="status">Still looking through your agents…</p> : null}
      </div>
    </Dialog>
  );
}
