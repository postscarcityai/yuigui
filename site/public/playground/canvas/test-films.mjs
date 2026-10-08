// YUI-323: every film on /playground/canvas.html loads, plays, and has at least one touch target (or the hold-on-nothing @t ask).
// Serve site/public (python3 -m http.server 8923), then: node test-films.mjs   (PW_FROM = a package.json whose node_modules has playwright)
import { createRequire } from "module";
const require = createRequire(process.env.PW_FROM || "/Users/urzas/dev/ablejobs/package.json");
const { chromium } = require("playwright");
import fs from "fs";
const list = JSON.parse(fs.readFileSync(new URL("./films.json", import.meta.url)));
const ids = ["heart"]; list.forEach(f => f.runs.forEach(r => ids.push(f.id + "-r" + r)));
const b = await chromium.launch({ executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome", headless: true });
const out = []; let bad = 0;
for (const id of ids) {
  const p = await b.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, hasTouch: true });
  const errs = []; p.on("pageerror", e => errs.push(String(e)));
  const r = await p.goto("http://localhost:" + (process.env.PORT || 8923) + "/playground/canvas.html" + (id === "heart" ? "" : "?film=" + id) + "?theme=dark".replace("?", id === "heart" ? "?" : "&"));
  await p.waitForFunction(() => window.__canvas && window.__canvas.loaded, null, { timeout: 15000 }).catch(() => {});
  const fr = p.frames().find(f => f.url().includes("player.html"));
  let n = 0, tgt = 0, sample = [], motionErrs = [];
  await p.waitForTimeout(id.startsWith("three") ? 2500 : 0);
  const total = await p.evaluate(() => window.__canvas.total);
  for (let t = 1; t < total; t += Math.max(1, total / 14)) {
    const h = await fr.evaluate(t => { window.__motion.renderAt(t); return window.__motion.hits(); }, t);
    if (h.length) { tgt = Math.max(tgt, h.length); if (sample.length < 3) sample.push(h[0].label); n++; }
  }
  let fallbackOk = false; if (n === 0) fallbackOk = await fr.evaluate(() => window.__motion.hitAt(5, 5) === null);
  motionErrs = await fr.evaluate(() => window.__motion.errors());
  const ok = r.status() === 200 && total > 0 && (n > 0 || id === "heart" || fallbackOk) && !motionErrs.length && !errs.length;
  if (!ok) bad++;
  out.push(`${ok ? "ok " : "BAD"} ${id} total=${total} frames_with_targets=${n} max=${tgt} ${sample.join("|")} ${motionErrs} ${errs.join(";")}`);
  await p.close();
}
console.log(out.join("\n")); console.log("bad", bad, "of", ids.length);
await b.close();
