"use client";
// Meet the crew (SITE-69): the chat's `choose@crew` drawn as the five starter agents, each on a row in
// their own color, with their face, name, role and one line on what they do. A tap is the choose's
// own answer ({choice: name}), so the route plays that member's flow. Any other node draws as usual.
import { useState } from "react";
import { resolve } from "../../lib/yl/yl.mjs";
import { CREW } from "../../lib/chat/crew.mjs";

function CrewPick({ node, emit }) {
  const p = resolve(node.preset, node.props);
  const [sel, setSel] = useState(null);
  const crew = p.options.map((o) => CREW.find((m) => m.name === o)).filter(Boolean);
  const pick = (m) => { if (sel) return; setSel(m.name); emit?.({ choice: m.name }); };
  return (
    <div className="yl-block yc-crew">
      {p.title ? <div className="yl-q">{p.title}</div> : null}
      {p.body ? <div className="yl-text">{p.body}</div> : null}
      <div className="yc-crew-list" role="list" aria-label={p.q || "The crew"}>
        {crew.map((m, i) => (
          <button key={m.name} role="listitem" className={`yc-crew-row${sel === m.name ? " on" : ""}${sel && sel !== m.name ? " off" : ""}`}
            style={{ "--cm": m.c, "--i": i }} onClick={() => pick(m)} aria-label={`${m.name}, the ${m.role.toLowerCase()}. ${m.line}`}>
            <span className="yc-crew-face" aria-hidden="true">{m.name[0]}</span>
            <span className="yc-crew-words">
              <b>{m.name}</b><i>{m.role}</i>
              <span>{m.line}</span>
            </span>
            <span className="yc-crew-go" aria-hidden="true">›</span>
          </button>
        ))}
      </div>
    </div>
  );
}

export function isCrew(node) {
  return node?.preset === "choose" && node.id === "crew";
}

export function CrewOr({ node, emit, Render }) {
  return isCrew(node) ? <CrewPick node={node} emit={emit} /> : <Render node={node} emit={emit} />;
}
