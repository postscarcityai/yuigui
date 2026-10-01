"use client";
// One agent's thread on the web (YUI-242): bubbles, screens, the working row and the composer, over the
// relay (lib/web/relay.mjs) or the demo's fake one. The rules are the app's: Chat/Thread.swift,
// Presets/ChatStore.swift, Chat/BubbleMarkdown.swift, Chat/LongText.swift, Chat/SentTimes.swift.
import dynamic from "next/dynamic";
import { memo, useCallback, useEffect, useMemo, useReducer, useRef, useState } from "react";
import { RichText } from "../playground/richtext";
import { stamps } from "../../lib/chat/when.mjs";
import { Thread, excerpt, folds } from "../../lib/web/thread.mjs";
import { ThreadSync } from "../../lib/web/sync.mjs";
import { waitingNote, workingLine } from "../../lib/web/presence.mjs";

const ThreadScreen = dynamic(() => import("./ThreadScreen"), { ssr: false, loading: () => <div className="wb-wait">Drawing...</div> });

// Words an agent wrote: markdown drawn as elements (RichText never uses innerHTML), a long answer folded to
// its first sentences with a way to read it all (LongText.swift: past 60 words, an excerpt of about 40).
const AgentText = memo(function AgentText({ text }) {
  const long = folds(text);
  const [open, setOpen] = useState(false);
  return (
    <div className="wb-text">
      <RichText text={long && !open ? excerpt(text) : text} />
      {long ? <button className="wb-fold" onClick={() => setOpen((o) => !o)} aria-expanded={open}>{open ? "Show less" : "Read it all"}</button> : null}
    </div>
  );
});

function Bubble({ m, agent, light, onTap, live }) {
  if (m.card === "stopped") return <div className="wb-note" role="status">Stopped.</div>;
  if (m.yl) return <div className="wb-row wb-agent wb-screenrow"><ThreadScreen message={m} agent={agent?.name || "Yui"} light={light} onTap={onTap} live={live} /></div>;
  if (m.role === "user") {
    return (
      <div className={`wb-row wb-user${m.pending ? " pending" : ""}${m.failed ? " failed" : ""}`}>
        {m.to ? <div className="wb-to">{m.to}</div> : null}
        <div className="wb-bubble">
          {m.replyTo ? <div className="wb-quote"><b>{m.replyTo.from === "agent" ? agent?.name || "Yui" : "You"}</b> {m.replyTo.quote}</div> : null}
          {m.text}
        </div>
        {m.failed ? <div className="wb-sub bad">Not sent.</div> : null}
      </div>
    );
  }
  return (
    <div className="wb-row wb-agent">
      {m.from ? <div className="wb-from">{m.from.name}</div> : null}
      <div className="wb-bubble"><AgentText text={m.text} /></div>
    </div>
  );
}

const Day = ({ label }) => <div className="wb-day" role="separator"><i /><span>{label}</span><i /></div>;

function Working({ agent, thread, onStop, note }) {
  return (
    <div className="wb-working" role="status" aria-live="polite">
      <span className="wb-dots" aria-hidden="true"><i /><i /><i /></span>
      <span className="wb-working-text">{workingLine(thread.doing, agent)}</span>
      {note ? <span className="wb-sub">{note}</span> : null}
      <button className="wb-stoplink" onClick={onStop}>Stop</button>
    </div>
  );
}

// The draft lives here and nowhere else, so typing never redraws the thread above it.
function Composer({ agent, waiting, onSend, onStop, offline }) {
  const [draft, setDraft] = useState("");
  const box = useRef(null);
  const grow = () => { const el = box.current; if (el) { el.style.height = "auto"; el.style.height = `${Math.min(el.scrollHeight, 160)}px`; } };
  useEffect(grow, [draft]);
  const submit = () => { if (onSend(draft)) { setDraft(""); box.current?.focus(); } };
  const stop = waiting && !draft.trim();
  return (
    <form className="wb-composer" onSubmit={(e) => { e.preventDefault(); stop ? onStop() : submit(); }}>
      {offline ? <div className="wb-offline" role="status">Not sent yet. It goes the moment you're back online.</div> : null}
      <div className="wb-compose">
        <textarea ref={box} rows={1} value={draft} maxLength={32000} aria-label={`Message ${agent?.name || "Yui"}`} placeholder={`Message ${agent?.name || "Yui"}`}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) { e.preventDefault(); if (draft.trim()) submit(); } }} />
        <button className={`wb-send${stop ? " stop" : ""}`} type="submit" disabled={!stop && !draft.trim()} aria-label={stop ? "Stop" : "Send"}>
          {stop ? <svg viewBox="0 0 24 24" aria-hidden="true"><rect x="6" y="6" width="12" height="12" rx="2.5" /></svg>
            : <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 19V6M6 11.5l6-6 6 6" fill="none" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" /></svg>}
        </button>
      </div>
    </form>
  );
}

export default function ThreadView({ relay, userId, agent, chat, light, live = true }) {
  const thread = useMemo(() => new Thread(), [agent.id, chat]);
  const [, tick] = useReducer((n) => n + 1, 0);
  const [net, setNet] = useState({ offline: false, pending: 0 });
  const sync = useMemo(() => new ThreadSync({ relay, thread, userId, agentId: agent.id, chatId: chat || null, onStatus: setNet }), [relay, thread, userId, agent.id, chat]);
  useEffect(() => thread.subscribe(tick), [thread]);
  useEffect(() => { sync.start(); return () => sync.stop(); }, [sync]);

  const list = thread.messages;
  const marks = useMemo(() => stamps(list), [list, thread.version]);
  const scroller = useRef(null);
  const stuck = useRef(true);
  const onScroll = () => { const el = scroller.current; if (el) stuck.current = el.scrollHeight - el.scrollTop - el.clientHeight < 120; };
  // Follow the newest message while the person is at the bottom; a first load always lands there.
  useEffect(() => {
    const el = scroller.current;
    if (el && (stuck.current || thread.version <= 1)) el.scrollTop = el.scrollHeight;
  }, [thread.version, thread.waiting]);

  const onTap = useCallback((ev) => { sync.tap(ev); }, [sync]);
  const onSend = useCallback((text) => sync.send(text), [sync]);
  const onStop = useCallback(() => sync.stopTurn(), [sync]);
  const note = thread.waiting ? waitingNote(agent) : null;

  return (
    <section className="wb-thread" aria-label={`${agent.name}'s thread`} data-loaded={thread.loaded ? "1" : "0"}>
      <div className="wb-scroll" ref={scroller} onScroll={onScroll}>
        <div className="wb-messages">
          {!thread.loaded ? <div className="wb-wait">Opening {agent.name}...</div> : null}
          {thread.loaded && !list.length ? <div className="wb-empty">{agent.firstMessage || `Say hi to ${agent.name}.`}</div> : null}
          {list.map((m, i) => (
            <div key={m.id} className="wb-item" data-id={m.id}>
              {marks[i]?.day ? <Day label={marks[i].day} /> : null}
              <Bubble m={m} agent={agent} light={light} onTap={onTap} live={live} />
              {marks[i]?.time ? <div className={`wb-time ${m.role === "user" ? "user" : ""}`}>{marks[i].time}</div> : null}
            </div>
          ))}
          {thread.waiting ? <Working agent={agent} thread={thread} onStop={onStop} note={note} /> : null}
        </div>
      </div>
      <Composer agent={agent} waiting={thread.waiting} onSend={onSend} onStop={onStop} offline={net.offline} />
    </section>
  );
}
