// YUI-247 e2e: settings and account on the web, on the demo relay (no sign in, no network): Appearance, Full screen,
// Home actions, Look, Agent access, Keys (sealed in the page, never kept), the host's key ask, Your model key, Web
// search, Help, Account (sign out, delete), About. Light and dark, 390 px and desktop.
//   npx next build && npx next start -p 3247 &   then   node e2e/web/settings.test.mjs
// BASE overrides the origin, PLAYWRIGHT the Playwright module, SHOTS the folder for the shots (skipped when unset).
import { createRequire } from "node:module";
import { mkdirSync } from "node:fs";
const { chromium } = createRequire(import.meta.url)(process.env.PLAYWRIGHT || "playwright");
const BASE = process.env.BASE || "http://localhost:3247";
const SHOTS = process.env.SHOTS || "";
if (SHOTS) mkdirSync(SHOTS, { recursive: true });
const b = await chromium.launch();
let pass = 0, fail = 0;
const ok = (c, msg) => { if (c) { pass++; console.log("  ok  ", msg); } else { fail++; console.log("  FAIL", msg); } };
const PHONE = { width: 390, height: 844 }, DESK = { width: 1280, height: 800 };
const FAL = "aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee:0123456789abcdef0123456789abcdef";
const OR = "sk-or-v1-abcdefghijklmnopqrst1234";
const wire = (pg) => pg.evaluate(() => window.yuiWebDemo.settings.wire());

async function open(vp, theme, { extra = "", path = "/web/agent/demo-penny" } = {}) {
  const pg = await b.newPage({ viewport: vp, deviceScaleFactor: 2 });
  pg.errs = [];
  pg.on("pageerror", (e) => pg.errs.push(e.message));
  await pg.goto(`${BASE}${path}?demo=penny&theme=${theme}${extra}`);
  await pg.waitForSelector("[data-testid=stage-record], [data-testid=key-ask]");
  await pg.waitForTimeout(400);
  return pg;
}
const shot = async (pg, name) => { if (SHOTS) await pg.screenshot({ path: `${SHOTS}/${name}.png` }); };
async function settings(pg, vp) {
  if (vp.width < 760 && !(await pg.locator(".wb-side.open").count())) {
    const stage = pg.locator(".wb-stage-menu:visible");
    await ((await stage.count()) ? stage : pg.locator(".wb-menu:visible")).first().click();
    await pg.waitForTimeout(450);
  }
  await pg.getByTestId("open-settings").click();
  await pg.getByTestId("settings").waitFor();
  await pg.waitForTimeout(350);
}
const section = (pg, id) => pg.locator(`[data-section="${id}"]`);
const scrollTo = (pg, id) => section(pg, id).scrollIntoViewIfNeeded();
const stores = (pg) => pg.evaluate(async () => {
  const dbs = (await indexedDB.databases?.()) || [];
  return JSON.stringify({ l: { ...localStorage }, s: { ...sessionStorage }, dbs: dbs.map((d) => d.name) });
});

