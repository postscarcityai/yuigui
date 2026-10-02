"use client";
// One group, in the main column (SITE-162, web twin of Yui/Sources/Groups/GroupThreadView.swift): the lead first in the
// header with a crown, bubbles in each sender's look on the person's background, one working row per agent with
// Stop, handoff and guard rows, and a composer where @ suggests the members. Spec: spec/GROUPS.md. The rows are
// read and written with the person's own session (lib/web/groups.mjs); the screens inside are the same renderers
// the agent threads use (ThreadScreen), and a tap on one goes to the agent that drew it.
import dynamic from "next/dynamic";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { RichText } from "../playground/richtext";
import { lookVars } from "../../lib/web/settings.mjs";
import { Thread, excerpt, folds } from "../../lib/web/thread.mjs";
import { rowOf } from "../../lib/web/compose.mjs";
import { addressees, completing, groupError, groupItems, groupWorking, membersOf, suggest, tapOf } from "../../lib/web/groups.mjs";
import { Face } from "./parts";
import { Crown, GroupFaces } from "./Groups";
import GroupSettings from "./GroupSettings";
import "./groups.css";

const ThreadScreen = dynamic(() => import("./ThreadScreen"), { ssr: false, loading: () => <div className="wb-wait">Drawing...</div> });

const BUSY_POLL = 1500, IDLE_POLL = 4000;
const newId = () => globalThis.crypto.randomUUID();
const byTime = (a, b) => (a.created_at < b.created_at ? -1 : a.created_at > b.created_at ? 1 : a.id < b.id ? -1 : 1);

// An agent's look on its own bubbles: its palette's variables on the row, so the background stays the person's.
const lookOf = (agent, light) => {
  const v = lookVars(agent?.theme?.preset ? { preset: agent.theme.preset } : agent?.theme || null, !light);
  const keep = ["--agent-bubble", "--agent-ink", "--brand", "--on-brand", "--outline", "--link", "--ink-soft", "--muted"];
  return Object.fromEntries(keep.filter((k) => v[k]).map((k) => [k, v[k]]));
};

function AgentText({ text }) {
  const long = folds(text);
  const [open, setOpen] = useState(false);
  return (
    <div className="wb-text">
      <RichText text={long && !open ? excerpt(text) : text} />
      {long ? <button type="button" className="wb-fold" onClick={() => setOpen((o) => !o)} aria-expanded={open}>{open ? "Show less" : "Read it all"}</button> : null}
    </div>
  );
}

// An agent's answer in its own look: its face, its name over the bubble, text as bubbles, screens inline.
function AgentBubbles({ item, agent, messages, light, onReply, onTap, onOpenAgent }) {
  return (
    <div className="gr-line wb-agent" style={lookOf(agent, light)} data-testid="group-agent" data-agent={item.agent} id={`grm-${item.id}`}>
      <Face agent={agent} size={34} />
      <div className="gr-col">
        <b className="gr-name">{agent?.name || "Yui"}</b>
        {messages.map((m) => (m.yl ? (
          <div key={m.id} className="wb-screenrow gr-screen">
            <ThreadScreen message={m} agent={agent?.name || "Yui"} light={light} onTap={(ev) => onTap(ev, item.agent)} live onPage={() => onOpenAgent(item.agent)} fresh={false} />
          </div>
        ) : (
          <div key={m.id} className="gr-bubblerow">
            <div className="wb-bubble" data-testid="group-bubble"><AgentText text={m.text} /></div>
            <button type="button" className="gr-reply" aria-label={`Reply to ${agent?.name || "Yui"}`} title="Reply" data-testid="group-reply" onClick={() => onReply(item.agent)}>
              <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M10 8V4L3 11l7 7v-4c5 0 8 1.5 11 6-1-6-4-11-11-12z" /></svg>
            </button>
          </div>
        )))}
      </div>
    </div>
  );
}

// "Coach asked Sage", with both faces, and the ask in one line. A tap jumps to the bubble that asked.
function HandoffRow({ item, from, to, onJump }) {
  return (
    <button type="button" className={`gr-handoff${item.cancelled ? " cancelled" : ""}`} onClick={() => item.msg && onJump(item.msg)} data-testid="group-handoff">
      {from ? <Face agent={from} size={22} /> : null}
      <span className="gr-arrow" aria-hidden="true">→</span>
      {to ? <Face agent={to} size={22} /> : null}
      <span className="gr-hwords">
        <b>{from?.name || "An agent"} asked {to?.name || "another"}{item.cancelled ? ", stopped" : ""}</b>
        {item.ask ? <small>{item.ask}</small> : null}
      </span>
    </button>
  );
}

