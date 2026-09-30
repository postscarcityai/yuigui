// SITE-98 e2e: a way home from every full-screen answer in the site chat, on a phone. Close mid-plan,
// Back home on the last part, and a pull down each land on the chat home, send no request to /api/chat,
// and the answer comes back from Reopen. Also: the playground's stage closes with Back home on a deck's
// last page. No model turn is needed, so a stand-in key is enough:
//   YUI_CHAT_OPENROUTER_KEY=x npx next dev -p 3058 &   then   node scripts/home-e2e.mjs
// BASE overrides the site URL; PLAYWRIGHT the Playwright module to load; SHOTS a folder for screenshots.
import { mkdirSync } from "node:fs";
const { chromium } = await import(process.env.PLAYWRIGHT || "playwright");
const BASE = process.env.BASE || "http://localhost:3058";
const SHOTS = process.env.SHOTS || "";
if (SHOTS) mkdirSync(SHOTS, { recursive: true });

const PLAN = 'Two quick things before I plan your week.\n```yui\nplan@p "Before I plan"\npage "Your week" body="Two questions, then I build it."\nchoose@a "Mornings or evenings?" Mornings|Evenings\nchoose@b "How hard?" Easy|Steady|Hard\nend\n```';
const TEXT = "First, the short version.\n\nSecond, why it works: the screen answers, not a paragraph.\n\nThird, what to try next is a tap away.";
const seed = (reply) => JSON.stringify({ msgs: [{ role: "user", content: "Show me" }, { role: "assistant", content: reply }] });

const b = await chromium.launch();
let pass = 0, fail = 0;
const ok = (c, msg) => { if (c) pass++; else { fail++; console.log("  FAIL", msg); } };

async function open(reply, theme = "light") {
  const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  const pg = await ctx.newPage();
  const calls = [];
  pg.on("request", (r) => { if (r.url().includes("/api/chat")) calls.push(r.method()); });
  pg.on("pageerror", (e) => console.log("  pageerror", e.message));
  await pg.addInitScript(([s, t]) => { localStorage.setItem("yui-chat-v1", s); localStorage.setItem("yui-theme", t); }, [seed(reply), theme]);
  await pg.goto(BASE);
  await pg.addStyleTag({ content: "nextjs-portal { display: none !important; }" });
  await pg.locator(".yc-fab").click({ force: true });
  await pg.waitForSelector(".ys-hello");
  return { pg, calls, ctx };
}
const reopen = async (pg) => { await pg.getByRole("button", { name: "Reopen last answer" }).click(); await pg.waitForSelector(".ys-play"); await pg.waitForTimeout(500); };
const home = async (pg) => { await pg.waitForSelector(".ys-hello", { timeout: 3000 }); return (await pg.locator(".ys-line").first().textContent()) === "Anything else?"; };
const shot = async (pg, name) => { if (SHOTS) await pg.locator(".yc-panel").screenshot({ path: `${SHOTS}/${name}.png` }); };
async function pull(pg, from, by, steps = 8, x = 195) {
  const cdp = await pg.context().newCDPSession(pg);
  const t = (type, y) => cdp.send("Input.dispatchTouchEvent", { type, touchPoints: type === "touchEnd" ? [] : [{ x, y }] });
  await t("touchStart", from);
  for (let i = 1; i <= steps; i++) await t("touchMove", from + (by * i) / steps);
  await t("touchEnd", from + by);
  await pg.waitForTimeout(500);
}

// 1. Close mid-plan.
{
  const { pg, calls, ctx } = await open(PLAN);
  await shot(pg, "site98-chat-home");
  await reopen(pg);
  ok(await pg.locator(".ys-homex").isVisible(), "a close sits on the stage");
  ok(await pg.locator(".ys-homeq").count() === 0, "a plan mid-run has no Back to home under the content");
  await shot(pg, "site98-chat-plan-close");
  await pg.locator(".ys-homex").click();
  ok(await home(pg), "close mid-plan lands on the chat home");
  ok(calls.length === 0, `close sent no request (saw ${calls.join(",")})`);
  await reopen(pg);
  ok(await pg.locator(".ys-play").count() === 1, "the answer reopens from its chip");
  await ctx.close();
}

