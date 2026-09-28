// SITE-69 e2e: Meet the crew in the site chat, end to end, on a phone. Opens the chat, taps Meet the
// crew, and for each of the five: taps them, runs their flow to its Send, checks their answer wears
// their color and ends in one like or dislike question, taps it, and lands on Meet another.
// Every step is answered with no model turn, so a stand-in key is enough:
//   YUI_CHAT_OPENROUTER_KEY=x npx next dev -p 3169 &   then   node scripts/crew-e2e.mjs
// BASE overrides the site URL; PLAYWRIGHT the Playwright module to load; SHOTS a folder for screenshots.
import { mkdirSync } from "node:fs";
import { parse, resolve } from "../lib/yl/yl.mjs";
import { STARTER_FLOWS, flowLines } from "../lib/yl/starter-flows.mjs";
import { CREW } from "../lib/chat/crew.mjs";
const { chromium } = await import(process.env.PLAYWRIGHT || "playwright");
const BASE = process.env.BASE || "http://localhost:3169";
const SHOTS = process.env.SHOTS || "";
if (SHOTS) mkdirSync(SHOTS, { recursive: true });
const graph = (name) => resolve("flow", parse(flowLines(STARTER_FLOWS.find((f) => f.name === name))).find((o) => o.op === "patch").props);

// One run per member: what to tap at each step (1: any, the step's own default).
const RUNS = {
  Arnold: { sleep: 8, sore: ["Nothing"], minutes: 30, gear: "Just me", warm: "Yes, 3 minutes" },
  Basil: { photo: "Salmon", portion: "Half", meal: "Dinner" },
  Gouda: { vibe: "Lo-fi", lofibpm: 80, row: "Busier hats", chords: "Warm", major: "G" },
  Penny: { on: ["Errands", "Bills"], top: "Bills", when: "Whenever it fits", pace: "3 to 5" },
  Quill: { topic: "How a ball flies", know: "A little", bq: "45 degrees", again: "In 3 days" },
};

const b = await chromium.launch();
let pass = 0, fail = 0;
const ok = (c, msg) => { if (c) pass++; else { fail++; console.log("  FAIL", msg); } };
const shot = async (pg, name) => { if (SHOTS) await pg.locator(".yc-panel").screenshot({ path: `${SHOTS}/${name}.png` }); };

const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
const pg = await ctx.newPage();
const errs = [];
pg.on("pageerror", (e) => errs.push(e.message));
await pg.goto(BASE);
// next dev's own badge stays out of the shots.
await pg.addStyleTag({ content: "nextjs-portal { display: none !important; }" });
await pg.locator(".yc-fab").click({ force: true });
await pg.getByRole("button", { name: "Meet the crew", exact: true }).click();
await pg.waitForSelector(".yc-crew-row");
await pg.waitForTimeout(900);
ok((await pg.locator(".yc-crew-row").count()) === 5, "the crew screen has five rows");
ok((await pg.locator(".yc-crew .yl-q").first().textContent()) === "Meet the crew", "titled Meet the crew");
await shot(pg, "site69-crew");

const flowEl = () => pg.locator(".ys-pic .yl-flow").last();
async function current() {
  const f = flowEl();
  if (await f.locator(".yl-planreview").count()) return "review";
  return f.locator(".yl-planstep:visible").first().getAttribute("data-step");
}
async function answer(g, id, v) {
  const n = g.nodes.find((x) => x.id === id);
  const s = flowEl().locator(`.yl-planstep[data-step="${id}"]`);
  const next = () => flowEl().locator(".bigbtns").last().getByRole("button", { name: /Next|Review/ }).click();
  switch (n.preset) {
    case "page": await next(); break;
    case "choose": case "ask": await s.getByRole("button", { name: String(v), exact: true }).click(); break;
    case "pick": for (const x of v) await s.getByRole("button", { name: x, exact: true }).click(); await s.getByRole("button", { name: "Done" }).click(); break;
    case "slide":
      await s.locator("input[type=range]").evaluate((el, val) => {
        Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value").set.call(el, String(val));
        el.dispatchEvent(new Event("input", { bubbles: true })); el.dispatchEvent(new Event("change", { bubbles: true }));
      }, v);
      await pg.waitForTimeout(80);
      await s.locator("input[type=range]").evaluate((el) => el.dispatchEvent(new PointerEvent("pointerup", { bubbles: true })));
      await pg.waitForTimeout(80);
      await next(); break;
    default: throw new Error(`no answer for ${n.preset}`);
  }
  await pg.waitForTimeout(450);
}
// The answer after the Send: page on to its last chunk, where the questions are.
async function toQuestions() {
  for (let i = 0; i < 12 && !(await pg.locator(".ys-qs").count()); i++) {
    await pg.getByRole("button", { name: "Next part" }).click().catch(() => {});
    await pg.waitForTimeout(500);
  }
}
const accent = () => pg.locator(".yc-panel").evaluate((el) => el.style.getPropertyValue("--mo-c"));

for (const [i, m] of CREW.entries()) {
  console.log(`${m.name}: ${m.flow}`);
  const g = graph(m.flow);
  const plan = RUNS[m.name];
  await pg.locator(".yc-crew-row", { hasText: m.name }).click();
  await pg.waitForSelector(".ys-pic .yl-flow", { timeout: 20000 });
  await pg.waitForTimeout(700);
  ok((await accent()) === m.c, `${m.name}'s flow wears ${m.c}`);
  ok((await pg.locator(".ys-who strong").textContent()) === m.name, `the header says ${m.name}`);
  ok((await pg.locator(".ys-line").first().textContent()).startsWith(`${m.name} here.`), "their hello, in their voice");
  await shot(pg, `site69-${m.handle}-flow`);
  const seen = [];
  for (let guard = 0; guard < 30; guard++) {
    const id = await current();
    if (id === "review") break;
    seen.push(id);
    const p = g.nodes.find((x) => x.id === id);
    await answer(g, id, plan[id] ?? (p.preset === "page" ? null : p.props.options?.[0]));
    if (seen.length === 2) await shot(pg, `site69-${m.handle}-step`);
  }
  ok((await current()) === "review", `${m.name}: reached the review (${seen.join(" ")})`);
  await flowEl().locator(".bigbtns").last().locator(".bigbtn.p").click();
  await pg.waitForSelector(".ys-play .ys-segs, .ys-qs", { timeout: 20000 });
  await pg.waitForTimeout(900);
  ok((await accent()) === m.c, `${m.name}'s answer wears their color`);
  await shot(pg, `site69-${m.handle}-answer`);
  await toQuestions();
  const q = pg.locator(".ys-qs");
  ok((await q.textContent()).includes(`How did ${m.name} do?`), `one like or dislike question about ${m.name}`);
  await shot(pg, `site69-${m.handle}-like`);
  await q.getByRole("button", { name: i % 2 ? "Not for me" : "I like it", exact: true }).click();
  await pg.waitForSelector(".yc-crew-row", { timeout: 20000 });
  await pg.waitForTimeout(900);
  ok((await pg.locator(".yc-crew .yl-q").first().textContent()) === "Meet another", "then Meet another");
  ok((await accent()) !== m.c, "back in Yui's color");
  if (i === 0) await shot(pg, "site69-meet-another");
}
ok(errs.length === 0, `no page errors ${errs}`);
await b.close();
console.log(`${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
