"use client";

// Shared agents (spec/AGENTS.md "Shared agents", YUI-57 step 1): a mock of an
// invited client's first open. The owner's side is the live plan in the
// playground; this is the app's own agent list and thread, each shared agent
// in the look the owner picked, its first message waiting.

import { useMemo, useState } from "react";
import { apply, initialState, parse } from "../../lib/yl/yl.mjs";
import { Render } from "./presets";
import { ScreenCtx } from "./science";
import "./invite.css";

export const INVITE_VIEWS = [
  ["make", "You invite"],
  ["open", "Client's first open"],
  ["revoked", "After a revoke"],
];

function Face({ a }) {
  return <span className="ci-face" style={{ background: a.c }} aria-hidden="true">{a.name[0]}</span>;
}

// The first message, drawn from its lines. Taps reach the wire log.
function Hello({ a, onEvent }) {
  const nodes = useMemo(() => {
    let s = initialState();
    for (const op of parse(a.hello)) s = apply(s, op);
    return s.screens["1"] || [];
  }, [a.hello]);
  return (
    <ScreenCtx.Provider value={{ nodes, tables: {}, data: {}, agent: a.name, screen: "1" }}>
      {nodes.map((n) => (
        <div key={n.key} className="pg-node">
          <Render node={n} emit={(value) => onEvent({ agent: a.name, id: n.id, preset: n.preset, ...value })} />
        </div>
      ))}
    </ScreenCtx.Provider>
  );
}

export function ClientOpen({ invite, view, onEvent }) {
  const [open, setOpen] = useState(null);
  const { owner, client, revoked } = invite;
  const list = invite.agents.filter((a) => view !== "revoked" || a.name !== revoked);
  const a = open && list.find((x) => x.name === open);

  if (a) {
    return (
      <div className="ci-thread" style={{ "--ci": a.c, "--ci-bg": a.bg, "--accent": a.c }}>
        <div className="ahead ci-head">
          <button className="ci-back" onClick={() => setOpen(null)} aria-label="Back to agents">‹</button>
          <Face a={a} />
          <div><div className="nm">{a.name}</div><div className="st">Shared by {owner}</div></div>
        </div>
        <div className="pg-screen ci-body"><Hello a={a} onEvent={onEvent} /></div>
      </div>
    );
  }
  return (
    <div className="ci-list">
      <div className="ci-top">
        <div className="ci-hi">Hi {client}.</div>
        <div className="ci-sub">{owner} set these up for you.</div>
      </div>
      {list.map((x) => (
        <button key={x.name} className="ci-row" style={{ "--ci": x.c }} onClick={() => setOpen(x.name)}>
          <Face a={x} />
          <span className="ci-txt">
            <span className="ci-nm">{x.name}<span className="ci-what">{x.what}</span></span>
            <span className="ci-prev">{x.preview}</span>
          </span>
          <span className="ci-new" aria-label="New message" />
        </button>
      ))}
      {view === "revoked" ? <div className="ci-gone">{revoked} is no longer shared with you.</div> : null}
      <div className="ci-note">These agents run on {owner}&apos;s computer, which keeps your conversations. Other people {owner} invites never see them.</div>
    </div>
  );
}
