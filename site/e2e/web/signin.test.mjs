// YUI-241 e2e: Sign in with Apple on /web, a session that stays signed in, sign out. Apple's script and the
// edge functions are stubbed in the browser (route), so this runs with no network and no Apple ID; the stub
// server does what yui-auth does: rotate a refresh token on every use and end every session when a spent one
// comes back (no grace here, the strictest case). BASE is the site (default http://localhost:3150), PLAYWRIGHT
// the module, SHOTS a folder for the screenshots. Run after `npm run build && npx next start -p 3150`.
import { createRequire } from "node:module";
import { createHash } from "node:crypto";
import { mkdirSync } from "node:fs";
const { chromium } = createRequire(import.meta.url)(process.env.PLAYWRIGHT || "playwright");
const BASE = process.env.BASE || "http://localhost:3150";
const SHOTS = process.env.SHOTS || "";
if (SHOTS) mkdirSync(SHOTS, { recursive: true });
let pass = 0, fail = 0;
const ok = (c, msg) => { if (c) { pass++; console.log("  ok  ", msg); } else { fail++; console.log("  FAIL", msg); } };

const CORS = { "access-control-allow-origin": "*", "access-control-allow-headers": "*", "access-control-allow-methods": "POST, OPTIONS" };
const APPLE_STUB = `window.AppleID={auth:{init(c){window.__apple=c;window.__inits=(window.__inits||0)+1},signIn(){window.__signIns=(window.__signIns||0)+1;return window.__appleFail?Promise.reject({error:window.__appleFail}):Promise.resolve({authorization:{id_token:"id.token.stub",code:"code-stub",state:window.__apple.state}})}}}`;

// One fake backend per browser context, so a test can read what each grant sent.
function backend() {
  const s = { log: [], sessions: new Map(), n: 0, ended: false, email: "chris@example.com", nonceSeen: null };
  const mint = (client) => {
    const r = `rt${++s.n}`;
    s.sessions.set(r, { revoked: false, client });
    return { access_token: `at${s.n}`, token_type: "bearer", expires_in: 3600, refresh_token: r, user: { id: "u1", email: s.email, created_at: "2026-09-01T00:00:00Z" } };
  };
  s.handle = async (route) => {
    const req = route.request();
    if (req.method() === "OPTIONS") return route.fulfill({ status: 204, headers: CORS });
    const url = new URL(req.url());
    const fn = url.pathname.split("/").pop();
    const body = req.postDataJSON();
    const auth = req.headers().authorization || "";
    s.log.push({ fn, body, auth, apikey: req.headers().apikey });
    const reply = (status, json) => route.fulfill({ status, headers: { ...CORS, "content-type": "application/json" }, body: JSON.stringify(json) });
    if (fn === "yui-account") return auth.startsWith("Bearer at") ? reply(200, { user: { id: "u1", email: s.email }, look: null }) : reply(401, { error: "unauthorized" });
    if (fn !== "yui-auth") return reply(404, {});
    switch (body.grant_type) {
      case "apple": s.nonceSeen = body.nonce; return reply(200, { ...mint("web"), ...(body.invite_code ? { invite: { first_name: "Maya" } } : {}) });
      case "review": return body.code === "DEMO1234" ? reply(200, mint(body.client === "web" ? "web" : "app")) : reply(401, { error: "invalid_grant" });
      case "refresh": {
        await new Promise((r) => setTimeout(r, 40));
        const row = s.sessions.get(body.refresh_token);
        if (process.env.DEBUG401) console.log("refresh", body.refresh_token, row ? (row.revoked ? "REVOKED" : "live") : "unknown", "log#", s.log.length);
        if (!row) return reply(401, { error: "invalid_grant" });
        if (row.revoked) { for (const x of s.sessions.values()) x.revoked = true; s.ended = true; return reply(401, { error: "invalid_grant" }); }
        row.revoked = true; return reply(200, mint(row.client));
      }
      case "sign_out": { const row = s.sessions.get(body.refresh_token); if (row) row.revoked = true; return reply(200, { ok: true }); }
      case "invite": return body.code === "ABCDEFGHJK" ? reply(200, { invite: { first_name: "Maya" } }) : reply(404, { error: "invalid_code" });
    }
    return reply(400, { error: "unsupported_grant_type" });
  };
  return s;
}

