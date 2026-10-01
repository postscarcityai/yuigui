"use client";
// Add agent (AgentsView.swift AddAgentSheet, CrewPicker, PairingStep, RestartStep; Agents/GatewayWait.swift):
// the starter crew one tap each, or your own: a name, a look, a pairing code, one command to paste on the
// computer the agent lives on, then the wait for its gateway. Never an endless spinner: after a minute with
// nothing from the gateway it says so and offers Try again.
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  GATEWAY_GIVE_UP_MS, GATEWAY_POLL_MS, PAIR_STUCK_MS, agentError, cleanName, clock, crewHere, crewMissing,
  gatewayPhase, isConnected, isPaired, pairCommand, restartCommand, secondsLeft, spacedCode, statusLine,
} from "../../lib/web/agents.mjs";
import { Face, CommandBox, Dialog, LookPicker, SheetBar, Spinner } from "./parts";

const GUIDE = "/start";

function StatusRow({ agent }) {
  return <span className="ag-status"><i className={`wb-dot ${agent.presence || (agent.status === "pending" ? "pending" : "online")}`} />{statusLine(agent)}</span>;
}

// The crew in Add agent (CrewPicker): each starter by name, one tap each. One that is gone comes back; one
// already in the list opens its thread. A tap only ever adds.
function CrewPicker({ crew, agents, manage, onOpen, onChanged }) {
  const [adding, setAdding] = useState(null);
  const [error, setError] = useState("");
  const missing = crewMissing(crew, agents);
  const add = async (s) => {
    if (crewHere(s, agents)) { onOpen(s.agent_id); return; }
    setAdding(s.base); setError("");
    try { const r = await manage.crewAdd(s.base); await onChanged(); onOpen(r.agent.id); }
    catch { setError(`Couldn't add ${s.name} just now. Check your connection and tap again.`); }
    finally { setAdding(null); }
  };
  const addAll = async () => {
    setAdding("all"); setError("");
    try { await manage.crewAddAll(); await onChanged(); }
    catch { setError("Couldn't add them just now. Check your connection and tap again."); }
    finally { setAdding(null); }
  };
  return (
    <section className="ag-crew" aria-labelledby="ag-crew-h">
      <h3 id="ag-crew-h">Your crew</h3>
      <p className="ag-hint">They live in Yui. Nothing to set up.</p>
      <ul className="ag-crew-grid">
        {crew.map((s) => {
          const here = crewHere(s, agents);
          const face = { name: s.name, color: s.color, theme: { preset: s.color } };
          return (
            <li key={s.base}>
              <button type="button" className="ag-crew-chip" data-testid={`crew-${s.base}`} disabled={adding !== null} onClick={() => add(s)}
                aria-label={here ? `${s.name}, in your list` : `Add ${s.name}, ${s.role}`}>
                <Face agent={face} size={36} />
                <span className="ag-crew-words"><b>{s.name}</b><small>{here ? "In your list" : s.role}</small></span>
                <span className="ag-crew-mark" aria-hidden="true">{adding === s.base ? "…" : here ? "✓" : "+"}</span>
              </button>
            </li>
          );
        })}
      </ul>
      {missing.length > 1 ? <button type="button" className="ag-btn" data-testid="crew-all" disabled={adding !== null} onClick={addAll}>{adding === "all" ? "Adding…" : `Add all ${missing.length}`}</button> : null}
      {error ? <p className="ag-error" role="alert">{error}</p> : null}
    </section>
  );
}

// "One step left": paired, but nothing on its computer reads its thread yet (RestartStep).
function RestartStep({ agent }) {
  return (
    <div className="ag-restart" data-testid="restart-step">
      <h3>One step left</h3>
      <p>{agent.name} is paired{agent.connector_name ? ` with ${agent.connector_name}` : ""}, but its gateway isn't listening yet. On that computer, run:</p>
      <CommandBox command={restartCommand(agent)} testid="restart-command" />
      <p className="ag-hint">Anything you send waits, and {agent.name} answers it once the gateway is up.</p>
    </div>
  );
}

