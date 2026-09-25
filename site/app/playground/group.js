"use client";

// Group threads (spec/GROUPS.md, YUI-77 step 1): a mock of the app's group
// view. History rows above the live reply, the handoff row between agents,
// and the loop guard after it. Each agent keeps its own look.

import { useMemo, useState } from "react";
import { apply, initialState, parse } from "../../lib/yl/yl.mjs";
import { Render } from "./presets";
import { ScreenCtx } from "./science";
import "./group.css";

// Looks by agent, from the YL theme sets named in the spec (coach, zen, wizard).
export const LOOKS = {
  Coach: { c: "#ff6b3d", set: "coach" },
  Sage: { c: "#4fae8c", set: "zen" },
  Quill: { c: "#8b7cff", set: "wizard" },
};
const color = (name) => LOOKS[name]?.c || "var(--accent)";

function Face({ name, small }) {
  return <span className={small ? "gt-face sm" : "gt-face"} style={{ background: color(name) }} aria-hidden="true">{name[0]}</span>;
}

export function GroupHead({ group, status }) {
  return (
    <div className="ahead gt-head">
      <div className="gt-faces">{group.members.map((m) => <Face key={m} name={m} />)}</div>
      <div>
        <div className="nm">{group.title}</div>
        <div className="st">{status || `${group.members.length} agents · ${group.lead} leads · ${group.hops} handoff${group.hops === 1 ? "" : "s"} per message`}</div>
      </div>
    </div>
  );
}

// One agent's turn in the group: its face and name over its own bubbles.
export function Turn({ agent, children }) {
  return (
    <div className={`gt-turn look-${LOOKS[agent]?.set || "default"}`} style={{ "--gt": color(agent) }}>
      <div className="gt-who"><Face name={agent} small /><span>{agent}</span></div>
      <div className="gt-body">{children}</div>
    </div>
  );
}

// A past reply, drawn from its lines. Taps on it still reach the wire log.
function Said({ agent, yl, onEvent }) {
  const nodes = useMemo(() => {
    let s = initialState();
    for (const op of parse(yl)) s = apply(s, op);
    return s.screens["1"] || [];
  }, [yl]);
  return (
    <Turn agent={agent}>
      <ScreenCtx.Provider value={{ nodes, tables: {}, data: {}, agent, screen: "1" }}>
        {nodes.map((n) => (
          <div key={n.key} className="pg-node">
            <Render node={n} emit={(value) => onEvent({ agent, id: n.id, preset: n.preset, ...value })} />
          </div>
        ))}
      </ScreenCtx.Provider>
    </Turn>
  );
}

// The app's row between two agents: both faces, who asked whom, the ask in one line.
export function Handoff({ from, to, ask }) {
  return (
    <div className="gt-handoff" role="note">
      <span className="gt-pair"><Face name={from} small /><span className="gt-arrow">→</span><Face name={to} small /></span>
      <span className="gt-said"><b>{from} asked {to}</b><span>“{ask}”</span></span>
    </div>
  );
}

export function GroupBefore({ items, onEvent }) {
  return items.map((it, i) =>
    it.me ? <div key={i} className="yl-me">{it.me}</div>
    : it.handoff ? <Handoff key={i} {...it.handoff} />
    : <Said key={i} agent={it.agent} yl={it.yl} onEvent={onEvent} />
  );
}

// The loop guard: an ask held because the budget ran out. Let it sends it on
// a fresh budget; Stop here ends the chain. Both go to the wire log.
export function Guard({ guard, onEvent }) {
  const [done, setDone] = useState(null);
  const { from, to, ask, hops, then } = guard;
  if (done === "let") {
    return (
      <>
        <div className="gt-status">You let it go on.</div>
        <Handoff from={from} to={to} ask={ask} />
        <Said agent={to} yl={then} onEvent={onEvent} />
      </>
    );
  }
  if (done === "stop") return <div className="gt-status">Stopped. {to} won&apos;t pick up {from}&apos;s ask.</div>;
  const tap = (choice) => {
    setDone(choice);
    onEvent(choice === "let" ? { group: "continue", guard: "g1", from, to } : { group: "stop" });
  };
  return (
    <div className="gt-guard" style={{ "--gt": color(from) }}>
      <div className="gt-who"><Face name={from} small /><span>{from} wants to ask {to}</span></div>
      <div className="gt-ask">“{ask}”</div>
      <div className="gt-why">That&apos;s {hops} handoffs since you last said something. This group allows 1.</div>
      <div className="gt-btns">
        <button className="gt-go" onClick={() => tap("let")}>Let it</button>
        <button className="gt-stop" onClick={() => tap("stop")}>Stop here</button>
      </div>
    </div>
  );
}
