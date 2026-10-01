import test from "node:test";
import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { createPush, deviceName, onWorkerMessage, pushState, registration, support, urlBase64ToBytes, VAPID_PUBLIC, WANT_KEY } from "./push.mjs";

const require = createRequire(import.meta.url);
const sw = require("../../public/web/sw.js");

const mem = () => { const m = new Map(); return { getItem: (k) => m.get(k) ?? null, setItem: (k, v) => m.set(k, v) }; };
const AGENT = "11111111-1111-4111-8111-111111111111";

test("the VAPID key is a 65 byte P-256 point", () => {
  const b = urlBase64ToBytes(VAPID_PUBLIC);
  assert.equal(b.length, 65);
  assert.equal(b[0], 4);
});

test("support: iPhone Safari in a tab asks for the Home Screen first", () => {
  const iphone = "Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 Safari/604.1";
  assert.deepEqual(support({ ua: iphone, standalone: false, hasSW: true }), { ok: false, install: true, ios: true, standalone: false });
  assert.equal(support({ ua: iphone, standalone: true, hasSW: true, hasPush: true, hasNotification: true }).ok, true);
  assert.equal(support({ ua: "Firefox", hasSW: false }).install, false);
});

test("pushState says one word", () => {
  const ok = { ok: true };
  assert.equal(pushState({ support: { ok: false, install: true } }), "install");
  assert.equal(pushState({ support: { ok: false, install: false } }), "unsupported");
  assert.equal(pushState({ support: ok, permission: "denied" }), "blocked");
  assert.equal(pushState({ support: ok, permission: "default" }), "off");
  assert.equal(pushState({ support: ok, permission: "granted", subscribed: false }), "off");
  assert.equal(pushState({ support: ok, permission: "granted", subscribed: true, want: false }), "off");
  assert.equal(pushState({ support: ok, permission: "granted", subscribed: true }), "off", "granted for reminders alone is not on");
  assert.equal(pushState({ support: ok, permission: "granted", subscribed: true, want: true }), "on");
});

test("deviceName and registration", () => {
  assert.equal(deviceName("Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Chrome/130 Safari/537"), "Chrome on Mac");
  assert.equal(registration({ endpoint: "https://x/y", keys: { p256dh: "a", auth: "b" } }, "n").keys.auth, "b");
  assert.equal(registration({ endpoint: "https://x/y" }, "n"), null);
});

test("worker messages: an agent that left refreshes the list, a reply needs nothing", () => {
  assert.deepEqual(onWorkerMessage({ yui: "push", kind: "revoked", agent_id: AGENT }), { refreshList: true });
  assert.deepEqual(onWorkerMessage({ yui: "push", kind: "reply", agent_id: AGENT }), { refreshList: false });
  assert.deepEqual(onWorkerMessage({ nope: 1 }), { refreshList: false });
});

function rig({ permission = "default", ask = "granted", ua = "Chrome/130 Safari/537 Mac OS X" } = {}) {
  const calls = []; const notes = []; const badge = [];
  let subscription = null;
  const pushManager = {
    getSubscription: async () => subscription,
    subscribe: async (o) => { assert.equal(o.userVisibleOnly, true); assert.equal(o.applicationServerKey.length, 65); subscription = { endpoint: "https://web.push.apple.com/abc", toJSON() { return { endpoint: this.endpoint, keys: { p256dh: "p256", auth: "auth" } }; }, unsubscribe: async () => { subscription = null; return true; } }; return subscription; },
  };
  const reg = { pushManager, getNotifications: async () => notes.slice(), };
  const Notification = { permission, requestPermission: async () => { Notification.permission = ask; return ask; } };
  const env = {
    storage: mem(), ua, hasPush: true, Notification,
    serviceWorker: { register: async (url, o) => { assert.equal(url, "/web/sw.js"); assert.equal(o.scope, "/web/"); return reg; }, ready: Promise.resolve(reg), getRegistration: async () => reg },
    navigator: { setAppBadge: async (n) => badge.push(n), clearAppBadge: async () => badge.push(0) },
  };
  const p = createPush({ call: async (fn, body) => { calls.push([fn, body]); return { ok: true }; }, env });
  return { p, calls, notes, badge, env, Notification };
}

test("turning it on asks once, subscribes with the key, tells yui-push", async () => {
  const r = rig();
  assert.equal(await r.p.state(), "off");
  assert.equal(await r.p.enable(), "on");
  assert.equal(r.calls.length, 1);
  assert.equal(r.calls[0][0], "yui-push");
  assert.deepEqual(r.calls[0][1], { action: "register_web", endpoint: "https://web.push.apple.com/abc", keys: { p256dh: "p256", auth: "auth" }, name: "Chrome on Mac" });
  assert.equal(await r.p.state(), "on");
});