// The code, the one command and a live "connected" (PairingStep).
export function PairingStep({ agentId, code, newCode, agents, refresh, onSayHi, giveUpMs = GATEWAY_GIVE_UP_MS, stuckMs = PAIR_STUCK_MS, pollMs = GATEWAY_POLL_MS }) {
  const agent = agents.find((a) => a.id === agentId);
  const [now, setNow] = useState(() => Date.now());
  const [since] = useState(() => Date.now());
  const [attempt, setAttempt] = useState(0);
  const pairedAt = useRef(null);
  const [codeError, setCodeError] = useState("");
  const paired = isPaired(agent);
  const connected = isConnected(agent);
  if (paired && pairedAt.current == null) pairedAt.current = Date.now();
  const phase = paired ? gatewayPhase(agent, now - (pairedAt.current ?? now), giveUpMs) : "waiting";
  const gaveUp = paired && !connected && phase === "gave_up";
  const codeAt = useRef(Date.now());

  // Ask the relay while we wait; a second ticker moves the clocks.
  useEffect(() => {
    if (connected) return undefined;
    const t = setInterval(() => { refresh(); }, pollMs);
    return () => clearInterval(t);
  }, [connected, refresh, pollMs, attempt]);
  useEffect(() => {
    if (connected) return undefined;
    const t = setInterval(() => setNow(Date.now()), 500);
    return () => clearInterval(t);
  }, [connected]);
  // Back from the terminal: ask at once, the request that was in flight may have died in the background.
  useEffect(() => {
    const on = () => { if (!document.hidden) refresh(); };
    document.addEventListener("visibilitychange", on);
    return () => document.removeEventListener("visibilitychange", on);
  }, [refresh]);

  const left = secondsLeft(code.expires_at, now);
  const getNew = async () => {
    setCodeError("");
    try { await newCode(); codeAt.current = Date.now(); } catch (e) { setCodeError(agentError(e.code)); }
  };

  return (
    <div className="ag-pair" data-testid="pairing">
      <div className="ag-pair-head">
        {agent ? <Face agent={agent} size={52} /> : null}
        <div><h3>{agent?.name}</h3>{agent ? <StatusRow agent={agent} /> : null}</div>
      </div>
      {connected && agent ? (
        <div className="ag-done" data-testid="pair-connected">
          <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="11" fill="#2FB58C" /><path d="M7 12.5l3.2 3.2L17 9" fill="none" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" /></svg>
          <h2>{agent.name} is connected!</h2>
          <p>{agent.connector_name ? `Running on ${agent.connector_name}. Say hi and it answers here.` : "Say hi and it answers here."}</p>
          {onSayHi ? <button type="button" className="ag-btn" data-testid="say-hi" onClick={() => onSayHi(agent.id)}>Say hi to {agent.name}</button> : null}
        </div>
      ) : paired && agent ? (
        <>
          <RestartStep agent={agent} />
          {gaveUp ? (
            <div className="ag-gaveup" data-testid="gateway-gave-up">
              <p><b>Still nothing from its gateway.</b></p>
              <p className="ag-hint">Run the command above on that computer, then tap Try again.</p>
              <button type="button" className="ag-btn" onClick={() => { pairedAt.current = Date.now(); setAttempt((n) => n + 1); refresh(); }}>Try again</button>
            </div>
          ) : <Spinner label="Waiting for its gateway…" />}
          <a className="ag-guide" href={GUIDE} target="_blank" rel="noreferrer">Step-by-step guide</a>
        </>
      ) : (
        <>
          <p className="ag-lead">On the computer {agent?.name || "your agent"} runs on, open a terminal and run this.</p>
          <CommandBox command={pairCommand(code.code)} testid="pair-command" />
          <div className="ag-code" data-testid="pair-code" aria-label={`Pairing code ${code.code.split("").join(" ")}`}>
            <b className={left === 0 ? "dead" : ""}>{spacedCode(code.code)}</b>
            {left > 0 ? <small>Works once. Expires in {clock(left)}</small> : <button type="button" className="ag-link" data-testid="new-code" onClick={getNew}>Get a new code</button>}
          </div>
          {codeError ? <p className="ag-error" role="alert">{codeError}</p> : null}
          <p className="ag-hint">No gateway service yet? Run <code>hermes gateway install</code> first. Using a named profile? Put <code>-p &lt;profile&gt;</code> right after <code>hermes</code> in each command.</p>
          {left === 0 ? (
            <div className="ag-fix" data-testid="pair-fix"><b>That code ran out.</b><span>Tap Get a new code above, then run the command again with the new code.</span></div>
          ) : now - since >= stuckMs ? (
            <div className="ag-fix" data-testid="pair-fix"><b>Still waiting?</b><span>Run <code>hermes yui status</code> on that computer. Not paired: run the command again. Paired: run <code>hermes gateway restart</code>, the gateway only connects after a restart.</span></div>
          ) : null}
          <Spinner label="Waiting for your computer…" />
          <a className="ag-guide" href={GUIDE} target="_blank" rel="noreferrer">Step-by-step guide</a>
        </>
      )}
    </div>
  );
}

