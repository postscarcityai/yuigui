"use client";
// Yui on the web (YUI-242): the agent list and the open thread. A column on a computer, a drawer at 390 px.
// It draws whoever YUI-241 signed in (`auth`, lib/web/auth.mjs) or, with ?demo=<sample>, a fake relay in the
// page: no sign in, no network (lib/web/demo.mjs). Same account, same agents, same threads as the phone.
import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createDemoRelay } from "../../lib/web/demo.mjs";
import { createRelay } from "../../lib/web/relay.mjs";
import { createOutbox, idbStore } from "../../lib/web/outbox.mjs";
import { liveness, presenceLabel } from "../../lib/web/presence.mjs";
import { revoked, sortAgents, unsharedLine } from "../../lib/web/agents.mjs";
import { chatErrorOf, draft as newDraft, merge as mergeChats, openAfterDeleting, append as appendChats, PAGE_SIZE } from "../../lib/web/chats.mjs";
import fixture from "./fixtures/penny.json";
import sharedFixture from "./fixtures/shared.json";
import ThreadView from "./ThreadView";
import DrawerPanel from "./DrawerPanel";
import AgentsPanel from "./AgentsPanel";
import AddAgent from "./AddAgent";
import EditAgent from "./EditAgent";
import { Face } from "./parts";
import "./thread.css";
import "./composer.css";
import "./agents.css";

const FIXTURES = { penny: fixture, shared: sharedFixture };

const GIVE_UP_FAST = { giveUpMs: 3000, stuckMs: 3000, pollMs: 300 };

