// YUI-289 e2e: an unnamed 3-page plan on the /web stage keeps what was typed and tapped across a reload (390 + desktop, light + dark).
//   npx next build && npx next start -p 3289 &   then   node e2e/web/stagekept.test.mjs
// BASE overrides the origin, PLAYWRIGHT the Playwright module, SHOTS the folder for the shots (dark first, then light).
import { createRequire } from "node:module";
import { mkdirSync } from "node:fs";
const { chromium } = createRequire(import.meta.url)(process.env.PLAYWRIGHT || "playwright");
const BASE = process.env.BASE || "http://localhost:3289";
const SHOTS = process.env.SHOTS || "";
if (SHOTS) mkdirSync(SHOTS, { recursive: true });
const b = await chromium.launch();
let pass = 0, fail = 0;
const ok = (c, msg) => { if (c) { pass++; console.log("  ok  ", msg); } else { fail++; console.log("  FAIL", msg); } };

// No ids: the agent named nothing, so each part is only its place in the reply (n1, n2...).
const PLAN = `plan "Trip" submit="Send"
choose "Size?" S|M|L
form "About you" name:text! notes:long
slide "Budget" 0-100 value=40 step=5
end`;

async function open(ctx, theme) {
  const pg = await ctx.newPage();
  pg.errs = [];
  pg.setDefaultTimeout(8000);
  pg.on("pageerror", (e) => pg.errs.push(e.message));
  await pg.goto(`${BASE}/web/agent/demo-penny?demo=penny&theme=${theme}&view=chat`);
  await pg.waitForSelector(".wb-thread[data-loaded='1']");
  await pg.waitForTimeout(500);
  return pg;
}
async function say(pg, yl) {
  const n = await pg.locator(".wb-item").count();
  await pg.evaluate((y) => window.yuiWebDemo.say("demo-penny", y, {}), yl);
  await pg.waitForFunction((k) => document.querySelectorAll(".wb-item").length > k, n, { timeout: 15000 });
  await pg.waitForTimeout(400);
}
async function stage(pg) {
  if (!(await pg.locator(".yl-plan").first().isVisible().catch(() => false))) {
    await pg.locator("[data-testid=play-on-stage]").last().click().catch(() => {});
    await pg.waitForTimeout(900);
  }
}
const sub = (pg) => pg.locator(".yl-stephead .yl-sub").first().innerText();
const kept = (pg) => pg.evaluate(() => Object.keys(localStorage).filter((k) => /^yui\.(run|form|mic|slide)\./.test(k)));
const reload = async (pg, yl) => { await pg.reload(); await pg.waitForSelector(".wb-thread[data-loaded='1']"); await say(pg, yl); await stage(pg); };

const SIZES = [["dark", { width: 390, height: 844, mobile: true }], ["light", { width: 390, height: 844, mobile: true }], ["dark", { width: 1280, height: 800 }], ["light", { width: 1280, height: 800 }]];
for (const [theme, vp] of SIZES) {
  const tag = `${theme} ${vp.width}`;
  console.log(tag);
  const ctx = await b.newContext({ viewport: { width: vp.width, height: vp.height }, deviceScaleFactor: 2, ...(vp.mobile ? { hasTouch: true, isMobile: true } : {}) });
  const shot = (pg, name) => SHOTS && vp.width === 390 ? pg.screenshot({ path: `${SHOTS}/${theme}-${name}.png` }) : null;
  try {
    let pg = await open(ctx, theme);
    await say(pg, PLAN); await stage(pg);
    ok(/Step 1 of 3/.test(await sub(pg)), `${tag}: the plan opens on step 1 of 3`);
    await pg.locator(".yl-planstep:visible .chip", { hasText: /^M$/ }).click();
    await pg.waitForTimeout(700);
    ok(/Step 2 of 3/.test(await sub(pg)), `${tag}: choosing M goes to step 2`);
    await pg.locator(".yl-planstep:visible input").first().pressSequentially("Al");
    await pg.locator(".yl-planstep:visible textarea").fill("no onions");
    await shot(pg, "1-before-reload");
    await reload(pg, PLAN);
    ok(/Step 2 of 3/.test(await sub(pg)), `${tag}: after a reload it lands on step 2`);
    ok((await pg.locator(".yl-planstep:visible input").first().inputValue()) === "Al", `${tag}: the typed name is back`);
    ok((await pg.locator(".yl-planstep:visible textarea").inputValue()) === "no onions", `${tag}: the note is back`);
    await shot(pg, "2-after-reload");
    // the tap on step 1 came back too
    await pg.locator(".yl-plansegs button[aria-label='Step 1']").click();
    await pg.waitForTimeout(300);
    ok((await pg.locator(".yl-planstep:visible .chip.on, .yl-planstep:visible .chip[aria-pressed=true]").allInnerTexts()).join("") === "M", `${tag}: the tapped M is back on step 1`);
    // on to the slider, move it, reload
    await pg.locator(".yl-plansegs button[aria-label='Step 2']").click();
    await pg.locator(".yl-planstep:visible form button.bigbtn").click();
    await pg.waitForTimeout(500);
    ok(/Step 3 of 3/.test(await sub(pg)), `${tag}: the form goes on to step 3`);
    await pg.locator(".yl-planstep:visible input[type=range]").fill("75");
    await pg.locator(".yl-planstep:visible input[type=range]").dispatchEvent("keyup");
    await reload(pg, PLAN);
    ok(/Step 3 of 3/.test(await sub(pg)), `${tag}: a second reload lands on step 3`);
    ok((await pg.locator(".yl-planstep:visible input[type=range]").inputValue()) === "75", `${tag}: the slider is back at 75`);
    ok((await kept(pg)).length > 0, `${tag}: something is kept before Send`);
    // Send, reload: clear
    await pg.locator(".yl-plan .bigbtns .bigbtn.p.acc", { hasText: /^Review$/ }).click();
    await pg.waitForTimeout(300);
    ok(/Review/.test(await sub(pg)) && (await pg.locator(".yl-planreview").innerText()).includes("M"), `${tag}: the review lists the restored answers`);
    await pg.locator(".yl-plan .bigbtns .bigbtn.p.acc", { hasText: /^Send$/ }).click();
    await pg.waitForTimeout(1000);
    const sent = JSON.stringify(await pg.evaluate(() => window.yuiWebDemo.wire("demo-penny")));
    ok(/Al/.test(sent) && /no onions/.test(sent) && /\bM\b/.test(sent) && /75/.test(sent), `${tag}: what was sent has M, the name, the note and 75`);
    ok((await kept(pg)).length === 0, `${tag}: Send clears it (${(await kept(pg)).join(",") || "nothing left"})`);
    await reload(pg, PLAN);
    ok(/Step 1 of 3/.test(await sub(pg)), `${tag}: after Send and a reload the plan is clear (step 1)`);
    ok((await pg.locator(".yl-planstep input").first().inputValue()) === "", `${tag}: the name is empty`);
    await shot(pg, "3-after-send-reload");
    ok(pg.errs.length === 0, `${tag}: no page errors ${pg.errs.join(";")}`);
  } catch (e) { fail++; console.log(`  FAIL ${tag}: ${String(e.message).split("\n")[0]}`); }
  await ctx.close();
}
await b.close();
console.log(`${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
