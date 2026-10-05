// YUI-36 step 1 e2e: Settings > Data on the web, on the demo relay (a relay held in the page). Off by default; on
// shows the status and a pairing code that counts down; a second page cannot join without a good code; off removes
// the copy. Light and dark, 390 px and desktop.
//   npx next build && npx next start -p 3249 &   then   node e2e/web/tablesync.test.mjs
import { createRequire } from "node:module";
import { mkdirSync } from "node:fs";
const { chromium } = createRequire(import.meta.url)(process.env.PLAYWRIGHT || "playwright");
const BASE = process.env.BASE || "http://localhost:3249";
const SHOTS = process.env.SHOTS || "";
if (SHOTS) mkdirSync(SHOTS, { recursive: true });
const b = await chromium.launch();
let pass = 0, fail = 0;
const ok = (c, msg) => { if (c) { pass++; console.log("  ok  ", msg); } else { fail++; console.log("  FAIL", msg); } };
const PHONE = { width: 390, height: 844 }, DESK = { width: 1280, height: 800 };
const shot = async (pg, name) => { if (SHOTS) await pg.screenshot({ path: `${SHOTS}/${name}.png` }); };

async function open(vp, theme) {
  const pg = await b.newPage({ viewport: vp, deviceScaleFactor: 2 });
  pg.errs = [];
  pg.on("pageerror", (e) => pg.errs.push(e.message));
  await pg.goto(`${BASE}/web/agent/demo-penny?demo=penny&theme=${theme}`);
  await pg.waitForSelector("[data-testid=stage-record], [data-testid=key-ask]");
  await pg.waitForTimeout(400);
  if (vp.width < 760 && !(await pg.locator(".wb-side.open").count())) {
    const stage = pg.locator(".wb-stage-menu:visible");
    await ((await stage.count()) ? stage : pg.locator(".wb-menu:visible")).first().click();
    await pg.waitForTimeout(450);
  }
  await pg.getByTestId("open-settings").click();
  await pg.getByTestId("settings").waitFor();
  await pg.waitForTimeout(350);
  await pg.locator('[data-section="data"]').scrollIntoViewIfNeeded();
  return pg;
}
const noOverflow = (pg) => pg.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1);

for (const [vp, vname] of [[PHONE, "phone"], [DESK, "desk"]]) {
  for (const theme of ["dark", "light"]) {
    console.log(`${vname} ${theme}`);
    const pg = await open(vp, theme);
    const sw = pg.getByTestId("sync-switch").getByRole("switch");
    ok((await sw.getAttribute("aria-checked")) === "false", "off by default");
    ok(await pg.getByTestId("sync-join").isVisible(), "offers Join with a code");
    ok((await pg.getByTestId("sync-line").count()) === 0, "no status line while off");
    await shot(pg, `sync-${vname}-${theme}-off`);

    // A bad code is told, nothing else happens.
    await pg.getByTestId("sync-join").click();
    await pg.getByTestId("sync-code-field").fill("abc");
    await pg.getByTestId("sync-join-go").click();
    await pg.getByTestId("sync-error").waitFor();
    ok(/10 letters and numbers/.test(await pg.getByTestId("sync-error").innerText()), "a bad code is refused in words");
    await pg.getByTestId("sync-code-field").fill("ABCDE-FGHJK");
    await pg.getByTestId("sync-join-go").click();
    await pg.waitForFunction(() => /did not work/.test(document.querySelector("[data-testid=sync-error]")?.textContent || ""));
    ok(true, "a code that is not on the relay finds nothing");
    ok((await sw.getAttribute("aria-checked")) === "false", "still off after a failed join");

    // Turn on.
    await sw.click();
    await pg.getByTestId("sync-line").waitFor();
    await pg.waitForFunction(() => /Synced/.test(document.querySelector("[data-testid=sync-line]")?.textContent || ""));
    ok((await sw.getAttribute("aria-checked")) === "true", "on after the switch");
    ok(/Synced just now/.test(await pg.getByTestId("sync-line").innerText()), "says when it last synced");
    await pg.getByTestId("sync-add").click();
    await pg.getByTestId("sync-code").waitFor();
    const code = await pg.getByTestId("sync-code").innerText();
    ok(/^[0-9A-Z]{5}-[0-9A-Z]{5}$/.test(code), `shows a pairing code (${code})`);
    ok(/s left/.test(await pg.getByTestId("sync-left").innerText()), "the code counts down");
    ok(await noOverflow(pg), "nothing overflows");
    await shot(pg, `sync-${vname}-${theme}-on`);

    // Off again.
    await sw.click();
    await pg.waitForFunction(() => !document.querySelector("[data-testid=sync-line]"));
    ok((await sw.getAttribute("aria-checked")) === "false", "off again");
    ok(pg.errs.length === 0, `no page errors ${pg.errs.join(" | ")}`);
    await pg.close();
  }
}
await b.close();
console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
