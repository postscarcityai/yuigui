"use client";
// The starter screens of one agent (pages 2 and up), drawn with the playground's renderers from its home.yui.
import { useCallback, useMemo, useState } from "react";
import { apply, initialState, parse } from "../../../lib/yl/yl.mjs";
import { boundTables } from "../../../lib/yl/tables.mjs";
import { Render, StepGroup, TABLES } from "../../playground/presets";
import { Group, groupNodes } from "../../playground/flows";
import { ScreenCtx } from "../../playground/science";
import "../../playground/flows.css";

export function build(yl) {
  let s = initialState();
  for (const op of parse(yl)) s = apply(s, op);
  return s;
}

// Page numbers with something on them, in order (spec/YL.md, Pages).
export function pagesOf(state) {
  return Object.keys(state.screens).filter((k) => /^(?:[2-9]|1[0-2])$/.test(k) && state.screens[k].length).sort((a, b) => a - b);
}

// One page. The site chat (SITE-83, ChatPages.js) draws its pages with it too, with its own class.
// Keys carry seq: a page keeps lines from several replies, and auto ids (n1) restart every reply.
export function Page({ nodes, screen, state, light, onTap, agent, className }) {
  const [st, setSt] = useState(state);
  const dispatch = useCallback((op) => setSt((s) => apply(s, op)), []);
  const emit = (n) => (value) => onTap?.({ id: n.id, preset: n.preset, ...value });
  const key = (n, i, what) => `${n.seq ?? i}:${n.key}:${what}`;
  return (
    <div className={className || `screen hm-scr${light ? " light" : ""}`}>
      <div className="pg-screen">
        <ScreenCtx.Provider value={{ nodes, tables: { ...TABLES, ...boundTables(st.data) }, data: st.data, agent, screen, dispatch }}>
          {groupNodes(nodes).map((n, i) => n.steps ? (
            <div key={key(n, i, "steps")} className="pg-node"><StepGroup nodes={n.steps} emitFor={emit} /></div>
          ) : n.group ? (
            <div key={key(n, i, n.group.preset)} className="pg-node"><Group g={n} emitFor={emit} Render={Render} /></div>
          ) : (
            <div key={key(n, i, n.preset)} className="pg-node"><Render node={n} emit={emit(n)} /></div>
          ))}
        </ScreenCtx.Provider>
      </div>
    </div>
  );
}

export default function Pages({ yl, light, onTap, agent }) {
  const state = useMemo(() => build(yl), [yl]);
  return pagesOf(state).map((k) => (
    <section key={k} className="hm-slide" data-page={k} aria-label={`Screen ${k}`}>
      <Page nodes={state.screens[k]} screen={k} state={state} light={light} onTap={onTap} agent={agent} />
    </section>
  ));
}
