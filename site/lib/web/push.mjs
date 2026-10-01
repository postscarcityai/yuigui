// Notifications on the web (YUI-248, Push/Push.swift): Web Push through yui-push in place of APNs. The browser makes
// a subscription (an endpoint on its own push service plus two keys), yui-push stores it next to the phones' tokens
// (`register_web`) and sends a reply to every device, the phone and this browser. The service worker
// (public/web/sw.js) shows it and opens the thread on a click. Pure decisions here, the browser bits come in as
// arguments, so node tests drive all of it.

// The public half of yui-push's VAPID key (secret YUI_VAPID_PUBLIC). It identifies the sender, it is not a credential.
export const VAPID_PUBLIC = "BDh45d7MbvpG8in-s7EuG86UH-XdvTgfe8WNozMSx0YzQ8SMM5nvx_QD80U0_dS45NRzjNZ2iVtPo3tfANUAeZk";
export const SW_URL = "/web/sw.js";
export const SW_SCOPE = "/web/";
export const WANT_KEY = "yui-web-push";
// The app tells yui-push once a minute while a thread is open (PRESENCE_MS there is 90 s).
export const PRESENCE_EVERY = 60000;

export function urlBase64ToBytes(s) {
  const pad = "=".repeat((4 - (s.length % 4)) % 4);
  const raw = atob((s + pad).replace(/-/g, "+").replace(/_/g, "/"));
  return Uint8Array.from(raw, (c) => c.charCodeAt(0));
}

// What this browser can do. iPhone Safari only takes Web Push for a page added to the Home Screen.
export function support({ hasSW, hasPush, hasNotification, ua = "", standalone = false } = {}) {
  const ios = /iPhone|iPad|iPod/.test(ua) || (/Macintosh/.test(ua) && /Mobile/.test(ua));
  if (hasSW && hasPush && hasNotification) return { ok: true, ios, standalone };
  if (ios && !standalone) return { ok: false, install: true, ios, standalone };
  return { ok: false, install: false, ios, standalone };
}

// The one word the settings row and its words come from.
//   unsupported  this browser cannot (no Web Push)
//   install      iPhone Safari: add Yui to the Home Screen first
//   blocked      the person said no in the browser; only the browser's settings can change it
//   off          can, has not, or turned it off here
//   on           subscribed and the server knows
export function pushState({ support: s, permission, subscribed, want }) {
  if (!s?.ok) return s?.install ? "install" : "unsupported";
  if (permission === "denied") return "blocked";
  // `want`: the person turned it on here. Permission granted for reminders alone does not subscribe the browser.
  if (permission === "granted" && subscribed && want === true) return "on";
  return "off";
}

export const PUSH_WORDS = {
  unsupported: { title: "Notifications", sub: "This browser can't show them. The iPhone app and Chrome, Edge, Firefox and Safari 16.4 and up can." },
  install: { title: "Notifications", sub: "On iPhone, add Yui to your Home Screen first (Share, then Add to Home Screen). Then open it from there and turn this on." },
  blocked: { title: "Notifications are blocked", sub: "Your browser says no for this site. Allow notifications for www.yuigui.com in its settings, then come back." },
  off: { title: "Notifications on this browser", sub: "A reply shows up even with the tab closed. A tap opens that thread. Mute one agent in its own settings." },
  on: { title: "Notifications on this browser", sub: "A reply shows up even with the tab closed. A tap opens that thread. Mute one agent in its own settings." },
};

export function deviceName(ua = "") {
  const browser = /Edg\//.test(ua) ? "Edge" : /Firefox\//.test(ua) ? "Firefox" : /Chrome\//.test(ua) ? "Chrome" : /Safari\//.test(ua) ? "Safari" : "Browser";
  const os = /iPhone/.test(ua) ? "iPhone" : /iPad/.test(ua) ? "iPad" : /Android/.test(ua) ? "Android" : /Mac OS X/.test(ua) ? "Mac" : /Windows/.test(ua) ? "Windows" : /Linux/.test(ua) ? "Linux" : "";
  return os ? `${browser} on ${os}` : browser;
}

// The body register_web takes, from a PushSubscription (or its toJSON).
export function registration(sub, name) {
  const j = typeof sub?.toJSON === "function" ? sub.toJSON() : sub;
  if (!j?.endpoint || !j.keys?.p256dh || !j.keys?.auth) return null;
  return { action: "register_web", endpoint: j.endpoint, keys: { p256dh: j.keys.p256dh, auth: j.keys.auth }, name };
}

// What a message from the service worker means to the page: an agent that left the list refreshes it at once
// (the app's silent push does the same). A reply needs nothing: the thread is already live.
export function onWorkerMessage(data) {
  return { refreshList: data?.yui === "push" && data.kind === "revoked" };
}

