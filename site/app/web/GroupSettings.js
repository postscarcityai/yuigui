"use client";
// Group settings (YUI-263, web twin of GroupSettings in Yui/Sources/Groups/GroupThreadView.swift): name, max hops
// 1 to 5, who is in (make lead, leave), who can be added, archive after a confirm. The writes are the same ones the
// app makes on the group row (lib/web/groups.mjs), so a change here reads back on the phone. Spec: spec/GROUPS.md.
import { useState } from "react";
import { MAX_HOPS, MIN_HOPS, clampHops, groupError, settingsOf, validTitle } from "../../lib/web/groups.mjs";
import { Confirm, Dialog, Face, SheetBar } from "./parts";
import { Crown } from "./Groups";
import "./groups.css";

export default function GroupSettings({ api, group, agents, onClose, onChanged, onArchived }) {
  const s = settingsOf(group, agents);
  const [title, setTitle] = useState(group.title);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [confirm, setConfirm] = useState(false);

  const call = async (work) => {
    setBusy(true);
    try { await work(); setError(""); } catch (e) { setError((e.group || groupError(e.cause || e)).spoken); }
    try { await onChanged?.(); } finally { setBusy(false); }
  };
  const rename = async () => { const t = validTitle(title); if (t && t !== group.title) await call(() => api.rename(group.id, t)); };
  const hops = (n) => { const k = clampHops(n); if (k !== group.maxHops) call(() => api.setMaxHops(k, group.id)); };
  const done = async () => { await rename(); onClose(); };
  const archive = async () => {
    setBusy(true);
    try { await api.archive(group.id); setConfirm(false); onArchived?.(); onClose(); }
    catch (e) { setConfirm(false); setError((e.group || groupError(e.cause || e)).spoken); setBusy(false); }
  };

  return (
    <>
      <Dialog label="Group settings" onClose={done} testid="group-settings">
        <SheetBar title={group.title} right={<button type="button" className="ag-barbtn" onClick={done} data-testid="group-settings-done">Done</button>} />
        <div className="ag-body gr-form">
          <label htmlFor="gr-set-name"><h4>Name</h4></label>
          <input id="gr-set-name" className="ag-input" value={title} maxLength={60} autoComplete="off" onChange={(e) => setTitle(e.target.value)} onBlur={rename} data-testid="group-settings-name" />

          <h4>Max hops</h4>
          <div className="gr-hops" role="group" aria-label="Max hops">
            <button type="button" className="gr-step" aria-label="Fewer hops" disabled={busy || group.maxHops <= MIN_HOPS} onClick={() => hops(group.maxHops - 1)} data-testid="group-hops-down">−</button>
            <b data-testid="group-hops" aria-live="polite">Max hops: {group.maxHops}</b>
            <button type="button" className="gr-step" aria-label="More hops" disabled={busy || group.maxHops >= MAX_HOPS} onClick={() => hops(group.maxHops + 1)} data-testid="group-hops-up">+</button>
          </div>
          <p className="ag-hint">How many times agents may hand work to each other before they ask you.</p>

          <h4>In the group</h4>
          <ul className="gr-picks" data-testid="group-members">
            {s.inGroup.map((a) => (
              <li key={a.id} className="gr-member" data-testid={`group-member-${a.handle}`}>
                <Face agent={a} size={30} />
                <b>{a.name}</b>
                {a.id === group.lead ? <span className="gr-leadmark"><Crown /></span> : null}
                {s.canLeave(a.id) ? (
                  <span className="gr-member-actions">
                    <button type="button" className="gr-quiet" disabled={busy} onClick={() => call(() => api.makeLead(a.id, group.id))} data-testid={`group-lead-set-${a.handle}`}>Make lead</button>
                    <button type="button" className="gr-quiet danger" disabled={busy} onClick={() => call(() => api.leave(a.id, group.id))} data-testid={`group-leave-${a.handle}`}>Leave group</button>
                  </span>
                ) : null}
              </li>
            ))}
          </ul>

          {s.outside.length && s.canAdd ? (
            <>
              <h4>Add</h4>
              <ul className="gr-picks" data-testid="group-addable">
                {s.outside.map((a) => (
                  <li key={a.id}>
                    <button type="button" className="gr-pick" disabled={busy} onClick={() => call(() => api.add([a.id], group.id))} data-testid={`group-add-${a.handle}`}>
                      <Face agent={a} size={30} /><b>{a.name}</b><span className="gr-tick" aria-hidden="true">+</span>
                    </button>
                  </li>
                ))}
              </ul>
            </>
          ) : null}

          {error ? <p className="ag-error" role="alert" data-testid="group-settings-error">{error}</p> : null}
          <button type="button" className="ag-btn danger" disabled={busy} onClick={() => setConfirm(true)} data-testid="group-archive">Archive group</button>
          <p className="ag-hint">Nothing more goes in an archived group. Its words stay.</p>
        </div>
      </Dialog>
      {confirm ? <Confirm question={`Archive ${group.title}?`} note="Nothing more goes in it. Its words stay." confirm="Archive" busy={busy} onConfirm={archive} onKeep={() => setConfirm(false)} /> : null}
    </>
  );
}
