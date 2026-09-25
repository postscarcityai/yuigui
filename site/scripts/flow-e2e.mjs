// FLOW-1 e2e: runs branch scenarios of the starter flows in the
// playground (every edge at least once) and checks the path, Back, edit from
// the review, the fold-back and the one {flow} event.
//   npx next dev -p 3117 &   then   node scripts/flow-e2e.mjs
// BASE overrides the playground URL; PLAYWRIGHT the Playwright module to load.
import { parse, resolve, flowEvent, flowPath } from "../lib/yl/yl.mjs";
import { STARTER_FLOWS, flowLines } from "../lib/yl/starter-flows.mjs";
const { chromium } = await import(process.env.PLAYWRIGHT || "playwright");
const BASE = process.env.BASE || "http://localhost:3117/playground";
const graph = (f) => resolve("flow", parse(flowLines(f)).find((o) => o.op === "patch").props);

const b = await chromium.launch();
let pass = 0, fail = 0;
const ok = (c, msg) => { if (c) pass++; else { fail++; console.log("  FAIL", msg); } };

async function open(slug, light = false) {
  const pg = await b.newPage({ viewport: { width: 1280, height: 900 } });
  await pg.addInitScript(() => { delete window.webkitSpeechRecognition; delete window.SpeechRecognition; });
  pg.errs = [];
  pg.on("pageerror", (e) => pg.errs.push(e.message));
  await pg.goto(`${BASE}?demo=${slug}${light ? "&theme=light" : ""}`);
  await pg.waitForSelector(".yl-flow");
  return pg;
}
const flowEl = (pg) => pg.locator(".yl-flow").last();
async function current(pg) {
  const f = flowEl(pg);
  if (await f.locator(".yl-planreview").count()) return "review";
  return f.locator(".yl-planstep:visible").first().getAttribute("data-step");
}
async function answer(pg, g, id, v) {
  const n = g.nodes.find((x) => x.id === id);
  const s = flowEl(pg).locator(`.yl-planstep[data-step="${id}"]`);
  switch (n.preset) {
    case "page": await flowEl(pg).locator(".bigbtns").last().getByRole("button", { name: /Next|Review/ }).click(); break;
    case "choose": case "ask":
      await s.getByRole("button", { name: v, exact: true }).click(); await pg.waitForTimeout(500);
      // Already that answer (after Back): the tap changes nothing, Next moves on.
      if ((await current(pg)) === id) await flowEl(pg).locator(".bigbtns").last().locator(".bigbtn.p").click();
      break;
    case "pick": {
      const on = await s.locator(".chip.on").allTextContents();
      if (on.length) { await flowEl(pg).locator(".bigbtns").last().locator(".bigbtn.p").click(); break; }
      for (const x of v) await s.getByRole("button", { name: x, exact: true }).click();
      await s.getByRole("button", { name: "Done" }).click(); break;
    }
    case "slide":
      await s.locator("input[type=range]").evaluate((el, val) => {
        Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value").set.call(el, String(val));
        el.dispatchEvent(new Event("input", { bubbles: true })); el.dispatchEvent(new Event("change", { bubbles: true }));
      }, v);
      await pg.waitForTimeout(80);
      await s.locator("input[type=range]").evaluate((el) => el.dispatchEvent(new PointerEvent("pointerup", { bubbles: true })));
      await pg.waitForTimeout(80);
      await flowEl(pg).locator(".bigbtns").last().getByRole("button", { name: /Next|Review/ }).click(); break;
    case "form": {
      const inputs = s.locator("input:not([type=range]), textarea");
      const cnt = await inputs.count();
      for (let i = 0; i < cnt; i++) {
        const t = await inputs.nth(i).getAttribute("type");
        await inputs.nth(i).fill(t === "date" ? "2026-10-01" : t === "url" ? "https://example.com" : t === "number" ? "5" : "Kiln & Co.");
      }
      await s.getByRole("button", { name: "Submit" }).click(); break;
    }
    case "mic": await s.locator(".yl-micbig").click(); await s.locator("input[name=t]").fill(v); await s.getByRole("button", { name: "Send" }).click(); break;
  }
  await pg.waitForTimeout(120);
}
async function lastEvent(pg) {
  const t = await pg.locator(".pg-ev.user code").first().textContent();
  return JSON.parse(t);
}

