// YUI-279 e2e: a flow or plan on /web keeps what was typed until Send (the web twin of the app's AnswersKeptTests).
//   npx next build && npx next start -p 3279 &   then   node e2e/web/answerskept.test.mjs
// BASE overrides the origin, PLAYWRIGHT the Playwright module, SHOTS the folder for 390 px shots (light + dark).
import { createRequire } from "node:module";
import { mkdirSync } from "node:fs";
const { chromium } = createRequire(import.meta.url)(process.env.PLAYWRIGHT || "playwright");
const BASE = process.env.BASE || "http://localhost:3279";
const SHOTS = process.env.SHOTS || "";
if (SHOTS) mkdirSync(SHOTS, { recursive: true });
const b = await chromium.launch();
let pass = 0, fail = 0;
const ok = (c, msg) => { if (c) { pass++; console.log("  ok  ", msg); } else { fail++; console.log("  FAIL", msg); } };

const FLOW = `flow@lunch "Lunch order" submit="Send"
flowchart TD
  %% who: form "About you" name:text! notes:long
  who[Who] --> size
  %% size: choose "Size?" S|M|L
  size[Size] --> say
  %% say: mic "Anything else?"
  say[Say]
end`;
const PLAN = `plan@kit "Kit check" submit="Send"
form@kitwho "About you" name:text! notes:long
choose@kitsize "Size?" S|M|L
mic@kitsay "Anything else?"
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
const kept = (pg) => pg.evaluate(() => Object.keys(localStorage).filter((k) => /^yui\.(run|form|mic)\./.test(k)));

for (const theme of ["light", "dark"]) {
  for (const [what, yl] of [["flow", FLOW], ["plan", PLAN]]) {
    console.log(`${what} ${theme} 390`);
    const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, hasTouch: true, isMobile: true });
    try {
      // No speech engine: the mic offers its type box, which is what a browser without one shows.
      await ctx.addInitScript(() => { window.SpeechRecognition = undefined; window.webkitSpeechRecognition = undefined; });
      let pg = await open(ctx, theme);
      await say(pg, yl); await stage(pg);
      ok(/Step 1 of/.test(await sub(pg)), `${what}: opens on step 1`);
      const name = pg.locator(".yl-planstep:visible input").first();
      await name.pressSequentially("Al");
      ok(/Step 1 of/.test(await sub(pg)), `${what}: a first key in the first-step form does not jump on`);
      ok((await name.inputValue()) === "Al", `${what}: the field holds what was typed`);
      await pg.locator(".yl-planstep:visible textarea").fill("no onions");
      if (SHOTS) await pg.screenshot({ path: `${SHOTS}/${what}-${theme}-typed.png` });
      // reload: the same reply is drawn again, the typed words are back
      await pg.reload();
      await pg.waitForSelector(".wb-thread[data-loaded='1']");
      await say(pg, yl); await stage(pg);
      ok(/Step 1 of/.test(await sub(pg)), `${what}: after a reload it is on step 1`);
      ok((await pg.locator(".yl-planstep:visible input").first().inputValue()) === "Al", `${what}: after a reload the name is back`);
      ok((await pg.locator(".yl-planstep:visible textarea").inputValue()) === "no onions", `${what}: after a reload the note is back`);
      if (SHOTS) await pg.screenshot({ path: `${SHOTS}/${what}-${theme}-reloaded.png` });
      // on to step 2, answer, reload: the step and the answer are back
      await pg.locator(".yl-planstep:visible form button.bigbtn").click();
      await pg.waitForTimeout(500);
      ok(/Step 2 of/.test(await sub(pg)), `${what}: the form's button goes to step 2`);
      await pg.locator(".yl-planstep:visible .chip", { hasText: /^M$/ }).click();
      await pg.waitForTimeout(700);
      ok(/Step 3 of/.test(await sub(pg)), `${what}: choosing M goes to step 3`);
      await pg.locator(".yl-planstep:visible input[name=t]").fill("half typed");
      await pg.reload();
      await pg.waitForSelector(".wb-thread[data-loaded='1']");
      await say(pg, yl); await stage(pg);
      ok(/Step 3 of/.test(await sub(pg)), `${what}: after a second reload it is on step 3`);
      ok((await pg.locator(".yl-planstep:visible input[name=t]").inputValue().catch(() => "")) === "half typed", `${what}: the mic box keeps its typed words`);
      ok((await kept(pg)).length > 0, `${what}: something is kept before Send`);
      // Send clears it all
      await pg.locator(".yl-planstep:visible input[name=t]").fill("fine");
      await pg.locator(".yl-planstep:visible form button").click();
      await pg.waitForTimeout(1200);
      const left = await pg.locator(".yl-plan .bigbtn.p.acc").last();
      if (await left.count() && /Send/.test(await left.innerText())) { await left.click(); await pg.waitForTimeout(800); }
      else if (await pg.locator(".yl-plan .bigbtn.p.acc", { hasText: /^Review$/ }).count()) { await pg.locator(".yl-plan .bigbtn.p.acc").last().click(); await pg.waitForTimeout(300); await pg.locator(".yl-plan .bigbtn.p.acc", { hasText: /^Send$/ }).click(); await pg.waitForTimeout(800); }
      const sent = JSON.stringify(await pg.evaluate(() => window.yuiWebDemo.wire("demo-penny"))) + (await pg.locator(".yl-project").allInnerTexts()).join(" ");
      ok(/Al/.test(sent) && /no onions/.test(sent) && /\bM\b/.test(sent) && /fine/.test(sent), `${what}: what was sent has the name, the note, M and the mic words`);
      ok((await kept(pg)).length === 0, `${what}: Send clears it (${(await kept(pg)).join(",") || "nothing left"})`);
      ok(pg.errs.length === 0, `${what}: no page errors ${pg.errs.join(";")}`);
    } catch (e) { fail++; console.log(`  FAIL ${what}: ${String(e.message).split("\n")[0]}`); }
    await ctx.close();
  }
}
await b.close();
console.log(`${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
