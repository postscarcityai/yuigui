// Group threads on the web (SITE-162): the browser's twin of the app's Groups/GroupModel.swift, GroupClient.swift and
// GroupStore.swift (YUI-94). Spec: spec/GROUPS.md, section 7. PostgREST on `yui_threads`, `yui_thread_members` and
// `yui_messages` with the person's own `yui_user` token, so row level security does the guarding; no service key
// is anywhere near the browser. Pure and injected (`request` is relay.rest), so node tests drive it with stand-ins.
import { before } from "./thread.mjs";
import { echoFor, eventLine, relays } from "../../../mcp-app/src/events.mjs";

export const MAX_ADDRESSED = 3;   // "Ask up to three agents at once."
export const MAX_MEMBERS = 12;
export const TITLE_MAX = 60;
export const COLUMNS = "id,title,lead,max_hops,max_turns,archived_at,created_at,yui_thread_members(agent_id,left_at)";
export const ROW_COLUMNS = "id,sender,body,kind,meta,created_at,delivered_at,handled_at,reaction,doing,agent_id";

// ---------- errors, in plain words (spec/GROUPS.md section 7) ----------
const SPOKEN = {
  update_needed: "Groups need the latest Yui on your iPhone. Update the app, open it once, then try again.",
  limit_reached: "That group is full, or you have the most groups you can. Archive one first.",
  group_not_found: "That group is gone.",
  group_archived: "That group is archived. Nothing more goes in it.",
  group_agent_not_member: "That agent isn't in this group.",
  group_too_many: "Ask up to three agents at once.",
  group_uses_to: "That message can't be a mention and a group message at once.",
  group_guard_gone: "That ask is already handled.",
  group_lead_not_member: "The lead has to be in the group.",
  group_lead_cannot_leave: "The lead can't leave. Make someone else lead first.",
};
export const OTHER = "Couldn't do that right now. Try again in a moment.";

// A refusal is PostgREST JSON, `{"message": "group_archived"}`, on a RelayError's `detail`.
export function groupError(e) {
  let message = "";
  try { message = JSON.parse(e?.detail || "{}").message || ""; } catch { /* not JSON */ }
  const kind = SPOKEN[message] ? message : "other";
  return { kind, spoken: SPOKEN[message] || OTHER };
}

// ---------- titles ----------
// "Coach, Sage and Quill": the name a new group starts with.
export function suggestedTitle(names) {
  if (names.length <= 1) return names[0] || "";
  if (names.length === 2) return `${names[0]} and ${names[1]}`;
  return `${names.slice(0, -1).join(", ")} and ${names[names.length - 1]}`;
}
// A title the server takes: trimmed, 1 to 60 characters. Null when blank.
export function validTitle(raw) {
  const t = String(raw || "").trim();
  return t ? t.slice(0, TITLE_MAX) : null;
}

// ---------- the list ----------
// A group as the list read returns it: members that have not left, lead included.
export function groupOf(r) {
  return {
    id: r.id, title: r.title, lead: r.lead, maxHops: r.max_hops ?? 3, maxTurns: r.max_turns ?? 8,
    archivedAt: r.archived_at || null, createdAt: r.created_at || null,
    members: (r.yui_thread_members || []).filter((m) => !m.left_at).map((m) => m.agent_id),
    ...(r.sample ? { sample: true } : {}),
  };
}
// Newest first, archived ones left out.
export const orderedGroups = (list) => list.filter((g) => !g.archivedAt).sort((a, b) => (b.createdAt || "").localeCompare(a.createdAt || ""));
// The members as agents, the lead first (GroupInfo.ordered): what the stacked faces and the header draw.
export function membersOf(group, agents) {
  const mine = agents.filter((a) => group.members.includes(a.id));
  return [...mine.filter((a) => a.id === group.lead), ...mine.filter((a) => a.id !== group.lead)];
}
// The settings sheet's rules (GroupSettings): max hops 1 to 5, who is in, who can be added, who can be asked to leave
// (anyone but the lead; the server refuses the lead too).
export const MIN_HOPS = 1, MAX_HOPS = 5;
export const clampHops = (n) => Math.min(MAX_HOPS, Math.max(MIN_HOPS, Math.round(Number(n) || MIN_HOPS)));
export function settingsOf(group, agents) {
  return {
    hops: group.maxHops,
    inGroup: membersOf(group, agents),
    outside: agents.filter((a) => !group.members.includes(a.id)),
    canLeave: (id) => id !== group.lead,
    canAdd: group.members.length < MAX_MEMBERS,
  };
}
// The new group sheet's rule: two or more agents and a name.
export const canStart = (picked, title, names) => picked.length >= 2 && !!(validTitle(title) || validTitle(suggestedTitle(names)));