export default function ThreadApp({ demo, auth, user, agent: agentId, chat }) {
  // In-app moves (an agent, a chat) use the History API, which Next folds into usePathname: the page stays
  // mounted, so the open sheets, the drafts and the relay survive a tap on a chat.
  const go = useCallback((url) => { window.history.pushState(null, "", url); }, []);
  const search = useSearchParams();
  const theme = search.get("theme");
  const fast = search.get("pairing") === "fast" ? GIVE_UP_FAST : {};
  const [mounted, setMounted] = useState(false);
  const [agents, setAgents] = useState(null);
  const [crew, setCrew] = useState([]);
  const [firstName, setFirstName] = useState(null);
  const [unshared, setUnshared] = useState([]);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState(null);
  const [drawer, setDrawer] = useState(false);
  const [switcher, setSwitcher] = useState(false);
  const [sheet, setSheet] = useState(null); // "add" | { edit: <agent id> }
  const [api, setApi] = useState(null);
  const [light, setLight] = useState(false);
  // The app opens on the stage (Stage first); the chat is the record, one tap away. ?view=chat opens the record.
  const [view, setView] = useState(search.get("view") === "chat" ? "chat" : "stage");

  useEffect(() => { setMounted(true); }, []);

  // The theme is the site's: the moon button's choice is in localStorage and on <html>; ?theme= wins for a link.
  useEffect(() => {
    if (theme === "light" || theme === "dark") document.documentElement.dataset.theme = theme;
    setLight(document.documentElement.dataset.theme === "light");
  }, [theme]);
  const flip = () => {
    const next = light ? "dark" : "light";
    document.documentElement.dataset.theme = next;
    try { localStorage.setItem("yui-theme", next); } catch { /* private mode */ }
    setLight(!light);
  };

  const relay = useMemo(() => {
    if (!mounted) return null;
    if (demo) return createDemoRelay(FIXTURES[demo] || fixture);
    if (!auth) return null;
    return createRelay({ token: () => auth.accessToken() });
  }, [mounted, demo, auth]);
  // The e2e checks read the wire (what a tap sent), not the screen. The committed relay, not a render's spare.
  useEffect(() => { if (demo && relay) window.yuiWebDemo = relay; }, [demo, relay]);
  // Who is signed in, as the account says it (the sign in only knew the Apple email it was given).
  const [me, setMe] = useState(null);
  useEffect(() => {
    if (!auth) return undefined;
    let live = true;
    auth.call("yui-account", { action: "get" }).then((r) => live && setMe(r.user)).catch(() => {});
    return () => { live = false; };
  }, [auth]);
  const email = me?.email || user?.email;
  const userId = demo ? "demo-user" : user?.id;

  // A chat the person started here is not on the server until something is said in it: the outbox makes it
  // first, then sends the row (the app inserts the chat, then the message).
  const known = useRef(new Set());
  // What the person sent that the relay does not have yet lives on this device (IndexedDB) until it does: a
  // closed tab or a dead network loses nothing, and it goes out once, from here, whichever thread is open.
  const outbox = useMemo(() => (relay && userId ? createOutbox({
    send: async (item) => {
      if (item.chatId && !known.current.has(item.chatId)) { await relay.chats.insert({ id: item.chatId, userId, agentId: item.agentId }); known.current.add(item.chatId); }
      return relay.deliver(item);
    },
    store: idbStore(demo ? "yui-web-demo" : "yui-web"), owner: userId }) : null), [relay, userId, demo]);
  useEffect(() => {
    if (!outbox) return undefined;
    outbox.load();
    if (demo) window.yuiWebOutbox = outbox;
    const now = () => { if (!document.hidden) outbox.retry(); };
    window.addEventListener("online", now);
    document.addEventListener("visibilitychange", now);
    return () => { window.removeEventListener("online", now); document.removeEventListener("visibilitychange", now); };
  }, [outbox, demo]);

  // A phone's on-screen keyboard covers the bottom of the layout viewport: the app follows the visible part,
  // so the composer stays above the keys (iOS Safari does not resize the page for it).
  useEffect(() => {
    const vv = window.visualViewport;
    if (!vv) return undefined;
    const root = document.documentElement;
    const on = () => {
      root.style.setProperty("--wb-vh", `${Math.round(vv.height)}px`);
      root.style.setProperty("--wb-vt", `${Math.round(vv.offsetTop)}px`);
      root.dataset.kbd = window.innerHeight - vv.height > 140 ? "1" : "0";
    };
    on();
    vv.addEventListener("resize", on);
    vv.addEventListener("scroll", on);
    return () => { vv.removeEventListener("resize", on); vv.removeEventListener("scroll", on); root.style.removeProperty("--wb-vh"); root.style.removeProperty("--wb-vt"); delete root.dataset.kbd; };
  }, []);

  // ---------------------------------------------------------------- the agents
  const agentsRef = useRef(null);
  const openRef = useRef(null);
  const load = useCallback(async () => {
    if (!relay) return null;
    try {
      const r = await relay.agents();
      const list = r.agents || [];
      // A shared agent that is gone was revoked (YUI-97): say so once, and close its thread if it was open.
      const gone = revoked(agentsRef.current, list, openRef.current);
      if (gone.names.length) {
        setUnshared((u) => [...u, ...gone.names.filter((n) => !u.includes(n))]);
        if (gone.closeOpen) setNotice(unsharedLine(gone.names[0]));
      }
      agentsRef.current = list;
      setAgents(list); setCrew(r.crew || []); setFirstName(r.first_name || null); setError(null);
      return list;
    } catch (e) { setError(e); return null; }
  }, [relay]);
  // The list now and then, so presence (asleep, back online) stays honest.
  useEffect(() => {
    if (!relay) return undefined;
    load();
    const t = setInterval(load, 15000);
    return () => clearInterval(t);
  }, [relay, load]);
  useEffect(() => { if (!notice) return undefined; const t = setTimeout(() => setNotice(""), 5000); return () => clearTimeout(t); }, [notice]);

  const sorted = useMemo(() => (agents ? sortAgents(agents) : null), [agents]);
  const open = sorted ? sorted.find((a) => a.id === agentId) || sorted.find((a) => a.is_default) || sorted[0] : null;
  openRef.current = open?.id || null;
  const q = [demo ? `demo=${encodeURIComponent(demo)}` : "", theme ? `theme=${theme}` : "", search.get("view") === "chat" ? "view=chat" : "", search.get("pairing") === "fast" ? "pairing=fast" : ""].filter(Boolean).join("&");
  const keep = q ? `?${q}` : "";
  const hrefOf = (a) => `/web/agent/${a.id}${keep}`;
  const chatHref = (a, cid) => `/web/agent/${a.id}/chat/${cid}${keep}`;
  const pick = (a) => { setDrawer(false); setSwitcher(false); go(hrefOf(a)); };

  // ---------------------------------------------------------------- the open agent's chats (Chats.swift)
  const [chats, setChats] = useState({ items: [], more: false, loaded: false, note: null, draft: null });
  const chatsAgent = useRef(null);
  const chatsApi = relay?.chats;
  useEffect(() => {
    if (!chatsApi || !open?.id) return undefined;
    let live = true;
    chatsAgent.current = open.id;
    setChats({ items: [], more: false, loaded: false, note: null, draft: null });
    chatsApi.list(open.id).then((page) => {
      if (!live) return;
      for (const c of page) known.current.add(c.id);
      setChats((c) => ({ ...c, items: mergeChats([], page), more: page.length >= PAGE_SIZE, loaded: true }));
    }).catch(() => live && setChats((c) => ({ ...c, loaded: true })));
    return () => { live = false; };
  }, [chatsApi, open?.id]);
  const refreshChats = useCallback(async () => {
    if (!chatsApi || !openRef.current) return;
    const id = openRef.current;
    try {
      const page = await chatsApi.list(id);
      if (chatsAgent.current !== id) return;
      for (const c of page) known.current.add(c.id);
      setChats((c) => ({ ...c, items: mergeChats(c.items, page), more: c.more || page.length >= PAGE_SIZE, draft: c.draft && page.some((p) => p.id === c.draft.id) ? null : c.draft }));
    } catch { /* the list is a nicety; the thread keeps working */ }
  }, [chatsApi]);
  // A new line in the thread moves its chat to the top with the new last line; and reading it clears the dot.
  const version = api?.version;
  useEffect(() => {
    if (version == null) return undefined;
    const t = setTimeout(() => refreshChats(), 900);
    return () => clearTimeout(t);
  }, [version, refreshChats]);

  // The chat that is open: the one in the address, else the newest when there are several (the app opens on it).
  const openChatId = chat || (chats.items.length > 1 ? chats.items[0].id : null);
  const saved = chats.items.find((c) => c.id === openChatId);
  useEffect(() => {
    if (!saved?.unread || !chatsApi || document.hidden) return;
    const at = new Date().toISOString();
    setChats((c) => ({ ...c, items: c.items.map((x) => (x.id === saved.id ? { ...x, unread: false, seen_at: at } : x)) }));
    chatsApi.seen(saved.id, at).catch(() => {});
  }, [saved?.id, saved?.unread, chatsApi]);

  const flashChats = (note) => { setChats((c) => ({ ...c, note })); setTimeout(() => setChats((c) => (c.note === note ? { ...c, note: null } : c)), 5000); };
  const onNewChat = () => {
    if (!open) return;
    const cid = chats.draft?.id || newDraft().id;
    setChats((c) => ({ ...c, draft: c.draft || { id: cid } }));
    setDrawer(false);
    go(chatHref(open, cid));
  };
  const onOpenChat = (cid) => { setDrawer(false); go(chatHref(open, cid)); };
  const onRename = async (cid, title) => {
    setChats((c) => ({ ...c, items: c.items.map((x) => (x.id === cid ? { ...x, title } : x)) }));
    try { await chatsApi.rename(cid, title); } catch (e) { flashChats(chatErrorOf(e).spoken); refreshChats(); }
  };
  const [bump, setBump] = useState(0);
  const onDeleteChat = async (c, plan) => {
    try {
      if (plan === "clear") { await chatsApi.clear(c.id); setBump((n) => n + 1); }
      else {
        await chatsApi.remove(c.id);
        const next = openAfterDeleting(c.id, openChatId, chats.items);
        setChats((s) => ({ ...s, items: s.items.filter((x) => x.id !== c.id) }));
        if (openChatId === c.id) go(next ? chatHref(open, next) : hrefOf(open));
      }
      refreshChats();
    } catch (e) { flashChats(chatErrorOf(e).spoken); }
  };
  const onMoreChats = async () => {
    try {
      const older = await chatsApi.list(open.id, { offset: chats.items.length });
      for (const c of older) known.current.add(c.id);
      setChats((s) => ({ ...s, items: appendChats(s.items, older), more: older.length >= PAGE_SIZE }));
    } catch (e) { flashChats(chatErrorOf(e).spoken); }
  };
  const drawerChats = { ...chats, openId: openChatId, draftOpen: !!openChatId && !saved && !!chat };

  // ---------------------------------------------------------------- agents: edit, add, remove, order
  const manage = relay?.manage;
  const onRemoved = (id) => {
    setSheet(null);
    const rest = (sorted || []).filter((a) => a.id !== id);
    if (open?.id === id && rest.length) go(hrefOf(rest[0]));
  };
  const reorder = async (list) => {
    setAgents(list); agentsRef.current = list;
    try { await manage.reorder(list.map((a) => a.id)); } catch { load(); }
  };
  const editing = sheet?.edit ? (sorted || []).find((a) => a.id === sheet.edit) : null;

  if (!mounted) return <div className="web-root"><div className="wb-wait center">Opening Yui...</div></div>;
  if (!relay) return <div className="web-root"><div className="wb-wait center">Opening Yui...</div></div>;

  const ready = chats.loaded || !!chat;
  const threadKey = `${open?.id}:${openChatId || ""}:${bump}`;

  const foot = (
    <div className="wb-side-foot">
      {demo ? <span className="wb-demo" title="A recorded thread. Nothing leaves this tab.">Demo</span> : null}
      {!demo && auth ? <div className="wb-who" data-testid="account" title="Signed in on this browser"><span data-testid="account-email">{email || "Hidden email"}</span></div> : null}
      <button className="wb-linkish" onClick={flip}>{light ? "Dark" : "Light"} look</button>
      {!demo && auth ? <button className="wb-linkish" onClick={async () => { await outbox?.clear(); auth.signOut(); }}>Sign out</button> : null}
    </div>
  );

  return (
    <div className={`web-root${light ? " is-light" : ""}`}>
      <aside className={`wb-side${drawer ? " open" : ""}`} aria-label="Drawer">
        {open ? (
          <DrawerPanel agent={open} api={api} chats={drawerChats} onClose={() => setDrawer(false)} onSwitch={() => setSwitcher(true)} onAdd={() => { setDrawer(false); setSheet("add"); }}
            canAdd={!!sorted && !(sorted.length && sorted.every((a) => a.shared))} review={0}
            handlers={{ onNewChat, onOpenChat, onRename, onDeleteChat, onMoreChats, onEdit: (a) => { setDrawer(false); setSheet({ edit: a.id }); }, onControls: (section) => { setDrawer(false); setSheet({ controls: section }); } }}>
            {foot}
          </DrawerPanel>
        ) : (
          <div className="dr">
            <header className="dr-head"><h2 className="dr-name">Yui</h2><button className="wb-iconbtn wb-close" onClick={() => setDrawer(false)} aria-label="Close the drawer">Close</button></header>
            <div className="dr-scroll">
              {sorted ? <AgentsPanel agents={sorted} openId={null} firstName={firstName} unshared={unshared} error={null} hrefOf={hrefOf} onPick={pick} onEdit={(a) => setSheet({ edit: a.id })} onAdd={() => setSheet("add")} onReorder={reorder} onClose={() => {}} inline /> : <div className="wb-wait">Loading your agents...</div>}
            </div>
            {foot}
          </div>
        )}
        {switcher && sorted ? (
          <AgentsPanel agents={sorted} openId={open?.id} firstName={firstName} unshared={unshared} error={error && sorted ? "Yui could not refresh your agents just now." : null} hrefOf={hrefOf}
            onPick={pick} onEdit={(a) => setSheet({ edit: a.id })} onAdd={() => { setSwitcher(false); setSheet("add"); }} onReorder={reorder} onClose={() => setSwitcher(false)} />
        ) : null}
      </aside>
      {drawer ? <button className="wb-scrim" aria-label="Close the agent list" onClick={() => setDrawer(false)} /> : null}
      <main className="wb-main">
        <header className="wb-head">
          <button className="wb-iconbtn wb-menu" onClick={() => setDrawer(true)} aria-label="Your agents">
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7h16M4 12h16M4 17h16" fill="none" strokeWidth="2.2" strokeLinecap="round" /></svg>
          </button>
          {open ? (
            <>
              <Face agent={open} />
              <span className="wb-head-words"><b>{open.name}</b><small><i className={`wb-dot ${liveness(open)}`} />{presenceLabel(open)}</small></span>
            </>
          ) : <span className="wb-head-words"><b>Yui</b></span>}
          {open ? <button className="wb-viewbtn" data-testid="to-stage" onClick={() => setView("stage")}>Stage</button> : null}
        </header>
        {open && ready ? <ThreadView key={threadKey} relay={relay} userId={userId} agent={open} agents={sorted} outbox={outbox} chat={openChatId} light={light} view={view} setView={setView} onMenu={() => setDrawer(true)} onApi={setApi}
          onOpenAgent={(id) => { const a = sorted.find((x) => x.id === id); if (a) pick(a); }} />
          : error && !sorted ? <div className="wb-signed-out"><p>Yui could not reach your agents. Try again in a moment.</p><button className="wb-cta" onClick={load}>Try again</button></div>
          : sorted && !sorted.length ? (
            <div className="wb-signed-out" data-testid="no-agents"><h1>Add your first agent</h1><p>Yui shows the answers of an agent you run on your own computer, like a Hermes profile. Connecting one takes about five minutes.</p><button className="wb-cta" data-testid="first-add" onClick={() => setSheet("add")}>Add agent</button></div>
          )
          : <div className="wb-wait center">Loading your agents...</div>}
      </main>
      {sheet === "add" && manage ? <AddAgent manage={manage} agents={sorted || []} crew={crew} refresh={load} onClose={() => setSheet(null)} onOpenAgent={(id) => go(`/web/agent/${id}${keep}`)} {...fast} /> : null}
      {editing && manage ? <EditAgent manage={manage} agent={editing} agents={sorted} refresh={load} onClose={() => setSheet(null)} onRemoved={onRemoved} {...fast} /> : null}
      {notice ? <div className="wc-toast" role="status" data-testid="agent-notice">{notice}</div> : null}
    </div>
  );
}
