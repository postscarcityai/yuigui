// Brand lab stills from fal: material plates and a few mockups. Round 1.
//
//   python3 brand/lab/tools/refs.py        render the clean mark the mockups start from
//   node brand/lab/fal/gen.mjs              everything in prompts.json (skips what is already made)
//   node brand/lab/fal/gen.mjs seal cup     only these ids
//
// The key: FAL_KEY or FAL_API_KEY from the environment, else the main checkout's .env
// (worktrees don't share untracked files, so we look where git keeps the repo).
// Output: brand/lab/out/fal/<id>--<model>.<ext> and meta.json (gitignored). Plain fetch, no SDK.
import { readFileSync, writeFileSync, existsSync, mkdirSync } from "node:fs";
import { execSync } from "node:child_process";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(HERE, "../../..");
const OUT = join(ROOT, "brand/lab/out/fal");
mkdirSync(OUT, { recursive: true });

function key() {
  if (process.env.FAL_KEY || process.env.FAL_API_KEY) return process.env.FAL_KEY || process.env.FAL_API_KEY;
  const common = resolve(ROOT, execSync("git rev-parse --git-common-dir", { cwd: ROOT }).toString().trim());
  for (const f of [join(ROOT, ".env"), join(dirname(common), ".env"), join(process.env.HOME, ".config/yui/secrets.env")]) {
    if (!existsSync(f)) continue;
    const m = readFileSync(f, "utf8").match(/^(?:FAL_KEY|FAL_API_KEY)\s*=\s*["']?([^"'\s]+)/m);
    if (m) return m[1];
  }
  throw new Error("No fal key. Set FAL_KEY, or FAL_API_KEY in the repo's .env.");
}
const KEY = key();
const H = { Authorization: `Key ${KEY}`, "Content-Type": "application/json" };

const cfg = JSON.parse(readFileSync(join(HERE, "prompts.json"), "utf8"));
const only = new Set(process.argv.slice(2));
const metaPath = join(OUT, "meta.json");
const meta = existsSync(metaPath) ? JSON.parse(readFileSync(metaPath, "utf8")) : {};
const dataUri = (f) => "data:image/png;base64," + readFileSync(f).toString("base64");
const refs = { mark: join(ROOT, "brand/lab/out/ref-mark.png"), y: join(ROOT, "brand/lab/out/ref-y.png") };
const slug = (m) => m.replace(/^(fal-ai|bytedance|openai|google)\//, "").replace(/\//g, "-");
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const sizeFor = (aspect) => ({ "1:1": "square_hd", "4:3": "landscape_4_3", "16:9": "landscape_16_9" })[aspect] || "landscape_4_3";
function body(model, job) {
  if (job.kind === "plate") return { prompt: job.prompt, aspect_ratio: "16:9", resolution: "2K", output_format: "png", num_images: 1 };
  const prompt = `${job.prompt} ${cfg.keep}`;
  const image_urls = [dataUri(refs[job.ref])];
  if (model.includes("nano-banana")) return { prompt, image_urls, aspect_ratio: job.aspect, resolution: "2K", output_format: "png" };
  if (model.includes("seedream")) return { prompt, image_urls, image_size: sizeFor(job.aspect), output_format: "png" };
  return { prompt, image_urls, image_size: sizeFor(job.aspect), quality: "high", output_format: "png" };
}

async function run(model, job) {
  const name = `${job.id}--${slug(model)}`;
  if (meta[name] && existsSync(join(OUT, meta[name].file))) return console.log("have", name);
  const t0 = Date.now();
  const sub = await fetch(`https://queue.fal.run/${model}`, { method: "POST", headers: H, body: JSON.stringify(body(model, job)) });
  if (!sub.ok) throw new Error(`${name}: submit ${sub.status} ${(await sub.text()).slice(0, 300)}`);
  const { status_url, response_url } = await sub.json();
  for (let i = 0; i < 180; i++) {
    await sleep(2500);
    const st = await (await fetch(status_url, { headers: H })).json();
    if (st.status === "COMPLETED") break;
    if (st.status === "FAILED" || st.error) throw new Error(`${name}: ${JSON.stringify(st).slice(0, 300)}`);
  }
  const res = await (await fetch(response_url, { headers: H })).json();
  const img = (res.images || [])[0];
  if (!img) throw new Error(`${name}: no image ${JSON.stringify(res).slice(0, 300)}`);
  const buf = Buffer.from(await (await fetch(img.url)).arrayBuffer());
  const ext = (img.content_type || "image/png").split("/")[1].replace("jpeg", "jpg");
  const file = `${name}.${ext}`;
  writeFileSync(join(OUT, file), buf);
  meta[name] = { file, id: job.id, kind: job.kind, model, prompt: job.prompt, ref: job.ref || null, seconds: Math.round((Date.now() - t0) / 1000), date: new Date().toISOString().slice(0, 10) };
  writeFileSync(metaPath, JSON.stringify(meta, null, 2));
  console.log("made", file, meta[name].seconds + "s");
}

const jobs = [
  ...cfg.plates.map((p) => [cfg.models.plate, { ...p, kind: "plate" }]),
  ...cfg.mockups.flatMap((m) => cfg.models.edit.map((model) => [model, { ...m, kind: "mockup" }])),
].filter(([, j]) => !only.size || only.has(j.id));

// a few at a time, so one slow model doesn't hold the rest
let next = 0, failed = 0;
await Promise.all(Array.from({ length: 4 }, async () => {
  while (next < jobs.length) {
    const [model, job] = jobs[next++];
    try { await run(model, job); } catch (e) { failed++; console.error("fail", e.message); }
  }
}));
console.log(`done: ${jobs.length - failed} of ${jobs.length}`);
