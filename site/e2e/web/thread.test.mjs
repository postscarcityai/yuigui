// YUI-242 e2e: the thread in the browser, on the demo relay (no sign in, no network).
//   npx next dev -p 3242 &   then   node e2e/web/thread.test.mjs
// BASE overrides the origin, PLAYWRIGHT the Playwright module, SHOTS the folder for 390 px and desktop shots
// (light and dark; skipped when unset).
import { createRequire } from "node:module";
import { mkdirSync } from "node:fs";
const { chromium } = createRequire(import.meta.url)(process.env.PLAYWRIGHT || "playwright");
const BASE = process.env.BASE || "http://localhost:3242";
const SHOTS = process.env.SHOTS || "";
if (SHOTS) mkdirSync(SHOTS, { recursive: true });
const b = await chromium.launch();
let pass = 0, fail = 0;
const ok = (c, msg) => { if (c) { pass++; console.log("  ok  ", msg); } else { fail++; console.log("  FAIL", msg); } };
const wire = (pg) => pg.evaluate(() => window.yuiWebDemo.wire("demo-penny").map((r) => r.body));

async function open(vp, theme, path = "/web/agent/demo-penny") {
  const pg = await b.newPage({ viewport: vp, deviceScaleFactor: 2 });
  pg.errs = [];
  pg.on("pageerror", (e) => pg.errs.push(e.message));
  await pg.goto(`${BASE}${path}?demo=penny&theme=${theme}`);
  await pg.waitForSelector("[data-testid=stage-record]");
  await pg.locator("[data-testid=stage-record]").click(); // the stage is first (YUI-243); the thread is its record
  await pg.waitForSelector(".wb-item");
  await pg.waitForTimeout(600);
  return pg;
}

for (const theme of ["light", "dark"]) {
  // ---------- 390 px: the agents are a drawer ----------
  let pg = await open({ width: 390, height: 844 }, theme);
  ok(await pg.locator(".wb-side").evaluate((e) => e.getBoundingClientRect().right <= 0), `${theme} 390: the agent list is off screen until asked`);
  await pg.getByRole("button", { name: "Your agents" }).click();
  await pg.waitForTimeout(450);
  await pg.getByTestId("agent-bar").click(); // the bar at the drawer's foot switches agents (YUI-245)
  ok(await pg.locator(".ag-list:not([data-testid=groups-list]) .wb-agent-row").count() === 3, `${theme} 390: the drawer lists three agents`);
  if (SHOTS) await pg.screenshot({ path: `${SHOTS}/web-thread-drawer-390-${theme}.png` });
  await pg.locator(".wb-agent-row", { hasText: "Yui" }).first().click();
  await pg.waitForTimeout(700);
  ok((await pg.locator(".wb-head-words b").innerText()) === "Yui", `${theme} 390: picking an agent opens its thread`);
  ok(pg.url().includes("/web/agent/demo-yui") && pg.url().includes("demo=penny"), `${theme} 390: the address follows, the demo stays`);
  await pg.close();

  // ---------- the recorded thread ----------
  pg = await open({ width: 390, height: 844 }, theme);
  ok(await pg.locator(".wb-day").count() >= 2, `${theme}: day dividers where the day changes`);
  ok(await pg.locator(".wb-time").count() >= 4, `${theme}: a sent time under each run`);
  ok(await pg.locator(".wb-fold").count() === 1, `${theme}: the long answer folds`);
  await pg.locator(".wb-fold").click();
  ok((await pg.locator(".wb-fold").innerText()) === "Show less" && (await pg.locator(".wb-text").filter({ hasText: "dropping the week" }).count()) === 1, `${theme}: Read it all opens the whole answer`);
  await pg.locator(".wb-fold").click();
  ok(await pg.locator(".wb-screen").count() >= 3, `${theme}: screens drawn by the playground renderers`);
  ok(await pg.locator(".wb-user .wb-bubble", { hasText: "Add all three" }).count() === 1, `${theme}: a tapped answer shows as the person's bubble`);
  ok(await pg.locator("[data-id] a[href^='javascript']").count() === 0, `${theme}: no script links`);

  // ---------- a tap sends the phone's line ----------
  await pg.getByRole("button", { name: "Yes", exact: true }).click();
  await pg.waitForTimeout(300);
  ok((await wire(pg)).at(-1) === "[yui] ping choose choice=Yes", `${theme}: the tap went out as [yui] ping choose choice=Yes`);
  ok(await pg.locator(".wb-user .wb-bubble", { hasText: /^Yes$/ }).count() === 1, `${theme}: and shows as the person's bubble`);
  await pg.getByRole("button", { name: "No", exact: true }).click();
  await pg.waitForTimeout(300);
  ok((await wire(pg)).at(-1) === "[yui] ping choose changed choice=No", `${theme}: a second tap carries changed`);
  await pg.waitForSelector(".wb-working", { timeout: 5000 });
  ok(await pg.locator(".wb-working").count() === 1, `${theme}: the working row shows while the agent works`);
  await pg.waitForFunction(() => !document.querySelector(".wb-working"), null, { timeout: 15000 });

  // ---------- type and send ----------
  await pg.getByLabel("Message Penny").fill("can you move friday?");
  await pg.getByRole("button", { name: "Send" }).click();
  ok(await pg.locator(".wb-user .wb-bubble", { hasText: "can you move friday?" }).count() === 1, `${theme}: the sent bubble is there at once`);
  await pg.waitForTimeout(250); // the outbox keeps it on disk first, then sends
  ok((await wire(pg)).at(-1) === "can you move friday?", `${theme}: the text went out as typed`);
  await pg.waitForSelector(".wb-working");
  ok(await pg.getByRole("button", { name: "Stop" }).count() >= 1, `${theme}: Send becomes Stop while the agent works`);
  await pg.waitForFunction(() => /Keep Friday clear/.test(document.body.innerText), null, { timeout: 15000 });
  ok(true, `${theme}: the agent answered with a screen`);
  if (SHOTS) await pg.screenshot({ path: `${SHOTS}/web-thread-390-${theme}.png` });
  ok(pg.errs.length === 0, `${theme}: no page errors ${pg.errs.join("|")}`);
  await pg.close();

  // ---------- desktop: a column ----------
  pg = await open({ width: 1280, height: 800 }, theme);
  ok(await pg.locator(".wb-side").evaluate((e) => e.getBoundingClientRect().left >= 0 && e.getBoundingClientRect().width > 250), `${theme} desktop: the agent list is a column`);
  ok(await pg.locator(".wb-menu").isHidden(), `${theme} desktop: no menu button`);
  if (SHOTS) await pg.screenshot({ path: `${SHOTS}/web-thread-desktop-${theme}.png` });
  await pg.close();
}
await b.close();
console.log(`${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
