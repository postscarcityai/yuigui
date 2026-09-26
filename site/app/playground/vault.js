"use client";

// Key vault (spec/VAULT.md, YUI-34 step 1): a mock of Settings > Keys, the add
// sheet, an agent's ask for a key and the drawer's per-agent grants. The lines
// in the editor are Penny's reply just before she asks for fal. The ask sheet is
// the app's own chrome, never Yui Lines, so an agent can't draw a fake one.
// Every key here is a placeholder; nothing leaves the page.

import { useMemo, useState } from "react";
import { apply, initialState, parse } from "../../lib/yl/yl.mjs";
import { Render } from "./presets";
import "./vault.css";

export const VAULT_VIEWS = [
  ["keys", "Settings > Keys"],
  ["add", "Add a key"],
  ["ask", "Agent asks"],
  ["drawer", "In the drawer"],
];

const PROVIDERS = {
  fal: { name: "fal", what: "images, video, audio", shape: /^[\w-]{8,}:\w{8,}$/, hint: "key id:secret", demo: "0000aaaa-bbbb:xxxxxxxxxxxxxxxx" },
  replicate: { name: "Replicate", what: "open models, images", shape: /^r8_\w{8,}$/, hint: "starts r8_", demo: "r8_xxxxxxxxxxxxxxxx" },
  openrouter: { name: "OpenRouter", what: "many models, one key", shape: /^sk-or-[\w-]{8,}$/, hint: "starts sk-or-", demo: "sk-or-v1-xxxxxxxxxxxxxxxx" },
  anthropic: { name: "Anthropic", what: "Claude", shape: /^sk-ant-[\w-]{8,}$/, hint: "starts sk-ant-", demo: "sk-ant-xxxxxxxxxxxxxxxx" },
  openai: { name: "OpenAI", what: "GPT, images", shape: /^sk-(?!ant-|or-)[\w-]{8,}$/, hint: "starts sk-", demo: "sk-proj-xxxxxxxxxxxxxxxx" },
};
const LOOK = { Penny: "#e8a33d", Quill: "#8b7cff", Coach: "#ff6b3d" };

// Two keys already in the vault. Last four are placeholders.
const START = [
  { id: "k1", provider: "openrouter", name: "Personal OpenRouter", last4: "xxxx", cap: 10, spent: 3.1, used: "2h ago", grants: [{ agent: "Quill", for: "Study cards with a bigger model", cap: 4, spent: 3.1 }] },
  { id: "k2", provider: "anthropic", name: "Work Claude", last4: "xxxx", cap: 20, spent: 0, used: "never", grants: [] },
];
const USES = [
  { day: "Today", rows: [["10:42", "Quill", "chat/completions", "0.04"], ["10:40", "Quill", "chat/completions", "0.03"], ["08:15", "Quill", "chat/completions", "0.05"]] },
  { day: "Yesterday", rows: [["21:03", "Quill", "grant: study cards, cap $4", null], ["20:58", "you", "added Personal OpenRouter", null]] },
];

function nodesOf(text) {
  let s = initialState();
  try { for (const op of parse(text)) s = apply(s, op); } catch { return []; }
  return s.screens["1"] || [];
}
const money = (n) => `$${n % 1 ? n.toFixed(2) : n}`;

function Face({ name, size = 30 }) {
  return <span className="vk-face" style={{ background: LOOK[name] || "var(--accent)", width: size, height: size }} aria-hidden="true">{name[0]}</span>;
}
function Mark({ p, size = 34 }) {
  return <span className={`vk-mark vk-${p}`} style={{ width: size, height: size }} aria-hidden="true">{PROVIDERS[p].name[0]}</span>;
}
function Bar({ spent, cap }) {
  const pct = Math.min(100, Math.round((spent / cap) * 100));
  return <span className={`vk-bar ${pct >= 80 ? "hot" : ""}`} role="img" aria-label={`${money(spent)} of ${money(cap)} this month`}><span style={{ width: `${pct}%` }} /></span>;
}
function Nav({ title, back, onBack }) {
  return (
    <div className="vk-nav">
      {back ? <button className="vk-back" onClick={onBack}>‹ {back}</button> : <span />}
      <b>{title}</b>
      <span />
    </div>
  );
}
// Face ID stands in as a short-lived banner.
function FaceId({ text }) {
  return <div className="vk-faceid" role="status"><span aria-hidden="true">◉</span> {text}</div>;
}

