// Film /web for 14-yui-on-the-web: the demo account on a prod build (no sign in, no network), a laptop window and
// a phone window doing the same two things. Out: work/raw/<scene>.webm, then work/frames/<scene>/f%05d.jpg at 30 fps.
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
const counts = {};

async function film(scene, view, play) {
  const v = VIEWS[view], dir = join(RAW, `${scene}-tmp`);
  rmSync(dir, { recursive: true, force: true });
  const ctx = await b.newContext({ viewport: v.viewport, deviceScaleFactor: 1, recordVideo: { dir, size: v.viewport }, ...v.ctx });
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

// Ask: a chip on the stage, the reply plays, a second screen.
const ask = (pg) => (async () => {
  await pg.goto(`${BASE}/web/agent/demo-penny?demo=penny&theme=light`);
  await pg.waitForSelector("[data-testid=stage-home]");
  await wait(pg, 1800);
  await pg.locator(".wb-chip", { hasText: "Plan my week" }).click();
  await pg.waitForFunction(() => /Friday is the rest day/.test(document.querySelector("[data-testid=stage]")?.innerText || ""), null, { timeout: 25000 });
  await wait(pg, 2600);
  await pg.locator(".wb-pill", { hasText: "Runs this month" }).click();
  await wait(pg, 2600);
})();

// Look: Yui offers a new look, Use wears it, the chrome follows.
const look = (pg) => (async () => {
  await pg.goto(`${BASE}/web/agent/demo-penny?demo=penny&theme=light&view=chat`);
  await pg.waitForSelector(".wb-thread[data-loaded='1']");
  await wait(pg, 1500);
  const n = await pg.locator(".wb-item").count();
  await pg.evaluate(() => window.yuiWebDemo.say("demo-penny", "say \"Here is a warmer look.\"\ntheme app autumn"));
  await pg.waitForFunction((k) => document.querySelectorAll(".wb-item").length > k, n, { timeout: 15000 });
  await pg.waitForSelector("[data-testid=restyle-card]");
  await pg.locator("[data-testid=restyle-card]").scrollIntoViewIfNeeded();
  await wait(pg, 2600);
  await pg.locator("[data-testid=restyle-card] .rs-go").click();
  await wait(pg, 3000);
})();

for (const [scene, view, play] of [["ask-laptop", "laptop", ask], ["ask-phone", "phone", ask], ["look-laptop", "laptop", look], ["look-phone", "phone", look]]) await film(scene, view, play);
writeFileSync(join(here, "work/frames.js"), `window.FRAMES = ${JSON.stringify(counts)};\n`);
await b.close();
