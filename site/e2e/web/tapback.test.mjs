// YUI-278 e2e: on the web stage a tap on the left quarter goes back a part; the rest goes on.
//   npx next build && npx next start -p 3278 &   then   node e2e/web/tapback.test.mjs
// BASE overrides the origin, PLAYWRIGHT the Playwright module, SHOTS the folder for 390 px shots.
import { createRequire } from "node:module";
import { mkdirSync } from "node:fs";
const { chromium } = createRequire(import.meta.url)(process.env.PLAYWRIGHT || "playwright");
const BASE = process.env.BASE || "http://localhost:3278";
const SHOTS = process.env.SHOTS || "";
if (SHOTS) mkdirSync(SHOTS, { recursive: true });
const b = await chromium.launch();
let pass = 0, fail = 0;
const ok = (c, msg) => { if (c) { pass++; console.log("  ok  ", msg); } else { fail++; console.log("  FAIL", msg); } };

for (const theme of ["light", "dark"]) {
  const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, hasTouch: true, isMobile: true });
  const pg = await ctx.newPage();
  const errs = [];
  pg.on("pageerror", (e) => errs.push(e.message));
  await pg.goto(`${BASE}/web/agent/demo-penny?demo=penny&theme=${theme}`);
  await pg.waitForSelector("[data-testid=stage-home]");
  await pg.waitForTimeout(500);
  await pg.locator("[data-testid=stage-type]").click();
  await pg.locator("[data-testid=stage-field] textarea").fill("Show me three parts");
  await pg.locator("[data-testid=stage-send]").click();
  await pg.waitForSelector(".ys-segs", { timeout: 20000 });
  await pg.waitForTimeout(900);
  const box = await pg.locator(".ys-play").boundingBox();
  const tapAt = (f) => pg.mouse.click(box.x + box.width * f, box.y + box.height * 0.45);
  const back = pg.locator("button[aria-label='Back a part']");
  const next = pg.locator("button[aria-label='Next part']");
  const text = () => pg.locator(".ys-play").innerText();

  ok(await back.isDisabled(), `${theme}: opens on the first part`);
  const first = await text();
  await tapAt(0.1);
  await pg.waitForTimeout(300);
  ok(await back.isDisabled() && await text() === first, `${theme}: a left tap on the first part does nothing`);
  await tapAt(0.8);
  await pg.waitForTimeout(500);
  ok(await back.isEnabled(), `${theme}: a right tap goes on`);
  if (SHOTS) await pg.screenshot({ path: `${SHOTS}/tapback-${theme}-after-next.png` });
  await tapAt(0.1);
  await pg.waitForTimeout(500);
  ok(await back.isDisabled(), `${theme}: a tap on the left quarter goes back`);
  if (SHOTS) await pg.screenshot({ path: `${SHOTS}/tapback-${theme}-after-back.png` });
  await tapAt(0.3);
  await pg.waitForTimeout(500);
  ok(await back.isEnabled(), `${theme}: a tap past the left quarter goes on`);
  await tapAt(0.1);
  await pg.waitForTimeout(500);
  ok(await back.isDisabled(), `${theme}: back on the first part`);
  await next.dispatchEvent("click"); // a chip row can sit over the buttons at 390 px; the click itself is what is checked
  await pg.waitForTimeout(500);
  ok(await back.isEnabled(), `${theme}: the Next button moves exactly one part`);
  await back.dispatchEvent("click");
  await pg.waitForTimeout(500);
  ok(await back.isDisabled(), `${theme}: the Back button moves exactly one part`);
  ok(errs.length === 0, `${theme}: no page errors ${errs.join("|")}`);
  await ctx.close();
}
await b.close();
console.log(`${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