function KeysList({ keys, open, setOpen, goAdd, remove }) {
  const k = keys.find((x) => x.id === open);
  if (k) {
    return (
      <div className="vk-page">
        <Nav title={k.name} back="Keys" onBack={() => setOpen(null)} />
        <div className="vk-scroll">
          <div className="vk-hero">
            <Mark p={k.provider} size={48} />
            <div><div className="vk-h">{k.name}</div><div className="vk-sub">{PROVIDERS[k.provider].name} · ...{k.last4} · never shown again</div></div>
          </div>
          <div className="vk-card">
            <div className="vk-row"><span>This month</span><b>{money(k.spent)} of {money(k.cap)}</b></div>
            <Bar spent={k.spent} cap={k.cap} />
            <div className="vk-fine">Counted by Yui&apos;s connector. The provider&apos;s own limit is the backstop.</div>
          </div>
          <div className="vk-label">Used by</div>
          <div className="vk-card">
            {k.grants.length ? k.grants.map((g) => (
              <div key={g.agent} className="vk-row"><span className="vk-who"><Face name={g.agent} size={24} /> {g.agent}</span><span className="vk-sub">{g.for}</span></div>
            )) : <div className="vk-sub">No agent can use this key yet. Agents ask when they need it.</div>}
          </div>
          <div className="vk-label">Activity</div>
          <div className="vk-card vk-uses">
            {USES.map((d) => (
              <div key={d.day}>
                <div className="vk-day">{d.day}</div>
                {d.rows.map(([t, who, what, cost], i) => (
                  <div key={i} className="vk-use"><span className="vk-t">{t}</span><span className="vk-w">{who}</span><span className="vk-what">{what}</span><span className="vk-c">{cost ? `$${cost}` : ""}</span></div>
                ))}
              </div>
            ))}
          </div>
          <button className="vk-danger" onClick={() => remove(k.id)}>Remove key</button>
          <div className="vk-fine vk-center">It keeps working at {PROVIDERS[k.provider].name} until you revoke it there too.</div>
        </div>
      </div>
    );
  }
  return (
    <div className="vk-page">
      <Nav title="Keys" />
      <div className="vk-scroll">
        <div className="vk-lede">Your keys stay on this iPhone. Agents ask to use one; they never see it.</div>
        <div className="vk-card vk-list">
          {keys.map((x) => (
            <button key={x.id} className="vk-item" onClick={() => setOpen(x.id)}>
              <Mark p={x.provider} />
              <span className="vk-item-txt">
                <b>{x.name}</b>
                <span className="vk-sub">...{x.last4} · last used {x.used}</span>
                <Bar spent={x.spent} cap={x.cap} />
              </span>
              <span className="vk-cap">{money(x.spent)}<small>of {money(x.cap)}</small></span>
            </button>
          ))}
        </div>
        <button className="vk-btn" onClick={() => goAdd(null)}>Add a key</button>
        <div className="vk-fine vk-center">Keys go in here and nowhere else. Never in a chat, never in an agent&apos;s form.</div>
      </div>
    </div>
  );
}

