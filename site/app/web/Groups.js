"use client";
// Group threads, the list side (SITE-162, web twin of Yui/Sources/Groups/GroupViews.swift): stacked faces with the
// lead's small crown, a group row for the agent list, and the New group sheet (pick two or more agents, a name,
// the lead). Spec: spec/GROUPS.md. The calls are lib/web/groups.mjs, the same ones the app makes.
import { useMemo, useState } from "react";
import { MAX_MEMBERS, canStart, groupError, membersOf, suggestedTitle, validTitle } from "../../lib/web/groups.mjs";
import { Dialog, Face, SheetBar, Spinner } from "./parts";
import FieldMic from "./FieldMic";
import "./groups.css";

export function Crown() {
  return (
    <svg className="gr-crown" viewBox="0 0 24 24" aria-hidden="true"><path d="M3 8l4.5 4L12 5l4.5 7L21 8l-2 11H5L3 8z" /></svg>
  );
}

// Faces overlapping in a row, the lead first with a small crown. `agents` is already in header order.
export function GroupFaces({ agents, lead, size = 32, limit = 4 }) {
  const shown = agents.slice(0, limit);
  return (
    <span className="gr-faces" role="img" aria-label={agents.map((a) => a.name).join(", ")} style={{ "--gr-size": `${size}px` }}>
      {shown.map((a, i) => (
        <span key={a.id} className="gr-face" style={{ zIndex: limit - i }}>
          <Face agent={a} size={size} />
          {a.id === lead && agents.length > 1 ? <Crown /> : null}
        </span>
      ))}
      {agents.length > limit ? <span className="gr-more" aria-hidden="true">+{agents.length - limit}</span> : null}
    </span>
  );
}

// A group in the agent list: faces, its name, who is in it.
export function GroupRow({ group, agents, selected, href, onOpen }) {
  const faces = membersOf(group, agents);
  return (
    <li className={`ag-row gr-row${selected ? " on" : ""}`} data-testid={`group-${group.id}`}>
      <a className="wb-agent-row" href={href} aria-current={selected ? "page" : undefined} onClick={(e) => { e.preventDefault(); onOpen(group); }}>
        <GroupFaces agents={faces} lead={group.lead} />
        <span className="wb-agent-words">
          <b>{group.title}{group.sample ? <em className="ag-badge">Sample</em> : null}</b>
          <small>{faces.map((a) => a.name).join(", ")}</small>
        </span>
        {selected ? <span className="ag-check" aria-label={`In ${group.title}`}>✓</span> : null}
      </a>
    </li>
  );
}

// New group: pick two or more agents, a name, the lead (NewGroupSheet).
export function NewGroupSheet({ agents, api, onClose, onMade }) {
  const [picked, setPicked] = useState([]);
  const [title, setTitle] = useState("");
  const [lead, setLead] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [update, setUpdate] = useState(false);

  const members = useMemo(() => picked.map((id) => agents.find((a) => a.id === id)).filter(Boolean), [picked, agents]);
  const names = members.map((a) => a.name);
  const suggested = suggestedTitle(names);
  const ready = canStart(picked, title, names);
  const leadId = lead && picked.includes(lead) ? lead : picked[0] || null;

  const toggle = (a) => {
    setPicked((p) => (p.includes(a.id) ? p.filter((x) => x !== a.id) : p.length < MAX_MEMBERS ? [...p, a.id] : p));
    if (lead === a.id) setLead(null);
    setError(""); setUpdate(false);
  };
  const start = async (e) => {
    e?.preventDefault();
    if (!ready || busy) return;
    const id = globalThis.crypto.randomUUID();
    setBusy(true); setError(""); setUpdate(false);
    try {
      await api.create({ id, title: validTitle(title) || validTitle(suggested), lead: leadId, members: picked });
      onMade(id);
    } catch (err) {
      const g = err.group || groupError(err.cause || err);
      setError(g.spoken); setUpdate(g.kind === "update_needed");
    } finally { setBusy(false); }
  };

  return (
    <Dialog label="New group" onClose={onClose} testid="new-group">
      <SheetBar title="New group" left={<button type="button" className="ag-barbtn quiet" onClick={onClose}>Cancel</button>} />
      <form className="ag-body gr-form" onSubmit={start}>
        <h4>Who is in it? Pick two or more.</h4>
        <ul className="gr-picks">
          {agents.map((a) => {
            const on = picked.includes(a.id);
            return (
              <li key={a.id}>
                <button type="button" className={`gr-pick${on ? " on" : ""}`} role="checkbox" aria-checked={on} onClick={() => toggle(a)} data-testid={`group-pick-${a.handle}`}>
                  <Face agent={a} size={36} />
                  <b>{a.name}</b>
                  <span className="gr-tick" aria-hidden="true">{on ? "✓" : ""}</span>
                </button>
              </li>
            );
          })}
        </ul>
        <label htmlFor="gr-name"><h4>Name</h4></label>
        <div className="gr-namerow">
          <input id="gr-name" className="ag-input" value={title} maxLength={60} placeholder={suggested || "Name the group"} autoComplete="off" onChange={(e) => setTitle(e.target.value)} data-testid="group-name" />
          <FieldMic onWords={(t) => setTitle(t.slice(0, 60))} testId="group-name-mic" />
        </div>
        {picked.length >= 2 ? (
          <>
            <h4>The lead answers anything you don't @.</h4>
            <ul className="gr-picks" role="radiogroup" aria-label="Lead">
              {members.map((a) => (
                <li key={a.id}>
                  <button type="button" className={`gr-pick${leadId === a.id ? " on" : ""}`} role="radio" aria-checked={leadId === a.id} onClick={() => setLead(a.id)} data-testid={`group-lead-${a.handle}`}>
                    <Face agent={a} size={30} />
                    <b>{a.name}</b>
                    <span className="gr-tick" aria-hidden="true">{leadId === a.id ? <Crown /> : ""}</span>
                  </button>
                </li>
              ))}
            </ul>
          </>
        ) : null}
        {error ? <p className="ag-error" role="alert" data-testid="group-error">{error}</p> : null}
        {update ? <p className="ag-hint">Groups are made from the newest Yui on your iPhone. Once it has updated, this works here too.</p> : null}
        <button type="submit" className="ag-btn" disabled={!ready || busy} data-testid="group-create">{busy ? <Spinner label="Starting" /> : "Start group"}</button>
      </form>
    </Dialog>
  );
}
