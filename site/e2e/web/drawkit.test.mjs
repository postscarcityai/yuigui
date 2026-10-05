// YUI-301 e2e: the drawing kit draws on /web. The replies are the playground's own demos (lib/yl/samples.mjs, FLOWS):
// "drawkit" (YUI-291: Venn overlap, contour rings, callouts, a bracket, bent arrows), "handdrawn" (YUI-298: +hand
// strokes, scribble, underline, check) and "drawkit-plan" (a Venn as a plan page). Each is sent as a real reply,
// played on the stage one part at a time (the stage draws a deck page's picture from the part, so a picture nested
// in a page must still find its lines), and every shape is read back from the SVG: it exists, its label shows,
// a Venn overlap carries its word, +hand differs from the clean stroke, a mark sits on its target, nothing leaves
// the 390 frame, no console errors. A reload draws the same strokes again. Backend stubbed in the browser, session
// seeded, reduced motion so the drawing is finished when read. Prod build only (CSP):
//   npm run build && npx next start -p 3301 &   then   node e2e/web/drawkit.test.mjs
import { createRequire } from "node:module";
import { readFileSync, mkdirSync } from "node:fs";
const { chromium } = createRequire(import.meta.url)(process.env.PLAYWRIGHT || "playwright");
const BASE = process.env.BASE || "http://localhost:3301";
const SHOTS = process.env.SHOTS || "";
if (SHOTS) mkdirSync(SHOTS, { recursive: true });
let pass = 0, fail = 0;
const ok = (c, msg) => { if (c) { pass++; console.log("  ok  ", msg); } else { fail++; console.log("  FAIL", msg); } };
const penny = JSON.parse(readFileSync(new URL("../../app/web/fixtures/penny.json", import.meta.url), "utf8"));
const CORS = { "access-control-allow-origin": "*", "access-control-allow-headers": "*", "access-control-allow-methods": "GET, POST, PATCH, OPTIONS" };
const NOW = Date.now();
const row = (i, body, extra = {}) => ({ id: `00000000-0000-4000-8000-${String(i).padStart(12, "0")}`, sender: i % 2 ? "user" : "agent", body, kind: "text", meta: {}, created_at: new Date(NOW - (20 - i) * 60000).toISOString(), delivered_at: null, handled_at: null, reaction: null, doing: null, ...extra });
const chat = { id: "10000000-0000-4000-8000-000000000001", title: null, is_first: true, last_at: new Date(NOW).toISOString(), seen_at: new Date(NOW).toISOString(), unread: false, last_body: "x", last_sender: "agent", last_message_at: new Date(NOW).toISOString() };

function backend() {
  const s = { rows: [], posts: [] };
  s.handle = async (route) => {
    const req = route.request();
    if (req.method() === "OPTIONS") return route.fulfill({ status: 204, headers: CORS });
    const u = new URL(req.url());
    const fn = u.pathname.split("/").pop();
    const json = (body) => route.fulfill({ status: 200, headers: { ...CORS, "content-type": "application/json" }, body: JSON.stringify(body) });
    if (req.method() === "POST" && fn === "yui_messages") { try { s.posts.push(req.postDataJSON()); } catch { /* not json */ } return json([]); }
    if (fn === "yui-auth") return json({ access_token: "at1", token_type: "bearer", expires_in: 3600, refresh_token: "rt1", user: { id: "u1", email: "chris@example.com" } });
    if (fn === "yui-agents") return json({ agents: penny.agents, crew: [], first_name: "Chris" });
    if (fn === "yui-account") return json({ user: { id: "u1", email: "chris@example.com" }, look: null });
    if (fn === "yui_messages") return u.searchParams.get("created_at") ? json([]) : json(s.rows.slice().reverse());
    if (fn === "yui_chat_list") return json([chat]);
    if (fn === "yui_threads") return json([]);
    return json(u.pathname.includes("/rest/") ? [] : {});
  };
  return s;
}
const bodies = (s) => s.posts.flat().map((p) => String(p?.body ?? ""));

