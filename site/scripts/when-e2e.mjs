// SITE-99 e2e: the site chat shows when messages were sent. A chat seeded across three days shows a
// divider for each (Today, Yesterday, and a dated one), a quiet time under each group, and the stage
// shows its answer's time in small type. Phone width, light and dark. No model turn is needed:
//   YUI_CHAT_OPENROUTER_KEY=x npx next dev -p 3059 &   then   node scripts/when-e2e.mjs
// BASE overrides the site URL; PLAYWRIGHT the Playwright module to load; SHOTS a folder for screenshots.
import { mkdirSync } from "node:fs";
const { chromium } = await import(process.env.PLAYWRIGHT || "playwright");
const BASE = process.env.BASE || "http://localhost:3059";
const SHOTS = process.env.SHOTS || "";
if (SHOTS) mkdirSync(SHOTS, { recursive: true });

const day = (back, h, m) => { const d = new Date(); d.setDate(d.getDate() - back); d.setHours(h, m, 0, 0); return d.getTime(); };
const seed = () => JSON.stringify({ msgs: [
  { role: "user", content: "What is Yui?", at: day(4, 20, 15) },
  { role: "assistant", content: "Yui answers with screens, not paragraphs.", at: day(4, 20, 16) },
  { role: "user", content: "Show me a timer", at: day(1, 21, 40) },
  { role: "assistant", content: "Here is a timer.\n```yui\ntimer@t \"Tea\" 3:00\n```", at: day(1, 21, 41) },
  { role: "user", content: "Thanks, and the plan?", at: day(0, 8, 5) },
  { role: "assistant", content: "Here is the plan for today.", at: day(0, 8, 6) },
] });

const b = await chromium.launch();
let pass = 0, fail = 0;
const ok = (c, msg) => { if (c) pass++; else { fail++; console.log("  FAIL", msg); } };

for (const theme of ["light", "dark"]) {
  const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  const pg = await ctx.newPage();
  pg.on("pageerror", (e) => console.log("  pageerror", e.message));
  await pg.addInitScript(([s, t]) => { localStorage.setItem("yui-chat-v1", s); localStorage.setItem("yui-theme", t); }, [seed(), theme]);
  await pg.goto(BASE);
  await pg.addStyleTag({ content: "nextjs-portal { display: none !important; }" });
  await pg.locator(".yc-fab").click({ force: true });
  await pg.waitForSelector(".ys-hello");
  // the record
  await pg.getByRole("button", { name: /Chat record/ }).click();
  await pg.waitForSelector(".yc-day");
  const days = await pg.locator(".yc-day").allTextContents();
  ok(days.length === 3, `${theme}: three dividers, got ${days.join(" | ")}`);
  ok(days[1] === "Yesterday" && days[2] === "Today", `${theme}: Yesterday then Today, got ${days.join(" | ")}`);
  ok(/^\w{3} \d{1,2} \w{3}$/.test(days[0]), `${theme}: an older day reads Mon 28 Sep, got ${days[0]}`);
  const times = await pg.locator(".yc-when").allTextContents();
  ok(times.length === 6 && times.every((t) => /^\d{1,2}:\d{2}\s?(AM|PM)$/i.test(t)), `${theme}: a time under each of six groups, got ${times.join(" | ")}`);
  const w = await pg.locator(".yc-when").first().evaluate((e) => getComputedStyle(e).fontWeight);
  ok(Number(w) <= 400, `${theme}: no bold in the time (${w})`);
  await pg.waitForTimeout(600);
  await pg.locator(".yc-list").evaluate((e) => { e.scrollTop = e.scrollHeight; });
  if (SHOTS) await pg.locator(".yc-panel").screenshot({ path: `${SHOTS}/when-record-${theme}.png` });
  // the stage: yesterday's answer says so
  await pg.getByRole("button", { name: "Back to the stage" }).click();
  await pg.getByRole("button", { name: "Reopen last answer" }).click();
  await pg.waitForSelector(".ys-when");
  const t0 = await pg.locator(".ys-when").textContent();
  ok(/^\d{1,2}:\d{2}\s?(AM|PM)$/i.test(t0), `${theme}: today's answer shows its clock time, got ${t0}`);
  if (SHOTS) await pg.locator(".yc-panel").screenshot({ path: `${SHOTS}/when-stage-today-${theme}.png` });
  await pg.getByRole("button", { name: "Close, back home" }).click();
  await pg.getByRole("button", { name: /Chat record/ }).click();
  await pg.locator(".yc-answer:not(.yc-hello)").nth(1).getByRole("button", { name: "Play on the stage" }).click();
  await pg.waitForSelector(".ys-when");
  const t1 = await pg.locator(".ys-when").textContent();
  ok(/^Yesterday \d{1,2}:\d{2}\s?(AM|PM)$/i.test(t1), `${theme}: yesterday's answer says Yesterday, got ${t1}`);
  if (SHOTS) await pg.locator(".yc-panel").screenshot({ path: `${SHOTS}/when-stage-yesterday-${theme}.png` });
  await ctx.close();
}
await b.close();
console.log(`when-e2e: ${pass} pass, ${fail} fail`);
process.exit(fail ? 1 : 0);
