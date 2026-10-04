"use client";
// Edit an agent (AgentsView.swift EditAgentSheet): rename, its look, notifications, make default, a new
// pairing code, remove with the app's confirm. A shared agent is not yours to rename or remove: only the
// notifications and its place in your list are (YUI-97).
import { useCallback, useEffect, useMemo, useState } from "react";
import { agentError, cleanName, isShared, removeWords, restartCommand, shareLine, statusLine, stylePrefs } from "../../lib/web/agents.mjs";
import { liveness } from "../../lib/web/presence.mjs";
import { Confirm, CommandBox, Dialog, Face, LookPicker, SheetBar, Switch } from "./parts";
import FieldMic from "./FieldMic";
import { PairingStep } from "./AddAgent";

export default function EditAgent({ manage, agent, agents, refresh, onClose, onRemoved, pollMs, giveUpMs, stuckMs }) {
  const live = agents.find((a) => a.id === agent.id) || agent;
  const shared = isShared(agent);
  const [name, setName] = useState(agent.name);
  const [look, setLook] = useState(agent.theme?.preset || null);
  const [notify, setNotify] = useState(!agent.push_muted);
  const [confirmRemove, setConfirmRemove] = useState(false);
  const [code, setCode] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  useEffect(() => { setName(agent.name); setLook(agent.theme?.preset || null); setNotify(!agent.push_muted); }, [agent.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const preview = useMemo(() => ({ ...live, name: cleanName(name) || live.name, theme: look !== (live.theme?.preset || null) ? { preset: look } : live.theme }), [live, name, look]);
  const safety = shareLine(live);
  const prefs = stylePrefs(agent.theme?.style);

  const save = async () => {
    const n = cleanName(name);
    setBusy(true); setError("");
    try {
      if (!shared && n && n !== agent.name) await manage.rename(agent.id, n);
      if (!shared && look !== (agent.theme?.preset || null)) await manage.setLook(agent.id, look, agent.theme?.style);
      if (notify === !!agent.push_muted) await manage.mute(agent.id, !notify);
      await refresh();
      onClose();
    } catch (e) { setError(agentError(e.code)); }
    finally { setBusy(false); }
  };
  const remove = async () => {
    setBusy(true);
    try { await manage.remove(agent.id); await refresh(); setConfirmRemove(false); onRemoved(agent.id); }
    catch (e) { setConfirmRemove(false); setError(agentError(e.code)); }
    finally { setBusy(false); }
  };
  const newCode = useCallback(async () => setCode(await manage.pairCode(agent.id)), [manage, agent.id]);
  const words = removeWords(agent);

  return (
    <Dialog label={`${agent.name} settings`} onClose={onClose} testid="edit-agent">
      <SheetBar title={agent.name}
        left={<button type="button" className="ag-barbtn quiet" onClick={onClose}>Cancel</button>}
        right={code ? <button type="button" className="ag-barbtn" onClick={onClose}>Done</button> : <button type="button" className="ag-barbtn" disabled={busy} onClick={save} data-testid="save-agent">Save</button>} />
      <div className="ag-body">
        {code ? (
          <PairingStep agentId={agent.id} code={code} newCode={newCode} agents={agents} refresh={refresh} pollMs={pollMs} giveUpMs={giveUpMs} stuckMs={stuckMs} />
        ) : (
          <>
            <div className="ag-preview"><Face agent={preview} size={72} /><span className="ag-status"><i className={`wb-dot ${liveness(live)}`} />{statusLine(live)}</span></div>
            {shared ? (
              <div className="ag-card" data-testid="shared-by">
                <b>Shared by {agent.shared_by || "its owner"}</b>
                <p className="ag-hint">{liveness(live) === "paused"
                  ? `Paused by its owner. Anything you send waits, and ${agent.name} answers once it's back.`
                  : `${agent.name} runs on ${agent.shared_by || "its owner"}'s computer and talks only to you here. You can turn its notifications off and move it in your list.`}</p>
              </div>
            ) : (
              <>
                {safety ? <p className={`ag-share${safety.safe ? " safe" : ""}`} data-testid="share-safety">{safety.safe ? "✓ " : "🔒 "}{safety.text}</p> : null}
                {liveness(live) === "not_listening" ? <div className="ag-restart"><h3>One step left</h3><p>{agent.name} is paired{agent.connector_name ? ` with ${agent.connector_name}` : ""}, but its gateway isn't listening yet. On that computer, run:</p><CommandBox command={restartCommand(live)} testid="restart-command" /></div> : null}
                <label htmlFor="ag-rename"><b>Name</b></label>
                <div className="ag-namerow">
                <input id="ag-rename" className="ag-input" value={name} maxLength={60} autoComplete="off" onChange={(e) => setName(e.target.value)} data-testid="rename" />
                <FieldMic onWords={(t) => setName(t.slice(0, 60))} testId="agent-rename-mic" />
                </div>
                <h4>Look</h4>
                <LookPicker value={look} onChange={setLook} name={agent.name} />
                <p className="ag-hint">{prefs ? `Prefers ${prefs}. ` : ""}{agent.name} can change its look itself: ask it.</p>
                {agent.connector_name && agent.remote_ref ? <p className="ag-hint">Runs on {agent.connector_name} as the {agent.remote_ref} profile.</p> : null}
              </>
            )}
            <div className="ag-card row">
              <div><b>Notifications</b><p className="ag-hint">{notify ? `Your devices buzz when ${agent.name} answers and Yui is closed.` : `${agent.name} stays quiet. Its answers wait in the thread.`}</p></div>
              <Switch on={notify} onChange={setNotify} label={`Notifications from ${agent.name}`} />
            </div>
            {error ? <p className="ag-error" role="alert">{error}</p> : null}
            {!shared ? (
              <ul className="ag-actions">
                {!agent.is_default ? <li><button type="button" onClick={async () => { try { await manage.makeDefault(agent.id); await refresh(); onClose(); } catch (e) { setError(agentError(e.code)); } }}>Make default</button></li> : null}
                {agent.status === "pending" ? <li><button type="button" data-testid="get-pairing-code" onClick={async () => { try { await newCode(); } catch (e) { setError(agentError(e.code)); } }}>Get a pairing code</button></li> : null}
                <li><button type="button" className="danger" data-testid="remove-agent" onClick={() => setConfirmRemove(true)}>Remove {agent.name}</button></li>
              </ul>
            ) : null}
          </>
        )}
      </div>
      {confirmRemove ? <Confirm question={words.title} note={words.note} confirm={words.confirm} busy={busy} onConfirm={remove} onKeep={() => setConfirmRemove(false)} /> : null}
    </Dialog>
  );
}
