// The web session (YUI-241), the browser twin of Yui/Sources/Account/Account.swift.
//
//   access token   in memory; the one a renewal just got is also kept beside the refresh token, so the next page
//                  load can start its reads on it while the renewal is on the wire (YUI-274, `early`). It is
//                  an hour old at most, and the refresh token next to it is the stronger secret already.
//   refresh token  the one thing stored (IndexedDB), so a closed tab stays signed in for the
//                  60 days yui-auth gives a session. Every refresh rotates it.
//   one refresh    at a time across tabs: a Web Lock around the refresh, and the tab re-reads
//                  the stored token inside the lock, so two tabs never spend one token twice.
//   last agent     the id of the agent the person last had open, in the same record (YUI-281), so a bare /web
//                  address can start that agent's reads before the agent list answers. Sign out clears it.
//   sign out       revokes this session only (the sign_out grant), clears the store, and tells
//                  the other tabs of this browser (they share the session) to drop it.
//
// Everything the browser provides comes in through `deps`, so the node tests drive two "tabs"
// against a fake server that ends every session on a double spend, like yui-auth does.
import { BACKEND, PUBLISHABLE_KEY, functionUrl } from "./config.mjs";

const LOCK = "yui-web-refresh";
const CHANNEL = "yui-web-session";
// Refresh a little early so a call never leaves with a token about to lapse.
const SKEW_MS = 30_000;

export class AuthError extends Error {
  constructor(code, status = 0) { super(code); this.code = code; this.status = status; }
}

