// Film /web for 14-yui-on-the-web: the demo account on a prod build (no sign in, no network), a laptop window and
// a phone window doing the same things. Out: work/raw/<scene>.webm, then work/frames/<scene>/f%05d.jpg at 30 fps.
//   cd site && npm run build && npx next start -p 3260 &
//   BASE=http://localhost:3260 PLAYWRIGHT=playwright node videos/14-yui-on-the-web/record.mjs
import { createRequire } from "node:module";
import { mkdirSync, readdirSync, renameSync, rmSync, writeFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
const here = dirname(fileURLToPath(import.meta.url));
const { chromium } = createRequire(import.meta.url)(process.env.PLAYWRIGHT || "playwright");
const BASE = process.env.BASE || "http://localhost:3260";
const RAW = join(here, "work/raw"), FR = join(here, "work/frames");
mkdirSync(RAW, { recursive: true }); mkdirSync(FR, { recursive: true });
const VIEWS = {
  laptop: { viewport: { width: 1280, height: 800 }, ctx: {} },
  phone: { viewport: { width: 390, height: 844 }, ctx: { hasTouch: true, isMobile: true } },
};
const b = await chromium.launch();
const counts = {}, marks = {};
let cur = null;
const mark = () => { marks[cur.scene] = +((Date.now() - cur.t0) / 1000).toFixed(2); };

async function film(scene, view, play) {
  const v = VIEWS[view], dir = join(RAW, `${scene}-tmp`);
  rmSync(dir, { recursive: true, force: true });
  const ctx = await b.newContext({ viewport: v.viewport, deviceScaleFactor: 1, recordVideo: { dir, size: v.viewport }, ...v.ctx });
  cur = { scene, t0: Date.now() };
  const pg = await ctx.newPage();
  await play(pg);
  await ctx.close();
  const [f] = readdirSync(dir);
  renameSync(join(dir, f), join(RAW, `${scene}.webm`));
  rmSync(dir, { recursive: true, force: true });
  const out = join(FR, scene);
  rmSync(out, { recursive: true, force: true }); mkdirSync(out, { recursive: true });
  execFileSync("ffmpeg", ["-v", "error", "-y", "-i", join(RAW, `${scene}.webm`), "-vf", "fps=30", "-q:v", "3", join(out, "f%05d.jpg")]);
  counts[scene] = readdirSync(out).length;
  console.log(scene, counts[scene], "frames");
}
const wait = (pg, ms) => pg.waitForTimeout(ms);

// Open: the last chat is already there (a long one), scroll back past 100 rows; on the phone a group chat drawn at once.
const openChat = (pg) => (async () => {
  await pg.goto(`${BASE}/web/agent/demo-penny?demo=penny&theme=light&view=chat&demohistory=250`);
  await pg.waitForSelector(".wb-item");
  mark(pg);
  await wait(pg, 2200);
  await pg.evaluate(() => { let e = document.querySelector(".wb-messages"); while (e && e.scrollHeight <= e.clientHeight + 1) e = e.parentElement; window.__sc = e; });
  for (let i = 0; i < 26; i++) { await pg.mouse.move(400, 400); await pg.mouse.wheel(0, -520); await wait(pg, 190); }
  await wait(pg, 2400);
})();
const openGroup = (pg) => (async () => {
  await pg.goto(`${BASE}/web/group/demo-group-week?demo=penny&theme=light`);
  await pg.waitForSelector("[data-testid=group-thread]");
  mark(pg);
  await wait(pg, 3600);
  for (let i = 0; i < 8; i++) { await pg.mouse.move(180, 400); await pg.mouse.wheel(0, -260); await wait(pg, 300); }
  await wait(pg, 2200);
})();

// Dismiss: a Needs you row goes away with one tap, and stays gone.
const dismiss = (pg) => (async () => {
  await pg.goto(`${BASE}/web/agent/demo-penny?demo=penny&theme=light`);
  await pg.waitForSelector("[data-testid=stage-home]");
  await wait(pg, 1600);
  mark(pg);
  await wait(pg, 2600);
  await pg.getByTestId("home-dismiss-need-t_0a0b0c").click();
  await wait(pg, 3200);
})();

// Ask: a chip on the stage, the reply plays and draws a screen.
const ask = (pg) => (async () => {
  await pg.goto(`${BASE}/web/agent/demo-penny?demo=penny&theme=light`);
  await pg.waitForSelector("[data-testid=stage-home]");
  await wait(pg, 1800);
  mark(pg);
  await wait(pg, 800);
  await pg.locator(".wb-chip", { hasText: "Plan my week" }).click();
  await pg.waitForFunction(() => /Friday is the rest day/.test(document.querySelector("[data-testid=stage]")?.innerText || ""), null, { timeout: 25000 });
  await wait(pg, 2600);
  await pg.locator(".wb-pill", { hasText: "Runs this month" }).click();
  await wait(pg, 2600);
})();

for (const [scene, view, play] of [["open-laptop", "laptop", openChat], ["open-phone", "phone", openGroup], ["dismiss-laptop", "laptop", dismiss], ["dismiss-phone", "phone", dismiss], ["ask-laptop", "laptop", ask], ["ask-phone", "phone", ask]]) await film(scene, view, play);
writeFileSync(join(here, "work/frames.js"), `window.FRAMES = ${JSON.stringify(counts)};\nwindow.MARKS = ${JSON.stringify(marks)};\n`);
await b.close();
