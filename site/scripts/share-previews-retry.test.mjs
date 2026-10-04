// Retry behaviour of share-previews.mjs (SITE-178). node site/scripts/share-previews-retry.test.mjs   exit 1 on any failure
import http from "node:http";
import { fileURLToPath } from "node:url";

const script = fileURLToPath(new URL("./share-previews.mjs", import.meta.url));
let bad = 0;
const eq = (name, got, want) => {
  if (JSON.stringify(got) !== JSON.stringify(want)) { bad++; console.log(`FAIL ${name}\n  got  ${JSON.stringify(got)}\n  want ${JSON.stringify(want)}`); }
};

const hits = {};
const page = (n) => `<html><head><meta property="og:title" content="Page ${n}"><meta property="og:description" content="d"><meta property="og:image" content="/img/${n}.png"><meta name="twitter:card" content="summary"></head></html>`;
const server = http.createServer((req, res) => {
  const path = req.url;
  hits[path] = (hits[path] || 0) + 1;
  const base = `http://127.0.0.1:${server.address().port}`;
  if (path === "/sitemap.xml") return res.end(`<urlset><loc>${base}/</loc><loc>${base}/flaky</loc><loc>${base}/flaky-img</loc><loc>${base}/gone</loc></urlset>`);
  if (path === "/") return res.end(page("home"));
  if (path === "/flaky") { if (hits[path] === 1) return req.socket.destroy(); return res.end(page("flaky")); }
  if (path === "/flaky-img") return res.end(page("flaky-img"));
  if (path === "/img/flaky-img.png" && hits[path] === 1) return req.socket.destroy();
  if (path === "/gone") { res.statusCode = 404; return res.end("nope"); }
  if (path.startsWith("/img/")) { res.setHeader("content-type", "image/png"); return res.end("x"); }
  res.statusCode = 404; res.end();
});
await new Promise((r) => server.listen(0, "127.0.0.1", r));
const base = `http://127.0.0.1:${server.address().port}`;

const run = () => new Promise((resolve) => {
  import("node:child_process").then(({ spawn }) => {
    const p = spawn("node", [script, "--base", base]);
    let err = "";
    p.stderr.on("data", (d) => (err += d));
    p.on("close", (code) => resolve({ code, err }));
  });
});
const { code, err } = await run();
server.close();

eq("flaky page retried, fetched twice", hits["/flaky"], 2);
eq("flaky image retried, fetched twice", hits["/img/flaky-img.png"], 2);
eq("404 page not retried", hits["/gone"], 1);
eq("exit 1 for the real 404", code, 1);
const lines = err.split("\n").filter((l) => l.includes(": ") && !l.includes("pages have a problem"));
eq("only the real 404 is reported", lines.map((l) => l.replace(/^share-previews: /, "").split(":")[0]), ["/gone"]);

if (bad) { console.log(`${bad} failed`); process.exit(1); }
console.log("share-previews-retry: all passed");
