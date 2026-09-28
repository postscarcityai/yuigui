"use client";

// Basil's week (YL.md section 5, YUI-183, SITE-81): the runtime's answer to a
// sent meal plan, played on the stage. Inside a deck, a question with its own
// title is a page of the deck, so each day plays in turn and a tap on a meal
// sends its swap at once (before, the days were gathered under "3 quick
// questions, one Send" and a swap never went). The Pages tab is the other
// half: the reply has words for the chat and redraws This week and Groceries,
// so the person stays on the answer; the same redraw alone brings Groceries
// forward. Both come from the reference functions (stageChunks, pageForward),
// so what the site shows is what the tests check.

import { useEffect, useMemo, useRef, useState } from "react";
import { apply, initialState, pageForward, pageOf, parse, standingPages } from "../../lib/yl/yl.mjs";
import { stageChunks } from "../../lib/yl/chunks.mjs";
import { BASIL_KNOWN, BASIL_SAYS } from "../../lib/yl/basil-week.mjs";
import { Render } from "./presets";
import { question, show } from "./flows";
import { ScreenCtx } from "./science";
import "./stagefirst.css";
import "./weekdeck.css";

export const WEEKDECK_VIEWS = [
  ["deck", "The week deck"],
  ["pages", "His pages"],
];

const BASIL = "#2FB58C";
const NAMES = { 1: "Chat", 2: "Today", 3: "This week", 4: "Groceries" };

// The reply read once: its ops, the nodes by screen, the stage chunks.
function readReply(text) {
  const ops = parse(text, BASIL_KNOWN);
  let s = initialState();
  for (const op of ops) s = apply(s, op);
  const chat = Object.entries(s.screens).filter(([k]) => pageOf(k) === 1).flatMap(([, l]) => l).sort((a, b) => a.seq - b.seq);
  return { ops, screens: s.screens, ...stageChunks(chat) };
}

// The same reply with only the lines that redraw his pages: no words, no deck.
const redrawOnly = (text) => text.split("\n").filter((l) => /^(>|save )/.test(l) || /^\S+@(wk|week-plan|groc|aisle)/.test(l)).join("\n");

function Chunk({ c, emitFor }) {
  return (
    <div className="sf-chunk wd-chunk">
      {c.pic ? <div className="sf-pic"><Render node={c.pic} emit={emitFor(c.pic)} /></div> : null}
      {c.line ? <div className={`sf-line ${c.pic ? "" : "alone"}`}>{c.line}</div> : null}
      {c.page?.body ? <div className="sf-body">{c.page.body}</div> : null}
      {c.page?.points?.length ? <ul className="sf-points">{[].concat(c.page.points).map((t, i) => <li key={i}>{t}</li>)}</ul> : null}
    </div>
  );
}

function Dots({ pages, on, onPick }) {
  return (
    <div className="wd-dots" role="tablist" aria-label="Basil's screens">
      {pages.map((n) => (
        <button key={n} role="tab" aria-selected={n === on} className={n === on ? "on" : ""} onClick={() => onPick(n)}>{NAMES[n] || `Screen ${n}`}</button>
      ))}
    </div>
  );
}

