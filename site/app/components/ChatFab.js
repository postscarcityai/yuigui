"use client";
// Yui in the bubble (SITE-64): a chat at the bottom right of every page, no account. Talks to
// /api/chat, which answers, searches the site, can take the visitor to a page, and writes down what
// they want. After a few turns Cloudflare Turnstile checks for a person once. The conversation
// stays in this browser's localStorage so it survives page loads; the server keeps its own copy.
import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { savedUtm, trackCta } from "../../lib/track.mjs";
import "./chat.css";

const KEY = "yui-chat-v1";
const HELLO = "Hi, I'm Yui. Ask me anything about the app, or tell me what you'd want your AI to do for you.";
const STARTERS = ["What is Yui?", "How do I get it?", "What can it draw?", "I have an idea"];

// Outside links only to places Yui lives. Anything else shows as plain text.
const SAFE = /^https:\/\/(www\.)?(yuigui\.com|postscarcity\.ai|testflight\.apple\.com|github\.com\/postscarcityai)(\/|$)/;
const load = () => { try { return JSON.parse(localStorage.getItem(KEY) || "null"); } catch { return null; } };
const save = (v) => { try { localStorage.setItem(KEY, JSON.stringify(v)); } catch {} };

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

function Contact({ reason, onDone, onSkip }) {
  const [state, setState] = useState("idle");
  const [error, setError] = useState("");
  async function submit(e) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const v = (k) => String(f.get(k) || "");
    setState("sending"); setError("");
    try {
      const res = await fetch("/api/chat", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "contact", first_name: v("first_name"), last_name: v("last_name"), email: v("email"), phone: v("phone"), website: v("website"), utm: savedUtm() }) });
      const data = await res.json();
      if (data.ok) { trackCta("chat-contact", "chat"); return onDone(v("first_name")); }
      setError(data.error || "Try again."); setState("idle");
    } catch { setError("Network error. Try again."); setState("idle"); }
  }
  return (
    <form className="yc-card yc-contact" onSubmit={submit}>
      <p><strong>Stay in touch</strong>{reason ? `, ${reason.replace(/\.$/, "")}.` : "."}</p>
      <div className="yc-row">
        <input name="first_name" required maxLength={80} autoComplete="given-name" placeholder="First name" aria-label="First name" />
        <input name="last_name" required maxLength={80} autoComplete="family-name" placeholder="Last name" aria-label="Last name" />
      </div>
      <input name="email" type="email" required maxLength={254} autoComplete="email" placeholder="Email" aria-label="Email" />
      <input name="phone" type="tel" maxLength={25} autoComplete="tel" placeholder="Phone (optional)" aria-label="Phone, optional" />
      <input name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" className="wl-hp" />
      <div className="yc-actions">
        <button className="btn" disabled={state === "sending"}>{state === "sending" ? "Sending..." : "Send"}</button>
        <button type="button" className="yc-skip" onClick={onSkip}>No thanks</button>
      </div>
      {error && <p className="yc-err">{error}</p>}
      <p className="yc-fine">Only used to reach you about Yui. <a href="/privacy#chat">Privacy</a></p>
    </form>
  );
}