for (const [vp, tag] of [[PHONE, "390"], [DESK, "desktop"]]) for (const theme of ["light", "dark"]) {
  const T = `${theme} ${tag}`;

  // ---------- the sheet, every section, nothing sideways ----------
  let pg = await open(vp, theme, { extra: "&demovault=1" });
  await settings(pg, vp);
  for (const id of ["appearance", "stage", "home-actions", "look", "agent-access", "keys", "key", "search", "help", "account", "about"]) {
    ok(await section(pg, id).count() === 1, `${T}: Settings has ${id}`);
  }
  ok(!(await pg.getByTestId("st-speed").count()), `${T}: no Speed switch for a person`);
  const over = await pg.evaluate(() => { const b = document.querySelector("[data-testid=settings] .st-body"); return [b.scrollWidth - b.clientWidth, document.scrollingElement.scrollWidth - innerWidth]; });
  ok(over[0] <= 0 && over[1] <= 0, `${T}: nothing scrolls sideways (${over})`);
  // Touch targets: every button and field in the sheet is at least 44 px tall (a link is a line of text).
  const small = await pg.evaluate(() => [...document.querySelectorAll("[data-testid=settings] button, [data-testid=settings] input, [data-testid=settings] select, [data-testid=settings] textarea")]
    .filter((e) => e.offsetParent && !e.closest("[hidden]")).map((e) => { const r = e.getBoundingClientRect(); return { n: (e.getAttribute("aria-label") || e.textContent || e.id).trim().slice(0, 30), h: Math.round(r.height), w: Math.round(r.width), sw: e.getAttribute("role") === "switch" }; })
    .filter((x) => !x.sw && x.h < 44));
  ok(small.length === 0, `${T}: touch targets are 44 px or more (${JSON.stringify(small)})`);
  await shot(pg, `web-settings-top-${tag}-${theme}`);

  // ---------- Appearance ----------
  await pg.emulateMedia({ colorScheme: "dark" });
  await pg.getByTestId("appearance-system").click();
  ok(await pg.evaluate(() => document.documentElement.dataset.theme) === "dark", `${T}: System follows the browser (dark)`);
  await pg.emulateMedia({ colorScheme: "light" });
  await pg.waitForTimeout(150);
  ok(await pg.evaluate(() => document.documentElement.dataset.theme) === "light", `${T}: and follows it back (light)`);
  await pg.getByTestId("appearance-dark").click();
  ok(await pg.evaluate(() => document.documentElement.dataset.theme) === "dark" && await pg.evaluate(() => localStorage.getItem("yui-web-appearance")) === "dark", `${T}: Dark is kept`);
  ok(await pg.getByTestId("appearance-dark").getAttribute("aria-checked") === "true", `${T}: and says which is on`);
  await pg.getByTestId("appearance-light").click();
  ok(await pg.evaluate(() => document.documentElement.dataset.theme) === "light", `${T}: Light`);
  await pg.getByTestId("appearance-" + theme).click();
  await pg.emulateMedia({ colorScheme: null });

  // ---------- Look ----------
  await scrollTo(pg, "look");
  ok((await pg.getByTestId("look-name").innerText()).includes("Yui's own"), `${T}: Yui's own look, named`);
  ok(!(await pg.getByTestId("look-reset").count()), `${T}: no Back to Yui's look while nothing is on`);
  await pg.getByTestId("look-agents-keep").getByRole("switch").click();
  await pg.waitForTimeout(150);
  ok((await pg.evaluate(() => window.yuiWebDemo.settings.look())).agents_keep_looks === false, `${T}: the switch is written to the account (agents_keep_looks false)`);
  ok((await pg.getByTestId("look-agents-keep").innerText()).includes("Every thread wears Yui's look."), `${T}: and says what it means`);
  await pg.getByTestId("look-agents-keep").getByRole("switch").click();
  await pg.waitForTimeout(150);
  await shot(pg, `web-settings-look-${tag}-${theme}`);

  // ---------- Home actions ----------
  await scrollTo(pg, "home-actions");
  const rows = await pg.locator("[data-testid=home-actions-list] li").count();
  ok(rows > 0, `${T}: your agents' shortcuts are listed (${rows})`);
  const first = pg.locator("[data-testid=home-actions-list] li").first();
  const firstId = (await first.getAttribute("data-testid")).slice(3);
  const offId = await pg.locator("[data-testid=home-actions-list] li:not([data-on]) ").first().getAttribute("data-testid").catch(() => null);
  if (offId) {
    // Pick one more than the default shows, then Back to the default clears it.
    await pg.locator(`[data-testid="${offId}"] .st-pick`).click();
    ok(await pg.locator(`[data-testid="${offId}"][data-on]`).count() === 1, `${T}: a tap puts a shortcut on the list`);
    ok(JSON.parse(await pg.evaluate(() => localStorage.getItem("yui-web-quick-picks") || "null"))?.includes(offId.slice(3)), `${T}: the pick is kept`);
    await pg.getByTestId("home-actions-default").click();
    ok(await pg.evaluate(() => localStorage.getItem("yui-web-quick-picks")) === null, `${T}: Back to the default`);
  }
  void firstId;

  // ---------- Full screen ----------
  await scrollTo(pg, "stage");
  await pg.getByTestId("stage-mic-on").getByRole("switch").click();
  ok(await pg.getByTestId("stage-type-on").getByRole("switch").isDisabled(), `${T}: with the mic off, T cannot go`);
  await pg.getByTestId("stage-attach-on").getByRole("switch").click();
  await pg.getByTestId("settings-done").click();
  await pg.waitForTimeout(250);
  ok(!(await pg.getByTestId("stage-mic").count()) && await pg.getByTestId("stage-type").count() === 1 && !(await pg.getByTestId("stage-attach").count()), `${T}: the stage bar drops the mic and + and keeps T`);
  await shot(pg, `web-settings-fullscreen-bar-${tag}-${theme}`);
  await settings(pg, vp);
  await pg.getByTestId("stage-mic-on").getByRole("switch").click();
  await pg.getByTestId("stage-attach-on").getByRole("switch").click();
  await pg.getByTestId("stage-first-on").getByRole("switch").click();
  await pg.getByTestId("settings-done").click();
  await pg.waitForTimeout(300);
  ok(!(await pg.getByTestId("stage").count()), `${T}: Answers on the full screen off puts the chat first`);
  await settings(pg, vp);
  await pg.getByTestId("stage-first-on").getByRole("switch").click();
  await pg.getByTestId("settings-done").click();
  await pg.waitForTimeout(300);
  ok(await pg.getByTestId("stage").count() === 1 && await pg.getByTestId("stage-mic").count() === 1, `${T}: and back on, with the whole bar`);
  ok(pg.errs.length === 0, `${T}: no page errors (${pg.errs.join("|")})`);
  await pg.close();

  // ---------- Agent access ----------
  pg = await open(vp, theme);
  await settings(pg, vp);
  await scrollTo(pg, "agent-access");
  await pg.getByTestId("token-create").click();
  await pg.getByTestId("token-fresh").waitFor();
  const secret = await pg.getByTestId("token-secret").innerText();
  ok(/^yui_mt_/.test(secret), `${T}: a token shows once, with its prefix`);
  ok((await pg.locator("[data-testid=token-list] li").count()) === 1, `${T}: and is in the list as "Agent access 1"`);
  ok(!(await stores(pg)).includes(secret), `${T}: the token is in no storage`);
  await pg.getByRole("button", { name: "I copied it" }).click();
  ok(!(await pg.getByTestId("token-fresh").count()) && !(await pg.content()).includes(secret), `${T}: after "I copied it" the page no longer has it`);
  ok((await pg.locator("[data-testid=token-list]").innerText()).includes("Never used"), `${T}: "Never used" until it is`);
  await shot(pg, `web-settings-access-${tag}-${theme}`);
  await pg.getByRole("button", { name: /^Revoke Agent access 1/ }).click();
  await pg.waitForTimeout(150);
  ok(!(await pg.locator("[data-testid=token-list] li").count()), `${T}: Revoke takes it away`);

  // ---------- Your model key ----------
  await scrollTo(pg, "key");
  ok((await pg.getByTestId("key-left").innerText()).startsWith("Yui and your crew have 70 of 100 free turns left"), `${T}: the free turns left, in the app's words`);
  await pg.getByTestId("key-provider").selectOption("anthropic");
  ok((await pg.getByTestId("key-plan").innerText()).includes("Claude Pro or Max"), `${T}: a plan line for Claude`);
  await pg.getByTestId("key-provider").selectOption("openrouter");
  await pg.getByTestId("key-field").fill("badkeybadkey123");
  await pg.getByTestId("key-save").click();
  await pg.getByRole("alert").filter({ hasText: "didn't accept" }).waitFor();
  ok(true, `${T}: a key the provider refuses says so in the provider's words`);
  await pg.getByTestId("key-field").fill(OR);
  await pg.getByTestId("key-save").click();
  await pg.getByTestId("model-key-have").waitFor();
  ok((await pg.getByTestId("model-key-have").innerText()).includes("Ends in 1234"), `${T}: saved, shown as its last four`);
  ok(!(await pg.content()).includes(OR) && !(await stores(pg)).includes(OR) && !(await pg.getByTestId("key-field").count()), `${T}: the key is gone from the page and from every storage`);
  const w1 = await wire(pg);
  ok(w1.some((x) => x.action === "key_set" && x.provider === "openrouter" && x.hint === "1234"), `${T}: it went to yui-native once`);
  await shot(pg, `web-settings-modelkey-${tag}-${theme}`);
  await pg.getByTestId("model-key-remove").click();
  await pg.getByTestId("key-field").waitFor();
  ok(true, `${T}: Remove brings the form back`);

  // ---------- Web search ----------
  await scrollTo(pg, "search");
  ok((await pg.getByTestId("search-left").innerText()).includes("40 of 50 free web searches left"), `${T}: the free searches left`);
  await pg.getByTestId("search-key-field").fill("fc-abcdefgh9876");
  await pg.getByTestId("search-key-save").click();
  await pg.getByTestId("search-key-have").waitFor();
  ok((await pg.getByTestId("search-key-have").innerText()).includes("Ends in 9876") && !(await stores(pg)).includes("fc-abcdefgh9876") && !(await pg.content()).includes("fc-abcdefgh9876"), `${T}: your Firecrawl key, last four only, kept nowhere here`);
  await pg.getByTestId("search-key-remove").click();
  await pg.getByTestId("search-key-field").waitFor();
  ok(true, `${T}: and Remove`);

  // ---------- Help and feedback ----------
  await scrollTo(pg, "help");
  await pg.getByTestId("feedback-text").fill("The mic button is stuck.");
  const href = await pg.getByTestId("feedback-send").getAttribute("href");
  ok(href.startsWith("mailto:") && decodeURIComponent(href).includes("The mic button is stuck.") && decodeURIComponent(href).includes("Yui on the web"), `${T}: the mail carries your words and the build`);
  ok(await pg.locator('[data-testid=st-help] a[href="/help"]').count() === 1 && await pg.locator('[data-testid=st-help] a[href="/start"]').count() === 1, `${T}: Help and Connect an agent`);

  // ---------- About ----------
  await scrollTo(pg, "about");
  const about = await pg.getByTestId("build-summary").innerText();
  ok(/^Yui on the web/.test(about) && /Channel guide v\d+/.test(about), `${T}: About names the web build and the guide (${about.replace(/\n/g, " | ")})`);
  await shot(pg, `web-settings-bottom-${tag}-${theme}`);

  // ---------- Account ----------
  await scrollTo(pg, "account");
  await pg.getByTestId("delete-account").click();
  await pg.getByTestId("confirm").waitFor();
  const words = await pg.getByTestId("confirm").innerText();
  ok(words.includes("Delete your Yui account?") && words.includes("every message stored on Yui's servers") && words.includes("removed from your Apple ID"), `${T}: delete says exactly what goes`);
  await shot(pg, `web-settings-delete-${tag}-${theme}`);
  await pg.getByRole("button", { name: "Keep my account" }).click();
  ok(!(await wire(pg)).some((x) => x.fn === "yui-delete"), `${T}: Keep my account deletes nothing`);
  await pg.getByTestId("delete-account").click();
  await pg.getByTestId("confirm-yes").click();
  await pg.getByTestId("agent-notice").waitFor();
  ok((await wire(pg)).some((x) => x.fn === "yui-delete") && (await pg.getByTestId("agent-notice").innerText()).includes("Account deleted"), `${T}: Delete my account calls yui-delete, and says so`);
  ok(pg.errs.length === 0, `${T}: no page errors (${pg.errs.join("|")})`);
  await pg.close();

  // ---------- Sign out ----------
  pg = await open(vp, theme);
  await settings(pg, vp);
  await scrollTo(pg, "account");
  await pg.getByTestId("sign-out").click();
  await pg.getByTestId("agent-notice").waitFor();
  ok((await pg.getByTestId("agent-notice").innerText()).includes("Signed out"), `${T}: Sign out`);
  await pg.close();

  // ---------- Keys: sealed in the page, never kept ----------
  pg = await open(vp, theme);
  await settings(pg, vp);
  await scrollTo(pg, "keys");
  ok(await pg.getByTestId("keys-empty").count() === 1, `${T}: no keys yet, and it says how one comes`);
  await pg.getByTestId("key-add").click();
  await pg.getByTestId("vault-secret").fill("not-a-key");
  await pg.getByTestId("vault-save").click();
  ok((await pg.getByTestId("vault-error").innerText()).includes("doesn't look like a fal key"), `${T}: a key of the wrong shape is refused in the page`);
  await pg.getByTestId("vault-secret").fill(FAL);
  await pg.getByTestId("vault-name").fill("Personal fal");
  await pg.getByTestId("vault-cap").selectOption("1000");
  await shot(pg, `web-settings-keys-add-${tag}-${theme}`);
  await pg.getByTestId("vault-save").click();
  await pg.getByTestId("confirm").waitFor();
  ok((await pg.getByTestId("confirm").innerText()).includes("Add your fal key to Yui?"), `${T}: adding asks first`);
  await pg.getByTestId("confirm-yes").click();
  await pg.locator("[data-testid=key-list] li[data-testid^=key-]").first().waitFor();
  const card = await pg.locator("[data-testid=key-list] li").first().innerText();
  ok(card.includes("fal: Personal fal") && card.includes("Ends in cdef") && card.includes("$0 of $10 this month"), `${T}: the key shows by its last four and its cap (${card.split("\n")[0]})`);
  const w2 = await wire(pg);
  const put = w2.find((x) => x.fn === "rest" && x.table === "yui_vault_keys" && x.method === "POST");
  ok(put && put.key_id === "yvk-1" && put.last4 === "cdef" && /^\\x[0-9a-f]{4}/.test(put.sealed), `${T}: the relay got a sealed copy (HPKE, key yvk-1)`);
  const all = (await pg.content()) + (await stores(pg)) + JSON.stringify(w2);
  ok(!all.includes(FAL) && !all.includes("0123456789abcdef0123456789abcdef"), `${T}: the key is in no storage, no page text and no request in the clear`);
  ok(!(await pg.getByTestId("vault-secret").count()), `${T}: the field is gone`);
  // a grant
  await pg.locator("[data-testid^=grant-open-]").click();
  await pg.getByTestId("grant-agent").selectOption({ label: "Penny" });
  await pg.getByTestId("grant-purpose").fill("Draw my avatars");
  await pg.getByTestId("grant-allow").click();
  await pg.getByTestId("confirm").waitFor();
  await pg.getByTestId("confirm-yes").click();
  await pg.locator("[data-testid^=grant-vk_fal_]").waitFor();
  const gtext = await pg.locator("[data-testid^=grant-vk_fal_]").innerText();
  ok(gtext.includes("Penny") && gtext.includes("Draw my avatars") && gtext.includes("$0 of $10 this month"), `${T}: a grant lists the agent, what for and this month's spend (${gtext.replace(/\n/g, " | ")})`);
  await shot(pg, `web-settings-keys-grant-${tag}-${theme}`);
  await pg.locator("[data-testid^=revoke-vk_fal_]").click();
  await pg.waitForTimeout(200);
  ok(!(await pg.locator("[data-testid^=grant-vk_fal_]").count()), `${T}: Revoke ends the grant`);
  await pg.locator("[data-testid^=key-remove-]").click();
  await pg.getByTestId("confirm").waitFor();
  ok((await pg.getByTestId("confirm").innerText()).includes("Remove your fal key?"), `${T}: removing asks first`);
  await pg.getByTestId("confirm-yes").click();
  await pg.getByTestId("keys-empty").waitFor();
  ok((await wire(pg)).some((x) => x.table === "yui_vault_keys" && x.method === "DELETE"), `${T}: Remove deletes the sealed copy`);
  ok(pg.errs.length === 0, `${T}: no page errors (${pg.errs.join("|")})`);
  await pg.close();

  // ---------- a seeded vault shows spend and a lapse-free grant ----------
  pg = await open(vp, theme, { extra: "&demovault=1" });
  await settings(pg, vp);
  await scrollTo(pg, "keys");
  const seeded = await pg.locator("[data-testid=key-list]").innerText();
  ok(seeded.includes("Ends in cdef") && seeded.includes("Used today") && seeded.includes("Draw my avatars"), `${T}: a key with a grant says it was used today`);
  await shot(pg, `web-settings-keys-${tag}-${theme}`);
  await pg.close();

  // ---------- a look that is on: named, and Back to Yui's look ----------
  pg = await open(vp, theme, { extra: "&applook=forest" });
  const wore = await pg.evaluate(() => document.querySelector(".web-root").style.getPropertyValue("--brand"));
  ok(/^#[0-9a-f]{6}$/i.test(wore), `${T}: the chrome wears the account's look (${wore})`);
  await settings(pg, vp);
  await scrollTo(pg, "look");
  ok((await pg.getByTestId("look-name").innerText()).includes("Forest"), `${T}: the look is named`);
  await shot(pg, `web-settings-look-on-${tag}-${theme}`);
  await pg.getByTestId("look-reset").click();
  await pg.waitForTimeout(200);
  ok((await pg.getByTestId("look-name").innerText()).includes("Yui's own") && (await pg.evaluate(() => window.yuiWebDemo.settings.look())).prev.preset === "forest", `${T}: Back to Yui's look, one step kept to undo`);
  ok(await pg.evaluate(() => document.querySelector(".web-root").style.getPropertyValue("--brand")) === "", `${T}: and the chrome is Yui's own again`);
  await pg.close();

  // ---------- a host's key ask: Yui's own sheet ----------
  pg = await open(vp, theme, { extra: "&keyask=demo-penny|fal|Draw your agent avatars|5|about 4 images a week" });
  await pg.getByTestId("key-ask").waitFor();
  ok((await pg.getByTestId("key-ask-title").innerText()) === "Penny wants to use your fal key", `${T}: "Penny wants to use your fal key"`);
  ok((await pg.getByTestId("key-ask-for").innerText()) === "Draw your agent avatars" && (await pg.getByTestId("key-ask-cap").innerText()).includes("$5 a month"), `${T}: what for, and the suggested cap`);
  ok(await pg.getByTestId("key-ask-nokey").count() === 1, `${T}: no fal key yet, so it says so`);
  await shot(pg, `web-key-ask-${tag}-${theme}`);
  await pg.getByTestId("key-ask-add").click();
  await pg.getByTestId("vault-secret").fill(FAL);
  await pg.getByTestId("vault-save").click();
  await pg.getByTestId("confirm-yes").click();
  await pg.getByTestId("key-ask-allow").waitFor();
  await pg.getByTestId("key-ask-allow").click();
  await pg.getByTestId("key-ask").waitFor({ state: "detached" });
  const w3 = await wire(pg);
  const ans = w3.find((x) => x.fn === "key_answer");
  ok(ans && ans.decision === "allow" && ans.provider === "fal" && ans.cap === 5 && /^vk_fal_[0-9a-f]{4}$/.test(ans.handle), `${T}: Allow answers with a handle and the cap ($5)`);
  ok(!(await pg.content()).includes(FAL), `${T}: and the key is not in the page`);
  await pg.close();
  pg = await open(vp, theme, { extra: "&keyask=demo-penny|fal|Draw your agent avatars|5|" });
  await pg.getByTestId("key-ask-deny").click();
  await pg.getByTestId("key-ask").waitFor({ state: "detached" });
  ok((await wire(pg)).some((x) => x.fn === "key_answer" && x.decision === "deny"), `${T}: Don't allow answers no`);
  await pg.close();
  pg = await open(vp, theme, { extra: "&keyask=demo-penny|fal|use%20aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee:0123456789abcdef0123456789abcdef|5|" });
  await pg.waitForTimeout(600);
  ok(!(await pg.getByTestId("key-ask").count()) && (await wire(pg)).some((x) => x.fn === "key_answer" && x.decision === "deny"), `${T}: an ask that carries a key is refused, never shown`);
  await pg.close();

  // ---------- a dev link shows Speed ----------
  pg = await open(vp, theme, { extra: "&perf=1" });
  await settings(pg, vp);
  ok(await pg.getByTestId("st-speed").count() === 1, `${T}: ?perf=1 shows the Speed switch`);
  await pg.close();

  // ---------- a link opens at a section ----------
  pg = await open(vp, theme, { extra: "&settings=search" });
  await pg.getByTestId("settings").waitFor();
  await pg.waitForTimeout(500);
  const inView = await pg.evaluate(() => { const r = document.querySelector('[data-section="search"]').getBoundingClientRect(); return r.top < innerHeight && r.bottom > 0; });
  ok(inView, `${T}: yui://settings/search opens at Web search`);
  await pg.close();
}

await b.close();
console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
