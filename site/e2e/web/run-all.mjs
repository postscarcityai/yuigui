// YUI-250: the whole /web e2e suite, one command, demo account only (no sign in, no network, no secrets).
//   cd site && npm run build && node e2e/web/run-all.mjs
// Serves the production build (the CSP only matches a prod build), runs every site/e2e/web/*.test.mjs against
// it, one after another, and exits 1 when any file is red. Each file prints its own "N passed, M failed".
//   PLAYWRIGHT  the Playwright module (default: `playwright`, which CI installs with --no-save)
//   SHOTS       a folder; each file writes its 390 px and desktop shots (light and dark) under it
//   ONLY        a comma list of file stems to run (thread,stage)
//   PORT        the port the build is served on (default 3250)
import { spawn } from "node:child_process";
import { readdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const here = dirname(fileURLToPath(import.meta.url));
const site = join(here, "../..");
const PORT = process.env.PORT || "3250";
const BASE = `http://localhost:${PORT}`;
const only = (process.env.ONLY || "").split(",").filter(Boolean);
const files = readdirSync(here).filter((f) => f.endsWith(".test.mjs")).sort()
  .filter((f) => !only.length || only.includes(f.replace(".test.mjs", "")));

const server = spawn("npx", ["next", "start", "-p", PORT], { cwd: site, stdio: "ignore" });
const stop = () => { try { server.kill("SIGTERM"); } catch {} };
process.on("exit", stop);
process.on("SIGINT", () => { stop(); process.exit(130); });

async function up() {
  for (let i = 0; i < 60; i++) {
    try { if ((await fetch(`${BASE}/web`)).status < 500) return true; } catch {}
    await new Promise((r) => setTimeout(r, 1000));
  }
  return false;
}
if (!(await up())) { console.log(`FAIL the build did not come up on ${BASE} (run npm run build first)`); process.exit(1); }

// A cold server answers its first dynamic pages slowly: touch the routes the tests open before the first file starts.
for (const path of ["/web", "/web/agent/demo-penny?demo=penny", "/web?demo=first"]) { try { await fetch(`${BASE}${path}`); } catch {} }

const run = (file) => new Promise((res) => {
  const t0 = Date.now();
  const out = [];
  const env = { ...process.env, BASE };
  if (process.env.SHOTS) env.SHOTS = join(process.env.SHOTS, file.replace(".test.mjs", ""));
  const p = spawn("node", [join(here, file)], { cwd: site, env });
  p.stdout.on("data", (d) => out.push(String(d)));
  p.stderr.on("data", (d) => out.push(String(d)));
  p.on("close", (code) => res({ file, code, secs: Math.round((Date.now() - t0) / 1000), out: out.join("") }));
});

const results = [];
for (const f of files) {
  let r = await run(f);
  // One retry for a file that went red: a real failure fails twice, a slow moment does not.
  if (r.code !== 0) { console.log(`retry ${f} (first run red)`); r = await run(f); }
  results.push(r);
  const tally = (r.out.match(/(\d+) passed, (\d+) failed/) || [])[0] || "";
  console.log(`${r.code === 0 ? "ok  " : "FAIL"} ${f} (${r.secs}s) ${tally}`);
  if (r.code !== 0) console.log(r.out.split("\n").filter((l) => /FAIL|Error|error/.test(l)).slice(0, 30).join("\n"));
}
const bad = results.filter((r) => r.code !== 0);
console.log(`\n${results.length - bad.length}/${results.length} files green${bad.length ? `; red: ${bad.map((r) => r.file).join(", ")}` : ""}`);
stop();
process.exit(bad.length ? 1 : 0);
