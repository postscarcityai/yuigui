"use client";
// One phone: Basil's chat and the drawer with its chat list (YUI-169 step 1, spec/CHATS.md).
import { useRef, useState } from "react";
import "./chats.css";

const HOUR = 3600e3;
const NOW = Date.UTC(2026, 8, 27, 18, 0);

const START = [
  { id: "c3", title: "Tuesday's groceries", at: NOW - 20 * 60e3, unread: true, msgs: [
    ["user", "Make me a grocery list for Tuesday"],
    ["agent", "Five dinners, one list. Tick what you have."],
    ["list", "Chicken thighs|Rice|Spinach|Greek yogurt|Eggs"],
  ] },
  { id: "c2", title: "Protein on rest days", at: NOW - 2 * HOUR, msgs: [
    ["user", "How much protein on rest days?"],
    ["agent", "Same as training days: about 140 g for you. Spread it over three meals."],
  ] },
  { id: "c1", title: "Hi Basil", at: NOW - 3 * 24 * HOUR, msgs: [
    ["agent", "Hi. I'm Basil. I track what you eat and keep it simple."],
    ["user", "Log two eggs and toast"],
    ["agent", "Logged. 390 calories, 20 g protein."],
  ] },
];

const REPLY = (t) => /eat|meal|dinner|lunch|breakfast/i.test(t)
  ? "Good one. I'll keep it to what you have at home."
  : "On it. This chat is just for that, so the others stay tidy.";

function ago(at) {
  const m = Math.max(1, Math.round((NOW - at) / 60e3));
  if (m < 60) return `${m}m`;
  if (m < 24 * 60) return `${Math.round(m / 60)}h`;
  return `${Math.round(m / 1440)}d`;
}

function titleFrom(text) {
  const t = text.trim().replace(/\s+/g, " ").replace(/[?.!]+$/, "");
  if (t.length <= 32) return t;
  const cut = t.slice(0, 32);
  return cut.slice(0, cut.lastIndexOf(" ") > 12 ? cut.lastIndexOf(" ") : 32);
}

function lastLine(c) {
  const m = [...c.msgs].reverse().find((x) => x[0] !== "list");
  if (!m) return "";
  return `${m[0] === "user" ? "You: " : ""}${m[1]}`;
}

const Icon = {
  menu: <svg viewBox="0 0 24 24"><path d="M4 7h16M4 12h16M4 17h16" /></svg>,
  compose: <svg viewBox="0 0 24 24"><path d="M11 5H6a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-5M10 14l1-3 7-7 2 2-7 7z" /></svg>,
  plus: <svg viewBox="0 0 24 24"><path d="M12 5v14M5 12h14" /></svg>,
  mic: <svg viewBox="0 0 24 24"><rect x="9" y="3" width="6" height="12" rx="3" /><path d="M6 11a6 6 0 0 0 12 0M12 17v4" /></svg>,
  x: <svg viewBox="0 0 24 24"><path d="M6 6l12 12M18 6L6 18" /></svg>,
  gear: <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="3" /><path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M5.6 18.4l2.1-2.1M16.3 7.7l2.1-2.1" /></svg>,
  dots: <svg viewBox="0 0 24 24"><circle cx="6" cy="12" r="1.4" /><circle cx="12" cy="12" r="1.4" /><circle cx="18" cy="12" r="1.4" /></svg>,
  pen: <svg viewBox="0 0 24 24"><path d="M5 19l1-4L16 5l3 3L9 18z" /></svg>,
  bin: <svg viewBox="0 0 24 24"><path d="M5 7h14M10 7V4h4v3M7 7l1 13h8l1-13" /></svg>,
  tap: <svg viewBox="0 0 24 24"><path d="M9 11V5a1.5 1.5 0 0 1 3 0v6l4 .8a2 2 0 0 1 1.6 2.3L17 19H10l-3.5-4.5a1.5 1.5 0 0 1 2.3-1.9z" /></svg>,
  send: <svg viewBox="0 0 24 24"><path d="M5 12h13M13 6l6 6-6 6" /></svg>,
};

