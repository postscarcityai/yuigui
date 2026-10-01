// YUI-240 demo check: the parity table is drawn on /developers/browser, at 390 px and at desktop width,
// light and dark. BASE is the site origin (default http://localhost:3150), PLAYWRIGHT the module,
// SHOTS the folder the shots go to. Run after `npm run build && npx next start -p 3150`.
import { createRequire } from "node:module";
import { mkdirSync } from "node:fs";
const { chromium } = createRequire(import.meta.url)(process.env.PLAYWRIGHT || "playwright");
const BASE = process.env.BASE || "http://localhost:3150";
const SHOTS = process.env.SHOTS || "";
if (SHOTS) mkdirSync(SHOTS, { recursive: true });
const b = await chromium.launch();
let pass = 0, fail = 0;
const ok = (c, msg) => { if (c) { pass++; console.log("  ok  ", msg); } else { fail++; console.log("  FAIL", msg); } };

for (const [name, vp] of [["390", { width: 390, height: 844 }], ["desktop", { width: 1280, height: 900 }]]) {
  for (const scheme of ["light", "dark"]) {
    const ctx = await b.newContext({ viewport: vp, colorScheme: scheme, deviceScaleFactor: name === "390" ? 2 : 1 });
    // The site's theme is the `yui-theme` choice, not the system one (ThemeToggle.js).
    await ctx.addInitScript((t) => { try { localStorage.setItem("yui-theme", t); } catch {} }, scheme);
    const pg = await ctx.newPage();
    const errs = [];
    pg.on("pageerror", (e) => errs.push(String(e)));
    pg.on("console", (m) => { if (m.type() === "error") errs.push(m.text()); });
    const res = await pg.goto(`${BASE}/developers/browser`, { waitUntil: "networkidle" });
    const tag = `${name} ${scheme}`;
    ok(res.status() === 200, `${tag}: 200`);
    const text = await pg.locator("body").innerText();
    ok(/Where the web differs from the phone/.test(text), `${tag}: the differences table is there`);
    ok(/Presets \(every one in YL section 4\)/.test(text), `${tag}: the parity summary is there`);
    ok(/YUI-241/.test(text) && /YUI-250/.test(text), `${tag}: the story list runs 241 to 250`);
    const tables = await pg.locator("table").count();
    ok(tables >= 4, `${tag}: ${tables} tables drawn`);
    const over = await pg.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1);
    ok(!over, `${tag}: no sideways scroll of the page`);
    ok((await pg.locator("html").getAttribute("data-theme")) === scheme, `${tag}: the site is ${scheme}`);
    ok(errs.length === 0, `${tag}: no console errors${errs.length ? " " + errs[0] : ""}`);
    if (SHOTS) {
      // The parity summary table, then the differences table: scroll each one to the middle of the screen.
      for (const [file, heading] of [["parity", "Scope: everything the app does"], ["differs", "Where the web differs"]]) {
        const t = pg.locator("h2", { hasText: heading }).locator("xpath=following::table[1]");
        await t.evaluate((el) => el.scrollIntoView({ block: "start" }));
        await pg.evaluate(() => window.scrollBy(0, -200));
        await pg.waitForTimeout(150);
        await pg.screenshot({ path: `${SHOTS}/${file}-${name}-${scheme}.png`, fullPage: false });
      }
    }
    await ctx.close();
  }
}
await b.close();
console.log(`parity page: ${pass} ok, ${fail} failed`);
process.exit(fail ? 1 : 0);
