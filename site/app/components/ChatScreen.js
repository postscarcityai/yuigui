"use client";
// One screen inside the site chat (SITE-65): a ```yui block from Yui's reply, drawn with the playground's
// renderers (site/lib/yl), like LiveScreen on /mockups. A tap goes back to Yui as the channel sends it.
// What belongs on the stage (a timer, a deck, a plan, a game, `>full`) opens over the whole chat window
// when the answer is new, like the phone; closed, it leaves the pill in the chat. Answering on the stage
// folds it back. The stage is drawn straight into the chat panel (a portal), so nothing in the thread
// can sit on top of it. Its own file so the renderers load only when a reply has a screen.
import { useCallback, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { apply, initialState, parse } from "../../lib/yl/yl.mjs";
import { boundTables } from "../../lib/yl/tables.mjs";
import { Render, StepGroup, TABLES } from "../playground/presets";
import { Group, groupNodes } from "../playground/flows";
import { ScreenCtx } from "../playground/science";
import { LiveSlot, Stage, StagePill } from "../playground/stage";
import { CrewOr } from "./ChatCrew";
import "../playground/flows.css";

function build(text, fresh) {
  let s = initialState();
  for (const op of parse(text)) s = apply(s, op);
  return fresh ? s : { ...s, stage: false };
}

export default function ChatScreen({ yl, onTap, fresh = false, agent = "Yui" }) {
  const [state, setState] = useState(() => build(yl, fresh));
  const [live, setLive] = useState({});
  const onLive = useCallback((k, t) => setLive((l) => (l[k] === t ? l : { ...l, [k]: t })), []);
  const dispatch = useCallback((op) => setState((s) => apply(s, op)), []);
  const box = useRef(null);
  const [panel, setPanel] = useState(null);
  useLayoutEffect(() => { setPanel(box.current?.closest(".yc-panel") || null); }, []);
  const tapRef = useRef(onTap);
  tapRef.current = onTap;
  const emit = useCallback((node) => (value) => {
    if (!tapRef.current) return;
    tapRef.current({ id: node.id, preset: node.preset, ...value });
    if (node.stage && (value?.done || value?.plan || value?.choice != null || value?.answer != null || value?.form)) setState((s) => ({ ...s, stage: false }));
  }, []);

  const all = Object.values(state.screens).flat().sort((a, b) => a.seq - b.seq);
  const nodes = all.filter((n) => !n.stage);
  const staged = all.filter((n) => n.stage);
  const ctx = (list, screen) => ({ nodes: list, tables: { ...TABLES, ...boundTables(state.data) }, data: state.data, agent, screen, dispatch });
  const renderNode = (n) => n.steps ? (
    <div key={`${n.key}:steps`} className="pg-node"><StepGroup nodes={n.steps} emitFor={emit} /></div>
  ) : n.group ? (
    <div key={`${n.key}:${n.group.preset}`} className="pg-node"><Group g={n} emitFor={emit} Render={Render} /></div>
  ) : (
    <div key={`${n.key}:${n.preset}`} className="pg-node"><CrewOr node={n} emit={emit(n)} Render={Render} /></div>
  );
  if (!all.length) return null;
  return (
    <div className="yc-screen pg-screen" ref={box}>
      <ScreenCtx.Provider value={ctx(nodes, "1")}>
        {groupNodes(nodes).map(renderNode)}
        {staged.length ? <StagePill nodes={staged} live={live} onOpen={() => setState((s) => ({ ...s, stage: true }))} /> : null}
      </ScreenCtx.Provider>
      {staged.length && panel ? createPortal(
        <div className="yc-screen yc-stagehost">
          <Stage open={state.stage} onClose={() => setState((s) => ({ ...s, stage: false }))} agent={agent}>
            <ScreenCtx.Provider value={ctx(staged, "full")}>
              {groupNodes(staged).map((n) => <LiveSlot key={`${n.key}:slot`} id={n.key} onLive={onLive}>{renderNode(n)}</LiveSlot>)}
            </ScreenCtx.Provider>
          </Stage>
        </div>, panel) : null}
    </div>
  );
}