// ---------- the rows, as things to draw (GroupRows.item) ----------
// The words of a `[yui] group ...` row: no header line, no quoted context.
export function plain(body) {
  return String(body || "").split("\n").filter((l) => !l.startsWith("[yui]") && !l.startsWith(">")).join("\n").trim();
}
// One line of a handoff ask: what the asking agent said after the @.
export function askOf(body) {
  const line = plain(body).split("\n").filter(Boolean).pop() || "";
  const words = line.replace(/^(@\w[\w-]*\s*)+/, "");
  return words || line;
}

function userItem(row, g, at) {
  if (g?.from) return { kind: "handoff", id: row.id, from: g.from, to: row.agent_id || "", ask: askOf(row.body), msg: g.msg || null, cancelled: g.cancelled === true, at };
  const words = typeof g?.words === "string" ? g.words : plain(row.body);
  const to = Array.isArray(g?.to) ? g.to.filter((x) => typeof x === "string") : [];
  // A tap on an agent's screen goes as its event line: the person sees what they picked, or nothing.
  if (words.startsWith("[yui]") || !words) {
    const echo = row.meta?.echo;
    return typeof echo === "string" && echo ? { kind: "you", id: row.id, text: echo, to, at } : null;
  }
  return { kind: "you", id: row.id, text: words, to, at };
}

export function groupItem(row) {
  if (row.kind === "control") return null;
  const g = row.meta?.group;
  if (g?.copy_of || g?.control) return null;
  const at = Date.parse(row.created_at) || Date.now();
  if (row.sender === "user") return userItem(row, g, at);
  if (g?.guard && typeof g.guard.to === "string") {
    const state = ["held", "continued", "stopped", "gone"].includes(g.guard.state) ? g.guard.state : "held";
    return { kind: "guard", id: row.id, asker: row.agent_id || "", to: g.guard.to, toName: g.guard.to_name || "", text: row.body, state, at };
  }
  if (g?.status) return { kind: "status", id: row.id, about: g.about || row.agent_id || "", text: row.body, at };
  if (!row.agent_id) return null;
  return { kind: "agent", id: row.id, agent: row.agent_id, text: row.body, at };
}
export const groupItems = (rows) => rows.map(groupItem).filter(Boolean);

// Who is working: every agent with a person row (a message, a copy, a handoff) it has not handled yet. A cancelled
// handoff is handled. An agent that is asleep, offline or not connected has a status line after the ask: it waits,
// it does not work. The lead first, then the order they were asked.
export function groupWorking(rows, lead) {
  const out = [];
  const waiting = rows.filter((r) => r.sender === "agent" && ["asleep", "offline", "pending"].includes(r.meta?.group?.status));
  for (const r of rows) {
    if (r.sender !== "user" || r.kind === "control" || r.handled_at) continue;
    const g = r.meta?.group;
    if (!r.agent_id || g?.control || g?.cancelled === true) continue;
    if (waiting.some((w) => (w.meta.group.about || w.agent_id) === r.agent_id && w.created_at >= r.created_at)) continue;
    if (out.some((w) => w.agent === r.agent_id)) continue;
    out.push({ agent: r.agent_id, since: Date.parse(r.created_at) || Date.now(), pickedUp: r.delivered_at ? Date.parse(r.delivered_at) : null, doing: r.doing && typeof r.doing === "object" ? r.doing : null });
  }
  return [...out.filter((w) => w.agent === lead), ...out.filter((w) => w.agent !== lead)];
}

// ---------- @ in the composer (GroupRows.addressed, partialMention, completing) ----------
const AT = /(?<![\w])@([A-Za-z0-9_-]+)/g;
// `@Coach @Sage plan Saturday`: the member ids a message addresses, in order, three at most. A word that is
// not a member's handle is not an @.
export function addressed(text, members) {
  const out = [];
  for (const m of String(text || "").matchAll(AT)) {
    const a = members.find((x) => String(x.handle).toLowerCase() === m[1].toLowerCase());
    if (a && !out.includes(a.id)) out.push(a.id);
  }
  return out.slice(0, MAX_ADDRESSED);
}
// The @ being typed at the end of the text, for the suggestion list. Null when none.
export function partialMention(text) {
  const m = /(?<![\w])@([A-Za-z0-9_-]*)$/.exec(String(text || ""));
  return m ? m[1] : null;
}
export function completing(text, handle) {
  return String(text || "").replace(/(?<![\w])@([A-Za-z0-9_-]*)$/, `@${handle} `);
}
// The members the typed @ could mean: by handle or name prefix. Empty when no @ is being typed.
export function suggest(text, members) {
  const p = partialMention(text);
  if (p === null) return [];
  const q = p.toLowerCase();
  return members.filter((a) => !q || String(a.handle).toLowerCase().startsWith(q) || String(a.name).toLowerCase().startsWith(q));
}
// Who the words go to: the members @ed, else the one a reply was aimed at, else nobody (the lead answers).
export function addressees(text, members, replyTarget = null) {
  const named = addressed(text, members);
  if (named.length) return named;
  return replyTarget && members.some((a) => a.id === replyTarget) ? [replyTarget] : [];
}

