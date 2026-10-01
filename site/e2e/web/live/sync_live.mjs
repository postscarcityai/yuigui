// YUI-249 live round trip, the JS half (run by web_sync_live.py): two devices' key syncs over the real REST.
import { createRelay } from "../../../lib/web/relay.mjs";
import { createKeySync } from "../../../lib/web/state.mjs";

const { YUI_TOKEN: token, YUI_USER: user, YUI_AGENT: agent } = process.env;
const relay = createRelay({ token: async () => token, WebSocket: null });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
function device(name) {
  const d = { text: "", at: 0 };
  const sync = createKeySync({ client: relay.state, userId: user, agentId: agent, key: "draft", device: name, read: () => d.text, write: (v) => { d.text = v; }, at: () => d.at, poll: 1e9, delay: 50, visible: () => true, onError: (e) => console.error("ERR", e.status, e.detail || e.message) });
  sync.start();
  return { d, sync, type: async (v) => { d.text = v; d.at = Date.now(); sync.changed(); await sleep(400); } };
}
const web = device("web-a"), phone = device("iphone");
await web.sync.pull(); await phone.sync.pull();
await phone.type("milk, eggs and the good bread");
await web.sync.pull(); await sleep(100);
const reached = web.d.text;
await web.type("");            // sent on the web
await phone.sync.pull(); await sleep(100);
const cleared = phone.d.text;
const rows = await relay.state.list(agent);
const draft = rows.find((r) => r.key === "draft");
await web.type("sk-abcdefghijklmnopqrstuvwxyz0123");
const keyRow = (await relay.state.list(agent)).find((r) => r.key === "draft")?.value ?? null;
web.sync.stop(); phone.sync.stop();
console.log(JSON.stringify({ reached, cleared, stamped: !!draft && Math.abs(Date.parse(draft.updated_at) - Date.now()) < 120000, keyRow }));