// scenario: flow name, answers by step id (what to tap), expected path
const SC = [
  ["website-intake", "shop, big budget: products, payments, the call", { biz: 1, kind: "Shop", products: 120, pay: ["Stripe"], goal: "Buy", pages: ["Home", "Contact"], brand: 1, budget: 30, meet: "Yes, book it" }],
  ["website-intake", "redesign, small budget", { biz: 1, kind: "Redesign", today: 1, goal: "Book", pages: ["Home"], brand: 1, budget: 5 }],
  ["website-intake", "landing page skips pages", { biz: 1, kind: "Landing page", goal: "Sign up", brand: 1, budget: 10 }],
  ["website-intake", "new site, budget right at 15", { biz: 1, kind: "New site", goal: "Call", pages: ["About"], brand: 1, budget: 15, meet: "Email is fine" }],
  ["self-scope", "software, months, hired out", { what: 1, kind: "Software", runs: ["Web", "iPhone"], size: "A few months", mvp: 1, who: "I'll hire it out", budget: 40, dates: 1, worry: "Scope creep" }],
  ["self-scope", "content, a weekend, just me", { what: 1, kind: "Content", size: "A weekend", who: "Just me", dates: 1, worry: "Time" }],
  ["workout-checkin", "bad night, it hurts", { sleep: 3, energy: "Low", sore: ["Back"], hurt: "It hurts", today: "Mobility only", time: 20, note: "Lower back tight" }],
  ["workout-checkin", "ok day, legs just sore, full session", { sleep: 7, energy: "OK", sore: ["Legs"], hurt: "Just sore", today: "Full session", time: 60, note: "Ready" }],
  ["workout-checkin", "great day, nothing sore, rest day", { sleep: 9, energy: "High", sore: ["Nothing"], today: "Rest day", note: "All good" }],
  ["onboarding", "new to AI, fit and food, no agent yet", { you: 1, know: 2, want: ["Get fit", "Eat better"], words: "Lose ten pounds", team: ["Coach", "Basil"] }],
  ["onboarding", "runs Hermes, get fit", { you: 1, know: 5, runs: "Hermes", want: ["Get fit"], words: "Run a 10k", team: ["Coach"] }],
  ["onboarding", "middle, eat better", { you: 1, know: 3, want: ["Eat better"], words: "Cook more", team: ["Basil"] }],
  ["onboarding", "knows AI, no agent, learn", { you: 1, know: 4, runs: "Not yet", want: ["Learn something"], words: "Spanish", team: ["Quill", "Penny"] }],
  ["onboarding", "runs OpenClaw, get organized", { you: 1, know: 4, runs: "OpenClaw", want: ["Get organized"], words: "My week", team: ["Penny"] }],
];
for (const [name, label, plan] of SC) {
  const f = STARTER_FLOWS.find((x) => x.name === name);
  const g = graph(f);
  console.log(`${name}: ${label}`);
  const pg = await open(`flow-${name}`);
  const seen = [];
  for (let guard = 0; guard < 30; guard++) {
    const id = await current(pg);
    if (id === "review") break;
    seen.push(id);
    await answer(pg, g, id, plan[id] === 1 ? null : plan[id]);
  }
  // expected: the answers as the playground records them
  const ansFor = (id) => { const n = g.nodes.find((x) => x.id === id); const v = plan[id];
    return n.preset === "form" ? "form" : v; };
  const want = flowEvent(g, Object.fromEntries(seen.filter((id) => g.nodes.find((x) => x.id === id).preset !== "page").map((id) => [id, ansFor(id)])));
  const rows = await flowEl(pg).locator(".yl-planrow .lbl").allTextContents();
  ok(rows.length === Object.keys(want.flow).length, `review lists only answered steps on the path (${rows.length} vs ${Object.keys(want.flow).length})`);
  // Back from the review walks the path taken
  await flowEl(pg).locator(".bigbtns").last().locator(".bigbtn.s").click();
  ok((await current(pg)) === seen[seen.length - 1], `Back from review lands on ${seen[seen.length - 1]}`);
  await flowEl(pg).locator(".bigbtns").last().locator(".bigbtn.s").click();
  ok((await current(pg)) === seen[seen.length - 2], `Back again lands on ${seen[seen.length - 2]}`);
  // forward to the review again
  for (let guard = 0; guard < 5 && (await current(pg)) !== "review"; guard++) {
    const id = await current(pg);
    await answer(pg, g, id, plan[id] === 1 ? null : plan[id]);
  }
  ok((await current(pg)) === "review", "back at the review");
  await flowEl(pg).locator(".bigbtns").last().locator(".bigbtn.p").click();
  await pg.waitForTimeout(300);
  const ev = await lastEvent(pg);
  const path = ev.path;
  ok(JSON.stringify(path) === JSON.stringify(seen), `path ${JSON.stringify(path)} == seen ${JSON.stringify(seen)}`);
  ok(JSON.stringify(Object.keys(ev.flow).sort()) === JSON.stringify(Object.keys(want.flow).sort()), `event keys ${Object.keys(ev.flow)}`);
  for (const [k, v] of Object.entries(want.flow)) if (v !== "form") ok(JSON.stringify(ev.flow[k]) === JSON.stringify(v), `answer ${k}=${JSON.stringify(ev.flow[k])} want ${JSON.stringify(v)}`);
  ok(ev.preset === "flow" && ev.id === f.id, "event id and preset");
  ok((await pg.locator(".pg-ev.user").count()) === 1, "exactly one event for the whole flow");
  ok(pg.errs.length === 0, `no page errors ${pg.errs}`);
  await pg.close();
}

