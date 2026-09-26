"use client";

// Encrypted sync (spec/SYNC.md, YUI-36 step 1): a mock of Settings > Sync, off
// by default. Turn it on, pair an iPad by QR, see the device list, remove one,
// and turn sync off, which deletes the relay's copy. The lines in the editor are
// Coach's reply: the tables they create are the ones that would sync. Nothing
// leaves the page, and the "relay" rows are made-up sealed bytes.

import { useEffect, useMemo, useState } from "react";
import { parse } from "../../lib/yl/yl.mjs";
import "./sync.css";

export const SYNC_VIEWS = [
  ["sync", "Settings > Sync"],
  ["pair", "Add a device"],
  ["devices", "Devices"],
  ["off", "Turn off"],
];

const LOOK = { Coach: "#ff6b3d", Penny: "#e8a33d", Quill: "#8b7cff" };
// Other agents' tables, so the list is not just the editor's.
const OTHERS = [
  { agent: "Penny", table: "meals", rows: 42 },
  { agent: "Quill", table: "crm", rows: 9 },
];
const CODE = "K7QM-2XRP-9DWA";

// Tables the editor's lines create, with how many rows they put.
function tablesOf(text, agent) {
  const out = new Map();
  try {
    for (const op of parse(text)) {
      if (op.op === "table") out.set(op.name, out.get(op.name) || 0);
      if (op.op === "put" && !op.delete && out.has(op.table)) out.set(op.table, out.get(op.table) + 1);
    }
  } catch { return []; }
  return [...out].map(([table, rows]) => ({ agent, table, rows }));
}

// Deterministic fake bytes, so the relay card looks the same every load.
function hex(seed, n) {
  let h = 2166136261 ^ seed, s = "";
  for (let i = 0; i < n; i++) { h = Math.imul(h ^ (h >>> 13), 16777619) >>> 0; s += (h & 255).toString(16).padStart(2, "0"); }
  return s;
}

function Face({ name, size = 26 }) {
  return <span className="sy-face" style={{ background: LOOK[name] || "var(--accent)", width: size, height: size }} aria-hidden="true">{name[0]}</span>;
}
function Nav({ title, back, onBack }) {
  return (
    <div className="sy-nav">
      {back ? <button className="sy-back" onClick={onBack}>‹ {back}</button> : <span />}
      <b>{title}</b>
      <span />
    </div>
  );
}
function FaceId({ text }) {
  return <div className="sy-faceid" role="status"><span aria-hidden="true">◉</span> {text}</div>;
}
function Toggle({ on, onClick, label, sub }) {
  return (
    <button className="sy-toggle" role="switch" aria-checked={on} onClick={onClick}>
      <span>{label}{sub ? <small>{sub}</small> : null}</span>
      <span className={`sy-knob ${on ? "on" : ""}`} aria-hidden="true" />
    </button>
  );
}
// A drawn QR: a seeded grid with the three finder squares. Not scannable.
function Qr() {
  const n = 25, cells = [];
  const finder = (x, y) => [[0, 0], [n - 7, 0], [0, n - 7]].some(([a, b]) => x >= a && x < a + 7 && y >= b && y < b + 7);
  const ring = (x, y) => [[0, 0], [n - 7, 0], [0, n - 7]].some(([a, b]) => {
    const dx = x - a, dy = y - b;
    return dx >= 0 && dx < 7 && dy >= 0 && dy < 7 && (dx === 0 || dx === 6 || dy === 0 || dy === 6 || (dx >= 2 && dx <= 4 && dy >= 2 && dy <= 4));
  });
  const bits = hex(36, 80);
  for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) {
    const on = finder(x, y) ? ring(x, y) : (parseInt(bits[(x * 7 + y * 13) % bits.length], 16) + x + y) % 3 === 0;
    if (on) cells.push(<rect key={`${x}-${y}`} x={x} y={y} width="1" height="1" />);
  }
  return <svg className="sy-qr" viewBox={`-2 -2 ${n + 4} ${n + 4}`} role="img" aria-label="Pairing QR code">{cells}</svg>;
}

