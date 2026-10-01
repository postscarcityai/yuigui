"use client";
// One ```yui fence in the web thread (YUI-242), drawn with the playground's renderers like the app and /tg.
// A tap goes up as the event the phone would send (ThreadSync.tap does the echo, the relay rule and the
// `[yui] ...` line). The message brings its state and the ops of later patches (lib/web/thread.mjs): a
// patch that lands after the screen is drawn is applied to what is on the page, so a tick or a typed
// answer the person already made is not lost. Its own file so the renderers load only when a reply has a screen.
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { apply, pageOf } from "../../lib/yl/yl.mjs";
import { boundTables } from "../../lib/yl/tables.mjs";
import { Render, StepGroup, TABLES } from "../playground/presets";
import { Group, groupNodes } from "../playground/flows";
import { ScreenCtx } from "../playground/science";
import { LiveSlot, Stage, StagePill } from "../playground/stage";
import "../playground/flows.css";

export default function ThreadScreen({ message, agent, light, onTap, live, onPage }) {
  // The screen the reply drew, then every later patch, in order. Local state keeps the person's own
  // moves (a tick, a slider) that no row carries.
  const [state, setState] = useState(() => {
    // A staged part (a timer, a deck) is a pill in the thread; the stage itself opens on a tap (full stage: YUI-243).
    return { ...message.state, stage: false };
  });
  const done = useRef(message.ops.length);
  useEffect(() => {
    if (message.ops.length <= done.current) return;
    const more = message.ops.slice(done.current);
    done.current = message.ops.length;
    setState((s) => more.reduce((acc, op) => apply(acc, op), s));
  }, [message.ops]);

  // `>full` and the parts that take the stage (a timer, a deck, a plan) open as a full-window layer over the
  // thread (YUI-243), not inside the bubble: the stage is drawn into the main column (a portal), so nothing
  // in the thread can sit on top of it. Close puts the chat back.
  const box = useRef(null);
  const [host, setHost] = useState(null);
  useLayoutEffect(() => { setHost(box.current?.closest(".wb-main") || null); }, []);

  const [liveTimers, setLive] = useState({});
  const onLive = useCallback((k, t) => setLive((l) => (l[k] === t ? l : { ...l, [k]: t })), []);
  const dispatch = useCallback((op) => setState((s) => apply(s, op)), []);
  const tapRef = useRef(onTap);
  tapRef.current = onTap;
  const emits = useRef(new Map());
  const emit = useCallback((node) => {
    const k = `${node.key}:${node.preset}:${node.seq}`;
    if (!emits.current.has(k)) emits.current.set(k, (value) => tapRef.current?.({ id: node.id, preset: node.preset, ...value, ...(node.saved ? { saved: node.saved } : {}) }));
    return emits.current.get(k);
  }, []);

  // The thread is screen 1. Lines for screens 2 to 12 are pages (YUI-243); a staged part opens on the stage.
  const nodes = (state.screens["1"] || []).filter((n) => !n.stage);
  const staged = Object.values(state.screens).flat().filter((n) => n.stage).sort((a, b) => a.seq - b.seq);
  const pages = Object.keys(state.screens).filter((k) => pageOf(k) > 1 && state.screens[k].some((n) => !n.stage)).sort((a, b) => a - b);
  const renderNode = (n) => n.steps ? (
    <div key={`${n.key}:steps`} className="pg-node"><StepGroup nodes={n.steps} emitFor={emit} /></div>
  ) : n.group ? (
    <div key={`${n.key}:${n.group.preset}`} className="pg-node"><Group g={n} emitFor={emit} Render={Render} /></div>
  ) : (
    <div key={`${n.key}:${n.preset}`} className="pg-node"><Render node={n} emit={emit(n)} /></div>
  );
  const stageOpen = state.stage && staged.length > 0;
  const ctx = (list, screen) => ({ nodes: list, tables: { ...TABLES, ...boundTables(state.data) }, data: state.data, agent, screen, dispatch });

  if (!nodes.length && !staged.length && !pages.length) return null;
  return (
    <div className={`screen wb-screen ${light ? "light" : ""}`} data-live={live ? "1" : "0"} ref={box}>
      <div className="pg-screen">
        <ScreenCtx.Provider value={ctx(nodes, "1")}>
          {groupNodes(nodes).map(renderNode)}
          {staged.length ? <StagePill nodes={staged} live={liveTimers} onOpen={() => setState((s) => ({ ...s, stage: true }))} /> : null}
        </ScreenCtx.Provider>
        {pages.map((k) => <button key={`page:${k}`} className="wb-onpage" onClick={() => onPage?.(k)}>On screen {k} ›</button>)}
      </div>
      {staged.length && host ? createPortal(
        <div className={`screen wb-stagehost ${light ? "light" : ""}`}>
          <Stage open={stageOpen} onClose={() => setState((s) => ({ ...s, stage: false }))} agent={agent}>
            <ScreenCtx.Provider value={ctx(staged, "full")}>
              {groupNodes(staged).map((n) => <LiveSlot key={`${n.key}:slot`} id={n.key} onLive={onLive}>{renderNode(n)}</LiveSlot>)}
            </ScreenCtx.Provider>
          </Stage>
        </div>, host) : null}
    </div>
  );
}
