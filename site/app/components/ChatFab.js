"use client";
// Yui in the bubble (SITE-64, SITE-65, SITE-66): a chat at the bottom right of every page, no account.
// Talks to /api/chat, which answers, searches the site, can take the visitor to a page, and writes down
// what they want. After a few turns Cloudflare Turnstile checks for a person once. The conversation
// stays in this browser's localStorage so it survives page loads; the server keeps its own copy.
// SITE-66: it opens full screen first, like the Yui app. On a phone it is the whole screen; on a
// computer a full-height, phone-shaped layer over the dimmed page. Every answer plays on the stage,
// one line and one picture at a time (ChatStage, spec/YL.md section 5, Stage first), and the chat is
// the record, top right. The big mic talks through the Web Speech API where the browser has it, and
// T types. The stage moves like the app's (stage motion, lib/yl/motion.mjs). Opening it turns the
// site dark (the moon button's switch, not saved) and closing it puts the visitor's own choice back.
// SITE-67: it opens on feedback first: what they like or not, the pitch, how to help, or just a demo.
import dynamic from "next/dynamic";
import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import links from "../../content/links.json";
import { HELLO, SHARE_URL, STARTERS } from "../../lib/chat/feedback.mjs";
import { splitReply, tapLabel, tapLine } from "../../lib/chat/lines.mjs";
import { micLine } from "../../lib/chat/stage.mjs";
import { motionLook, motionVars, stageMood } from "../../lib/yl/motion.mjs";
import { echoFor, relays } from "../../../mcp-app/src/events.mjs";
import { savedUtm, trackCta } from "../../lib/track.mjs";
import "../playground/stagemotion.css";
import "./chat.css";

const Screen = dynamic(() => import("./ChatScreen"), { ssr: false, loading: () => <div className="yc-wait">Drawing...</div> });
const StageAnswer = dynamic(() => import("./ChatStage"), { ssr: false, loading: () => null });

const KEY = "yui-chat-v1";
const OPEN = "yui-chat-open";   // sessionStorage: reopen on reload in this tab only
const YUI = "#FF7E8A";

// Outside links only to places Yui lives. Anything else shows as plain text.
const SAFE = /^https:\/\/(www\.)?(yuigui\.com|postscarcity\.ai|testflight\.apple\.com|github\.com\/postscarcityai)(\/|$)/;
const load = () => { try { return JSON.parse(localStorage.getItem(KEY) || "null"); } catch { return null; } };
const save = (v) => { try { localStorage.setItem(KEY, JSON.stringify(v)); } catch {} };

// The site goes dark while the chat is open. The visitor's own choice (the moon button's
// `yui-theme`) is never written here, so closing reads it back.
function theirTheme() { try { return localStorage.getItem("yui-theme") === "dark" ? "dark" : "light"; } catch { return "light"; } }
function setTheme(t) { document.documentElement.dataset.theme = t; }

// Replies are plain text with [links](/path), **bold** and "- " lists. Drawn as elements, never as HTML.
function Inline({ text, go }) {
  const out = [];
  const re = /\[([^\]]+)\]\(([^)\s]+)\)|\*\*([^*]+)\*\*/g;
  let at = 0, m;
  while ((m = re.exec(text))) {
    if (m.index > at) out.push(text.slice(at, m.index));
    if (m[3]) out.push(<strong key={m.index}>{m[3]}</strong>);
    else if (m[2].startsWith("/") && !m[2].startsWith("//")) out.push(<a key={m.index} href={m[2]} onClick={(e) => { e.preventDefault(); go(m[2]); }}>{m[1]}</a>);
    else if (SAFE.test(m[2])) out.push(<a key={m.index} href={m[2]} target="_blank" rel="noopener noreferrer">{m[1]}</a>);
    else out.push(m[1]);
    at = re.lastIndex;
  }
  if (at < text.length) out.push(text.slice(at));
  return out;
}
function Text({ text, go }) {
  const blocks = [];
  for (const line of text.split("\n")) {
    const item = line.match(/^\s*[-*]\s+(.*)$/);
    const last = blocks[blocks.length - 1];
    if (item) (last?.list ? last.items : (blocks.push({ list: true, items: [] }), blocks[blocks.length - 1].items)).push(item[1]);
    else if (line.trim()) blocks.push({ p: line });
  }
  return blocks.map((b, i) => (b.list
    ? <ul key={i}>{b.items.map((t, j) => <li key={j}><Inline text={t} go={go} /></li>)}</ul>
    : <p key={i}><Inline text={b.p} go={go} /></p>));
}

