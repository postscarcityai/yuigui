// YUI-249 demo clip: a message started on the phone is finished on the web. The demo relay stands in for the
// account (the phone's words arrive as yui_sync_state rows would). Writes the webm Playwright records;
// ffmpeg turns it into the site clip.   BASE=... PLAYWRIGHT=... OUT=/tmp/yui249 node e2e/web/record-sync.mjs
import { createRequire } from "node:module";
import { mkdirSync, readdirSync, renameSync } from "node:fs";
const { chromium } = createRequire(import.meta.url)(process.env.PLAYWRIGHT || "playwright");
const BASE = process.env.BASE || "http://localhost:3244";
const OUT = process.env.OUT || "/tmp/yui249";
mkdirSync(OUT, { recursive: true });
const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true, deviceScaleFactor: 2, recordVideo: { dir: OUT, size: { width: 390, height: 844 } } });
const pg = await ctx.newPage();
await pg.goto(`${BASE}/web/agent/demo-penny?demo=penny&theme=dark&view=chat`);
await pg.waitForSelector(".wb-item");
const caption = (t) => pg.evaluate((t) => {
  let el = document.getElementById("clip-cap");
  if (!el) { el = document.createElement("div"); el.id = "clip-cap"; el.style.cssText = "position:fixed;left:12px;right:12px;top:calc(env(safe-area-inset-top,0px) + 74px);z-index:99;padding:8px 12px;border-radius:12px;background:#ff7e8a;color:#201a30;font:600 14px system-ui;text-align:center"; document.body.appendChild(el); }
  el.textContent = t;
}, t);
const wake = () => pg.evaluate(() => window.dispatchEvent(new Event("focus")));
await pg.waitForTimeout(1200);
await caption("On the iPhone (demo): you start a message");
const words = ["milk", "milk, eggs", "milk, eggs and the good", "milk, eggs and the good bread"];
for (const w of words) { await pg.evaluate((w) => window.yuiWebDemo.state.phone("demo-penny", "draft", w), w); await pg.waitForTimeout(500); }
await pg.waitForTimeout(600);
await caption("In the browser: the same words are here");
await wake();
await pg.waitForFunction(() => document.querySelector('[aria-label="Message Penny"]')?.value?.includes("good bread"), null, { timeout: 8000 });
await pg.waitForTimeout(1800);
await caption("Keep typing here");
const field = pg.getByLabel("Message Penny");
await field.click();
await pg.keyboard.press("End");
await pg.keyboard.type(", plus oat milk", { delay: 70 });
await pg.waitForTimeout(1200);
await caption("Send. The draft is cleared on both");
await pg.getByTestId("send").click();
await pg.waitForTimeout(2500);
await pg.close();
await ctx.close();
await b.close();
const f = readdirSync(OUT).find((x) => x.endsWith(".webm"));
renameSync(`${OUT}/${f}`, `${OUT}/yui249-continue.webm`);
console.log(`${OUT}/yui249-continue.webm`);
