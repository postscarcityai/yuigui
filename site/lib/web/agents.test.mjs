// node --test lib/web/agents.test.mjs
import test from "node:test";
import assert from "node:assert/strict";
import {
  INSTALL, RESTART, agentError, clock, cleanName, controlSections, createAgentsClient, crewMissing, gatewayPhase, greeting,
  isConnected, isPaired, moved, onlyShared, pairCommand, plainRule, removeWords, restartCommand, openAgent, revoked, secondsLeft,
  seenAgo, shareLine, sharedFooter, sharers, spacedCode, statusLine, stylePrefs, unsharedLine,
} from "./agents.mjs";

test("the pairing command is the one paste the app shows (install, pair, restart)", () => {
  assert.equal(pairCommand("482913"), `${INSTALL} && hermes yui pair 482913 && ${RESTART}`);
  assert.equal(spacedCode("482913"), "482 913");
  assert.equal(spacedCode("12"), "12");
  assert.equal(clock(125), "2:05");
  assert.equal(secondsLeft("2026-01-01T00:10:00Z", Date.parse("2026-01-01T00:00:00Z")), 600);
  assert.equal(secondsLeft("2026-01-01T00:00:00Z", Date.parse("2026-01-01T00:05:00Z")), 0);
});

test("the restart command names the profile", () => {
  assert.equal(restartCommand({}), "hermes gateway restart");
  assert.equal(restartCommand({ remote_ref: "default" }), "hermes gateway restart");
  assert.equal(restartCommand({ remote_ref: "penny" }), "hermes -p penny gateway restart");
});

test("the gateway wait: listening at once, an honest still nothing after a minute", () => {
  const quiet = { status: "connected", presence: "not_listening" };
  assert.equal(gatewayPhase({ presence: "online" }, 0), "listening");
  assert.equal(gatewayPhase(quiet, 10_000), "waiting");
  assert.equal(gatewayPhase(quiet, 60_000), "gave_up");
  assert.equal(gatewayPhase(quiet, 3_000, 3_000), "gave_up");
  assert.equal(isPaired({ status: "pending" }), false);
  assert.equal(isPaired(quiet), true);
  assert.equal(isConnected(quiet), false);
  assert.equal(isConnected({ status: "connected", presence: "online" }), true);
  assert.equal(isConnected({ status: "pending", presence: "online" }), false);
});

test("status words come from the heartbeat, never guessed", () => {
  const now = Date.parse("2026-10-01T12:10:00Z");
  assert.equal(statusLine({ presence: "online" }), "Online");
  assert.equal(statusLine({ presence: "pending" }), "Waiting to connect");
  assert.equal(statusLine({ presence: "asleep", last_seen_at: "2026-10-01T12:05:00Z" }, now), "Asleep, seen 5 min ago");
  assert.equal(statusLine({ presence: "offline" }, now), "Offline");
  assert.equal(statusLine({ presence: "not_listening" }), "Not listening yet");
  assert.equal(statusLine({ presence: "paused" }), "Paused by its owner");
  assert.equal(seenAgo("2026-10-01T12:09:50Z", now), "just now");
  assert.equal(seenAgo("2026-09-29T12:10:00Z", now), "2 d ago");
});

