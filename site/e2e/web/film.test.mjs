// YUI-311 e2e: a streamed motion film plays full screen on /web, on the demo relay.
//   npx next start -p 3311 &   then   node e2e/web/film.test.mjs
// The film is the recorded "how a car engine works" run (public/demo/motion/gallery/engine-r1.json), sent as the plugin
// sends it (spec/MOTION.md 0.5): one row per scene, then a closing row. Scene 1 must be playing before scene 2 exists.
import { createRequire } from "node:module";
import { mkdirSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
const { chromium } = createRequire(import.meta.url)(process.env.PLAYWRIGHT || "playwright");
const BASE = process.env.BASE || "http://localhost:3311";
const SHOTS = process.env.SHOTS || "";
if (SHOTS) mkdirSync(SHOTS, { recursive: true });
const film = JSON.parse(readFileSync(fileURLToPath(new URL("../../public/demo/motion/gallery/engine-r1.json", import.meta.url)), "utf8"));
const b = await chromium.launch();
let pass = 0, fail = 0;
const ok = (c, msg) => { if (c) { pass++; console.log("  ok  ", msg); } else { fail++; console.log("  FAIL", msg); } };
const wait = (pg, ms) => pg.waitForTimeout(ms);
const row = (n, s, last = false) => {
  if (!s) return `motion film=e1 part=${n} +last`;
  return `motion${n === 1 ? ' "How a car engine works"' : ""} film=e1 part=${n}\n=== scene ${s.name} ${s.dur} ===\n${s.code}\nend`;
};
const player = (pg) => pg.frames().find((f) => f.url().endsWith("/demo/motion/player.html"));
const scenes = async (pg) => { const f = player(pg); return f ? f.evaluate(() => window.__motion.scenes().length).catch(() => -1) : -1; };

async function start(vp, theme, extra = {}) {
  const ctx = await b.newContext({ viewport: vp, deviceScaleFactor: 2, ...extra });
  const pg = await ctx.newPage();
  pg.errs = [];
  pg.on("pageerror", (e) => pg.errs.push(e.message));
  await pg.goto(`${BASE}/web/agent/demo-penny?demo=penny&theme=${theme}`);
  await pg.waitForSelector("[data-testid=stage-home]");
  await wait(pg, 400);
  return pg;
}
const say = (pg, yl) => pg.evaluate((y) => window.yuiWebDemo.say("demo-penny", y), yl);

for (const theme of ["dark", "light"]) {
  for (const [name, vp, touch] of [["390", { width: 390, height: 844 }, { hasTouch: true, isMobile: true }], ["desktop", { width: 1280, height: 800 }, {}]]) {
    const t = `${theme} ${name}`;
    const pg = await start(vp, theme, touch);
    await pg.locator("[data-testid=stage-type]").click();
    await pg.locator("[data-testid=stage-field] textarea").fill("how a car engine works");
    await pg.keyboard.press("Enter");
    await pg.waitForSelector("[data-testid=stage-working], .ys-play", { timeout: 8000 });

    // MOTION-5: the host says what it is drawing; the stage shows it in a second, in place of "Thinking".
    const word = (pg) => pg.locator("[data-testid=stage-working] .ys-word").innerText().catch(() => "");
    const t0 = Date.now();
    // (the demo host writes its own scripted steps every 700 ms, so the film host's words are re-written until the film lands)
    await pg.evaluate(() => { window.__m5 = setInterval(() => window.yuiWebDemo.doing("demo-penny", "Drawing the first scene"), 100); });
    await pg.waitForFunction(() => /Drawing the first scene/.test(document.querySelector("[data-testid=stage-working] .ys-word")?.textContent || ""), null, { timeout: 3000 });
    const took = Date.now() - t0;
    ok(took < 2500, `${t}: the stage says "Drawing the first scene" ${took} ms after the host writes it (demo pickup 0.5 s + 1 s poll)`);
    if (SHOTS) await pg.screenshot({ path: `${SHOTS}/web-film-working-before-${name}-${theme}.png` });

    // Scene 1 alone: the film is up and playing before the rest is written.
    await pg.evaluate(() => { // the ring is short: watch for the line instead of racing it
      clearInterval(window.__m5);
      window.__ring = "";
      new MutationObserver(() => { const e = document.querySelector("[data-testid=film-working]"); if (e && !window.__ring) window.__ring = e.textContent; }).observe(document.body, { childList: true, subtree: true });
    });
    await say(pg, row(1, film.scenes[0]));
    await pg.waitForSelector("[data-testid=film]", { timeout: 8000 });
    ok(true, `${t}: scene 1 arrives and the film takes the stage`);
    const box = await pg.locator("[data-testid=film]").boundingBox();
    const main = await pg.locator(".wb-main").boundingBox();
    ok(box.width >= main.width - 2 && box.height >= main.height - 2, `${t}: it is full screen (the whole window)`);
    // The ring's wait carries the same words, and they are gone the instant a frame plays.
    ok(/Drawing the first scene/.test(await pg.evaluate(() => window.__ring)), `${t}: the ring says "Drawing the first scene" while scene 1 loads`);
    for (let i = 0; i < 40 && (await scenes(pg)) < 1; i++) await wait(pg, 250);
    ok((await scenes(pg)) === 1, `${t}: the player holds scene 1`);
    for (let i = 0; i < 40 && (await pg.locator(".mfs-wait").count()); i++) await wait(pg, 250);
    ok((await pg.locator(".mfs-wait").count()) === 0, `${t}: scene 1 is on screen (first frame)`);
    ok((await pg.locator("[data-testid=film-working]").count()) === 0, `${t}: the line is gone while scene 1 plays`);
    if (SHOTS) { await wait(pg, 600); await pg.screenshot({ path: `${SHOTS}/web-film-working-playing-${name}-${theme}.png` }); }
    const frame = player(pg);

    // Scene 1 runs out before scene 2 is written: the held last frame says what is being drawn. It never shows while a scene plays.
    let playingWithLine = 0;
    for (let i = 0; i < 80 && !(await pg.locator("[data-testid=film-working]").count()); i++) {
      await wait(pg, 150);
    }
    ok(/Drawing scene 2/.test(await pg.locator("[data-testid=film-working]").innerText().catch(() => "")), `${t}: between scenes it says "Drawing scene 2"`);
    if (SHOTS) await pg.screenshot({ path: `${SHOTS}/web-film-working-between-${name}-${theme}.png` });
    await say(pg, row(2, film.scenes[1]));
    for (let i = 0; i < 20 && (await scenes(pg)) < 2; i++) await wait(pg, 250);
    ok((await scenes(pg)) === 2, `${t}: scene 2 is appended`);
    ok((await pg.locator("[data-testid=film-working]").count()) === 0, `${t}: the line goes the moment scene 2 lands`);
    for (let i = 0; i < 12; i++) { // scene 2 is playing: the line must not come back
      await wait(pg, 150);
      playingWithLine += await pg.locator("[data-testid=film-working]").count();
    }
    ok(playingWithLine === 0, `${t}: no frame of a playing scene has the line on top`);
    for (let i = 0; i < 100 && !(await pg.locator("[data-testid=film-working]").count()); i++) await wait(pg, 150);
    ok(/Drawing scene 3/.test(await pg.locator("[data-testid=film-working]").innerText().catch(() => "")), `${t}: and it updates to "Drawing scene 3"`);

    // Later scenes append to the same player, which is not rebuilt.
    ok(player(pg) === frame, `${t}: the same player took it (no restart)`);
    await say(pg, row(3, film.scenes[2]));
    await say(pg, row(4, null));
    for (let i = 0; i < 20 && (await scenes(pg)) < 3; i++) await wait(pg, 250);
    ok((await scenes(pg)) === 3, `${t}: scene 3 is appended, then the closing row`);
    ok(await pg.locator("[data-testid=film]").count() === 1, `${t}: still one film up`);
    if (SHOTS) { await wait(pg, 1200); await pg.screenshot({ path: `${SHOTS}/web-film-${name}-${theme}.png` }); }

    // Close returns to the stage; the record keeps one line and a chip.
    await pg.locator("[data-testid=film-close]").click();
    await wait(pg, 400);
    ok(await pg.locator("[data-testid=film]").count() === 0, `${t}: Close returns to the stage`);
    ok(await pg.locator("[data-testid=stage]").isVisible(), `${t}: the stage is under it`);
    await pg.locator("[data-testid=stage-record]").click();
    await pg.waitForSelector("[data-testid=film-line]");
    ok(await pg.locator("[data-testid=film-line]").count() === 1, `${t}: the chat keeps one line for the film, not one per scene`);
    ok(await pg.locator("[data-testid=film-replay-chip]").count() === 1, `${t}: and one chip to watch again`);
    await pg.locator("[data-testid=film-replay-chip]").click();
    await pg.waitForSelector("[data-testid=film]");
    ok(true, `${t}: the chip plays it again`);
    for (let i = 0; i < 40 && (await scenes(pg)) < 3; i++) await wait(pg, 250);
    ok((await scenes(pg)) === 3, `${t}: the replay holds all three scenes`);
    await pg.keyboard.press("Escape");
    await wait(pg, 300);
    ok(await pg.locator("[data-testid=film]").count() === 0, `${t}: Esc closes it`);
    ok(pg.errs.length === 0, `${t}: no page errors ${pg.errs.join("|")}`);
    await pg.context().close();
  }
}

// A motion ask with no film (a plugin from before MOTION-1e): a sketch, never the raw line.
{
  const pg = await start({ width: 390, height: 844 }, "dark", { hasTouch: true, isMobile: true });
  await pg.locator("[data-testid=stage-type]").click();
  await pg.locator("[data-testid=stage-field] textarea").fill("how a heart works");
  await pg.keyboard.press("Enter");
  await pg.waitForSelector("[data-testid=stage-working], .ys-play", { timeout: 8000 });
  await say(pg, 'motion "How a heart pumps blood"');
  await pg.locator("[data-testid=stage-record]").click();
  await pg.waitForSelector(".yl-skwin, .yl-sketch, [class*=yl-sk]", { timeout: 6000 });
  const text = await pg.locator(".wb-messages").innerText();
  ok(!/motion\s+"/.test(text) && !text.includes("```"), "old plugin: the raw motion line is never shown");
  ok(text.includes("How a heart pumps blood"), "old plugin: the ask is on screen, as a sketch");
  ok(await pg.locator("[data-testid=film]").count() === 0, "old plugin: no film is opened");
  await pg.locator("[class*=yl-sk]").first().scrollIntoViewIfNeeded();
  if (SHOTS) await pg.screenshot({ path: `${SHOTS}/web-film-asksketch-390-dark.png` });
  await pg.context().close();
}

// Reduce Motion: a still frame per scene with its caption, and no moving player controls.
for (const theme of ["dark", "light"]) {
  const pg = await start({ width: 390, height: 844 }, theme, { hasTouch: true, isMobile: true, reducedMotion: "reduce" });
  await pg.locator("[data-testid=stage-type]").click();
  await pg.locator("[data-testid=stage-field] textarea").fill("how a car engine works");
  await pg.keyboard.press("Enter");
  await pg.waitForSelector("[data-testid=stage-working], .ys-play", { timeout: 8000 });
  for (const [i, s] of film.scenes.slice(0, 3).entries()) await say(pg, row(i + 1, s));
  await say(pg, row(4, null));
  await pg.waitForSelector("[data-testid=film-still]", { timeout: 8000 });
  const cap1 = (await pg.locator(".mfs-cap").innerText()).trim();
  ok(cap1.length > 0, `reduced ${theme}: scene 1 shows its caption (${cap1})`);
  ok(await pg.locator("[data-testid=film-pause]").count() === 0, `reduced ${theme}: no pause or replay, nothing moves`);
  await pg.locator(".mfs-nav button").last().click();
  await wait(pg, 400);
  const cap2 = (await pg.locator(".mfs-cap").innerText()).trim();
  ok(cap2 !== cap1, `reduced ${theme}: the next still has its own caption (${cap2})`);
  if (SHOTS) { await wait(pg, 800); await pg.screenshot({ path: `${SHOTS}/web-film-reduced-390-${theme}.png` }); }
  await pg.context().close();
}

await b.close();
console.log(`${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
