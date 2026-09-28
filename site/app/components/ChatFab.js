"use client";
// Yui in the bubble (SITE-64, SITE-65): a chat at the bottom right of every page, no account. Talks to
// /api/chat, which answers, searches the site, can take the visitor to a page, and writes down what
// they want. After a few turns Cloudflare Turnstile checks for a person once. The conversation
// stays in this browser's localStorage so it survives page loads; the server keeps its own copy.
// SITE-65: it feels like the app. Opening it turns the site dark (the moon button's switch, not
// saved) and closing it puts the visitor's own choice back. On a phone it takes the whole screen.
// Answers are Yui Lines drawn with the site's renderer, and taps go back to Yui. A timer, deck or
// `>full` reply takes the whole chat window on the stage, like the phone. The contact form is a Yui form.
import dynamic from "next/dynamic";
import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import links from "../../content/links.json";
import { splitReply, tapLabel, tapLine } from "../../lib/chat/lines.mjs";
import { echoFor, relays } from "../../../mcp-app/src/events.mjs";
import { savedUtm, trackCta } from "../../lib/track.mjs";
import "./chat.css";

const Screen = dynamic(() => import("./ChatScreen"), { ssr: false, loading: () => <div className="yc-wait">Drawing...</div> });

const KEY = "yui-chat-v1";
const OPEN = "yui-chat-open";   // sessionStorage: reopen on reload in this tab only
const HELLO = "Hi, I'm Yui. I answer with screens, not paragraphs. Try me.";
const STARTERS = ["What is Yui?", "Show me a screen", "Meet the crew", "Make me a beat"];

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


