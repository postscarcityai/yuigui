// Managing agents on the web (YUI-245): the app's Agents/AgentStore.swift, AgentsView.swift (Add agent, the
// pairing step, Edit, the list) and Agents/GatewayWait.swift as pure words and one thin client over yui-agents.
// The client takes `call(fn, body)` (relay.call), so the tests drive it with a stand-in and the demo with a
// fake host. Nothing here draws.
import { liveness } from "./presence.mjs";

// ---------------------------------------------------------------- pairing words

export const INSTALL = "hermes plugins install postscarcityai/yui/hermes-plugin/yui --enable";
export const RESTART = "hermes gateway restart";

// Install, pair, restart: one paste (PairingStep.command, YUI-229). Each step is safe to run twice.
export const pairCommand = (code) => `${INSTALL} && hermes yui pair ${code} && ${RESTART}`;

// 123456 reads as 123 456.
export const spacedCode = (code) => (String(code).length === 6 ? `${String(code).slice(0, 3)} ${String(code).slice(3)}` : String(code));

// The one step left for an agent that is paired but not listening: start its profile's gateway.
export function restartCommand(agent) {
  const ref = agent?.remote_ref;
  return !ref || ref === "default" ? RESTART : `hermes -p ${ref} gateway restart`;
}

// GatewayWait: listening the moment presence says anything but not_listening, "still nothing" after a minute.
export const GATEWAY_GIVE_UP_MS = 60000;
export const GATEWAY_POLL_MS = 2000;
// Waiting this long for the computer means a step was missed: show the fix.
export const PAIR_STUCK_MS = 150000;

export function gatewayPhase(agent, waitedMs, giveUp = GATEWAY_GIVE_UP_MS) {
  if (liveness(agent) !== "not_listening") return "listening";
  return waitedMs >= giveUp ? "gave_up" : "waiting";
}

// The host claimed the code (the agent left `pending`), and a gateway reads its thread.
export const isPaired = (agent) => !!agent && agent.status !== "pending";
export const isConnected = (agent) => isPaired(agent) && liveness(agent) !== "not_listening";

// Seconds left on a pairing code, from its `expires_at`.
export const secondsLeft = (expiresAt, now = Date.now()) => Math.max(0, Math.round((Date.parse(expiresAt) - now) / 1000));
export const clock = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

// ---------------------------------------------------------------- the list

// "Online", "Offline, seen 5 min ago", "Waiting to connect" (StatusLine): straight from the heartbeat.
export function seenAgo(iso, now = Date.now()) {
  const t = Date.parse(iso || "");
  if (!t) return "";
  const s = Math.max(0, Math.round((now - t) / 1000));
  if (s < 60) return "just now";
  if (s < 3600) return `${Math.floor(s / 60)} min ago`;
  if (s < 86400) return `${Math.floor(s / 3600)} h ago`;
  return `${Math.floor(s / 86400)} d ago`;
}

export function statusLine(agent, now = Date.now()) {
  const seen = agent?.last_seen_at ? `, seen ${seenAgo(agent.last_seen_at, now)}` : "";
  switch (liveness(agent)) {
    case "online": return "Online";
    case "pending": return "Waiting to connect";
    case "asleep": return `Asleep${seen}`;
    case "offline": return `Offline${seen}`;
    case "not_listening": return "Not listening yet";
    case "paused": return "Paused by its owner";
    default: return "Offline";
  }
}

export const isShared = (a) => !!a?.shared;
export const isMuted = (a) => !!a?.push_muted;
export const isYui = (a) => a?.avatar === "yui";
export const sortAgents = (list) => [...(list || [])].sort((a, b) => (a.sort ?? 0) - (b.sort ?? 0));

// Who shared agents with this person: "Sam", "Sam and Maya", nothing when none (AgentStore.sharers).
export function sharers(agents) {
  const names = [];
  for (const a of agents || []) if (isShared(a) && a.shared_by && !names.includes(a.shared_by)) names.push(a.shared_by);
  if (!names.length) return null;
  return names.length === 1 ? names[0] : `${names.slice(0, -1).join(", ")} and ${names[names.length - 1]}`;
}

// An invited account starts with what it was given: no Add agent.
export const onlyShared = (agents) => !!agents?.length && agents.every(isShared);

// The line over the list: "Who do you want to talk to?", or "Hi Maya. Sam set these up for you."
export function greeting(agents, firstName) {
  const by = sharers(agents);
  if (!by) return "Who do you want to talk to?";
  const n = agents.filter(isShared).length;
  return `${firstName ? `Hi ${firstName}. ` : ""}${by} set ${n === 1 ? "this" : "these"} up for you.`;
}

export function sharedFooter(agents) {
  const by = sharers(agents);
  if (!by) return null;
  const one = agents.filter(isShared).length === 1;
  return `${one ? "This agent runs" : "These agents run"} on ${by}'s computer, which keeps your conversations. Other people ${by} invites never see them.`;
}

export const unsharedLine = (name) => `${name} is no longer shared with you.`;

