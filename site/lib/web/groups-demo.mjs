// Group threads in demo mode (SITE-162): `/web?demo=penny` shows one sample group on a fake relay in the page, with
// the same calls as groups.mjs `createGroupsClient`. Nothing leaves the tab. The sample is a recorded week with
// every row kind in it (a handoff, a screen, an agent that is asleep, a held guard); sending and Let it / Stop
// answer from a script the way a host does. Everything is marked `sample` so the page can say so.
import { groupError, groupOf, orderedGroups, validTitle } from "./groups.mjs";

let n = 0;
const id = () => `00000000-0000-4000-a000-${String(++n).padStart(12, "0")}`;
const iso = (t) => new Date(t).toISOString().replace(/\.(\d{3})Z$/, ".$1000+00:00");

export const SAMPLE_ID = "demo-group-week";

// The sample, from the agents the fixture has. Lead first; the rows read oldest to newest.
export function sampleGroup(agents, now = Date.now()) {
  // Penny leads, Basil sleeps in the fixture, Yui answers; any other roster fills in for the names it lacks.
  const pick = [...["penny", "basil", "yui"].map((h) => agents.find((a) => a.handle === h)).filter(Boolean), ...agents];
  const three = pick.filter((a, i) => pick.indexOf(a) === i).slice(0, 3);
  if (three.length < 2) return null;
  const [penny, basil, yui = basil] = three;
  const at = (m) => iso(now - m * 60000);
  const msgId = id(), guardId = id();
  const row = (o, m) => ({ reaction: null, doing: null, delivered_at: o.sender === "user" ? at(m) : null, handled_at: o.sender === "user" ? at(m) : null, ...o, created_at: at(m), id: o.id || id() });
  const head = (to, from, extra = "") => `[yui] group "Race week" thread=${SAMPLE_ID} with=penny,basil,yui lead=penny hop=${from === "person" ? 0 : 1} from=${from}${extra}`;
  const rows = [
    row({ sender: "user", kind: "text", agent_id: penny.id, body: `${head(0, "person")}\n@Penny plan my week before Saturday's 10k`, meta: { group: { words: "@Penny plan my week before Saturday's 10k", to: [penny.id], hop: 0 } } }, 52),
    row({ id: msgId, sender: "agent", kind: "text", agent_id: penny.id, body: "Five days, easy then sharp. Thursday carries the long one.\n```yui\nlist \"Mon easy 5k\"|\"Tue strides\"|\"Thu long 10k\"|\"Sat tempo 6k\" +check\n```\n@Basil can you plan light dinners for the run days?", meta: { group: { hop: 0 } } }, 51),
    row({ sender: "user", kind: "text", agent_id: basil.id, body: `${head(1, "penny")}\n> Penny: Five days, easy then sharp.\n@Basil can you plan light dinners for the run days?`, meta: { group: { from: penny.id, from_name: penny.name, msg: msgId, hop: 1 } } }, 51),
    row({ sender: "agent", kind: "text", agent_id: basil.id, body: `${basil.name} is asleep. It gets this when its computer wakes.`, meta: { group: { status: "asleep", about: basil.id } } }, 51),
    row({ sender: "user", kind: "text", agent_id: yui.id, body: `${head(1, "penny")}\n@Yui set a stretch reminder after each run`, meta: { group: { from: penny.id, from_name: penny.name, msg: msgId, hop: 1 } } }, 50),
    row({ sender: "agent", kind: "text", agent_id: yui.id, body: "Done. A stretch reminder after each run day.\n```yui\nchoose \"Stretch before or after the run?\" Before|After\n```", meta: { group: { hop: 1 } } }, 49),
    row({ id: guardId, sender: "agent", kind: "text", agent_id: penny.id, body: "Penny wants to ask Basil: \"turn the dinners into a shopping list\"\nThat's 3 handoffs since you last said something.", meta: { group: { guard: { to: basil.id, to_name: basil.name, from: penny.id, msg: msgId, hop: 4, reason: "hops", state: "held" } } } }, 48),
  ];
  return { info: groupOf({ id: SAMPLE_ID, title: "Race week", lead: penny.id, max_hops: 3, max_turns: 8, created_at: at(55), sample: true, yui_thread_members: [...new Set([penny, basil, yui])].map((a) => ({ agent_id: a.id, left_at: null })) }), rows };
}

