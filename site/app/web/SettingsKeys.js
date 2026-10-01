"use client";
// Keys on the web (YUI-247): Vault/VaultViews.swift and Vault/VaultAskViews.swift. A key is typed here, sealed to
// the hosted connector in this page (HPKE, lib/web/vault.mjs) and handed to the relay; the page keeps the last four
// and nothing else, and no key is ever shown back. Every change asks first, in Yui's own chrome (the web twin of
// Face ID: a browser page has no biometric to ask for, so it is an explicit tap). The ask sheet is never drawn
// from an agent's screen.
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  DEFAULT_CAP, PROVIDERS, createVault, detect, dollars, lapseNote, matches, providerOf, usedLine, wrongShape, answerMeta,
} from "../../lib/web/vault.mjs";
import { Confirm, Dialog, Face, SheetBar, Spinner, Switch } from "./parts";

const CAPS = [500, 1000, 2500, 5000, 10000];
const monthStart = () => { const d = new Date(); return Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), 1); };

// One vault for a relay: the keys the relay holds sealed, the grants, and this month's spend.
export function useVault(relay, userId) {
  const vault = useMemo(() => (relay?.rest ? createVault({ rest: relay.rest }) : null), [relay]);
  const [state, setState] = useState({ keys: null, grants: [], spent: {}, byAgent: {}, error: "" });
  const load = useCallback(async () => {
    if (!vault) return;
    try {
      const [keys, grants, uses] = await Promise.all([vault.keys(), vault.grants(), vault.uses(monthStart())]);
      const spent = {}, byAgent = {};
      for (const u of uses) {
        const k = String(u.key || "").toLowerCase();
        spent[k] = (spent[k] || 0) + (u.cost_cents || 0);
        const a = `${String(u.agent_id || "").toLowerCase()}|${k}`;
        byAgent[a] = (byAgent[a] || 0) + (u.cost_cents || 0);
      }
      setState({ keys, grants, spent, byAgent, error: "" });
    } catch { setState((s) => ({ ...s, keys: s.keys || [], error: "Couldn't reach Yui to read your keys." })); }
  }, [vault]);
  useEffect(() => { load(); }, [load]);
  return { vault, userId, ...state, reload: load };
}

export default function SettingsKeys({ relay, agents, userId, focus }) {
  const v = useVault(relay, userId);
  const mine = (agents || []).filter((a) => !a.shared);
  const [adding, setAdding] = useState(focus === "keys");
  const agentName = (id) => (agents || []).find((a) => a.id === id)?.name || "An agent";
  return (
    <section className="st-card" data-section="keys" data-testid="st-keys" aria-label="Keys">
      <h3>Keys</h3>
      <p>Let an agent use your fal, Replicate, ElevenLabs, Anthropic or OpenAI key for a job you say yes to. It never sees the key. Yui's connector makes the call.</p>
      <p className="ag-hint">A key you add here is sealed to the connector in this page, then forgotten by it. Keys on your iPhone stay on your iPhone and show here once an agent has been allowed to use one.</p>
      {v.keys === null ? <Spinner label="Reading your keys" /> : (
        <ul className="st-keys" data-testid="key-list">
          {v.keys.map((k) => <KeyCard key={k.id} k={k} v={v} mine={mine} agentName={agentName} />)}
          {!v.keys.length ? <li className="st-plain" data-testid="keys-empty">No keys yet. Add one, or an agent asks for one and you say yes.</li> : null}
        </ul>
      )}
      {v.error ? <p className="ag-error" role="alert">{v.error}</p> : null}
      {adding ? <AddKey v={v} onDone={() => setAdding(false)} /> : <button type="button" className="ag-btn quiet" onClick={() => setAdding(true)} data-testid="key-add">＋ Add a key</button>}
    </section>
  );
}

