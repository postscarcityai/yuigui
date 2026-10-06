// YUI-307 e2e: a deck on the web stage is one drawing that morphs between pages: no card border, no dots, no arrows,
// no side margin; a shape with the same @id keeps one DOM node across a page turn; a swipe scrubs, the tap zones turn
// pages (left third back); Reduce Motion cross-fades. The demo relay, no sign in, no network.
//   npx next build && npx next start -p 3307 &   then   node e2e/web/deckmorph.test.mjs
// BASE overrides the origin, PLAYWRIGHT the Playwright module, SHOTS the folder for 390 px and desktop shots.
import { createRequire } from "node:module";
import { mkdirSync } from "node:fs";
const { chromium } = createRequire(import.meta.url)(process.env.PLAYWRIGHT || "playwright");
const BASE = process.env.BASE || "http://localhost:3307";
const SHOTS = process.env.SHOTS || "";
if (SHOTS) mkdirSync(SHOTS, { recursive: true });
const b = await chromium.launch();
let pass = 0, fail = 0;
const ok = (c, msg) => { if (c) { pass++; console.log("  ok  ", msg); } else { fail++; console.log("  FAIL", msg); } };

const DECK = `deck "Orbits"
page "The sun and us"
shapes
shape@sun circle Sun at=3,3 size=3 tone=butter +fill
shape@earth circle Earth at=7.5,3 size=1.4 tone=mint
shape arrow from=sun to=earth
page "Earth and the moon"
shapes
shape@earth circle Earth at=3,3 size=2.6 tone=mint +fill
shape@moon circle Moon at=7,2 size=1 tone=lavender
shape arrow from=earth to=moon
page "Why it matters"
shapes
shape@earth circle Earth at=5,3 size=3 tone=mint
shape text Home at=5,5.2`;

async function open(vp, theme, extra = {}) {
  const ctx = await b.newContext({ viewport: vp, deviceScaleFactor: 2, ...extra });
  const pg = await ctx.newPage();
  pg.errs = [];
  pg.on("pageerror", (e) => pg.errs.push(e.message));
  await pg.goto(`${BASE}/web/agent/demo-penny?demo=penny&theme=${theme}`);
  await pg.waitForSelector("[data-testid=stage-home]");
  await pg.waitForTimeout(500);
  await pg.evaluate((y) => window.yuiWebDemo.say("demo-penny", y, {}), DECK);
  await pg.waitForSelector("[data-testid=deck-stage]", { timeout: 15000 });
  await pg.waitForTimeout(1800); // the first page draws itself on
  return pg;
}
const title = (pg) => pg.locator(".md-page[data-on] .md-title").innerText();
const settle = (pg) => pg.waitForTimeout(1600);