test("a no in the permission prompt leaves it off and says why", async () => {
  const r = rig({ ask: "denied" });
  await assert.rejects(r.p.enable(), { code: "blocked" });
  assert.equal(r.calls.length, 0);
  assert.equal(await r.p.state(), "blocked");
  const d = rig({ ask: "default" });
  await assert.rejects(d.p.enable(), { code: "dismissed" });
});

test("turning it off tells the server and drops the subscription", async () => {
  const r = rig();
  await r.p.enable();
  assert.equal(await r.p.disable(), "off");
  assert.deepEqual(r.calls.at(-1), ["yui-push", { action: "unregister_web", endpoint: "https://web.push.apple.com/abc" }]);
  assert.equal(r.env.storage.getItem(WANT_KEY), "0");
  assert.equal(await r.p.state(), "off");
});

test("sync on launch registers again when allowed and wanted, never when not", async () => {
  const none = rig({ permission: "default" });
  assert.equal(await none.p.sync(), null);
  assert.equal(none.calls.length, 0);
  const r = rig({ permission: "granted" });
  assert.equal(await r.p.sync(), null, "permission alone (reminders asked for it) does not subscribe");
  r.env.storage.setItem(WANT_KEY, "1");
  assert.equal(await r.p.sync(), "https://web.push.apple.com/abc");
  assert.equal(r.calls[0][1].action, "register_web");
  r.env.storage.setItem(WANT_KEY, "0");
  assert.equal(await r.p.sync(), null);
});

test("sign out forgets this browser on the server", async () => {
  const r = rig({ permission: "granted" });
  await r.p.enable();
  await r.p.forget();
  assert.equal(r.calls.at(-1)[1].action, "unregister_web");
});

test("presence rides the endpoint and names the thread only while it is open", async () => {
  const r = rig({ permission: "granted" });
  await r.p.enable();
  await r.p.presence(AGENT, true);
  assert.deepEqual(r.calls.at(-1)[1], { action: "presence", endpoint: "https://web.push.apple.com/abc", active: true, agent_id: AGENT });
  await r.p.presence(AGENT, false);
  assert.deepEqual(r.calls.at(-1)[1], { action: "presence", endpoint: "https://web.push.apple.com/abc", active: false });
  assert.equal(await rig().p.presence(AGENT, true), false);
});

test("clear closes the agent's notification and fixes the badge", async () => {
  const r = rig({ permission: "granted" });
  await r.p.enable();
  const closed = [];
  r.notes.push({ tag: AGENT, close: () => closed.push(AGENT) });
  // getNotifications({tag}) in the rig returns every note; the real one filters. The badge shows what is left.
  await r.p.clear(AGENT);
  assert.deepEqual(closed, [AGENT]);
  assert.equal(r.badge.at(-1), 1);
});

// ---------------------------------------------------------------- the service worker's decisions

test("sw: a reply shows unless the thread is in front of the person", () => {
  const msg = { kind: "reply", title: "Penny", body: "Dinner at 7", agent_id: AGENT, tag: AGENT, url: `/web/agent/${AGENT}/chat/c1` };
  const n = sw.replyNotice(msg, []);
  assert.equal(n.title, "Penny");
  assert.equal(n.options.tag, AGENT);
  assert.equal(n.options.renotify, true);
  assert.equal(n.options.data.url, `/web/agent/${AGENT}/chat/c1`);
  assert.equal(sw.replyNotice(msg, [{ url: `https://www.yuigui.com/web/agent/${AGENT}`, visibilityState: "visible", focused: true }]), null);
  assert.ok(sw.replyNotice(msg, [{ url: `https://www.yuigui.com/web/agent/${AGENT}`, visibilityState: "hidden", focused: false }]));
  assert.ok(sw.replyNotice(msg, [{ url: "https://www.yuigui.com/web/agent/22222222-2222-4222-8222-222222222222", visibilityState: "visible", focused: true }]));
  assert.equal(sw.replyNotice({ kind: "clear", agent_id: AGENT }, []), null);
});

test("sw: a click only opens addresses inside /web", () => {
  assert.equal(sw.safeUrl(`/web/agent/${AGENT}`), `/web/agent/${AGENT}`);
  assert.equal(sw.safeUrl("/web"), "/web");
  assert.equal(sw.safeUrl("//evil.example/web"), "/web");
  assert.equal(sw.safeUrl("https://evil.example"), "/web");
  assert.equal(sw.safeUrl("/webby"), "/web");
  assert.equal(sw.safeUrl(null), "/web");
});

test("sw: a click takes over the window already on that agent, else any /web window, else none", () => {
  const a = { url: `https://www.yuigui.com/web/agent/${AGENT}` };
  const b = { url: "https://www.yuigui.com/web" };
  const c = { url: "https://www.yuigui.com/help" };
  assert.equal(sw.pickClient([b, a], `/web/agent/${AGENT}`), a);
  assert.equal(sw.pickClient([c, b], `/web/agent/${AGENT}`), b);
  assert.equal(sw.pickClient([c], `/web/agent/${AGENT}`), null);
});
