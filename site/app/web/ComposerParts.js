"use client";
// The composer's pieces (YUI-244), shared by the thread's field (ThreadView) and the stage's bar
// (StageLayer): what is attached, the reply being answered, who an @ goes to, the / and @ suggestions,
// the waveform while the mic is open. The words themselves live in the store (lib/web/composer.mjs).
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { mentionPresence } from "../../lib/web/compose.mjs";
import { photoProblem } from "../../lib/web/photo.mjs";
import { SETS } from "../../lib/yl/look.mjs";

export const useComposerState = (store) => useSyncExternalStore(store.subscribe, store.get, store.get);

export const accentOfAgent = (a) => SETS[a?.theme?.preset]?.accent || SETS[a?.color]?.accent || "#FF7E8A";

export const Icon = {
  mic: <svg viewBox="0 0 24 24" aria-hidden="true"><rect x="8.5" y="3" width="7" height="12" rx="3.5" /><path d="M5.5 11.5a6.5 6.5 0 0 0 13 0M12 18v3" fill="none" strokeWidth="2" strokeLinecap="round" /></svg>,
  plus: <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5v14M5 12h14" fill="none" strokeWidth="2.4" strokeLinecap="round" /></svg>,
  trash: <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 7h14M10 7V5h4v2M7 7l1 12h8l1-12M10 11v5M14 11v5" fill="none" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>,
  x: <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" fill="none" strokeWidth="2.4" strokeLinecap="round" /></svg>,
  reply: <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M10 6L4 12l6 6M4 12h10a6 6 0 0 1 6 6" fill="none" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" /></svg>,
  up: <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 19V6M6 11.5l6-6 6 6" fill="none" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" /></svg>,
  stop: <svg viewBox="0 0 24 24" aria-hidden="true"><rect x="6" y="6" width="12" height="12" rx="2.5" /></svg>,
  at: <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="3.6" fill="none" strokeWidth="2" /><path d="M15.6 8.5v4.6a2.4 2.4 0 0 0 4.8 0V12a8.4 8.4 0 1 0-3.4 6.7" fill="none" strokeWidth="2" strokeLinecap="round" /></svg>,
  more: <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="5.5" cy="12" r="1.8" /><circle cx="12" cy="12" r="1.8" /><circle cx="18.5" cy="12" r="1.8" /></svg>,
  copy: <svg viewBox="0 0 24 24" aria-hidden="true"><rect x="8" y="8" width="11" height="11" rx="2.5" fill="none" strokeWidth="2" /><path d="M5 15V6.5A1.5 1.5 0 0 1 6.5 5H15" fill="none" strokeWidth="2" strokeLinecap="round" /></svg>,
};

// The mic's loudness over the last couple of seconds, one bar each (TalkWaveform.swift).
export function Waveform({ levels, live = true }) {
  const bars = levels.length ? levels : [];
  return (
    <div className="wc-wave" role="img" aria-label={live ? "Listening" : "Waveform"}>
      {Array.from({ length: 36 }, (_, i) => {
        const v = bars[bars.length - 36 + i] ?? 0;
        return <i key={i} style={{ height: `${10 + Math.min(1, v) * 90}%` }} />;
      })}
    </div>
  );
}

const clock = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

// The row that takes the field's place while the mic is open: trash, the words as they are heard, the
// waveform and the clock. Hold: slide left to cancel. Hands-free: it says so and how to end it.
export function VoiceRow({ voice, agentName, onDiscard }) {
  const free = voice.handsFree;
  const state = voice.hf;
  const label = voice.cancel ? "Let go to throw it away"
    : voice.words ? voice.words
    : free ? (state === "waiting" || state === "sending" ? `Waiting for ${agentName}…` : state === "reading" ? "Reading…" : "Listening… talk, I'll send it when you pause")
    : "Listening… let go to send, slide left to cancel";
  return (
    <div className={`wc-voice${voice.cancel ? " cancel" : ""}`} data-testid="voice-row" data-hf={free ? state : "hold"} role="status" aria-live="polite">
      <button type="button" className="wc-iconbtn wc-trash" onClick={onDiscard} aria-label="Cancel, throw away what I said">{Icon.trash}</button>
      <div className="wc-voice-mid">
        <div className="wc-heard" data-testid="voice-words">{label}</div>
        <Waveform levels={voice.levels} />
      </div>
      <span className="wc-clock">{clock(voice.secs)}</span>
    </div>
  );
}

export function PhotoTray({ photos, busy, onRemove }) {
  if (!photos.length && !busy) return null;
  return (
    <div className="wc-tray" data-testid="photo-tray" aria-label={`${photos.length} photo${photos.length === 1 ? "" : "s"} attached`}>
      {photos.map((p) => (
        <span key={p.id} className="wc-thumb" data-testid="photo-thumb">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={p.preview} alt="Attached photo" />
          <button type="button" className="wc-thumb-x" onClick={() => onRemove(p.id)} aria-label="Remove photo">{Icon.x}</button>
        </span>
      ))}
      {busy ? <span className="wc-thumb wc-thumb-wait" aria-label="Preparing a photo" /> : null}
    </div>
  );
}

