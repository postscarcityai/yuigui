"use client";
// Yui on the web (YUI-242): the agent list and the open thread. A column on a computer, a drawer at 390 px.
// It draws whoever YUI-241 signed in (`auth`, lib/web/auth.mjs) or, with ?demo=<sample>, a fake relay in the
// page: no sign in, no network (lib/web/demo.mjs). Same account, same agents, same threads as the phone.
import dynamic from "next/dynamic";
import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createRelay } from "../../lib/web/relay.mjs";
import { createGroupsClient } from "../../lib/web/groups.mjs";
import { createOutbox, idbStore } from "../../lib/web/outbox.mjs";
import { createCache } from "../../lib/web/cache.mjs";
import { liveness, presenceLabel } from "../../lib/web/presence.mjs";
import { controlSections, openAgent, revoked, sortAgents, unsharedLine } from "../../lib/web/agents.mjs";
import { chatErrorOf, draft as newDraft, merge as mergeChats, openAfterDeleting, append as appendChats, PAGE_SIZE } from "../../lib/web/chats.mjs";
import ThreadView from "./ThreadView";
import { useEarn } from "./YourU";
import { usePush } from "./usePush";
import { PrefsContext, useAppLook, useAppearance, useDark, usePicks, useStagePrefs } from "./useSettings";
import { loadAnswered, markAnswered, nextAsk, answerMeta } from "../../lib/web/vault.mjs";
import { perfOn, sectionOf } from "../../lib/web/settings.mjs";
import { loadUsed, markUsed, menuFromRows } from "../../lib/web/quick.mjs";
import DrawerPanel from "./DrawerPanel";
import AgentsPanel from "./AgentsPanel";
import CrewPick from "./CrewPick";
import { Face } from "./parts";
import { GroupThread, NewGroupSheet, AddAgent, EditAgent, ControlsPanel, ConnectApproval, Palette, SettingsPanel, KeyAskSheet, PerfHud, preloadPanels } from "./lazy";
import { OPEN_ROWS } from "../../lib/web/thread.mjs";
import "./thread.css";
import "./stage.css"; // the Stage button and Play on the stage live here; a ?view=chat link never loads StageLayer first
import "./composer.css";
import "./agents.css";

const DemoKit = dynamic(() => import("./demoKit"));

const GIVE_UP_FAST = { giveUpMs: 3000, stuckMs: 3000, pollMs: 300 };

