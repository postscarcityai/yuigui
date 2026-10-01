// YUI-249 e2e: one Yui across phone and web. Words half typed on the phone are in the web field, words typed on the
// web are on the phone's row, and sending clears them on both. The demo relay stands in for yui_sync_state
// (`yuiWebDemo.state.phone(...)` is the phone writing). Run like composer.test.mjs:
//   npx next build && npx next start -p 3244 &   then   node e2e/web/sync.test.mjs
import { createRequire } from "node:module";
import { mkdirSync } from "node:fs";
const { chromium } = createRequire(import.meta.url)(process.env.PLAYWRIGHT || "playwright");
const BASE = process.env.BASE || "http://localhost:3244";
const SHOTS = process.env.SHOTS || "";
if (SHOTS) mkdirSync(SHOTS, { recursive: true });
let pass = 0, fail = 0;
const ok = (c, msg) => { if (c) { pass++; console.log("  ok  ", msg); } else { fail++; console.log("  FAIL", msg); } };
const b = await chromium.launch();
const PHONE = { viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true };
const DESK = { viewport: { width: 1280, height: 800 } };
const wake = (pg) => pg.evaluate(() => window.dispatchEvent(new Event("focus")));
const rows = (pg) => pg.evaluate(() => window.yuiWebDemo.state.list("demo-penny"));
// Waits (up to 8 s) for the draft row to satisfy `is`, and returns it.
async function draftRow(pg, is) {
  for (let i = 0; i < 40; i++) { const r = (await rows(pg)).find((x) => x.key === "draft"); if (r && is(r)) return r; await pg.waitForTimeout(200); }
  return (await rows(pg)).find((x) => x.key === "draft");
}

for (const [name, vp] of [["390", PHONE], ["desktop", DESK]]) for (const theme of ["light", "dark"]) {
  const tag = `${theme} ${name}`;
  const ctx = await b.newContext({ deviceScaleFactor: 2, ...vp });
  const pg = await ctx.newPage();
  pg.errs = [];
  pg.on("pageerror", (e) => pg.errs.push(e.message));
  await pg.goto(`${BASE}/web/agent/demo-penny?demo=penny&theme=${theme}&view=chat`);
  await pg.waitForSelector(".wb-item");
  await pg.waitForTimeout(500);
  const field = pg.getByLabel("Message Penny");
  const shot = async (n) => { if (SHOTS) await pg.screenshot({ path: `${SHOTS}/web-sync-${n}-${name}-${theme}.png` }); };

  // the phone starts a message
  await pg.evaluate(() => window.yuiWebDemo.state.phone("demo-penny", "draft", "milk, eggs and the good bread"));
  await wake(pg);
  await pg.waitForFunction(() => document.querySelector('[aria-label="Message Penny"]')?.value?.includes("good bread"), null, { timeout: 8000 }).catch(() => {});
  ok((await field.inputValue()) === "milk, eggs and the good bread", `${tag}: words typed on the phone are in the web field`);
  await shot("from-phone");

  // the web carries on, and the phone's row follows
  await field.fill("milk, eggs and the good bread, plus oat milk");
  let r = await draftRow(pg, (x) => x.value.endsWith("oat milk") && x.device !== "phone");
  ok(r?.value === "milk, eggs and the good bread, plus oat milk" && r.device !== "phone", `${tag}: words typed on the web reach the phone's row`);

  // sending clears it on both
  await pg.getByTestId("send").click();
  r = await draftRow(pg, (x) => x.value === "");
  ok(r?.value === "" && (await field.inputValue()) === "", `${tag}: sending clears the draft here and on the phone`);

  // the phone clears its own (it sent), and the web follows
  await field.fill("half a thought");
  await pg.waitForTimeout(1200);
  await pg.evaluate(() => window.yuiWebDemo.state.phone("demo-penny", "draft", ""));
  await wake(pg);
  await pg.waitForFunction(() => (document.querySelector('[aria-label="Message Penny"]')?.value ?? "x") === "", null, { timeout: 8000 }).catch(() => {});
  ok((await field.inputValue()) === "", `${tag}: a draft sent from the phone empties the web field`);
  ok(pg.errs.length === 0, `${tag}: no page errors (${pg.errs.join("|").slice(0, 120)})`);
  await ctx.close();
}

await b.close();
console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