const { FLOWS } = await import("../../lib/yl/samples.mjs");
const demo = (slug) => FLOWS.find((d) => d.slug === slug).yl;
const fence = (yl) => "```yui\n" + yl + "\n```";
const norm = (t) => String(t).replace(/\s+/g, "").toLowerCase();

// Everything a check needs from the svg that is on screen: strokes with their boxes (viewBox units), words, dots.
const READ = () => {
  const svgs = [...document.querySelectorAll(".wb-stage-in .ys-pic svg.yl-shsvg")].filter((s) => { const r = s.getBoundingClientRect(); return r.width > 0 && r.left >= -1 && r.right <= innerWidth + 1; });
  const svg = svgs[0];
  if (!svg) return null;
  // A box in the svg's own units: shapes are drawn around (0, 0) inside a moved group, so map through the matrices.
  const box = (e) => {
    const b = e.getBBox(), m = svg.getScreenCTM().inverse().multiply(e.getScreenCTM());
    const pts = [[b.x, b.y], [b.x + b.width, b.y], [b.x, b.y + b.height], [b.x + b.width, b.y + b.height]].map(([x, y]) => [m.a * x + m.c * y + m.e, m.b * x + m.d * y + m.f]);
    const xs = pts.map((p) => p[0]), ys = pts.map((p) => p[1]);
    const x = Math.min(...xs), y = Math.min(...ys), w = Math.max(...xs) - x, h = Math.max(...ys) - y;
    return { x, y, w, h, cx: x + w / 2, cy: y + h / 2 };
  };
  const r = svg.getBoundingClientRect();
  const out = (e) => { const q = e.getBoundingClientRect(); return q.left < -1 || q.right > innerWidth + 1; };
  const paths = [...svg.querySelectorAll("path")].map((p) => ({ d: p.getAttribute("d"), dash: p.getAttribute("stroke-dasharray") || "", fill: p.getAttribute("fill"), mark: !!p.closest(".sh-mark"), blend: !!p.closest(".sh-blend"), ...box(p), out: out(p) }));
  const texts = [...svg.querySelectorAll("text")].map((t) => ({ t: [...t.querySelectorAll("tspan")].map((x) => x.textContent).join(" "), vis: t.getBoundingClientRect().width > 0, ...box(t), out: out(t) }));
  const dots = [...svg.querySelectorAll("circle")].map((c) => ({ cx: +c.getAttribute("cx"), cy: +c.getAttribute("cy") }));
  return { vb: svg.getAttribute("viewBox").split(" ").map(Number), cap: svg.parentElement.querySelector(".yl-shcap")?.textContent || "", left: r.left, right: r.right, paths, texts, dots, wide: document.documentElement.scrollWidth };
};

const within = (b, t, slack = 0.05) => b.cx >= t.x - slack && b.cx <= t.x + t.w + slack && b.cy >= t.y - slack && b.cy <= t.y + t.h + slack;
const label = (s, w) => s.texts.find((t) => norm(t.t) === norm(w));
const bigs = (s) => s.paths.filter((p) => !p.mark);
// The shape (closed box path) a label sits in.
const around = (s, w) => { const l = label(s, w); return l && bigs(s).filter((p) => p.w > 0.5 && within(l, p)).sort((a, b) => a.w * a.h - b.w * b.h)[0]; };

