// YUI-282: tap-to-frame and swipe-to-frame on /web, 390 wide, 4x CPU, prod build. Not a test, a timer.
//   npx next start -p 3282 &   then   node e2e/web/switch-bench.mjs   (BASE, PLAYWRIGHT as in the other files)
// Prints the p50 of each run of 20 switches, then the median of those p50s, for the pill tap, the swipe
// (finger lift to the frame that shows the new screen) and one drag step (touchmove to the next frame).
import { createRequire } from "node:module";
const { chromium } = createRequire(import.meta.url)(process.env.PLAYWRIGHT || "playwright");
const BASE = process.env.BASE || "http://localhost:3282";
const RUNS = +(process.env.RUNS || 5), N = +(process.env.N || 20);
const med = (a) => { const s = [...a].sort((x, y) => x - y); return s[Math.floor(s.length / 2)]; };
const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, hasTouch: true, isMobile: true });
const pg = await ctx.newPage();
await pg.goto(`${BASE}/web/agent/demo-penny?demo=penny&theme=${process.env.THEME || "light"}`);
await pg.waitForSelector("[data-testid=stage-home]");
await pg.waitForTimeout(1500);
const cdp = await ctx.newCDPSession(pg);
await cdp.send("Emulation.setCPUThrottlingRate", { rate: 4 });
// Resolves with ms from the tap on the other pill to the first frame where the filled pill changed.
const tap = () => pg.evaluate(() => {
  const on = () => document.querySelector(".wb-pill.on")?.textContent;
  const before = on(), t0 = performance.now();
  let commit = -1;
  const mo = new MutationObserver(() => { if (commit < 0) commit = performance.now() - t0; });
  mo.observe(document.querySelector(".wb-stage"), { attributes: true, subtree: true, childList: true });
  [...document.querySelectorAll(".wb-pill")].find((p) => !p.classList.contains("on")).click();
  return new Promise((res) => { const tick = () => { if (on() !== before) requestAnimationFrame(() => requestAnimationFrame(() => { mo.disconnect(); res({ frame: performance.now() - t0, commit }); })); else requestAnimationFrame(tick); }; tick(); });
});
const touch = (type, x) => cdp.send("Input.dispatchTouchEvent", { type, touchPoints: type === "touchEnd" ? [] : [{ x, y: 400 }] });
const out = { pill: [], swipe: [], drag: [], commit: [] };
for (let r = 0; r < RUNS; r++) {
  const pill = [], swipe = [], drag = [], commits = [];
  for (let i = 0; i < N; i++) {
    { const r = await tap(); pill.push(r.frame); commits.push(r.commit); }
    await pg.waitForTimeout(700);
  }
  for (let i = 0; i < N; i++) {
    const home = await pg.evaluate(() => document.querySelector(".wb-pill.on")?.textContent === "Home");
    const [from, to] = home ? [330, 60] : [60, 330];
    await touch("touchStart", from);
    for (let k = 1; k <= 6; k++) {
      // Main-thread work one finger move starts: from the page's touchmove listener to the last DOM change it caused (0 = nothing re-rendered).
      const cost = pg.evaluate(() => new Promise((res) => {
        let t0 = -1, last = 0;
        const mo = new MutationObserver(() => { if (t0 >= 0) last = performance.now() - t0; });
        mo.observe(document.querySelector(".wb-stage"), { attributes: true, subtree: true, childList: true, characterData: true });
        const on = () => { t0 = performance.now(); window.removeEventListener("touchmove", on, true); };
        window.addEventListener("touchmove", on, true);
        setTimeout(() => { mo.disconnect(); window.removeEventListener("touchmove", on, true); res(last); }, 120);
      }));
      await touch("touchMove", from + ((to - from) * k) / 8);
      drag.push(await cost);
    }
    await touch("touchMove", from + ((to - from) * 7) / 8);
    // The finger lifts: time from touchEnd to the frame that shows the new screen.
    const lift = pg.evaluate(() => new Promise((res) => { const before = document.querySelector(".wb-pill.on")?.textContent, t0 = performance.now();
      const tick = () => { if (document.querySelector(".wb-pill.on")?.textContent !== before) requestAnimationFrame(() => requestAnimationFrame(() => res(performance.now() - t0))); else requestAnimationFrame(tick); }; tick(); }));
    await touch("touchEnd");
    swipe.push(await lift);
    await pg.waitForTimeout(700);
  }
  out.pill.push(med(pill)); out.swipe.push(med(swipe)); out.drag.push(med(drag)); out.commit.push(med(commits));
  console.log(`run ${r + 1}: pill p50 ${med(pill).toFixed(0)} ms, swipe p50 ${med(swipe).toFixed(0)} ms, drag step p50 ${med(drag).toFixed(1)} ms, tap-to-commit p50 ${med(commits).toFixed(1)} ms`);
}
console.log(`MEDIAN of ${RUNS} runs of ${N}: pill ${med(out.pill).toFixed(0)} ms, swipe ${med(out.swipe).toFixed(0)} ms, drag step ${med(out.drag).toFixed(1)} ms, tap-to-commit ${med(out.commit).toFixed(1)} ms`);
await b.close();
