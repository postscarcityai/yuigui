"use client";
// Settings and account on the web (YUI-247): SettingsView.swift in a sheet. Appearance, Full screen, Home actions,
// Look, Agent access, Keys, Your model key, Web search, Help and feedback, Account, About, and the speed switch on
// a dev link. Each section is the app's, in the app's words. A key is typed, sent once, and never shown back.
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { candidates, pick as pickQuick } from "../../lib/web/quick.mjs";
import {
  APPEARANCES, APPEARANCE_LABEL, DELETE_WORDS, FIRECRAWL_KEYS, HELP, KEY_LOCKED, OTHER_ROAD, OTHER_ROAD_URL, PRIVACY, START,
  accountLine, browserLine, buildSummary, deleteError, feedbackMail, keyShapeOk, lookName, modelLeft, movePick, nativeError, perfOn, PERF_KEY,
  resetLook, searchLeft, setAgentsKeep, setStage, togglePick, tokenName, usedWords,
} from "../../lib/web/settings.mjs";
import { PUSH_WORDS } from "../../lib/web/push.mjs";
import { Confirm, Dialog, SheetBar, Spinner, Switch } from "./parts";
import SettingsKeys from "./SettingsKeys";
import "./settings.css";

export default function SettingsPanel({ relay, auth, demo, userId, email, review, agents, menus, build, focus, appearance, stage, picks, look, push, onSignOut, onClose }) {
  const call = useCallback((fn, body) => relay.call(fn, body), [relay]);
  const hosted = (agents || []).some((a) => a.kind === "hosted");
  const owns = (agents || []).some((a) => !a.shared);
  const body = useRef(null);
  // yui://settings/<section> opens at that section.
  useEffect(() => {
    if (!focus) return undefined;
    const t = setTimeout(() => body.current?.querySelector(`[data-section="${focus}"]`)?.scrollIntoView({ block: "start" }), 120);
    return () => clearTimeout(t);
  }, [focus]);
  const [pref, setPref] = appearance;
  const [stg, setStg] = stage;
  const [picked, setPicked] = picks;

  return (
    <Dialog label="Settings" onClose={onClose} wide testid="settings">
      <SheetBar title="Settings" right={<button type="button" className="ag-barbtn" onClick={onClose} data-testid="settings-done">Done</button>} />
      <div className="ag-body st-body" ref={body}>
        <div className="st-hero">
          <img src="/brand/yui-wordmark-coral.png" alt="Yui" width="104" height="66" />
          <p>Make Yui feel like yours.</p>
        </div>

        <Card title="Appearance" id="appearance">
          <div className="st-seg" role="radiogroup" aria-label="Appearance">
            {APPEARANCES.map((o) => (
              <button key={o} type="button" role="radio" aria-checked={pref === o} className={pref === o ? "on" : ""} onClick={() => setPref(o)} data-testid={`appearance-${o}`}>
                <i aria-hidden="true">{o === "system" ? "◐" : o === "light" ? "☀" : "☾"}</i>{APPEARANCE_LABEL[o]}
              </button>
            ))}
          </div>
        </Card>

        <Card title="Full screen" id="stage">
          <Row title="Answers on the full screen" sub={stg.on ? "The chat is the record, top right." : "Answers land in the chat."} on={stg.on} onChange={(v) => setStg(setStage(stg, "on", v))} testid="stage-first-on" />
          {stg.on ? (
            <>
              <Row title="Mic" sub="Tap and talk. A short pause sends it." on={stg.mic} disabled={stg.mic && !stg.type} onChange={(v) => setStg(setStage(stg, "mic", v))} testid="stage-mic-on" />
              <Row title="T for typing" sub="Opens the text field." on={stg.type} disabled={stg.type && !stg.mic} onChange={(v) => setStg(setStage(stg, "type", v))} testid="stage-type-on" />
              <Row title="+ to attach" sub="Photos go in with your words." on={stg.attach} onChange={(v) => setStg(setStage(stg, "attach", v))} testid="stage-attach-on" />
            </>
          ) : null}
        </Card>

        <Notifications push={push} />

        <HomeActions agents={agents} menus={menus} picks={picked} setPicks={setPicked} />

        <LookSection look={look} />

        {owns ? <AgentAccess call={call} /> : null}

        <SettingsKeys relay={relay} agents={agents} userId={userId} focus={focus} />

        {hosted ? <ModelKey call={call} /> : null}
        {hosted ? <SearchKey call={call} /> : null}

        <Help build={build} />

        <Account email={email} review={review} onSignOut={onSignOut} relay={relay} auth={auth} demo={demo} />

        <About build={build} />

        <Speed />
      </div>
    </Dialog>
  );
}