function AddKey({ preset, onSave, onCancel }) {
  const [p, setP] = useState(preset || "fal");
  const [val, setVal] = useState("");
  const [name, setName] = useState("");
  const [cap, setCap] = useState(10);
  const [sync, setSync] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [saving, setSaving] = useState(false);
  const prov = PROVIDERS[p];
  const ok = prov.shape.test(val.trim());
  const bad = val.trim() && !ok;
  const scan = () => { setScanning(true); setTimeout(() => { setVal(prov.demo); setScanning(false); }, 900); };
  const save = () => {
    setSaving(true);
    setTimeout(() => onSave({ provider: p, name: name.trim() || `Personal ${prov.name}`, last4: val.trim().slice(-4), cap, sync }), 900);
  };
  return (
    <div className="vk-page vk-sheet">
      <div className="vk-grab" aria-hidden="true" />
      <Nav title="Add a key" back="Cancel" onBack={onCancel} />
      <div className="vk-scroll">
        <div className="vk-label">Provider</div>
        <div className="vk-seg" role="radiogroup" aria-label="Provider">
          {Object.entries(PROVIDERS).map(([k, x]) => (
            <button key={k} role="radio" aria-checked={k === p} className={k === p ? "on" : ""} onClick={() => { setP(k); setVal(""); }}>{x.name}</button>
          ))}
        </div>
        <button className="vk-link">Get a key at {prov.name} ↗</button>
        <div className="vk-fine">Opens {prov.name}&apos;s own key page in Safari. Sign in there, not here.</div>
        <div className="vk-label">Key</div>
        <div className={`vk-field ${bad ? "bad" : ok ? "good" : ""}`}>
          <input type="password" value={val} onChange={(e) => setVal(e.target.value)} placeholder={`Paste your ${prov.name} key`} autoComplete="off" spellCheck={false} aria-label={`${prov.name} key`} />
          <button className="vk-scan" onClick={scan} aria-label="Scan the key with the camera">{scanning ? "Reading..." : "Scan"}</button>
        </div>
        <div className={`vk-fine ${bad ? "vk-err" : ""}`}>{bad ? `That doesn't look like a ${prov.name} key (${prov.hint}).` : ok ? "Looks right. One test call goes from this phone straight to " + prov.name + "." : `Paste it, or scan it off your computer screen. Placeholder keys only here.`}</div>
        <div className="vk-label">Name</div>
        <div className="vk-field"><input value={name} onChange={(e) => setName(e.target.value)} placeholder={`Personal ${prov.name}`} aria-label="Name" /></div>
        <div className="vk-label">Monthly cap</div>
        <div className="vk-stepper">
          <button onClick={() => setCap(Math.max(1, cap - 5))} aria-label="Lower the cap">−</button>
          <b>{money(cap)} a month</b>
          <button onClick={() => setCap(cap + 5)} aria-label="Raise the cap">+</button>
        </div>
        <button className="vk-toggle" role="switch" aria-checked={sync} onClick={() => setSync(!sync)}>
          <span className={`vk-knob ${sync ? "on" : ""}`} aria-hidden="true" />
          <span>Also on my other Apple devices<small>iCloud Keychain, off by default</small></span>
        </button>
      </div>
      {saving ? <FaceId text="Face ID to save the key" /> : (
        <button className="vk-btn vk-foot" disabled={!ok} onClick={save}>Save to this iPhone</button>
      )}
    </div>
  );
}

function Ask({ nodes, agent, keys, goAdd, onEvent, grant }) {
  const has = keys.find((k) => k.provider === "fal");
  const [answer, setAnswer] = useState(null);
  const [confirming, setConfirming] = useState(null);
  const reply = (a) => {
    if (a === "no") { setAnswer(a); onEvent({ control: "key_ask", provider: "fal", answer: "declined" }); return; }
    setConfirming(a);
    setTimeout(() => {
      setConfirming(null); setAnswer(a);
      grant(has.id, { agent, for: "Draw your agent avatars", cap: 5, spent: 0, once: a === "once" });
      onEvent({ control: "key_ask", provider: "fal", answer: a === "once" ? "allowed once" : "allowed", handle: "vk_fal_3f9a", cap: 5 });
    }, 900);
  };
  const line = answer === "no" ? `[yui] Key access: fal not allowed.`
    : answer === "once" ? `[yui] Key access: fal allowed once for "Draw your agent avatars", handle vk_fal_3f9a.`
    : answer ? `[yui] Key access: fal allowed for "Draw your agent avatars", cap $5 a month, handle vk_fal_3f9a.` : null;
  return (
    <div className="vk-page">
      <div className="ahead vk-head"><Face name={agent} /><div><div className="nm">{agent}</div><div className="st">screen 1</div></div></div>
      <div className="vk-msgs">
        <div className="yl-me">Can you make avatars for my agents?</div>
        {nodes.map((n) => <div key={n.key} className="pg-node"><Render node={n} emit={(v) => onEvent({ id: n.id, preset: n.preset, ...v })} /></div>)}
        {line ? <div className="vk-heard"><span className="vk-sub">{agent} hears, never the key:</span><code>{line}</code></div> : null}
        {answer && answer !== "no" ? <div className="vk-status">{agent} is drawing...</div> : null}
      </div>
      {!answer ? (
        <div className="vk-ask" role="dialog" aria-label={`${agent} wants to use your fal key`}>
          <div className="vk-ask-top"><Face name={agent} size={40} /><span className="vk-arrow" aria-hidden="true">→</span><Mark p="fal" size={40} /></div>
          <div className="vk-ask-h">{agent} wants to use your fal key</div>
          <div className="vk-ask-for">“Draw your agent avatars”</div>
          <div className="vk-sub vk-center">About 4 images a week · cap $5 a month{has ? ` · from ${has.name}` : ""}</div>
          {has ? (
            confirming ? <FaceId text="Face ID to allow" /> : (
              <div className="vk-ask-btns">
                <button className="vk-btn" onClick={() => reply("allow")}>Allow</button>
                <button className="vk-btn vk-ghost" onClick={() => reply("once")}>Allow once</button>
                <button className="vk-btn vk-ghost" onClick={() => reply("no")}>Don&apos;t allow</button>
              </div>
            )
          ) : (
            <div className="vk-ask-btns">
              <div className="vk-sub vk-center">No fal key on this iPhone yet.</div>
              <button className="vk-btn" onClick={() => goAdd("fal")}>Add a fal key</button>
              <button className="vk-btn vk-ghost" onClick={() => reply("no")}>Don&apos;t allow</button>
            </div>
          )}
          <div className="vk-chrome">Drawn by Yui, not by {agent}. An agent can&apos;t show this.</div>
        </div>
      ) : null}
    </div>
  );
}

