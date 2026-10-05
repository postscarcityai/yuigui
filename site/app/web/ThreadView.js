"use client";
// One agent's thread on the web (YUI-242): bubbles, screens, the working row and the composer, over the
// relay (lib/web/relay.mjs) or the demo's fake one. The rules are the app's: Chat/Thread.swift,
// Presets/ChatStore.swift, Chat/BubbleMarkdown.swift, Chat/LongText.swift, Chat/SentTimes.swift.
import dynamic from "next/dynamic";
import { memo, useCallback, useEffect, useLayoutEffect, useMemo, useReducer, useRef, useState } from "react";
import { cardWords, replyQuote, rowOf, REACTIONS, reactionOf } from "../../lib/web/compose.mjs";
import { createComposer } from "../../lib/web/composer.mjs";
import { preparePhoto } from "../../lib/web/photo.mjs";
import { AboutChip, AttachButton, Icon, MentionBar, PhotoTray, Problem, ReplyBar, SuggestionList, VoiceRow, fileDrop, pastedFiles, useComposerState, useSuggestKeys } from "./ComposerParts";
import { useVoice } from "./useVoice";
import { voiceProblem } from "../../lib/web/voice.mjs";
import { Dialog, SheetBar } from "./parts";
import { RichText } from "../playground/richtext";
import { stamps } from "../../lib/chat/when.mjs";
import { Thread, excerpt, folds } from "../../lib/web/thread.mjs";
import { ThreadSync } from "../../lib/web/sync.mjs";
import { relayTakeHost, setTakeHost } from "../../lib/web/take-host.mjs";
import { loadRemoved, remove as removeShelf, removedText, setRemovedText, shelfOf } from "../../lib/web/shelf.mjs";
import { createKeySync, deviceName, mergeRemoved } from "../../lib/web/state.mjs";
import ShelfBar from "./ShelfBar";
import { NoAnswer } from "./parts";
import { KeepCtx, stopVoices } from "../playground/music/keep";
import { KeptCtx } from "../playground/kept";
import { sharedReminders } from "../../lib/web/reminders.mjs";
import { waitingNote, workingLine } from "../../lib/web/presence.mjs";
import { chipAction, dismissEvent, homeOf, notYetEvent, waitingAction } from "../../lib/web/stage.mjs";
import { useDismissed } from "./useDismissed";

const ThreadScreen = dynamic(() => import("./ThreadScreen"), { ssr: false, loading: () => <div className="wb-wait">Drawing...</div> });
const WINDOW_STEP = 60;
const StageLayer = dynamic(() => import("./StageLayer"), { ssr: false, loading: () => <div className="wb-stage"><div className="wb-wait center">Opening the stage...</div></div> });

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

// One picture on a bubble: still on this device (a blob link) or in the bucket, signed with the person's own token.
function Picture({ path, local, relay, onOpen }) {
  const [url, setUrl] = useState(local || null);
  useEffect(() => {
    if (local || !path) return undefined;
    let live = true;
    relay.sign?.(path).then((u) => live && u && setUrl(u)).catch(() => {});
    return () => { live = false; };
  }, [path, local, relay]);
  if (!url) return <span className="wb-photo wb-photo-wait" aria-label="Loading photo" />;
  return (
    <button type="button" className="wb-photo" onClick={() => onOpen(url)} aria-label="Open photo" data-testid="bubble-photo">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={url} alt="Photo" loading="lazy" />
    </button>
  );
}

// Hold (touch) or right-click opens the message menu; the small button does the same for a mouse or a keyboard.
function useHold(open) {
  const t = useRef(null), at = useRef(null);
  const clear = () => { clearTimeout(t.current); t.current = null; };
  return {
    onPointerDown(e) {
      if (e.pointerType === "mouse") return;
      at.current = { x: e.clientX, y: e.clientY };
      clear();
      const el = e.currentTarget;
      t.current = setTimeout(() => { t.current = null; open(el); }, 420);
    },
    onPointerMove(e) { if (t.current && at.current && Math.hypot(e.clientX - at.current.x, e.clientY - at.current.y) > 10) clear(); },
    onPointerUp: clear, onPointerCancel: clear, onPointerLeave: clear,
    onContextMenu(e) { e.preventDefault(); clear(); open(e.currentTarget); },
  };
}