export default function ChatFab() {
  const router = useRouter();
  const path = usePathname() || "/";
  const [open, setOpen] = useState(false);
  const [msgs, setMsgs] = useState([]);           // { role: "user" | "assistant", content } plus { card } rows
  const [busy, setBusy] = useState(false);
  const [draft, setDraft] = useState("");
  const [verify, setVerify] = useState(null);     // { siteKey, text } while Turnstile is up
  const [error, setError] = useState("");
  const list = useRef(null), input = useRef(null), ready = useRef(false);

  useEffect(() => {
    const s = load();
    if (s?.msgs) setMsgs(s.msgs);
    if (s?.open && window.innerWidth > 760) setOpen(true);
    ready.current = true;
  }, []);
  useEffect(() => { if (ready.current) save({ msgs: msgs.slice(-60), open }); }, [msgs, open]);
  useEffect(() => { list.current?.scrollTo({ top: list.current.scrollHeight, behavior: "smooth" }); }, [msgs, busy, verify, open]);
  useEffect(() => { if (open) setTimeout(() => input.current?.focus(), 50); }, [open]);
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => { if (e.key === "Escape") setOpen(false); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const go = useCallback((p) => { router.push(p); if (window.innerWidth <= 760) setOpen(false); }, [router]);

  const send = useCallback(async (text, prior) => {
    const t = text.trim();
    if (!t || busy) return;
    setError("");
    const history = (prior || msgs).filter((m) => m.role && !m.card).map(({ role, content }) => ({ role, content }));
    if (!prior) setMsgs((m) => [...m, { role: "user", content: t }]);
    setBusy(true);
    try {
      const res = await fetch("/api/chat", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "say", text: t, path: window.location.pathname + window.location.hash, title: document.title, history: [{ role: "assistant", content: HELLO }, ...history], utm: savedUtm() }) });
      const data = await res.json().catch(() => ({}));
      if (data.verify) { setVerify({ siteKey: data.verify, text: t }); return; }
      if (!res.ok || !data.reply) { setError(data.error || "Yui can't answer right now. Try again in a minute."); return; }
      const cards = [];
      for (const a of data.actions || []) {
        if (a.type === "contact") cards.push({ card: "contact", reason: a.reason });
        if (a.type === "go") { cards.push({ card: "went", label: a.label || a.path, path: a.path }); setTimeout(() => go(a.path), 600); }
      }
      setMsgs((m) => [...m, { role: "assistant", content: data.reply }, ...cards]);
    } catch {
      setError("Network error. Try again.");
    } finally { setBusy(false); }
  }, [busy, msgs, go]);

  const onToken = useCallback(async (token) => {
    const pending = verify;
    try {
      const res = await fetch("/api/chat", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "verify", token }) });
      const data = await res.json();
      if (!data.ok) { setError(data.error || "That check did not go through."); return; }
      setVerify(null);
      if (pending?.text) send(pending.text, msgs.slice(0, -1));
    } catch { setError("Network error. Try again."); }
  }, [verify, send, msgs]);

  const setCard = (i, patch) => setMsgs((m) => m.map((x, j) => (j === i ? { ...x, ...patch } : x)));

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
            <span className="yc-avatar" aria-hidden="true">Y</span>
            <div><strong>Yui</strong><span>Ask me anything about Yui</span></div>
            {msgs.length > 0 && <button className="yc-new" onClick={() => { setMsgs([]); setError(""); }} title="Start over">New chat</button>}
            <button className="yc-x" onClick={() => setOpen(false)} aria-label="Close chat">×</button>
          </header>
          <div className="yc-list" ref={list} aria-live="polite">
            <div className="yc-msg yc-agent"><Text text={HELLO} go={go} /></div>
            {msgs.length === 0 && (
              <div className="yc-starters">
                {STARTERS.map((s) => <button key={s} onClick={() => send(s)}>{s}</button>)}
              </div>
            )}
            {msgs.map((m, i) => {
              if (m.card === "went") return <div key={i} className="yc-went">Opened <a href={m.path} onClick={(e) => { e.preventDefault(); go(m.path); }}>{m.label}</a></div>;
              if (m.card === "contact") {
                if (m.done) return <div key={i} className="yc-went">Thanks{m.name ? `, ${m.name}` : ""}. The team will be in touch.</div>;
                if (m.skipped) return null;
                return <Contact key={i} reason={m.reason} onDone={(name) => setCard(i, { done: true, name })} onSkip={() => setCard(i, { skipped: true })} />;
              }
              return <div key={i} className={`yc-msg ${m.role === "user" ? "yc-user" : "yc-agent"}`}>{m.role === "user" ? <p>{m.content}</p> : <Text text={m.content} go={go} />}</div>;
            })}
            {busy && <div className="yc-msg yc-agent yc-typing" aria-label="Yui is typing"><i /><i /><i /></div>}
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
      <button className="yc-fab" onClick={toggle} aria-label={open ? "Close chat" : "Chat with Yui"} aria-expanded={open}>
        {open ? <span aria-hidden="true">×</span> : <svg viewBox="0 0 24 24" width="26" height="26" aria-hidden="true"><path d="M12 3C6.5 3 2 6.8 2 11.5c0 2.4 1.2 4.6 3.1 6.1L4.4 21l3.9-1.9c1.2.4 2.4.6 3.7.6 5.5 0 10-3.8 10-8.5S17.5 3 12 3Z" fill="currentColor" /></svg>}
      </button>
    </div>
  );
}