function KeyCard({ k, v, mine, agentName }) {
  const p = providerOf(k.provider);
  const grants = v.grants.filter((g) => g.key === k.id && !g.revoked_at);
  const spent = v.spent[k.id] || 0;
  const [granting, setGranting] = useState(false);
  const [confirm, setConfirm] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const remove = async () => {
    setBusy(true); setError("");
    try { await v.vault.remove(k.id); setConfirm(false); await v.reload(); } catch { setConfirm(false); setError("Couldn't remove the key. Try again."); } finally { setBusy(false); }
  };
  const revoke = async (g) => { try { await v.vault.revoke(g.id); await v.reload(); } catch { setError("Couldn't revoke that. Try again."); } };
  return (
    <li className="st-key" data-testid={`key-${k.id}`}>
      <div className="st-have">
        <span className="st-ico" aria-hidden="true">🔑</span>
        <span className="st-grow"><b>{p?.label || k.provider}: {k.name}</b><small>Ends in {k.last4} · {usedLine(grants)} · {dollars(spent)} of {dollars(k.cap_cents ?? DEFAULT_CAP)} this month</small></span>
      </div>
      {grants.map((g) => (
        <div className="st-grant" key={g.id} data-testid={`grant-${g.handle}`}>
          <span className="st-grow"><b>{agentName(g.agent_id)}</b><small>{g.purpose}{g.once ? " (once)" : ""} · {dollars(v.byAgent[`${String(g.agent_id).toLowerCase()}|${k.id}`] || 0)} of {dollars(g.cap_cents ?? k.cap_cents ?? DEFAULT_CAP)} this month</small>{lapseNote(g) ? <small>{lapseNote(g)}</small> : null}</span>
          <button type="button" className="st-danger" onClick={() => revoke(g)} aria-label={`Revoke ${agentName(g.agent_id)}`} data-testid={`revoke-${g.handle}`}>Revoke</button>
        </div>
      ))}
      <div className="st-two">
        {mine.length ? <button type="button" className="ag-btn quiet" onClick={() => setGranting((x) => !x)} aria-expanded={granting} data-testid={`grant-open-${k.id}`}>Let an agent use it</button> : null}
        <button type="button" className="ag-btn danger-soft" onClick={() => setConfirm(true)} data-testid={`key-remove-${k.id}`}>Remove key</button>
      </div>
      {granting ? <GrantForm k={k} v={v} mine={mine} onDone={() => setGranting(false)} /> : null}
      {error ? <p className="ag-error" role="alert">{error}</p> : null}
      {confirm ? <Confirm question={`Remove your ${p?.label || k.provider} key?`} note="The sealed copy goes, and every agent that could use it loses access on its next call." confirm="Remove key" keep="Keep it" busy={busy} onConfirm={remove} onKeep={() => setConfirm(false)} /> : null}
    </li>
  );
}

function GrantForm({ k, v, mine, onDone }) {
  const p = providerOf(k.provider);
  const [agentId, setAgentId] = useState(mine[0]?.id || "");
  const [purpose, setPurpose] = useState("");
  const [cap, setCap] = useState(Math.min(DEFAULT_CAP, k.cap_cents ?? DEFAULT_CAP));
  const [once, setOnce] = useState(false);
  const [limit, setLimit] = useState(false);
  const [ask, setAsk] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const needsLimit = p && !p.priced && !limit;
  const submit = async () => {
    setBusy(true); setError("");
    try { await v.vault.grant({ key: k.id, agentId, purpose: purpose.trim(), capCents: Math.min(cap, k.cap_cents ?? DEFAULT_CAP), once, provider: k.provider }); setAsk(false); await v.reload(); onDone(); }
    catch { setAsk(false); setError("Couldn't hand the key to Yui's connector. Try again."); }
    finally { setBusy(false); }
  };
  return (
    <form className="st-form st-sub" onSubmit={(e) => { e.preventDefault(); if (purpose.trim() && agentId && !needsLimit) setAsk(true); }}>
      <label htmlFor={`g-agent-${k.id}`}>Which agent</label>
      <select id={`g-agent-${k.id}`} className="ag-input" value={agentId} onChange={(e) => setAgentId(e.target.value)} data-testid="grant-agent">{mine.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}</select>
      <label htmlFor={`g-why-${k.id}`}>What for</label>
      <input id={`g-why-${k.id}`} className="ag-input" maxLength={80} value={purpose} onChange={(e) => setPurpose(e.target.value)} placeholder="Draw my agent avatars" data-testid="grant-purpose" />
      <label htmlFor={`g-cap-${k.id}`}>Most it can spend a month</label>
      <select id={`g-cap-${k.id}`} className="ag-input" value={cap} onChange={(e) => setCap(Number(e.target.value))} data-testid="grant-cap">{CAPS.filter((c) => c <= (k.cap_cents ?? DEFAULT_CAP)).map((c) => <option key={c} value={c}>{dollars(c)}</option>)}</select>
      <div className="st-row"><div><b>Just once</b><small>The grant ends after one call.</small></div><Switch on={once} onChange={setOnce} label="Just once" /></div>
      {p && !p.priced ? <div className="st-row"><div><b>I set a spending limit at {p.label}</b><small><a className="st-link" href={p.limitPage} target="_blank" rel="noopener noreferrer">Set one there ↗</a>. Yui has no price list for it yet.</small></div><Switch on={limit} onChange={setLimit} label={`I set a spending limit at ${p.label}`} /></div> : null}
      <button type="submit" className="ag-btn" disabled={busy || !purpose.trim() || !agentId || needsLimit} data-testid="grant-allow">Allow</button>
      {error ? <p className="ag-error" role="alert">{error}</p> : null}
      {ask ? <Confirm question={`Let ${mine.find((a) => a.id === agentId)?.name || "an agent"} use your ${p?.label} key?`} note="It never sees the key. Yui's connector uses it for the calls you allow." confirm="Allow" keep="Cancel" busy={busy} onConfirm={submit} onKeep={() => setAsk(false)} tone="plain" /> : null}
    </form>
  );
}