// A held ask, in the asking agent's look: Let it / Stop here.
function GuardRow({ item, asker, light, onLetIt, onStop }) {
  const lines = String(item.text || "").split("\n");
  return (
    <div className="gr-line gr-guard wb-agent" style={lookOf(asker, light)} data-testid="group-guard" data-state={item.state}>
      {asker ? <Face agent={asker} size={34} /> : null}
      <div className="gr-guardcard">
        {lines.map((l, i) => <p key={i} className={i ? "gr-sub" : ""}>{l}</p>)}
        {item.state === "held" ? (
          <div className="gr-actions">
            <button type="button" className="gr-go" onClick={() => onLetIt(item.id)} data-testid="group-letit">Let it</button>
            <button type="button" className="gr-quiet" onClick={onStop} data-testid="group-stophere">Stop here</button>
          </div>
        ) : (
          <small className="gr-state" data-testid="group-guard-state">{{ continued: "Let through.", stopped: "Stopped here.", gone: `${item.toName || "That agent"} isn't in the group anymore.` }[item.state]}</small>
        )}
      </div>
    </div>
  );
}

function StatusLine({ item, agent }) {
  return (
    <div className="gr-status" data-testid="group-status">
      {agent ? <Face agent={agent} size={18} /> : null}
      <span>{item.text}</span>
    </div>
  );
}

// One working row per agent, lead first: `Sage · Reading your notes · 8s`, and Stop.
function WorkingRow({ w, agent, now, onStop }) {
  const secs = Math.max(0, Math.round((now - w.since) / 1000));
  const step = w.doing?.step != null ? ` (${w.doing.step} of ${w.doing.of})` : "";
  return (
    <div className="gr-working wb-working" role="status" data-testid="group-working" data-agent={w.agent}>
      <Face agent={agent} size={26} />
      <span className="wb-dots" aria-hidden="true"><i /><i /><i /></span>
      <span className="wb-working-text">{agent?.name || "Agent"} · {w.doing?.text || "Pondering"}{step} · {secs}s</span>
      <button type="button" className="wb-stoplink" onClick={onStop} data-testid={`group-stop-${agent?.handle || w.agent}`}>Stop</button>
    </div>
  );
}

function Header({ group, members, onMenu, onMakeLead, onSettings }) {
  const [menu, setMenu] = useState(null);
  return (
    <header className="wb-head gr-head" data-testid="group-header">
      <button className="wb-iconbtn wb-menu" onClick={onMenu} aria-label="Your agents">
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7h16M4 12h16M4 17h16" fill="none" strokeWidth="2.2" strokeLinecap="round" /></svg>
      </button>
      <span className="gr-faces gr-headfaces" style={{ "--gr-size": "34px" }}>
        {members.slice(0, 5).map((a, i) => (
          <span key={a.id} className="gr-face" style={{ zIndex: 10 - i }}>
            <button type="button" className="gr-facebtn" aria-label={a.id === group.lead ? `${a.name}, lead` : `${a.name}. Make lead`} aria-haspopup={a.id === group.lead ? undefined : "menu"} aria-expanded={menu === a.id}
              data-testid={`group-face-${a.handle}`} onClick={() => a.id !== group.lead && setMenu(menu === a.id ? null : a.id)}>
              <Face agent={a} size={34} />
            </button>
            {a.id === group.lead ? <Crown /> : null}
            {menu === a.id ? (
              <span className="gr-menu" role="menu">
                <button type="button" role="menuitem" data-testid="group-make-lead" onClick={() => { setMenu(null); onMakeLead(a.id); }}>Make {a.name} lead</button>
              </span>
            ) : null}
          </span>
        ))}
      </span>
      <span className="wb-head-words">
        <b data-testid="group-title">{group.title}</b>
        <small>{members.map((a) => a.name).join(", ")}</small>
      </span>
      {group.sample ? <span className="wb-demo gr-sample" title="A recorded group. Nothing leaves this tab." data-testid="group-sample">Sample</span> : null}
      <button type="button" className="wb-iconbtn gr-gear" aria-label="Group settings" aria-haspopup="dialog" onClick={onSettings} data-testid="group-settings-open">
        <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true"><circle cx="12" cy="12" r="3" /><path d="M12 3v2.5M12 18.5V21M3 12h2.5M18.5 12H21M5.6 5.6l1.8 1.8M16.6 16.6l1.8 1.8M5.6 18.4l1.8-1.8M16.6 7.4l1.8-1.8" /></svg>
      </button>
    </header>
  );
}