const Badge = ({ emoji, onOpen }) => emoji ? (
  <button type="button" className="wb-badge" onClick={(e) => onOpen(e.currentTarget.closest(".wb-hold") || e.currentTarget)} aria-label={`You reacted ${emoji} ${reactionOf(emoji)?.meaning || ""}. Change`} data-testid="reaction-badge">{emoji}</button>
) : null;

function Bubble({ m, agent, light, onTap, live, onPage, fresh, relay, reaction, wears, onMenu, onPicture, onOpenAgent, onJump }) {
  const hold = useHold((el) => onMenu(m, el));
  const more = (
    <button type="button" className="wb-more" onClick={(e) => onMenu(m, e.currentTarget.closest(".wb-hold") || e.currentTarget)} aria-label="Message actions" data-testid="msg-more">{Icon.more}</button>
  );
  if (m.card === "stopped") return <div className="wb-note" role="status">Stopped.</div>;
  if (m.yl) return (
    <div className={`wb-row wb-agent wb-screenrow${wears && reaction ? " reacted" : ""}`}>
      <div className="wb-hold" {...hold} data-testid="card-hold">
        <ThreadScreen message={m} agent={agent?.name || "Yui"} agentId={agent?.id} light={light} onTap={onTap} live={live} onPage={onPage} fresh={fresh} />
        {wears ? <Badge emoji={reaction} onOpen={(el) => onMenu(m, el)} /> : null}
        {more}
      </div>
    </div>
  );
  if (m.role === "user") {
    const photos = m.local?.length ? m.local : m.photos || [];
    return (
      <div className={`wb-row wb-user${m.pending ? " pending" : ""}${m.failed ? " failed" : ""}`}>
        {m.to ? <div className="wb-to">{m.to}</div> : null}
        {m.about ? <div className="wb-about" data-testid="about-tag">About {m.about}</div> : null}
        {m.screen ? <button className="wb-from-screen" onClick={() => onPage?.(m.screen)}>From screen {m.screen}</button> : null}
        {m.replyTo ? (
          <button type="button" className="wb-replychip" onClick={() => onJump(m.replyTo.msg)} aria-label={`Reply to ${m.replyTo.from === "agent" ? agent?.name || "Yui" : "You"}: ${m.replyTo.quote}. Show the message`} data-testid="reply-chip">
            <b>{m.replyTo.from === "agent" ? agent?.name || "Yui" : "You"}</b><span>{m.replyTo.quote}</span>
          </button>
        ) : null}
        {photos.length ? (
          <div className={`wb-photos n${Math.min(photos.length, 4)}`} data-testid="bubble-photos">
            {photos.map((p, i) => <Picture key={`${m.id}:${i}`} path={m.local?.length ? null : p} local={m.local?.length ? p : null} relay={relay} onOpen={onPicture} />)}
          </div>
        ) : null}
        {m.text ? (
          <div className="wb-hold" {...hold}>
            <div className="wb-bubble">{m.text}</div>
            {more}
          </div>
        ) : null}
        {m.failed ? <div className="wb-sub bad">Not sent.</div> : null}
      </div>
    );
  }
  return (
    <div className={`wb-row wb-agent${wears && reaction ? " reacted" : ""}`}>
      {m.from ? (
        <div className="wb-from">
          <b style={{ color: "var(--mention, inherit)" }}>{m.from.name}</b>
          {m.from.agent && onOpenAgent ? <button type="button" className="wb-openthread" onClick={() => onOpenAgent(m.from.agent)} aria-label={`Open ${m.from.name}'s thread`} data-testid="mention-open">Open its thread ↗</button> : null}
        </div>
      ) : null}
      <div className="wb-hold" {...hold}>
        <div className="wb-bubble"><AgentText text={m.text} /></div>
        {wears ? <Badge emoji={reaction} onOpen={(el) => onMenu(m, el)} /> : null}
        {more}
      </div>
    </div>
  );
}