export default function ChatsMock({ theme = "dark", startOpen = false }) {
  const [chats, setChats] = useState(START);
  const [openId, setOpenId] = useState("c3");
  const [drawer, setDrawer] = useState(startOpen);
  const [tab, setTab] = useState("home");
  const [sheet, setSheet] = useState(null); // {id, kind: "actions" | "delete"}
  const [renaming, setRenaming] = useState(null);
  const [typing, setTyping] = useState(false);
  const [draft, setDraft] = useState("");
  const [note, setNote] = useState("");
  const hold = useRef(null);

  const open = chats.find((c) => c.id === openId) || null; // null = a new, unsaved chat
  const flash = (t) => { setNote(t); setTimeout(() => setNote(""), 1800); };

  function newChat() {
    setOpenId(null);
    setDrawer(false);
    setTyping(false);
  }

  function send(text) {
    const t = text.trim();
    if (!t) return;
    const at = NOW - 30e3;
    if (!open) {
      const id = `n${Date.now()}`;
      setChats((cs) => [{ id, title: titleFrom(t), at, msgs: [["user", t], ["agent", REPLY(t)]] }, ...cs]);
      setOpenId(id);
    } else {
      setChats((cs) => [{ ...open, at, msgs: [...open.msgs, ["user", t], ["agent", REPLY(t)]] }, ...cs.filter((c) => c.id !== open.id)]);
    }
    setDraft("");
    setTyping(false);
  }

  function pick(id) {
    setChats((cs) => cs.map((c) => (c.id === id ? { ...c, unread: false } : c)));
    setOpenId(id);
    setDrawer(false);
  }

  function rename(id, title) {
    const t = title.trim().slice(0, 60);
    if (t) setChats((cs) => cs.map((c) => (c.id === id ? { ...c, title: t } : c)));
    setRenaming(null);
  }

  function remove(id) {
    const last = chats.length === 1;
    if (last) {
      setChats((cs) => cs.map((c) => (c.id === id ? { ...c, msgs: [] } : c)));
      flash("Chat cleared");
    } else {
      const rest = chats.filter((c) => c.id !== id);
      setChats(rest);
      if (openId === id) setOpenId(rest[0].id);
      flash("Chat deleted");
    }
    setSheet(null);
  }

  const startHold = (id) => { hold.current = setTimeout(() => setSheet({ id, kind: "actions" }), 450); };
  const endHold = () => clearTimeout(hold.current);
  const target = sheet && chats.find((c) => c.id === sheet.id);

  return (
    <div className={`cm-phone cm-${theme}`} role="group" aria-label={`Chats mock, ${theme}`}>
      <div className="cm-status"><span>6:14</span><span>89</span></div>

      {/* The chat */}
      <header className="cm-head">
        <button className="cm-round cm-dot" aria-label="Open the drawer" onClick={() => setDrawer(true)}>{Icon.menu}</button>
        <button className="cm-pill" aria-label="Chats with Basil" onClick={() => setDrawer(true)}>
          <span className="cm-face sm">B</span>
          <span className="cm-pill-text"><b>Basil</b><small>{open ? open.title : "New chat"}</small></span>
        </button>
        <button className="cm-round" aria-label="New chat" onClick={newChat}>{Icon.compose}</button>
      </header>

      <div className="cm-thread">
        {!open || open.msgs.length === 0 ? (
          <div className="cm-empty">
            <span className="cm-face lg">B</span>
            <b>Hi. Tap the mic and talk.</b>
            <span>New chat with Basil. It still knows you.</span>
            <div className="cm-starters">
              {["Plan dinners for the week", "What should I eat before a run?"].map((s) => (
                <button key={s} onClick={() => send(s)}>{s}</button>
              ))}
            </div>
          </div>
        ) : (
          open.msgs.map(([who, text], i) => who === "list" ? (
            <div key={i} className="cm-card">
              <b>Tuesday</b>
              {text.split("|").map((x, j) => <label key={x}><input type="checkbox" defaultChecked={j < 2} /> {x}</label>)}
            </div>
          ) : (
            <p key={i} className={`cm-msg ${who}`}>{text}</p>
          ))
        )}
      </div>

      <footer className="cm-bar">
        {typing ? (
          <form className="cm-type" onSubmit={(e) => { e.preventDefault(); send(draft); }}>
            <input autoFocus value={draft} onChange={(e) => setDraft(e.target.value)} placeholder="Say something" aria-label="Message" />
            <button className="cm-mic" aria-label="Send">{Icon.send}</button>
          </form>
        ) : (
          <>
            <button className="cm-round" aria-label="Attach" onClick={() => flash("Attach works the same in every chat")}>{Icon.plus}</button>
            <button className="cm-round cm-t" aria-label="Type" onClick={() => setTyping(true)}>T</button>
            <button className="cm-mic" aria-label="Talk" onClick={() => setTyping(true)}>{Icon.mic}</button>
          </>
        )}
      </footer>

      {/* The drawer */}
      <div className={`cm-scrim${drawer ? " on" : ""}`} onClick={() => setDrawer(false)} />
      <aside className={`cm-drawer${drawer ? " on" : ""}`} aria-hidden={!drawer}>
        <div className="cm-dhead">
          <h2>Basil</h2>
          <button className="cm-round" aria-label="Agent settings" onClick={() => { setTab("controls"); }}>{Icon.gear}</button>
          <button className="cm-round" aria-label="Close the drawer" onClick={() => setDrawer(false)}>{Icon.x}</button>
        </div>
        <nav className="cm-tabs">
          {[["home", "Home"], ["review", "Review"], ["controls", "Controls"], ["about", "About"]].map(([k, l]) => (
            <button key={k} className={tab === k ? "on" : ""} onClick={() => setTab(k)}>
              {l}{k === "review" ? <i>1</i> : null}
            </button>
          ))}
        </nav>

        {tab === "home" ? (
          <div className="cm-dbody">
            <button className="cm-new" onClick={newChat}>{Icon.plus} New chat</button>
            <p className="cm-label">Chats</p>
            <ul className="cm-list">
              {chats.map((c) => (
                <li key={c.id} className={c.id === openId ? "on" : ""}
                  onPointerDown={() => startHold(c.id)} onPointerUp={endHold} onPointerLeave={endHold}
                  onContextMenu={(e) => { e.preventDefault(); setSheet({ id: c.id, kind: "actions" }); }}>
                  {renaming === c.id ? (
                    <form className="cm-rename" onSubmit={(e) => { e.preventDefault(); rename(c.id, e.currentTarget.t.value); }}>
                      <input name="t" autoFocus defaultValue={c.title} maxLength={60} aria-label="Chat title" onBlur={(e) => rename(c.id, e.target.value)} />
                    </form>
                  ) : (
                    <button className="cm-row" onClick={() => pick(c.id)}>
                      <span className="cm-rtitle"><span>{c.title}</span>{c.unread ? <i className="cm-unread" aria-label="unread" /> : null}</span>
                      <span className="cm-rsub"><span>{lastLine(c) || "No messages"}</span><span>{ago(c.at)}</span></span>
                    </button>
                  )}
                  <button className="cm-more" aria-label={`More for ${c.title}`} onClick={() => setSheet({ id: c.id, kind: "actions" })}>{Icon.dots}</button>
                </li>
              ))}
            </ul>

            <p className="cm-label">Next up for you</p>
            <button className="cm-next" onClick={() => setTab("review")}>
              <span className="cm-nicon">{Icon.tap}</span>
              <span><b>Where to start?</b><small>Pick one</small></span>
              <i>1</i>
            </button>

            <p className="cm-label">Pinned screens</p>
            <div className="cm-pins">
              {[["Calories", "1,420 of 2,100"], ["Dinners", "5 this week"], ["Protein", "96 g today"]].map(([t, s]) => (
                <button key={t} className="cm-pin" onClick={() => { setDrawer(false); flash(`${t}: same in every chat`); }}><b>{t}</b><small>{s}</small></button>
              ))}
            </div>
          </div>
        ) : (
          <div className="cm-dbody cm-other">
            <p>{tab === "review" ? "Where to start? Pick one." : tab === "controls" ? "Personality, memory and schedules, as today." : "What Basil does, as today."}</p>
            <button className="cm-new" onClick={() => setTab("home")}>Back to chats</button>
          </div>
        )}

        <div className="cm-foot"><span className="cm-face sm">B</span><span><b>Basil</b><small><i className="cm-on" /> Online</small></span></div>
      </aside>

      {/* Sheets */}
      {sheet && target ? (
        <div className="cm-sheet-wrap" onClick={() => setSheet(null)}>
          <div className="cm-sheet" onClick={(e) => e.stopPropagation()} role="dialog" aria-label="Chat actions">
            {sheet.kind === "actions" ? (
              <>
                <p className="cm-sheet-title">{target.title}</p>
                <button onClick={() => { setRenaming(target.id); setSheet(null); }}>{Icon.pen} Rename</button>
                <button className="danger" onClick={() => setSheet({ id: target.id, kind: "delete" })}>{Icon.bin} {chats.length === 1 ? "Clear" : "Delete"}</button>
              </>
            ) : (
              <>
                <p className="cm-sheet-title">{chats.length === 1 ? "Clear this chat?" : `Delete "${target.title}"?`}</p>
                <p className="cm-sheet-body">Its messages go. Basil still remembers what it learned.</p>
                <button className="danger solid" onClick={() => remove(target.id)}>{chats.length === 1 ? "Clear" : "Delete"}</button>
                <button onClick={() => setSheet(null)}>Keep it</button>
              </>
            )}
          </div>
        </div>
      ) : null}

      {note ? <div className="cm-toast" role="status">{note}</div> : null}
    </div>
  );
}