function SyncPage({ on, tables, devices, turnOn, go, ops }) {
  const [busy, setBusy] = useState(false);
  const start = () => { setBusy(true); setTimeout(() => { setBusy(false); turnOn(); }, 900); };
  const rows = tables.reduce((a, t) => a + t.rows, 0);
  return (
    <div className="sy-page">
      <Nav title="Sync" />
      <div className="sy-scroll">
        <div className="sy-lede">{on ? "Your tables are on your devices, sealed on the way." : "Your agents' tables live on this iPhone only."}</div>
        <div className="sy-card">
          <Toggle on={on} onClick={on ? () => go("off") : start} label="Sync tables across my devices" sub={on ? `${devices.length} device${devices.length > 1 ? "s" : ""} · end to end encrypted` : "Off by default"} />
        </div>
        <div className="sy-label">What would sync</div>
        <div className="sy-card sy-list">
          {tables.map((t) => (
            <div key={`${t.agent}/${t.table}`} className="sy-item">
              <Face name={t.agent} />
              <span className="sy-item-txt"><b>{t.table}</b><span className="sy-sub">{t.agent}&apos;s table</span></span>
              <span className="sy-sub">{t.rows} row{t.rows === 1 ? "" : "s"}</span>
            </div>
          ))}
        </div>
        <div className="sy-fine">Only agent tables. Chats are already on every device you sign in on. Keys never leave the Keychain.</div>
        <div className="sy-label">What Yui&apos;s server holds</div>
        {on ? (
          <div className="sy-card sy-relay">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="sy-blob"><code>{hex(i + ops, 6)}…</code><span className="sy-sub">sealed · {512 * (1 + (i % 2))} B</span></div>
            ))}
            <div className="sy-fine">{ops} sealed changes. No table names, columns or values: only your devices hold the key. The server does see which agent, how much and when.</div>
          </div>
        ) : (
          <div className="sy-card"><div className="sy-sub">Nothing. {rows} rows in {tables.length} tables, all on this iPhone.</div></div>
        )}
      </div>
      {busy ? <FaceId text="Face ID to turn on sync" /> : on ? (
        <button className="sy-btn sy-foot" onClick={() => go("pair")}>Add a device</button>
      ) : (
        <button className="sy-btn sy-foot" onClick={start}>Turn on sync</button>
      )}
    </div>
  );
}

