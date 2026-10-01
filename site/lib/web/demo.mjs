// Demo mode (YUI-242, docs/specs/web-parity.md "The e2e harness"): `/web?demo=<sample>` is a fake relay in the
// page. It has the relay client's shape (relay.mjs), so the same Thread, ThreadSync and outbox run on it,
// but nothing leaves the tab: no sign in, no network. It is the web twin of the app's -yuiDemoAccount,
// the site demo's engine and the only thing CI touches. A recorded thread lives in app/web/fixtures/;
// rows keep the real column shape (spec/RELAY.md), plus `ago_min` so the days read right on any date.
//
// The scripted agent does what a host does: picks the person's row up (`delivered_at`), writes `doing`
// while it works, answers with one row carrying `meta.turn`, and marks the row handled.

import { demoControlHost } from "./controls-demo.mjs";
import { createAgentsClient } from "./agents.mjs";
import { createSettingsDemo } from "./settings-demo.mjs";
import { askLine } from "./vault.mjs";

let n = 9000;
const id = () => `00000000-0000-4000-8000-${String(++n).padStart(12, "0")}`;

const iso = (t) => new Date(t).toISOString().replace(/\.(\d{3})Z$/, ".$1000+00:00");

// Fixture rows -> rows as the relay returns them, dated from `now`.
export function materialize(fixture, now = Date.now()) {
  const threads = {};
  for (const [agentId, rows] of Object.entries(fixture.threads)) {
    threads[agentId] = rows.map(({ ago_min, ...r }) => {
      const at = iso(now - ago_min * 60000);
      return { reaction: null, doing: null, ...r, created_at: at, delivered_at: r.sender === "user" ? at : null, handled_at: r.sender === "user" ? at : null };
    });
  }
  return threads;
}

const chatId = () => `00000000-0000-4000-9000-${String(++n).padStart(12, "0")}`;
const failure = (status, message) => { const e = new Error(`http_${status}`); e.status = status; e.detail = JSON.stringify({ message }); return e; };
const refused = (code, status = 400) => { const e = new Error(code); e.code = code; e.status = status; return e; };
const SORTED = (list) => [...list].sort((a, b) => (a.sort ?? 0) - (b.sort ?? 0));