function Card({ title, id, children, testid }) {
  return (
    <section className="st-card" data-section={id} data-testid={testid || `st-${id}`} aria-label={title}>
      <h3>{title}</h3>
      {children}
    </section>
  );
}

function Row({ title, sub, on, onChange, disabled = false, testid }) {
  return (
    <div className="st-row" data-testid={testid}>
      <div><b>{title}</b>{sub ? <small>{sub}</small> : null}</div>
      <Switch on={on} onChange={onChange} label={title} disabled={disabled} />
    </div>
  );
}

// ---------------------------------------------------------------- Notifications (Push/Push.swift, YUI-248)

function Notifications({ push }) {
  const s = push?.state;
  if (!s) return null;
  const w = PUSH_WORDS[s];
  const can = s === "on" || s === "off";
  return (
    <Card title="Notifications" id="notifications">
      {can ? <Row title={w.title} sub={w.sub} on={s === "on"} onChange={(v) => (v ? push.enable() : push.disable())} testid="push-switch" />
        : <div className="st-row" data-testid="push-note"><div><b>{w.title}</b><small>{w.sub}</small></div></div>}
      {push.error ? <p className="ag-error" role="alert" data-testid="push-error">{push.error}</p> : null}
    </Card>
  );
}

// ---------------------------------------------------------------- Home actions (QuickActions.swift)