// What each page of each reply must show. A check returns [ok, message].
const PAGES = {
  drawkit: [
    ["Three circles, three washes, one middle.", (s) => {
      const c = bigs(s).filter((p) => p.w > 3 && p.w < 4.6);
      const yui = label(s, "Yui");
      return [
        [c.length === 3, "a Venn: three circles drawn"],
        [["Design", "Code", "Words", "Yui"].every((w) => label(s, w)?.vis), "the three names and the overlap word show"],
        [yui && c.length === 3 && c.every((p) => within(yui, p)), "the overlap word sits inside all three circles"],
        [s.paths.filter((p) => p.blend).length >= 3, "the circles blend where they cross"],
        [new Set(c.map((p) => p.cx.toFixed(1) + p.cy.toFixed(1))).size === 3, "three different circles, not one drawn thrice"],
      ];
    }],
    ["A hill, a flood zone, and the one place to look.", (s) => {
      const rings = s.paths.filter((p) => /^M[^A]*C[^A]*Z$/.test(p.d) && !p.dash && !p.mark && p.w > 0.8);
      const peak = s.texts.find((t) => norm(t.t) === "peak");
      const zone = label(s, "Flood zone");
      const hill = rings.sort((a, b) => b.w - a.w)[0];
      const leader = s.dots[0];
      return [
        [rings.length >= 6, `a contour: ${rings.length} rings`],
        [rings.every((p, i, a) => i === 0 || p.w <= a[i - 1].w + 0.01) && rings[0].w > rings.at(-1).w * 2, "the rings nest, big to small"],
        [peak?.vis && within(peak, { x: hill.x - 1, y: hill.y - 1, w: hill.w + 2, h: hill.h + 2 }), "the peak is named and sits on the hill"],
        [s.paths.some((p) => p.dash && /Z$/.test(p.d)), "the flood zone is a dashed closed region"],
        [zone?.vis, "the callout's words show"],
        [leader && Math.abs(leader.cx - 8.3) < 0.1 && Math.abs(leader.cy - 2.6) < 0.1, `the callout ends on its target (${leader?.cx},${leader?.cy})`],
      ];
    }],
    ["A feed screen, annotated.", (s) => {
      const starts = label(s, "Starts here"), swipe = label(s, "Swipe to dismiss"), feed = label(s, "Feed");
      const phone = bigs(s).filter((p) => p.h > 4 && p.w > 2.5 && p.w < 4)[0];
      const near = (d, x, y) => d && Math.abs(d.cx - x) < 0.1 && Math.abs(d.cy - y) < 0.1;
      return [
        [!!phone, "the phone box is drawn"],
        [["Search", "Card", "Tabs"].every((w) => label(s, w)?.vis) && s.texts.filter((t) => norm(t.t) === "card").length === 2, "pill, two cards and tabs are labelled"],
        [starts?.vis && swipe?.vis, "both callouts say their words"],
        [s.dots.length === 2 && near(s.dots[0], 6, 0.9) && near(s.dots[1], 6, 3.2), "each callout lands on its part"],
        [feed?.vis && feed.cx < phone.x, "the bracket is named and stands left of the phone"],
      ];
    }],
    ["Ask, build, ship. Then you ask again.", (s) => {
      const circles = ["Ask", "Build", "Ship"].map((w) => around(s, w));
      const arcs = s.paths.filter((p) => /^M[^QCLZ]*Q/.test(p.d));
      const heads = s.paths.filter((p) => /^M[^QC]*L[^QC]*L[^QC]*$/.test(p.d));
      const ends = arcs.map((a) => { const n = a.d.match(/-?\d+\.?\d*/g).map(Number); return [n.at(-2), n.at(-1)]; });
      const hits = (c) => c && ends.some(([x, y]) => Math.hypot(x - c.cx, y - c.cy) < c.w / 2 + 0.4);
      return [
        [circles.every(Boolean), "three circles carry their words"],
        [arcs.length === 3, `three bent arrows (${arcs.length})`],
        [heads.length >= 3, "each arrow has its head"],
        [circles.every(hits), "every circle has an arrow arriving at it, so the loop closes"],
        [arcs.every((a) => a.h > 0.05 && a.w > 0.05), "the arrows bend (their boxes have height and width)"],
      ];
    }],
  ],
  handdrawn: [
    ["Same three parts, plain then hand drawn.", (s) => {
      const plain = (w, kind) => around(s, w);
      const pairs = [["Plain", "Sketch"]];
      const boxes = s.texts.filter((t) => norm(t.t) === "plain").map((t) => t);
      const shape = (t) => bigs(s).filter((p) => p.w > 0.5 && within(t, p)).sort((a, b) => a.w * a.h - b.w * b.h)[0];
      const plains = s.texts.filter((t) => norm(t.t) === "plain").map(shape);
      const sketches = s.texts.filter((t) => norm(t.t) === "sketch").map(shape);
      const blobs = s.texts.filter((t) => norm(t.t) === "blob").map(shape);
      const differ = (a, b) => a && b && a.d !== b.d;
      return [
        [plains.length === 2 && plains.every(Boolean) && sketches.length === 2 && sketches.every(Boolean), "plain and sketch shapes are both drawn"],
        [differ(plains[0], sketches[0]) && plains[0].d.length < sketches[0].d.length * 1.5, "the +hand box is a different stroke from the clean box"],
        [differ(plains[1], sketches[1]), "the +hand circle is a different stroke from the clean circle"],
        [blobs.length === 2 && differ(blobs[0], blobs[1]), "the +hand blob is a different stroke from the clean blob"],
        [sketches[0] && /C/.test(sketches[0].d) && !/A/.test(sketches[0].d), "a +hand outline is a free curve, not the clean arcs"],
        [["Plain", "Sketch"].every((w) => s.texts.filter((t) => norm(t.t) === norm(w) && t.vis).length === 2), "every label shows"],
      ];
    }],
    ["Look here, this one, done.", (s) => {
      const marks = s.paths.filter((p) => p.mark);
      const card = around(s, "Pricing page"), word = label(s, "Ship it today"), task = around(s, "Fix the login");
      const scribble = marks.find((m) => card && within(m, card));
      const underline = marks.find((m) => word && m.cy > word.cy && m.cy < word.cy + 1.2 && m.h < 0.6 && m.x >= word.x - 1 && m.x + m.w <= word.x + word.w + 1.5);
      const check = marks.find((m) => task && m.cy > task.y - 0.3 && m.cy < task.y + task.h + 0.3 && m.cx > task.cx);
      const free = marks.find((m) => m.cx > 6.5 && m.cy > 1.2 && m.cy < 4);
      return [
        [marks.length === 4, `four hand marks drawn (${marks.length})`],
        [!!scribble && scribble.w > card.w * 0.6, "the scribble rings the pricing box"],
        [!!underline, "the underline sits just under its words"],
        [!!check && Math.abs(check.cx - (task.x + task.w)) < 1.2 && check.w < 1.2, "the check stands at the end of its pill"],
        [!!free, "the free scribble fills its own spot"],
        [s.paths.some((p) => !p.mark && /^M5\.[4-8]\d* 1\.[2-5]\d*C/.test(p.d) && p.w > 0.8 && p.h > 0.5), "the +hand arrow leaves its start as a wobbly curve"],
        [["Pricing page", "Ship it today", "Fix the login"].every((w) => label(s, w)?.vis), "the words show"],
      ];
    }],
  ],
};