// Edit from the review switches branch: Shop -> Landing page drops products/pay/pages
{
  console.log("website-intake: edit a branch answer from the review");
  const f = STARTER_FLOWS[0]; const g = graph(f);
  const pg = await open("flow-website-intake");
  const plan = { biz: 1, kind: "Shop", products: 50, pay: ["Square"], goal: "Buy", pages: ["Home"], brand: 1, budget: 4 };
  for (let i = 0; i < 30 && (await current(pg)) !== "review"; i++) { const id = await current(pg); await answer(pg, g, id, plan[id] === 1 ? null : plan[id]); }
  const before = await flowEl(pg).locator(".yl-planrow .lbl").count();
  await flowEl(pg).locator(".yl-planrow", { hasText: "What are we building?" }).click();
  ok((await current(pg)) === "kind", "Edit opens the step");
  await answer(pg, g, "kind", "Landing page");
  ok((await current(pg)) === "review", `a complete path goes straight back to the review (at ${await current(pg)})`);
  const after = await flowEl(pg).locator(".yl-planrow .lbl").allTextContents();
  ok(after.length === before - 3 && !after.some((t) => /products|payment|pages/i.test(t)), `review drops the off-path steps (${before} -> ${after.length})`);
  await flowEl(pg).locator(".bigbtns").last().locator(".bigbtn.p").click();
  await pg.waitForTimeout(300);
  const ev = await lastEvent(pg);
  ok(!("products" in ev.flow) && !("pages" in ev.flow) && ev.flow.kind === "Landing page", `event drops answers off the path ${JSON.stringify(ev.flow)}`);
  // the chat keeps a record and the person's answers
  ok((await pg.locator(".yl-record").count()) === 1, "folded into a record in the chat");
  ok(/What are we building\? Landing page/.test(await pg.locator(".yl-me").first().textContent()), "answers land as the person's message");
  await pg.close();
}

// Saved flow by name
{
  console.log("saved flow: flow website-intake");
  const pg = await open("flow-saved");
  ok((await flowEl(pg).locator(".yl-q").first().textContent()) === "Client website intake", "saved flow found by name");
  ok((await current(pg)) === "hi", "starts at the first step");
  await pg.close();
}
// every edge of every starter flow taken at least once
for (const f of STARTER_FLOWS) {
  const g = graph(f);
  const taken = new Set();
  for (const [name, , plan] of SC.filter(([n]) => n === f.name)) {
    const { path } = flowPath(g, Object.fromEntries(Object.entries(plan).map(([k, v]) => [k, v === 1 ? "form" : v])));
    // walk edges between consecutive steps, through step-less nodes
    for (let i = 0; i < path.length; i++) {
      const from = path[i], to = path[i + 1] ?? null;
      const walk = (at, seen) => { for (const e of g.edges.filter((e) => e.from === at)) {
        const n = g.nodes.find((x) => x.id === e.to);
        if (e.to === to || (!to && !n.preset && !g.edges.some((x) => x.from === e.to))) { taken.add(`${e.from}>${e.to}`); return true; }
        if (!n.preset && !seen.has(e.to) && walk(e.to, new Set([...seen, e.to]))) { taken.add(`${e.from}>${e.to}`); return true; }
      } return false; };
      walk(from, new Set([from]));
    }
  }
  const all = g.edges.map((e) => `${e.from}>${e.to}`);
  const missed = all.filter((e) => !taken.has(e));
  ok(!missed.length, `${f.name}: every edge taken (${all.length - missed.length}/${all.length}) missed ${missed}`);
  console.log(`${f.name}: ${all.length - missed.length}/${all.length} edges taken`);
}
console.log(`\n${pass} passed, ${fail} failed`);
await b.close();
process.exit(fail ? 1 : 0);