// A shared agent that is gone from the new list was revoked: the names to say so for, and whether the open
// thread was one of them (AgentStore.apply).
export function revoked(before, after, openId) {
  const gone = (before || []).filter((o) => isShared(o) && !(after || []).some((n) => n.id === o.id));
  return { names: gone.map((g) => g.name), closeOpen: gone.some((g) => g.id === openId) };
}

// One broken sandbox rule in plain words (AgentStore.plain).
const PLAIN = [
  ["no sandbox report", "its computer hasn't reported a sandbox yet"],
  ["its host has not", "its computer hasn't reported a sandbox yet"],
  ["profile:", "it shares a Hermes profile with your other agents"],
  ["keys:", "its profile holds keys beyond its model key"],
  ["terminal:", "it has a shell on your computer"],
  ["files:", "it can read your files"],
  ["reach:", "it can reach your other tools"],
  ["memory:", "its memory is shared between people"],
  ["runner:", "its model runs as an agent with a shell"],
];
export const plainRule = (rule) => PLAIN.find(([k]) => String(rule).startsWith(k))?.[1] || String(rule);

// "Safe to share" or "Not safe to share: it has a shell on your computer". Null for Yui, a shared agent and
// a server that does not say (EditAgentSheet.shareLine).
export function shareLine(agent) {
  if (!agent || isYui(agent) || isShared(agent) || !Array.isArray(agent.share_why)) return null;
  const safe = !!agent.client_safe;
  return { safe, text: safe ? "Safe to share" : `Not safe to share: ${agent.share_why[0] ? plainRule(agent.share_why[0]) : "its computer hasn't said"}` };
}

// "full screen, stacked buttons": the agent's style profile in words (EditAgentSheet.prefs).
export function stylePrefs(style) {
  if (!style || typeof style !== "object") return null;
  const words = [];
  if (style.screen) words.push(style.screen === "full" ? "full screen" : "chat screens");
  if (style.buttons) words.push(style.buttons === "stack" ? "stacked buttons" : "buttons in a row");
  if (style.gallery) words.push(`${style.gallery} galleries`);
  if (style.chart) words.push(`${style.chart} charts`);
  return words.length ? words.join(", ") : null;
}

// ---------------------------------------------------------------- the words around a change

export const NAME_MAX = 40;
export const cleanName = (raw) => String(raw ?? "").replace(/\s+/g, " ").trim().slice(0, NAME_MAX);

export function removeWords(agent) {
  return {
    title: `Remove ${agent.name}?`,
    note: `This deletes your whole conversation with ${agent.name}. The agent itself keeps running on your computer.`,
    confirm: `Remove ${agent.name}`,
  };
}

// What yui-agents refuses with, in plain words.
const ERRORS = {
  unauthorized: "Your session ended. Sign in again.",
  forbidden: "That needs the Yui app.",
  invalid_request: "That did not look right. Check it and try again.",
  not_found: "Yui couldn't find that agent.",
  rate_limited: "Too many tries. Give it a minute.",
  account_suspended: "This account is paused.",
  invalid_name: "Give it a name first.",
  already_added: "That one is already in your list.",
  nothing_to_update: "Nothing changed.",
};
export function agentError(code, fallback = "Couldn't do that just now. Check your connection and try again.") {
  return ERRORS[code] || fallback;
}

// ---------------------------------------------------------------- the client

// call(fn, body) -> parsed JSON. Errors carry `.code` (the function's `{error}` or `network`).
export function createAgentsClient(call) {
  const run = (body) => call("yui-agents", body);
  return {
    list: () => run({ action: "list", crew_pick: true }),
    // A new agent and its pairing code: { agent, pairing: { code, expires_at } }.
    create: ({ name, color = "mint" }) => run({ action: "create", name, color, pair: true }),
    pairCode: (agentId) => run({ action: "pair_code", agent_id: agentId }),
    update: (id, fields) => run({ action: "update", id, ...fields }),
    rename: (id, name) => run({ action: "update", id, name }),
    setLook: (id, preset, style = null) => run({ action: "update", id, theme: { ...(style ? { style } : {}), ...(preset ? { preset } : {}), at: new Date().toISOString(), by: "user" } }),
    mute: (id, muted) => run({ action: "update", id, push_muted: !!muted }),
    makeDefault: (id) => run({ action: "update", id, is_default: true }),
    remove: (id) => run({ action: "delete", id }),
    reorder: (ids) => run({ action: "reorder", ids }),
    crewAdd: (base) => run({ action: "crew_add", base }),
    crewAddAll: () => run({ action: "crew_add_all" }),
    crewChoose: (bases, own = false) => run({ action: "crew_choose", bases, own }),
  };
}

// The crew still to add: a starter is "here" while its agent is in the list (CrewPicker).
export function crewHere(starter, agents) {
  return !!starter.agent_id && (agents || []).some((a) => a.id === starter.agent_id);
}
export const crewMissing = (crew, agents) => (crew || []).filter((s) => !crewHere(s, agents));

// A new list in place of the old, with the move of one agent applied (AgentStore.move) and sort rewritten.
export function moved(list, from, to) {
  const next = [...list];
  const [x] = next.splice(from, 1);
  next.splice(Math.max(0, Math.min(next.length, to)), 0, x);
  return next.map((a, i) => ({ ...a, sort: i }));
}