export function createDemoGroups({ agents, now = Date.now, speed = 1 }) {
  const list = agents();
  const first = sampleGroup(list, now());
  const groups = first ? [first.info] : [];
  const rowsOf = first ? { [SAMPLE_ID]: first.rows } : {};
  let tick = 0;
  const bump = () => { tick = Math.max(now(), tick + 1); return iso(tick); };
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms / speed));
  const find = (t) => groups.find((g) => g.id === t) || (() => { throw Object.assign(new Error("group_not_found"), { group: { kind: "group_not_found", spoken: "That group is gone." } }); })();
  const rows = (t) => (rowsOf[t] ||= []);
  const name = (a) => list.find((x) => x.id === a)?.name || "An agent";
  const asleep = (a) => list.find((x) => x.id === a)?.presence === "asleep";
  const stopped = new Set(); // threads whose chain a Stop cut

  // The host: pick the row up, say what it is doing, answer; a sleeping agent gets a status line instead.
  async function answer(thread, userRow, agent, text) {
    if (asleep(agent)) {
      rows(thread).push({ id: id(), sender: "agent", kind: "text", agent_id: agent, body: `${name(agent)} is asleep. It gets this when its computer wakes.`, meta: { group: { status: "asleep", about: agent } }, created_at: bump(), delivered_at: null, handled_at: null, reaction: null, doing: null });
      userRow.handled_at = bump();
      return;
    }
    await sleep(500);
    userRow.delivered_at = bump();
    userRow.doing = { text: "Reading the thread" };
    await sleep(1400);
    if (userRow.meta.group?.cancelled) return;
    const reply = text(name(agent));
    rows(thread).push({ id: id(), sender: "agent", kind: "text", agent_id: agent, body: reply, meta: { group: { hop: userRow.meta.group?.hop ?? 0 } }, created_at: bump(), delivered_at: null, handled_at: null, reaction: null, doing: null });
    userRow.handled_at = bump();
    userRow.doing = null;
  }

  const api = {
    sample: true,
    async list() { return orderedGroups(groups.map((g) => ({ ...g, members: [...g.members] }))); },
    // The e2e checks make the next create fail the way the server does ("update_needed", "limit_reached", ...).
    failNext: null,
    async create({ id: gid, title, lead, members }) {
      if (api.failNext) { const kind = api.failNext; api.failNext = null; throw Object.assign(new Error(kind), { group: groupError({ detail: JSON.stringify({ message: kind }) }) }); }
      const t = validTitle(title);
      if (!t) throw Object.assign(new Error("other"), { group: { kind: "other", spoken: "Couldn't do that right now. Try again in a moment." } });
      groups.push(groupOf({ id: gid, title: t, lead, created_at: bump(), sample: true, yui_thread_members: [...new Set([lead, ...members])].map((a) => ({ agent_id: a, left_at: null })) }));
    },
    async add(agents2, thread) { const g = find(thread); for (const a of agents2) if (!g.members.includes(a)) g.members.push(a); },
    async leave(agent, thread) { const g = find(thread); if (agent === g.lead) throw Object.assign(new Error("group_lead_cannot_leave"), { group: { kind: "group_lead_cannot_leave", spoken: "The lead can't leave. Make someone else lead first." } }); g.members = g.members.filter((m) => m !== agent); },
    async rename(thread, title) { find(thread).title = title; },
    async makeLead(agent, thread) { find(thread).lead = agent; },
    async setMaxHops(k, thread) { find(thread).maxHops = k; },
    async archive(thread) { find(thread).archivedAt = bump(); },
    async rows({ thread, since = null, limit = 100 }) {
      find(thread);
      const all = rows(thread);
      if (since) { const from = Date.parse(since) - 5000; return all.filter((r) => Date.parse(r.created_at) > from).map((r) => ({ ...r })); }
      return all.slice(-limit).map((r) => ({ ...r }));
    },
    async say({ id: rid, thread, agent, words, to, echo = null }) {
      const g = find(thread);
      if (g.archivedAt) throw Object.assign(new Error("group_archived"), { group: { kind: "group_archived", spoken: "That group is archived. Nothing more goes in it." } });
      const list2 = rows(thread);
      if (list2.some((r) => r.id === rid)) return;
      stopped.delete(thread);
      const targets = to.length ? to : [g.lead];
      const body = `[yui] group "${g.title}" thread=${thread} lead=${name(g.lead)} hop=0 from=person\n${words}`;
      targets.forEach((t, i) => {
        const meta = i === 0 ? { group: { words, to, hop: 0 }, ...(echo ? { echo } : {}) } : { group: { copy_of: rid, hop: 0 } };
        const row = { id: i === 0 ? rid : id(), sender: "user", kind: "text", agent_id: t, body, meta, created_at: bump(), delivered_at: null, handled_at: null, reaction: null, doing: null };
        list2.push(row);
        answer(thread, row, t, (who) => (words.startsWith("[yui]") ? `${who} here. Noted, that is set.` : /\bdinner|meal|eat\b/i.test(words) ? `${who} here. Light and early on run days, heavier the night before the 10k.` : `${who} here. Got it: ${words.replace(/@\w[\w-]*\s*/g, "").slice(0, 80)}`));
      });
    },
    async letIt({ guard, thread }) {
      const g = find(thread);
      const gr = rows(thread).find((r) => r.id === guard);
      if (!gr || gr.meta.group.guard.state !== "held") throw Object.assign(new Error("group_guard_gone"), { group: { kind: "group_guard_gone", spoken: "That ask is already handled." } });
      gr.meta = { group: { guard: { ...gr.meta.group.guard, state: "continued" } } };
      const to = gr.meta.group.guard.to;
      const row = { id: id(), sender: "user", kind: "text", agent_id: to, body: `[yui] group "${g.title}" hop=1 from=${gr.agent_id}\n@${name(to)} turn the dinners into a shopping list`, meta: { group: { from: gr.agent_id, from_name: name(gr.agent_id), msg: gr.meta.group.guard.msg, hop: 1 } }, created_at: bump(), delivered_at: null, handled_at: null, reaction: null, doing: null };
      rows(thread).push(row);
      answer(thread, row, to, (who) => `${who} here. A list for Mon to Thu.`);
    },
    async stop({ thread, lead }) {
      stopped.add(thread);
      const list2 = rows(thread);
      let who = null;
      for (const r of list2) {
        if (r.sender === "user" && !r.handled_at && r.meta.group?.from) { r.meta = { group: { ...r.meta.group, cancelled: true } }; r.handled_at = bump(); who = who || r; }
      }
      for (const r of list2) if (r.meta?.group?.guard?.state === "held") r.meta = { group: { guard: { ...r.meta.group.guard, state: "stopped" } } };
      list2.push({ id: id(), sender: "agent", kind: "text", agent_id: lead, body: who ? `Stopped. ${name(who.agent_id)} won't pick up ${name(who.meta.group.from)}'s ask.` : "Stopped.", meta: { group: { status: "stopped", about: lead } }, created_at: bump(), delivered_at: null, handled_at: null, reaction: null, doing: null });
    },
  };
  return api;
}
