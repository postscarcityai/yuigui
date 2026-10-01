"use client";
// Yui's stage on the web (YUI-243), the app's Stage/StageFirst.swift in a tab. It is a layer over the
// thread (ThreadView keeps the chat underneath as the record). A send puts the stage up on that turn,
// working; the reply plays as chunks (a line and one picture each, ChatStage, the site chat's player);
// the questions come last under one Send. Screen 1 with nothing playing is the agent's home: its face,
// what waits on you, its shortcuts as chips over the bar. Screens 2 to 12 are pages beside it (swipe,
// arrow keys, pills), kept across replies and patched in place (lib/web/stage.mjs). The top bar is the
// agent and the chat record with its new count; the bottom bar is the big mic, T and the pages' own
// talk rule (`>2 talk`, `[yui] screen=2`). Everything here is local: nothing is sent but what the
// person says or taps, through ThreadSync, as the phone sends it.
import dynamic from "next/dynamic";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { answerOf } from "../../lib/chat/stage.mjs";
import { homeOf, chipAction, waitingAction, pageTitle, reopened, turnOf, MAX_WAITING } from "../../lib/web/stage.mjs";
import { liveness, presenceLabel, waitingNote, workingLine } from "../../lib/web/presence.mjs";
import { AttachButton, MentionBar, PhotoTray, Problem, ReplyBar, SuggestionList, Waveform, pastedFiles, useComposerState, useSuggestKeys } from "./ComposerParts";
import { useVoice } from "./useVoice";
import { SETS } from "../../lib/yl/look.mjs";
import { motionLook, motionVars, stageMood } from "../../lib/yl/motion.mjs";
import { RichText } from "../playground/richtext";
import { usePager } from "../components/ChatDots";
import "../playground/stagemotion.css";
import "../playground/draw.css";
import "../components/chat.css";
import "./stage.css";

const StageAnswer = dynamic(() => import("../components/ChatStage"), { ssr: false, loading: () => null });
const PagesView = dynamic(() => import("../components/ChatPages"), { ssr: false, loading: () => null });

const MicIcon = () => <svg viewBox="0 0 24 24" aria-hidden="true"><rect x="8.5" y="3" width="7" height="12" rx="3.5" /><path d="M5.5 11.5a6.5 6.5 0 0 0 13 0M12 18v3" fill="none" strokeWidth="2" strokeLinecap="round" /></svg>;
const TrashIcon = () => <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 7h14M10 7V5h4v2M7 7l1 12h8l1-12M10 11v5M14 11v5" fill="none" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>;
const StopIcon = () => <svg viewBox="0 0 24 24" aria-hidden="true"><rect x="6" y="6" width="12" height="12" rx="2.5" /></svg>;
const RecordIcon = () => <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 5.5h14a1.5 1.5 0 0 1 1.5 1.5v8a1.5 1.5 0 0 1-1.5 1.5H10l-4 3v-3H5A1.5 1.5 0 0 1 3.5 15V7A1.5 1.5 0 0 1 5 5.5z" strokeWidth="2" fill="none" strokeLinejoin="round" /></svg>;
const MenuIcon = () => <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 7h14M5 12h14M5 17h14" strokeWidth="2.2" strokeLinecap="round" fill="none" /></svg>;
const ChevIcon = () => <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 6l6 6-6 6" fill="none" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" /></svg>;

const StageText = ({ text }) => <RichText text={text} />;
const accentOf = (agent) => SETS[agent?.theme?.preset]?.accent || SETS[agent?.color]?.accent || "#FF7E8A";

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

// The mark in the agent's color, the one thing that moves (stage motion): it breathes, turns, sweeps, bursts.
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

function Face({ agent, size = 38 }) {
  return <span className="wb-face" style={{ "--face": accentOf(agent), width: size, height: size, fontSize: size * 0.46 }} aria-hidden="true">{(agent.name || "?").slice(0, 1).toUpperCase()}</span>;
}

