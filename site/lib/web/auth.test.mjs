// node --test lib/web/auth.test.mjs
// Two tabs on one browser (shared store, lock and channel) against a fake yui-auth that does what
// the real one does: rotate on refresh, and end every session when a rotated token comes back.
import test from "node:test";
import assert from "node:assert/strict";
import { createAuth, AuthError } from "./auth.mjs";

function server() {
  const s = { sessions: new Map(), refreshes: 0, ended: false, n: 0, signedOut: [], live: new Set(), clientOf: {} };
  s.mint = (client = "web") => {
    const refresh = `r${++s.n}`;
    s.sessions.set(refresh, { revoked: false, client });
    return { access_token: `a${s.n}`, token_type: "bearer", expires_in: 600, refresh_token: refresh, user: { id: "u1", email: "c@x.com" } };
  };
  s.fetch = async (url, init) => {
    const body = JSON.parse(init.body);
    const out = (status, json) => ({ ok: status < 300, status, json: async () => json });
    await new Promise((r) => setTimeout(r, 5));
    if (body.grant_type === "apple") return out(200, s.mint("web"));
    if (body.grant_type === "review") return out(200, s.mint("web"));
    if (body.grant_type === "refresh") {
      s.refreshes++;
      const row = s.sessions.get(body.refresh_token);
      if (!row) return out(401, { error: "invalid_grant" });
      if (row.revoked) { for (const r of s.sessions.values()) r.revoked = true; s.ended = true; return out(401, { error: "invalid_grant" }); }
      row.revoked = true;
      return out(200, s.mint(row.client));
    }
    if (body.grant_type === "sign_out") { s.signedOut.push(body.refresh_token); const r = s.sessions.get(body.refresh_token); if (r) r.revoked = true; return out(200, { ok: true }); }
    if (body.grant_type === "x") return out(init.headers.authorization === `Bearer ${s.currentAccess}` ? 200 : 401, { ok: true });
    return out(400, { error: "unsupported_grant_type" });
  };
  return s;
}

// A browser: one store, one lock, one channel bus, any number of tabs.
function browser(srv, clock) {
  let stored; const peers = new Set(); let tail = Promise.resolve();
  const lock = { request: (_n, fn) => { const p = tail.then(() => fn()); tail = p.catch(() => {}); return p; } };
  const tab = () => {
    let me;
    const a = createAuth({
      fetch: (...a) => srv.fetch(...a), now: clock.now, locks: lock,
      store: { get: async () => stored, set: async (v) => { stored = v; }, del: async () => { stored = undefined; } },
      channel: () => { me = { onmessage: null, post(m) { for (const p of peers) if (p !== me) queueMicrotask(() => p.onmessage?.({ data: m })); }, close() {} }; peers.add(me); return me; },
    });
    return a;
  };
  return { tab, peek: () => stored };
}

const sign = (a) => a.signInApple({ identityToken: "tok", nonce: "n" });

test("sign in keeps the refresh token (and the access token for a quick next load), and a new tab restores from it", async () => {
  const srv = server(), clock = { t: 1e9, now: () => clock.t }, b = browser(srv, clock);
  const t1 = b.tab(); await sign(t1);
  assert.equal(t1.snapshot().signedIn, true);
  assert.equal(b.peek().refresh, "r1");
  assert.equal(b.peek().access, "a1", "the access token rides beside the refresh token (YUI-274)");
  const t2 = b.tab();
  const s = await t2.restore();
  assert.equal(s.signedIn, true); assert.equal(s.user.email, "c@x.com");
  assert.equal(srv.refreshes, 1);
  assert.equal(srv.ended, false);
});

test("two tabs refreshing at once never spend one token twice", async () => {
  const srv = server(), clock = { t: 1e9, now: () => clock.t }, b = browser(srv, clock);
  const t1 = b.tab(); await sign(t1);
  const t2 = b.tab(); await t2.restore();
  clock.t += 700_000; // both access tokens have lapsed
  const [x, y] = await Promise.all([t1.accessToken(), t2.accessToken()]);
  assert.equal(srv.ended, false, "no double spend");
  assert.equal(x, y, "both tabs end on the same fresh token");
  assert.equal(srv.refreshes, 2, "one at restore, one for the lapse");
});

