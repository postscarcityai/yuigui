// YUI-303 e2e: the web drawer's Home is the chats and nothing else (the twin of the phone's HomeChatsOnlyTests).
// No Next up, Screens, Shortcuts or backlog rows on Home; the backlog sits under Agent > More and still opens;
// Review keeps its place, the bar at the foot stays, the chips stay over the stage bar.
//   npx next start -p 3303 &   then   node e2e/web/homechats.test.mjs
import { createRequire } from "node:module";
import { mkdirSync } from "node:fs";
const { chromium } = createRequire(import.meta.url)(process.env.PLAYWRIGHT || "playwright");
const BASE = process.env.BASE || "http://localhost:3303";
const SHOTS = process.env.SHOTS || "";
if (SHOTS) mkdirSync(SHOTS, { recursive: true });
const b = await chromium.launch();
let pass = 0, fail = 0;
const ok = (c, msg) => { if (c) { pass++; console.log("  ok  ", msg); } else { fail++; console.log("  FAIL", msg); } };

for (const theme of ["dark", "light"]) {
  const pg = await b.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, hasTouch: true, isMobile: true });
  const errs = [];
  pg.on("pageerror", (e) => errs.push(e.message));
  await pg.goto(`${BASE}/web/agent/demo-basil?demo=basil&theme=${theme}`);
  await pg.waitForSelector("[data-testid=stage-record]");
  await pg.waitForTimeout(600);
  const t = `${theme} 390`;
  ok(await pg.getByTestId("home-chip-groceries").isVisible(), `${t}: the shortcut chips stay over the bar`);
  await pg.getByTestId("stage-menu").click();
  await pg.getByTestId("drawer").waitFor();
  await pg.waitForTimeout(500);
  if (SHOTS) await pg.screenshot({ path: `${SHOTS}/web-home-chats-${theme}.png` });

  const kinds = ["next-up", "backlog-", "shortcut-", "screen-", "command-", "drawer-more"];
  for (const k of kinds) ok(await pg.locator(`[data-testid^="${k}"]`).count() === 0, `${t}: no ${k} row on Home`);
  ok(await pg.locator(".dr-heading").count() === 0 && await pg.locator(".dr-row, .dr-next").count() === 0, `${t}: no headings or rows on Home, only chats`);
  ok(await pg.getByTestId("tab-review").isVisible(), `${t}: Review keeps its place`);
  ok(await pg.getByTestId("agent-bar").isVisible(), `${t}: the bar at the foot stays`);

  await pg.getByTestId("tab-agent").click();
  ok(await pg.getByTestId("drawer-more").isVisible(), `${t}: More sits under Agent`);
  ok(await pg.getByTestId("backlog-plan").isVisible(), `${t}: the backlog row moved there`);
  ok(await pg.locator('[data-testid^="shortcut-"], [data-testid^="screen-"]').count() === 0, `${t}: shortcut and screen rows are cut`);
  if (SHOTS) await pg.screenshot({ path: `${SHOTS}/web-agent-more-${theme}.png` });
  const sent = await pg.evaluate(() => window.yuiWebDemo.wire("demo-basil").length);
  await pg.getByTestId("backlog-plan").click();
  await pg.waitForTimeout(600);
  ok(await pg.evaluate(() => window.yuiWebDemo.wire("demo-basil").length) >= sent, `${t}: a moved row still opens`);
  ok(await pg.locator(".wb-side.open").count() === 0, `${t}: and the drawer closes behind it`);
  ok(errs.length === 0, `${t}: no page errors ${errs.join("|").slice(0, 120)}`);
  await pg.close();
}
await b.close();
console.log(`${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
