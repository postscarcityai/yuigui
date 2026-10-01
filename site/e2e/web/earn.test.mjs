// SITE-161 e2e: your $U in the web drawer, on the demo relay (no sign in, no network): the header (your picture and
// name top left, the coin and the number top right), the sample marked as a sample, the count up once when it grew
// since the last visit (and not under reduced motion), and the Your U sheet behind a tap. Light and dark, 390 px and desktop.
//   npx next build && npx next start -p 3161 &   then   node e2e/web/earn.test.mjs
// BASE overrides the origin, PLAYWRIGHT the Playwright module, SHOTS the folder for the shots (skipped when unset).
import { createRequire } from "node:module";
import { mkdirSync } from "node:fs";
const { chromium } = createRequire(import.meta.url)(process.env.PLAYWRIGHT || "playwright");
const BASE = process.env.BASE || "http://localhost:3161";
const SHOTS = process.env.SHOTS || "";
if (SHOTS) mkdirSync(SHOTS, { recursive: true });
const b = await chromium.launch();
let pass = 0, fail = 0;
const ok = (c, msg) => { if (c) { pass++; console.log("  ok  ", msg); } else { fail++; console.log("  FAIL", msg); } };
const PHONE = { width: 390, height: 844 }, DESK = { width: 1280, height: 800 };
const shot = async (pg, name) => { if (SHOTS) await pg.screenshot({ path: `${SHOTS}/${name}.png` }); };
const num = async (pg) => (await pg.getByTestId("u-shown").innerText()).trim();

async function open(vp, theme, { extra = "", reduce = false } = {}) {
  const ctx = await b.newContext({ viewport: vp, deviceScaleFactor: 2, reducedMotion: reduce ? "reduce" : "no-preference" });
  const pg = await ctx.newPage();
  pg.errs = [];
  pg.on("pageerror", (e) => pg.errs.push(e.message));
  await pg.goto(`${BASE}/web/agent/demo-penny?demo=penny&theme=${theme}${extra}`);
  await pg.waitForSelector("[data-testid=stage-record]");
  await pg.waitForTimeout(400);
  return pg;
}
async function drawer(pg, vp) {
  if (vp.width < 760 && !(await pg.locator(".wb-side.open").count())) {
    const stage = pg.locator(".wb-stage-menu:visible");
    await ((await stage.count()) ? stage : pg.locator(".wb-menu:visible")).first().click();
    await pg.waitForTimeout(450);
  }
  await pg.getByTestId("drawer").waitFor();
}