const PLAN = ["Pick the overlap", (s) => {
  const c = bigs(s).filter((p) => p.w > 3);
  const build = label(s, "Build");
  return [
    [c.length === 2, "the plan page draws its two circles"],
    [["Likes", "Pays", "Build"].every((w) => label(s, w)?.vis), "the labels show"],
    [build && c.every((p) => within(build, p)), "the overlap word sits where the circles cross"],
  ];
}];

const SEED = () => {
  if (window !== window.top || !/^https?:$/.test(location.protocol)) return;
  const r = indexedDB.open("yui-web", 1);
  r.onupgradeneeded = () => r.result.createObjectStore("session");
  r.onsuccess = () => {
    const db = r.result;
    if (!db.objectStoreNames.contains("session")) return db.close();
    const g = db.transaction("session").objectStore("session").get("session");
    g.onsuccess = () => { if (!g.result && !sessionStorage.getItem("__signedout")) db.transaction("session", "readwrite").objectStore("session").put({ refresh: "rt0", user: { id: "u1", email: "chris@example.com" }, at: Date.now() }, "session"); };
  };
};

// Play the reply on the stage and read every part's drawing: { caption: reading }, in the order they show.
async function play(pg, url, wanted) {
  await pg.goto(url);
  await pg.getByTestId("play-on-stage").first().click();
  const seen = new Map();
  const next = pg.getByRole("button", { name: "Next part" });
  const read = async () => { const s = await pg.evaluate(READ); if (s && s.cap && s.paths.length && !seen.has(s.cap)) seen.set(s.cap, s); };
  for (let i = 0; i < 12 && seen.size < wanted; i++) {
    await pg.waitForTimeout(700);
    await read();
    // The button is disabled on the last part; give a slow part a moment before calling it the end.
    let go = false;
    for (let k = 0; k < 6 && !go; k++) { go = (await next.count()) > 0 && !(await next.isDisabled().catch(() => true)); if (!go) await pg.waitForTimeout(250); }
    if (!go) break;
    await next.click();
  }
  await pg.waitForTimeout(500);
  await read();
  return seen;
}
const sig = (seen) => JSON.stringify([...seen].map(([k, s]) => [k, s.paths.map((p) => p.d), s.texts.map((t) => t.t)]));