test("many tabs, many rounds, never a double spend", async () => {
  const srv = server(), clock = { t: 1e9, now: () => clock.t }, b = browser(srv, clock);
  const tabs = [b.tab(), b.tab(), b.tab(), b.tab()];
  await sign(tabs[0]); for (const t of tabs.slice(1)) await t.restore();
  for (let round = 0; round < 5; round++) {
    clock.t += 700_000;
    await Promise.all(tabs.map((t) => t.accessToken()));
    await Promise.all(tabs.map((t) => t.call("x", {}).catch(() => {})));
  }
  assert.equal(srv.ended, false);
  for (const t of tabs) assert.equal(t.snapshot().signedIn, true);
});

test("a refused refresh token ends the session; a dropped connection does not", async () => {
  const srv = server(), clock = { t: 1e9, now: () => clock.t }, b = browser(srv, clock);
  const t1 = b.tab(); await sign(t1);
  clock.t += 700_000;
  const real = srv.fetch; srv.fetch = async () => { throw new TypeError("offline"); };
  await assert.rejects(t1.accessToken(), (e) => e instanceof AuthError && e.code === "network");
  assert.equal(b.peek().refresh, "r1", "still signed in, stored token kept");
  srv.fetch = real; srv.sessions.get("r1").revoked = true; srv.sessions.get("r1").client = "web";
  // A revoked token that comes back: the server ends everything, we sign out cleanly.
  await assert.rejects(t1.accessToken(), (e) => e.code === "invalid_grant");
  assert.equal(b.peek(), undefined);
  assert.equal(t1.snapshot().signedIn, false);
});

test("sign out ends this session and the other tabs of this browser, nothing else", async () => {
  const srv = server(), clock = { t: 1e9, now: () => clock.t };
  const b = browser(srv, clock), phone = srv.mint("app"); // the phone's session
  const t1 = b.tab(); await sign(t1); const t2 = b.tab(); await t2.restore();
  await t1.signOut();
  await new Promise((r) => setTimeout(r, 10));
  assert.equal(b.peek(), undefined);
  assert.equal(t2.snapshot().signedIn, false, "the sibling tab dropped it");
  assert.equal(srv.signedOut.length, 1);
  assert.equal(srv.sessions.get(phone.refresh_token).revoked, false, "the phone's session lives");
});

test("restore with nothing stored is signed out, no request made", async () => {
  const srv = server(), clock = { t: 1e9, now: () => clock.t }, b = browser(srv, clock);
  const t = b.tab(); const s = await t.restore();
  assert.deepEqual(s, { ready: true, signedIn: false, user: null });
  assert.equal(srv.refreshes, 0);
});

test("restore opens provisionally while the stored session renews (YUI-273), and a refused token ends it", async () => {
  const srv = server(), clock = { t: 1e9, now: () => clock.t }, b = browser(srv, clock);
  await sign(b.tab());
  const t = b.tab(); const seen = []; t.subscribe((s) => seen.push(s));
  await t.restore();
  const prov = seen.find((s) => s.provisional);
  assert.ok(prov && prov.user?.id && !prov.ready && !prov.signedIn, "a stored person is shown before the renewal answers");
  assert.deepEqual(Object.keys(t.snapshot()).sort(), ["ready", "signedIn", "user"], "no provisional flag once renewed");
  assert.equal(t.snapshot().signedIn, true);
  // Nothing stored: never provisional.
  const t2 = browser(srv, clock).tab(); const seen2 = []; t2.subscribe((s) => seen2.push(s));
  await t2.restore();
  assert.equal(seen2.some((s) => s.provisional), false);
});

test("review sign in asks for a web session", async () => {
  const srv = server(), clock = { t: 1e9, now: () => clock.t }, b = browser(srv, clock);
  let seen; const f = srv.fetch; srv.fetch = (u, i) => { seen = JSON.parse(i.body); return f(u, i); };
  const t = b.tab(); await t.signInReview("DEMO-CODE");
  assert.deepEqual(seen, { grant_type: "review", code: "DEMO-CODE", client: "web" });
  assert.equal(t.snapshot().signedIn, true);
});

