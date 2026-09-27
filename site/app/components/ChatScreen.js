"use client";
// One screen inside the site chat (SITE-65): a ```yui block from Yui's reply, drawn with the playground's
// renderers (site/lib/yl), like LiveScreen on /mockups. Every component sits in the chat, stage ones too,
// and a tap goes back to Yui as the channel sends it. Its own file so the renderers load only when a
// reply has a screen.
import { useCallback, useMemo, useState } from "react";
import { apply, initialState, parse } from "../../lib/yl/yl.mjs";
import { boundTables } from "../../lib/yl/tables.mjs";
import { Render, StepGroup, TABLES } from "../playground/presets";
import { Group, groupNodes } from "../playground/flows";
import { ScreenCtx } from "../playground/science";
import "../playground/flows.css";

function build(text) {
  let s = initialState();
  for (const op of parse(text)) s = apply(s, op);
  return s;
}

export default function ChatScreen({ yl, onTap, agent = "Yui" }) {
  const [state, setState] = useState(() => build(yl));
  const dispatch = useCallback((op) => setState((s) => apply(s, op)), []);
  const emit = useCallback((node) => (value) => onTap?.({ id: node.id, preset: node.preset, ...value }), [onTap]);

  const nodes = useMemo(() => Object.values(state.screens).flat().sort((a, b) => a.seq - b.seq), [state.screens]);
  const renderNode = (n) => n.steps ? (
    <div key={`${n.key}:steps`} className="pg-node"><StepGroup nodes={n.steps} emitFor={emit} /></div>
  ) : n.group ? (
    <div key={`${n.key}:${n.group.preset}`} className="pg-node"><Group g={n} emitFor={emit} Render={Render} /></div>
  ) : (
    <div key={`${n.key}:${n.preset}`} className="pg-node"><Render node={n} emit={emit(n)} /></div>
  );
  if (!nodes.length) return null;
  return (
    <div className="yc-screen pg-screen">
      <ScreenCtx.Provider value={{ nodes, tables: { ...TABLES, ...boundTables(state.data) }, data: state.data, agent, screen: "1", dispatch }}>
        {groupNodes(nodes).map(renderNode)}
      </ScreenCtx.Provider>
    </div>
  );
}