export function createDemoRelay(fixture, { now = Date.now, speed = 1, userId = "demo-user" } = {}) {
  const threads = materialize(fixture, now());
  // The agent list lives here, so add, rename, remove and reorder act on something (yui-agents in a tab).
  const roster = (fixture.agents || []).map((a) => JSON.parse(JSON.stringify(a)));
  const crew = (fixture.crew || []).map((c) => ({ ...c }));
  // Several chats per agent. A row with no chat_id belongs to the agent's first chat.
  const chatsOf = {};
  const firstChat = (agentId) => (chatsOf[agentId] ||= [{ id: `${agentId}-c1`, title: null, is_first: true, last_at: iso(now()), seen_at: iso(now()), unread: false }])[0];
  for (const [agentId, list] of Object.entries(fixture.chats || {})) {
    chatsOf[agentId] = list.map((c, i) => ({ title: null, is_first: i === 0, seen_at: iso(now()), unread: false, ...c, last_at: iso(now() - (c.ago_min ?? 0) * 60000) }));
  }
  const chatIdOf = (r, agentId) => r.chat_id || firstChat(agentId).id;
  const pairings = new Map();
  let pairN = 482900;
  const newPairing = (agentId) => { const code = String(++pairN); pairings.set(agentId, code); return { code, expires_at: new Date(now() + 10 * 60000).toISOString() }; };
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms / speed));
  const rows = (agentId) => (threads[agentId] ||= []);
  const blobs = new Map(), links = new Map();
  let tick = 0;
  // Strictly increasing, so a row posted in the same millisecond still sorts after the last one.
  const bump = () => { tick = Math.max(now(), tick + 1); return iso(tick); };

  async function answer(agentId, userRow) {
    const kind = userRow.kind === "event" ? "event" : "text";
    // A line asking for a timer gets the one that takes the whole window (a staged part opens by itself).
    const key = kind === "text" && /\btimer\b/i.test(userRow.body || "") && fixture.replies.timer ? "timer" : kind;
    const script = (fixture.replies[key] || fixture.replies.text || [])[0];
    if (!script) return;
    await sleep(500);
    userRow.delivered_at = bump();
    // The host writes what it is doing, one phrase after another.
    for (const step of script.doing || []) {
      const m = /^(.*?)(?: (\d+)\/(\d+))?$/.exec(step);
      userRow.doing = m[2] ? { text: m[1], step: Number(m[2]), of: Number(m[3]) } : { text: m[1] };
      await sleep(700);
    }
    rows(agentId).push({ id: id(), sender: "agent", body: script.body, kind: "text", meta: { turn: [userRow.id] }, ...(userRow.chat_id ? { chat_id: userRow.chat_id } : {}), created_at: bump(), delivered_at: null, handled_at: null, reaction: null, doing: null });
    userRow.handled_at = bump();
  }

  // A mention goes to the other agent; its answer comes back here as an agent row with `mention_reply`
  // (spec/RELAY.md, Mentions), and this agent is not asked.
  async function mentioned(agentId, userRow) {
    const to = userRow.meta.mention;
    const script = (fixture.replies.mention || [])[0] || { body: `${to.name} here. Got it.` };
    await sleep(500);
    userRow.delivered_at = bump();
    for (const step of script.doing || []) { userRow.doing = { text: step }; await sleep(700); }
    rows(agentId).push({ id: id(), sender: "agent", body: script.body, kind: "text", meta: { mention_reply: { agent: to.to, name: to.name, handle: to.handle } }, ...(userRow.chat_id ? { chat_id: userRow.chat_id } : {}), created_at: bump(), delivered_at: null, handled_at: null, reaction: null, doing: null });
    userRow.handled_at = bump();
  }


  const slug = (name) => (String(name).toLowerCase().normalize("NFKD").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") || "agent").slice(0, 28);
  const handleFor = (name) => { const base = slug(name); let h = base; for (let i = 2; roster.some((a) => a.handle === h); i++) h = `${base}-${i}`; return h; };
  const view = (a) => ({ ...a });
  function addAgent(row) {
    const a = { kind: "hermes", status: "pending", presence: "pending", is_default: false, theme: {}, push_muted: false, ...row, sort: roster.length };
    roster.push(a);
    return a;
  }
  function manage(b) {
    const find = (id) => roster.find((a) => a.id === id) || (() => { throw refused("not_found", 404); })();
    switch (b.action) {
      case "list": return { agents: SORTED(roster).map(view), crew: crew.map((c) => ({ ...c })), crew_pending: false, first_name: fixture.first_name || null };
      case "create": {
        const name = String(b.name || "").replace(/\s+/g, " ").trim().slice(0, 40);
        if (!name) throw refused("invalid_name");
        const handle = handleFor(name);
        const a = addAgent({ id: `demo-${handle}`, name, handle, color: b.color || "mint" });
        return { agent: view(a), pairing: newPairing(a.id) };
      }
      case "pair_code": find(b.agent_id); return newPairing(b.agent_id);
      case "update": {
        const a = find(b.id);
        if (b.name !== undefined) { const nm = String(b.name).replace(/\s+/g, " ").trim().slice(0, 40); if (!nm) throw refused("invalid_name"); a.name = nm; }
        if (b.color !== undefined) a.color = b.color;
        if (b.theme !== undefined) a.theme = { ...b.theme };
        if (b.push_muted !== undefined) a.push_muted = !!b.push_muted;
        if (b.is_default === true) for (const x of roster) x.is_default = x.id === a.id;
        if (b.sort !== undefined) a.sort = b.sort;
        return { agent: view(a) };
      }
      case "delete": {
        const a = find(b.id);
        roster.splice(roster.indexOf(a), 1);
        delete threads[a.id]; delete chatsOf[a.id];
        for (const c of crew) if (c.agent_id === a.id) c.agent_id = null;
        if (a.is_default && roster.length) SORTED(roster)[0].is_default = true;
        SORTED(roster).forEach((x, i) => { x.sort = i; });
        return { deleted: true };
      }
      case "reorder": { (b.ids || []).forEach((id, i) => { const a = roster.find((x) => x.id === id); if (a) a.sort = i; }); return { ok: true }; }
      case "crew_add": {
        const c = crew.find((x) => x.base === b.base);
        if (!c) throw refused("not_found", 404);
        let a = roster.find((x) => x.id === c.agent_id);
        if (!a) { a = addAgent({ id: `demo-${c.base}`, name: c.name, handle: c.base, color: c.color, kind: "hosted", status: "connected", presence: "online", tagline: c.tagline, theme: { preset: c.color } }); c.agent_id = a.id; }
        return { agent: view(a) };
      }
      case "crew_add_all": {
        const added = [];
        for (const c of crew) if (!roster.some((x) => x.id === c.agent_id)) { manage({ action: "crew_add", base: c.base }); added.push(c.base); }
        return { added };
      }
      case "crew_choose": { const added = []; for (const base of b.bases || []) { manage({ action: "crew_add", base }); added.push(base); } return { added }; }
      default: throw refused("unknown_action");
    }
  }
  // An MCP client asking to connect (yui-oauth app_request, app_approve, app_deny). "demo-expired" and
  // "demo-done" are requests that are no longer open; any other id is a pending ask from Claude.
  const connects = new Map();
  function connectDemo(b) {
    if (!/^[0-9a-z-]{3,64}$/.test(String(b.id || ""))) throw refused("invalid_request");
    if (b.id === "demo-missing") throw refused("invalid_request");
    const r = connects.get(b.id) || { id: b.id, client: { name: "Claude", site: "claude.ai" }, status: b.id === "demo-expired" ? "expired" : b.id === "demo-done" ? "approved" : "pending" };
    connects.set(b.id, r);
    const describe = () => ({ id: r.id, client: r.client, status: r.status });
    if (b.action === "app_request") return { ...describe(), agents: roster.filter((a) => a.kind === "mcp" || (!a.connector_name && a.status === "pending")).map((a) => ({ id: a.id, name: a.name, handle: a.handle })), suggested_name: r.client.name };
    if (r.status !== "pending") throw refused("invalid_request");
    if (b.action === "app_deny") { r.status = "denied"; return describe(); }
    if (b.action === "app_approve") {
      let a = b.agent_id ? roster.find((x) => x.id === b.agent_id) : null;
      if (!a) { const name = String(b.name || r.client.name).slice(0, 40); const handle = handleFor(name); a = addAgent({ id: `demo-${handle}`, name, handle, kind: "mcp", status: "connected", presence: "online", connector_name: r.client.name }); }
      r.status = "approved";
      return { ...describe(), agent: { id: a.id, name: a.name } };
    }
    throw refused("unknown_action");
  }
  // The host answers a control request in the same table, one row, the same `req` (CONTROLS.md section 2).
  const controlHost = demoControlHost();
  const settings = createSettingsDemo({ now });
  function controlled(agentId, userRow) {
    const reply = (meta) => rows(agentId).push({ id: id(), sender: "agent", body: "controls", kind: "control", meta, created_at: bump(), delivered_at: null, handled_at: null, reaction: null, doing: null });
    Promise.resolve(controlHost.handle(agentId, userRow.meta || {}, { agent: roster.find((a) => a.id === agentId) })).then((meta) => { if (meta) setTimeout(() => reply(meta), 120 / speed); });
  }
  const pushCalls = [];

  const syncRows = new Map();
  const relay = {
    demo: true,
    userId,
    settings,
    rest: (path, init) => settings.rest(path, init),
    async keyAsks(agentId) { return settings.asksFor(agentId); },
    // The relay would write the one line into the agent's next turn; the demo shows it (the app's demo does too).
    async answerKeyAsk({ agentId, meta, purpose = "" }) {
      settings.answered(meta);
      rows(agentId).push({ id: id(), sender: "agent", body: askLine({ ...meta, purpose }), kind: "text", meta: null, created_at: bump(), delivered_at: null, handled_at: null, reaction: null, doing: null });
    },
    async agents() { return { agents: SORTED(roster).map((a) => ({ ...a })), crew: crew.map((c) => ({ ...c })), crew_pending: false, first_name: fixture.first_name || null }; },
    // yui-agents and yui-oauth in a tab: the same actions and replies, kept in this page.
    async call(fn, body) {
      if (this.offline) throw refused("network", 0);
      await sleep(30);
      if (fn === "yui-oauth") return connectDemo(body);
      // yui-push (YUI-248): kept in this page so the checks read what the browser told it.
      if (fn === "yui-push") { pushCalls.push(body); return { ok: true, tracked: true }; }
      const own = settings.call(fn, body);
      if (own !== undefined) return own;
      if (fn !== "yui-agents") throw refused("unknown_function");
      return manage(body);
    },
    pushCalls,
    // The host side of a pairing, for the e2e checks: its computer claims the code, then its gateway listens.
    host: {
      pair(agentId) { const a = roster.find((x) => x.id === agentId); if (a) Object.assign(a, { status: "connected", presence: "not_listening", connector_name: "Maya's Mac", remote_ref: a.handle, last_seen_at: iso(now()) }); },
      listen(agentId) { const a = roster.find((x) => x.id === agentId); if (a) Object.assign(a, { presence: "online", last_seen_at: iso(now()) }); },
      sleep(agentId) { const a = roster.find((x) => x.id === agentId); if (a) a.presence = "asleep"; },
      roster: () => roster.map((a) => ({ ...a })),
      pairingFor: (agentId) => pairings.get(agentId) || null,
    },
    async menuRows(agentId) { return rows(agentId).filter((r) => r.sender === "agent" && r.kind !== "control" && /menu /.test(r.body || "")).map((r) => ({ id: r.id, sender: r.sender, kind: r.kind, body: r.body, created_at: r.created_at })); },
    async controlAnswer({ agentId, req }) {
      const hit = rows(agentId).find((r) => r.kind === "control" && r.sender === "agent" && r.meta?.req === req);
      return hit ? { ...hit.meta } : null;
    },
    // yui_sync_state in the page (state.mjs): `phone(agent, key, value)` is the other device writing.
    state: {
      list: async (agentId) => [...syncRows.entries()].filter(([k]) => k.startsWith(`${agentId}|`)).map(([k, r]) => ({ key: k.split("|")[1], ...r })),
      put: async ({ agentId, key, value, device }) => { syncRows.set(`${agentId}|${key}`, { value, device, updated_at: new Date(now()).toISOString() }); },
      phone: (agentId, key, value) => { syncRows.set(`${agentId}|${key}`, { value, device: "phone", updated_at: new Date(now() + 1000).toISOString() }); },
    },
    chats: {
      list: async (agentId, { limit = 30, offset = 0 } = {}) => {
        firstChat(agentId);
        const mine = rows(agentId).filter((r) => r.kind !== "control");
        const list = chatsOf[agentId].map((c) => {
          const inChat = mine.filter((r) => chatIdOf(r, agentId) === c.id);
          const last = inChat[inChat.length - 1];
          return { ...c, saved: true, last_body: last?.body ?? null, last_sender: last?.sender ?? null, last_message_at: last?.created_at ?? null, last_at: last?.created_at ?? c.last_at, unread: !!(last && last.sender === "agent" && (!c.seen_at || Date.parse(last.created_at) > Date.parse(c.seen_at))) };
        });
        list.sort((a, b) => (Date.parse(b.last_at) - Date.parse(a.last_at)) || (a.id < b.id ? -1 : 1));
        return list.slice(offset, offset + limit);
      },
      insert: async ({ id: cid, agentId }) => { firstChat(agentId); if (!chatsOf[agentId].some((c) => c.id === cid)) chatsOf[agentId].push({ id: cid, title: null, is_first: false, last_at: bump(), seen_at: null, unread: false }); },
      rename: async (cid, title) => { for (const l of Object.values(chatsOf)) { const c = l.find((x) => x.id === cid); if (c) c.title = title; } },
      seen: async (cid, at) => { for (const l of Object.values(chatsOf)) { const c = l.find((x) => x.id === cid); if (c) c.seen_at = at; } },
      remove: async (cid) => {
        for (const a of roster) firstChat(a.id);
        for (const [agentId, l] of Object.entries(chatsOf)) {
          const at = l.findIndex((x) => x.id === cid);
          if (at < 0) continue;
          if (l.length === 1) throw failure(409, "last_chat");
          l.splice(at, 1);
          threads[agentId] = rows(agentId).filter((r) => chatIdOf(r, agentId) !== cid);
        }
      },
      clear: async (cid) => { for (const agentId of Object.keys(chatsOf)) threads[agentId] = rows(agentId).filter((r) => chatIdOf(r, agentId) !== cid); },
    },
    async fetchRows({ agentId, chatId = null, since, limit = 100 }) {
      firstChat(agentId);
      const all = rows(agentId).filter((r) => (r.kind !== "control" || (r.sender === "user" && r.body === "stop")) && (!chatId || chatIdOf(r, agentId) === chatId));
      if (since) {
        const from = Date.parse(since);
        return all.filter((r) => Date.parse(r.created_at) > from).map((r) => ({ ...r }));
      }
      return all.slice(-limit).map((r) => ({ ...r }));
    },
    async newestFromUser({ agentId, chatId = null }) {
      const mine = rows(agentId).filter((r) => r.sender === "user" && r.kind !== "control" && (!chatId || chatIdOf(r, agentId) === chatId));
      const r = mine[mine.length - 1];
      return r ? { ...r } : null;
    },
    // The e2e checks cut the network with `offline = true`: every write then fails the way a dropped one does.
    offline: false,
    async post({ id: rid, agentId, chatId = null, body, kind = "text", meta = null }) {
      if (this.offline) throw new TypeError("network down");
      const list = rows(agentId);
      if (list.some((r) => r.id === rid)) return; // the primary key: a resend counts as sent
      const row = { id: rid, sender: "user", body, kind, meta: meta || {}, created_at: bump(), delivered_at: null, handled_at: null, reaction: null, doing: null };
      if (chatId && kind !== "control") row.chat_id = chatId;
      list.push(row);
      if (kind === "control") { controlled(agentId, row); return; }
      // The database copies a reaction onto the agent's row (spec/REACTIONS.md).
      if (row.meta.react) { const hit = list.find((r) => r.id === row.meta.react.msg && r.sender === "agent"); if (hit) hit.reaction = row.meta.react.emoji; }
      if (row.meta.mention) { mentioned(agentId, row); return; }
      answer(agentId, row);
    },
    // A photo into the bucket, kept for the page's life; the bytes never leave the tab.
    async upload({ path, blob }) { if (this.offline) throw new TypeError("network down"); if (!blobs.has(path)) blobs.set(path, blob); },
    // What went up, for the e2e checks: the path, the type and the size in bytes.
    uploads() { return [...blobs].map(([path, b]) => ({ path, type: b.type, size: b.size })); },
    // The first `n` bytes of what went up at `path`, for the e2e checks (a take's .mid is read here: the page's CSP keeps fetch off blob links).
    async head(path, n = 14) { const b = blobs.get(path); return b ? [...new Uint8Array(await b.slice(0, n).arrayBuffer())] : []; },
    async sign(path) { const b = blobs.get(path); if (!b) return ""; if (!links.has(path)) links.set(path, URL.createObjectURL(b)); return links.get(path); },
    async deliver(item) { for (const u of item.uploads || []) await this.upload(u); await this.post(item); },
    subscribe() { return () => {}; },
    // The e2e checks drop a reply into a thread as the agent would write it: Yui Lines in a fence, an optional
    // `meta` (a reply's `native` reminders ride there).
    say(agentId, yl, meta = {}) {
      rows(agentId).push({ id: id(), sender: "agent", body: "```yui\n" + yl + "\n```", kind: "text", meta, created_at: bump(), delivered_at: null, handled_at: null, reaction: null, doing: null });
    },
    // Every row the demo agent ever wrote or was sent, for the e2e checks (they read the wire, not the screen).
    wire(agentId) { return rows(agentId).filter((r) => r.sender === "user").map((r) => ({ kind: r.kind, body: r.body, meta: r.meta })); },
  };
  relay.manage = createAgentsClient((fn, body) => relay.call(fn, body));
  return relay;
}