for (const [vp, tag] of [[PHONE, "390"], [DESK, "desktop"]]) for (const theme of ["light", "dark"]) {
  const T = `${theme} ${tag}`;

  // ---------- the header ----------
  let pg = await open(vp, theme);
  await drawer(pg, vp);
  await pg.waitForTimeout(300);
  ok(await pg.getByTestId("drawer-me").isVisible() && (await pg.getByTestId("drawer-me-name").innerText()) === "You", `${T}: your picture and name sit top left`);
  ok(await pg.getByTestId("drawer-u").isVisible() && (await num(pg)) === "1,284", `${T}: the coin and the number sit top right (1,284)`);
  ok(await pg.getByTestId("u-sample-tag").isVisible(), `${T}: the demo number is marked as a sample`);
  const me = await pg.getByTestId("drawer-me").boundingBox(), pill = await pg.getByTestId("drawer-u").boundingBox();
  ok(me.x < pill.x && Math.abs((me.y + me.height / 2) - (pill.y + pill.height / 2)) < 12, `${T}: name left, number right, one row`);
  ok(pill.x + pill.width <= vp.width && pill.height >= 36, `${T}: the pill fits and is a touch target`);
  ok(!(await pg.locator("[data-testid=stage-record]").innerText()).includes("1,284"), `${T}: the number is only in the drawer, never in the chat`);
  await shot(pg, `site161-drawer-${tag}-${theme}`);

  // ---------- Your U ----------
  await pg.getByTestId("drawer-u").click();
  await pg.getByTestId("your-u").waitFor();
  ok((await pg.getByTestId("u-total").innerText()) === "1,284", `${T}: Your U opens on the total`);
  ok((await pg.getByTestId("u-sample-note").innerText()).includes("sample"), `${T}: Your U says it is a sample`);
  ok((await pg.getByTestId("u-today").innerText()) === "82 of 150" && (await pg.getByTestId("u-streak").innerText()) === "6 days" && (await pg.getByTestId("u-speed").innerText()) === "x1.1", `${T}: today against the cap, streak, speed`);
  ok((await pg.getByTestId("u-days").innerText()).includes("Sep 30") && (await pg.getByTestId("u-days").innerText()).includes("34 messages, 9 screens, 4 jobs, +82"), `${T}: each day, in plain words`);
  ok((await pg.getByTestId("u-built").innerText()).includes("Your feedback shipped"), `${T}: what you helped build`);
  const how = await pg.getByTestId("u-formula").innerText();
  ok(["A message", "A job finished", "30 days in a row", "Feedback shipped", "10,000"].every((w) => how.includes(w)), `${T}: how it adds up`);
  ok((await pg.getByTestId("u-note").innerText()) === "No cash value. Not a token yet.", `${T}: no cash value, not a token`);
  await pg.getByTestId("your-u").evaluate((el) => { el.querySelector(".ag-body").scrollTop = 0; });
  await shot(pg, `site161-your-u-${tag}-${theme}`);
  await pg.getByTestId("your-u").evaluate((el) => { const x = el.querySelector(".ag-body"); x.scrollTop = x.scrollHeight; });
  await pg.waitForTimeout(150);
  await shot(pg, `site161-your-u-more-${tag}-${theme}`);
  await pg.getByTestId("your-u-done").click();
  ok((await pg.getByTestId("your-u").count()) === 0, `${T}: Done closes it`);
  ok(pg.errs.length === 0, `${T}: no page errors (${pg.errs.join("; ")})`);
  await pg.context().close();
}

// ---------- the name opens Settings ----------
{
  const pg = await open(PHONE, "light");
  await drawer(pg, PHONE);
  await pg.getByTestId("drawer-me").click();
  await pg.getByTestId("settings").waitFor();
  ok(true, "tapping your name opens Settings");
  await pg.context().close();
}

// ---------- the count: once, when it grew since the last visit ----------
{
  const pg = await open(PHONE, "dark", { extra: "&earnseen=1200" });
  await drawer(pg, PHONE);
  const early = Number((await num(pg)).replace(/,/g, ""));
  ok(early >= 1200 && early < 1284, `it starts from what you last saw (${early}), not from the new total`);
  await pg.waitForTimeout(700);
  ok(await pg.getByTestId("drawer-u").evaluate((e) => e.classList.contains("climbing")) || (await num(pg)) !== "1,284", "the pill is mid count");
  await shot(pg, "site161-counting-390-dark");
  await pg.waitForTimeout(2600);
  ok((await num(pg)) === "1,284", "it lands on exactly 1,284");
  ok(!(await pg.getByTestId("drawer-u").evaluate((e) => e.classList.contains("climbing"))), "the green fades back");
  await pg.context().close();
}
{
  const pg = await open(PHONE, "light", { extra: "&earnseen=1284" });
  await drawer(pg, PHONE);
  ok((await num(pg)) === "1,284", "nothing new since the last visit: the number just shows, no count");
  await pg.context().close();
}
{
  const pg = await open(PHONE, "light", { extra: "&earnseen=1200", reduce: true });
  await drawer(pg, PHONE);
  ok((await num(pg)) === "1,284", "reduced motion: the new total at once, no count");
  ok(!(await pg.getByTestId("drawer-u").evaluate((e) => e.classList.contains("climbing"))), "reduced motion: no green climb");
  await pg.context().close();
}

console.log(`your U: ${pass} ok, ${fail} failed`);
await b.close();
process.exit(fail ? 1 : 0);
