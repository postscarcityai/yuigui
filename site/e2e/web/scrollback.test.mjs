// YUI-269 e2e: a long chat on /web scrolls back past the newest 100 rows, fetching older ones from the server.
//   250 older rows over the demo relay (?demohistory=250): the first is "Earlier answer 1".
//   Scrolling to the top brings every one in, none twice, the reader stays put, the stage and shelf do not change.
//   npx next build && npx next start -p 3257 &   then   node e2e/web/scrollback.test.mjs
import { createRequire } from "node:module";
import { mkdirSync } from "node:fs";
const { chromium } = createRequire(import.meta.url)(process.env.PLAYWRIGHT || "playwright");
const BASE = process.env.BASE || "http://localhost:3257";
const SHOTS = process.env.SHOTS || "";
if (SHOTS) mkdirSync(SHOTS, { recursive: true });
let pass = 0, fail = 0;
const ok = (c, msg) => { if (c) { pass++; console.log("  ok  ", msg); } else { fail++; console.log("  FAIL", msg); } };
const b = await chromium.launch();
const PHONE = { viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true };

for (const theme of ["dark", "light"]) {
  const context = await b.newContext({ deviceScaleFactor: 2, ...PHONE });
  const pg = await context.newPage();
  const errs = [];
  pg.on("pageerror", (e) => errs.push(e.message));
  await pg.goto(`${BASE}/web/agent/demo-penny?demo=penny&view=chat&demohistory=250&theme=${theme}`);
  await pg.waitForSelector(".wb-item");
  await pg.waitForTimeout(1500);

  // The scroller is the nearest ancestor of the messages that scrolls.
  const top = () => pg.evaluate(() => { let e = document.querySelector(".wb-messages"); while (e && e.scrollHeight <= e.clientHeight + 1) e = e.parentElement; if (e) { window.__sc = e; e.scrollTop = 0; } return !!e; });
  const ids = () => pg.evaluate(() => [...document.querySelectorAll(".wb-item")].map((e) => e.dataset.id));
  const texts = () => pg.evaluate(() => [...document.querySelectorAll(".wb-item")].map((e) => e.innerText.replace(/\s+/g, " ").trim()));
  const side = () => pg.evaluate(() => (document.querySelector("[data-testid=stage]")?.innerText || "") + "|" + (document.querySelector("[data-testid=shelf]")?.innerText || ""));

  const first = (await ids()).length;
  ok(first <= 70, `${theme}: opens on the newest rows, not the whole chat (${first} drawn)`);
  const sideBefore = await side();

  // No jump: stand at the very top, note the first row in view in the same breath, let the batches land, find it again.
  const mark = await pg.evaluate(() => {
    let e = document.querySelector(".wb-messages"); while (e && e.scrollHeight <= e.clientHeight + 1) e = e.parentElement;
    window.__sc = e; e.scrollTop = 5;
    const r = e.getBoundingClientRect();
    const it = [...document.querySelectorAll(".wb-item")].find((x) => x.getBoundingClientRect().bottom > r.top + 8);
    return { id: it.dataset.id, y: it.getBoundingClientRect().top - r.top };
  });
  await pg.waitForTimeout(1500);
  const drift = await pg.evaluate((m) => {
    const it = document.querySelector(`.wb-item[data-id="${m.id}"]`);
    if (!it) return null;
    const r = window.__sc.getBoundingClientRect();
    return Math.abs(it.getBoundingClientRect().top - r.top - m.y);
  }, mark);
  ok((await ids()).length > first, `${theme}: scrolling back brings older rows in`);
  ok(drift !== null && drift <= 3, `${theme}: the row the reader was on is still where it was (moved ${drift} px)`);

  // All the way back: keep going to the top until row 1 is drawn.
  let seen = false, n = 0;
  for (let i = 0; i < 60 && !seen; i++) {
    await top();
    await pg.mouse.wheel(0, -300);
    await pg.waitForTimeout(250);
    n = (await ids()).length;
    seen = (await texts()).some((t) => /Earlier answer 1\b/.test(t));
  }
  ok(seen, `${theme}: scrolls back to the first row ("Earlier answer 1", ${n} drawn)`);
  const all = await ids();
  ok(new Set(all).size === all.length, `${theme}: no row is drawn twice (${all.length} rows)`);
  const t = await texts();
  const nums = t.map((x) => /Earlier (?:answer|question) (\d+)\b/.exec(x)).filter(Boolean).map((m) => Number(m[1]));
  ok(nums.length === 250 && nums.every((x, i) => x === i + 1), `${theme}: all 250 older rows are there, in order (${nums.length})`);
  ok(await side() === sideBefore, `${theme}: the stage and the shelf did not change when old rows landed`);
  await pg.evaluate(() => { window.__sc.scrollTop = 0; });
  await pg.waitForTimeout(500);
  const atTop = await pg.evaluate(() => window.__sc.scrollTop);
  if (SHOTS) await pg.screenshot({ path: `${SHOTS}/web-scrollback-390-${theme}.png`, timeout: 120000 });
  ok(atTop >= 0 && errs.length === 0, `${theme}: no page errors (${errs.join("|").slice(0, 120)})`);
  await context.close();
}
console.log(`\n${pass} passed, ${fail} failed`);
await b.close();
process.exit(fail ? 1 : 0);