// The pills (ScreenPills): one per screen, the first the home, the rest by their titles. The one on show is filled.
function Pills({ names, at, titles, onGo }) {
  const box = useRef(null);
  useEffect(() => {
    const el = box.current?.querySelector(".on");
    el?.scrollIntoView?.({ inline: "center", block: "nearest" });
  }, [at]);
  return (
    <nav className="wb-pills" ref={box} aria-label="Screens">
      {names.map((k, i) => (
        <button key={k} className={`wb-pill${i === at ? " on" : ""}`} aria-current={i === at ? "page" : undefined} onClick={() => i !== at && onGo(i)}>{i === 0 ? "Home" : titles[k]}</button>
      ))}
    </nav>
  );
}

// The agent's home on screen 1 (HomeHead): face, name, what it does, then what is waiting on you.
function HomeHead({ agent, home, quiet, hasScreens, onWaiting, onSeeAll, seeAll }) {
  const list = seeAll ? home.waiting : home.waiting.slice(0, MAX_WAITING);
  return (
    <div className="ys-mid wb-home" data-testid="stage-home">
      <Face agent={agent} size={72} />
      <h2 className="wb-home-name">{agent.name}</h2>
      <p className="wb-home-line">{agent.tagline || presenceLabel(agent)}</p>
      {home.waiting.length ? (
        <div className="wb-waiting" data-testid="home-waiting">
          <div className="wb-waiting-head">
            <b>Waiting on you</b>
            {home.waiting.length > MAX_WAITING && !seeAll ? <button onClick={onSeeAll}>See all {home.waiting.length}</button> : null}
          </div>
          {list.map((w) => (
            <button key={w.id} className="wb-ask" data-testid={`home-menu-${w.id}`} onClick={() => onWaiting(w)}>
              <i aria-hidden="true" />
              <span><b>{w.label}</b>{w.sub ? <small>{w.sub}</small> : null}</span>
              <ChevIcon />
            </button>
          ))}
        </div>
      ) : <p className="wb-quiet" data-testid="home-quiet">{quiet ? quiet : hasScreens ? "Nothing waiting on you. Swipe left for your screens." : "Nothing waiting on you."}</p>}
    </div>
  );
}

function Chips({ items, small, onTap }) {
  if (!items.length) return null;
  return (
    <div className={`wb-chips${small ? " small" : ""}`} data-testid={small ? "home-chips-small" : "home-chips"}>
      {items.map((c) => (
        <button key={c.id} className="wb-chip" data-testid={`home-chip-${c.id}`} onClick={() => onTap(c)} title={c.show ? "Opens that screen" : /\s$/.test(c.say || "") ? "Starts a message to finish" : "Sends it as your message"}>
          <span>{c.label}</span>
        </button>
      ))}
    </div>
  );
}