let turnstileLoading = null;
function loadTurnstile() {
  if (window.turnstile) return Promise.resolve(window.turnstile);
  turnstileLoading ||= new Promise((resolve, reject) => {
    const s = document.createElement("script");
    s.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
    s.async = true;
    s.onload = () => resolve(window.turnstile);
    s.onerror = () => { turnstileLoading = null; reject(new Error("turnstile")); };
    document.head.appendChild(s);
  });
  return turnstileLoading;
}

function Check({ siteKey, onToken }) {
  const box = useRef(null), cb = useRef(onToken);
  const [failed, setFailed] = useState(false);
  cb.current = onToken;
  useEffect(() => {
    let id = null, live = true;
    loadTurnstile().then((t) => {
      if (!live || !box.current) return;
      id = t.render(box.current, { sitekey: siteKey, theme: document.documentElement.dataset.theme === "dark" ? "dark" : "light", callback: (t) => cb.current(t), "error-callback": () => setFailed(true) });
    }).catch(() => setFailed(true));
    return () => { live = false; try { if (id !== null) window.turnstile?.remove(id); } catch {} };
  }, [siteKey]);
  return (
    <div className="yc-card">
      <p><strong>One quick check</strong> that you're a person, then we keep talking.</p>
      <div ref={box} className="yc-turnstile" />
      {failed && <p className="yc-err">The check would not load. Reload the page and try again.</p>}
    </div>
  );
}

// One answer in the record: its text and its screens, drawn in place. A tap on Play puts it back on the stage.
function Answer({ content, go, onTap, live, onPlay }) {
  const parts = splitReply(content);
  return (
    <div className="yc-answer">
      {parts.map((p, i) => (
        <div key={i} className={p.yl ? "yc-part yc-part-screen" : "yc-part yc-part-text"}>
          {p.yl ? <Screen yl={p.yl} onTap={live ? onTap : undefined} /> : <Text text={p.text} go={go} />}
        </div>
      ))}
      <button className="yc-play" onClick={onPlay}>Play on the stage</button>
    </div>
  );
}

// The bubble: Yui's mark on a soft shape that floats and slowly changes (the mark is brand/yui-mark-y-ink.png).
function Fab({ open, onClick }) {
  return (
    <button className={`yc-fab${open ? " is-open" : ""}`} onClick={onClick} aria-label={open ? "Close chat" : "Chat with Yui"} aria-expanded={open}>
      <span className="yc-blob yc-blob-b" aria-hidden="true" />
      <span className="yc-blob yc-blob-a" aria-hidden="true" />
      <span className="yc-mark" aria-hidden="true" />
      <span className="yc-close" aria-hidden="true" />
    </button>
  );
}

// The mark in Yui's color, the one thing that moves (stage motion): it breathes, turns, sweeps, bursts.
function Presence({ mood, flavor }) {
  return (
    <div className={`mo-presence m-${mood} ${flavor ? `f-${flavor}` : ""}`} aria-hidden="true">
      <span className="mo-halo" />
      <span className="mo-sweep" />
      <span className="mo-orb"><i /><i /><i /></span>
      <span className="mo-spark">{Array.from({ length: 8 }, (_, i) => <b key={i} style={{ "--i": i }} />)}</span>
    </div>
  );
}

const MicIcon = () => <svg viewBox="0 0 24 24" aria-hidden="true"><rect x="8.5" y="3" width="7" height="12" rx="3.5" /><path d="M5.5 11.5a6.5 6.5 0 0 0 13 0M12 18v3" fill="none" strokeWidth="2" strokeLinecap="round" /></svg>;
const RecordIcon = () => <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 5.5h14a1.5 1.5 0 0 1 1.5 1.5v8a1.5 1.5 0 0 1-1.5 1.5H10l-4 3v-3H5A1.5 1.5 0 0 1 3.5 15V7A1.5 1.5 0 0 1 5 5.5z" strokeWidth="2" fill="none" strokeLinejoin="round" /></svg>;

// Voice to text: the Web Speech API (Chrome, Edge, Safari). Firefox has none, so the chat types.
function speechApi() {
  if (typeof window === "undefined") return null;
  return window.SpeechRecognition || window.webkitSpeechRecognition || null;
}

