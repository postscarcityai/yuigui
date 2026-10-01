// Agent Controls on the web (YUI-245, spec yuigui spec/CONTROLS.md): the browser twin of the app's
// Agents/Controls.swift. A request is one relay row of kind "control"; the host's plugin answers with one row
// of its own (same `req`) within 5 seconds, which `relay.controlAnswer` finds. No turn, never in the thread.
// Pure: the relay, the clock and the storage come in, so the tests drive it without a page.

export const SECTIONS = ["soul", "memory", "skills", "schedules", "model", "channels"];

const TITLE = { soul: "Personality", memory: "Memory", skills: "Skills", schedules: "Schedules", model: "Model and tools", channels: "Channels" };
export const sectionTitle = (s) => TITLE[s] || s;
export function sectionSub(s, name) {
  return {
    soul: `Who ${name} is and how it talks`,
    memory: "What it remembers, and about you",
    skills: "Switch on, off, edit",
    schedules: "Pause, resume, run now",
    model: "What it runs on",
    channels: "Where else it answers",
  }[s] || "";
}

// ---------- what the drawer shows ----------

// The areas a host reports (`yui_agents.controls`: section -> "r", "rw" or "rwd"), in the drawer's order.
export function sectionsShown(report, name = "Your agent") {
  const have = report?.sections || {};
  return SECTIONS.filter((s) => have[s]).map((s) => ({ id: s, title: sectionTitle(s), sub: sectionSub(s, name) }));
}

// ControlsModel.report.can(section, "w"): does the host allow this mode ("r", "w", "d") here?
export const can = (report, section, mode) => !!report?.sections?.[section]?.includes(mode);

const SPOKEN = { asleep: "asleep", offline: "offline", pending: "not connected yet", not_listening: "not listening yet", paused: "paused by its owner" };
const presenceOf = (agent) => {
  const p = agent?.presence;
  if (p && (p === "online" || SPOKEN[p])) return p;
  return { connected: "online", pending: "pending", offline: "offline" }[agent?.status] || "offline";
};

// Controls need an agent of the person's own that reports sections. A shared agent never has them.
export function controlsFor(agent) {
  const name = agent?.name || "Your agent";
  if (!agent || agent.shared) return { show: false, live: false, sections: [], note: null, name };
  const sections = sectionsShown(agent.controls, name);
  if (!sections.length) return { show: false, live: false, sections: [], note: null, name };
  const p = presenceOf(agent);
  const live = p === "online";
  return { show: true, live, sections, name, note: live ? null : `${name}'s computer is ${SPOKEN[p]}. Controls come back when it's online.` };
}
export const hasControls = (agent) => controlsFor(agent).show;

// ---------- errors ----------

export class ControlsError extends Error {
  constructor(kind, { code = null, message = null, rev = null, item = null } = {}) {
    super(message || ControlsError.words(kind));
    this.name = "ControlsError";
    this.kind = kind; // "noAnswer" | "version" | "refused" | "conflict"
    this.code = code;
    this.rev = rev;
    this.item = item;
  }
  static words(kind) {
    return { noAnswer: "Your Mac didn't answer.", version: "Update the Yui plugin on your Mac.", conflict: "Changed on your Mac since you opened it.", refused: "The host couldn't do that." }[kind];
  }
}

// ---------- the model ----------

const hex8 = (uuid) => String(uuid()).replace(/-/g, "").slice(0, 8).toLowerCase();
const realSleep = (ms) => new Promise((r) => setTimeout(r, ms));

export function createControls({ relay, agentId, userId, agentName = "Your agent", report = null, wait = 5000, poll = 350, uuid = () => globalThis.crypto.randomUUID(), sleep = realSleep, now = Date.now }) {
  // One request: post the row, then look for the answer with the same `req`.
  async function send(req) {
    const what = [req.op, req.section, req.id].filter(Boolean).join(" ");
    await relay.post({ id: uuid(), userId, agentId, body: `controls: ${what}`, kind: "control", meta: req });
    const end = now() + wait;
    for (let first = true; first || now() < end; first = false) {
      await sleep(poll);
      const a = await relay.controlAnswer({ agentId, req: req.req });
      if (a) return a;
    }
    throw new ControlsError("noAnswer");
  }

  async function call(op, section, id, extra = {}) {
    const req = { v: 1, req: `c-${hex8(uuid)}`, op, section, ...(id != null ? { id } : {}), ...extra };
    const a = await send(req);
    if (a.ok) return a;
    if (a.error === "version") throw new ControlsError("version");
    if (a.error === "conflict") throw new ControlsError("conflict", { rev: a.rev || "", item: a.item || null, message: a.message || null });
    throw new ControlsError("refused", { code: a.error || "failed", message: a.message || "The host couldn't do that." });
  }
  const need = (a) => { if (!a.item) throw new ControlsError("refused", { code: "failed", message: "The host sent nothing back." }); return { rev: a.rev || "", item: a.item }; };

  return {
    agentId, agentName, report,
    can: (section, mode) => can(report, section, mode),
    list: async (section) => (await call("list", section)).items || [],
    get: async (section, id) => need(await call("get", section, id)),
    // The answer's id can differ (a memory entry's id follows its text).
    put: async (section, id, rev, value) => need(await call("put", section, id, { rev, value })),
    act: async (section, id, verb) => (await call("act", section, id, { verb })).item || null,
    delete: async (section, id, rev) => { await call("delete", section, id, { rev, confirmed: true }); },
  };
}