export default function StageLayer({ agent, agents = [], commands, store, thread, sync, light, fresh, offline, req, onRecord, onMenu }) {
  const reduced = useReduced();
  const look = useMemo(() => motionLook(agent.theme || {}, null, reduced), [agent.theme, reduced]);
  const accent = accentOf(agent);
  const messages = thread.messages;
  const version = thread.version;
  const home = useMemo(() => homeOf(messages), [version]); // eslint-disable-line react-hooks/exhaustive-deps
  const names = useMemo(() => ["1", ...home.pages], [home.pages]);
  const titles = useMemo(() => Object.fromEntries(home.pages.map((k) => [k, pageTitle(home.state, k)])), [home]);

  // ---- what the stage plays: nothing (the home), a turn, or a saved screen back ----
  const [ask, setAsk] = useState(null);
  const [shown, setShown] = useState(null);   // { name, state } a saved screen reopened with no turn
  const [playKey, setPlayKey] = useState(0);
  const [found, setFound] = useState(false);
  const [ended, setEnded] = useState(false);
  const [seeAll, setSeeAll] = useState(false);
  const newest = useMemo(() => { for (let i = messages.length - 1; i >= 0; i--) if (messages[i].role === "user" && !messages[i].card) return messages[i].id; return null; }, [version]); // eslint-disable-line react-hooks/exhaustive-deps
  const base = useRef(undefined);
  useEffect(() => {
    if (!thread.loaded) return;
    if (base.current === undefined) {
      base.current = newest;
      // Opened mid-turn: the stage is already working on it.
      if (thread.waiting && newest) setAsk(newest);
      return;
    }
    if (newest && newest !== base.current) {
      base.current = newest;
      setAsk(newest); setShown(null); setEnded(false); setPlayKey((k) => k + 1); setPageAt("1");
    }
  }, [thread.loaded, newest]); // eslint-disable-line react-hooks/exhaustive-deps
  // From the record: "Play on the stage" plays that turn again from its first part; "On screen 2" goes there.
  useEffect(() => {
    if (!req?.key) return;
    if (req.page) { setPageAt(req.page); return; }
    setAsk(req.ask); setShown(null); setEnded(false); setPlayKey((k) => k + 1); setPageAt("1");
  }, [req?.key]); // eslint-disable-line react-hooks/exhaustive-deps

  const turn = useMemo(() => (ask ? turnOf(messages, ask) : null), [ask, version]); // eslint-disable-line react-hooks/exhaustive-deps
  const answer = useMemo(() => {
    if (shown) return answerOf([{ state: shown.state }]);
    if (!turn || !turn.replies) return null;
    const a = answerOf(turn.pieces);
    return a.chunks.length || a.questions.length ? a : null;
  }, [shown, turn]);
  const sentAt = shown ? null : turn?.at || null;

  // ---- the bar ----
  const [pageAt, setPageAt] = useState("1");
  const [typing, setTyping] = useState(false);
  const [secs, setSecs] = useState(0);
  const [toast, setToast] = useState("");
  const input = useRef(null);
  const st = useComposerState(store);
  const draft = st.draft;
  const busy = thread.waiting;
  const sayRef = useRef(() => false);
  const voice = useVoice({ send: (w) => sayRef.current(w), busy });
  const at = Math.max(0, names.indexOf(pageAt));
  const onHomeScreen = at === 0;
  const canTalk = onHomeScreen || home.talk.includes(pageAt);
  const goIndex = useCallback((i) => setPageAt(names[Math.min(Math.max(i, 0), names.length - 1)] || "1"), [names]);
  const pager = usePager(names.length, at, goIndex);
  useEffect(() => { if (!names.includes(pageAt)) setPageAt("1"); }, [names, pageAt]);
  // A reply that sends a line to a page brings it forward; a patch or a redraw beside an answer does not.
  const forwarded = useRef(null);
  useEffect(() => {
    if (home.forward && forwarded.current !== `${home.forward}:${version}` && base.current !== undefined && thread.loaded) {
      forwarded.current = `${home.forward}:${version}`;
      if (!answerAfter(thread, ask)) setPageAt(home.forward);
    }
  }, [home.forward, version]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { if (typing) setTimeout(() => input.current?.focus(), 30); }, [typing]);
  // No voice here (Firefox): the field is the way in, so it starts open.
  useEffect(() => { if (!voice.supported && onHomeScreen) setTyping(true); }, [voice.supported]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (!busy) return undefined;
    const t0 = Date.now();
    setSecs(0);
    const t = setInterval(() => setSecs(Math.floor((Date.now() - t0) / 1000)), 250);
    return () => clearInterval(t);
  }, [busy]);
  // The beat between the reply landing and its first chunk.
  const wasBusy = useRef(false);
  useEffect(() => {
    if (wasBusy.current && !busy && ask) { setFound(true); const t = setTimeout(() => setFound(false), reduced ? 0 : 650); wasBusy.current = false; return () => clearTimeout(t); }
    wasBusy.current = busy;
    return undefined;
  }, [busy]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { if (!toast) return undefined; const t = setTimeout(() => setToast(""), 2600); return () => clearTimeout(t); }, [toast]);

  // ---- sending ----
  const here = useRef("1");
  here.current = !onHomeScreen && canTalk ? pageAt : "1";
  const agentsRef = useRef(agents);
  agentsRef.current = agents;
  // Everything the person has put in the bar (words, photos, a reply, an @) goes as one message, on the page
  // that keeps talking when it is one (`>2 talk`, `[yui] screen=2`). Voice words leave the typed draft alone.
  const say = useCallback((words = null) => {
    const out = store.take({ words, agents: agentsRef.current, current: agent.id });
    if (!out) return false;
    const k = here.current;
    return sync.send(out.text, { photos: out.photos, reply: out.reply, mention: out.mention, ...(k !== "1" ? { screen: k } : {}) });
  }, [sync, store, agent.id]);
  sayRef.current = say;
  const listening = voice.listening || voice.handsFree;
  const heard = voice.words;
  const blocked = voice.phase === "denied";
  const hints = useMemo(() => store.hints({ agents, current: agent.id, commands }), [st.draft, agents, agent.id, commands]); // eslint-disable-line react-hooks/exhaustive-deps
  const pick = (sug) => { store.setDraft(sug.fill); input.current?.focus(); };
  const keys = useSuggestKeys(hints.list, pick);
  const tap = useCallback((ev, said) => { sync.tap(ev, said); }, [sync]);
  const answerAll = useCallback((events) => { for (const ev of events) sync.tap(ev); }, [sync]);
  const stop = useCallback(() => sync.stopTurn(), [sync]);
  const ready = (!!draft.trim() || st.photos.length > 0) && !st.busy;
  const submit = (e) => {
    e?.preventDefault();
    if (!ready) return;
    if (say()) { if (voice.supported) setTyping(false); }
  };
  const discard = voice.discard;

  // ---- home taps ----
  const tapChip = (item) => {
    const a = chipAction(item, home);
    if (a.go) goIndex(names.indexOf(a.go));
    else if (a.show) { const s = reopened(messages, a.show); if (s) { setShown({ name: a.show, state: s }); setAsk(null); setEnded(false); setPlayKey((k) => k + 1); setPageAt("1"); } }
    else if (a.compose) { store.setDraft(a.compose); setTyping(true); }
    else if (a.send) { setPageAt("1"); sync.send(a.send); }
  };
  const tapWaiting = (item) => {
    const a = waitingAction(item, home);
    if (a.show) { const s = reopened(messages, a.show); if (s) { setShown({ name: a.show, state: s }); setAsk(null); setPlayKey((k) => k + 1); setPageAt("1"); } }
    else if (a.open) window.open(a.open, "_blank", "noopener,noreferrer");
    else if (a.tap) tap(a.tap, a.said);
  };
  // Back to the agent's home (YUI-195): the answer goes down, nothing is sent, the record keeps it.
  const goHome = useCallback(() => { setAsk(null); setShown(null); setEnded(false); setFound(false); }, []);

  // ---- keys ----
  const nav = useRef({});
  useEffect(() => {
    const onKey = (e) => {
      const tag = e.target?.tagName || "";
      const typingNow = /^(INPUT|TEXTAREA|SELECT)$/.test(tag) || e.target?.isContentEditable;
      if (e.key === "Escape") {
        if (document.querySelector(".wb-stage .yl-stage.open")) return;
        if (listening) discard();
        else if (typing && voice.supported) setTyping(false);
        else if (answer && onHomeScreen) goHome();
        return;
      }
      if ((e.key === "ArrowRight" || e.key === "ArrowLeft") && !typingNow) {
        const v = nav.current;
        if (v.n > 1 && !document.querySelector(".wb-stage .yl-stage.open") && !(v.at === 0 && v.stageUp)) v.go(v.at + (e.key === "ArrowRight" ? 1 : -1));
        return;
      }
      if (!typing && e.key.length === 1 && !e.metaKey && !e.ctrlKey && !e.altKey && !typingNow && e.key !== " " && canTalk) setTyping(true);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [typing, voice.supported, listening, answer, onHomeScreen, canTalk, goHome]); // eslint-disable-line react-hooks/exhaustive-deps

  // ---- what the middle shows ----
  const failed = false;
  const stoppedNow = turn?.stopped && !busy && !answer;
  const mood = (() => {
    const t = voice.listening ? { listening: true } : busy ? { sent: true, doing: thread.doing } : found ? { sent: true, arrived: true } : answer ? { sent: true, chunk: 0 } : failed ? { failed: true } : {};
    return stageMood(t);
  })();
  const stageUp = !!answer;
  const parts = answer ? answer.chunks.length : 0;
  nav.current = { at, n: names.length, stageUp, go: goIndex };
  const note = busy ? waitingNote(agent) : null;
  const working = busy && !answer;

  let center;
  if (voice.listening) {
    center = (
      <div className="ys-mid" data-testid="stage-listening">
        <Presence mood="listen" />
        <div className="ys-heard">{heard || " "}<span className="mo-caret" /></div>
        <Waveform levels={voice.levels} />
      </div>
    );
  } else if (working || (found && !answer)) {
    center = (
      <div className="ys-mid" data-testid="stage-working">
        <Presence mood={mood.mood} flavor={mood.flavor} />
        <div className="ys-word" key={mood.mood}>
          {mood.mood === "found" ? "Here it is" : thread.doing ? workingLine(thread.doing, agent) : "Thinking"}
          {mood.mood === "found" ? null : <span className="ys-secs"> · {secs}s</span>}
        </div>
        {note ? <div className="ys-sub">{note}</div> : null}
      </div>
    );
  } else if (answer) {
    center = (
      <>
        <StageAnswer key={`${shown ? `show:${shown.name}` : ask}:${playKey}`} answer={answer} agent={agent.name} live onTap={tap} onAnswers={answerAll}
          Text={StageText} active={!typing && onHomeScreen} onEdge={(d) => goIndex(at + d)} onHome={goHome} onEnd={setEnded} at={sentAt} />
        {onHomeScreen && ended && !listening ? <button className="ys-homeq" onClick={goHome}>Back to home</button> : null}
      </>
    );
  } else {
    center = (
      <HomeHead agent={agent} home={home} hasScreens={home.pages.length > 0} seeAll={seeAll} onSeeAll={() => setSeeAll(true)} onWaiting={tapWaiting}
        quiet={stoppedNow ? "Stopped." : turn && turn.replies && !stageUp ? "Anything else?" : ""} />
    );
  }

  const chips = home.chips;
  const showChips = onHomeScreen && !listening && !working && chips.length > 0;
  const status = presenceLabel(agent);

  return (
    <section className={`wb-stage ys p-${look.pulse} e-${look.enter}${look.reduced ? " mo-still" : ""}`} aria-label={`${agent.name} on the stage`} data-testid="stage" data-mood={mood.mood}
      style={{ "--mo-c": accent, "--accent": accent, ...motionVars(look) }}>
      {mood.mood !== "idle" ? <span className="mo-wash" key={`wash:${version > 0 ? messages.length : 0}`} /> : null}
      <div className="wb-stage-in">
        <header className="ys-top">
          <button className="ys-round wb-stage-menu" onClick={onMenu} aria-label="Your agents"><MenuIcon /></button>
          <div className="wb-stage-title" data-testid="stage-agent">
            <Face agent={agent} size={34} />
            <div className="ys-who"><strong>{agent.name}</strong><span><i className={`wb-dot ${liveness(agent)}`} />{status}</span></div>
          </div>
          <button className="ys-round ys-rec" onClick={onRecord} aria-label={`Chat record${fresh > 0 ? `, ${fresh} new` : ""}`} data-testid="stage-record">
            <RecordIcon />{fresh > 0 ? <i>{fresh}</i> : null}
          </button>
        </header>
        {names.length > 1 ? <Pills names={names} at={at} titles={titles} onGo={goIndex} /> : null}
        <div className="ys-center" aria-live="polite">
          <div className="ys-pager" ref={pager.box} {...pager.handlers} data-drag={pager.dragging ? "1" : undefined} style={{ "--at": at, "--drag": `${pager.drag}px` }}>
            <div className="ys-track">
              <div className="ys-slide" aria-hidden={!onHomeScreen || undefined} inert={!onHomeScreen}>{center}</div>
              {home.pages.length ? <PagesView state={home.state} pages={home.pages} at={at} onTap={tap} agent={agent.name} /> : null}
            </div>
          </div>
        </div>
        {showChips ? <Chips items={chips} small={!!answer || (!!turn && !!turn.replies)} onTap={tapChip} /> : null}
        {canTalk && !voice.listening ? (
          <div className="wc-over wc-over-stage">
            {keys.open ? <SuggestionList items={hints.list} index={keys.index} onPick={pick} /> : null}
            {!keys.open ? <MentionBar agent={hints.to} /> : null}
            <ReplyBar quote={st.reply} agentName={agent.name} onCancel={() => store.clearReply()} />
            <Problem code={st.problem} onClose={() => store.clearProblem()} />
            <PhotoTray photos={st.photos} busy={st.busy > 0} onRemove={(id) => store.removePhoto(id)} />
          </div>
        ) : null}
        {typing && canTalk && !voice.listening ? (
          <form className="yc-input ys-field" onSubmit={submit} data-testid="stage-field">
            <AttachButton onFiles={(f) => store.addFiles(f)} className="ys-small ys-attach" testId="stage-attach" />
            <textarea ref={input} rows={1} value={draft} maxLength={32000} placeholder={`Message ${agent.name}`} aria-label={`Message ${agent.name}`}
              role="combobox" aria-expanded={keys.open} aria-controls={keys.open ? "suggestions" : undefined} aria-autocomplete="list" aria-activedescendant={keys.open ? `suggestions-${keys.index}` : undefined}
              enterKeyHint="send"
              onChange={(e) => store.setDraft(e.target.value)}
              onPaste={(e) => { const f = pastedFiles(e); if (f) { e.preventDefault(); store.addFiles(f); } }}
              onKeyDown={(e) => { if (keys.onKey(e)) return; if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) submit(e); }} />
            {busy && !ready ? <button type="button" className="yc-send yc-stop" onClick={stop} aria-label="Stop"><StopIcon /></button>
              : <button className="yc-send" disabled={!ready} aria-label="Send" data-testid="stage-send">↑</button>}
            {voice.supported ? <button type="button" className="ys-small" onClick={() => setTyping(false)} aria-label="Back to the mic"><MicIcon /></button> : null}
          </form>
        ) : (
          <div className="ys-bottom" data-talk={canTalk ? undefined : "off"}>
            <div className="ys-dotroom" data-arrows={onHomeScreen && stageUp && parts > 1 ? "1" : undefined} />
            {canTalk ? <>
              {voice.listening
                ? <button className="ys-small ys-trash" onClick={discard} aria-label="Cancel, throw away what I said" data-testid="stage-trash"><TrashIcon /></button>
                : <button className="ys-small ys-t" onClick={() => setTyping(true)} aria-label="Type" data-testid="stage-type">T</button>}
              {busy && !voice.listening && !voice.handsFree ? <button className="ys-mic ys-stop" onClick={stop} aria-label="Stop"><StopIcon /></button>
                : voice.supported ? (
                  <button type="button" className={`ys-mic${voice.listening ? " live" : ""}${voice.cancel ? " cancel" : ""}`} data-testid="stage-mic" aria-pressed={listening || undefined}
                    aria-label={listening ? "Stop listening" : `Talk to ${agent.name}`} {...voice.mic} style={{ touchAction: "none" }}>
                    <span className="mo-ring" /><span className="mo-ring r2" />
                    <MicIcon />
                  </button>
                ) : null}
              {!voice.listening ? <AttachButton onFiles={(f) => store.addFiles(f)} className="ys-small ys-attach" testId="stage-attach" /> : null}
            </> : null}
          </div>
        )}
        <p className="yc-note ys-hint" data-testid="stage-hint">
          {offline ? "Not sent yet. It goes the moment you're back online."
            : !canTalk ? "Swipe back to the home to talk."
            : voice.cancel ? "Let go to throw it away."
            : voice.handsFree && !voice.listening ? `Hands-free is on. Tap the mic to end it.`
            : webMicLine({ supported: voice.supported, listening: voice.listening, free: voice.handsFree, heard, blocked })}
        </p>
        {toast ? <div className="ys-went" role="status">{toast}</div> : null}
      </div>
    </section>
  );
}

// The line under the bar (the app's hold to talk: lib/chat/stage.mjs micLine says it for the site chat).
function webMicLine({ supported, listening, free, heard, blocked }) {
  if (listening) return free ? (heard ? "Listening. It sends when you pause." : "Listening. Go ahead, I'll send it when you pause.") : "Listening. Let go to send, slide left to cancel.";
  if (blocked) return "The mic is blocked. Allow it in the address bar, or type.";
  if (!supported) return "Voice needs Chrome or Safari here. Type instead.";
  return "Hold the mic to talk, tap it for hands-free, or T to type.";
}

// Did an agent reply land after the person's last words, with something to play on the stage?
function answerAfter(thread, ask) {
  if (!ask) return false;
  const t = turnOf(thread.messages, ask);
  if (!t.replies) return false;
  const a = answerOf(t.pieces);
  return a.chunks.length > 0 || a.questions.length > 0;
}