export function ReplyBar({ quote, agentName, onCancel }) {
  if (!quote) return null;
  return (
    <div className="wc-reply" data-testid="reply-bar">
      {Icon.reply}
      <span className="wc-reply-words">
        <b>Replying to {quote.fromUser ? "You" : agentName}</b>
        <small>{quote.quote}</small>
        {quote.rows?.length ? <small className="rows">{quote.rows.join(" · ")}</small> : null}
      </span>
      <button type="button" className="wc-iconbtn" onClick={onCancel} aria-label="Cancel reply" data-testid="reply-cancel">{Icon.x}</button>
    </div>
  );
}

export function MentionBar({ agent }) {
  if (!agent) return null;
  return (
    <div className="wc-mention" data-testid="mention-bar">
      <span className="wb-face" style={{ "--face": accentOfAgent(agent), width: 24, height: 24, fontSize: 12, borderRadius: 9 }} aria-hidden="true">{agent.name.slice(0, 1).toUpperCase()}</span>
      <b>Goes to {agent.name}</b>
      <small>{mentionPresence(agent)}</small>
    </div>
  );
}

// The / and @ suggestions over the field (SuggestionPopover). Arrow keys and Enter drive it from the field.
export function SuggestionList({ items, index, onPick, id = "suggestions" }) {
  const box = useRef(null);
  useEffect(() => { box.current?.querySelector("[aria-selected=true]")?.scrollIntoView?.({ block: "nearest" }); }, [index]);
  if (!items.length) return null;
  return (
    <div className="wc-suggest" role="listbox" aria-label={items[0].kind === "mention" ? "Your agents" : "Commands"} id={id} ref={box} data-testid={items[0].kind === "mention" ? "mention-list" : "slash-list"}>
      {items.map((s, i) => (
        <button type="button" key={`${s.kind}:${s.id}`} role="option" aria-selected={i === index} id={`${id}-${i}`} className={`wc-sug${i === index ? " on" : ""}`}
          data-testid={`${s.kind === "mention" ? "mention" : "slash"}-${s.id}`}
          onMouseDown={(e) => e.preventDefault()} onClick={() => onPick(s)}>
          {s.agent ? <span className="wb-face" style={{ "--face": accentOfAgent(s.agent), width: 32, height: 32, fontSize: 15, borderRadius: 11 }} aria-hidden="true">{s.agent.name.slice(0, 1).toUpperCase()}</span> : null}
          <span className="wc-sug-words">
            <span className="wc-sug-head"><b>{s.title}</b>{s.hint ? <small>{s.hint}</small> : null}</span>
            {s.detail ? <span className="wc-sug-detail">{s.detail}</span> : null}
          </span>
        </button>
      ))}
    </div>
  );
}

// Up and down choose, Enter or Tab takes, Escape closes: returns { index, onKey } for the field.
export function useSuggestKeys(items, pick) {
  const [index, setIndex] = useState(0);
  const [closed, setClosed] = useState("");
  const key = items.map((s) => s.id).join("|");
  useEffect(() => { setIndex(0); }, [key]);
  const open = items.length > 0 && closed !== key;
  const onKey = (e) => {
    if (!open) return false;
    if (e.key === "ArrowDown") { e.preventDefault(); setIndex((i) => (i + 1) % items.length); return true; }
    if (e.key === "ArrowUp") { e.preventDefault(); setIndex((i) => (i - 1 + items.length) % items.length); return true; }
    if (e.key === "Tab" || (e.key === "Enter" && !e.shiftKey && !e.nativeEvent?.isComposing)) { e.preventDefault(); pick(items[Math.min(index, items.length - 1)]); return true; }
    if (e.key === "Escape") { e.preventDefault(); setClosed(key); return true; }
    return false;
  };
  return { open, index, onKey };
}

// The + button and the file input behind it. A phone's picker offers the camera and the library.
export function AttachButton({ onFiles, disabled, className = "wc-iconbtn wc-attach", label = "Attach photos", testId = "attach" }) {
  const input = useRef(null);
  return (
    <>
      <input ref={input} type="file" accept="image/*" multiple hidden data-testid={`${testId}-input`} tabIndex={-1}
        onChange={(e) => { const files = [...e.target.files]; e.target.value = ""; if (files.length) onFiles(files); }} />
      <button type="button" className={className} onClick={() => input.current?.click()} disabled={disabled} aria-label={label} data-testid={testId}>{Icon.plus}</button>
    </>
  );
}

// Files dropped on the thread and pictures pasted into a field become attachments.
export function fileDrop(onFiles) {
  const has = (e) => [...(e.dataTransfer?.types || [])].includes("Files");
  return {
    onDragOver(e) { if (has(e)) { e.preventDefault(); e.dataTransfer.dropEffect = "copy"; } },
    onDrop(e) { if (!has(e)) return; e.preventDefault(); const files = [...e.dataTransfer.files]; if (files.length) onFiles(files); },
  };
}
export function pastedFiles(e) {
  const files = [...(e.clipboardData?.files || [])].filter((f) => f.type.startsWith("image/"));
  return files.length ? files : null;
}

export const Problem = ({ code, onClose }) => code ? (
  <div className="wc-problem" role="alert" data-testid="photo-problem">
    <span>{photoProblem(code)}</span>
    <button type="button" className="wc-iconbtn" onClick={onClose} aria-label="Dismiss">{Icon.x}</button>
  </div>
) : null;
