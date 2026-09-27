"use client";
// One phone: an agent's home on screen 1, its starter screens a swipe left (YUI-168 step 1, spec/HOME.md).
import dynamic from "next/dynamic";
import { useEffect, useMemo, useRef, useState } from "react";
import { parse, menuOf } from "../../../lib/yl/yl.mjs";
import { HOMES } from "./homes.mjs";
import "./home.css";

const Pages = dynamic(() => import("./Pages"), { ssr: false, loading: () => null });

const Icon = {
  menu: <svg viewBox="0 0 24 24"><path d="M4 7h16M4 12h16M4 17h16" /></svg>,
  plus: <svg viewBox="0 0 24 24"><path d="M12 5v14M5 12h14" /></svg>,
  mic: <svg viewBox="0 0 24 24"><rect x="9" y="3" width="6" height="12" rx="3" /><path d="M6 11a6 6 0 0 0 12 0M12 17v4" /></svg>,
  send: <svg viewBox="0 0 24 24"><path d="M5 12h13M13 6l6 6-6 6" /></svg>,
  bell: <svg viewBox="0 0 24 24"><path d="M6 16V11a6 6 0 0 1 12 0v5l2 2H4zM10 20a2 2 0 0 0 4 0" /></svg>,
  arrow: <svg viewBox="0 0 24 24"><path d="M9 6l6 6-6 6" /></svg>,
  chat: <svg viewBox="0 0 24 24"><path d="M5 5h14v10H9l-4 4z" /></svg>,
};

// The page a `show=` chip goes to: the page its saved screen came from (spec/HOME.md, section 2).
function pageFor(yl, name) {
  const op = parse(yl).find((o) => o.op === "save" && o.name === name);
  return op && /^(?:[2-9]|1[0-2])$/.test(op.screen) ? op.screen : null;
}

