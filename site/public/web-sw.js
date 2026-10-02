// Yui on the web: the service worker (YUI-248), served at /web-sw.js with scope /web. It does three things and nothing else: shows a reply that
// yui-push sent through Web Push, opens the agent's thread when the notification is clicked, and keeps the
// badge and the other notifications honest ("one reply, one buzz"). No caching: the page is always live.
// The messages are built by supabase/functions/yui-push/payload.ts (webPayload, webQuiet):
//   { kind: "reply", title, body, agent_id, message_id, chat?, tag, url }  show it
//   { kind: "clear", agent_id, tag }                                        that thread was read on another device
//   { kind: "revoked", agent_id, tag }                                      an agent left the list: the page refreshes it
// The decisions are plain functions below, so node tests drive them without a browser (lib/web/sw.test.mjs).

const ICON = "/web/icon-192.png";
const BADGE = "/web/badge-96.png";

// The thread a page is on, from its address: /web/agent/<id>[/chat/<chat>].
function agentOf(url) {
  const m = /\/web\/agent\/([0-9a-f-]{36})/i.exec(String(url || ""));
  return m ? m[1].toLowerCase() : null;
}

// A page that is in front of the person and on this agent's thread already shows the reply.
function watching(clients, agentId) {
  return clients.some((c) => c.visibilityState === "visible" && c.focused !== false && agentOf(c.url) === String(agentId).toLowerCase());
}

// The notification to show for a "reply" message, or null when a page already shows it.
function replyNotice(msg, clients) {
  if (!msg || msg.kind !== "reply" || !msg.agent_id) return null;
  if (watching(clients, msg.agent_id)) return null;
  return {
    title: String(msg.title || "Yui"),
    options: {
      body: String(msg.body || ""),
      tag: msg.tag || msg.agent_id,
      // A newer reply from the same agent replaces the older one and still buzzes.
      renotify: true,
      icon: ICON,
      badge: BADGE,
      data: { url: msg.url || `/web/agent/${msg.agent_id}`, agent_id: msg.agent_id, message_id: msg.message_id || null },
    },
  };
}

// Only our own thread addresses open; anything else (a forged message cannot reach here, but be sure) goes home.
function safeUrl(url) {
  return typeof url === "string" && /^\/web(\/|$)/.test(url) && !url.startsWith("//") ? url : "/web";
}

// The address a click opens: the thread, with the message the push names (YUI-262), so the page lands on that reply.
function clickUrl(url, messageId) {
  const safe = safeUrl(url);
  if (!messageId || !/^[0-9a-z-]{1,64}$/i.test(String(messageId))) return safe;
  const [path, query = ""] = safe.split("?");
  const params = new URLSearchParams(query);
  params.set("m", String(messageId));
  return `${path}?${params}`;
}

// A window of ours to take over for a click: one already on this agent first, else any /web window.
function pickClient(clients, url) {
  const agent = agentOf(url);
  return clients.find((c) => agent && agentOf(c.url) === agent) || clients.find((c) => /\/web(\/|$|\?)/.test(new URL(c.url).pathname)) || null;
}

if (typeof self !== "undefined" && typeof self.addEventListener === "function") {
  const windows = () => self.clients.matchAll({ type: "window", includeUncontrolled: true });
  const setBadge = async () => {
    const left = await self.registration.getNotifications();
    try { if (left.length) await self.navigator.setAppBadge?.(left.length); else await self.navigator.clearAppBadge?.(); } catch { /* no badge on this platform */ }
  };

  self.addEventListener("install", () => self.skipWaiting());
  self.addEventListener("activate", (e) => e.waitUntil(self.clients.claim()));

  self.addEventListener("push", (event) => {
    let msg = null;
    try { msg = event.data ? event.data.json() : null; } catch { msg = null; }
    event.waitUntil((async () => {
      const open = await windows();
      if (msg?.kind === "clear" || msg?.kind === "revoked") {
        // Close that agent's notification everywhere on this browser, tell the pages, fix the badge.
        for (const n of await self.registration.getNotifications({ tag: msg.tag || msg.agent_id })) n.close();
        for (const c of open) c.postMessage({ yui: "push", kind: msg.kind, agent_id: msg.agent_id });
        await setBadge();
        return;
      }
      const notice = replyNotice(msg, open);
      if (!notice) {
        // The thread is open in front of the person: the page draws the reply. Tell it to refresh now.
        for (const c of open) c.postMessage({ yui: "push", kind: "reply", agent_id: msg?.agent_id });
        return;
      }
      await self.registration.showNotification(notice.title, notice.options);
      for (const c of open) c.postMessage({ yui: "push", kind: "reply", agent_id: msg.agent_id });
      await setBadge();
    })());
  });

  self.addEventListener("notificationclick", (event) => {
    event.notification.close();
    const url = clickUrl(event.notification.data?.url, event.notification.data?.message_id);
    event.waitUntil((async () => {
      const mine = pickClient(await windows(), url);
      if (mine) {
        const focused = await Promise.resolve(mine.focus?.()).catch(() => null);
        // Same document, new address: the page reads it on load, so move it there.
        try { await (focused || mine).navigate?.(url); } catch { /* a window we cannot steer: open a new one below */ }
        await setBadge();
        return;
      }
      await self.clients.openWindow(url);
      await setBadge();
    })());
  });
}

if (typeof module !== "undefined") module.exports = { agentOf, watching, replyNotice, safeUrl, pickClient, clickUrl };
