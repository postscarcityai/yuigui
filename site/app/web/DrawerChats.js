"use client";
// The drawer's chats (Agents/DrawerChats.swift, YUI-169): New chat, then the list, newest activity first.
// A row says its title, then the last line said and when; a coral dot when the agent said something you have
// not read; a soft fill on the open one. Rename and Delete sit behind the row's own button (the app's hold or
// swipe has no mouse twin). Delete asks first.
import { useEffect, useRef, useState } from "react";
import { deletePlan, deleteWords, filter, lastLine, SEARCH_AFTER, title as titleOf, validTitle, whenOf } from "../../lib/web/chats.mjs";
import { Confirm } from "./parts";

function Row({ chat, agent, open, renaming, onOpen, onStartRename, onRename, onCancel, onDelete }) {
  const [menu, setMenu] = useState(false);
  const input = useRef(null);
  const label = titleOf(chat, agent);
  const line = lastLine(chat);
  useEffect(() => { if (renaming) { input.current?.focus(); input.current?.select(); } }, [renaming]);
  useEffect(() => {
    if (!menu) return undefined;
    const off = (e) => { if (!e.target.closest?.(".dc-menu, .dc-more")) setMenu(false); };
    const esc = (e) => { if (e.key === "Escape") setMenu(false); };
    document.addEventListener("pointerdown", off); document.addEventListener("keydown", esc);
    return () => { document.removeEventListener("pointerdown", off); document.removeEventListener("keydown", esc); };
  }, [menu]);
  if (renaming) {
    return (
      <li className="dc-row open">
        <form className="dc-rename" onSubmit={(e) => { e.preventDefault(); onRename(input.current.value); }}>
          <input ref={input} defaultValue={label} maxLength={60} aria-label="Chat name" enterKeyHint="done" onKeyDown={(e) => { if (e.key === "Escape") onCancel(); }} onBlur={(e) => { if (!e.relatedTarget?.closest?.(".dc-rename")) onCancel(); }} />
          <button type="submit" className="dc-save" aria-label="Save name">Save</button>
        </form>
      </li>
    );
  }
  return (
    <li className={`dc-row${open ? " open" : ""}`} data-testid={`chat-${chat.id}`} onContextMenu={(e) => { e.preventDefault(); setMenu(true); }}>
      <button type="button" className="dc-main" aria-current={open ? "true" : undefined} onClick={() => onOpen(chat.id)}>
        <span className="dc-top"><b>{label}</b><small>{whenOf(chat)}</small></span>
        <span className="dc-line">{chat.unread ? <i className="dc-unread" aria-label="Unread" /> : null}{line || "Nothing said yet"}</span>
      </button>
      <button type="button" className="dc-more" aria-label={`More for ${label}`} aria-haspopup="menu" aria-expanded={menu} onClick={() => setMenu((v) => !v)}>
        <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="5" cy="12" r="1.8" /><circle cx="12" cy="12" r="1.8" /><circle cx="19" cy="12" r="1.8" /></svg>
      </button>
      {menu ? (
        <div className="dc-menu" role="menu">
          <button type="button" role="menuitem" onClick={() => { setMenu(false); onStartRename(chat.id); }}>Rename</button>
          <button type="button" role="menuitem" className="danger" onClick={() => { setMenu(false); onDelete(chat); }}>Delete</button>
        </div>
      ) : null}
    </li>
  );
}

export default function DrawerChats({ agent, chats, openId, draftOpen, onNewChat, onOpenChat, onRename, onDelete, onMore, note }) {
  const [query, setQuery] = useState("");
  const [renaming, setRenaming] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const name = agent.name;
  const rows = filter(chats.items, name, query);
  const plan = deletePlan(chats.items.length);
  const words = deleting ? deleteWords(plan, titleOf(deleting, name), name) : null;
  return (
    <div className="dc" data-testid="drawer-chats">
      <button type="button" className="dc-new" data-testid="new-chat" onClick={onNewChat}>
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5v14M5 12h14" fill="none" strokeWidth="2.6" strokeLinecap="round" /></svg>
        New chat
      </button>
      {draftOpen ? <p className="dc-draft" data-testid="draft-chat">New chat. Say something and it shows up here.</p> : null}
      {chats.items.length ? (
        <>
          <h3 className="dr-heading">Chats</h3>
          {chats.items.length > SEARCH_AFTER ? (
            <div className="dc-search">
              <input type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search chats" aria-label="Search chats" />
            </div>
          ) : null}
          <ul className="dc-list">
            {rows.map((c) => (
              <Row key={c.id} chat={c} agent={name} open={c.id === openId} renaming={renaming === c.id}
                onOpen={onOpenChat} onStartRename={setRenaming} onCancel={() => setRenaming(null)}
                onRename={(t) => { setRenaming(null); const v = validTitle(t); if (v && v !== c.title) onRename(c.id, v); }}
                onDelete={setDeleting} />
            ))}
          </ul>
          {!rows.length ? <p className="dc-empty">No chats match.</p> : null}
          {chats.more && !query ? <button type="button" className="dc-older" data-testid="older-chats" onClick={onMore}>Show older chats</button> : null}
        </>
      ) : null}
      {note ? <p className="dc-note" role="status" data-testid="chats-note">{note}</p> : null}
      {deleting ? (
        <Confirm question={words.question} note={words.note} confirm={words.confirm}
          onKeep={() => setDeleting(null)} onConfirm={() => { const c = deleting; setDeleting(null); onDelete(c, plan); }} />
      ) : null}
    </div>
  );
}