// Add agent: name it, pick a look, get a code, run one command on the host (AddAgentSheet).
export default function AddAgent({ manage, agents, crew, refresh, onClose, onOpenAgent, giveUpMs, stuckMs, pollMs }) {
  const [name, setName] = useState("");
  const [look, setLook] = useState(null);
  const [pending, setPending] = useState(null); // { id, code }
  const [working, setWorking] = useState(false);
  const [error, setError] = useState("");
  const clean = cleanName(name);
  const preview = useMemo(() => ({ name: clean || "?", color: look || "mint", theme: look ? { preset: look } : {} }), [clean, look]);

  const create = async (e) => {
    e?.preventDefault();
    if (!clean || working) return;
    setWorking(true); setError("");
    try {
      const r = await manage.create({ name: clean, color: "mint" });
      if (look) { try { await manage.setLook(r.agent.id, look); } catch { /* the look is a nicety */ } }
      await refresh();
      setPending({ id: r.agent.id, code: r.pairing });
    } catch (err) { setError(err.code === "invalid_name" ? agentError("invalid_name") : "Couldn't make a code just now. Check your connection and tap again."); }
    finally { setWorking(false); }
  };
  const newCode = useCallback(async () => {
    const code = await manage.pairCode(pending.id);
    setPending((p) => ({ ...p, code }));
  }, [manage, pending?.id]);
  const hi = (id) => { onOpenAgent(id); onClose(); };

  return (
    <Dialog label="Add agent" onClose={onClose} testid="add-agent">
      <SheetBar title="Add agent" right={<button type="button" className="ag-barbtn" onClick={onClose}>{pending ? "Done" : "Cancel"}</button>} />
      <div className="ag-body">
        {pending ? (
          <PairingStep agentId={pending.id} code={pending.code} newCode={newCode} agents={agents} refresh={refresh} onSayHi={hi} giveUpMs={giveUpMs} stuckMs={stuckMs} pollMs={pollMs} />
        ) : (
          <>
            {crew?.length ? <CrewPicker crew={crew} agents={agents} manage={manage} onOpen={hi} onChanged={refresh} /> : null}
            {crew?.length ? <h3 className="ag-or">Or connect your own</h3> : null}
            <form className="ag-form" onSubmit={create}>
              <div className="ag-preview"><Face agent={preview} size={72} /></div>
              <label htmlFor="ag-name"><b>What should we call them?</b></label>
              <input id="ag-name" className="ag-input" value={name} maxLength={60} placeholder="Name, like Nova" autoComplete="off" enterKeyHint="next" data-autofocus={crew?.length ? undefined : ""} onChange={(e) => { setName(e.target.value); setError(""); }} />
              <h4>Look</h4>
              <LookPicker value={look} onChange={setLook} name={clean} />
              {error ? <p className="ag-error" role="alert">{error}</p> : null}
              <button type="submit" className="ag-btn" disabled={!clean || working} data-testid="get-code">{working ? "Making a code…" : "Get a pairing code"}</button>
              <p className="ag-hint">Next you'll get a code and three short commands to run on the computer your agent lives on.</p>
            </form>
          </>
        )}
      </div>
    </Dialog>
  );
}