const b = await chromium.launch();
async function context(vp, scheme, srv) {
  const ctx = await b.newContext({ viewport: vp, colorScheme: scheme, deviceScaleFactor: vp.width < 600 ? 2 : 1 });
  await ctx.addInitScript((t) => { try { if (!sessionStorage.getItem("__themed")) { localStorage.setItem("yui-theme", t); sessionStorage.setItem("__themed", "1"); } } catch {} }, scheme);
  await ctx.route("**/appleid.cdn-apple.com/**", (r) => r.fulfill({ status: 200, contentType: "text/javascript", body: APPLE_STUB }));
  await ctx.route("**/functions/v1/**", srv.handle);
  const errs = [];
  ctx.on("page", (p) => { if (process.env.DEBUG401) p.on("response", async (r) => { if (r.status() === 401) console.log("401", r.url().split("/").pop(), r.request().postData()); }); p.on("pageerror", (e) => errs.push(String(e))); p.on("console", (m) => { if (m.type() === "error") errs.push(m.text()); }); });
  return { ctx, errs };
}
const shot = async (pg, name) => { if (SHOTS) await pg.screenshot({ path: `${SHOTS}/${name}.png` }); };
const sha = (t) => createHash("sha256").update(t).digest("hex");

for (const [name, vp] of [["390", { width: 390, height: 844 }], ["desktop", { width: 1280, height: 900 }]]) {
  for (const scheme of ["light", "dark"]) {
    const tag = `${name} ${scheme}`;
    const srv = backend();
    const { ctx, errs } = await context(vp, scheme, srv);
    const pg = await ctx.newPage();
    const res = await pg.goto(`${BASE}/web`, { waitUntil: "networkidle" });
    ok(res.status() === 200, `${tag}: /web answers 200`);
    ok(/script-src 'self' 'unsafe-inline' https:\/\/appleid\.cdn-apple\.com/.test(res.headers()["content-security-policy"] || "") && /frame-ancestors 'none'/.test(res.headers()["content-security-policy"] || ""), `${tag}: the strict policy is on the page`);
    ok((await pg.locator("html").getAttribute("data-theme")) === scheme, `${tag}: the page is ${scheme}`);
    ok(await pg.getByRole("button", { name: "Sign in with Apple" }).isVisible(), `${tag}: the Sign in with Apple button shows when signed out`);
    ok(await pg.locator("nav.nav, header nav").count() === 0 || !(await pg.locator(".foot").count()), `${tag}: no site nav or footer on /web`);
    ok(!(await pg.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1)), `${tag}: no sideways scroll`);
    await pg.waitForFunction(() => window.__apple);
    const cfg = await pg.evaluate(() => window.__apple);
    ok(cfg.clientId === "com.yuigui.web" && cfg.usePopup === true && cfg.redirectURI === "https://www.yuigui.com/web/auth/apple" && cfg.scope === "email", `${tag}: Apple gets the Services ID, the popup mode and the return URL`);
    ok(/^[0-9a-f]{64}$/.test(cfg.nonce) && cfg.state.length >= 16, `${tag}: Apple gets a hashed nonce and a state`);
    await shot(pg, `signin-${name}-${scheme}`);

    // Sign in.
    await pg.getByRole("button", { name: "Sign in with Apple" }).click();
    await pg.getByTestId("account-email").waitFor();
    ok((await pg.getByTestId("account-email").innerText()) === "chris@example.com", `${tag}: signed in, his own account shows`);
    const apple = srv.log.find((l) => l.body.grant_type === "apple");
    ok(apple.body.identity_token === "id.token.stub" && apple.body.authorization_code === "code-stub", `${tag}: yui-auth gets Apple's token and code`);
    ok(sha(apple.body.nonce) === cfg.nonce, `${tag}: yui-auth gets the raw nonce, Apple got its sha256`);
    ok(apple.apikey?.startsWith("sb_publishable_") && !apple.auth, `${tag}: the publishable key rides as apikey, no bearer before sign in`);
    const acct = srv.log.find((l) => l.fn === "yui-account");
    ok(acct && acct.auth === "Bearer at1", `${tag}: the account call carries the access token`);
    const keep = await pg.evaluate(async () => {
      const idb = await new Promise((res) => { const r = indexedDB.open("yui-web", 1); r.onsuccess = () => { const g = r.result.transaction("session").objectStore("session").get("session"); g.onsuccess = () => res(g.result); }; });
      return { idb, ls: JSON.stringify({ ...localStorage }), ss: JSON.stringify({ ...sessionStorage }), cookie: document.cookie };
    });
    ok(keep.idb?.refresh === "rt1" && !JSON.stringify(keep.idb).includes("at1"), `${tag}: IndexedDB holds the refresh token and no access token`);
    ok(!/rt1|at1/.test(keep.ls + keep.ss + keep.cookie), `${tag}: nothing in localStorage, sessionStorage or cookies`);
    await shot(pg, `account-${name}-${scheme}`);

    // A reload stays signed in; a second tab too; two tabs opening at once never double spend.
    await pg.reload({ waitUntil: "networkidle" });
    await pg.getByTestId("account-email").waitFor();
    ok(srv.log.some((l) => l.body.grant_type === "refresh" && l.body.refresh_token === "rt1"), `${tag}: a reload signs back in from the stored refresh token`);
    const tab2 = await ctx.newPage(), tab3 = await ctx.newPage();
    await Promise.all([tab2.goto(`${BASE}/web`), tab3.goto(`${BASE}/web`)]);
    await Promise.all([tab2.getByTestId("account-email").waitFor(), tab3.getByTestId("account-email").waitFor()]);
    ok(!srv.ended, `${tag}: two tabs opened together, no refresh token spent twice`);
    ok((await tab2.getByTestId("account-email").innerText()) === "chris@example.com", `${tag}: the second tab is signed in`);

    // Sign out in one tab ends this browser's session, signs the siblings out, and leaves another device alone.
    const phone = srv.sessions.size; srv.sessions.set("phone-rt", { revoked: false, client: "app" });
    await tab2.getByRole("button", { name: "Sign out" }).click();
    await tab2.getByRole("button", { name: "Sign in with Apple" }).waitFor();
    await pg.getByRole("button", { name: "Sign in with Apple" }).waitFor({ timeout: 4000 });
    ok(true, `${tag}: sign out in one tab signs the others out`);
    const out = srv.log.filter((l) => l.body.grant_type === "sign_out");
    ok(out.length === 1 && srv.sessions.get(out[0].body.refresh_token)?.revoked, `${tag}: sign out revoked this session`);
    ok(srv.sessions.get("phone-rt").revoked === false, `${tag}: the phone's session is untouched`);
    if (process.env.DEBUG401) console.log("idb after signout", await pg.evaluate(async () => new Promise((res) => { const r = indexedDB.open("yui-web", 1); r.onsuccess = () => { const g = r.result.transaction("session").objectStore("session").get("session"); g.onsuccess = () => res(JSON.stringify(g.result)); }; })));
    await pg.reload({ waitUntil: "networkidle" });
    ok(await pg.getByRole("button", { name: "Sign in with Apple" }).isVisible(), `${tag}: after sign out a reload stays signed out`);
    ok(errs.length === 0, `${tag}: no console errors${errs.length ? " " + errs[0] : ""}`);
    await ctx.close();
  }
}

