// Live share preview crawl (SITE-171). Reads the sitemap, then for every page records og:title,
// og:description, og:image, twitter:card and whether the image answers 200 as an image.
// Fails a page with no og:image, a non-200 or non-image picture, no twitter card, a title that is only the
// site name, a description over 160 characters, or a picture shared with the home page.
// Run: node scripts/share-previews.mjs [--base https://www.yuigui.com] [--write ../docs/specs/share-previews.md]
//   Exit 0 when every page passes, 1 with one line per problem.
const arg = (k) => { const i = process.argv.indexOf(k); return i > 0 ? process.argv[i + 1] : null; };
const BASE = (arg("--base") || "https://www.yuigui.com").replace(/\/$/, "");
const OUT = arg("--write");

const meta = (html, re) => {
  for (const m of html.matchAll(/<meta\s[^>]*>/g)) {
    const t = m[0];
    const key = t.match(/\b(?:property|name)="([^"]+)"/)?.[1];
    if (key && re.test(key)) return t.match(/\bcontent="([^"]*)"/)?.[1]?.replace(/&amp;/g, "&").replace(/&#x27;|&#39;/g, "'").replace(/&quot;/g, '"') ?? "";
  }
  return "";
};

// One network blip must not block a push (SITE-178): a thrown fetch (reset, DNS, timeout) or a 502/503/504
// is retried up to 2 more times with a short backoff. A 404 or a wrong picture is a real problem and fails at once.
const RETRIES = 2;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const fetchRetry = async (url) => {
  for (let n = 0; ; n++) {
    try {
      const res = await fetch(url, { redirect: "follow", signal: AbortSignal.timeout(15000) });
      if (![502, 503, 504].includes(res.status) || n >= RETRIES) return res;
      await res.arrayBuffer();
    } catch (e) { if (n >= RETRIES) throw e; }
    await sleep(300 * (n + 1));
  }
};

// AbortSignal.timeout's timer is unref'd: a stalled socket could let Node exit mid-crawl ("unsettled top-level
// await") instead of timing out. This ref'd tick keeps the loop alive until the crawl settles.
const keepAlive = setInterval(() => {}, 1000);
const sitemap = await (await fetchRetry(`${BASE}/sitemap.xml`)).text();
const urls = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1].replace(/^https?:\/\/[^/]+/, BASE));
const rows = [];
let i = 0;
const grab = async (u) => {
  const row = { url: u, problems: [] };
  try {
    const res = await fetchRetry(u);
    const html = await res.text();
    row.status = res.status;
    row.title = meta(html, /^og:title$/);
    row.desc = meta(html, /^og:description$/);
    row.image = meta(html, /^og:image$/);
    row.card = meta(html, /^twitter:card$/);
    if (row.image) {
      const img = await fetchRetry(new URL(row.image, BASE));
      row.imageStatus = img.status;
      row.imageType = img.headers.get("content-type") || "";
      await img.arrayBuffer();
    }
  } catch (e) { row.problems.push(`fetch failed: ${e.cause?.code || e.message}`); }
  return row;
};
await Promise.all(Array.from({ length: 8 }, async () => {
  while (i < urls.length) rows.push(await grab(urls[i++]));
}));
clearInterval(keepAlive);
rows.sort((a, b) => a.url.localeCompare(b.url));

const home = rows.find((r) => r.url === BASE || r.url === `${BASE}/`);
for (const r of rows) {
  const p = r.problems;
  if (r.status && r.status !== 200) p.push(`page answers ${r.status}`);
  if (!r.image) p.push("no og:image");
  else if (r.imageStatus !== 200) p.push(`og:image answers ${r.imageStatus}`);
  else if (!r.imageType.startsWith("image/")) p.push(`og:image is ${r.imageType}, not an image`);
  if (r.status === 200 && !r.card) p.push("no twitter:card");
  if (r.status === 200 && (!r.title || /^Yui$/i.test(r.title.trim()))) p.push(`title is only "${r.title}"`);
  if ((r.desc || "").length > 160) p.push(`description is ${r.desc.length} chars`);
  if (r.status === 200 && !r.desc) p.push("no og:description");
  if (home && r !== home && r.image && r.image === home.image) p.push("shares the home page picture");
}

if (OUT) {
  const { writeFileSync } = await import("node:fs");
  const esc = (s) => String(s ?? "").replace(/\|/g, "\\|");
  const lines = [
    "# Share previews", "",
    `What every page in the sitemap shows when pasted into iMessage, Slack or X. Crawled from ${BASE} on ${new Date().toISOString().slice(0, 10)} by site/scripts/share-previews.mjs.`, "",
    `${rows.length} pages, ${rows.filter((r) => r.problems.length).length} with a problem.`, "",
    "| Page | og:title | og:description | og:image | card | image | problems |", "|---|---|---|---|---|---|---|",
    ...rows.map((r) => `| ${esc(r.url.replace(BASE, "") || "/")} | ${esc(r.title)} | ${(r.desc || "").length} chars | ${esc((r.image || "").replace(BASE, "").slice(0, 60))} | ${esc(r.card)} | ${r.imageStatus ?? "-"} | ${esc(r.problems.join("; "))} |`),
    "",
  ];
  writeFileSync(OUT, lines.join("\n"));
}

const bad = rows.filter((r) => r.problems.length);
for (const r of bad) console.error(`share-previews: ${r.url.replace(BASE, "") || "/"}: ${r.problems.join("; ")}`);
if (bad.length) { console.error(`share-previews: ${bad.length} of ${rows.length} pages have a problem`); process.exit(1); }
console.log(`share-previews ok: ${rows.length} pages, each with its own og:image answering 200`);
