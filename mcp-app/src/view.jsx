// Yui screens as an MCP App (INT-7). Spec: spec/MCP.md "MCP App".
//
// yui-mcp serves this file as the resource ui://yui/screen, and yui_show names
// it in _meta.ui.resourceUri. A host that renders MCP Apps (Claude, ChatGPT,
// the ext-apps reference host) loads it in a sandboxed iframe next to the tool
// call and talks to it with JSON-RPC over postMessage (SEP-1865, 2026-01-26).
// The screen is drawn by the same React renderers as yuigui.com/playground.
//
// A tap goes back as the same event the phone sends: the view calls the
// app-only tool yui_tap, which writes the event row into the thread, and asks
// the host to hand the line to the model with ui/message. When the host takes
// the message, the row is written as handled, so yui_answers does not return
// it a second time. When it refuses, yui_answers picks the tap up as usual.
import { useCallback, useEffect, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import { apply, initialState, parse } from "../../site/lib/yl/yl.mjs";
import { Render, StepGroup, TABLES } from "../../site/app/playground/presets";
import { Group, groupNodes } from "../../site/app/playground/flows";
import { ScreenCtx } from "../../site/app/playground/science";
import { LiveSlot, Stage, StagePill } from "../../site/app/playground/stage";
import { echoFor, eventLine, relays } from "./events.mjs";

const PROTOCOL = "2026-01-26";
const APP = { name: "Yui", version: "0.1.0" };

// -- the postMessage channel ---------------------------------------------------

let nextId = 1;
const pending = new Map();
const listeners = new Map();

function post(msg) {
  window.parent.postMessage({ jsonrpc: "2.0", ...msg }, "*");
}

function request(method, params, timeout = 30000) {
  const id = nextId++;
  post({ id, method, params });
  return new Promise((resolve, reject) => {
    const t = setTimeout(() => { pending.delete(id); reject(new Error(`${method}: no answer`)); }, timeout);
    pending.set(id, { resolve: (r) => { clearTimeout(t); resolve(r); }, reject: (e) => { clearTimeout(t); reject(e); } });
  });
}

const notify = (method, params) => post({ method, params });
const on = (method, fn) => listeners.set(method, fn);

window.addEventListener("message", (e) => {
  if (e.source !== window.parent) return;
  const m = e.data;
  if (!m || m.jsonrpc !== "2.0") return;
  if (m.method === undefined && pending.has(m.id)) {
    const p = pending.get(m.id);
    pending.delete(m.id);
    if (m.error) p.reject(new Error(m.error.message || "error"));
    else p.resolve(m.result);
    return;
  }
  const fn = listeners.get(m.method);
  if (m.id !== undefined && m.id !== null) {
    // A request from the host: answer every one, even the ones we ignore.
    Promise.resolve(fn ? fn(m.params ?? {}) : m.method === "ping" ? {} : undefined).then(
      (result) => result === undefined
        ? post({ id: m.id, error: { code: -32601, message: `Method not found: ${m.method}` } })
        : post({ id: m.id, result }),
      (err) => post({ id: m.id, error: { code: -32000, message: String(err?.message || err) } }),
    );
  } else if (fn) fn(m.params ?? {});
});

// -- the screen ------------------------------------------------------------------

// Staged components (a timer, a deck) would open over everything else. In a
// chat the question under them matters more, so they start as the pill unless
// they are all there is.
function build(text) {
  let s = initialState();
  for (const op of parse(text)) s = apply(s, op);
  const inline = Object.values(s.screens).flat().some((n) => !n.stage);
  return inline ? { ...s, stage: false } : s;
}

function unfence(s) {
  const m = String(s || "").match(/```(?:yui)?[^\n]*\n([\s\S]*?)```/);
  return (m ? m[1] : String(s || "")).trim();
}

function Screen({ lines, agent, light, send }) {
  const [state, setState] = useState(() => build(lines));
  const [live, setLive] = useState({});
  const onLive = useCallback((k, t) => setLive((l) => (l[k] === t ? l : { ...l, [k]: t })), []);
  const dispatch = useCallback((op) => setState((s) => apply(s, op)), []);
  const emits = useRef(new Map());
  const sendRef = useRef(send);
  sendRef.current = send;
  const emit = useCallback((node) => {
    const k = `${node.key}:${node.preset}:${node.seq}`;
    if (!emits.current.has(k)) emits.current.set(k, (value) => sendRef.current({ id: node.id, preset: node.preset, ...value }));
    return emits.current.get(k);
  }, []);

  const shown = state.focus === "full" ? "1" : state.focus;
  const nodes = (state.screens[shown] || []).filter((n) => !n.stage);
  const staged = Object.values(state.screens).flat().filter((n) => n.stage).sort((a, b) => a.seq - b.seq);
  const renderNode = (n) => n.steps ? (
    <div key={`${n.key}:steps`} className="pg-node"><StepGroup nodes={n.steps} emitFor={emit} /></div>
  ) : n.group ? (
    <div key={`${n.key}:${n.group.preset}`} className="pg-node"><Group g={n} emitFor={emit} Render={Render} /></div>
  ) : (
    <div key={`${n.key}:${n.preset}`} className="pg-node"><Render node={n} emit={emit(n)} /></div>
  );
  const stageOpen = state.stage && staged.length > 0;

  return (
    <div className={`screen ${light ? "light" : ""} ${stageOpen ? "staged" : ""}`}>
      <div className="pg-screen">
        <ScreenCtx.Provider value={{ nodes, tables: TABLES, agent, screen: shown, dispatch }}>
          {groupNodes(nodes).map(renderNode)}
          {staged.length ? <StagePill nodes={staged} live={live} onOpen={() => setState((s) => ({ ...s, stage: true }))} /> : null}
        </ScreenCtx.Provider>
      </div>
      <Stage open={stageOpen} onClose={() => setState((s) => ({ ...s, stage: false }))} agent={agent}>
        <ScreenCtx.Provider value={{ nodes: staged, tables: TABLES, agent, screen: "full", dispatch }}>
          {groupNodes(staged).map((n) => <LiveSlot key={`${n.key}:slot`} id={n.key} onLive={onLive}>{renderNode(n)}</LiveSlot>)}
        </ScreenCtx.Provider>
      </Stage>
    </div>
  );
}

function App() {
  const [lines, setLines] = useState(null);
  const [screen, setScreen] = useState(null); // {screen_id, agent} from the tool result
  const [light, setLight] = useState(false);
  const [status, setStatus] = useState(null);
  const [error, setError] = useState(null);
  const screenRef = useRef(null);
  screenRef.current = screen;
  const queue = useRef([]); // taps before the tool result named the screen

  const theme = (ctx) => { if (ctx?.theme) setLight(ctx.theme === "light"); };

  const deliver = useCallback(async (ev) => {
    const s = screenRef.current;
    const echo = echoFor(ev);
    if (!relays(ev, echo)) return; // quiet: stays on this screen, like on the phone
    if (!s) { queue.current.push(ev); return; }
    const line = eventLine(ev);
    setStatus({ text: `Sending: ${echo ?? line}` });
    let told = false;
    try {
      const r = await request("ui/message", { role: "user", content: [{ type: "text", text: line }] });
      told = !r?.isError;
    } catch { /* host said no: the model reads it with yui_answers */ }
    try {
      const r = await request("tools/call", {
        name: "yui_tap",
        arguments: { screen_id: s.screen_id, event: ev, echo: echo ?? undefined, told_model: told },
      });
      if (r?.isError) throw new Error(r.content?.[0]?.text || "refused");
      setStatus({ text: `Sent: ${echo ?? line}`, ok: true });
    } catch (e) {
      setStatus({ text: `Not sent: ${e.message}`, bad: true });
    }
  }, []);

  useEffect(() => {
    on("ui/notifications/tool-input", (p) => {
      if (typeof p.arguments?.lines === "string") setLines((l) => l ?? unfence(p.arguments.lines));
    });
    on("ui/notifications/tool-result", (p) => {
      const sc = p.structuredContent;
      if (p.isError || !sc?.screen_id) {
        setError(p.content?.find((c) => c.type === "text")?.text || "Yui did not take this screen.");
        return;
      }
      if (typeof sc.lines === "string") setLines(sc.lines);
      setScreen({ screen_id: sc.screen_id, agent: sc.agent || "Yui" });
    });
    on("ui/notifications/tool-cancelled", () => setError("The screen was cancelled."));
    on("ui/notifications/host-context-changed", theme);
    on("ui/resource-teardown", () => ({}));
    request("ui/initialize", {
      appInfo: APP,
      appCapabilities: { availableDisplayModes: ["inline"] },
      protocolVersion: PROTOCOL,
    }).then((r) => {
      theme(r?.hostContext);
      notify("ui/notifications/initialized", {});
    }).catch((e) => setError(`This host did not answer: ${e.message}`));
  }, []);

  // Taps made before the screen id arrived go out once it does.
  useEffect(() => {
    if (!screen || !queue.current.length) return;
    const q = queue.current;
    queue.current = [];
    q.forEach(deliver);
  }, [screen, deliver]);

  // Flexible height: tell the host how tall we are.
  useEffect(() => {
    let last = "";
    const ro = new ResizeObserver(() => {
      // The content, not <html>: its scrollHeight never drops below the frame.
      const r = document.getElementById("root").getBoundingClientRect();
      const size = { width: Math.ceil(r.width), height: Math.ceil(r.height) };
      const k = `${size.width}x${size.height}`;
      if (k !== last) { last = k; notify("ui/notifications/size-changed", size); }
    });
    ro.observe(document.getElementById("root"));
    return () => ro.disconnect();
  }, []);

  const agent = screen?.agent || "Yui";
  return (
    <div className={`yui-embed phone ${light ? "is-light" : ""}`}>
      <div className="yui-head">
        <span className="yui-mark" aria-hidden="true">Y</span>
        <span className="yui-who">{agent}</span>
        <span className="yui-where">{screen ? "also on your phone" : lines ? "sending to Yui..." : ""}</span>
      </div>
      {error ? <div className="yui-note bad">{error}</div>
        : lines ? <Screen key={lines} lines={lines} agent={agent} light={light} send={deliver} />
        : <div className="yui-note">Drawing the screen...</div>}
      {status ? <div className={`yui-note ${status.bad ? "bad" : status.ok ? "ok" : ""}`} role="status">{status.text}</div> : null}
    </div>
  );
}

createRoot(document.getElementById("root")).render(<App />);