function Drawer({ agent, keys, revoke, goKeys }) {
  const grants = keys.flatMap((k) => k.grants.map((g) => ({ ...g, key: k })));
  const [who, setWho] = useState(grants.some((g) => g.agent === agent) ? agent : "Quill");
  const mine = grants.filter((g) => g.agent === who);
  const agents = [...new Set([agent, "Quill"])];
  return (
    <div className="vk-page">
      <div className="vk-tabs" role="tablist">{["Home", "Review", "Controls", "About"].map((t) => <span key={t} className={t === "Controls" ? "on" : ""}>{t}</span>)}</div>
      <div className="vk-seg vk-agents" role="radiogroup" aria-label="Agent">
        {agents.map((a) => <button key={a} role="radio" aria-checked={a === who} className={a === who ? "on" : ""} onClick={() => setWho(a)}><Face name={a} size={20} /> {a}</button>)}
      </div>
      <div className="vk-scroll">
        <div className="vk-label">Keys {who} may use</div>
        {mine.length ? mine.map((g) => (
          <div key={g.key.id} className="vk-card">
            <div className="vk-row"><span className="vk-who"><Mark p={g.key.provider} size={26} /> <b>{g.key.name}</b></span>{g.once ? <span className="vk-pill">once</span> : null}</div>
            <div className="vk-sub">For: {g.for}</div>
            <div className="vk-row"><span className="vk-sub">This month</span><b>{money(g.spent)} of {money(g.cap)}</b></div>
            <Bar spent={g.spent} cap={g.cap} />
            <button className="vk-danger" onClick={() => revoke(g.key.id, who)}>Revoke</button>
          </div>
        )) : (
          <div className="vk-card"><div className="vk-sub">{who} can&apos;t use any of your keys. When it needs one, it asks, and Yui shows you who wants what for.</div></div>
        )}
        <div className="vk-fine">Revoke works on the next call. {who} hears one line: the key was revoked.</div>
        <button className="vk-link" onClick={goKeys}>All keys in Settings ›</button>
      </div>
    </div>
  );
}

export function VaultDemo({ text, agent, view, setView, onEvent }) {
  const nodes = useMemo(() => nodesOf(text), [text]);
  const [keys, setKeys] = useState(START);
  const [open, setOpen] = useState(null);
  const [preset, setPreset] = useState(null);
  const [back, setBack] = useState("keys");
  const goAdd = (p) => { setPreset(p); setBack(view === "ask" ? "ask" : "keys"); setView("add"); };
  const save = (k) => {
    setKeys((ks) => [...ks, { id: `k${Date.now()}`, spent: 0, used: "never", grants: [], ...k }]);
    onEvent({ settings: "keys", added: k.provider, name: k.name, cap: k.cap, icloud: k.sync });
    setView(back);
  };
  const remove = (id) => { setKeys((ks) => ks.filter((k) => k.id !== id)); setOpen(null); onEvent({ settings: "keys", removed: id }); };
  const grant = (id, g) => setKeys((ks) => ks.map((k) => (k.id === id ? { ...k, grants: [...k.grants.filter((x) => x.agent !== g.agent), g] } : k)));
  const revoke = (id, who) => {
    setKeys((ks) => ks.map((k) => (k.id === id ? { ...k, grants: k.grants.filter((g) => g.agent !== who) } : k)));
    onEvent({ control: "key_revoke", agent: who, key: id });
  };
  return (
    <div className="vk-app">
      {view === "add" ? <AddKey key={`a:${preset}`} preset={preset} onSave={save} onCancel={() => setView(back)} />
        : view === "ask" ? <Ask nodes={nodes} agent={agent} keys={keys} goAdd={goAdd} onEvent={onEvent} grant={grant} />
        : view === "drawer" ? <Drawer agent={agent} keys={keys} revoke={revoke} goKeys={() => setView("keys")} />
        : <KeysList keys={keys} open={open} setOpen={setOpen} goAdd={goAdd} remove={remove} />}
    </div>
  );
}
