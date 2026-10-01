// What the thread says about an agent that is not simply online (spec/RELAY.md "Honest status", the
// app's Agents/AgentStore.swift `Liveness` and ChatView). Pure so the page and the tests share it.
const LABEL = {
  online: "Online",
  asleep: "Asleep",
  offline: "Offline",
  pending: "Waiting to connect",
  not_listening: "Not listening yet",
  paused: "Paused by its owner",
};

// The agent's presence word: `yui_agent_list.presence`, else the older per-computer `status`.
export function liveness(agent) {
  const p = agent?.presence;
  if (p && LABEL[p]) return p;
  return { connected: "online", pending: "pending", offline: "offline" }[agent?.status] || "offline";
}

export const presenceLabel = (agent) => LABEL[liveness(agent)];

// The one line after a send when the agent cannot answer right now. Null when it is online.
export function waitingNote(agent) {
  const name = agent?.name || "Your agent";
  switch (liveness(agent)) {
    case "asleep": return `${name} is asleep. It gets this when its computer wakes.`;
    case "offline": return `${name} is offline. It gets this when it's back.`;
    case "pending": return `${name} isn't connected yet. It gets this once it is.`;
    case "not_listening": return `${name} isn't listening yet. This waits and goes the moment its gateway starts.`;
    case "paused": return `${name} is paused by its owner.`;
    default: return null;
  }
}

// The working row's words: what the host says it is doing, with its step, else the plain word.
export function workingLine(doing, agent) {
  const name = agent?.name || "Yui";
  const words = doing?.text || `${name} is working`;
  return doing?.step != null ? `${words} (${doing.step} of ${doing.of})` : words;
}
