// YUI-266 e2e: the menu button is one pill that names the agent, and the stage never shows its end screen
// ("Anything else?") while a reply is still coming. Demo relay, no sign in, no network.
//   npx next start -p 3266 &   then   node e2e/web/menu-pill.test.mjs
import { createRequire } from "node:module";
import { mkdirSync } from "node:fs";
const { chromium } = createRequire(import.meta.url)(process.env.PLAYWRIGHT || "playwright");
const BASE = process.env.BASE || "http://localhost:3266";
const SHOTS = process.env.SHOTS || "";
if (SHOTS) mkdirSync(SHOTS, { recursive: true });
const b = await chromium.launch();
let pass = 0, fail = 0;
const ok = (c, msg) => { if (c) { pass++; console.log("  ok  ", msg); } else { fail++; console.log("  FAIL", msg); } };

for (const theme of ["dark", "light"]) {
  const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, hasTouch: true, isMobile: true });
  const pg = await ctx.newPage();
  const errs = [];
  pg.on("pageerror", (e) => errs.push(e.message));
  await pg.goto(`${BASE}/web/agent/demo-penny?demo=penny&theme=${theme}`);
  await pg.waitForSelector("[data-testid=stage-home]");
  await pg.waitForTimeout(500);
  const t = `${theme} 390`;

  // ---------- the pill: menu icon, agent name, one tap opens the drawer ----------
  const pill = pg.locator("[data-testid=stage-menu]");
  ok(await pill.isVisible(), `${t}: the menu button is a pill`);
  ok(/Penny/.test(await pill.innerText()), `${t}: the pill carries the agent's name`);
  ok(await pill.locator("svg").count() >= 1, `${t}: the menu icon sits in the pill`);
  const box = await pill.boundingBox();
  ok(box.width > box.height * 1.8, `${t}: it is wider than a round button`);
  if (SHOTS) await pg.screenshot({ path: `${SHOTS}/web-menu-pill-${theme}.png` });
  await pill.click();
  await pg.waitForSelector("[role=dialog], .wb-drawer, [data-testid=drawer]", { timeout: 4000 }).catch(() => {});
  ok(await pg.getByText("Settings", { exact: false }).first().isVisible().catch(() => false), `${t}: tapping the pill opens the drawer`);
  await pg.keyboard.press("Escape");
  await pg.mouse.click(380, 600).catch(() => {});
  await pg.waitForTimeout(400);

  // ---------- a long name truncates inside the pill ----------
  await pg.evaluate(() => { const n = document.querySelector(".wb-stage-menu-name"); if (n) n.textContent = "An agent with a very very long name indeed"; });
  const wide = await pg.locator("[data-testid=stage-menu]").boundingBox();
  const rec = await pg.locator("[data-testid=stage-record]").boundingBox();
  ok(wide.x + wide.width <= rec.x, `${t}: a long name truncates and leaves the chat button alone`);
  await pg.reload();
  await pg.waitForSelector("[data-testid=stage-home]");
  await pg.waitForTimeout(500);

  // ---------- no end screen while a reply is coming ----------
  const stageText = () => pg.locator("[data-testid=stage]").innerText();
  await pg.locator(".wb-chip", { hasText: "Plan my week" }).click();
  await pg.waitForSelector("[data-testid=stage-working]", { timeout: 6000 });
  if (SHOTS) await pg.screenshot({ path: `${SHOTS}/web-no-early-end-working-${theme}.png` });
  let early = false, sawWork = false;
  for (let i = 0; i < 40; i++) {
    const tx = await stageText();
    if (/Friday is the rest day/.test(tx)) break;
    if (/Anything else\?|Everything so far/.test(tx)) early = true;
    if (await pg.locator("[data-testid=stage-working]").count()) sawWork = true;
    await pg.waitForTimeout(100);
  }
  ok(sawWork && !early, `${t}: the working state holds until the reply lands, no end screen before it`);
  await pg.waitForFunction(() => /Friday is the rest day/.test(document.querySelector("[data-testid=stage]")?.innerText || ""), null, { timeout: 20000 });
  ok(true, `${t}: the reply lands`);
  if (SHOTS) await pg.screenshot({ path: `${SHOTS}/web-no-early-end-${theme}.png` });
  ok(errs.length === 0, `${t}: no page errors ${errs.join("|")}`);
  await ctx.close();
}
await b.close();
console.log(`${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
