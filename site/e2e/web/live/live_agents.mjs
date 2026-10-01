// YUI-245 live round trip, the JS half: the web client's own relay, agents and chats code talking to a real
// account over the same REST and edge functions the browser uses. Run by web_agents_live.py, which makes the
// throwaway account, plays the host (pairs the code, starts the gateway) and judges the result.
//   YUI_TOKEN (a yui_user JWT), YUI_USER, STEP (a | b | c), YUI_AGENT (steps b and c) in the environment.
import { createRelay } from "../../../lib/web/relay.mjs";
import { isConnected, isPaired, sortAgents } from "../../../lib/web/agents.mjs";
import { chatErrorOf } from "../../../lib/web/chats.mjs";

const { YUI_TOKEN: token, YUI_USER: user, STEP: step, YUI_AGENT: agent } = process.env;
const relay = createRelay({ token: async () => token, WebSocket: null });
const out = {};
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const code = async (fn) => { try { await fn(); return "ok"; } catch (e) { return e.code || e.message; } };

if (step === "a") {
  const first = await relay.agents();
  out.start = { agents: first.agents.length, hasCrew: Array.isArray(first.crew) };
  out.badName = await code(() => relay.manage.create({ name: "   " }));
  const made = await relay.manage.create({ name: "  Nova  ", color: "mint" });
  out.created = { name: made.agent.name, handle: made.agent.handle, status: made.agent.status, code: made.pairing.code, expires: made.pairing.expires_at, id: made.agent.id };
  out.listed = (await relay.agents()).agents.map((a) => ({ id: a.id, status: a.status, presence: a.presence }));
  out.notFound = await code(() => relay.manage.pairCode("00000000-0000-4000-8000-000000000000"));
  const again = await relay.manage.pairCode(made.agent.id);
  out.newCode = { code: again.code, changed: again.code !== made.pairing.code };
}

if (step === "b") {
  const a = (await relay.agents()).agents.find((x) => x.id === agent);
  out.paired = { paired: isPaired(a), connected: isConnected(a), presence: a.presence, connector: a.connector_name, ref: a.remote_ref };
}

if (step === "c") {
  const a = (await relay.agents()).agents.find((x) => x.id === agent);
  out.online = { connected: isConnected(a), presence: a.presence };
  await relay.manage.rename(agent, "Nova Prime");
  await relay.manage.setLook(agent, "grape");
  await relay.manage.mute(agent, true);
  let b = (await relay.agents()).agents.find((x) => x.id === agent);
  out.edited = { name: b.name, preset: b.theme?.preset, by: b.theme?.by, muted: b.push_muted };
  out.badRename = await code(() => relay.manage.rename(agent, "  "));
  await relay.manage.reorder([agent]);
  out.order = sortAgents((await relay.agents()).agents).map((x) => x.id === agent);

  // chats: the first one is there, a second needs the account's phone to be new enough (the script gave it one)
  const list0 = await relay.chats.list(agent);
  out.chats0 = { n: list0.length, first: list0[0]?.is_first ?? null };
  const c2 = crypto.randomUUID();
  out.insert = await code(() => relay.chats.insert({ id: c2, userId: user, agentId: agent }));
  out.insertTwice = await code(() => relay.chats.insert({ id: c2, userId: user, agentId: agent }));
  await relay.post({ id: crypto.randomUUID(), userId: user, agentId: agent, chatId: c2, body: "hello from the web" });
  await relay.chats.rename(c2, "Web chat");
  await relay.chats.seen(c2, new Date().toISOString());
  const list1 = await relay.chats.list(agent);
  const mine = list1.find((c) => c.id === c2);
  out.chat2 = { title: mine?.title, last: mine?.last_body, sender: mine?.last_sender, n: list1.length };
  const rows = await relay.fetchRows({ agentId: agent, chatId: c2 });
  out.rows = rows.map((r) => r.body);
  await relay.chats.clear(c2);
  out.cleared = (await relay.fetchRows({ agentId: agent, chatId: c2 })).length;
  await relay.chats.remove(c2);
  out.afterDelete = (await relay.chats.list(agent)).length;
  const only = (await relay.chats.list(agent))[0];
  try { await relay.chats.remove(only.id); out.lastChat = "ok"; } catch (e) { out.lastChat = chatErrorOf(e).kind; }

  // controls ride the same table: the request goes in, nobody answers (no host is listening), the answer is empty
  await relay.post({ id: crypto.randomUUID(), userId: user, agentId: agent, body: "controls: list soul", kind: "control", meta: { v: 1, req: "c-live1", op: "list", section: "soul" } });
  out.control = await relay.controlAnswer({ agentId: agent, req: "c-live1" });
  // the drawer's menu read
  out.menuRows = (await relay.menuRows(agent)).length;

  // an MCP client's request that does not exist (the web's connect approval asks yui-oauth with the session)
  out.oauthMissing = await code(() => relay.call("yui-oauth", { action: "app_request", id: "00000000-0000-4000-8000-000000000000" }));
  out.removed = await relay.manage.remove(agent);
  await sleep(200);
  out.after = (await relay.agents()).agents.length;
}
console.log(`RESULT ${JSON.stringify(out)}`);
process.exit(0);