function AddKey({ v, onDone, preset = null, after = null }) {
  const [provider, setProvider] = useState(preset || "fal");
  const [secret, setSecret] = useState("");
  const [name, setName] = useState("");
  const [cap, setCap] = useState(DEFAULT_CAP);
  const [limit, setLimit] = useState(false);
  const [ask, setAsk] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const p = providerOf(provider);
  const onPaste = (value) => {
    setSecret(value); setError("");
    const d = detect(value);
    if (d && !preset) setProvider(d.id);
  };
  const submit = async () => {
    setBusy(true); setError("");
    try {
      const k = await v.vault.add({ userId: v.userId, provider, name: name.trim() || p.label, secret, capCents: cap, limitConfirmed: limit });
      setSecret(""); setAsk(false);
      await v.reload();
      after?.(k);
      onDone();
    } catch (e) { setAsk(false); setError(e.code === "wrong_shape" ? wrongShape(p) : "Couldn't save the key. Try again."); }
    finally { setBusy(false); }
  };
  return (
    <form className="st-form st-sub" data-testid="key-add-form" onSubmit={(e) => { e.preventDefault(); if (!matches(p, secret)) { setError(wrongShape(p)); return; } setAsk(true); }}>
      <label htmlFor="kv-provider">Provider</label>
      <select id="kv-provider" className="ag-input" value={provider} disabled={!!preset} onChange={(e) => setProvider(e.target.value)} data-testid="vault-provider">
        {PROVIDERS.map((x) => <option key={x.id} value={x.id}>{x.label}, {x.usedFor}</option>)}
      </select>
      <a className="st-link" href={p.keyPage} target="_blank" rel="noopener noreferrer">Make a key at {new URL(p.keyPage).host} ↗</a>
      <label htmlFor="kv-secret">Paste your {p.label} key</label>
      <input id="kv-secret" className="ag-input" type="password" autoComplete="off" autoCapitalize="none" spellCheck="false" value={secret} onChange={(e) => onPaste(e.target.value)} data-testid="vault-secret" />
      <label htmlFor="kv-name">Name</label>
      <input id="kv-name" className="ag-input" maxLength={40} value={name} onChange={(e) => setName(e.target.value)} placeholder={`Personal ${p.label}`} data-testid="vault-name" />
      <label htmlFor="kv-cap">Most Yui lets it spend a month</label>
      <select id="kv-cap" className="ag-input" value={cap} onChange={(e) => setCap(Number(e.target.value))} data-testid="vault-cap">{CAPS.map((c) => <option key={c} value={c}>{dollars(c)}</option>)}</select>
      {!p.priced ? <div className="st-row"><div><b>I set a spending limit at {p.label}</b><small><a className="st-link" href={p.limitPage} target="_blank" rel="noopener noreferrer">Set one there ↗</a></small></div><Switch on={limit} onChange={setLimit} label={`I set a spending limit at ${p.label}`} /></div> : null}
      <button type="submit" className="ag-btn" disabled={busy || !secret} data-testid="vault-save">{busy ? "Sealing the key" : "Add key"}</button>
      <button type="button" className="st-text" onClick={onDone}>Cancel</button>
      <p className="ag-hint">The key is sealed in this page to Yui's connector and sent once. This page keeps only its last four.</p>
      {error ? <p className="ag-error" role="alert" data-testid="vault-error">{error}</p> : null}
      {ask ? <Confirm question={`Add your ${p.label} key to Yui?`} note="This page seals it, hands it to Yui, then forgets it. You can remove it any time." confirm="Add key" keep="Cancel" busy={busy} onConfirm={submit} onKeep={() => setAsk(false)} tone="plain" /> : null}
    </form>
  );
}