/** deps: fetch, store {get,set,del}, locks {request}|null, channel(name) -> {post,onmessage,close}|null, now, base */
export function createAuth(deps) {
  const { fetch: f, store, locks = null, now = Date.now, base = BACKEND } = deps;
  const channel = deps.channel ? deps.channel(CHANNEL) : null;
  let access = null; // { token, expiresAt }
  let user = null;
  let signedIn = false;
  let ready = false;
  let provisional = false; // a stored session is being renewed: the page may open on what it kept (YUI-273)
  let last = null; // the last-open agent id kept in the session record (YUI-281)
  let early = null; // the access token a closed tab left (stored, unexpired): good for reads until the renewal lands
  let inflight = null;
  let peerAccess = null; // resolves the wait for a peer tab's fresh access token
  const listeners = new Set();
  const snapshot = () => ({ ready, signedIn, user, ...(provisional ? { provisional: true } : {}) });
  const emit = () => { for (const l of listeners) l(snapshot()); };

  async function post(fn, body, bearer) {
    let res;
    try {
      res = await f(functionUrl(fn, base), {
        method: "POST",
        headers: {
          "content-type": "application/json",
          apikey: PUBLISHABLE_KEY,
          ...(bearer ? { authorization: `Bearer ${bearer}` } : {}),
        },
        body: JSON.stringify(body),
      });
    } catch {
      throw new AuthError("network");
    }
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new AuthError(data.error || "error", res.status);
    return data;
  }

  async function adopt(reply) {
    access = { token: reply.access_token, expiresAt: now() + reply.expires_in * 1000 };
    user = reply.user ? { id: reply.user.id, email: reply.user.email ?? null } : user;
    early = null;
    await store.set({ refresh: reply.refresh_token, user, at: now(), access: access.token, accessExpiresAt: access.expiresAt, ...(last ? { lastAgent: last } : {}) });
    signedIn = true;
    ready = true;
    provisional = false;
    emit();
  }

  function drop() {
    access = null; early = null; last = null; user = null; signedIn = false; ready = true; provisional = false;
    emit();
  }

  if (channel) {
    channel.onmessage = (ev) => {
      const m = ev.data || {};
      if (m.type === "access" && m.token) {
        // Another tab refreshed: take its fresh access token, never spend the refresh token again.
        access = { token: m.token, expiresAt: m.expiresAt };
        early = null;
        if (m.user) user = m.user;
        signedIn = true; ready = true; emit();
        peerAccess?.();
      } else if (m.type === "signed-out") {
        drop();
      }
    };
  }

  const fresh = () => access && access.expiresAt - now() > SKEW_MS;

  async function refreshLocked(waitedSince) {
    // Inside the lock another tab may have just refreshed: its access token reaches us on the
    // channel, and the stored refresh token is already the new one.
    if (fresh()) return access.token;
    let saved = await store.get();
    if (!saved?.refresh) { drop(); throw new AuthError("signed_out"); }
    if (saved.lastAgent) last = saved.lastAgent; // another tab may have moved it (YUI-281)
    if (channel && saved.at >= waitedSince) {
      // A peer rotated while we queued. Give its access token a moment to arrive, so one
      // sign-in's worth of refreshing is one refresh, not one per tab.
      await new Promise((res) => { peerAccess = res; setTimeout(res, 300); });
      peerAccess = null;
      if (fresh()) return access.token;
      // Time passed: the stored token may have been rotated again, or the person signed out.
      saved = await store.get();
      if (!saved?.refresh) { drop(); throw new AuthError("signed_out"); }
    }
    let reply;
    try {
      reply = await post("yui-auth", { grant_type: "refresh", refresh_token: saved.refresh });
    } catch (e) {
      // A refused token ends this session; a dropped connection keeps it for the next try.
      if (e.code === "invalid_grant" || e.status === 401) { await store.del(); drop(); }
      throw e;
    }
    await adopt(reply);
    if (channel) channel.post({ type: "access", token: access.token, expiresAt: access.expiresAt, user });
    return access.token;
  }

  async function refresh() {
    if (inflight) return inflight;
    inflight = (async () => {
      try {
        const since = now();
        return locks ? await locks.request(LOCK, () => refreshLocked(since)) : await refreshLocked(since);
      } finally { inflight = null; }
    })();
    return inflight;
  }

  return {
    subscribe(fn) { listeners.add(fn); fn(snapshot()); return () => listeners.delete(fn); },
    snapshot,

    /** On page load: a stored refresh token becomes a session again, or the person is signed out. */
    async restore() {
      const saved = await store.get();
      if (!saved?.refresh) { drop(); return snapshot(); }
      user = saved.user ?? null;
      last = saved.lastAgent ?? null;
      // A stored access token that is still good lets the page's reads leave now, not after the renewal (YUI-274).
      // The renewal still runs (refreshLocked does not look at `early`), so the session keeps rotating.
      if (saved.access && saved.accessExpiresAt - now() > SKEW_MS) early = { token: saved.access, expiresAt: saved.accessExpiresAt };
      // The page can open on what this person last saw while the renewal is on the wire: a refused token ends it (drop).
      if (user?.id) { provisional = true; emit(); }
      try { await refresh(); } catch (e) {
        // Offline: stay signed in, the next call retries. Refused: refresh() already dropped it.
        if (e.code === "network" || e.status >= 500) { signedIn = true; ready = true; provisional = false; emit(); }
      }
      return snapshot();
    },

    /** The agent this browser had open last, or null (YUI-281). Read from the store, so a page can ask before restore() ends. */
    async lastAgent() {
      const saved = await store.get().catch(() => null);
      return saved?.refresh && typeof saved.lastAgent === "string" ? saved.lastAgent : null;
    },

    /** Keep `id` as the last-open agent, beside the session. Runs inside the refresh lock: the record is read and written
     * back whole, and a rotation landing in between must not be overwritten with the old refresh token. */
    async rememberAgent(id) {
      if (!id || id === last) return;
      const write = async () => {
        const saved = await store.get();
        if (!saved?.refresh) return; // signed out: nothing to attach it to
        last = id;
        await store.set({ ...saved, lastAgent: id });
      };
      try { await (locks ? locks.request(LOCK, write) : write()); } catch { /* a nicety: the next open tries again */ }
    },

    /** A bearer for a function call; refreshes first when it is about to lapse. */
    async accessToken() {
      if (fresh()) return access.token;
      if (early && early.expiresAt - now() > SKEW_MS) return early.token;
      return refresh();
    },

    /** A call came back 401 on `rejected`: the token to retry with, once. Waits for the renewal that is already on
     * the wire (never a second spend of the refresh token), or starts one. */
    async renewed(rejected) {
      if (early?.token === rejected) early = null;
      if (access?.token === rejected) access = null;
      if (inflight) return inflight;
      if (fresh()) return access.token;
      return refresh();
    },

    /** Calls an edge function as the signed-in person. One refresh and retry on a 401. */
    async call(fn, body) {
      for (let attempt = 0; ; attempt++) {
        const token = attempt ? await (access = null, refresh()) : await this.accessToken();
        try { return await post(fn, body, token); }
        catch (e) { if (!(e.status === 401 && attempt === 0)) throw e; }
      }
    },

    /** Sign in with Apple: `nonce` is the raw one; Apple was given its sha256. */
    async signInApple({ identityToken, nonce, authorizationCode, inviteCode }) {
      const body = { grant_type: "apple", identity_token: identityToken, nonce };
      if (authorizationCode) body.authorization_code = authorizationCode;
      if (inviteCode) body.invite_code = inviteCode;
      const reply = await post("yui-auth", body);
      await adopt(reply);
      if (channel) channel.post({ type: "access", token: access.token, expiresAt: access.expiresAt, user });
      return reply;
    },

    /** The demo account (the review grant), for people who have no invite yet. */
    async signInReview(code) {
      const reply = await post("yui-auth", { grant_type: "review", code, client: "web" });
      await adopt(reply);
      if (channel) channel.post({ type: "access", token: access.token, expiresAt: access.expiresAt, user });
      return reply;
    },

    /** Ends this session only. Other devices keep theirs. */
    async signOut() {
      const saved = await store.get();
      await store.del();
      drop();
      if (channel) channel.post({ type: "signed-out" });
      if (saved?.refresh) { try { await post("yui-auth", { grant_type: "sign_out", refresh_token: saved.refresh }); } catch { /* the token is gone from this browser either way */ } }
    },

    /** Delete account (yui-delete, App Store 5.1.1(v)): the server removes the account, then this browser forgets
     * the session, here and in the other tabs. A refusal (or no network) leaves the person signed in. */
    async deleteAccount() {
      await this.call("yui-delete", {});
      await store.del();
      drop();
      if (channel) channel.post({ type: "signed-out" });
    },

    close() { channel?.close?.(); },
  };
}