// The client. `call(fn, body)` is the signed-in call (auth.call); `env` carries the browser's own objects.
export function createPush({ call, env }) {
  const store = env.storage;
  const wanted = () => { try { return store?.getItem(WANT_KEY) === "1"; } catch { return false; } };
  const want = (v) => { try { store?.setItem(WANT_KEY, v ? "1" : "0"); } catch { /* private mode */ } };
  const sup = () => support({ hasSW: !!env.serviceWorker, hasPush: !!env.hasPush, hasNotification: !!env.Notification, ua: env.ua, standalone: env.standalone });
  let registration_ = null;
  let sub = null;

  const worker = async () => {
    if (registration_) return registration_;
    registration_ = await env.serviceWorker.register(SW_URL, { scope: SW_SCOPE });
    await env.serviceWorker.ready;
    return registration_;
  };
  const existing = async () => {
    if (!env.serviceWorker) return null;
    const reg = await (env.serviceWorker.getRegistration?.(SW_SCOPE) ?? null);
    if (!reg) return null;
    registration_ = reg;
    return (await reg.pushManager.getSubscription()) || null;
  };
  const tell = (s) => {
    const body = registration(s, deviceName(env.ua));
    return body ? call("yui-push", body) : Promise.reject(Object.assign(new Error("bad subscription"), { code: "invalid_keys" }));
  };

  return {
    support: sup,
    async state() {
      const s = sup();
      if (!s.ok) return pushState({ support: s });
      sub = await existing().catch(() => null);
      return pushState({ support: s, permission: env.Notification.permission, subscribed: !!sub, want: wanted() });
    },
    // The tap on the switch. Safari wants the permission asked from a tap, so this runs straight from one.
    async enable() {
      const s = sup();
      if (!s.ok) throw Object.assign(new Error("unsupported"), { code: s.install ? "install" : "unsupported" });
      const permission = env.Notification.permission === "granted" ? "granted" : await env.Notification.requestPermission();
      if (permission !== "granted") throw Object.assign(new Error("permission"), { code: permission === "denied" ? "blocked" : "dismissed" });
      const reg = await worker();
      sub = (await reg.pushManager.getSubscription()) || (await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: urlBase64ToBytes(VAPID_PUBLIC) }));
      await tell(sub);
      want(true);
      return "on";
    },
    // Switch it off here: the server forgets this browser and the browser drops the subscription.
    async disable() {
      sub = (await existing().catch(() => null)) || sub;
      want(false);
      if (sub) {
        await call("yui-push", { action: "unregister_web", endpoint: sub.endpoint }).catch(() => {});
        await sub.unsubscribe().catch(() => {});
        sub = null;
      }
      return "off";
    },
    // Every launch of /web: the worker is registered, so the page installs and a push has somewhere to land.
    async install() { return env.serviceWorker ? worker().then(() => true) : false; },
    // Each launch: the worker is current, and a subscription the browser rotated is told to the server again.
    async sync() {
      const s = sup();
      if (!s.ok || env.Notification.permission !== "granted" || !wanted()) return null;
      const reg = await worker();
      sub = (await reg.pushManager.getSubscription()) || (await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: urlBase64ToBytes(VAPID_PUBLIC) }));
      await tell(sub);
      return sub.endpoint;
    },
    // Sign out: this browser stops getting this person's replies. The browser's permission stays.
    async forget() {
      sub = (await existing().catch(() => null)) || sub;
      if (sub) await call("yui-push", { action: "unregister_web", endpoint: sub.endpoint }).catch(() => {});
    },
    endpoint: () => sub?.endpoint || null,
    // The thread is in front of the person (active) or went away: one call a minute while it is.
    async presence(agentId, active) {
      const endpoint = sub?.endpoint || (await existing().catch(() => null))?.endpoint;
      if (!endpoint) return false;
      await call("yui-push", { action: "presence", endpoint, active: !!active, ...(active && agentId ? { agent_id: agentId } : {}) });
      return true;
    },
    // Reading a thread clears its notification and the badge on this browser.
    async clear(agentId) {
      const reg = registration_ || (env.serviceWorker ? await (env.serviceWorker.getRegistration?.(SW_SCOPE) ?? null) : null);
      if (!reg) return;
      for (const n of await reg.getNotifications({ tag: agentId })) n.close();
      const left = (await reg.getNotifications()).length;
      try { if (left) await env.navigator?.setAppBadge?.(left); else await env.navigator?.clearAppBadge?.(); } catch { /* no badge here */ }
    },
  };
}