function HomeActions({ agents, menus, picks, setPicks }) {
  const all = useMemo(() => candidates(agents || [], menus || {}), [agents, menus]);
  const shown = useMemo(() => pickQuick(all, { picks }).map((c) => c.id), [all, picks]);
  const on = shown.map((id) => all.find((c) => c.id === id)).filter(Boolean);
  const off = all.filter((c) => !shown.includes(c.id));
  const full = shown.length >= 4;
  const set = (next) => setPicks(next);
  const toggle = (id) => set(togglePick(shown, id));
  return (
    <Card title="Home actions" id="home-actions">
      <p className="ag-hint">The command palette (Ctrl or Cmd + K) leads with up to four. Your agents fill the list. You choose.</p>
      {!all.length ? <p className="st-plain">Your agents haven't added any yet.</p> : null}
      <ul className="st-list" data-testid="home-actions-list">
        {on.map((c, i) => (
          <li key={c.id} data-on="1" data-testid={`ha-${c.id}`}>
            <button type="button" className="st-pick on" aria-pressed="true" onClick={() => toggle(c.id)}><i aria-hidden="true">✓</i><span><b>{c.item.label}</b><small>{c.agentName}</small></span></button>
            <span className="st-move">
              <button type="button" aria-label={`Move ${c.item.label} up`} disabled={i === 0} onClick={() => set(movePick(shown, c.id, -1))}>↑</button>
              <button type="button" aria-label={`Move ${c.item.label} down`} disabled={i === on.length - 1} onClick={() => set(movePick(shown, c.id, 1))}>↓</button>
            </span>
          </li>
        ))}
        {off.map((c) => (
          <li key={c.id} data-testid={`ha-${c.id}`}>
            <button type="button" className="st-pick" aria-pressed="false" disabled={full} onClick={() => toggle(c.id)}><i aria-hidden="true" /><span><b>{c.item.label}</b><small>{c.agentName}</small></span></button>
          </li>
        ))}
      </ul>
      {picks ? <button type="button" className="st-text" data-testid="home-actions-default" onClick={() => set(null)}>Back to the default</button> : null}
    </Card>
  );
}

// ---------------------------------------------------------------- Look (LookSection)

function LookSection({ look }) {
  const s = look.state;
  const name = lookName(s.look);
  const swatch = useMemo(() => document.querySelector(".web-root")?.style.getPropertyValue("--brand") || "", [s.look]); // eslint-disable-line react-hooks/exhaustive-deps
  return (
    <Card title="Look" id="look">
      <div className="st-name" data-testid="look-name" aria-label={`Yui's look, ${name}`}>
        <i style={{ background: swatch || "var(--brand)" }} aria-hidden="true" /><b>{name}</b>
      </div>
      <p className="ag-hint">Ask any of your agents for a new look, like “make Yui feel like autumn.”</p>
      <Row title="Agents keep their own looks" sub={s.agentsKeep ? "Each thread wears its agent's look." : "Every thread wears Yui's look."} on={s.agentsKeep} onChange={(v) => look.save(setAgentsKeep(s, v))} testid="look-agents-keep" />
      {s.look ? <button type="button" className="ag-btn quiet" data-testid="look-reset" onClick={() => look.save(resetLook(s))}>↺ Back to Yui's look</button> : null}
      {look.error ? <p className="ag-error" role="alert">{look.error}</p> : null}
    </Card>
  );
}

// ---------------------------------------------------------------- Agent access (AgentAccessSection)

function AgentAccess({ call }) {
  const [tokens, setTokens] = useState(null);
  const [fresh, setFresh] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const load = useCallback(async () => { try { setTokens((await call("yui-agents", { action: "token_list" })).tokens || []); } catch { setError("Could not read your access tokens."); setTokens([]); } }, [call]);
  useEffect(() => { load(); }, [load]);
  const create = async () => {
    setBusy(true); setError("");
    try { const r = await call("yui-agents", { action: "token_create", name: tokenName((tokens || []).length) }); setFresh(r.token); setCopied(false); await load(); }
    catch { setError("Could not make a token. Try again in a moment."); }
    finally { setBusy(false); }
  };
  const revoke = async (t) => {
    setTokens((list) => (list || []).filter((x) => x.id !== t.id));
    try { await call("yui-agents", { action: "token_revoke", id: t.id }); } catch { setError("Could not revoke that one."); }
    load();
  };
  const copy = async () => { try { await navigator.clipboard.writeText(fresh); setCopied(true); setTimeout(() => setCopied(false), 1800); } catch { setCopied(false); } };
  return (
    <Card title="Agent access" id="agent-access">
      <p>Let one of your agents add and manage agents for you. It can't read your messages.</p>
      {fresh ? (
        <div className="st-fresh" data-testid="token-fresh">
          <small>Copy this now. Yui won't show it again.</small>
          <div className="ag-cmd"><code data-testid="token-secret">{fresh}</code><button type="button" className="ag-copy" onClick={copy}>{copied ? "Copied" : "Copy"}</button></div>
          <button type="button" className="st-text" onClick={() => setFresh(null)}>I copied it</button>
        </div>
      ) : null}
      {tokens === null ? <Spinner label="Reading your tokens" /> : (
        <ul className="st-list" data-testid="token-list">
          {tokens.map((t) => (
            <li key={t.id} data-testid={`token-${t.id}`}>
              <span className="st-ico" aria-hidden="true">🔑</span>
              <span className="st-grow"><b>{t.name}</b><small>{usedWords(t.last_used_at)}</small></span>
              <button type="button" className="st-danger" onClick={() => revoke(t)} aria-label={`Revoke ${t.name}`}>Revoke</button>
            </li>
          ))}
        </ul>
      )}
      <button type="button" className="ag-btn quiet" disabled={busy} onClick={create} data-testid="token-create">＋ Create access token</button>
      {error ? <p className="ag-error" role="alert">{error}</p> : null}
    </Card>
  );
}

// ---------------------------------------------------------------- Your model key and Web search (yui-native)

function useNative(call) {
  const [status, setStatus] = useState(null);
  const [error, setError] = useState("");
  const load = useCallback(async () => { try { setStatus(await call("yui-native", { action: "status" })); setError(""); } catch (e) { setError(nativeError(e)); } }, [call]);
  useEffect(() => { load(); }, [load]);
  return { status, error, setError, load };
}

function ModelKey({ call }) {
  const { status, error, setError, load } = useNative(call);
  const [provider, setProvider] = useState("openrouter");
  const [key, setKey] = useState("");
  const [model, setModel] = useState("");
  const [baseUrl, setBaseUrl] = useState("");
  const [busy, setBusy] = useState(false);
  const [saved, setSaved] = useState(false);
  const chosen = status?.providers?.find((p) => p.id === provider);
  const label = (id) => status?.providers?.find((p) => p.id === id)?.label || id;
  const run = async (work, done) => { setBusy(true); setError(""); setSaved(false); try { await work(); setKey(""); await load(); done?.(); } catch (e) { setError(nativeError(e)); } finally { setBusy(false); } };
  const save = (e) => {
    e.preventDefault();
    if (!keyShapeOk(key) && !(provider === "custom" && !key)) { setError(nativeError({ code: "invalid_key" })); return; }
    run(() => call("yui-native", { action: "key_set", provider, key: key.trim(), ...(model.trim() ? { model: model.trim() } : {}), ...(baseUrl.trim() ? { base_url: baseUrl.trim() } : {}) }), () => setSaved(true));
  };
  return (
    <Card title="Your model key" id="key" testid="st-key">
      {!status ? (error ? null : <Spinner label="Reading your key" />) : status.key ? (
        <>
          <div className="st-have" data-testid="model-key-have">
            <span className="st-ico" aria-hidden="true">🔑</span>
            <span className="st-grow"><b>{label(status.key.provider)}</b><small>Ends in {status.key.hint}{status.key.model ? `, runs ${status.key.model}` : ""}</small></span>
            <button type="button" className="st-danger" disabled={busy} onClick={() => run(() => call("yui-native", { action: "key_remove" }))} data-testid="model-key-remove">Remove</button>
          </div>
          <p className="ag-hint">Yui and your crew use this key, with no monthly limit.</p>
        </>
      ) : (
        <form className="st-form" onSubmit={save}>
          <p data-testid="key-left">{modelLeft(status.turns)}</p>
          <label htmlFor="st-provider">Provider</label>
          <select id="st-provider" className="ag-input" value={provider} onChange={(e) => setProvider(e.target.value)} data-testid="key-provider">
            {(status.providers || []).map((p) => <option key={p.id} value={p.id}>{p.label}</option>)}
          </select>
          {chosen?.plan ? <p className="st-plan" data-testid="key-plan">{chosen.plan}</p> : null}
          {chosen?.keyUrl ? <a className="st-link" href={chosen.keyUrl} target="_blank" rel="noopener noreferrer" data-testid="key-make">Make a key at {new URL(chosen.keyUrl).host.replace(/^www\./, "")} ↗</a> : null}
          <label htmlFor="st-key">Paste your key</label>
          <input id="st-key" className="ag-input" type="password" autoComplete="off" autoCapitalize="none" spellCheck="false" value={key} onChange={(e) => setKey(e.target.value)} data-testid="key-field" />
          {provider === "custom" ? <><label htmlFor="st-base">Server address</label><input id="st-base" className="ag-input" inputMode="url" autoCapitalize="none" autoComplete="off" placeholder="https://..." value={baseUrl} onChange={(e) => setBaseUrl(e.target.value)} /></> : null}
          {chosen?.needsModel || provider === "custom" ? <><label htmlFor="st-model">Model name</label><input id="st-model" className="ag-input" autoCapitalize="none" autoComplete="off" value={model} onChange={(e) => setModel(e.target.value)} /></> : null}
          <button type="submit" className="ag-btn quiet" disabled={busy || (!key && provider !== "custom")} data-testid="key-save">{busy ? "Checking the key" : "✓ Save key"}</button>
          <p className="ag-hint">{KEY_LOCKED}</p>
          <hr />
          <p className="ag-hint" data-testid="key-other-road">{OTHER_ROAD}</p>
          <a className="st-link" href={OTHER_ROAD_URL}>Add Yui in Claude or ChatGPT ↗</a>
        </form>
      )}
      {saved ? <p className="st-ok" role="status" data-testid="key-saved">Saved. Your crew uses it from the next message.</p> : null}
      {error ? <p className="ag-error" role="alert">{error}</p> : null}
    </Card>
  );
}

function SearchKey({ call }) {
  const { status, error, setError, load } = useNative(call);
  const [key, setKey] = useState("");
  const [busy, setBusy] = useState(false);
  const [saved, setSaved] = useState(false);
  const search = status?.search;
  const run = async (work, done) => { setBusy(true); setError(""); setSaved(false); try { await work(); setKey(""); await load(); done?.(); } catch (e) { setError(nativeError(e)); } finally { setBusy(false); } };
  const save = (e) => {
    e.preventDefault();
    if (!keyShapeOk(key)) { setError(nativeError({ code: "invalid_key" })); return; }
    run(() => call("yui-native", { action: "search_key_set", key: key.trim() }), () => setSaved(true));
  };
  return (
    <Card title="Web search" id="search" testid="st-search">
      {!search ? (error ? null : <Spinner label="Reading your search key" />) : search.key ? (
        <>
          <div className="st-have" data-testid="search-key-have">
            <span className="st-ico" aria-hidden="true">🔎</span>
            <span className="st-grow"><b>Your Firecrawl key</b><small>Ends in {search.key.hint}</small></span>
            <button type="button" className="st-danger" disabled={busy} onClick={() => run(() => call("yui-native", { action: "search_key_remove" }))} data-testid="search-key-remove">Remove</button>
          </div>
          <p className="ag-hint">Your crew looks things up on your key, with no monthly limit.</p>
        </>
      ) : (
        <form className="st-form" onSubmit={save}>
          <p data-testid="search-left">{searchLeft(search)}</p>
          <label htmlFor="st-search">Paste your Firecrawl key</label>
          <input id="st-search" className="ag-input" type="password" autoComplete="off" autoCapitalize="none" spellCheck="false" value={key} onChange={(e) => setKey(e.target.value)} data-testid="search-key-field" />
          <button type="submit" className="ag-btn quiet" disabled={busy || !key} data-testid="search-key-save">{busy ? "Checking the key" : "✓ Save key"}</button>
          <a className="st-link" href={FIRECRAWL_KEYS} target="_blank" rel="noopener noreferrer">Get a key at firecrawl.dev ↗</a>
          <p className="ag-hint">Your key goes to Yui's server once and is kept locked away there. This page never shows it again.</p>
        </form>
      )}
      {saved ? <p className="st-ok" role="status" data-testid="search-saved">Saved. Your crew searches on it from the next message.</p> : null}
      {error ? <p className="ag-error" role="alert">{error}</p> : null}
    </Card>
  );
}

// ---------------------------------------------------------------- Help and feedback (HelpSection)

function Help({ build }) {
  const [text, setText] = useState("");
  const [browser, setBrowser] = useState("");
  useEffect(() => setBrowser(browserLine(navigator.userAgent)), []);
  const href = feedbackMail({ ...build, browser }, text);
  return (
    <Card title="Help and feedback" id="help">
      <ul className="st-links">
        <li><a href={HELP}>❓ Help and questions</a></li>
        <li><a href={START}>🔗 Connect an agent</a></li>
        <li><a href={PRIVACY}>✋ Privacy policy</a></li>
      </ul>
      <label htmlFor="st-feedback"><b>Tell us what felt off</b></label>
      <textarea id="st-feedback" className="ag-input st-area" rows={3} maxLength={4000} value={text} onChange={(e) => setText(e.target.value)} placeholder="What happened, and where?" data-testid="feedback-text" />
      <a className="ag-btn quiet st-mail" href={href} data-testid="feedback-send">✉ Email us</a>
      <p className="ag-hint">Opens a mail that already names this build, so a report says which one it is about.</p>
    </Card>
  );
}

// ---------------------------------------------------------------- Account (AccountSection)

function Account({ email, review, onSignOut, relay, auth, demo }) {
  const [confirm, setConfirm] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const who = accountLine({ email }, review);
  const out = async () => { setBusy(true); try { await onSignOut(); } finally { setBusy(false); } };
  const del = async () => {
    setBusy(true); setError("");
    try {
      if (demo || !auth) await relay.call("yui-delete", {}); else await auth.deleteAccount();
      setConfirm(false);
      await onSignOut({ deleted: true });
    } catch (e) { setConfirm(false); setError(deleteError(e?.code)); }
    finally { setBusy(false); }
  };
  return (
    <Card title="Account" id="account">
      <div className="st-name" data-testid="account-who"><span className="st-ico" aria-hidden="true">{review ? "✨" : ""}</span><span className="st-grow"><b>{who.title}</b>{who.email ? <small data-testid="settings-email">{who.email}</small> : null}</span></div>
      <div className="st-two">
        <button type="button" className="ag-btn quiet" disabled={busy} onClick={out} data-testid="sign-out">Sign out</button>
        <button type="button" className="ag-btn danger-soft" disabled={busy} onClick={() => setConfirm(true)} data-testid="delete-account">Delete account</button>
      </div>
      {error ? <p className="ag-error" role="alert" data-testid="delete-error">{error}</p> : null}
      {confirm ? <Confirm question={DELETE_WORDS.title} note={DELETE_WORDS.note} confirm={DELETE_WORDS.confirm} keep={DELETE_WORDS.keep} busy={busy} onConfirm={del} onKeep={() => setConfirm(false)} /> : null}
    </Card>
  );
}

// ---------------------------------------------------------------- About this build (AboutSection)

function About({ build }) {
  const [browser, setBrowser] = useState("");
  const [copied, setCopied] = useState(false);
  useEffect(() => setBrowser(browserLine(navigator.userAgent)), []);
  const text = buildSummary({ ...build, browser });
  const copy = async () => { try { await navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 2000); } catch { setCopied(false); } };
  return (
    <section className="st-about" data-section="about" data-testid="st-about" aria-label="About this build">
      <button type="button" className="st-aboutbtn" onClick={copy} aria-label="Copy the version, commit and guide">
        <span className="st-abouthead"><b>About this build</b><em>{copied ? "✓ Copied" : "Tap to copy"}</em></span>
        <pre data-testid="build-summary">{text}</pre>
      </button>
    </section>
  );
}

// ---------------------------------------------------------------- Speed (dev link only: ?perf=1)

function Speed() {
  const [on, setOn] = useState(false);
  const [shown, setShown] = useState(false);
  useEffect(() => { const q = window.location.search; setShown(new URLSearchParams(q).has("perf") || window.localStorage.getItem(PERF_KEY) === "1"); setOn(perfOn(q)); }, []);
  if (!shown) return null;
  return (
    <section className="st-about" data-testid="st-speed">
      <Row title="Speed" sub="Log every timing and show the frame rate. Dev links only." on={on} onChange={(v) => { try { if (v) localStorage.setItem(PERF_KEY, "1"); else localStorage.removeItem(PERF_KEY); } catch { /* private mode */ } setOn(v); }} testid="speed-switch" />
    </section>
  );
}