function Pair({ on, turnOn, addDevice, go, count }) {
  const [step, setStep] = useState("code");
  const [left, setLeft] = useState(120);
  useEffect(() => {
    if (!on || step !== "code") return undefined;
    const t = setInterval(() => setLeft((s) => (s > 0 ? s - 1 : 0)), 1000);
    return () => clearInterval(t);
  }, [on, step]);
  if (!on) {
    return (
      <div className="sy-page">
        <Nav title="Add a device" back="Sync" onBack={() => go("sync")} />
        <div className="sy-scroll">
          <div className="sy-lede">Sync is off, so there is nothing to pair yet.</div>
          <div className="sy-fine">Turning it on makes a key on this iPhone. A new device gets that key from here, sealed to it, never from Yui&apos;s server.</div>
        </div>
        <button className="sy-btn sy-foot" onClick={turnOn}>Turn on sync</button>
      </div>
    );
  }
  const add = () => { setStep("faceid"); setTimeout(() => { addDevice(); setStep("done"); }, 900); };
  return (
    <div className="sy-page">
      <Nav title="Add a device" back="Sync" onBack={() => go("sync")} />
      <div className="sy-scroll">
        {step !== "done" ? (
          <>
            <div className="sy-lede">On the iPad: Settings &gt; Sync &gt; Join with a code.</div>
            <div className="sy-qrbox"><Qr /></div>
            <div className="sy-code" aria-label="Or type this code">{CODE}</div>
            <div className="sy-fine sy-center">{left ? `Works once, for ${Math.floor(left / 60)}:${String(left % 60).padStart(2, "0")}.` : "This code ran out. Make a new one."} Same Yui account, no password.</div>
            {step !== "code" ? null : left ? <button className="sy-btn" onClick={() => setStep("ask")}>Scan it from the iPad</button>
              : <button className="sy-btn" onClick={() => setLeft(120)}>Make a new code</button>}
          </>
        ) : (
          <>
            <div className="sy-big" aria-hidden="true">✓</div>
            <div className="sy-lede sy-center">iPad is synced</div>
            <div className="sy-fine sy-center">It pulled {count} tables. The key reached it sealed to the iPad&apos;s own key; Yui&apos;s server only carried the box.</div>
            <button className="sy-btn" onClick={() => go("devices")}>See your devices</button>
          </>
        )}
      </div>
      {step === "ask" || step === "faceid" ? (
        <div className="sy-ask" role="dialog" aria-label="iPad wants to join">
          <div className="sy-ask-h">iPad wants to join</div>
          <div className="sy-ask-for">It will get every agent&apos;s tables.</div>
          <div className="sy-sub sy-center">iPad · signed in as you · just now</div>
          {step === "faceid" ? <FaceId text="Face ID to add iPad" /> : (
            <div className="sy-ask-btns">
              <button className="sy-btn" onClick={add}>Add iPad</button>
              <button className="sy-btn sy-ghost" onClick={() => { setStep("code"); setLeft(120); }}>Not this one</button>
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
}

function Devices({ on, devices, remove, go }) {
  const [confirm, setConfirm] = useState(null);
  const [note, setNote] = useState(null);
  const d = devices.find((x) => x.id === confirm);
  return (
    <div className="sy-page">
      <Nav title="Devices" back="Sync" onBack={() => go("sync")} />
      <div className="sy-scroll">
        {on ? (
          <>
            <div className="sy-card sy-list">
              {devices.map((x) => (
                <div key={x.id} className="sy-item">
                  <span className="sy-dev" aria-hidden="true">{x.kind === "iPad" ? "▭" : "▯"}</span>
                  <span className="sy-item-txt"><b>{x.name}</b><span className="sy-sub">{x.me ? "This device" : `Synced ${x.seen}`}</span></span>
                  {x.me ? null : <button className="sy-remove" onClick={() => setConfirm(x.id)}>Remove</button>}
                </div>
              ))}
            </div>
            {note ? <div className="sy-card sy-note" role="status">{note}</div> : null}
            {devices.length < 5 ? <button className="sy-btn sy-ghost" onClick={() => go("pair")}>Add a device</button> : null}
            <div className="sy-fine">Up to 5 devices. Removing one makes a new key on the rest, so it can&apos;t open anything written after. It keeps what it already had.</div>
          </>
        ) : (
          <>
            <div className="sy-lede">Sync is off. Only this iPhone has your tables.</div>
            <button className="sy-btn" onClick={() => go("sync")}>Go to Sync</button>
          </>
        )}
      </div>
      {d ? (
        <div className="sy-ask" role="dialog" aria-label={`Remove ${d.name}`}>
          <div className="sy-ask-h">Remove {d.name}?</div>
          <div className="sy-ask-for">It stops getting changes now.</div>
          <div className="sy-sub sy-center">The tables already on it stay there, behind its passcode.</div>
          <div className="sy-ask-btns">
            <button className="sy-btn sy-red" onClick={() => { remove(d.id); setConfirm(null); setNote(`${d.name} removed. New key made on this iPhone.`); }}>Remove {d.name}</button>
            <button className="sy-btn sy-ghost" onClick={() => setConfirm(null)}>Keep it</button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function TurnOff({ on, ops, turnOff, go }) {
  const [step, setStep] = useState(null);
  const [gone, setGone] = useState(0);
  const off = () => { setStep("faceid"); setTimeout(() => { setGone(ops); turnOff(); setStep("done"); }, 900); };
  if (step === "done") {
    return (
      <div className="sy-page">
        <Nav title="Turn off" back="Sync" onBack={() => go("sync")} />
        <div className="sy-scroll">
          <div className="sy-big" aria-hidden="true">✓</div>
          <div className="sy-lede sy-center">Removed from Yui&apos;s server</div>
          <div className="sy-fine sy-center">{gone} sealed changes deleted. Every device keeps its own tables. The server&apos;s backups roll off within 7 days.</div>
          <button className="sy-btn" onClick={() => go("sync")}>Back to Sync</button>
        </div>
      </div>
    );
  }
  if (!on) {
    return (
      <div className="sy-page">
        <Nav title="Turn off" back="Sync" onBack={() => go("sync")} />
        <div className="sy-scroll">
          <div className="sy-lede">Sync is already off. Nothing of yours is on Yui&apos;s server.</div>
          <button className="sy-btn" onClick={() => go("sync")}>Go to Sync</button>
        </div>
      </div>
    );
  }
  return (
    <div className="sy-page">
      <Nav title="Turn off" back="Sync" onBack={() => go("sync")} />
      <div className="sy-scroll">
        <div className="sy-lede">Sync is on.</div>
        <div className="sy-card"><div className="sy-row"><span>On Yui&apos;s server</span><b>{ops} sealed changes</b></div></div>
        <div className="sy-fine">Turning it off deletes all of them. Turning it on again makes a new key and uploads from this iPhone.</div>
      </div>
      <div className="sy-ask" role="dialog" aria-label="Turn off sync">
        <div className="sy-ask-h">Turn off sync?</div>
        <div className="sy-ask-for">Yui&apos;s server deletes its copy now.</div>
        <div className="sy-sub sy-center">Your tables stay on every device. Nothing on a phone is deleted.</div>
        {step === "faceid" ? <FaceId text="Face ID to turn off" /> : (
          <div className="sy-ask-btns">
            <button className="sy-btn sy-red" onClick={off}>Turn off and delete the copy</button>
            <button className="sy-btn sy-ghost" onClick={() => go("sync")}>Keep syncing</button>
          </div>
        )}
      </div>
    </div>
  );
}

export function SyncDemo({ text, agent, view, setView, onEvent }) {
  const tables = useMemo(() => [...tablesOf(text, agent), ...OTHERS], [text, agent]);
  const [on, setOn] = useState(false);
  const [devices, setDevices] = useState([{ id: "d1", name: "This iPhone", kind: "iPhone", me: true }]);
  const ops = 40 + tables.reduce((a, t) => a + t.rows, 0) * 3;
  const turnOn = () => { setOn(true); onEvent({ settings: "sync", on: true, tables: tables.length }); };
  const turnOff = () => {
    setOn(false);
    setDevices((ds) => ds.filter((d) => d.me));
    onEvent({ settings: "sync", on: false, relay: "deleted" });
  };
  const addDevice = () => {
    setDevices((ds) => (ds.some((d) => d.id === "d2") ? ds : [...ds, { id: "d2", name: "iPad", kind: "iPad", seen: "just now" }]));
    onEvent({ settings: "sync", paired: "iPad" });
  };
  const remove = (id) => { setDevices((ds) => ds.filter((d) => d.id !== id)); onEvent({ settings: "sync", removed: id, epoch: "new" }); };
  return (
    <div className="sy-app">
      {view === "pair" ? <Pair on={on} turnOn={turnOn} addDevice={addDevice} go={setView} count={tables.length} />
        : view === "devices" ? <Devices on={on} devices={devices} remove={remove} go={setView} />
        : view === "off" ? <TurnOff on={on} ops={ops} turnOff={turnOff} go={setView} />
        : <SyncPage on={on} tables={tables} devices={devices} turnOn={turnOn} go={setView} ops={ops} />}
    </div>
  );
}