for (const theme of ["dark", "light"]) {
  for (const [name, vp, touch] of [["390", { width: 390, height: 844 }, { hasTouch: true, isMobile: true }], ["desktop", { width: 1280, height: 800 }, {}]]) {
    const t = `${theme} ${name}`;
    const pg = await open(vp, theme, touch);
    const tap = async (f) => {
      const r = await pg.locator(".md-deck").boundingBox();
      const x = r.x + r.width * f, y = r.y + r.height * 0.5;
      if (touch.hasTouch) await pg.touchscreen.tap(x, y); else await pg.mouse.click(x, y);
    };

    // ---------- no card, no dots, no side margin ----------
    const chrome = await pg.evaluate(() => {
      const d = document.querySelector("[data-testid=deck-stage]");
      const play = d.closest(".ys-play");
      const cs = getComputedStyle(d);
      const rs = d.getBoundingClientRect(), ps = play.getBoundingClientRect(), sv = d.querySelector("svg").getBoundingClientRect();
      return {
        border: ["Top", "Right", "Bottom", "Left"].map((s) => cs[`border${s}Width`]).join(" "), shadow: cs.boxShadow, bg: cs.backgroundColor,
        dots: play.querySelectorAll(".yl-gdots, .ys-segs, .yl-deckbar, .ys-nav, .yl-slidebox, .yl-deckfoot, .ys-pic").length,
        left: Math.round(rs.left - ps.left), right: Math.round(ps.right - rs.right), svgLeft: Math.round(sv.left - ps.left), svgRight: Math.round(ps.right - sv.right),
      };
    });
    ok(/^0px 0px 0px 0px$/.test(chrome.border) && chrome.shadow === "none" && chrome.bg === "rgba(0, 0, 0, 0)", `${t}: the deck has no card border, shadow or fill (${chrome.border})`);
    ok(chrome.dots === 0, `${t}: no dots, segments, arrows or slide box`);
    ok(chrome.left === 0 && chrome.right === 0 && chrome.svgLeft === 0 && chrome.svgRight === 0, `${t}: the drawing runs edge to edge (no side margin)`);
    ok(await title(pg) === "The sun and us", `${t}: it opens on the first page`);
    ok(await pg.locator("[data-testid=deck-drawing] [data-ink]").count() >= 3, `${t}: the drawing is on the stage (sun, earth, arrow)`);
    ok(await pg.locator("button[aria-label='Previous page']").count() === 1 && await pg.locator("button[aria-label='Next page']").count() === 1, `${t}: the page-turn halves carry their labels`);
    if (SHOTS) await pg.screenshot({ path: `${SHOTS}/web-deck-page1-${name}-${theme}.png` });

    // ---------- one DOM node per @id across a page turn ----------
    await pg.evaluate(() => { document.querySelector("[data-ink='@earth']").dataset.mark = "kept"; });
    ok(await pg.locator("[data-ink='@earth']").count() === 1, `${t}: the earth is one node on page 1`);
    await tap(0.8);
    await pg.waitForTimeout(400); // halfway through the spring
    if (SHOTS) await pg.screenshot({ path: `${SHOTS}/web-deck-morph-${name}-${theme}.png` });
    ok(await pg.locator("[data-ink='@earth']").count() === 1 && await pg.locator("[data-ink='@earth']").getAttribute("data-mark") === "kept", `${t}: mid-turn the earth is the same node`);
    await settle(pg);
    ok(await title(pg) === "Earth and the moon", `${t}: a tap on the right turns the page`);
    ok(await pg.locator("[data-ink='@earth']").count() === 1 && await pg.locator("[data-ink='@earth']").getAttribute("data-mark") === "kept", `${t}: after the turn the earth is still the same node`);
    ok(await pg.locator("[data-ink='@sun']").count() === 0 && await pg.locator("[data-ink='@moon']").count() === 1, `${t}: the sun left, the moon came on`);
    if (SHOTS) await pg.screenshot({ path: `${SHOTS}/web-deck-page2-${name}-${theme}.png` });

    // ---------- a swipe scrubs the drawing, and settles ----------
    const r = await pg.locator(".md-deck").boundingBox();
    const y = r.y + r.height * 0.3;
    await pg.mouse.move(r.x + r.width * 0.8, y);
    await pg.mouse.down();
    await pg.mouse.move(r.x + r.width * 0.55, y, { steps: 6 });
    await pg.waitForTimeout(150);
    const early = await pg.locator("[data-ink='@earth'] path").first().getAttribute("d");
    await pg.mouse.move(r.x + r.width * 0.45, y, { steps: 4 });
    await pg.waitForTimeout(150);
    const later = await pg.locator("[data-ink='@earth'] path").first().getAttribute("d");
    ok(early !== later, `${t}: the drawing follows the finger mid swipe`);
    await pg.mouse.up();
    await settle(pg);
    ok(await title(pg) === "Why it matters", `${t}: a swipe past halfway lands on the next page`);
    // a short swipe springs back
    await pg.mouse.move(r.x + r.width * 0.5, y);
    await pg.mouse.down();
    await pg.mouse.move(r.x + r.width * 0.56, y, { steps: 4 });
    await pg.mouse.up();
    await settle(pg);
    ok(await title(pg) === "Why it matters", `${t}: a small drag springs back to the page`);

    // ---------- the left third goes back ----------
    await tap(0.15);
    await settle(pg);
    ok(await title(pg) === "Earth and the moon", `${t}: a tap on the left third goes back (YUI-288)`);
    await tap(0.5);
    await settle(pg);
    ok(await title(pg) === "Why it matters", `${t}: a tap in the middle goes on`);
    ok(await pg.locator("button[aria-label='Next page']").isDisabled(), `${t}: the last page has nowhere further to turn`);
    ok(pg.errs.length === 0, `${t}: no page errors ${pg.errs.join(" | ")}`);
    await pg.context().close();
  }
}

// ---------- Reduce Motion cross-fades: nothing moves, nothing breathes ----------
{
  const pg = await open({ width: 390, height: 844 }, "dark", { hasTouch: true, isMobile: true, reducedMotion: "reduce" });
  const d = () => pg.locator("[data-ink='@earth'] path").first().getAttribute("d");
  const a = await d();
  await pg.waitForTimeout(700);
  ok(a === await d(), "reduced motion: the drawing at rest does not breathe");
  const r = await pg.locator(".md-deck").boundingBox();
  await pg.touchscreen.tap(r.x + r.width * 0.8, r.y + r.height * 0.5);
  await pg.waitForTimeout(900);
  ok(await title(pg) === "Earth and the moon", "reduced motion: the page still turns");
  ok(await pg.locator("[data-ink='@sun']").count() === 0, "reduced motion: the old page is gone once the fade is done");
  await pg.context().close();
}

await b.close();
console.log(`${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
