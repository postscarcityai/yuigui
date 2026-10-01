// YUI-257 e2e: the shader is the orb on the web stage, no vector blob, still under Reduce Motion.
//   npx next start -p 3257 &   then   BASE=http://localhost:3257 node e2e/web/shader.test.mjs
import { createRequire } from "node:module";
import { mkdirSync } from "node:fs";
const { chromium } = createRequire(import.meta.url)(process.env.PLAYWRIGHT || "playwright");
const BASE = process.env.BASE || "http://localhost:3257";
const SHOTS = process.env.SHOTS || "";
if (SHOTS) mkdirSync(SHOTS, { recursive: true });
const b = await chromium.launch({ args: ["--use-gl=swiftshader", "--enable-unsafe-swiftshader", "--ignore-gpu-blocklist"] });
let pass = 0, fail = 0;
const ok = (c, msg) => { if (c) { pass++; console.log("  ok  ", msg); } else { fail++; console.log("  FAIL", msg); } };

async function start(vp, theme, extra = {}) {
  const ctx = await b.newContext({ viewport: vp, deviceScaleFactor: 2, ...extra });
  const pg = await ctx.newPage();
  pg.errs = [];
  pg.on("pageerror", (e) => pg.errs.push(e.message));
  await pg.goto(`${BASE}/web/agent/demo-penny?demo=penny&theme=${theme}`);
  await pg.waitForSelector("[data-testid=stage-home]");
  await pg.waitForTimeout(600);
  return pg;
}
const hash = (pg) => pg.locator(".wb-shader canvas").evaluate((c) => { const d = c.toDataURL(); let h = 0; for (let i = 0; i < d.length; i += 97) h = (h * 31 + d.charCodeAt(i)) | 0; return h; });

for (const theme of ["light", "dark"]) {
  for (const [name, vp, touch] of [["390", { width: 390, height: 844 }, { hasTouch: true, isMobile: true }], ["desktop", { width: 1280, height: 800 }, {}]]) {
    const t = `${theme} ${name}`;
    const pg = await start(vp, theme, touch);
    ok(await pg.locator("[data-testid=stage-shader]").count() === 1, `${t}: the shader is behind the stage`);
    ok(await pg.locator(".wb-shader canvas").count() === 1, `${t}: it is a WebGL canvas`);
    ok(await pg.locator(".mo-orb").count() === 0, `${t}: no vector blob`);
    const box = await pg.locator(".wb-shader").boundingBox();
    const stage = await pg.locator("[data-testid=stage]").boundingBox();
    ok(Math.abs(box.width - stage.width) < 2 && Math.abs(box.height - stage.height) < 2, `${t}: it fills the stage`);
    const a = await hash(pg); await pg.waitForTimeout(1200); const c = await hash(pg);
    ok(a !== c, `${t}: it moves on its own`);
    if (SHOTS) await pg.screenshot({ path: `${SHOTS}/web-shader-${name}-${theme}.png` });
    ok(pg.errs.length === 0, `${t}: no page errors ${pg.errs.join("|")}`);
    await pg.context().close();
  }
}
// Reduce Motion: one still frame.
const rm = await start({ width: 390, height: 844 }, "dark", { reducedMotion: "reduce" });
ok(await rm.locator("[data-testid=stage-shader][data-still=reduce-motion]").count() === 1, "reduce motion: marked still");
const s1 = await hash(rm); await rm.waitForTimeout(1200);
ok(s1 === await hash(rm), "reduce motion: the frame does not move");
// No WebGL: a still gradient, no blob.
const ctx = await b.newContext({ viewport: { width: 390, height: 844 } });
await ctx.addInitScript(() => { const o = HTMLCanvasElement.prototype.getContext; HTMLCanvasElement.prototype.getContext = function (k, ...r) { return /webgl/.test(k) ? null : o.call(this, k, ...r); }; });
const nogl = await ctx.newPage();
await nogl.goto(`${BASE}/web/agent/demo-penny?demo=penny&theme=dark`);
await nogl.waitForSelector("[data-testid=stage-home]");
await nogl.waitForTimeout(500);
ok(await nogl.locator(".wb-shader .vz-fallback").count() === 1 && await nogl.locator(".mo-orb").count() === 0, "no WebGL: a still gradient, no blob");
console.log(`${pass} passed, ${fail} failed`);
await b.close();
process.exit(fail ? 1 : 0);
