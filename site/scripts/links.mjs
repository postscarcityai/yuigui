// Link and image check for yuigui.com (SITE-42). Crawls every sitemap URL on a base, collects internal hrefs,
// img/video/source src, srcset, posters and #anchors, and checks each one resolves: 200 after redirects, and
// an anchor exists as an id (or name) on its target page. External links get a HEAD with a short timeout;
// they are reported but never fail the run (other sites go down and block bots).
// A broken URL is traced to its source where it can be: progress.json, showcase.json, ROADMAP.md, spec/*.md,
// docs/**/*.md and the page sources in app/. Otherwise the report names the page it was found on.
// Run: node scripts/links.mjs [--base http://localhost:3019] [--no-external]
//   Exit 0 when every internal link and image resolves, 1 with one line per problem.
import { readFileSync, readdirSync, statSync, existsSync } from "node:fs";
import { join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const SITE = fileURLToPath(new URL("..", import.meta.url));
const ROOT = join(SITE, "..");
const arg = (k) => { const i = process.argv.indexOf(k); return i > 0 ? process.argv[i + 1] : null; };
const BASE = (arg("--base") || "https://www.yuigui.com").replace(/\/$/, "");
const EXTERNAL = !process.argv.includes("--no-external");
// The sitemap and canonical links always name the live host; on a local base read them as local.
const HOSTS = new Set([new URL(BASE).host, "www.yuigui.com", "yuigui.com"]);

const UA = { "user-agent": "yuigui-links/1 (+https://www.yuigui.com)" };
async function fetchT(url, opts = {}, ms = 15000) {
  const ctl = new AbortController();
  const t = setTimeout(() => ctl.abort(), ms);
  try { return await fetch(url, { redirect: "follow", headers: UA, ...opts, signal: ctl.signal }); }
  finally { clearTimeout(t); }
}
// Internal fetches retry: a crawl of a few thousand requests sees the odd dropped socket or 429 from the edge.
async function fetchR(url, opts = {}) {
  for (let i = 0; ; i++) {
    try {
      const res = await fetchT(url, opts);
      if ((res.status === 429 || res.status >= 500) && i < 3) { await new Promise((r) => setTimeout(r, 1500 * (i + 1))); continue; }
      return res;
    } catch (e) {
      if (i >= 3) throw e;
      await new Promise((r) => setTimeout(r, 1500 * (i + 1)));
    }
  }
}
const why = (e) => e.name === "AbortError" ? "timeout" : e.cause?.code || e.message || e.name;
async function pool(items, n, fn) {
  const out = new Array(items.length);
  let i = 0;
  await Promise.all(Array.from({ length: Math.min(n, items.length) }, async () => {
    while (i < items.length) { const k = i++; out[k] = await fn(items[k], k); }
  }));
  return out;
}
const decode = (s) => s.replace(/&amp;/g, "&").replace(/&#x27;|&#39;/g, "'").replace(/&quot;/g, '"').replace(/&lt;/g, "<").replace(/&gt;/g, ">");

// 1. Pages from the sitemap, read on BASE.
const toBase = (u) => { const x = new URL(u, BASE + "/"); return HOSTS.has(x.host) ? BASE + x.pathname + x.search : null; };
const smRes = await fetchR(`${BASE}/sitemap.xml`);
if (!smRes.ok) { console.error(`links: sitemap ${smRes.status} at ${BASE}/sitemap.xml`); process.exit(1); }
const pages = [...new Set([...(await smRes.text()).matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => toBase(decode(m[1]).trim())).filter(Boolean))];

// 2. Fetch each page, keep its ids and the links on it.
const ids = new Map();      // page path -> Set of ids
const found = new Map();    // internal target (path+search) -> { anchors: Map(anchor -> Set(page)), pages: Set(page) }
const external = new Map(); // external url -> Set(page)
const problems = [];
const pathOf = (u) => { const x = new URL(u); return x.pathname.replace(/\/$/, "") || "/"; };

function note(raw, page) {
  let s = decode(raw.trim());
  if (!s || /^(mailto|tel|javascript|data|blob|sms):/i.test(s) || s.startsWith("{")) return;
  let u;
  try { u = new URL(s, page); } catch { return; }
  if (!/^https?:$/.test(u.protocol)) return;
  if (!HOSTS.has(u.host)) {
    if (EXTERNAL) { const k = u.href.replace(/#.*$/, ""); (external.get(k) || external.set(k, new Set()).get(k)).add(page); }
    return;
  }
  // next/image hides the real asset in ?url=; check that instead of the optimizer.
  if (u.pathname === "/_next/image" && u.searchParams.get("url")) return note(u.searchParams.get("url"), page);
  if (u.pathname.startsWith("/_next/")) return; // build output, versioned per deploy
  const key = u.pathname + u.search;
  const f = found.get(key) || found.set(key, { anchors: new Map(), pages: new Set() }).get(key);
  f.pages.add(page);
  if (u.hash.length > 1) {
    const a = decodeURIComponent(u.hash.slice(1));
    (f.anchors.get(a) || f.anchors.set(a, new Set()).get(a)).add(page);
  }
}

let pageFails = 0;
await pool(pages, 6, async (page) => {
  let res;
  try { res = await fetchR(page); } catch (e) { problems.push({ url: page, why: `page did not load (${why(e)})`, on: ["sitemap"] }); pageFails++; return; }
  if (!res.ok) { problems.push({ url: page, why: `page ${res.status}`, on: ["sitemap"] }); pageFails++; return; }
  const html = await res.text();
  ids.set(pathOf(res.url), new Set([...html.matchAll(/\s(?:id|name)="([^"]+)"/g)].map((m) => decode(m[1]))));
  // Drop inline scripts (the RSC payload repeats every link) and read the markup only.
  const markup = html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, "");
  for (const m of markup.matchAll(/<(a|link|img|video|source|audio|iframe|track)\b([^>]*)>/gi)) {
    const [tag, attrs] = [m[1].toLowerCase(), m[2]];
    if (tag === "link" && !/\brel="(?:icon|apple-touch-icon|alternate|manifest|image_src)"/.test(attrs)) continue;
    for (const a of attrs.matchAll(/\s(href|src|poster|srcset|imagesrcset)="([^"]*)"/gi)) {
      if (/srcset/i.test(a[1])) a[2].split(",").forEach((c) => note(c.trim().split(/\s+/)[0], page));
      else note(a[2], page);
    }
  }
  for (const m of markup.matchAll(/<meta\b[^>]*\b(?:property|name)="(?:og:image|twitter:image|og:video)"[^>]*\bcontent="([^"]+)"/gi)) note(m[1], page);
});

// 3. Check every internal target once. Pages already fetched count as checked.
const fetched = new Set([...ids.keys()]);
const targets = [...found.keys()];
const status = new Map();
await pool(targets, 8, async (key) => {
  const url = BASE + key;
  const f = found.get(key);
  const needIds = f.anchors.size && !ids.has(pathOf(url));
  if (!key.includes("?") && fetched.has(pathOf(url)) && !needIds) { status.set(key, 200); return; }
  try {
    let res = needIds ? await fetchR(url) : await fetchR(url, { method: "HEAD" });
    if (!needIds && (res.status === 405 || res.status === 501)) res = await fetchR(url);
    status.set(key, res.status);
    if (res.ok && needIds) {
      const html = await res.text();
      ids.set(pathOf(res.url), new Set([...html.matchAll(/\s(?:id|name)="([^"]+)"/g)].map((m) => decode(m[1]))));
    }
  } catch (e) { status.set(key, why(e)); }
});
for (const key of targets) {
  const f = found.get(key), st = status.get(key);
  if (st !== 200 && !(typeof st === "number" && st >= 200 && st < 300)) {
    problems.push({ url: key, why: `${st}`, on: [...f.pages] });
    continue;
  }
  const have = ids.get(pathOf(BASE + key));
  if (!have) continue;
  for (const [a, on] of f.anchors) if (!have.has(a)) problems.push({ url: `${key}#${a}`, why: "anchor missing", on: [...on] });
}

// 4. External links: report only.
// One host at a time, one request at a time per host: GitHub answers 429 to anything faster.
const extBad = [];
let limited = 0;
if (EXTERNAL) {
  const byHost = new Map();
  for (const url of external.keys()) { const h = new URL(url).host; (byHost.get(h) || byHost.set(h, []).get(h)).push(url); }
  await pool([...byHost.values()], 8, async (urls) => {
    for (const url of urls) {
      try {
        let res = await fetchT(url, { method: "HEAD" }, 6000);
        if (res.status >= 400 && res.status !== 429) res = await fetchT(url, {}, 6000);
        if (res.status === 429) limited++;
        else if (res.status >= 400) extBad.push(`${url} (${res.status})`);
      } catch (e) { extBad.push(`${url} (${e.name === "AbortError" ? "timeout" : e.cause?.code || e.name})`); }
    }
  });
}

// 5. Trace each problem to a source line.
const sources = [join(ROOT, "ROADMAP.md"), join(SITE, "content", "progress.json"), join(SITE, "content", "showcase.json")].filter(existsSync);
(function walk(dir, re) {
  if (!existsSync(dir)) return;
  for (const f of readdirSync(dir)) {
    const p = join(dir, f);
    if (statSync(p).isDirectory()) { if (!/^(node_modules|\.next|drafts)$/.test(f)) walk(p, re); }
    else if (re.test(f)) sources.push(p);
  }
})(join(SITE, "app"), /\.(js|jsx|mjs|md)$/);
for (const d of ["spec", "docs"]) (function walk(dir) {
  if (!existsSync(dir)) return;
  for (const f of readdirSync(dir)) {
    const p = join(dir, f);
    if (statSync(p).isDirectory()) { if (f !== "drafts") walk(p); }
    else if (/\.md$/.test(f)) sources.push(p);
  }
})(join(ROOT, d));
const text = new Map(sources.map((f) => [f, readFileSync(f, "utf8").split("\n")]));
function trace(url) {
  // The URL as written, then without its anchor, then a relative markdown link to its last segment: [x](FLOWS.md).
  const seg = url.split("#")[0].split("/").pop();
  const needles = [...(/\.md$/.test(seg) ? [`](${seg}`] : []), url, url.split("#")[0], seg && `](${seg}`].filter((n, i, a) => n && n.length > 1 && a.indexOf(n) === i);
  for (const n of needles) {
    const hits = [];
    for (const [f, lines] of text) lines.forEach((l, i) => { if (l.includes(n)) hits.push(`${relative(ROOT, f)}:${i + 1}`); });
    if (hits.length) return hits;
  }
  return [];
}

const rel = (p) => p === "sitemap" ? p : new URL(p).pathname;
problems.sort((a, b) => a.url.localeCompare(b.url));
if (extBad.length) {
  console.log(`links: ${extBad.length} external ${extBad.length === 1 ? "link" : "links"} did not answer (reported, not failed)`);
  for (const e of extBad.sort()) console.log(`  ${e}`);
}
if (limited) console.log(`links: ${limited} external ${limited === 1 ? "link" : "links"} rate limited (429), not checked`);
const nAnchors = [...found.values()].reduce((n, f) => n + f.anchors.size, 0);
if (problems.length) {
  console.error(`links: ${problems.length} broken on ${BASE} (${pages.length} pages, ${targets.length} internal targets, ${nAnchors} anchors)`);
  for (const p of problems) {
    const src = trace(p.url);
    const on = p.on.map(rel);
    console.error(`  ${src.length ? src.slice(0, 4).join(", ") : "(no source line)"}: ${p.url} ${p.why}, on ${on.slice(0, 3).join(" ")}${on.length > 3 ? ` +${on.length - 3}` : ""}`);
  }
  process.exit(1);
}
console.log(`links: ok. ${pages.length} pages, ${targets.length} internal targets, ${nAnchors} anchors, ${external.size} external on ${BASE}`);