// "Penny wants to use your fal key": Allow, Allow once, Don't allow. No key for that provider yet: add one here.
export function KeyAskSheet({ relay, userId, ask, agent, answer, onClose }) {
  const v = useVault(relay, userId);
  const [picked, setPicked] = useState("");
  const [adding, setAdding] = useState(false);
  const [limit, setLimit] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const p = providerOf(ask.provider);
  const held = (v.keys || []).filter((k) => k.provider === ask.provider);
  const key = held.find((k) => k.id === picked) || held[0];
  const name = agent?.name || "An agent";
  const blocked = key && !p.priced && !limit;
  const run = async (once) => {
    if (!key || !agent) return;
    setBusy(true); setError("");
    const cap = Math.min(ask.cap ?? (key.cap_cents ?? DEFAULT_CAP) / 100, (key.cap_cents ?? DEFAULT_CAP) / 100);
    try {
      const handle = await v.vault.grant({ key: key.id, agentId: agent.id, purpose: ask.purpose, capCents: cap * 100, once, provider: ask.provider });
      await answer(answerMeta({ req: ask.req, decision: once ? "once" : "allow", provider: ask.provider, handle, cap }));
    } catch { setError("Couldn't hand the key to Yui's connector. Try again."); } finally { setBusy(false); }
  };
  const deny = async () => { setBusy(true); try { await answer(answerMeta({ req: ask.req, decision: "deny", provider: ask.provider })); } finally { setBusy(false); } };
  return (
    <Dialog label={`${name} wants to use your ${p.label} key`} onClose={() => {}} testid="key-ask">
      <SheetBar title="Key request" />
      <div className="ag-body">
        <div className="st-askhead">{agent ? <Face agent={agent} size={52} /> : null}<h2 data-testid="key-ask-title">{name} wants to use your {p.label} key</h2></div>
        <p data-testid="key-ask-for">{ask.purpose}</p>
        {ask.est ? <p className="ag-hint">{ask.est}</p> : null}
        {ask.cap ? <p className="ag-hint" data-testid="key-ask-cap"><b>Suggested cap: ${ask.cap} a month</b></p> : null}
        {v.keys === null ? <Spinner label="Looking for your key" /> : !held.length ? (
          <>
            <p data-testid="key-ask-nokey"><b>You don't have a {p.label} key yet.</b></p>
            {adding ? <AddKey v={v} preset={ask.provider} onDone={() => setAdding(false)} /> : <button type="button" className="ag-btn" onClick={() => setAdding(true)} data-testid="key-ask-add">＋ Add a {p.label} key</button>}
          </>
        ) : (
          <>
            {held.length > 1 ? (
              <select className="ag-input" value={key.id} onChange={(e) => setPicked(e.target.value)} aria-label="Which key" data-testid="key-ask-pick">{held.map((k) => <option key={k.id} value={k.id}>{k.name}, ends in {k.last4}</option>)}</select>
            ) : <p className="ag-hint">{key.name}, ends in {key.last4}</p>}
            {!p.priced ? <div className="st-row"><div><b>I set a spending limit at {p.label}</b></div><Switch on={limit} onChange={setLimit} label={`I set a spending limit at ${p.label}`} /></div> : null}
            <button type="button" className="ag-btn" disabled={busy || blocked} onClick={() => run(false)} data-testid="key-ask-allow">Allow</button>
            <button type="button" className="ag-btn quiet" disabled={busy || blocked} onClick={() => run(true)} data-testid="key-ask-once">Allow once</button>
          </>
        )}
        <button type="button" className="ag-btn quiet" disabled={busy} onClick={deny} data-testid="key-ask-deny">Don't allow</button>
        <p className="ag-hint">{name} never sees the key. Yui's connector uses it for the calls you allow.</p>
        {error ? <p className="ag-error" role="alert" data-testid="key-ask-error">{error}</p> : null}
      </div>
    </Dialog>
  );
}