// A tap or a submit on an agent's screen: that agent's turn, nobody else's. The same line the phone sends
// (ThreadSync.tap), or null for a quiet event (a timer starting, a tick) that stays on the page.
export function tapOf(full) {
  const { _echo, ...ev } = full;
  const echo = _echo ?? echoFor(ev);
  return relays(ev, echo) ? { words: eventLine(ev), echo: echo ?? null } : null;
}

// ---------- the calls (GroupClient.swift) ----------
const qs = (pairs) => new URLSearchParams(pairs).toString();
const JSON_POST = { "Content-Type": "application/json", Prefer: "return=minimal" };

export function createGroupsClient(request, { userId }) {
  const call = async (path, init) => {
    try { return await request(path, init); }
    catch (e) { throw Object.assign(new Error(groupError(e).kind), { group: groupError(e), cause: e }); }
  };
  const patch = (thread, fields) => call(`rest/v1/yui_threads?${qs([["id", `eq.${thread}`]])}`, { method: "PATCH", headers: JSON_POST, body: JSON.stringify(fields) });
  const insert = (row) => call("rest/v1/yui_messages", { method: "POST", headers: JSON_POST, body: JSON.stringify(row) });
  const control = (thread, lead, body, group) => insert({ id: globalThis.crypto.randomUUID(), user_id: userId, agent_id: lead, thread_id: thread, sender: "user", kind: "text", body, meta: { group } });
  const api = {
    // The person's groups, archived ones left out.
    async list() {
      const res = await call(`rest/v1/yui_threads?${qs([["select", COLUMNS], ["archived_at", "is.null"], ["order", "created_at.desc"]])}`);
      return orderedGroups((await res.json()).map(groupOf));
    },
    // Makes the group: the thread (the lead is seated by trigger), then the other members. Refused with
    // `update_needed` while the account's newest app build is below `group_min_build`.
    async create({ id, title, lead, members }) {
      await call("rest/v1/yui_threads", { method: "POST", headers: JSON_POST, body: JSON.stringify({ id, user_id: userId, title, lead }) });
      const others = members.filter((m) => m !== lead);
      if (others.length) await api.add(others, id);
    },
    async add(agents, thread) {
      try {
        await call("rest/v1/yui_thread_members", { method: "POST", headers: JSON_POST, body: JSON.stringify(agents.map((a) => ({ thread_id: thread, agent_id: a, user_id: userId }))) });
      } catch (e) {
        // One of them left earlier: seat it again.
        if (e.cause?.status !== 409) throw e;
        for (const a of agents) await call(`rest/v1/yui_thread_members?${qs([["thread_id", `eq.${thread}`], ["agent_id", `eq.${a}`]])}`, { method: "PATCH", headers: JSON_POST, body: JSON.stringify({ left_at: null }) });
      }
    },
    leave: (agent, thread) => call(`rest/v1/yui_thread_members?${qs([["thread_id", `eq.${thread}`], ["agent_id", `eq.${agent}`]])}`, { method: "PATCH", headers: JSON_POST, body: JSON.stringify({ left_at: new Date().toISOString() }) }),
    rename: (thread, title) => patch(thread, { title }),
    makeLead: (agent, thread) => patch(thread, { lead: agent }),
    setMaxHops: (n, thread) => patch(thread, { max_hops: n }),
    archive: (thread) => patch(thread, { archived_at: new Date().toISOString() }),
    // The group's newest rows, oldest first; or everything after `since`.
    async rows({ thread, since = null, limit = 100 }) {
      const q = [["select", ROW_COLUMNS], ["thread_id", `eq.${thread}`]];
      if (since) q.push(["created_at", `gt.${before(since, 5)}`], ["order", "created_at.asc,id.asc"]);
      else q.push(["order", "created_at.desc"], ["limit", String(limit)]);
      const rows = await (await call(`rest/v1/yui_messages?${qs(q)}`)).json();
      return since ? rows : rows.reverse();
    },
    // The person's words. `agent` is any member (the trigger picks the real one); `to` the addressed ids.
    say({ id, thread, agent, words, to, echo = null, photos = [] }) {
      const meta = { group: { to }, ...(echo ? { echo } : {}), ...(photos.length ? { photos } : {}) };
      return insert({ id, user_id: userId, agent_id: agent, thread_id: thread, sender: "user", kind: "text", body: words, meta });
    },
    // Let it: the held ask goes out on a fresh budget. Stop: every handoff not picked up yet is cancelled.
    letIt: ({ guard, thread, lead }) => control(thread, lead, `[yui] group continue guard=${guard}`, { control: "continue", guard }),
    stop: ({ thread, lead }) => control(thread, lead, "[yui] group stop", { control: "stop" }),
  };
  return api;
}
