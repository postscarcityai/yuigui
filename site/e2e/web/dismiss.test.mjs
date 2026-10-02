// YUI-270 e2e: Dismiss and Not yet on a Needs you row, like the app (YUI-265). The row leaves at once, the host
// hears one quiet event (no echo, no agent turn), and it stays gone after a refresh. Demo relay, no sign in.
//   npx next start -p 3270 &   then   node e2e/web/dismiss.test.mjs
import { createRequire } from "node:module";
import { mkdirSync } from "node:fs";
const { chromium } = createRequire(import.meta.url)(process.env.PLAYWRIGHT || "playwright");
const BASE = process.env.BASE || "http://localhost:3270";
const SHOTS = process.env.SHOTS || "";
if (SHOTS) mkdirSync(SHOTS, { recursive: true });
const b = await chromium.launch();
let pass = 0, fail = 0;
const ok = (c, msg) => { if (c) { pass++; console.log("  ok  ", msg); } else { fail++; console.log("  FAIL", msg); } };
const wire = (pg) => pg.evaluate(() => window.yuiWebDemo.wire("demo-penny").map((r) => r.body));
const NEED = "need-t_0a0b0c";

for (const theme of ["dark", "light"]) {
  const t = `${theme} 390`;
  const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, hasTouch: true, isMobile: true });
  const pg = await ctx.newPage();
  const errs = [];
  pg.on("pageerror", (e) => errs.push(e.message));
  const open = async () => { await pg.goto(`${BASE}/web/agent/demo-penny?demo=penny&theme=${theme}`); await pg.waitForSelector("[data-testid=stage-home]"); await pg.waitForTimeout(500); };
  await open();

  // ---------- the home row: Dismiss and Not yet next to the answer, only on a host ask ----------
  ok(await pg.getByTestId(`home-menu-${NEED}`).isVisible(), `${t}: the ask is on the home`);
  ok(await pg.getByTestId(`home-dismiss-${NEED}`).isVisible() && await pg.getByTestId(`home-notyet-${NEED}`).isVisible(), `${t}: it carries Dismiss and Not yet`);
  ok(await pg.getByTestId("home-dismiss-dana").count() === 0, `${t}: a plain review row has no Dismiss`);
  const box = await pg.getByTestId(`home-dismiss-${NEED}`).boundingBox();
  ok(box.height >= 34 && box.x + box.width <= 390, `${t}: the button is a real target and fits the phone`);
  if (SHOTS) await pg.screenshot({ path: `${SHOTS}/web-dismiss-home-${theme}.png` });
  const before = (await wire(pg)).length;
  const bubbles = await pg.locator(".wb-user").count();
  await pg.getByTestId(`home-dismiss-${NEED}`).click();
  await pg.waitForTimeout(500);
  ok(await pg.getByTestId(`home-menu-${NEED}`).count() === 0, `${t}: Dismiss takes the row off at once`);
  ok(await pg.getByTestId("home-menu-dana").isVisible(), `${t}: the other rows stay`);
  const sent = (await wire(pg)).slice(before);
  ok(sent.length === 1 && sent[0] === `[yui] ${NEED} menu bucket=review dismissed`, `${t}: the host gets one quiet event (${sent.join(" | ")})`);
  ok(await pg.locator(".wb-user").count() === bubbles, `${t}: and nothing is said in the chat`);
  await pg.waitForTimeout(1200);
  ok((await wire(pg)).length === before + 1, `${t}: no agent turn follows`);

  // ---------- a refresh keeps it gone ----------
  await open();
  ok(await pg.getByTestId(`home-menu-${NEED}`).count() === 0 && await pg.getByTestId("home-menu-dana").isVisible(), `${t}: after a refresh it is still gone`);

  // ---------- the drawer review list: Not yet ----------
  await pg.evaluate((n) => localStorage.removeItem("yui.web.dismissed.demo-penny") || n, NEED);
  await open();
  ok(await pg.getByTestId(`home-menu-${NEED}`).isVisible(), `${t}: (cleared) the ask is back`);
  await pg.getByTestId("stage-menu").click();
  await pg.getByTestId("tab-review").click();
  await pg.waitForTimeout(300);
  ok(await pg.getByTestId(`review-dismiss-${NEED}`).isVisible() && await pg.getByTestId(`review-notyet-${NEED}`).isVisible(), `${t}: the drawer row has both too`);
  ok(await pg.getByTestId("review-dana").isVisible() && await pg.getByTestId("review-dismiss-dana").count() === 0, `${t}: a plain row has none`);
  if (SHOTS) await pg.screenshot({ path: `${SHOTS}/web-dismiss-drawer-${theme}.png` });
  const before2 = (await wire(pg)).length;
  await pg.getByTestId(`review-notyet-${NEED}`).click();
  await pg.waitForTimeout(500);
  ok(await pg.getByTestId(`review-${NEED}`).count() === 0, `${t}: Not yet takes it off the list at once`);
  const sent2 = (await wire(pg)).slice(before2);
  ok(sent2[0] === `[yui] ${NEED} choose choice="Not yet"`, `${t}: the host gets the same Not yet answer the ask screen sends (${sent2[0]})`);
  await open();
  ok(await pg.getByTestId(`home-menu-${NEED}`).count() === 0, `${t}: and it is still gone after a refresh`);
  ok(errs.length === 0, `${t}: no page errors ${errs.join("|")}`);
  await ctx.close();
}
await b.close();
console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