// 2. Back to home on the last part: a quiet button under the content, the mic stays (SITE-108).
{
  const { pg, calls, ctx } = await open(TEXT, "dark");
  await reopen(pg);
  ok(await pg.locator(".ys-homeq").count() === 0, "no Back to home on the first part");
  await pg.getByRole("button", { name: "Next part" }).click();
  await pg.getByRole("button", { name: "Next part" }).click();
  await pg.waitForTimeout(500);
  const btn = pg.locator(".ys-homeq");
  ok(await btn.count() === 1, "Back to home shows on the last part");
  ok(await pg.locator(".ys-mic:not(.ys-stop)").count() === 1, "the mic stays in the bar");
  await shot(pg, "site98-chat-backhome");
  await btn.click();
  ok(await home(pg), "Back to home lands on the chat home");
  ok(calls.length === 0, `Back to home sent no request (saw ${calls.join(",")})`);
  await ctx.close();
}

// 3. Pull down: a long pull goes home, a short one springs back, both local.
{
  const { pg, calls, ctx } = await open(PLAN);
  await reopen(pg);
  await pull(pg, 300, 60);
  ok(await pg.locator(".ys-play").count() === 1, "a short pull springs back");
  const y0 = (await pg.locator(".ys-play").boundingBox()).y;
  ok(Math.abs(y0) < 200, "and the card is back in place");
  await pull(pg, 300, 320);
  ok(await home(pg), "a long pull lands on the chat home");
  ok(calls.length === 0, `the pull sent no request (saw ${calls.join(",")})`);
  await reopen(pg);
  await pg.evaluate(() => { document.querySelector(".ys-scroll").scrollTop = 40; });
  await ctx.close();
}

// 4. The playground: a staged deck ends on Back home; the × and a pull down close it too, and the
//    pill in the chat brings it back.
for (const theme of ["light", "dark"]) {
  const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  const pg = await ctx.newPage();
  await pg.goto(`${BASE}/playground?demo=lesson-one-screen&theme=${theme}`);
  await pg.addStyleTag({ content: "nextjs-portal { display: none !important; }" });
  const stage = pg.locator(".yl-stage");
  await stage.waitFor();
  const isOpen = () => stage.evaluate((e) => e.classList.contains("open"));
  await pg.waitForFunction(() => document.querySelector(".yl-stage.open"), null, { timeout: 5000 }).catch(() => {});
  if (!(await isOpen())) await pg.locator(".pg-tab", { hasText: "Full screen" }).click();
  await pg.waitForTimeout(600);
  ok(await isOpen(), `[${theme}] the deck is on the stage`);
  ok(await stage.locator(".yl-backhome").count() === 0, `[${theme}] no Back home on the first page`);
  const next = stage.getByRole("button", { name: "Next", exact: true });
  for (let i = 0; i < 8 && !(await next.isDisabled()); i++) { await next.click(); await pg.waitForTimeout(150); }
  await pg.waitForTimeout(400);
  ok(await stage.locator(".yl-backhome").count() === 1, `[${theme}] Back home on the last page`);
  if (SHOTS) { await stage.locator(".yl-stagebody").evaluate((e) => { e.scrollTop = e.scrollHeight; }); await pg.waitForTimeout(200); await stage.screenshot({ path: `${SHOTS}/site98-playground-backhome-${theme}.png` }); }
  await stage.locator(".yl-backhome").click();
  await pg.waitForTimeout(700);
  ok(!(await isOpen()), `[${theme}] Back home closes the stage`);
  await pg.locator(".yl-stagepill, .pg-tab", { hasText: /Deck|Compound|Full screen/ }).first().click();
  await pg.waitForTimeout(700);
  ok(await isOpen(), `[${theme}] the pill brings the deck back`);
  await stage.locator(".yl-stagex").click();
  await pg.waitForTimeout(700);
  ok(!(await isOpen()), `[${theme}] × closes it`);
  await pg.locator(".yl-stagepill, .pg-tab", { hasText: /Deck|Compound|Full screen/ }).first().click();
  await pg.waitForTimeout(700);
  await stage.evaluate((e) => e.scrollIntoView({ block: "center" }));
  await pg.waitForTimeout(300);
  const sb = await stage.boundingBox();
  // From the bar: the deck can be scrolled down on its last page, and a scrolled page is not a dismiss.
  await pull(pg, sb.y + 30, 340, 8, sb.x + sb.width / 2);
  ok(!(await isOpen()), `[${theme}] a pull down closes it`);
  await ctx.close();
}

await b.close();
console.log(`home-e2e: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