export default function GroupThread({ api, group, agents, light, userId, onMenu, onOpenAgent, onChanged, onArchived }) {
  const [settings, setSettings] = useState(false);
  const members = useMemo(() => membersOf(group, agents), [group, agents]);
  const agentOf = useCallback((id) => agents.find((a) => a.id === id) || null, [agents]);
  const [rows, setRows] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const [sending, setSending] = useState([]);
  const [failed, setFailed] = useState({});
  const [notice, setNotice] = useState("");
  const [replyTarget, setReplyTarget] = useState(null);
  const [draft, setDraft] = useState("");
  const [now, setNow] = useState(() => Date.now());
  const cursor = useRef(null);
  const thread = useRef(null);
  const box = useRef(null);
  const scroller = useRef(null);
  const stick = useRef(true);
  if (!thread.current) thread.current = new Thread();

  const merge = useCallback((fresh) => {
    if (!fresh.length) return;
    setRows((prev) => {
      const by = new Map(prev.map((r) => [String(r.id).toLowerCase(), r]));
      for (const r of fresh) by.set(String(r.id).toLowerCase(), r);
      const next = [...by.values()].sort(byTime);
      cursor.current = next[next.length - 1]?.created_at || cursor.current;
      return next;
    });
  }, []);

  // One read when it opens, then a poll: quick while anyone works, easy when quiet.
  const busyRef = useRef(false);
  const refresh = useCallback(async () => {
    try { merge(await api.rows({ thread: group.id, since: cursor.current })); } catch { /* the next look */ } finally { setLoaded(true); }
  }, [api, group.id, merge]);
  useEffect(() => {
    let live = true, timer = null;
    const tick = async () => { await refresh(); if (live) timer = setTimeout(tick, busyRef.current ? BUSY_POLL : IDLE_POLL); };
    tick();
    return () => { live = false; clearTimeout(timer); };
  }, [refresh]);

  // Agent rows go through the web Thread, so a fence is a screen and a later patch lands on the screen it names.
  const items = useMemo(() => groupItems(rows), [rows]);
  const working = useMemo(() => groupWorking(rows, group.lead), [rows, group.lead]);
  const messages = useMemo(() => {
    const t = thread.current;
    for (const r of rows) if (r.sender === "agent" && r.kind === "text" && !r.meta?.group?.guard && !r.meta?.group?.status) t.add(r);
    const by = new Map();
    for (const m of t.messages) { const k = rowOf(m.id); (by.get(k) || by.set(k, []).get(k)).push(m); }
    return by;
  }, [rows]);
  busyRef.current = working.length > 0 || sending.length > 0;
  useEffect(() => {
    if (!working.length) return undefined;
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, [working.length]);

  // What was said and has not landed shows at once, dimmed, until its row comes back.
  const landed = useMemo(() => new Set(rows.map((r) => String(r.id).toLowerCase())), [rows]);
  const shown = [...items, ...sending.filter((s) => !landed.has(s.id.toLowerCase()))];

  // Stay at the bottom while new things arrive, unless the person scrolled up to read.
  useEffect(() => {
    const el = scroller.current;
    if (el && stick.current) el.scrollTop = el.scrollHeight;
  }, [shown.length, working.length, messages]);
  const onScroll = () => { const el = scroller.current; if (el) stick.current = el.scrollHeight - el.scrollTop - el.clientHeight < 160; };

  const post = useCallback(async ({ id, words, to, echo = null }) => {
    setNotice("");
    setFailed((f) => { const { [id]: _, ...rest } = f; return rest; });
    if (echo || !words.startsWith("[yui]")) setSending((s) => (s.some((x) => x.id === id) ? s : [...s, { kind: "you", id, text: echo || words, to, at: Date.now(), pending: true }]));
    stick.current = true;
    try {
      await api.say({ id, thread: group.id, agent: to[0] || group.lead, words, to, echo });
      await refresh();
    } catch (e) {
      setSending((s) => s.filter((x) => x.id !== id));
      if (echo || !words.startsWith("[yui]")) setSending((s) => [...s, { kind: "you", id, text: echo || words, to, at: Date.now(), failed: true }]);
      setFailed((f) => ({ ...f, [id]: { words, to, echo } }));
      setNotice((e.group || groupError(e.cause || e)).spoken);
    }
  }, [api, group.id, group.lead, refresh]);

  const send = (e) => {
    e?.preventDefault();
    const words = draft.trim();
    if (!words) return;
    const to = addressees(words, members, replyTarget);
    setDraft(""); setReplyTarget(null);
    post({ id: newId(), words, to });
  };
  const retry = (id) => { const f = failed[id]; if (!f) return; setSending((s) => s.filter((x) => x.id !== id)); post({ id, ...f }); };
  const onTap = useCallback((ev, agent) => { const t = tapOf(ev); if (t) post({ id: newId(), words: t.words, to: [agent], echo: t.echo }); }, [post]);
  const guarded = async (fn) => { try { await fn(); await refresh(); } catch (e) { setNotice((e.group || groupError(e.cause || e)).spoken); await refresh(); } };
  const letIt = (guard) => guarded(() => api.letIt({ guard, thread: group.id, lead: group.lead }));
  const stop = () => guarded(() => api.stop({ thread: group.id, lead: group.lead }));
  const makeLead = async (id) => { try { await api.makeLead(id, group.id); await onChanged?.(); } catch (e) { setNotice((e.group || groupError(e.cause || e)).spoken); } };
  const jump = (id) => document.getElementById(`grm-${id}`)?.scrollIntoView({ block: "center", behavior: "smooth" });

  const suggestions = suggest(draft, members);
  const lead = agentOf(group.lead);
  const row = (it) => {
    switch (it.kind) {
      case "you": return (
        <div key={it.id} className={`wb-row wb-user${it.pending ? " pending" : ""}${it.failed ? " failed" : ""}`} data-testid="group-you">
          {it.to?.length ? <div className="wb-to">To {it.to.map((id) => agentOf(id)?.name).filter(Boolean).join(", ")}</div> : null}
          <div className="wb-bubble">{it.text}</div>
          {it.failed ? <div className="wb-sub bad">Not sent. <button type="button" className="wb-stoplink gr-retry" onClick={() => retry(it.id)} data-testid="group-retry">Try again</button></div> : null}
        </div>
      );
      case "agent": return <AgentBubbles key={it.id} item={it} agent={agentOf(it.agent)} messages={messages.get(rowOf(it.id)) || []} light={light} onReply={setReplyTarget} onTap={onTap} onOpenAgent={onOpenAgent} />;
      case "handoff": return <HandoffRow key={it.id} item={it} from={agentOf(it.from)} to={agentOf(it.to)} onJump={jump} />;
      case "guard": return <GuardRow key={it.id} item={it} asker={agentOf(it.asker)} light={light} onLetIt={letIt} onStop={stop} />;
      case "status": return <StatusLine key={it.id} item={it} agent={agentOf(it.about)} />;
      default: return null;
    }
  };

  return (
    <>
      <Header group={group} members={members} onMenu={onMenu} onMakeLead={makeLead} onSettings={() => setSettings(true)} />
      {settings ? <GroupSettings api={api} group={group} agents={agents} onClose={() => setSettings(false)} onChanged={onChanged} onArchived={onArchived} /> : null}
      <div className="wb-thread gr-thread" data-testid="group-thread">
        <div className="wb-scroll" ref={scroller} onScroll={onScroll}>
          <div className="wb-messages" aria-live="polite">
            {loaded && !shown.length ? (
              <p className="wb-empty" data-testid="group-empty">Say something. Start with @ to ask one of them, or just talk and {lead?.name || "the lead"} answers.</p>
            ) : null}
            {!loaded ? <div className="wb-wait">Loading the group...</div> : null}
            {shown.map(row)}
            {working.map((w) => <WorkingRow key={w.agent} w={w} agent={agentOf(w.agent)} now={now} onStop={stop} />)}
          </div>
        </div>
        <div className="wb-composer gr-composer">
          {notice ? <p className="ag-error gr-notice" role="alert" data-testid="group-notice">{notice}</p> : null}
          {replyTarget && agentOf(replyTarget) ? (
            <div className="gr-replybar" data-testid="group-replybar">
              <span>Replying to <b>{agentOf(replyTarget).name}</b></span>
              <button type="button" aria-label="Cancel reply" onClick={() => setReplyTarget(null)}>×</button>
            </div>
          ) : null}
          {suggestions.length ? (
            <div className="gr-at" role="listbox" aria-label="Members" data-testid="group-at">
              {suggestions.map((a) => (
                <button key={a.id} type="button" role="option" aria-selected="false" className="gr-atchip" data-testid={`group-at-${a.handle}`}
                  onMouseDown={(e) => e.preventDefault()} onClick={() => { setDraft(completing(draft, a.handle)); box.current?.focus(); }}>
                  <Face agent={a} size={22} /><span>@{a.handle}</span>
                </button>
              ))}
            </div>
          ) : null}
          <form className="wb-compose" onSubmit={send}>
            <textarea ref={box} rows={1} value={draft} maxLength={32000} aria-label="Message the group" placeholder="Message the group" data-testid="group-field"
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) { e.preventDefault(); send(); } }} />
            <button className="wb-send" type="submit" disabled={!draft.trim()} aria-label="Send" data-testid="group-send">
              <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 19V5M5 12l7-7 7 7" fill="none" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </button>
          </form>
        </div>
      </div>
    </>
  );
}
