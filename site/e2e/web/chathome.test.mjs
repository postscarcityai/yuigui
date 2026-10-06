// YUI-315 e2e: /playground?demo=chat-is-home plays the real web thread on a script and loops. A plain answer and a choose stay in
// the chat, a sketch takes the stage, a deck and timers take it in turn, the older timers fold into ONE chip, a tap on it opens
// them in place. Plays twice, dark and light, and Reduce Motion gets the still end state.
//   npx next build && npx next start -p 3315 &   then   node e2e/web/chathome.test.mjs   (SHOTS=<dir> keeps stills)
import { createRequire } from "node:module";
import { mkdirSync } from "node:fs";
const { chromium } = createRequire(import.meta.url)(process.env.PLAYWRIGHT || "playwright");
const BASE = process.env.BASE || "http://localhost:3315";
const SHOTS = process.env.SHOTS || "";
if (SHOTS) mkdirSync(SHOTS, { recursive: true });
const b = await chromium.launch();
let pass = 0, fail = 0;
const ok = (c, msg) => { if (c) { pass++; console.log("  ok  ", msg); } else { fail++; console.log("  FAIL", msg); } };
// Next preloads a lazy chunk with a link the nonce policy refuses, on every /web page (the stock demo too). Not this demo's.
const known = (t) => /rel=preload|Loading the script '.*\/_next\/static\/chunks\/[\w.-]+\.js' violates/.test(t);

const frameOf = (pg) => pg.frames().find((f) => f !== pg.mainFrame());
const until = async (pg, fn, label, ms = 30000) => {
  const t0 = Date.now();
  while (Date.now() - t0 < ms) {
    const f = frameOf(pg);
    const r = f ? await f.evaluate(fn).catch(() => null) : null;
    if (r) return r;
    await pg.waitForTimeout(150);
  }
  ok(false, `timed out: ${label}`);
  return null;
};
const phone = (pg, name) => SHOTS ? pg.waitForTimeout(500).then(() => pg.locator(".pg-phone").screenshot({ path: `${SHOTS}/${name}.png` })) : null;

for (const theme of ["dark", "light"]) {
  const ctx = await b.newContext({ viewport: { width: 1100, height: 1000 }, deviceScaleFactor: 2 });
  const pg = await ctx.newPage();
  const errs = [];
  pg.on("pageerror", (e) => errs.push(e.message));
  pg.on("console", (m) => m.type() === "error" && !known(m.text()) && errs.push(m.text()));
  await pg.goto(`${BASE}/playground?demo=chat-is-home${theme === "light" ? "&theme=light" : ""}`);
  await pg.locator(".pg-phone").scrollIntoViewIfNeeded();
  for (const round of [0, 1]) {
    const tag = `${theme} round ${round + 1}`;
    await until(pg, () => !!document.querySelector("[data-testid=stage-home]"), `${tag}: starts on the stage home`, 15000);
    // (1) a plain answer stays in the chat.
    await until(pg, () => /Build 160/.test(document.querySelector(".wb-thread")?.innerText || "") && !document.querySelector("[data-testid=stage]"), `${tag}: plain answer`);
    const plain = await frameOf(pg).evaluate(() => ({ chat: /Build 160/.test(document.querySelector(".wb-thread").innerText), stage: !!document.querySelector("[data-testid=stage]") }));
    ok(plain.chat && !plain.stage, `${tag}: a plain answer is in the chat and no stage is up`);
    if (round === 0) await phone(pg, `plain-answer-${theme}`);
    // (2) a choose stays in the chat too.
    const choose = await until(pg, () => /Only if it breaks/.test(document.querySelector(".wb-thread")?.innerText || "") && !document.querySelector("[data-testid=stage]"), `${tag}: choose`);
    ok(!!choose, `${tag}: a choose stays in the chat`);
    // (3) a sketch takes the stage.
    const sketch = await until(pg, () => !!document.querySelector("[data-testid=stage] [data-testid=sketch-phone], [data-testid=stage] .ys-play") && !!document.querySelector("[data-testid=stage]"), `${tag}: sketch on stage`);
    ok(!!sketch, `${tag}: a sketch takes the stage`);
    await pg.waitForTimeout(1200);
    if (round === 0) await phone(pg, `visual-on-stage-${theme}`);
    // (4) the older timers fold into ONE chip, the stage gives way to the chat record.
    const chip = await until(pg, () => { const c = document.querySelectorAll("[data-testid=stage-fold-chip]"); return c.length === 1 && /earlier screens/.test(c[0].innerText) ? c[0].innerText : null; }, `${tag}: fold chip`, 40000);
    ok(!!chip, `${tag}: ONE fold chip in the thread (${chip})`);
    if (round === 0) await phone(pg, `fold-chip-${theme}`);
    // (5) the script taps it: the folded replies open in place.
    const open = await until(pg, () => document.querySelector("[data-testid=stage-fold-chip]")?.getAttribute("aria-expanded") === "true" && !document.querySelector("[data-testid=stage]"), `${tag}: chip opens`, 15000);
    ok(!!open, `${tag}: a tap on the chip opens the folded replies in place`);
    if (round === 0) await phone(pg, `fold-chip-open-${theme}`);
    // (6) it loops: the next round starts from the stage home with a fresh thread.
    if (round === 0) await pg.waitForFunction(() => document.querySelector("[data-testid=chathome]")?.dataset.round === "1", null, { timeout: 15000 }).catch(() => ok(false, `${theme}: it loops`));
  }
  ok(errs.length === 0, `${theme}: no console or page errors ${errs.join("|")}`);
  await ctx.close();
}

// Reduce Motion: no script, the still end state (every reply in the thread, the chip open).
{
  const ctx = await b.newContext({ viewport: { width: 1100, height: 1000 }, deviceScaleFactor: 2, reducedMotion: "reduce" });
  const pg = await ctx.newPage();
  await pg.goto(`${BASE}/playground?demo=chat-is-home`);
  await pg.locator(".pg-phone").scrollIntoViewIfNeeded();
  const still = await until(pg, () => document.querySelector("[data-testid=stage-fold-chip]")?.getAttribute("aria-expanded") === "true" && !document.querySelector("[data-testid=stage]") ? document.querySelectorAll(".wb-item").length : null, "still end state", 20000);
  ok(!!still, `reduced motion: the still end state, chip open (${still} rows)`);
  await pg.waitForTimeout(6000);
  ok(await pg.evaluate(() => document.querySelector("[data-testid=chathome]").dataset.round) === "0", "reduced motion: it does not loop");
  await phone(pg, "reduced-motion-still");
  await ctx.close();
}
await b.close();
console.log(`${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
