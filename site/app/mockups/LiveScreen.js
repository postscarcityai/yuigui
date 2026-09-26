"use client";
// The screen inside a LivePhone (SITE-14). Its own file so the playground's renderers load only when a phone
// is about to show, not with every page that has one (SITE-41).
import { useCallback, useState } from "react";
import { apply, initialState, parse } from "../../lib/yl/yl.mjs";
import { boundTables } from "../../lib/yl/tables.mjs";
import { Render, StepGroup, TABLES } from "../playground/presets";
import { Group, groupNodes } from "../playground/flows";
import { ScreenCtx } from "../playground/science";
import { LiveSlot, Stage, StagePill } from "../playground/stage";
import "../playground/flows.css";

function build(text) {
  let s = initialState();
  for (const op of parse(text)) s = apply(s, op);
  return s;
}

export default function Screen({ yl, agent, light }) {
  const [state, setState] = useState(() => build(yl));
  const [live, setLive] = useState({});
  const [tapped, setTapped] = useState(null);
  const onLive = useCallback((k, t) => setLive((l) => (l[k] === t ? l : { ...l, [k]: t })), []);
  const dispatch = useCallback((op) => setState((s) => apply(s, op)), []);
  const emit = useCallback((node) => (value) => setTapped({ id: node.id, preset: node.preset, ...value }), []);

  const shown = state.focus === "full" ? "1" : state.focus;
  const all = state.screens[shown] || [];
  const nodes = all.filter((n) => !n.stage);
  const staged = Object.values(state.screens).flat().filter((n) => n.stage).sort((a, b) => a.seq - b.seq);
  const renderNode = (n) => n.steps ? (
    <div key={`${n.key}:steps`} className="pg-node"><StepGroup nodes={n.steps} emitFor={emit} /></div>
  ) : n.group ? (
    <div key={`${n.key}:${n.group.preset}`} className="pg-node"><Group g={n} emitFor={emit} Render={Render} /></div>
  ) : (
    <div key={`${n.key}:${n.preset}`} className="pg-node"><Render node={n} emit={emit(n)} /></div>
  );

  return (
    <div className={`screen ${light ? "light" : ""}`}>
      <div className="notch" />
      <div className="sbar" />
      <div className="ahead">
        <div className="avatar" style={{ background: "var(--accent)" }}>{agent[0]}</div>
        <div><div className="nm">{agent}</div><div className="st">{tapped ? `sent: ${Object.keys(tapped).filter((k) => !["id", "preset"].includes(k)).join(", ") || tapped.preset}` : "live Yui Lines"}</div></div>
      </div>
      <div className="pg-screen">
        <ScreenCtx.Provider value={{ nodes, tables: { ...TABLES, ...boundTables(state.data) }, data: state.data, agent, screen: shown, dispatch }}>
          {groupNodes(nodes).map(renderNode)}
          {staged.length ? <StagePill nodes={staged} live={live} onOpen={() => setState((s) => ({ ...s, stage: true }))} /> : null}
        </ScreenCtx.Provider>
      </div>
      <Stage open={state.stage && staged.length > 0} onClose={() => setState((s) => ({ ...s, stage: false }))} agent={agent}>
        <ScreenCtx.Provider value={{ nodes: staged, tables: { ...TABLES, ...boundTables(state.data) }, data: state.data, agent, screen: "full", dispatch }}>
          {groupNodes(staged).map((n) => <LiveSlot key={`${n.key}:slot`} id={n.key} onLive={onLive}>{renderNode(n)}</LiveSlot>)}
        </ScreenCtx.Provider>
      </Stage>
    </div>
  );
}