// The hold menu (Chat/ReactionViews.swift): the six reactions on an agent's message, then Reply and Copy.
function MessageMenu({ menu, agent, reaction, onReact, onReply, onCopy, onClose }) {
  const ref = useRef(null);
  const m = menu.m;
  const canReact = m.role === "agent" && !m.from;
  const [hint, setHint] = useState(reaction ? reactionOf(reaction)?.meaning : "");
  useEffect(() => {
    ref.current?.querySelector("button")?.focus();
    const key = (e) => {
      if (e.key === "Escape") { e.preventDefault(); onClose(); }
      if (e.key === "Tab") { // keep focus inside
        const list = [...ref.current.querySelectorAll("button")];
        const i = list.indexOf(document.activeElement);
        if (e.shiftKey && i <= 0) { e.preventDefault(); list.at(-1).focus(); } else if (!e.shiftKey && i === list.length - 1) { e.preventDefault(); list[0].focus(); }
      }
    };
    document.addEventListener("keydown", key);
    return () => document.removeEventListener("keydown", key);
  }, [onClose]);
  const r = menu.rect;
  const wide = typeof window !== "undefined" && window.matchMedia("(min-width: 761px)").matches;
  const style = wide && r ? { top: Math.min(Math.max(8, r.bottom + 8), window.innerHeight - 220), left: Math.min(Math.max(8, (m.role === "user" ? r.right - 296 : r.left)), window.innerWidth - 304) } : undefined;
  return (
    <div className="wc-menu-wrap" data-testid="msg-menu">
      <button type="button" className="wc-menu-back" aria-label="Close" tabIndex={-1} onClick={onClose} />
      <div className="wc-menu" role="menu" aria-label="Message actions" ref={ref} style={style}>
        {canReact ? (
          <div className="wc-reacts" role="group" aria-label="React">
            {REACTIONS.map((x) => (
              <button type="button" key={x.emoji} role="menuitemradio" aria-checked={reaction === x.emoji} className={`wc-react${reaction === x.emoji ? " on" : ""}`} data-testid={`react-${x.meaning.replace(/\s/g, "-")}`}
                aria-label={`${x.emoji} ${x.meaning}`} onMouseEnter={() => setHint(x.meaning)} onFocus={() => setHint(x.meaning)} onClick={() => onReact(x)}>{x.emoji}</button>
            ))}
          </div>
        ) : null}
        {canReact ? <div className="wc-react-hint" aria-live="polite">{hint || "Your answer to this message"}</div> : null}
        <button type="button" role="menuitem" className="wc-act" data-testid="menu-reply" onClick={onReply}>{Icon.reply}<span>Reply</span></button>
        <button type="button" role="menuitem" className="wc-act" data-testid="menu-copy" onClick={onCopy}>{Icon.copy}<span>Copy</span></button>
        {canReact && reaction ? <button type="button" role="menuitem" className="wc-act" data-testid="menu-unreact" onClick={() => onReact(reactionOf(reaction))}>{Icon.x}<span>Remove reaction</span></button> : null}
      </div>
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

// The field. The words live in the composer store, so typing redraws only this, never the thread above it.
function Composer({ agent, agents, store, waiting, onSend, onSendWords, onStop, offline, inert, commands, onAbout }) {
  const st = useComposerState(store);
  const voice = useVoice({ send: onSendWords, busy: waiting, enabled: !inert });
  const box = useRef(null);
  const grow = () => { const el = box.current; if (el) { el.style.height = "auto"; el.style.height = `${Math.min(el.scrollHeight, 160)}px`; } };
  useEffect(grow, [st.draft]);
  // Answering a message: the field is where the person goes next.
  useEffect(() => { if (st.reply) box.current?.focus(); }, [st.reply]);
  const hints = useMemo(() => store.hints({ agents, current: agent.id, commands }), [st.draft, agents, agent.id, commands]); // eslint-disable-line react-hooks/exhaustive-deps
  const pick = (s) => { store.setDraft(s.fill); box.current?.focus(); };
  const keys = useSuggestKeys(hints.list, pick);
  const ready = (!!st.draft.trim() || st.photos.length > 0) && !st.busy;
  const stop = waiting && !st.draft.trim() && !st.photos.length;
  const submit = () => { if (ready && onSend()) box.current?.focus(); };
  const mic = voice.supported && !ready && !stop && !st.busy;
  const listening = voice.listening || voice.handsFree;
  return (
    <form className="wb-composer" inert={inert || undefined} data-testid="composer" onSubmit={(e) => { e.preventDefault(); stop ? onStop() : submit(); }}>
      {offline ? <div className="wb-offline" role="status">Not sent yet. It goes the moment you're back online.</div> : null}
      <div className="wc-over">
        {keys.open ? <SuggestionList items={hints.list} index={keys.index} onPick={pick} /> : null}
        {!keys.open ? <MentionBar agent={hints.to} /> : null}
        <ReplyBar quote={st.reply} agentName={agent.name} onCancel={() => store.clearReply()} />
        <AboutChip item={st.about} onOpen={() => onAbout?.(st.about)} onRemove={() => store.clearAbout()} />
        <Problem code={st.problem} onClose={() => store.clearProblem()} />
        {voice.problem && !listening ? <div className="wc-problem" role="alert" data-testid="voice-problem"><span>{voiceProblem(voice.problem)}</span></div> : null}
      </div>
      <PhotoTray photos={st.photos} busy={st.busy > 0} onRemove={(id) => store.removePhoto(id)} />
      <div className={`wb-compose${listening ? " listening" : ""}`}>
        {listening ? <VoiceRow voice={voice} agentName={agent.name} onDiscard={voice.discard} /> : (
          <>
            <AttachButton onFiles={(f) => store.addFiles(f)} />
            <textarea ref={box} rows={1} value={st.draft} maxLength={32000} aria-label={`Message ${agent?.name || "Yui"}`} placeholder={`Message ${agent?.name || "Yui"}`}
              role="combobox" aria-expanded={keys.open} aria-controls={keys.open ? "suggestions" : undefined} aria-autocomplete="list" aria-activedescendant={keys.open ? `suggestions-${keys.index}` : undefined}
              enterKeyHint="send" autoCapitalize="sentences"
              onChange={(e) => store.setDraft(e.target.value)}
              onPaste={(e) => { const f = pastedFiles(e); if (f) { e.preventDefault(); store.addFiles(f); } }}
              onKeyDown={(e) => { if (keys.onKey(e)) return; if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) { e.preventDefault(); submit(); } }} />
          </>
        )}
        {mic || listening ? (
          <button type="button" className={`wb-send wc-mic${listening ? " live" : ""}`} data-testid="mic" aria-label={listening ? "Stop listening" : `Talk to ${agent.name}`}
            aria-pressed={listening || undefined} {...voice.mic} style={{ touchAction: "none" }}>{Icon.mic}</button>
        ) : (
          <button className={`wb-send${stop ? " stop" : ""}`} type="submit" disabled={!stop && !ready} aria-label={stop ? "Stop" : "Send"} data-testid="send">
            {stop ? Icon.stop : Icon.up}
          </button>
        )}
      </div>
    </form>
  );
}

export default function ThreadView({ relay, userId, agent, agents = [], outbox = null, cache = null, early = null, chat, light, live = true, view = "chat", setView = () => {}, onMenu = () => {}, onNewChat = null, onOpenAgent = null, onApi = null, landing = null, onLanded = () => {} }) {
  const thread = useMemo(() => new Thread(), [agent.id, chat]);
  const [, tick] = useReducer((n) => n + 1, 0);
  const [net, setNet] = useState({ offline: false, pending: 0 });
  const sync = useMemo(() => new ThreadSync({ relay, thread, userId, agentId: agent.id, chatId: chat || null, outbox, cache, early, onStatus: setNet }), [relay, thread, userId, agent.id, chat, outbox, cache]); // eslint-disable-line react-hooks/exhaustive-deps
  // A music take (YUI-246) uploads to this thread's media and comes back as a signed link.
  useEffect(() => (relay?.upload && relay?.sign ? setTakeHost(relayTakeHost({ relay, userId, agentId: agent.id })) : undefined), [relay, userId, agent.id]);
  useEffect(() => thread.subscribe(tick), [thread]);
  useEffect(() => { sync.start(); return () => sync.stop(); }, [sync]);
  const [toast, setToast] = useState("");
  useEffect(() => { if (!toast) return undefined; const t = setTimeout(() => setToast(""), 2200); return () => clearTimeout(t); }, [toast]);

  // What is being written, per agent: kept across threads and reloads, never redraws the thread (composer.mjs).
  const draftSync = useRef(null);
  const store = useMemo(() => createComposer({ agentId: agent.id, prepare: preparePhoto, onDraft: (words) => { if (words) draftSync.current?.changed(); else draftSync.current?.flush(); } }), [agent.id]);
  useEffect(() => () => store.destroy(), [store]);
  // One Yui across phone and web (YUI-249): the words half typed here are on the phone, and the phone's are here.
  useEffect(() => {
    if (!relay?.state) return undefined;
    const sync = createKeySync({ client: relay.state, userId, agentId: agent.id, key: "draft", device: deviceName(), read: () => store.get().draft, write: (v) => store.adopt(v), at: () => store.draftAt() });
    draftSync.current = sync;
    sync.start();
    return () => { sync.stop(); draftSync.current = null; };
  }, [relay, userId, agent.id, store]);
  const commands = agent.commands;

  const list = thread.messages;
  // Reminders (YUI-246): while this tab is open the Notifications API fires them at their time (a closed tab: Web Push, YUI-248).
  // Sound started on any screen keeps playing across the thread's screens (spec/YL.md section 5, Sound keeps playing);
  // it stops when the person leaves this thread or the page goes.
  useEffect(() => { window.addEventListener("pagehide", stopVoices); return () => { window.removeEventListener("pagehide", stopVoices); stopVoices(); }; }, [agent.id, chat]);
  const reminders = sharedReminders();
  useEffect(() => { reminders?.resume(agent.id); }, [reminders, agent.id]);
  useEffect(() => {
    for (const r of thread.drainReminders()) reminders?.take({ ...r, agent: agent.id, name: agent.name });
  }, [thread.version]); // eslint-disable-line react-hooks/exhaustive-deps
  const marks = useMemo(() => stamps(list), [list, thread.version]);
  const wearers = useMemo(() => thread.wearers(), [list, thread.version]); // eslint-disable-line react-hooks/exhaustive-deps
  const scroller = useRef(null);
  const stuck = useRef(true);
  // A long chat draws its newest rows only (the app's window, YUI-260). Near the top one older batch is drawn per arrival;
  // when everything held is drawn, the next older batch comes from the server (YUI-254). A drag or a trip away re-arms it.
  const [win, setWin] = useState(WINDOW_STEP);
  const base = Math.max(0, list.length - win);
  const shown = base ? list.slice(base) : list;
  const nearTop = useRef(false);
  const topGrown = useRef(false);
  const anchor = useRef(null);
  const grow = useRef(() => {});
  grow.current = () => {
    const el = scroller.current;
    if (!el || !nearTop.current || topGrown.current) return;
    anchor.current = { h: el.scrollHeight, top: el.scrollTop };
    if (list.length > win) { setWin((w) => w + WINDOW_STEP); topGrown.current = true; }
    else if (thread.hasOlder) sync.loadOlder().finally(() => requestAnimationFrame(() => { anchor.current = null; }));
    else anchor.current = null;
  };
  const onScroll = () => {
    const el = scroller.current;
    if (!el) return;
    stuck.current = el.scrollHeight - el.scrollTop - el.clientHeight < 120;
    nearTop.current = el.scrollTop < el.clientHeight;
    if (!nearTop.current) topGrown.current = false;
    grow.current();
  };
  // What the person is reading stays where it is when rows are added above it.
  useLayoutEffect(() => {
    const el = scroller.current, a = anchor.current;
    if (!el || !a || el.scrollHeight <= a.h) return;
    el.scrollTop = a.top + (el.scrollHeight - a.h);
    anchor.current = null;
  }, [win, list.length]);
  useEffect(() => { grow.current(); }, [win, list.length, thread.hasOlder]);
  useEffect(() => {
    const el = scroller.current;
    if (!el) return undefined;
    const rearm = (e) => { if (e.type === "wheel" && e.deltaY > 0) return; topGrown.current = false; nearTop.current = el.scrollTop < el.clientHeight; grow.current(); };
    const kinds = ["wheel", "touchstart", "pointerdown", "keydown"];
    for (const k of kinds) el.addEventListener(k, rearm, { passive: true });
    return () => { for (const k of kinds) el.removeEventListener(k, rearm); };
  }, []);
  // A screen finishing its draw or a picture its load makes the thread taller, below where the person is: stay on
  // the newest message if that is where they were.
  const content = useRef(null);
  useEffect(() => {
    const el = scroller.current, c = content.current;
    if (!el || !c || !window.ResizeObserver) return undefined;
    const ro = new ResizeObserver(() => { if (stuck.current) el.scrollTop = el.scrollHeight; });
    ro.observe(c);
    return () => ro.disconnect();
  }, []);
  // Follow the newest message while the person is at the bottom; a first load always lands there.
  useEffect(() => {
    const el = scroller.current;
    if (el && (stuck.current || thread.version <= 1)) el.scrollTop = el.scrollHeight;
  }, [thread.version, thread.waiting]);

  // The stage is a layer over this record. `seen` is what the record last showed: the rest is the new count
  // on the stage's record button. A chip in the record plays a turn again; "On screen 2" goes to that page.
  const [seen, setSeen] = useState(0);
  const [req, setReq] = useState({ key: 0 });
  useEffect(() => { if (view === "chat") setSeen(list.length); }, [view, list.length]);
  // The shelf: what the thread saved, less what the person took off by hand (per agent, on this device).
  const [removed, setRemoved] = useState(() => loadRemoved(agent.id));
  useEffect(() => setRemoved(loadRemoved(agent.id)), [agent.id]);
  // The shelf's hand-removed names follow the person too (merged by newest time per name).
  const shelfSync = useRef(null);
  useEffect(() => {
    if (!relay?.state) return undefined;
    const sync = createKeySync({ client: relay.state, userId, agentId: agent.id, key: "shelf-removed", device: deviceName(), merge: mergeRemoved,
      read: () => removedText(agent.id), write: (v) => { setRemovedText(agent.id, v); setRemoved(loadRemoved(agent.id)); } });
    shelfSync.current = sync;
    sync.start();
    return () => { sync.stop(); shelfSync.current = null; };
  }, [relay, userId, agent.id]);
  const shelf = useMemo(() => shelfOf(thread.messages, removed), [thread.version, removed]); // eslint-disable-line react-hooks/exhaustive-deps
  const toStage = useCallback((r) => { setReq((q) => ({ ...r, key: q.key + 1 })); setView("stage"); }, [setView]);
  const askOf = (i) => { for (let k = i; k >= 0; k--) if (list[k].role === "user" && !list[k].card) return list[k].id; return null; };
  const stageOn = view === "stage";
  // What was already in the thread when it opened is history: its timers and decks wait as pills. What lands
  // after is new, and takes the whole window by itself (>full, a timer, a deck, a plan), like the phone.
  const oldIds = useRef(null);
  if (thread.loaded && !oldIds.current) oldIds.current = new Set(list.map((m) => m.id));
  const old = oldIds.current || new Set(list.map((m) => m.id));

  // The drawer (YUI-245) reads this thread's menu rows and runs their taps: the same lines the stage's chips
  // send. `api` changes only when the thread does.
  const [dismissed, markDismissed] = useDismissed(agent.id);
  const home = useMemo(() => homeOf(list, dismissed), [thread.version, dismissed]); // eslint-disable-line react-hooks/exhaustive-deps
  // Dismiss and Not yet on a Needs you row (YUI-270): a quiet event to the host, and the row leaves at once.
  const dismiss = useCallback((item) => { sync.tap(dismissEvent(item)); markDismissed(item.id); }, [sync, markDismissed]);
  const notYet = useCallback((item) => { sync.tap(notYetEvent(item), "Not yet"); markDismissed(item.id); }, [sync, markDismissed]);
  const run = useCallback((item, bucket) => {
    const a = bucket === "shortcut" ? chipAction(item, home) : waitingAction(item, home);
    if (a.play) toStage({ ask: a.play });
    else if (a.go) toStage({ page: a.go });
    else if (a.show) toStage({ show: a.show });
    else if (a.compose != null) { if (view === "stage") toStage({ compose: a.compose }); else store.setDraft(a.compose); }
    else if (a.send) { sync.send(a.send); if (view === "stage") toStage({ page: "1" }); }
    else if (a.open) window.open(a.open, "_blank", "noopener,noreferrer");
    else if (a.tap) sync.tap(a.tap, a.said);
  }, [home, sync, store, view, toStage]);
  useEffect(() => {
    onApi?.({ agentId: agent.id, home, run, dismiss, notYet, version: thread.version, loaded: thread.loaded, about: (item) => { store.setAbout(item); setView("chat"); }, send: (words) => sync.send(words), compose: (words) => (view === "stage" ? toStage({ compose: words }) : store.setDraft(words)) });
  }, [home, run, dismiss, notYet, thread.loaded]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => () => onApi?.(null), []); // eslint-disable-line react-hooks/exhaustive-deps

  const onTap = useCallback((ev) => { sync.tap(ev); }, [sync]);
  // The typed message: words, photos, a reply, an @ (compose.mjs). Voice words leave the typed draft alone.
  const onSend = useCallback(() => {
    const out = store.take({ agents, current: agent.id });
    return out ? sync.send(out.text, { photos: out.photos, reply: out.reply, mention: out.mention, about: out.about }) : false;
  }, [store, sync, agents, agent.id]);
  const onSendWords = useCallback((words) => {
    const out = store.take({ words, agents, current: agent.id });
    return out ? sync.send(out.text, { photos: out.photos, reply: out.reply, mention: out.mention, about: out.about }) : false;
  }, [store, sync, agents, agent.id]);
  const onStop = useCallback(() => sync.stopTurn(), [sync]);
  const note = thread.waiting ? waitingNote(agent) : null;

  // ---- the hold menu, photos, jumping back to a quoted message ----
  const [menu, setMenu] = useState(null);
  const [viewer, setViewer] = useState(null);
  const [aboutView, setAboutView] = useState(null);
  const openMenu = useCallback((m, el) => setMenu({ m, rect: el?.getBoundingClientRect?.() || null }), []);
  const closeMenu = useCallback(() => setMenu(null), []);
  const jump = useCallback((msg) => {
    const el = scroller.current?.querySelector(`[data-id="${CSS.escape(msg)}"], [data-id^="${CSS.escape(msg)}#"]`);
    if (!el) { setToast("That message is further up."); return; }
    el.scrollIntoView({ block: "center", behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
    el.classList.remove("flash"); void el.offsetWidth; el.classList.add("flash");
  }, []);
  const wordsOf = (m) => (m.yl != null ? cardWords(m.state).join("\n") : m.text || "");
  const doReply = () => { const q = replyQuote(menu.m); closeMenu(); if (q) store.setReply(q); };
  const doCopy = async () => {
    const text = wordsOf(menu.m);
    closeMenu();
    try { await navigator.clipboard.writeText(text); setToast("Copied"); } catch { setToast("Couldn't copy"); }
  };
  const doReact = (r) => { const id = menu.m.id; closeMenu(); sync.react(id, r); };
  const menuReaction = menu ? thread.reactions.get(rowOf(menu.m.id)) : null;
  useEffect(() => { if (!viewer) return undefined; const k = (e) => e.key === "Escape" && setViewer(null); document.addEventListener("keydown", k); return () => document.removeEventListener("keydown", k); }, [viewer]);

  return (
    <KeepCtx.Provider value={true}>
    <KeptCtx.Provider value={agent.id}>
    <section className="wb-thread" aria-label={`${agent.name}'s thread`} data-loaded={thread.loaded ? "1" : "0"} {...fileDrop((f) => store.addFiles(f))}>
      {!stageOn && shelf.length ? <ShelfBar screens={shelf} onOpen={(name) => toStage({ show: name })} onRemove={(name) => { setRemoved(removeShelf(agent.id, name)); shelfSync.current?.changed(); }} /> : null}
      <div className="wb-scroll" ref={scroller} onScroll={onScroll} inert={stageOn || undefined}>
        <div className="wb-messages" ref={content}>
          {!thread.loaded ? <div className="wb-wait">Opening {agent.name}...</div> : null}
          {thread.loaded && !list.length ? <div className="wb-empty">{agent.firstMessage || `Say hi to ${agent.name}.`}</div> : null}
          {/* On the stage a staged part (a plan, a timer) is drawn by the stage, with its bar; the thread under it does not open a layer of its own over the bar (YUI-283). */}
          {shown.map((m, k) => { const i = base + k; return (
            <div key={m.id} className="wb-item" data-id={m.id}>
              {marks[i]?.day ? <Day label={marks[i].day} /> : null}
              <Bubble m={m} agent={agent} light={light} onTap={onTap} live={live} onPage={(k) => toStage({ page: String(k) })} relay={relay} fresh={!old.has(m.id) && !stageOn}
                reaction={thread.reactions.get(rowOf(m.id))} wears={wearers.get(rowOf(m.id)) === m.id} onMenu={openMenu} onPicture={setViewer} onOpenAgent={onOpenAgent} onJump={jump} />
              {m.role === "agent" && !m.from && (i === list.length - 1 || list[i + 1].role === "user") && askOf(i) ? (
                <button className="wb-play" data-testid="play-on-stage" onClick={() => toStage({ ask: askOf(i) })}>Play on the stage</button>
              ) : null}
              {marks[i]?.time ? <div className={`wb-time ${m.role === "user" ? "user" : ""}`}>{marks[i].time}</div> : null}
            </div>
          ); })}
          {thread.waiting ? <Working agent={agent} thread={thread} onStop={onStop} note={note} /> : thread.lostAsk ? <NoAnswer ask={thread.lostAsk} onTry={(words) => sync.send(words)} /> : null}
        </div>
      </div>
      <Composer agent={agent} agents={agents} store={store} waiting={thread.waiting} onSend={onSend} onSendWords={onSendWords} onStop={onStop} offline={net.offline} inert={stageOn} commands={commands} onAbout={setAboutView} />
      {stageOn ? <StageLayer agent={agent} agents={agents} commands={commands} store={store} thread={thread} sync={sync} light={light} fresh={Math.max(0, list.length - seen)} offline={net.offline} req={req} landing={landing} onLanded={onLanded}
        onRecord={() => setView("chat")} onMenu={onMenu} onNewChat={onNewChat} /> : null}
      {menu ? <MessageMenu menu={menu} agent={agent} reaction={menuReaction} onReact={doReact} onReply={doReply} onCopy={doCopy} onClose={closeMenu} /> : null}
      {viewer ? (
        <div className="wc-viewer" role="dialog" aria-modal="true" aria-label="Photo" onClick={() => setViewer(null)}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={viewer} alt="Photo" />
          <button type="button" className="wc-iconbtn wc-viewer-x" onClick={() => setViewer(null)} aria-label="Close photo" autoFocus>{Icon.x}</button>
        </div>
      ) : null}
      {aboutView ? (
        <Dialog label={aboutView.title} onClose={() => setAboutView(null)} testid="about-view">
          <SheetBar title={aboutView.title} right={<button type="button" className="ag-barbtn" onClick={() => setAboutView(null)}>Done</button>} />
          <div className="ag-body"><p className="ag-hint">{aboutView.areaTitle || aboutView.section}</p><pre className="wc-about-text">{aboutView.text || "Nothing to show."}</pre></div>
        </Dialog>
      ) : null}
      {toast ? <div className="wc-toast" role="status">{toast}</div> : null}
    </section>
    </KeptCtx.Provider>
    </KeepCtx.Provider>
  );
}