/** The browser's parts. Not used by the tests. */
export function browserDeps() {
  const DB = "yui-web", STORE = "session", KEY = "session";
  const open = () => new Promise((res, rej) => {
    const r = indexedDB.open(DB, 1);
    r.onupgradeneeded = () => r.result.createObjectStore(STORE);
    r.onsuccess = () => res(r.result);
    r.onerror = () => rej(r.error);
  });
  const run = async (mode, fn) => {
    const db = await open();
    return new Promise((res, rej) => {
      const tx = db.transaction(STORE, mode);
      const req = fn(tx.objectStore(STORE));
      tx.oncomplete = () => { db.close(); res(req?.result); };
      tx.onerror = () => { db.close(); rej(tx.error); };
    });
  };
  return {
    fetch: (...a) => fetch(...a),
    store: {
      get: () => run("readonly", (s) => s.get(KEY)),
      set: (v) => run("readwrite", (s) => s.put(v, KEY)),
      del: () => run("readwrite", (s) => s.delete(KEY)),
    },
    locks: typeof navigator !== "undefined" && navigator.locks ? navigator.locks : null,
    channel: typeof BroadcastChannel !== "undefined" ? (n) => {
      const c = new BroadcastChannel(n);
      return { post: (m) => c.postMessage(m), set onmessage(fn) { c.onmessage = fn; }, close: () => c.close() };
    } : null,
  };
}