// One answer, played like the app: each part fades in after the last, text in big type, screens
// drawn live. Only a fresh answer plays; old ones from localStorage show at once.
function Answer({ content, fresh, go, onTap, live }) {
  const parts = splitReply(content);
  return (
    <div className={`yc-answer${fresh ? " is-fresh" : ""}`}>
      {parts.map((p, i) => (
        <div key={i} className={p.yl ? "yc-part yc-part-screen" : "yc-part yc-part-text"} style={fresh ? { animationDelay: `${i * 380}ms` } : undefined}>
          {p.yl ? <Screen yl={p.yl} fresh={fresh} onTap={live ? onTap : undefined} /> : <Text text={p.text} go={go} />}
        </div>
      ))}
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

export default function ChatFab() {
  const router = useRouter();
  const path = usePathname() || "/";
  const [open, setOpen] = useState(false);
  const [msgs, setMsgs] = useState([]);           // { role: "user" | "assistant", content, label? } plus { card } rows
  const [busy, setBusy] = useState(false);
  const [draft, setDraft] = useState("");
  const [verify, setVerify] = useState(null);     // { siteKey, text, label } while Turnstile is up
  const [error, setError] = useState("");
  const [fresh, setFresh] = useState(-1);         // index of the answer that should play
  const list = useRef(null), input = useRef(null), ready = useRef(false);

  useEffect(() => {
    const s = load();
    if (s?.msgs) setMsgs(s.msgs);
    try { if (sessionStorage.getItem(OPEN) === "1" && window.innerWidth > 760) setOpen(true); } catch {}
    ready.current = true;
  }, []);
  useEffect(() => { if (ready.current) save({ msgs: msgs.slice(-60) }); }, [msgs]);
  useEffect(() => { if (ready.current) try { sessionStorage.setItem(OPEN, open ? "1" : "0"); } catch {} }, [open]);
  useEffect(() => { list.current?.scrollTo({ top: list.current.scrollHeight, behavior: "smooth" }); }, [msgs, busy, verify, open]);
  useEffect(() => { if (open && window.innerWidth > 760) setTimeout(() => input.current?.focus(), 50); }, [open]);
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => { if (e.key === "Escape" && !document.querySelector(".yc .yl-stage.open")) setOpen(false); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);
  // Dark while open; the visitor's own theme back on close. A phone also stops the page scrolling under it.
  useEffect(() => {
    if (!open) return;
    setTheme("dark");
    document.documentElement.classList.add("yc-on");
    return () => { setTheme(theirTheme()); document.documentElement.classList.remove("yc-on"); };
  }, [open]);

  const go = useCallback((p) => { router.push(p); if (window.innerWidth <= 760) setOpen(false); }, [router]);

  // text: what goes to Yui; label: what the visitor's bubble says (a tap shows the words they tapped).
  const send = useCallback(async (text, prior, label, event) => {
    const t = text.trim();
    if (!t || busy) return;
    setError("");
    const history = (prior || msgs).filter((m) => m.role && !m.card).map(({ role, content }) => ({ role, content }));
    if (!prior) setMsgs((m) => [...m, { role: "user", content: t, ...(label ? { label } : {}) }]);
    setBusy(true);
    try {
      const res = await fetch("/api/chat", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "say", text: t, event, path: window.location.pathname + window.location.hash, title: document.title, history: [{ role: "assistant", content: HELLO }, ...history], utm: savedUtm() }) });
      const data = await res.json().catch(() => ({}));
      if (data.verify) { setVerify({ siteKey: data.verify, text: t, label, event }); return; }
      if (!res.ok || !data.reply) { setError(data.error || "Yui can't answer right now. Try again in a minute."); return; }
      const cards = [];
      for (const a of data.actions || []) {
        if (a.type === "go") { cards.push({ card: "went", label: a.label || a.path, path: a.path }); setTimeout(() => go(a.path), 900); }
      }
      setMsgs((m) => { setFresh(m.length); return [...m, { role: "assistant", content: data.reply }, ...cards]; });
    } catch {
      setError("Network error. Try again.");
    } finally { setBusy(false); }
  }, [busy, msgs, go]);

  const tap = useCallback((ev) => {
    // The phone's rule: a quiet tap (a timer starting, a checklist tick, a loop playing) stays on the screen.
    if (busy || !relays(ev, echoFor(ev))) return;
    if (ev.id === "contact" && ev.preset === "form") { trackCta("chat-contact", "chat"); send("[yui] contact form sent", undefined, "Sent my details", ev); }
    else send(tapLine(ev), undefined, tapLabel(ev));
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

  const lastAnswer = msgs.map((m) => m.role === "assistant").lastIndexOf(true);

  function toggle() {
    setOpen((o) => { if (!o) trackCta("chat-open", path); return !o; });
  }
  function submit(e) {
    e.preventDefault();
    const t = draft;
    setDraft("");
    send(t);
  }

  return (
    <div className={`yc${open ? " is-open" : ""}`}>
      {open && (
        <section className="yc-panel" role="dialog" aria-label="Chat with Yui">
          <header className="yc-head">
            <span className="yc-avatar" aria-hidden="true"><span /></span>
            <div><strong>Yui</strong><span>Answers with screens</span></div>
            {msgs.length > 0 && <button className="yc-new" onClick={() => { fetch("/api/chat", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "new" }) }).catch(() => {}); setMsgs([]); setError(""); setFresh(-1); }} title="Start over">New chat</button>}
            <button className="yc-x" onClick={() => setOpen(false)} aria-label="Close chat">×</button>
          </header>
          <div className="yc-list" ref={list} aria-live="polite">
            <div className="yc-answer yc-hello"><div className="yc-part yc-part-text"><p>{HELLO}</p></div></div>
            {msgs.length === 0 && (
              <div className="yc-starters">
                {STARTERS.map((s) => <button key={s} onClick={() => send(s)}>{s}</button>)}
                <a className="yc-tf" href={links.testflight} target="_blank" rel="noopener noreferrer" onClick={() => trackCta("chat-testflight", "chat")}>Get Yui on TestFlight ↗</a>
              </div>
            )}
            {msgs.map((m, i) => {
              if (m.card === "went") return <div key={i} className="yc-went">Opened <a href={m.path} onClick={(e) => { e.preventDefault(); go(m.path); }}>{m.label}</a></div>;
              if (m.card === "contact") return null; // cards from before the Yui form
              if (m.role === "user") return <div key={i} className={`yc-msg yc-user${m.label ? " yc-tapped" : ""}`}><p>{m.label || m.content}</p></div>;
              return <Answer key={i} content={m.content} fresh={i === fresh} go={go} onTap={tap} live={i === lastAnswer} />;
            })}
            {busy && <div className="yc-typing" aria-label="Yui is typing"><i /><i /><i /></div>}
            {verify && <Check siteKey={verify.siteKey} onToken={onToken} />}
            {error && <p className="yc-err">{error}</p>}
          </div>
          <form className="yc-input" onSubmit={submit}>
            <textarea
              ref={input} rows={1} value={draft} maxLength={1000} placeholder="Message Yui" aria-label="Message Yui"
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) submit(e); }}
            />
            <button className="yc-send" disabled={!draft.trim() || busy || !!verify} aria-label="Send">↑</button>
          </form>
          <p className="yc-note">Chats are saved so we learn what people want. <a href="/privacy#chat">Privacy</a></p>
        </section>
      )}
      <Fab open={open} onClick={toggle} />
    </div>
  );
}