test("shared agents: who shared them, the greeting, the footer, the closed account", () => {
  const mine = { id: "a", name: "Penny" };
  const s1 = { id: "b", name: "Basil", shared: true, shared_by: "Sam" };
  const s2 = { id: "c", name: "Quill", shared: true, shared_by: "Sam" };
  assert.equal(sharers([mine]), null);
  assert.equal(sharers([s1, s2]), "Sam");
  assert.equal(sharers([s1, { ...s2, shared_by: "Maya" }]), "Sam and Maya");
  assert.equal(greeting([mine], null), "Who do you want to talk to?");
  assert.equal(greeting([s1, s2], "Maya"), "Hi Maya. Sam set these up for you.");
  assert.equal(greeting([s1], null), "Sam set this up for you.");
  assert.match(sharedFooter([s1]), /^This agent runs on Sam's computer/);
  assert.match(sharedFooter([s1, s2]), /^These agents run on Sam's computer/);
  assert.equal(sharedFooter([mine]), null);
  assert.equal(onlyShared([s1, s2]), true);
  assert.equal(onlyShared([s1, mine]), false);
  assert.equal(onlyShared([]), false);
  assert.equal(unsharedLine("Basil"), "Basil is no longer shared with you.");
});

test("a revoked share: the names, and whether the open thread closes", () => {
  const before = [{ id: "a", name: "Penny" }, { id: "b", name: "Basil", shared: true }, { id: "c", name: "Quill", shared: true }];
  const after = [{ id: "a", name: "Penny" }, { id: "c", name: "Quill", shared: true }];
  assert.deepEqual(revoked(before, after, "b"), { names: ["Basil"], closeOpen: true });
  assert.deepEqual(revoked(before, after, "a"), { names: ["Basil"], closeOpen: false });
  assert.deepEqual(revoked(null, after, "a"), { names: [], closeOpen: false });
  // an agent of the person's own that vanishes is a remove, not a revoke
  assert.deepEqual(revoked([{ id: "a", name: "Penny" }], [], "a"), { names: [], closeOpen: false });
});

test("safe to share, in the owner's words", () => {
  assert.equal(shareLine({ avatar: "yui", share_why: [] }), null);
  assert.equal(shareLine({ shared: true, share_why: [] }), null);
  assert.equal(shareLine({}), null);
  assert.deepEqual(shareLine({ client_safe: true, share_why: [] }), { safe: true, text: "Safe to share" });
  assert.equal(shareLine({ client_safe: false, share_why: ["terminal: local shell"] }).text, "Not safe to share: it has a shell on your computer");
  assert.equal(shareLine({ client_safe: false, share_why: [] }).text, "Not safe to share: its computer hasn't said");
  assert.equal(plainRule("no sandbox report yet"), "its computer hasn't reported a sandbox yet");
  assert.equal(plainRule("weird"), "weird");
});

test("style prefs read as words", () => {
  assert.equal(stylePrefs({ screen: "full", buttons: "stack" }), "full screen, stacked buttons");
  assert.equal(stylePrefs({ screen: "chat", buttons: "row", gallery: "grid", chart: "bar" }), "chat screens, buttons in a row, grid galleries, bar charts");
  assert.equal(stylePrefs({}), null);
  assert.equal(stylePrefs(null), null);
});

test("names are trimmed and capped; the remove confirm is the app's", () => {
  assert.equal(cleanName("  Nova   the   Great "), "Nova the Great");
  assert.equal(cleanName("x".repeat(80)).length, 40);
  assert.equal(cleanName(null), "");
  const w = removeWords({ name: "Penny" });
  assert.equal(w.title, "Remove Penny?");
  assert.equal(w.confirm, "Remove Penny");
  assert.equal(w.note, "This deletes your whole conversation with Penny. The agent itself keeps running on your computer.");
  assert.equal(agentError("invalid_name"), "Give it a name first.");
  assert.match(agentError("weird"), /Check your connection/);
});

test("the crew: a starter is here while its agent is in the list", () => {
  const crew = [{ base: "yui", agent_id: "1" }, { base: "arnold", agent_id: null }, { base: "basil", agent_id: "gone" }];
  assert.deepEqual(crewMissing(crew, [{ id: "1" }]).map((c) => c.base), ["arnold", "basil"]);
});

test("moving an agent rewrites the order", () => {
  const list = [{ id: "a", sort: 0 }, { id: "b", sort: 1 }, { id: "c", sort: 2 }];
  assert.deepEqual(moved(list, 0, 1).map((a) => [a.id, a.sort]), [["b", 0], ["a", 1], ["c", 2]]);
  assert.deepEqual(moved(list, 2, 0).map((a) => a.id), ["c", "a", "b"]);
  assert.deepEqual(moved(list, 2, 9).map((a) => a.id), ["a", "b", "c"]);
});

test("controls rows: what the host reports, in the drawer's order, never for a shared agent", () => {
  const agent = { name: "Scout", controls: { v: 1, sections: { memory: "rwd", soul: "rw", model: "r" } } };
  assert.deepEqual(controlSections(agent).map((s) => s.id), ["soul", "memory", "model"]);
  assert.equal(controlSections(agent)[0].sub("Scout"), "Who Scout is and how it talks");
  assert.deepEqual(controlSections({ ...agent, shared: true }), []);
  assert.deepEqual(controlSections({ name: "x" }), []);
});

test("the client sends the same bodies the app does", async () => {
  const sent = [];
  const api = createAgentsClient(async (fn, body) => { sent.push([fn, body]); return { ok: true }; });
  await api.list(); await api.create({ name: "Nova" }); await api.pairCode("a1"); await api.rename("a1", "Zed"); await api.mute("a1", true);
  await api.makeDefault("a1"); await api.remove("a1"); await api.reorder(["b", "a"]); await api.crewAdd("arnold"); await api.crewAddAll(); await api.crewChoose(["x"], true);
  await api.setLook("a1", "candy", { screen: "full" });
  assert.deepEqual(sent.slice(0, 11), [
    ["yui-agents", { action: "list", crew_pick: true }],
    ["yui-agents", { action: "create", name: "Nova", color: "mint", pair: true }],
    ["yui-agents", { action: "pair_code", agent_id: "a1" }],
    ["yui-agents", { action: "update", id: "a1", name: "Zed" }],
    ["yui-agents", { action: "update", id: "a1", push_muted: true }],
    ["yui-agents", { action: "update", id: "a1", is_default: true }],
    ["yui-agents", { action: "delete", id: "a1" }],
    ["yui-agents", { action: "reorder", ids: ["b", "a"] }],
    ["yui-agents", { action: "crew_add", base: "arnold" }],
    ["yui-agents", { action: "crew_add_all" }],
    ["yui-agents", { action: "crew_choose", bases: ["x"], own: true }],
  ]);
  const look = sent[11][1];
  assert.equal(look.action, "update");
  assert.equal(look.theme.preset, "candy");
  assert.deepEqual(look.theme.style, { screen: "full" });
  assert.equal(look.theme.by, "user");
  assert.match(look.theme.at, /^\d{4}-\d\d-\d\dT/);
});

test("a page opens on the named agent, else the default, else the first; a gone one is skipped (YUI-281)", () => {
  const list = [{ id: "a", is_default: true }, { id: "b" }, { id: "c" }];
  assert.equal(openAgent(list, "c").id, "c", "the kept last-open agent");
  assert.equal(openAgent(list, "gone").id, "a", "an agent that left the list falls back to the default");
  assert.equal(openAgent(list, null).id, "a", "nothing kept: today's path");
  assert.equal(openAgent([{ id: "x" }, { id: "y" }], "gone").id, "x", "no default: the first");
  assert.equal(openAgent(null, "a"), null, "no list yet");
  assert.equal(openAgent([], "a"), null);
});
