"use client";
// Voice in the composer and the stage's bar (YUI-244): the app's push to talk and hands-free
// (Chat/PushToTalk.swift, Chat/HandsFree.swift) on the browser's recognizer (lib/web/voice.mjs).
//   hold the mic and speak, let go to send, slide left to throw it away (touch and mouse)
//   tap the mic once: hands-free. It stays open between turns, a short quiet sends, the reply lands, it opens again.
//   Enter or Space on the focused mic is a tap (a keyboard cannot hold).
// Only the words are sent, as text. `send(words)` returns true when it went.
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createEndOfSpeech, createHandsFree, QUIET_LIMIT, READ_BEAT } from "../../lib/web/handsfree.mjs";
import { createListener, speechApi } from "../../lib/web/voice.mjs";

const HOLD_MS = 320;   // shorter than this is a tap
const CANCEL_PX = 70;  // slide this far left to cancel

export function useVoice({ send, busy, enabled = true }) {
  // Only ever rendered after mount (ThreadApp waits), so the browser can be asked right away: the stage opens on
  // the mic, not on the field it would show for the one render before this effect ran.
  const [supported, setSupported] = useState(() => !!speechApi());
  const [ui, setUi] = useState({ phase: "idle", words: "", levels: [], secs: 0, free: false, hf: "off", cancel: false, problem: "" });
  const ref = useRef({ listener: null, hf: createHandsFree(), eos: createEndOfSpeech(), t0: 0, x0: 0, mode: null, last: 0, spoke: 0, gen: 0 });
  const sendRef = useRef(send);
  sendRef.current = send;
  const patch = useCallback((p) => setUi((u) => ({ ...u, ...p })), []);
  useEffect(() => { setSupported(!!speechApi()); }, []);

  const closeListener = useCallback(() => { const r = ref.current; r.listener?.cancel(); r.listener = null; }, []);

  // ---- one listening session ----
  const begin = useCallback(async (mode) => {
    const r = ref.current;
    closeListener();
    const gen = ++r.gen;
    r.mode = mode; r.eos.reset(); r.t0 = Date.now(); r.spoke = Date.now();
    const l = createListener({
      onTick: ({ levels, loud, words, at }) => {
        if (gen !== r.gen) return;
        if (words) r.spoke = at;
        patch({ levels, words, secs: Math.floor((at - r.t0) / 1000) });
        if (r.mode === "free" && r.hf.state === "listening") {
          if (r.eos.feed(words, loud, at)) act(r.hf.handle("endOfSpeech"));
          else if (at - r.spoke > QUIET_LIMIT) act(r.hf.handle("quietTooLong"));
        }
      },
      onError: (kind) => { if (gen !== r.gen) return; closeListener(); r.hf.handle("stop"); patch({ phase: kind === "denied" ? "denied" : "failed", hf: "off", free: false, words: "", levels: [], problem: kind }); },
      onEnd: (words) => {
        // The browser closed it on its own after a long quiet.
        if (gen !== r.gen) return;
        if (r.mode === "free" && r.hf.state === "listening") act(r.hf.handle("endOfSpeech"), words);
        else if (r.mode === "hold") settleHold(words);
      },
    });
    r.listener = l;
    patch({ phase: "listening", words: "", levels: [], secs: 0, cancel: false, problem: "" });
    try { await l.start(); } catch (e) {
      if (gen !== r.gen) return;
      r.listener = null;
      r.hf.handle("micFailed", { denied: e.message === "denied" });
      patch({ phase: e.message === "denied" ? "denied" : "failed", free: false, hf: r.hf.state, problem: e.message });
      return;
    }
    if (mode === "free") { r.hf.handle("micOpen"); patch({ hf: r.hf.state, free: true }); }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const idle = useCallback(() => patch({ phase: "idle", words: "", levels: [], secs: 0, cancel: false, free: false, hf: ref.current.hf.state }), [patch]);

  const settleHold = useCallback(async (known) => {
    const r = ref.current;
    const l = r.listener;
    r.listener = null; r.gen++;
    const words = (l ? await l.finish() : known || "").trim();
    r.mode = null;
    idle();
    if (words) sendRef.current(words);
  }, [idle]);

  // The hands-free loop's effects (HandsFree.Effect).
  const act = useCallback(async (fx, known = null) => {
    const r = ref.current;
    if (!fx) { patch({ hf: r.hf.state }); return; }
    if (fx.do === "openMic") { patch({ hf: r.hf.state }); await begin("free"); return; }
    if (fx.do === "closeMic") { closeListener(); r.gen++; r.mode = null; patch({ hf: r.hf.state, phase: r.hf.state === "off" ? "idle" : "idle", words: "", levels: [], free: false }); return; }
    if (fx.do === "finishMic") {
      patch({ hf: r.hf.state });
      const l = r.listener; r.listener = null;
      const words = l ? await l.finish() : known || "";
      r.gen++;
      patch({ phase: "idle", words: "", levels: [], free: true });
      act(r.hf.handle("heard", words), words);
      return;
    }
    if (fx.do === "send") {
      patch({ hf: r.hf.state });
      const ok = sendRef.current(fx.words);
      act(r.hf.handle(ok ? "sent" : "sendFailed"));
      return;
    }
    if (fx.do === "readBeat") { patch({ hf: r.hf.state }); setTimeout(() => act(r.hf.handle("readDone")), READ_BEAT); }
  }, [begin, closeListener, patch]);

  // The agent's reply landed: the loop reads it for a beat, then the mic opens again.
  const wasBusy = useRef(false);
  useEffect(() => {
    if (wasBusy.current && !busy && (ref.current.hf.state === "waiting" || ref.current.hf.state === "sending")) act(ref.current.hf.handle("replyLanded"));
    wasBusy.current = busy;
  }, [busy, act]);

  const stopHandsFree = useCallback(() => {
    const r = ref.current;
    const fx = r.hf.handle("stop");
    if (fx) act(fx); else { r.gen++; closeListener(); r.mode = null; }
    idle();
  }, [act, closeListener, idle]);
  const discard = useCallback(() => {
    const r = ref.current;
    r.gen++; closeListener(); r.mode = null;
    if (r.hf.on) r.hf.handle("stop");
    idle();
  }, [closeListener, idle]);
  useEffect(() => () => { ref.current.gen++; ref.current.listener?.cancel(); }, []);

  // ---- the mic button ----
  const mic = useMemo(() => ({
    onPointerDown(e) {
      if (!enabled || (e.pointerType === "mouse" && e.button !== 0)) return;
      const r = ref.current;
      if (r.hf.on) { stopHandsFree(); return; } // tapping an open mic closes it
      e.currentTarget.setPointerCapture?.(e.pointerId);
      r.x0 = e.clientX; r.holding = true;
      begin("hold");
    },
    onPointerMove(e) {
      const r = ref.current;
      if (!r.holding) return;
      const cancel = e.clientX - r.x0 < -CANCEL_PX;
      setUi((u) => (u.cancel === cancel ? u : { ...u, cancel }));
    },
    onPointerUp(e) {
      const r = ref.current;
      if (!r.holding) return;
      r.holding = false;
      if (e.clientX - r.x0 < -CANCEL_PX) { discard(); return; }
      if (Date.now() - r.t0 < HOLD_MS) {
        // A tap: hands-free. The session is already open, so it becomes the loop's listening state.
        r.mode = "free"; r.hf.handle("tap"); r.hf.handle("micOpen"); r.eos.reset(); r.spoke = Date.now();
        patch({ free: true, hf: r.hf.state, cancel: false });
        return;
      }
      settleHold();
    },
    onPointerCancel() { const r = ref.current; if (r.holding) { r.holding = false; discard(); } },
    // The keyboard cannot hold: Enter or Space (a click with no pointer) is a tap.
    onClick(e) {
      if (e.detail !== 0 || !enabled) return;
      const r = ref.current;
      if (r.hf.on || r.listener) stopHandsFree(); else { r.hf.handle("tap"); begin("free"); }
    },
    onContextMenu(e) { e.preventDefault(); }, // a long press on touch must not open the browser's menu
  }), [begin, discard, enabled, patch, settleHold, stopHandsFree]);

  return { supported, ...ui, listening: ui.phase === "listening", handsFree: ui.free || ui.hf !== "off", mic, discard, stopHandsFree };
}
