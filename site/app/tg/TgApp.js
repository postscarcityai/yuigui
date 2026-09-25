"use client";
// The Mini App's screen. Drawn by the playground's renderers, like the app and /embed.
// In Telegram it takes the chat's theme colors, and a tap goes back as the same
// `[yui] ...` line the phone sends: POSTed to the bot's bridge (with Telegram's
// signed initData) when the link names one, else WebApp.sendData.
import { useCallback, useEffect, useRef, useState } from "react";
import Script from "next/script";
import { apply, initialState, parse } from "../../lib/yl/yl.mjs";
import { decodeYL } from "../../lib/share-code.mjs";
import { Render, StepGroup, TABLES } from "../playground/presets";
import { Group, groupNodes } from "../playground/flows";
import { ScreenCtx } from "../playground/science";
import { LiveSlot, Stage, StagePill } from "../playground/stage";
import { echoFor, eventLine, relays } from "../../../mcp-app/src/events.mjs";
import "../playground/flows.css";

function build(text) {
  let s = initialState();
  for (const op of parse(text)) s = apply(s, op);
  // In a chat the question under a timer matters more: staged parts start as the pill
  // unless they are all there is (same rule as the MCP App).
  const inline = Object.values(s.screens).flat().some((n) => !n.stage);
  return inline ? { ...s, stage: false } : s;
}

// Telegram's theme (core.telegram.org/bots/webapps#themeparams) onto the screen's colors.
function themeVars(tp) {
  if (!tp) return {};
  const v = {};
  if (tp.bg_color) { v["--screen-bg"] = tp.bg_color; v["--tg-bg"] = tp.bg_color; }
  if (tp.text_color) { v["--text"] = tp.text_color; v["--yl-ink"] = tp.text_color; }
  if (tp.hint_color) { v["--muted"] = tp.hint_color; v["--yl-ink2"] = tp.hint_color; }
  if (tp.button_color) v["--accent"] = tp.button_color;
  if (tp.button_text_color) v["--tg-button-text"] = tp.button_text_color;
  if (tp.secondary_bg_color) { v["--panel"] = tp.secondary_bg_color; v["--tg-bg2"] = tp.secondary_bg_color; }
  if (tp.section_separator_color) v["--tg-line"] = tp.section_separator_color;
  return v;
}

function Screen({ yl, agent, light, send, vars }) {
  const [state, setState] = useState(() => build(yl));
  const [live, setLive] = useState({});
  const onLive = useCallback((k, t) => setLive((l) => (l[k] === t ? l : { ...l, [k]: t })), []);
  const dispatch = useCallback((op) => setState((s) => apply(s, op)), []);
  const emits = useRef(new Map());
  const sendRef = useRef(send);
  sendRef.current = send;
  const emit = useCallback((node) => {
    const k = `${node.key}:${node.preset}:${node.seq}`;
    if (!emits.current.has(k)) emits.current.set(k, (value) => sendRef.current({ id: node.id, preset: node.preset, ...value, ...(node.saved ? { saved: node.saved } : {}) }));
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
    <div className={`screen ${light ? "light" : ""} ${stageOpen ? "staged" : ""}`} style={vars}>
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

export default function TgApp({ yl: fromLink, agent, bridge }) {
  const [tg, setTg] = useState(null); // window.Telegram.WebApp, once its script ran
  const [yl, setYl] = useState(fromLink);
  const [light, setLight] = useState(false);
  const [vars, setVars] = useState({});
  const [status, setStatus] = useState(null);
  // Drawn after mount, like /embed: games shuffle and clocks tick, so a server copy never matches.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const hook = useCallback(() => {
    const w = typeof window !== "undefined" ? window.Telegram?.WebApp : null;
    if (!w || tg) return;
    setTg(w);
  }, [tg]);

  useEffect(() => { hook(); }, [hook]);

  useEffect(() => {
    if (!tg) return;
    const theme = () => {
      setLight(tg.colorScheme === "light");
      setVars(themeVars(tg.themeParams));
      try {
        if (tg.themeParams?.bg_color) { tg.setHeaderColor?.(tg.themeParams.bg_color); tg.setBackgroundColor?.(tg.themeParams.bg_color); }
      } catch { /* older clients */ }
    };
    theme();
    tg.onEvent?.("themeChanged", theme);
    tg.ready?.();
    tg.expand?.();
    // Opened by a t.me/<bot>/<app>?startapp=<code> link instead of a button.
    const sp = tg.initDataUnsafe?.start_param;
    if (!fromLink && sp) decodeYL(sp).then((t) => t && setYl(t));
    return () => tg.offEvent?.("themeChanged", theme);
  }, [tg, fromLink]);

  // Outside Telegram, follow the device.
  useEffect(() => {
    if (tg || typeof window === "undefined") return;
    const m = window.matchMedia("(prefers-color-scheme: light)");
    setLight(m.matches);
  }, [tg]);

  const deliver = useCallback(async (ev) => {
    const echo = echoFor(ev);
    if (!relays(ev, echo)) return; // quiet: stays on this screen, like on the phone
    const line = eventLine(ev);
    const said = echo ?? "Done";
    tg?.HapticFeedback?.impactOccurred?.("light");
    if (!tg?.initData) { setStatus({ text: `Open this in Telegram to send "${said}".` }); return; }
    if (bridge) {
      setStatus({ text: `Sending "${said}"...` });
      try {
        const r = await fetch(bridge, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ initData: tg.initData, line, event: ev }) });
        if (!r.ok) throw new Error(String(r.status));
        setStatus({ text: `Sent "${said}".`, ok: true });
      } catch {
        setStatus({ text: `Not sent. Try again in a moment.`, bad: true });
      }
      return;
    }
    try {
      tg.sendData(line); // closes the Mini App; the bot gets web_app_data
    } catch {
      setStatus({ text: "This bot has not set up taps from here yet. Answer in the chat.", bad: true });
    }
  }, [tg, bridge]);

  useEffect(() => {
    const t = light ? "light" : "dark";
    document.documentElement.dataset.theme = t;
    document.documentElement.style.colorScheme = t;
  }, [light]);

  return (
    <div className={`tg-root ${light ? "is-light" : ""} ${tg ? "in-tg" : ""}`} style={vars}>
      <Script src="https://telegram.org/js/telegram-web-app.js" strategy="afterInteractive" onLoad={hook} />
      <div className="tg-head">
        <span className="tg-mark" aria-hidden="true">Y</span>
        <span className="tg-who">{agent}</span>
        <span className="tg-where">on Yui</span>
      </div>
      {!mounted ? <div className="tg-note">Drawing the screen...</div>
        : yl ? <Screen key={yl} yl={yl} agent={agent} light={light} send={deliver} vars={vars} />
        : <div className="tg-note">Nothing to show here yet. Screens open from a Yui button in a Telegram chat.</div>}
      {status ? <div className={`tg-note ${status.bad ? "bad" : status.ok ? "ok" : ""}`} role="status">{status.text}</div> : null}
    </div>
  );
}
