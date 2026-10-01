// YUI-244 live round trip, the JS half: the web client's own relay, thread and sync code talking to a real
// account and a real Yui platform adapter. Run by web_composer_live.py, which makes the throwaway account,
// pairs the scripted agent and judges the rows afterwards. Prints one JSON line of what the client saw.
//   YUI_TOKEN (a yui_user JWT), YUI_USER, YUI_AGENT in the environment.
import { createRelay } from "../../../lib/web/relay.mjs";
import { Thread } from "../../../lib/web/thread.mjs";
import { ThreadSync } from "../../../lib/web/sync.mjs";
import { createOutbox, memoryStore } from "../../../lib/web/outbox.mjs";
import { REACTIONS, replyQuote } from "../../../lib/web/compose.mjs";

const { YUI_TOKEN: token, YUI_USER: user, YUI_AGENT: agent } = process.env;
const relay = createRelay({ token: async () => token, WebSocket: null });
const thread = new Thread();
const outbox = createOutbox({ send: (item) => relay.deliver(item), store: memoryStore(), owner: user });
const sync = new ThreadSync({ relay, thread, userId: user, agentId: agent, outbox });
await sync.start();

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const until = async (fn, what, ms = 240000) => { const t = Date.now(); while (!fn()) { if (Date.now() - t > ms) throw new Error(`timed out: ${what}`); await sleep(250); } };
const answered = async (what) => { await sleep(600); await until(() => !thread.waiting, what); };
const out = { steps: [] };
const step = (name, v = {}) => out.steps.push({ name, ...v });

// 1. words
sync.send("Saturday workout?");
await answered("the proposal");
const proposal = thread.messages.find((m) => m.role === "agent" && m.text);
step("said", { proposal: proposal?.text });

// 2. a reaction: the badge at once, the agent answers it as a turn
sync.react(proposal.id, REACTIONS[0]);
const badge = thread.reactions.get(proposal.id.split("#")[0]);
await answered("the answer to the reaction");
step("reacted", { badge, msg: proposal.id.split("#")[0] });

// 3. a reply, quoting the proposal
const q = replyQuote(proposal);
sync.send("make it 9 am", { reply: q });
await answered("the answer to the reply");
step("replied", { quote: q.quote, msg: q.msg });

// 4. a photo: up to the private bucket first, then one row with its path
const jpeg = Buffer.from("/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAP//////////////////////////////////////////////////////////////////////////////////////wgALCAABAAEBAREA/8QAFBABAAAAAAAAAAAAAAAAAAAAAP/aAAgBAQABPxA=", "base64");
const blob = new Blob([jpeg], { type: "image/jpeg" });
sync.send("what is this?", { photos: [{ blob, type: "image/jpeg" }] });
await answered("the answer to the photo");
const mine = thread.messages.filter((m) => m.role === "user" && m.photos?.length).at(-1);
const url = await relay.sign(mine.photos[0]);
const back = Buffer.from(await (await fetch(url)).arrayBuffer());
step("photo", { path: mine.photos[0], signed: url.includes("/object/sign/yui-media/"), bytesBack: back.length, same: back.equals(jpeg) });

// 5. the outbox rule: the same row id twice is one row (a 409 counts as sent)
const id = "00000000-0000-4000-8000-0000000000aa";
await relay.post({ id, userId: user, agentId: agent, body: "dupe check" });
let second = "ok";
try { await relay.post({ id, userId: user, agentId: agent, body: "dupe check" }); } catch (e) { second = String(e.message); }
step("dupe", { second });

// 6. a reload: a fresh thread reads the same rows back, reaction and photo included
const fresh = new Thread();
fresh.load(await relay.fetchRows({ agentId: agent, limit: 100 }), { first: true });
step("reopened", {
  badge: fresh.reactions.get(proposal.id.split("#")[0]) || null,
  photos: fresh.messages.filter((m) => m.photos?.length).length,
  reply: fresh.messages.some((m) => m.replyTo?.quote === q.quote),
  texts: fresh.messages.filter((m) => m.role === "user").map((m) => m.text),
});
sync.stop();
console.log(`RESULT ${JSON.stringify(out)}`);
process.exit(0);