function useReduced() {
  const [r, setR] = useState(false);
  useEffect(() => {
    const m = window.matchMedia("(prefers-reduced-motion: reduce)");
    const on = () => setR(m.matches);
    on();
    m.addEventListener("change", on);
    return () => m.removeEventListener("change", on);
  }, []);
  return r;
}

export default function ChatFab() {
  const router = useRouter();
  const path = usePathname() || "/";
  const [open, setOpen] = useState(false);
  const [msgs, setMsgs] = useState([]);           // { role: "user" | "assistant", content, label? } plus { card } rows
  const [busy, setBusy] = useState(false);
  const [draft, setDraft] = useState("");
  const [verify, setVerify] = useState(null);     // { siteKey, text, label } while Turnstile is up
  const [error, setError] = useState("");
  const [playing, setPlaying] = useState(-1);     // index of the answer on the stage
  const [playKey, setPlayKey] = useState(0);      // bumps to replay from the top
  const [found, setFound] = useState(false);      // the beat between the reply landing and its first chunk
  const [said, setSaid] = useState("");           // the person's words, small at the top of the stage
  const [secs, setSecs] = useState(0);
  const [typing, setTyping] = useState(false);    // the text field is open
  const [record, setRecord] = useState(false);    // the chat record is up
  const [seen, setSeen] = useState(0);            // messages the record has shown
  const [voice, setVoice] = useState(false);      // this browser can hear
  const [listening, setListening] = useState(false);
  const [heard, setHeard] = useState("");
  const [blocked, setBlocked] = useState(false);
  const [toast, setToast] = useState("");         // one quiet line after a share
  const input = useRef(null), list = useRef(null), ready = useRef(false), rec = useRef(null), heardRef = useRef("");
  const reduced = useReduced();
  const look = useMemo(() => motionLook({ motion: "bouncy" }, null, reduced), [reduced]);

  useEffect(() => {
    const s = load();
    if (s?.msgs) { setMsgs(s.msgs); setSeen(s.msgs.length); }
    setVoice(!!speechApi());
    try { if (sessionStorage.getItem(OPEN) === "1" && window.innerWidth > 760) setOpen(true); } catch {}
    ready.current = true;
  }, []);
  useEffect(() => { if (ready.current) save({ msgs: msgs.slice(-60) }); }, [msgs]);
  useEffect(() => { if (ready.current) try { sessionStorage.setItem(OPEN, open ? "1" : "0"); } catch {} }, [open]);
  useEffect(() => { if (record) { setSeen(msgs.length); list.current?.scrollTo({ top: list.current.scrollHeight }); } }, [record, msgs]);
  useEffect(() => { if (typing) setTimeout(() => input.current?.focus(), 30); }, [typing]);
  // No voice here (Firefox): the field is the way in, so it starts open.
  useEffect(() => { if (open && !voice) setTyping(true); }, [open, voice]);
  // Thinking · 3s, like the app's working row.
  useEffect(() => {
    if (!busy) return undefined;
    const t0 = Date.now();
    setSecs(0);
    const t = setInterval(() => setSecs(Math.floor((Date.now() - t0) / 1000)), 250);
    return () => clearInterval(t);
  }, [busy]);
  // Esc closes the record, then the field, then the chat. Typing anywhere on the stage opens the field.
  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => {
      if (e.key === "Escape") {
        if (document.querySelector(".yc .yl-stage.open")) return;
        if (record) setRecord(false);
        else if (typing && voice) setTyping(false);
        else setOpen(false);
        return;
      }
      const tag = e.target?.tagName || "";
      if (!typing && !record && e.key.length === 1 && !e.metaKey && !e.ctrlKey && !e.altKey && !/^(INPUT|TEXTAREA|SELECT)$/.test(tag) && e.key !== " ") {
        setTyping(true);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, record, typing, voice]);
  // Dark while open; the visitor's own theme back on close. The page stops scrolling under it.
  useEffect(() => {
    if (!open) return undefined;
    setTheme("dark");
    document.documentElement.classList.add("yc-on");
    return () => { setTheme(theirTheme()); document.documentElement.classList.remove("yc-on"); };
  }, [open]);
  useEffect(() => () => { try { rec.current?.abort(); } catch {} }, []);

  const go = useCallback((p) => { router.push(p); setOpen(false); }, [router]);

  // text: what goes to Yui; label: what the visitor's words say on the stage and in the record.
  const send = useCallback(async (text, prior, label, event) => {
    const t = text.trim();
    if (!t || busy) return;
    setError("");
    setRecord(false);
    setSaid(label || t);
    const history = (prior || msgs).filter((m) => m.role && !m.card).map(({ role, content }) => ({ role, content }));
    if (!prior) setMsgs((m) => { setSeen(m.length + 1); return [...m, { role: "user", content: t, ...(label ? { label } : {}) }]; });
    setBusy(true);
    setPlaying(-1);
    try {
      const res = await fetch("/api/chat", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "say", text: t, event, path: window.location.pathname + window.location.hash, title: document.title, history: [{ role: "assistant", content: HELLO }, ...history], utm: savedUtm() }) });
      const data = await res.json().catch(() => ({}));
      if (data.verify) { setVerify({ siteKey: data.verify, text: t, label, event }); return; }
      if (!res.ok || !data.reply) { setError(data.error || "Yui can't answer right now. Try again in a minute."); return; }
      const cards = [];
      for (const a of data.actions || []) {
        if (a.type === "go") { cards.push({ card: "went", label: a.label || a.path, path: a.path }); setTimeout(() => go(a.path), 1800); }
      }
      setMsgs((m) => { setPlaying(m.length); setSeen(m.length + 1); return [...m, { role: "assistant", content: data.reply }, ...cards]; });
      setPlayKey((k) => k + 1);
      setFound(true);
      setTimeout(() => setFound(false), reduced ? 0 : 650);
    } catch {
      setError("Network error. Try again.");
    } finally { setBusy(false); }
  }, [busy, msgs, go, reduced]);

  // The share card (card@share, SITE-67): the page shares the site itself, no turn for Yui.
  useEffect(() => { if (!toast) return undefined; const t = setTimeout(() => setToast(""), 2600); return () => clearTimeout(t); }, [toast]);
  const share = useCallback(async () => {
    trackCta("chat-share", "chat");
    try {
      if (navigator.share) { await navigator.share({ title: "Yui", text: "Meet Yui, a generative user interface.", url: SHARE_URL }); return; }
    } catch (e) { if (e?.name === "AbortError") return; }
    try { await navigator.clipboard.writeText(SHARE_URL); setToast("Link copied. Paste it anywhere."); }
    catch { setToast(`Send them ${SHARE_URL.replace("https://", "")}`); }
  }, []);

  const tap = useCallback((ev) => {
    if (ev.id === "share" && ev.cta) { share(); return; }
    // The phone's rule: a quiet tap (a timer starting, a checklist tick, a loop playing) stays on the screen.
    // A sent flow (SITE-68) is one answer for the whole run of screens: it always goes to Yui.
    if (busy || (!relays(ev, echoFor(ev)) && !(ev.preset === "flow" && ev.flow))) return;
    if (ev.id === "contact" && ev.preset === "form") { trackCta("chat-contact", "chat"); send("[yui] contact form sent", undefined, "Sent my details", ev); }
    else send(tapLine(ev), undefined, tapLabel(ev), ev.preset === "plan" || ev.preset === "flow" ? ev : undefined);
  }, [busy, send, share]);

  // Several questions answered with one Send: a plan goes as one event, loose ones in line order.
  const answerAll = useCallback((events, label) => {
    if (busy || !events.length) return;
    send(events.map(tapLine).join("\n"), undefined, label, events.length === 1 ? events[0] : undefined);
  }, [busy, send]);

  const onToken = useCallback(async (token) => {
    const pending = verify;
    try {
      const res = await fetch("/api/chat", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "verify", token }) });
      const data = await res.json();
      if (!data.ok) { setError(data.error || "That check did not go through."); return; }
      setVerify(null);
      if (pending?.text) send(pending.text, msgs.slice(0, -1), pending.label, pending.event);
    } catch { setError("Network error. Try again."); }
  }, [verify, send, msgs]);

  const retry = () => {
    const last = [...msgs].reverse().find((m) => m.role === "user");
    if (!last) return setError("");
    send(last.content, msgs.slice(0, msgs.lastIndexOf(last)), last.label);
  };

  // The big mic: tap and talk, the words appear as they are heard, and it sends when the person stops.
  const listen = () => {
    const SR = speechApi();
    if (!SR) { setVoice(false); setTyping(true); return; }
    if (listening) { try { rec.current?.stop(); } catch {} return; }
    if (busy) return;
    const r = new SR();
    r.lang = navigator.language || "en-US";
    r.interimResults = true;
    r.continuous = false;
    heardRef.current = "";
    setHeard(""); setBlocked(false); setError(""); setRecord(false);
    r.onresult = (e) => {
      let t = "";
      for (let i = 0; i < e.results.length; i++) t += e.results[i][0].transcript;
      heardRef.current = t;
      setHeard(t);
    };
    r.onerror = (e) => {
      if (e.error === "not-allowed" || e.error === "service-not-allowed") { setBlocked(true); setTyping(true); }
      else if (e.error === "network" || e.error === "audio-capture") { setVoice(false); setTyping(true); }
    };
    r.onend = () => {
      setListening(false);
      rec.current = null;
      const t = heardRef.current.trim();
      setHeard("");
      if (t) send(t);
    };
    rec.current = r;
    try { r.start(); setListening(true); } catch { setVoice(false); setTyping(true); }
  };

  function toggle() {
    setOpen((o) => { if (!o) trackCta("chat-open", path); return !o; });
  }
  function submit(e) {
    e.preventDefault();
    const t = draft;
    setDraft("");
    send(t);
    if (voice) setTyping(false);
  }
  function startOver() {
    fetch("/api/chat", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "new" }) }).catch(() => {});
    setMsgs([]); setError(""); setPlaying(-1); setSaid(""); setRecord(false); setSeen(0);
  }

  const lastAnswer = msgs.map((m) => m.role === "assistant").lastIndexOf(true);
  const answer = playing >= 0 ? msgs[playing] : null;
  const turn = error ? { sent: true, failed: true }
    : listening ? { listening: true, heard }
    : busy ? { sent: true }
    : found ? { sent: true, arrived: true }
    : answer ? { sent: true, chunk: 0 }
    : {};
  const { mood, flavor } = stageMood(turn);
  const fresh = msgs.length - seen;
  const went = playing >= 0 ? msgs.slice(playing + 1).find((m) => m.card === "went") : null;

  let center;
  if (verify) {
    center = <div className="ys-mid"><Check siteKey={verify.siteKey} onToken={onToken} /></div>;
  } else if (mood === "error") {
    center = (
      <div className="ys-mid">
        <Presence mood="error" />
        <div className="ys-word">{error || "That didn't go through."}</div>
        <button className="ys-pill" onClick={retry}>Try again</button>
      </div>
    );
  } else if (mood === "listen") {
    center = (
      <div className="ys-mid">
        <Presence mood="listen" />
        <div className="ys-heard">{heard || " "}<span className="mo-caret" /></div>
      </div>
    );
  } else if (mood === "think" || mood === "work" || mood === "found") {
    center = (
      <div className="ys-mid">
        <Presence mood={mood} flavor={flavor} />
        <div className="ys-word" key={mood}>{mood === "found" ? "Here it is" : "Thinking"}{mood === "found" ? null : <span className="ys-secs"> · {secs}s</span>}</div>
      </div>
    );
  } else if (answer) {
    center = (
      <>
        <StageAnswer key={`${playing}:${playKey}`} content={answer.content} live={playing === lastAnswer && !busy} onTap={tap} onAnswers={answerAll} Text={Text} go={go} active={!record && !typing} />
        {toast ? <div className="ys-went" role="status">{toast}</div> : null}
        {went ? <div className="ys-went">Taking you to <a href={went.path} onClick={(e) => { e.preventDefault(); go(went.path); }}>{went.label}</a></div> : null}
      </>
    );
  } else {
    center = (
      <div className="ys-mid ys-hello">
        <Presence mood="idle" />
        <div className="ys-line">{msgs.length ? "Anything else?" : HELLO}</div>
        {msgs.length ? <div className="ys-sub">Everything so far is in the chat, top right.</div> : (
          <div className="yc-starters">
            {STARTERS.map((s) => <button key={s} onClick={() => send(s)}>{s}</button>)}
            <a className="yc-tf" href={links.testflight} target="_blank" rel="noopener noreferrer" onClick={() => trackCta("chat-testflight", "chat")}>Get Yui on TestFlight ↗</a>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={`yc${open ? " is-open" : ""}`}>
      {open && (
        <div className="yc-layer" onClick={(e) => { if (e.target === e.currentTarget) setOpen(false); }}>
          <section className={`yc-panel ys p-${look.pulse} e-${look.enter}${look.reduced ? " mo-still" : ""}`} role="dialog" aria-label="Chat with Yui"
            style={{ "--mo-c": YUI, ...motionVars(look) }} data-mood={mood}>
            {mood !== "idle" ? <span className="mo-wash" key={`wash:${msgs.length}`} /> : null}
            <header className="ys-top">
              <span className="yc-avatar" aria-hidden="true"><span /></span>
              <div className="ys-who"><strong>Yui</strong><span>Answers with screens</span></div>
              <button className="ys-round ys-rec" onClick={() => setRecord(true)} aria-label={`Chat record${fresh > 0 ? `, ${fresh} new` : ""}`}>
                <RecordIcon />{fresh > 0 ? <i>{fresh}</i> : null}
              </button>
              <button className="ys-round yc-x" onClick={() => setOpen(false)} aria-label="Close chat">×</button>
            </header>
            {said && mood !== "idle" && mood !== "listen" ? <div className="ys-me">{said}</div> : null}
            <div className="ys-center" aria-live="polite">{center}</div>
            {typing ? (
              <form className="yc-input ys-field" onSubmit={submit}>
                <textarea
                  ref={input} rows={1} value={draft} maxLength={1000} placeholder="Message Yui" aria-label="Message Yui"
                  onChange={(e) => setDraft(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) submit(e); }}
                />
                <button className="yc-send" disabled={!draft.trim() || busy || !!verify} aria-label="Send">↑</button>
                {voice ? <button type="button" className="ys-small" onClick={() => setTyping(false)} aria-label="Back to the mic"><MicIcon /></button> : null}
              </form>
            ) : (
              <div className="ys-bottom">
                <button className="ys-small ys-t" onClick={() => setTyping(true)} aria-label="Type">T</button>
                <button className={`ys-mic${listening ? " live" : ""}`} onClick={listen} disabled={busy && !listening} aria-label={listening ? "Stop listening" : "Talk to Yui"}>
                  <span className="mo-ring" /><span className="mo-ring r2" />
                  <MicIcon />
                </button>
              </div>
            )}
            <p className="yc-note ys-hint">{micLine({ voice, listening, heard, blocked })} <span>Chats are saved so we learn what people want. <a href="/privacy#chat">Privacy</a></span></p>

            {record ? (
              <div className="ys-record" role="dialog" aria-label="Chat record">
                <div className="ys-rechead"
                  onTouchStart={(e) => { e.currentTarget.dataset.y = e.touches[0].clientY; }}
                  onTouchEnd={(e) => { if (e.changedTouches[0].clientY - Number(e.currentTarget.dataset.y || 0) > 70) setRecord(false); }}>
                  <span className="ys-grab" aria-hidden="true" />
                  <b>Chat with Yui</b><span className="ys-sub">the record</span>
                  {msgs.length > 0 && <button className="yc-new" onClick={startOver} title="Start over">New chat</button>}
                  <button className="ys-round" onClick={() => setRecord(false)} aria-label="Back to the stage">×</button>
                </div>
                <div className="yc-list" ref={list}>
                  <div className="yc-answer yc-hello"><div className="yc-part yc-part-text"><p>{HELLO}</p></div></div>
                  {!msgs.length ? <p className="ys-sub">Nothing yet. What you say and what Yui shows land here.</p> : null}
                  {msgs.map((m, i) => {
                    if (m.card === "went") return <div key={i} className="yc-went">Opened <a href={m.path} onClick={(e) => { e.preventDefault(); go(m.path); }}>{m.label}</a></div>;
                    if (m.card === "contact") return null; // cards from before the Yui form
                    if (m.role === "user") return <div key={i} className={`yc-msg yc-user${m.label ? " yc-tapped" : ""}`}><p>{m.label || m.content}</p></div>;
                    return <Answer key={i} content={m.content} go={go} onTap={tap} live={i === lastAnswer && !busy}
                      onPlay={() => { setRecord(false); setPlaying(i); setPlayKey((k) => k + 1); setError(""); }} />;
                  })}
                </div>
              </div>
            ) : null}
          </section>
        </div>
      )}
      <Fab open={open} onClick={toggle} />
    </div>
  );
}