const b = await chromium.launch();
for (const theme of ["dark", "light"]) {
  const tag = `${theme} 390`;
  const vp = { width: 390, height: 844 };
  const ctx = await b.newContext({ viewport: vp, colorScheme: theme, reducedMotion: "reduce", deviceScaleFactor: 2 });
  await ctx.addInitScript(SEED);
  const srv = backend();
  await ctx.route("**/appleid.cdn-apple.com/**", (r) => r.fulfill({ status: 200, contentType: "text/javascript", body: "window.AppleID={auth:{init(){},signIn(){return Promise.reject({error:'user_cancelled_authorize'})}}}" }));
  await ctx.route("**/functions/v1/**", srv.handle);
  await ctx.route("**/rest/v1/**", srv.handle);
  const errs = [];
  ctx.on("page", (p) => { p.on("pageerror", (e) => errs.push(`${e}`)); p.on("console", (m) => { if (m.type() === "error") errs.push(m.text().slice(0, 160)); }); });
  const url = `${BASE}/web/agent/demo-penny?view=chat&theme=${theme}`;
  const shot = async (pg, n) => { if (SHOTS) await pg.screenshot({ path: `${SHOTS}/web-drawkit-${n}-390-${theme}.png` }); };

  for (const [slug, pages] of [["drawkit", PAGES.drawkit], ["handdrawn", PAGES.handdrawn], ["drawkit-plan", [PLAN]]]) {
    srv.rows = [row(1, "Draw it."), row(2, fence(demo(slug)))];
    const pg = await ctx.newPage();
    const seen = await play(pg, url, pages.length);
    ok(seen.size === pages.length, `${tag} ${slug}: the stage drew ${pages.length} drawings (${seen.size})`);
    let i = 0;
    for (const [cap, check] of pages) {
      i++;
      const s = [...seen.values()].find((x) => x.cap === cap) || [...seen.values()][i - 1];
      if (!s || !s.paths.length) { ok(false, `${tag} ${slug} page ${i}: the drawing has strokes (${s ? 0 : "missing"})`); continue; }
      ok(true, `${tag} ${slug} page ${i}: ${s.paths.length} strokes, ${s.texts.length} words`);
      for (const [good, msg] of check(s)) ok(!!good, `${tag} ${slug} page ${i}: ${msg}`);
      ok(s.left >= 0 && s.right <= 390 && s.wide <= 390 && s.paths.every((p) => !p.out) && s.texts.every((t) => !t.out), `${tag} ${slug} page ${i}: nothing leaves the 390 frame`);
    }
    // Shots: each reply's last drawn part, then the page after a reload.
    await shot(pg, slug);
    const before = sig(seen);
    await pg.reload();
    const again = await play(pg, url, pages.length);
    ok(sig(again) === before, `${tag} ${slug}: after a reload the same strokes are drawn`);
    await pg.close();
  }
  ok(!errs.length, `${tag}: no console errors${errs.length ? " " + errs[0] : ""}`);
  await ctx.close();
}
await b.close();
console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