export default function ThreadApp({ demo, auth, user, agent: agentId, chat, connect, group: groupId = null, build = {} }) {
  // In-app moves (an agent, a chat) use the History API, which Next folds into usePathname: the page stays
  // mounted, so the open sheets, the drafts and the relay survive a tap on a chat.
  const go = useCallback((url) => { window.history.pushState(null, "", url); }, []);
  const search = useSearchParams();
  const theme = search.get("theme");
  // The Speed switch (?perf=1, Settings > Speed): the frame rate line shows while it is on.
  const [perf, setPerf] = useState(false);
  useEffect(() => { const sync = () => setPerf(perfOn(window.location.search)); sync(); window.addEventListener("yui-perf", sync); return () => window.removeEventListener("yui-perf", sync); }, []);
  // A push click opens `?m=<message id>`: the reply the notification names (YUI-262). Read once, then taken off the address
  // so a reload does not play it again.
  const named = search.get("m");
  const [landing] = useState(() => (/^[0-9a-z-]{1,64}$/i.test(named || "") ? named : null));
  const landed = useCallback(() => {
    const u = new URL(window.location.href);
    if (u.searchParams.has("m")) { u.searchParams.delete("m"); window.history.replaceState(window.history.state, "", `${u.pathname}${u.search}${u.hash}`); }
  }, []);
  const fast = search.get("pairing") === "fast" ? GIVE_UP_FAST : {};
  const [mounted, setMounted] = useState(false);
  const [agents, setAgents] = useState(null);
  // A bare /web names no agent: the one this browser had open last, kept beside the session (YUI-281). undefined while it
  // is being read, null when there is none (or the address already names one): the page then opens as it always did.
  const bare = !demo && !agentId && !connect && !groupId;
  const [kept, setKept] = useState(bare ? undefined : null);
  useEffect(() => {
    if (!bare || !auth) { setKept(null); return undefined; }
    let live = true;
    auth.lastAgent().then((id) => live && setKept(id), () => live && setKept(null));
    return () => { live = false; };
  }, [bare, auth]);
  const [crew, setCrew] = useState([]);
  // A new account has not picked its crew: the first run screen shows until it has (yui-agents `crew_pending`).
  const [crewPending, setCrewPending] = useState(false);
  const [firstName, setFirstName] = useState(null);
  const [unshared, setUnshared] = useState([]);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState(null);
  const [drawer, setDrawer] = useState(false);
  const [switcher, setSwitcher] = useState(false);
  const [sheet, setSheet] = useState(null); // "add" | { edit: <agent id> }
  const [api, setApi] = useState(null);
  const [palette, setPalette] = useState(false);
  const [menus, setMenus] = useState({});
  const [menusLoading, setMenusLoading] = useState(false);
  const [used, setUsed] = useState({});
  const [pendingTap, setPendingTap] = useState(null);
  // The app opens on the stage (Stage first); the chat is the record, one tap away. ?view=chat opens the record.
  const [view, setView] = useState(search.get("view") === "chat" || (demo && !agentId && !connect && !groupId && !search.get("view")) ? "chat" : "stage");

  useEffect(() => { setMounted(true); }, []);

  // The theme is the site's `data-theme` on <html>. Settings > Appearance picks system, light or dark (system is the
  // default and follows the browser); ?theme= wins for a link until a pick is made; the Dark / Light look button in
  // the drawer is a quick flip of the same pick.
  const appearance = useAppearance(theme);
  const dark = useDark();
  const light = !dark;
  const flip = () => appearance[1](light ? "dark" : "light");
  const stagePrefs = useStagePrefs();
  const picks = usePicks();

  // The demo's relay and fixtures are their own chunk (YUI-272): a signed-in tab never fetches them.
  const [kit, setKit] = useState(null);
  const relay = useMemo(() => {
    if (!mounted) return null;
    if (demo) {
      if (!kit) return null;
      const r = kit.createDemoRelay(kit.FIXTURES[demo] || kit.FIXTURES.penny);
      // Demo switches for the settings checks: a look on, a vault with spend, a host's key ask (agent|provider|why|cap|est).
      const applook = search.get("applook");
      if (applook) r.settings.call("yui-account", { action: "set_look", look: { preset: applook } });
      if (search.get("demovault")) r.settings.seedVault("demo-penny");
      // A long chat (?demohistory=<rows> older rows) and an unprompted line (?demoarrive=<words>, after ?arriveafter=<s>) for the e2e checks.
      const hist = Number(search.get("demohistory"));
      if (Number.isInteger(hist) && hist > 0 && hist <= 2000) r.seedHistory("demo-penny", hist);
      if (search.get("demoarrive")) setTimeout(() => r.arrive("demo-penny", search.get("demoarrive").replace(/\\n/g, "\n")), Number(search.get("arriveafter") ?? 3) * 1000);
      const [ag, provider, why, cap, est] = (search.get("keyask") || "").split("|");
      if (provider) r.settings.ask(ag || "demo-penny", { provider, why, cap, est });
      return r;
    }
    if (!auth) return null;
    return createRelay({ token: () => auth.accessToken(), renew: (rejected) => auth.renewed(rejected) });
  }, [mounted, demo, auth, kit]);
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
  // The last rows, chats and agents of a signed in person, kept here so a repeat visit draws them at once (YUI-273).
  // The demo never writes one.
  const cache = useMemo(() => (!demo && mounted && userId ? createCache({ userId }) : null), [demo, mounted, userId]);
  // Your $U in the drawer's header (SITE-161). On a computer the drawer is a column that is always in view, so it
  // counts as open; on a phone it counts when it slides out. ?earnseen=<n> on a demo link: the total "last seen".
  const [column, setColumn] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 761px)");
    const on = () => setColumn(mq.matches);
    on(); mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, []);
  const seenParam = Number(search.get("earnseen"));
  const earn = useEarn({ relay, userId, sample: !!demo, open: drawer || column, seenOverride: search.get("earnseen") !== null && Number.isInteger(seenParam) && seenParam >= 0 ? seenParam : null });
  // Yui's look (Settings > Look): the account's copy, worn by the chrome through the site's tokens.
  const callFn = useMemo(() => (relay ? (fn, body) => relay.call(fn, body) : null), [relay]);
  const look = useAppLook(callFn, dark);
  // With Full screen off the chat is where answers land; one tap puts the stage up (the app's Stage first switch).
  const stageOn = stagePrefs[0].on;
  const stageFirst = useRef(true);
  useEffect(() => {
    if (search.get("view")) return;
    if (stageFirst.current && stageOn) { stageFirst.current = false; return; }
    stageFirst.current = false;
    setView(stageOn ? "stage" : "chat");
  }, [stageOn]); // eslint-disable-line react-hooks/exhaustive-deps

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
  const [liveList, setLiveList] = useState(false);
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
      setLiveList(true);
      setAgents(list); setCrew(r.crew || []); setCrewPending(!!r.crew_pending); setFirstName(r.first_name || null); setError(null);
      if (list.length) cache?.agents.put({ agents: list, crew: r.crew || [], first_name: r.first_name || null });
      return list;
    } catch (e) { setError(e); return null; }
  }, [relay, cache]);
  // The list now and then, so presence (asleep, back online) stays honest.
  useEffect(() => {
    if (!relay) return undefined;
    let live = true;
    // A repeat visit: the list kept last time is drawn until the live one answers (it replaces it).
    cache?.agents.get().then((kept) => { if (live && kept?.agents?.length && !agentsRef.current) { setAgents((a) => a || kept.agents); setCrew((c) => (c.length ? c : kept.crew || [])); setFirstName((n) => n || kept.first_name || null); } });
    load();
    const t = setInterval(load, 15000);
    return () => { live = false; clearInterval(t); };
  }, [relay, load, cache]);
  useEffect(() => { if (!notice) return undefined; const t = setTimeout(() => setNotice(""), 5000); return () => clearTimeout(t); }, [notice]);

  const sorted = useMemo(() => (agents ? sortAgents(agents) : null), [agents]);
  // Until the kept agent is read, no thread opens: a kept agent list must not draw the default's thread and then swap.
  const open = kept === undefined ? null : openAgent(sorted, agentId || kept);
  openRef.current = open?.id || null;
  // The live list has said who is open: keep it for the next bare /web. (A list kept from last time never writes.)
  useEffect(() => { if (liveList && open?.id && !demo && auth) auth.rememberAgent(open.id); }, [liveList, open?.id, demo, auth]);
  // Notifications (YUI-248): Web Push through yui-push. Presence for the open thread and the switch in Settings.
  const push = usePush({ relay, ready: mounted, openId: open?.id || null, onList: load });
  const q = [demo ? `demo=${encodeURIComponent(demo)}` : "", theme ? `theme=${theme}` : "", search.get("view") === "chat" ? "view=chat" : "", search.get("pairing") === "fast" ? "pairing=fast" : ""].filter(Boolean).join("&");
  const keep = q ? `?${q}` : "";
  const hrefOf = (a) => `/web/agent/${a.id}${keep}`;
  const chatHref = (a, cid) => `/web/agent/${a.id}/chat/${cid}${keep}`;
  const pick = (a) => { setDrawer(false); setSwitcher(false); go(hrefOf(a)); };

  // ---------------------------------------------------------------- the open agent's chats (Chats.swift)
  const [chats, setChats] = useState({ items: [], more: false, loaded: false, note: null, draft: null });
  // Warm the sheets only once the thread's rows are in (YUI-272): idle time before that belongs to the first row.
  useEffect(() => (chats.loaded ? preloadPanels() : undefined), [chats.loaded]);
  const chatsAgent = useRef(null);
  const chatsApi = relay?.chats;
  // The agent whose chats to read: the open one, or the one the address names while the agent list is still on its way
  // (YUI-274: the chat list and the rows leave with the list, not after it).
  const watchId = open?.id || (!demo && (agentId || kept)) || null;
  const earlyRows = useRef(null);
  useEffect(() => {
    if (!chatsApi || !watchId) return undefined;
    let live = true;
    chatsAgent.current = watchId;
    // The thread's first read leaves now too: the agent's own rows, or the chat the address names. A thread with several
    // chats and no chat in the address opens on its newest chat instead, and then reads its own rows as before.
    // A kept agent that is not in the live list opens the default instead: its early rows are not the ones to use.
    if (!demo && earlyRows.current?.agentId !== watchId) {
      const asked = { agentId: watchId, chatId: chat || null, since: null, limit: OPEN_ROWS };
      const promise = relay.fetchRows(asked);
      promise.catch(() => {});
      earlyRows.current = { ...asked, promise };
    }
    setChats({ items: [], more: false, loaded: false, note: null, draft: null });
    // A repeat visit: the chat list kept last time opens the thread now, so its rows need not wait for this call.
    let answered = false;
    cache?.chats.get(watchId).then((kept) => {
      if (!live || answered || !kept?.length) return;
      for (const c of kept) known.current.add(c.id);
      setChats((c) => (c.loaded ? c : { ...c, items: mergeChats([], kept), more: false, loaded: true }));
    });
    chatsApi.list(watchId).then((page) => {
      answered = true;
      if (!live) return;
      for (const c of page) known.current.add(c.id);
      setChats((c) => ({ ...c, items: mergeChats([], page), more: page.length >= PAGE_SIZE, loaded: true }));
      cache?.chats.put(watchId, page);
    }).catch(() => live && setChats((c) => ({ ...c, loaded: true })));
    return () => { live = false; };
  }, [chatsApi, watchId, cache, relay, demo]); // eslint-disable-line react-hooks/exhaustive-deps
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

  // ---------------------------------------------------------------- group threads (SITE-162, spec/GROUPS.md)
  // The same calls the app makes, with the signed in session. The demo keeps one sample group in the page.
  const groupsApi = useMemo(() => {
    if (!relay) return null;
    if (demo) return kit ? kit.createDemoGroups({ agents: () => (kit.FIXTURES[demo] || kit.FIXTURES.penny).agents }) : null;
    return relay.rest && userId ? createGroupsClient(relay.rest, { userId }) : null;
  }, [relay, demo, userId, kit]);
  useEffect(() => { if (demo && groupsApi) window.yuiWebGroups = groupsApi; }, [demo, groupsApi]);
  const [groups, setGroups] = useState(null);
  // The kept group list (YUI-275) draws the group before the live list answers; only the live list may say a group is gone.
  const [groupsLive, setGroupsLive] = useState(false);
  const groupsRef = useRef(null);
  groupsRef.current = groups;
  const refreshGroups = useCallback(async () => {
    if (!groupsApi) return;
    let list;
    try { list = await groupsApi.list(); } catch { setGroups((g) => g || []); return; }
    // A group that left the live list (archived elsewhere) takes its kept rows with it.
    if (cache) for (const g of groupsRef.current || []) if (!list.some((x) => x.id === g.id)) cache.groupRows.drop(g.id);
    setGroups(list); setGroupsLive(true);
    cache?.groups.put(list);
  }, [groupsApi, cache]);
  useEffect(() => {
    if (!cache || !groupsApi) return;
    let live = true;
    cache.groups.get().then((kept) => { if (live && Array.isArray(kept) && kept.length) setGroups((g) => g || kept); });
    return () => { live = false; };
  }, [cache, groupsApi]);
  useEffect(() => {
    if (!groupsApi) return undefined;
    refreshGroups();
    const t = setInterval(refreshGroups, 15000);
    return () => clearInterval(t);
  }, [groupsApi, refreshGroups]);
  const groupHref = (g) => `/web/group/${g.id}${keep}`;
  const openGroup = (g) => { setDrawer(false); setSwitcher(false); go(groupHref(g)); };
  const group = groupId && groups ? groups.find((g) => g.id === groupId) || null : null;
  // A group that is not there (archived, or not yours): say so and go home.
  useEffect(() => {
    if (!groupId || !groups || !groupsLive || group) return;
    cache?.groupRows.drop(groupId);
    setNotice("That group is gone.");
    go(`/web${keep}`);
  }, [groupId, groups, groupsLive, group]); // eslint-disable-line react-hooks/exhaustive-deps

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
  // Controls straight from a link (?controls=1, or ?controls=memory for one area).
  const asked = useRef(false);
  const controlsParam = search.get("controls");
  useEffect(() => {
    if (!open || asked.current || !controlsParam) return;
    asked.current = true;
    setSheet({ controls: controlsParam === "1" ? null : controlsParam });
  }, [open?.id, controlsParam]); // eslint-disable-line react-hooks/exhaustive-deps
  // Settings straight from a link (?settings=1, or ?settings=key for one section, like yui://settings/key).
  const askedSettings = useRef(false);
  const settingsParam = search.get("settings");
  useEffect(() => {
    if (!relay || askedSettings.current || !settingsParam || !sorted) return;
    askedSettings.current = true;
    setSheet({ settings: sectionOf(settingsParam) || "" });
  }, [relay, sorted, settingsParam]);
  // Sign out (and the end of a deleted account): what was not sent belonged to that account, so the outbox goes too.
  const onSignOut = async (how = {}) => {
    await outbox?.clear();
    await cache?.clear();
    if (demo) { setSheet(null); setNotice(how.deleted ? "Account deleted (demo). Nothing left the tab." : "Signed out (demo). Nothing left the tab."); return; }
    if (how.deleted) return; // deleteAccount already ended the session here
    await push.forget();
    await auth.signOut();
  };
  // A host's key ask (VAULT.md section 3): the sheet is Yui's own chrome, one at a time, never an agent's screen.
  const [keyAsk, setKeyAsk] = useState(null);
  const answerAsk = useCallback(async (meta) => {
    if (!keyAsk) return;
    try {
      await relay.answerKeyAsk({ userId, agentId: keyAsk.agentId, meta, purpose: keyAsk.ask.purpose });
      markAnswered(keyAsk.ask.req);
      setKeyAsk(null);
    } catch { /* not sent: the ask stays up and comes back on the next look */ }
  }, [relay, userId, keyAsk]);
  useEffect(() => {
    if (!relay?.keyAsks || !open?.id) return undefined;
    let live = true;
    const look = async () => {
      if (document.hidden) return;
      try {
        const rows = await relay.keyAsks(open.id);
        const r = nextAsk(rows, loadAnswered());
        // A shared agent never spends its client's keys (contract decision 4): a no, nothing shown. A refusal is a no too.
        for (const x of r.refused) {
          if (x.ignore) { markAnswered(x.req); continue; }
          await relay.answerKeyAsk({ userId, agentId: open.id, meta: answerMeta({ req: x.req, decision: "deny", provider: x.provider }) });
          markAnswered(x.req);
        }
        if (r.ask && open.shared) { await relay.answerKeyAsk({ userId, agentId: open.id, meta: answerMeta({ req: r.ask.req, decision: "deny", provider: r.ask.provider }) }); markAnswered(r.ask.req); return; }
        if (live) setKeyAsk((cur) => cur || (r.ask ? { agentId: open.id, ask: r.ask } : null));
      } catch { /* the next look */ }
    };
    look();
    const t = setInterval(look, 8000);
    return () => { live = false; clearInterval(t); };
  }, [relay, open?.id, open?.shared, userId]);

  // Talk about this (TalkAbout.swift): the item goes on the composer as a chip, in the record, with the field up.
  const talk = (item) => {
    const area = controlSections(open).find((s) => s.id === item.section);
    setSheet(null);
    setDrawer(false);
    api?.about({ ...item, areaTitle: area?.title || item.section, icon: area?.icon });
  };

  // ---------------------------------------------------------------- quick actions (QuickActions.swift)
  const menusAt = useRef(0);
  const openPalette = useCallback(() => { setUsed(loadUsed()); setPalette(true); }, []);
  useEffect(() => {
    const k = (e) => { if ((e.metaKey || e.ctrlKey) && !e.altKey && e.key.toLowerCase() === "k") { e.preventDefault(); setPalette((v) => { if (!v) setUsed(loadUsed()); return !v; }); } };
    window.addEventListener("keydown", k);
    return () => window.removeEventListener("keydown", k);
  }, []);
  // Every agent's drawer, read when the palette opens (a minute's cache): the shortcuts are in their rows.
  const settingsOpen = sheet && sheet.settings !== undefined;
  useEffect(() => {
    if (!(palette || settingsOpen) || !relay?.menuRows || !agentsRef.current) return;
    if (Date.now() - menusAt.current < 60000) return;
    let live = true;
    setMenusLoading(true);
    Promise.allSettled(agentsRef.current.map((a) => relay.menuRows(a.id).then((rows) => [a.id, menuFromRows(rows)]))).then((out) => {
      if (!live) return;
      menusAt.current = Date.now();
      setMenus(Object.fromEntries(out.filter((o) => o.status === "fulfilled").map((o) => o.value)));
      setMenusLoading(false);
    });
    return () => { live = false; setMenusLoading(false); };
  }, [palette, settingsOpen, relay]);
  // The open agent's own drawer is live in the thread: it wins over what the read found.
  const paletteMenus = useMemo(() => (open && api?.agentId === open.id && api.home ? { ...menus, [open.id]: { review: api.home.waiting, backlog: api.home.backlog, shortcut: api.home.shortcuts } } : menus), [menus, open, api]);
  // A shortcut tapped for an agent whose thread is not open yet waits for that thread.
  useEffect(() => {
    if (!pendingTap || !api || api.agentId !== pendingTap.agentId || !api.loaded) return;
    api.run(pendingTap.item, "shortcut");
    setPendingTap(null);
  }, [pendingTap, api]);

  // The demo's kit renders from the server's first HTML, so its chunk is fetched with the shell, not after it.
  if (!mounted || !relay) return <div className="web-root"><div className="wb-wait center">Opening Yui...</div><div className="wb-skel" aria-hidden="true"><i className="a" /><i className="u" /><i className="a" /><i className="a s" /><i className="u s" /></div>{demo && !kit ? <DemoKit onKit={setKit} /> : null}</div>;

  // First run: pick your crew, full screen, before any thread. Done opens Yui; "Bring my own agent" opens Add agent.
  if (crewPending && relay.manage && agents) {
    const done = async (add) => { const list = await load(); setCrewPending(false); if (add) setSheet("add"); else if (list?.length) go(hrefOf(sortAgents(list).find((a) => a.is_default) || sortAgents(list)[0])); };
    return <PrefsContext.Provider value={{ stage: stagePrefs[0], picks: picks[0], look: look.state, saveLook: look.save, agentsKeep: look.state.agentsKeep }}><div className={`web-root${light ? " is-light" : ""}`}><CrewPick crew={crew} manage={relay.manage} onDone={() => done(false)} onOwn={() => done(true)} /></div></PrefsContext.Provider>;
  }

  const ready = chats.loaded || !!chat;
  const threadKey = `${open?.id}:${openChatId || ""}:${bump}`;

  const prefs = { stage: stagePrefs[0], picks: picks[0], look: look.state, saveLook: look.save, agentsKeep: look.state.agentsKeep };
  // "Agents keep their own looks" off: every thread wears Yui's look (Settings > Look).
  const threadAgent = !look.state.agentsKeep && open ? { ...open, theme: look.state.look || { preset: "yui" } } : open;
  const foot = (
    <div className="wb-side-foot">
      {demo ? <span className="wb-demo" title="A recorded thread. Nothing leaves this tab.">Demo</span> : null}
      {!demo && auth ? <div className="wb-who" data-testid="account" title="Signed in on this browser"><span data-testid="account-email">{email || "Hidden email"}</span></div> : null}
      <button className="wb-linkish" data-testid="open-settings" onClick={() => { setDrawer(false); setSheet({ settings: "" }); }}>Settings</button>
      <button className="wb-linkish" onClick={flip}>{light ? "Dark" : "Light"} look</button>
      {!demo && auth ? <button className="wb-linkish" onClick={async () => { await outbox?.clear(); await push.forget(); auth.signOut(); }}>Sign out</button> : null}
    </div>
  );

  return (
    <PrefsContext.Provider value={prefs}>
    <div className={`web-root${light ? " is-light" : ""}`}>
      {perf ? <PerfHud /> : null}
      <aside className={`wb-side${drawer ? " open" : ""}`} aria-label="Drawer">
        {open ? (
          <DrawerPanel agent={open} api={api} chats={drawerChats} email={email} earn={earn} onSettings={() => { setDrawer(false); setSheet({ settings: "" }); }} onClose={() => setDrawer(false)} onSwitch={() => setSwitcher(true)} onQuick={openPalette}
            review={0}
            handlers={{ onNewChat, onOpenChat, onRename, onDeleteChat, onMoreChats, onEdit: (a) => { setDrawer(false); setSheet({ edit: a.id }); }, onControls: (section) => { setDrawer(false); setSheet({ controls: section }); } }}>
            {foot}
          </DrawerPanel>
        ) : (
          <div className="dr">
            <header className="dr-head"><h2 className="dr-name">Yui</h2><button className="wb-iconbtn wb-close" onClick={() => setDrawer(false)} aria-label="Close the drawer">Close</button></header>
            <div className="dr-scroll">
              {sorted ? <AgentsPanel agents={sorted} openId={null} firstName={firstName} unshared={unshared} error={null} hrefOf={hrefOf} onPick={pick} onEdit={(a) => setSheet({ edit: a.id })} onAdd={() => setSheet("add")} onReorder={reorder} onClose={() => {}} inline
                groups={groups || []} openGroupId={groupId} groupHref={groupHref} onOpenGroup={openGroup} onNewGroup={groupsApi ? () => { setSwitcher(false); setDrawer(false); setSheet("newgroup"); } : null} /> : <div className="wb-wait">Loading your agents...</div>}
            </div>
            {foot}
          </div>
        )}
        {switcher && sorted ? (
          <AgentsPanel agents={sorted} openId={open?.id} firstName={firstName} unshared={unshared} error={error && sorted ? "Yui could not refresh your agents just now." : null} hrefOf={hrefOf}
            onPick={pick} onEdit={(a) => setSheet({ edit: a.id })} onAdd={() => { setSwitcher(false); setSheet("add"); }} onReorder={reorder} onClose={() => setSwitcher(false)}
            groups={groups || []} openGroupId={groupId} groupHref={groupHref} onOpenGroup={openGroup} onNewGroup={groupsApi ? () => { setSwitcher(false); setDrawer(false); setSheet("newgroup"); } : null} />
        ) : null}
      </aside>
      {drawer ? <button className="wb-scrim" aria-label="Close the agent list" onClick={() => setDrawer(false)} /> : null}
      <main className="wb-main">
        {!groupId ? <header className="wb-head">
          <button className="wb-iconbtn wb-menu" onClick={() => setDrawer(true)} aria-label="Your agents">
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7h16M4 12h16M4 17h16" fill="none" strokeWidth="2.2" strokeLinecap="round" /></svg>
          </button>
          {open ? (
            <>
              <Face agent={open} />
              <span className="wb-head-words"><b>{open.name}</b><small><i className={`wb-dot ${liveness(open)}`} />{presenceLabel(open)}</small></span>
            </>
          ) : <span className="wb-head-words"><b>Yui</b></span>}
          {open ? <button className="wb-iconbtn wb-pen" onClick={onNewChat} aria-label="New chat" title="New chat" data-testid="head-new-chat">
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 20l1-4L16.5 4.5a2 2 0 0 1 3 3L8 19l-4 1zM14.5 6.5l3 3" fill="none" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" /></svg>
          </button> : null}
          {open ? <button className="wb-viewbtn" data-testid="to-stage" onClick={() => setView("stage")}>Stage</button> : null}
        </header> : null}
        {groupId ? (group && sorted ? <GroupThread key={group.id} api={groupsApi} relay={relay} cache={cache} group={group} agents={sorted} light={light} userId={userId} onMenu={() => setDrawer(true)} onOpenAgent={(id) => { const a = sorted.find((x) => x.id === id); if (a) pick(a); }} onChanged={refreshGroups} onArchived={() => { cache?.groupRows.drop(group.id); refreshGroups(); go(`/web${keep}`); }} /> : <div className="wb-wait center">Opening the group...</div>)
          : open && ready ? <ThreadView key={threadKey} landing={landing} onLanded={landed} relay={relay} userId={userId} agent={threadAgent} agents={sorted} outbox={outbox} cache={cache} early={earlyRows.current} chat={openChatId} light={light} view={view} setView={setView} onMenu={() => setDrawer(true)} onNewChat={onNewChat} onApi={setApi}
          onOpenAgent={(id) => { const a = sorted.find((x) => x.id === id); if (a) pick(a); }} />
          : error && !sorted ? <div className="wb-signed-out"><p>Yui could not reach your agents. Try again in a moment.</p><button className="wb-cta" onClick={load}>Try again</button></div>
          : sorted && !sorted.length ? (
            <div className="wb-signed-out" data-testid="no-agents"><h1>Add your first agent</h1><p>Yui shows the answers of an agent you run on your own computer, like a Hermes profile. Connecting one takes about five minutes.</p><button className="wb-cta" data-testid="first-add" onClick={() => setSheet("add")}>Add agent</button></div>
          )
          : <div className="wb-wait center">Loading your agents...</div>}
      </main>
      {sheet === "add" && manage ? <AddAgent manage={manage} agents={sorted || []} crew={crew} refresh={load} onClose={() => setSheet(null)} onOpenAgent={(id) => go(`/web/agent/${id}${keep}`)} {...fast} /> : null}
      {sheet === "newgroup" && groupsApi && sorted ? <NewGroupSheet agents={sorted} api={groupsApi} onClose={() => setSheet(null)} onMade={async (id) => { setSheet(null); await refreshGroups(); go(`/web/group/${id}${keep}`); }} /> : null}
      {editing && manage ? <EditAgent manage={manage} agent={editing} agents={sorted} refresh={load} onClose={() => setSheet(null)} onRemoved={onRemoved} {...fast} /> : null}
      {sheet && sheet.controls !== undefined && open && relay ? <ControlsPanel relay={relay} agent={open} userId={userId} light={light} section={sheet.controls || null} onClose={() => setSheet(null)} onTalkAbout={talk} /> : null}
      {settingsOpen && relay ? <SettingsPanel relay={relay} auth={demo ? null : auth} demo={!!demo} userId={userId} email={email} review={!!demo} agents={sorted || []} menus={paletteMenus} build={build} focus={sheet.settings || null}
        appearance={appearance} stage={stagePrefs} picks={picks} look={look} push={push} onSignOut={onSignOut} onClose={() => setSheet(null)} /> : null}
      {keyAsk && relay ? <KeyAskSheet relay={relay} userId={userId} ask={keyAsk.ask} agent={(sorted || []).find((a) => a.id === keyAsk.agentId)} answer={answerAsk} /> : null}
      {connect && relay ? <ConnectApproval key={connect} relay={relay} id={connect} agents={sorted || []} refresh={load} onOpenAgent={(id) => go(`/web/agent/${id}${keep}`)} onClose={() => go(`/web${keep}`)} /> : null}
      {palette && sorted ? (
        <Palette agents={sorted} menus={paletteMenus} loading={menusLoading} open={open} used={used} picks={picks[0]} light={light}
          can={{ add: !(sorted.length && sorted.every((a) => a.shared)), edit: !!open && !open.shared }} controls={open && !open.shared ? controlSections(open) : []}
          onClose={() => setPalette(false)}
          onRun={(r) => {
            setPalette(false); setDrawer(false);
            if (r.kind === "shortcut") {
              setUsed(markUsed(`${r.agentId}/${r.item.id}`));
              if (open && r.agentId === open.id && api?.agentId === open.id) api.run(r.item, "shortcut");
              else { setPendingTap({ agentId: r.agentId, item: r.item }); const a = sorted.find((x) => x.id === r.agentId); if (a) go(hrefOf(a)); }
            } else if (r.kind === "agent") { const a = sorted.find((x) => x.id === r.agentId); if (a) pick(a); }
            else if (r.action === "new-chat") onNewChat();
            else if (r.action === "add") setSheet("add");
            else if (r.action === "edit" && open) setSheet({ edit: open.id });
            else if (r.action === "controls") setSheet({ controls: r.section });
            else if (r.action === "look") flip();
            else if (r.action === "settings") setSheet({ settings: "" });
          }} />
      ) : null}
      {notice ? <div className="wc-toast" role="status" data-testid="agent-notice">{notice}</div> : null}
    </div>
    </PrefsContext.Provider>
  );
}