// Invite, demo code, cancelled Apple popup (390 light is enough).
{
  const srv = backend();
  const { ctx, errs } = await context({ width: 390, height: 844 }, "light", srv);
  const pg = await ctx.newPage();
  await pg.goto(`${BASE}/web?invite=abcde-fghjk`, { waitUntil: "networkidle" });
  ok(await pg.getByTestId("pending-invite").isVisible() && /ABCDE-FGHJK/.test(await pg.getByTestId("pending-invite").innerText()), "invite: the link's code shows as ready to join");
  ok(!pg.url().includes("invite"), "invite: the code is out of the address bar");
  await shot(pg, "invite-390-light");
  await pg.evaluate(() => { window.__appleFail = "popup_closed_by_user"; });
  await pg.getByRole("button", { name: "Sign in with Apple" }).click();
  await pg.waitForTimeout(300);
  ok(!(await pg.locator(".web-error").count()) && srv.log.length === 0, "cancelled popup: no error and nothing sent");
  await pg.evaluate(() => { window.__appleFail = null; });
  await pg.getByRole("button", { name: "Sign in with Apple" }).click();
  await pg.getByTestId("account-email").waitFor();
  const a = srv.log.find((l) => l.body.grant_type === "apple");
  ok(a.body.invite_code === "ABCDE-FGHJK", "invite: the code rides along with Sign in with Apple");
  ok(await pg.evaluate(() => sessionStorage.getItem("yui-web-invite")) === null, "invite: used, it is forgotten");
  await ctx.close();

  const s2 = backend();
  const c2 = await context({ width: 390, height: 844 }, "light", s2);
  const p2 = await c2.ctx.newPage();
  await p2.goto(`${BASE}/web`, { waitUntil: "networkidle" });
  await p2.getByRole("button", { name: "Demo code" }).click();
  await p2.getByLabel("Demo code").fill("wrong");
  await p2.getByRole("button", { name: "Open the demo" }).click();
  await p2.locator(".web-error").waitFor();
  ok(/did not work/.test(await p2.locator(".web-error").innerText()), "demo: a wrong code says so");
  await p2.getByLabel("Demo code").fill("DEMO1234");
  await p2.getByRole("button", { name: "Open the demo" }).click();
  await p2.getByTestId("account-email").waitFor();
  const rev = s2.log.filter((l) => l.body.grant_type === "review").pop();
  ok(rev.body.client === "web", "demo: the review grant asks for a web session");
  await c2.ctx.close();

  const s3 = backend();
  const c3 = await context({ width: 390, height: 844 }, "light", s3);
  const p3 = await c3.ctx.newPage();
  await p3.goto(`${BASE}/web`, { waitUntil: "networkidle" });
  await p3.getByRole("button", { name: "Invite code" }).click();
  await p3.getByLabel("Invite code").fill("no");
  await p3.getByRole("button", { name: "Use code" }).click();
  ok(/10 letters and numbers/.test(await p3.locator(".web-error").innerText()), "invite code field: a bad code is refused before anything is sent");
  await p3.getByLabel("Invite code").fill("abcde fghjk");
  await p3.getByRole("button", { name: "Use code" }).click();
  ok(/ABCDE-FGHJK/.test(await p3.getByTestId("pending-invite").innerText()), "invite code field: a typed code becomes the pending invite");
  await c3.ctx.close();
  ok(errs.length === 0, `no console errors on the invite page${errs.length ? " " + errs[0] : ""}`);
}

// The return URL Apple is given answers a GET and a POST.
{
  const ctx = await b.newContext();
  const g = await ctx.request.get(`${BASE}/web/auth/apple`), p = await ctx.request.post(`${BASE}/web/auth/apple`, { form: { code: "x" } });
  ok(g.status() === 200 && p.status() === 200, "return URL: /web/auth/apple answers a GET and a form POST");
  await ctx.close();
}

await b.close();
console.log(`web sign in: ${pass} ok, ${fail} failed`);
process.exit(fail ? 1 : 0);
