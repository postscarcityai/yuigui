"use client";
// Your agents (AgentsView.swift list, Agents/AgentDrawer.swift Switcher): who you can talk to, honest presence
// on every row, a way to edit each one, a way to order them, and Add agent. The drawer opens it from the bar
// at its foot. Pick one and its thread opens.
import { useState } from "react";
import { greeting, isMuted, isShared, moved, onlyShared, sharedFooter, statusLine, unsharedLine } from "../../lib/web/agents.mjs";
import { Face } from "./parts";

function Row({ agent, selected, href, first, last, ordering, onPick, onEdit, onMove }) {
  return (
    <li className={`ag-row${selected ? " on" : ""}`} data-testid={`agent-${agent.id}`}>
      <a className="wb-agent-row" href={href} aria-current={selected ? "page" : undefined} onClick={(e) => { e.preventDefault(); onPick(agent); }}>
        <Face agent={agent} />
        <span className="wb-agent-words">
          <b>{agent.name}
            {agent.is_default ? <em className="ag-badge">Default</em> : null}
            {isShared(agent) && agent.shared_by ? <em className="ag-badge">From {agent.shared_by}</em> : null}
            {isMuted(agent) ? <em className="ag-badge" aria-label="Notifications off">🔕</em> : null}
          </b>
          <small><i className={`wb-dot ${agent.presence || (agent.status === "pending" ? "pending" : "online")}`} /> {statusLine(agent)}</small>
        </span>
        {selected ? <span className="ag-check" aria-label={`Talking to ${agent.name}`}>✓</span> : null}
      </a>
      {ordering ? (
        <span className="ag-move">
          <button type="button" aria-label={`Move ${agent.name} up`} disabled={first} onClick={() => onMove(-1)}>↑</button>
          <button type="button" aria-label={`Move ${agent.name} down`} disabled={last} onClick={() => onMove(1)}>↓</button>
        </span>
      ) : (
        <button type="button" className="ag-edit" aria-label={`Edit ${agent.name}`} data-testid={`edit-${agent.id}`} onClick={() => onEdit(agent)}>
          <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="5" cy="12" r="1.8" /><circle cx="12" cy="12" r="1.8" /><circle cx="19" cy="12" r="1.8" /></svg>
        </button>
      )}
    </li>
  );
}

export default function AgentsPanel({ agents, openId, firstName, unshared, error, hrefOf, onPick, onEdit, onAdd, onReorder, onClose, inline = false }) {
  const [ordering, setOrdering] = useState(false);
  const empty = !agents.length;
  const footer = sharedFooter(agents);
  const move = (i, d) => onReorder(moved(agents, i, i + d));
  return (
    <section className={`ag-panel${inline ? " inline" : ""}`} aria-label="Your agents" data-testid="agents-panel">
      <header className="ag-panel-head">
        {inline ? <span /> : <button type="button" className="ag-barbtn quiet" onClick={onClose} data-testid="agents-close">Close</button>}
        <h2>Your agents</h2>
        {agents.length > 1 ? <button type="button" className="ag-barbtn" aria-pressed={ordering} onClick={() => setOrdering((v) => !v)} data-testid="edit-list">{ordering ? "Done" : "Edit list"}</button> : <span />}
      </header>
      <div className="ag-panel-body">
        {empty ? (
          <div className="ag-empty" data-testid="agents-empty">
            <h3>Add your first agent</h3>
            <p>Yui shows the answers of an agent you run on your own computer, like a Hermes profile. Connecting one takes about five minutes.</p>
          </div>
        ) : (
          <>
            <p className="ag-greeting" data-testid="agents-greeting">{greeting(agents, firstName)}</p>
            <ul className="ag-list">
              {agents.map((a, i) => (
                <Row key={a.id} agent={a} selected={a.id === openId} href={hrefOf(a)} first={i === 0} last={i === agents.length - 1} ordering={ordering}
                  onPick={onPick} onEdit={onEdit} onMove={(d) => move(i, d)} />
              ))}
            </ul>
            {footer ? <p className="ag-hint" data-testid="shared-footer">{footer}</p> : null}
          </>
        )}
        {unshared.length ? <ul className="ag-unshared" data-testid="unshared">{unshared.map((n) => <li key={n}>{unsharedLine(n)}</li>)}</ul> : null}
        {!onlyShared(agents) ? <button type="button" className="ag-btn" data-testid="add-agent-btn" onClick={onAdd}>Add agent</button> : null}
        {error ? <p className="ag-error" role="alert">{error}</p> : null}
      </div>
    </section>
  );
}