export function WeekDeckDemo({ text, view, onEvent }) {
  const reply = useMemo(() => readReply(text), [text]);
  const [at, setAt] = useState(0);
  const [sent, setSent] = useState([]); // swaps that went, newest last
  const [toast, setToast] = useState(null);
  const [alone, setAlone] = useState(false); // Pages: the redraw sent with no words
  const [page, setPage] = useState(null); // Pages: the page the person swiped to (null: where the reply left them)
  const timer = useRef(null);
  useEffect(() => () => clearTimeout(timer.current), []);
  useEffect(() => { setAt(0); setSent([]); setToast(null); setAlone(false); setPage(null); }, [view, text]);

  // A tap on a day's meal goes at once, as its own event: no Send to wait for.
  const emitFor = (node) => (v) => {
    const ev = { id: node.id, preset: node.preset, ...v };
    onEvent(ev);
    const day = node.props.tag || node.props.title || "";
    setSent((s) => [...s, `${day}: ${show(v.choice ?? v.picked)}`]);
    setToast(`Swap sent: ${show(v.choice ?? v.picked)}. Basil answers with a new meal.`);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setToast(null), 2600);
  };

  const n = reply.chunks.length;
  const c = reply.chunks[Math.min(at, n - 1)];
  const ctx = { nodes: [], tables: {}, data: {}, write: () => {}, agent: "Basil", screen: "full", dispatch: () => {}, fold: () => {}, closeStage: () => {} };

  let body;
  if (view === "pages") {
    const ops = alone ? parse(redrawOnly(text), BASIL_KNOWN) : reply.ops;
    const fwd = pageForward(ops);
    const standing = standingPages(ops);
    const shownPage = page ?? fwd ?? 1;
    const pages = [1, 2, ...Object.keys(reply.screens).map(Number).filter((k) => k > 2)].sort((a, b) => a - b);
    const nodes = (reply.screens[String(shownPage)] || []).filter((x) => !x.stage);
    body = (
      <div className="wd-pages">
        <Dots pages={pages} on={shownPage} onPick={setPage} />
        <div className="wd-why">
          {fwd == null
            ? <>Words for the chat, and {standing.map((s) => NAMES[s]).join(" and ")} drawn again: you stay on the answer.</>
            : <>{alone ? "The redraw alone" : "This reply"} brings {NAMES[fwd]} forward.</>}
        </div>
        <div className="wd-page">
          {shownPage === 1 ? (
            alone ? <div className="wd-empty">Nothing new in the chat this time.</div> : (
              <>
                <div className="yl-me">Plan my week</div>
                <div className="wd-say">{BASIL_SAYS}</div>
                <div className="wd-deckpill">This week&apos;s meals · {n} pages</div>
              </>
            )
          ) : shownPage === 2 ? (
            <div className="wd-empty">Today is patched in place: calories, macros, the next meal.</div>
          ) : nodes.map((x) => <div key={x.key} className="wd-node"><Render node={x} emit={() => {}} /></div>)}
        </div>
        {standing.includes(String(shownPage)) ? <div className="wd-note">A saved page: its buttons are tools, not questions waiting on you.</div> : null}
        <button className="wd-toggle" onClick={() => { setAlone(!alone); setPage(null); }}>
          {alone ? "Send it with the words again" : "Send only the redraw"}
        </button>
      </div>
    );
  } else {
    const q = c?.pic && c.pic.props?.title ? c.pic : null;
    body = (
      <div className="sf-play">
        <div className="sf-segs">
          {reply.chunks.map((_, i) => <button key={i} className={i < at ? "d" : i === at ? "now" : ""} onClick={() => setAt(i)} aria-label={`Page ${i + 1}`} />)}
        </div>
        <div className="sf-me">Plan my week</div>
        <div className="sf-stagearea">
          {c ? <Chunk key={c.key} c={c} emitFor={emitFor} /> : null}
          <button className="sf-tapback" onClick={() => setAt(Math.max(0, at - 1))} aria-label="Back" disabled={at === 0} />
          <button className="sf-tapnext" onClick={() => setAt(Math.min(n - 1, at + 1))} aria-label="Next" />
        </div>
        <div className="wd-foot">
          {q ? <span>{question(q)}: one tap sends it.</span> : <span>{reply.questions.length ? `${reply.questions.length} to answer at the end` : "Nothing waits for a Send."}</span>}
          {sent.length ? <b>{sent.length} sent</b> : null}
        </div>
        <div className="sf-nav wd-nav">
          <button className="sf-small" onClick={() => setAt(Math.max(0, at - 1))} disabled={at === 0} aria-label="Back">‹</button>
          <button className="sf-small acc" onClick={() => setAt(Math.min(n - 1, at + 1))} disabled={at >= n - 1} aria-label="Next">›</button>
        </div>
      </div>
    );
  }

  return (
    <ScreenCtx.Provider value={ctx}>
      <div className="sf-app wd-app" style={{ "--sf": BASIL }}>
        <div className="sf-top">
          <span className="sf-agent"><span className="sf-face" style={{ background: BASIL }}>B</span><b>Basil</b></span>
        </div>
        <div className="sf-body-wrap">{body}</div>
        {toast ? <div className="sf-toast"><span>{toast}</span></div> : null}
      </div>
    </ScreenCtx.Provider>
  );
}