export default function HomeMock({ agent = "arnold", theme = "dark", startPage = 1 }) {
  const h = HOMES[agent];
  const light = theme === "light";
  const chips = useMemo(() => menuOf(parse(h.yl)).shortcut.slice(0, 4), [h.yl]);
  const pageCount = useMemo(() => new Set(parse(h.yl).filter((o) => /^(?:[2-9]|1[0-2])$/.test(o.screen || "") && o.op !== "menu" && o.op !== "save").map((o) => o.screen)).size, [h.yl]);
  const [msgs, setMsgs] = useState([]);
  const [asks, setAsks] = useState(h.asks);
  const [ask, setAsk] = useState(null);
  const [typing, setTyping] = useState(false);
  const [draft, setDraft] = useState("");
  const [page, setPage] = useState(0);
  const [note, setNote] = useState("");
  const pager = useRef(null);
  const drag = useRef(null);

  useEffect(() => { setMsgs([]); setAsks(h.asks); setTyping(false); setDraft(""); setAsk(null); goTo(0, false); }, [agent]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (startPage > 1) { const t = setTimeout(() => goTo(startPage - 1, false), 400); return () => clearTimeout(t); }
  }, [startPage, agent]); // eslint-disable-line react-hooks/exhaustive-deps

  const flash = (t) => { setNote(t); setTimeout(() => setNote(""), 1800); };

  function goTo(i, smooth = true) {
    const el = pager.current;
    if (!el) return;
    el.scrollTo({ left: i * el.clientWidth, behavior: smooth ? "smooth" : "auto" });
  }
  function onScroll() {
    const el = pager.current;
    if (el) setPage(Math.round(el.scrollLeft / el.clientWidth));
  }
  // A mouse can't swipe a scroller, so drag with the pointer too.
  function down(e) {
    if (e.pointerType !== "mouse" || e.target.closest("button, input, label, a, [role=slider], canvas")) return;
    drag.current = { x: e.clientX, left: pager.current.scrollLeft, moved: false };
  }
  function move(e) {
    const d = drag.current;
    if (!d) return;
    const dx = e.clientX - d.x;
    if (Math.abs(dx) > 4) d.moved = true;
    pager.current.style.scrollSnapType = "none";
    pager.current.scrollLeft = d.left - dx;
  }
  function up(e) {
    const d = drag.current;
    if (!d) return;
    drag.current = null;
    const el = pager.current;
    el.style.scrollSnapType = "";
    const w = el.clientWidth;
    const dx = e.clientX - d.x;
    const from = Math.round(d.left / w);
    const to = Math.abs(dx) > w * 0.15 ? from + (dx < 0 ? 1 : -1) : from;
    goTo(Math.max(0, Math.min(pageCount, to)));
  }

  function say(text) {
    const t = text.trim();
    if (!t) return;
    const id = chips.find((c) => (c.say || c.label) === text)?.id;
    const reply = (id && h.replies[id]) || `On it. ${h.name} answers with a screen here.`;
    setMsgs((m) => [...m, ["user", t], ["agent", reply]]);
    setDraft("");
    setTyping(false);
  }

  function tapChip(c) {
    if (c.show) {
      const p = pageFor(h.yl, c.show);
      if (p) { goTo(Number(p) - 1); return; }
    }
    const s = c.say || c.label;
    if (s.endsWith(" ")) { setDraft(s); setTyping(true); return; }
    say(s);
  }

  function answer(a, choice) {
    setAsks((as) => as.filter((x) => x !== a));
    setAsk(null);
    setMsgs((m) => [...m, ["user", `${a.title} ${choice}`], ["agent", "Done. It left Review too."]]);
  }

  const answered = msgs.length > 0;

  return (
    <div className={`hm-phone hm-${theme}`} role="group" aria-label={`${h.name}'s home, ${theme}`}>
      <div className="hm-status"><span>6:14</span><span>89</span></div>
      <header className="hm-head">
        <button className="hm-round" aria-label="Open the drawer" onClick={() => flash("The drawer: Home, Review, Controls, About")}>{Icon.menu}</button>
        <span className="hm-pill"><span className="hm-face sm">{h.face}</span><b>{h.name}</b></span>
        <button className="hm-round" aria-label="Waiting on you" onClick={() => { goTo(0); if (asks[0]) setAsk(asks[0]); else flash("Nothing waiting on you"); }}>
          {Icon.bell}{asks.length ? <i className="hm-badge">{asks.length}</i> : null}
        </button>
      </header>

      <div className="hm-pager" ref={pager} onScroll={onScroll} onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerLeave={up}>
        <section className="hm-slide hm-home" data-page="1" aria-label="Home">
          <div className="hm-thread">
            {!answered ? (
              <div className="hm-hello">
                <span className="hm-face lg">{h.face}</span>
                <b>{h.name}</b>
                <span>{h.job}</span>
              </div>
            ) : (
              msgs.map(([who, text], i) => <p key={i} className={`hm-msg ${who}`}>{text}</p>)
            )}
            {!answered && asks.length ? (
              <div className="hm-asks">
                <p className="hm-label">Waiting on you</p>
                {asks.slice(0, 3).map((a) => (
                  <button key={a.title} className="hm-ask" onClick={() => setAsk(a)}>
                    <span className="hm-dotm" />
                    <span className="hm-ask-text"><b>{a.title}</b><small>{a.sub}</small></span>
                    {Icon.arrow}
                  </button>
                ))}
              </div>
            ) : null}
            {!answered && !asks.length ? <p className="hm-quiet">Nothing waiting on you. Swipe left for your screens.</p> : null}
          </div>
          {chips.length ? (
            <div className={`hm-chips${answered ? " small" : ""}`}>
              {chips.map((c) => <button key={c.id} className="hm-chip" onClick={() => tapChip(c)}>{c.label}</button>)}
            </div>
          ) : null}
        </section>
        <Pages yl={h.yl} light={light} agent={h.name} onTap={(v) => flash(`Sent to ${h.name}: ${v.cta || v.item || v.preset}`)} />
      </div>

      <div className="hm-dots" aria-label="Screens">
        <button className={page === 0 ? "on chat" : "chat"} aria-label="Home" onClick={() => goTo(0)}>{Icon.chat}</button>
        {Array.from({ length: pageCount }, (_, i) => (
          <button key={i} className={page === i + 1 ? "on" : ""} aria-label={`Screen ${i + 2}`} onClick={() => goTo(i + 1)} />
        ))}
      </div>

      <footer className={`hm-bar${page ? " off" : ""}`}>
        {typing ? (
          <form className="hm-type" onSubmit={(e) => { e.preventDefault(); say(draft); }}>
            <input autoFocus value={draft} onChange={(e) => setDraft(e.target.value)} placeholder="Say something" aria-label="Message" />
            <button className="hm-mic" aria-label="Send">{Icon.send}</button>
          </form>
        ) : (
          <>
            <button className="hm-round" aria-label="Attach" onClick={() => flash("Photos and files, as today")}>{Icon.plus}</button>
            <button className="hm-round hm-t" aria-label="Type" onClick={() => setTyping(true)}>T</button>
            <button className="hm-mic" aria-label="Talk" onClick={() => setTyping(true)}>{Icon.mic}</button>
          </>
        )}
      </footer>

      {ask ? (
        <div className="hm-sheet-wrap" onClick={() => setAsk(null)}>
          <div className="hm-sheet" onClick={(e) => e.stopPropagation()} role="dialog" aria-label={ask.title}>
            <p className="hm-sheet-title">{ask.title}</p>
            <p className="hm-sheet-body">{ask.sub}</p>
            {(ask.opts || ["Yes", "No"]).map((o) => <button key={o} onClick={() => answer(ask, o)}>{o}</button>)}
          </div>
        </div>
      ) : null}
      {note ? <div className="hm-toast" role="status">{note}</div> : null}
    </div>
  );
}