test("delete account asks the server, then forgets the session in every tab", async () => {
  const srv = server(), clock = { t: 1e9, now: () => clock.t }, b = browser(srv, clock);
  const calls = [];
  const orig = srv.fetch;
  srv.fetch = async (url, init) => { if (String(url).endsWith("/yui-delete")) { calls.push(init.headers.authorization); return { ok: true, status: 200, json: async () => ({ deleted: true }) }; } return orig(url, init); };
  const t1 = b.tab(); await sign(t1);
  const t2 = b.tab(); await t2.restore();
  await t1.deleteAccount();
  assert.equal(calls.length, 1);
  assert.match(calls[0], /^Bearer a/);
  assert.equal(t1.snapshot().signedIn, false);
  assert.equal(b.peek(), undefined, "nothing left in the store");
  await new Promise((r) => setTimeout(r, 10));
  assert.equal(t2.snapshot().signedIn, false, "the other tab drops it too");
});

test("delete account that the server refuses leaves the person signed in", async () => {
  const srv = server(), clock = { t: 1e9, now: () => clock.t }, b = browser(srv, clock);
  const orig = srv.fetch;
  srv.fetch = async (url, init) => (String(url).endsWith("/yui-delete") ? { ok: false, status: 500, json: async () => ({ error: "server_error" }) } : orig(url, init));
  const t1 = b.tab(); await sign(t1);
  await assert.rejects(t1.deleteAccount(), (e) => e.code === "server_error");
  assert.equal(t1.snapshot().signedIn, true);
  assert.equal(b.peek().refresh, "r1");
});

// A restore that the renewal has not answered yet: the page's reads ask for a token meanwhile.
const slow = (srv, ms) => { const f = srv.fetch; srv.fetch = async (...a) => { await new Promise((r) => setTimeout(r, ms)); return f(...a); }; };

test("a stored, unexpired access token serves reads while the renewal is on the wire (YUI-274)", async () => {
  const srv = server(), clock = { t: 1e9, now: () => clock.t }, b = browser(srv, clock);
  await sign(b.tab());
  slow(srv, 40);
  const t = b.tab();
  const restoring = t.restore();
  await new Promise((r) => setTimeout(r, 5));
  assert.equal(await t.accessToken(), "a1", "the stored token answers at once");
  assert.equal(srv.refreshes, 0, "no renewal has landed yet, and the read did not wait for one");
  await restoring;
  assert.equal(srv.refreshes, 1, "the renewal still runs once");
  assert.equal(await t.accessToken(), "a2");
});

test("an expired stored access token is never used: the read waits for the renewal (YUI-274)", async () => {
  const srv = server(), clock = { t: 1e9, now: () => clock.t }, b = browser(srv, clock);
  await sign(b.tab());
  clock.t += 3_600_000;
  slow(srv, 20);
  const t = b.tab();
  const restoring = t.restore();
  await new Promise((r) => setTimeout(r, 5));
  assert.equal(await t.accessToken(), "a2");
  await restoring;
  assert.equal(srv.refreshes, 1);
});

test("a 401 on the stored token waits for the renewal already on the wire and retries on its token, one spend (YUI-274)", async () => {
  const srv = server(), clock = { t: 1e9, now: () => clock.t }, b = browser(srv, clock);
  await sign(b.tab());
  slow(srv, 30);
  const t = b.tab();
  const restoring = t.restore();
  await new Promise((r) => setTimeout(r, 5));
  const first = await t.accessToken();
  assert.equal(first, "a1");
  const retry = await t.renewed(first);
  assert.equal(retry, "a2");
  await restoring;
  assert.equal(srv.refreshes, 1, "the refresh token was spent once");
  assert.equal(srv.ended, false);
  // The rejected token is not offered again.
  assert.equal(await t.accessToken(), "a2");
});

test("a 401 with no renewal on the wire starts exactly one (YUI-274)", async () => {
  const srv = server(), clock = { t: 1e9, now: () => clock.t }, b = browser(srv, clock);
  const t = b.tab(); await sign(t);
  const tok = await t.accessToken();
  const [x, y] = await Promise.all([t.renewed(tok), t.renewed(tok)]);
  assert.equal(x, y);
  assert.equal(srv.refreshes, 1);
  assert.equal(srv.ended, false);
});