// ---------- drafts: an edit survives the tab closing ----------

export const draftKey = (agent, section, id) => `yui.controls.draft.${agent}.${section}.${id}`;
const store = (s) => { try { return s || globalThis.localStorage || null; } catch { return null; } };
export function saveDraft(text, key, storage) {
  const s = store(storage);
  if (!s) return;
  try { if (text == null) s.removeItem(key); else s.setItem(key, text); } catch { /* private mode, full */ }
}
export function loadDraft(key, storage) {
  const s = store(storage);
  try { return s ? s.getItem(key) : null; } catch { return null; }
}

// ---------- words ----------

// A SKILL.md's frontmatter is shown as a card, not as dashes: { meta, body }.
export function splitFrontmatter(s) {
  const text = String(s || "");
  const m = /^---[ \t]*\r?\n([\s\S]*?)\r?\n---[ \t]*(?:\r?\n|$)/.exec(text);
  if (!m) return { meta: {}, body: text };
  const meta = {};
  for (const line of m[1].split(/\r?\n/)) { const kv = /^([A-Za-z_-]+):\s*(.*)$/.exec(line); if (kv) meta[kv[1]] = kv[2]; }
  return { meta, body: text.slice(m[0].length).trim() };
}
export const withoutFrontmatter = (s) => splitFrontmatter(s).body;

export function parseTime(s) {
  if (!s) return null;
  const t = Date.parse(s);
  return Number.isNaN(t) ? null : t;
}
// "in 3 h", "in 12 min", "Tue 8:00" from the host's ISO time.
export function nextWords(iso, now = Date.now()) {
  const t = parseTime(iso);
  if (t == null) return null;
  const mins = Math.floor((t - now) / 60000);
  if (mins < 1) return "in a moment";
  if (mins < 60) return `in ${mins} min`;
  if (mins < 24 * 60) return `in ${Math.floor(mins / 60)} h`;
  return new Date(t).toLocaleString("en-US", { weekday: "short", hour: "numeric", minute: "2-digit" });
}
export function agoWords(iso, now = Date.now()) {
  const t = parseTime(iso);
  if (t == null) return null;
  const mins = Math.floor((now - t) / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins} min ago`;
  if (mins < 24 * 60) return `${Math.floor(mins / 60)} h ago`;
  const d = Math.floor(mins / 1440);
  return d === 1 ? "yesterday" : `${d} days ago`;
}
export const deliverWords = (d) => (d === "origin" ? "where it was set up" : d ? d[0].toUpperCase() + d.slice(1) : null);

// The chip's title for an item (TalkItem.title): SOUL.md, a memory's first line, a name.
export function talkTitle(section, item) {
  if (section === "soul") return "SOUL.md";
  if (section === "model") return "Model and tools";
  if (section === "memory") {
    const line = String(item?.text ?? item?.title ?? "").split("\n")[0] || "A memory";
    return line.length > 40 ? `${line.slice(0, 39).trim()}…` : line;
  }
  return item?.title || item?.id || "";
}

// ---------- the time picker's lines ----------

// every N minutes, daily at, weekdays at, or a cron line: the line the host parses.
export function scheduleLine({ kind, minutes = 30, at = "08:00", cron = "" }) {
  const [h, m] = String(at).split(":").map((x) => Number.parseInt(x, 10));
  switch (kind) {
    case "every": return `every ${minutes}m`;
    case "daily": return `${m || 0} ${h || 0} * * *`;
    case "weekdays": return `${m || 0} ${h || 0} * * 1-5`;
    default: return String(cron).trim();
  }
}
export function parseScheduleLine(s) {
  const out = { kind: "daily", minutes: 30, at: "08:00", cron: "" };
  const line = String(s || "").trim();
  const ev = /^every (\d+)/.exec(line);
  if (ev) return { ...out, kind: "every", minutes: Number(ev[1]) };
  const p = line.split(/\s+/);
  if (p.length === 5 && /^\d+$/.test(p[0]) && /^\d+$/.test(p[1]) && p[2] === "*" && p[3] === "*" && (p[4] === "*" || p[4] === "1-5")) {
    return { ...out, kind: p[4] === "*" ? "daily" : "weekdays", at: `${p[1].padStart(2, "0")}:${p[0].padStart(2, "0")}` };
  }
  return line ? { ...out, kind: "cron", cron: line } : out;
}
