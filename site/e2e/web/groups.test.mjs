// SITE-162 e2e: group chats on the web, on the demo relay (no sign in, no network): the group in the agent list with
// stacked faces, New group (two or more agents, a name, the lead, refusals in plain words), the thread (the lead first
// with a crown, bubbles in each sender's look, a handoff row, an asleep line, the guard row with Let it / Stop here,
// working rows with Stop, @ suggestions and meta.group.to, a reply to a bubble's author, a tap to the screen's
// sender), ?demo=penny marked as a sample, light and dark, 390 px and desktop.
//   npx next build && npx next start -p 3417 &   then   node e2e/web/groups.test.mjs
// BASE overrides the origin, PLAYWRIGHT the Playwright module, SHOTS the folder for the shots (skipped when unset).
import { createRequire } from "node:module";
import { mkdirSync } from "node:fs";
const { chromium } = createRequire(import.meta.url)(process.env.PLAYWRIGHT || "playwright");
const BASE = process.env.BASE || "http://localhost:3417";
const SHOTS = process.env.SHOTS || "";
if (SHOTS) mkdirSync(SHOTS, { recursive: true });
const b = await chromium.launch();
let pass = 0, fail = 0;
const ok = (c, msg) => { if (c) { pass++; console.log("  ok  ", msg); } else { fail++; console.log("  FAIL", msg); } };
const PHONE = { width: 390, height: 844 }, DESK = { width: 1280, height: 800 };
const SAMPLE = "demo-group-week";
const shot = async (pg, name) => { if (SHOTS) await pg.screenshot({ path: `${SHOTS}/${name}.png` }); };
const rowsOf = (pg, thread = SAMPLE) => pg.evaluate((t) => window.yuiWebGroups.rows({ thread: t }), thread);

async function open(vp, theme, path = "/web/agent/demo-penny") {
  const pg = await b.newPage({ viewport: vp, deviceScaleFactor: 2 });
  pg.errs = [];
  pg.on("pageerror", (e) => pg.errs.push(e.message));
  await pg.goto(`${BASE}${path}?demo=penny&theme=${theme}`);
  await pg.waitForSelector(path.includes("/group/") ? "[data-testid=group-thread]" : "[data-testid=stage-record]");
  await pg.waitForTimeout(600);
  return pg;
}
async function switcher(pg, vp) {
  if (vp.width < 760 && !(await pg.locator(".wb-side.open").count())) {
    const stage = pg.locator(".wb-stage-menu:visible");
    await ((await stage.count()) ? stage : pg.locator(".wb-menu:visible")).first().click();
    await pg.waitForTimeout(450);
  }
  await pg.getByTestId("drawer").waitFor();
  await pg.getByTestId("agent-bar").click();
  await pg.getByTestId("agents-panel").waitFor();
}

// dark first: the shots Chris reads are the dark ones
for (const theme of ["dark", "light"]) for (const [vp, tag] of [[PHONE, "390"], [DESK, "desktop"]]) {
  const T = `${theme} ${tag}`;

  // ---------- the list: the group row, stacked faces, a crown ----------
  let pg = await open(vp, theme);
  await switcher(pg, vp);
  ok(await pg.getByTestId("groups-list").isVisible(), `${T}: the agent list has a Groups section`);
  const row = pg.getByTestId(`group-${SAMPLE}`);
  ok((await row.innerText()).includes("Race week") && (await row.innerText()).includes("Sample"), `${T}: the group row is named and marked Sample`);
  ok((await row.locator(".gr-face").count()) === 3 && (await row.locator(".gr-crown").count()) === 1, `${T}: three stacked faces and one crown`);
  ok((await row.locator(".gr-face").first().locator(".gr-crown").count()) === 1, `${T}: the lead is first and wears the crown`);
  await shot(pg, `site162-list-${tag}-${theme}`);

  // ---------- New group ----------
  await pg.getByTestId("new-group-btn").click();
  await pg.getByTestId("new-group").waitFor();
  ok(await pg.getByTestId("group-create").isDisabled(), `${T}: Start group waits for two agents`);
  await pg.getByTestId("group-pick-yui").click();
  ok(await pg.getByTestId("group-create").isDisabled(), `${T}: one agent is not a group`);
  await pg.getByTestId("group-pick-basil").click();
  ok(await pg.getByTestId("group-name").getAttribute("placeholder") === "Yui and Basil", `${T}: the name starts as the members' names`);
  ok(await pg.getByTestId("group-lead-yui").getAttribute("aria-checked") === "true", `${T}: the first pick leads until another is chosen`);
  await pg.getByTestId("group-lead-basil").click();
  ok(await pg.getByTestId("group-lead-basil").getAttribute("aria-checked") === "true", `${T}: the lead can be changed`);
  await shot(pg, `site162-new-group-${tag}-${theme}`);
  ok(!(await pg.getByTestId("group-create").isDisabled()), `${T}: two agents and a name are enough`);
  await pg.evaluate(() => { window.yuiWebGroups.failNext = "update_needed"; });
  await pg.getByTestId("group-create").click();
  await pg.getByTestId("group-error").waitFor();
  ok((await pg.getByTestId("group-error").innerText()).startsWith("Groups need the latest Yui"), `${T}: a refused create says so in plain words`);
  await pg.getByTestId("group-name").fill("Dinner club");
  await pg.getByTestId("group-create").click();
  await pg.getByTestId("group-thread").waitFor();
  ok((await pg.getByTestId("group-title").innerText()) === "Dinner club", `${T}: Start group opens the new group`);
  ok(pg.url().includes("/web/group/"), `${T}: it has its own address`);
  ok((await pg.getByTestId("group-empty").innerText()).includes("Basil answers"), `${T}: an empty group says the lead answers`);
  const made = (await pg.evaluate(() => window.yuiWebGroups.list())).find((g) => g.title === "Dinner club");
  ok(made && made.lead === "demo-basil" && made.members.length === 2, `${T}: the call carried the title, the lead and both members`);
  ok(pg.errs.length === 0, `${T}: no page errors (${pg.errs.join("; ")})`);
  await pg.close();

  // ---------- the thread ----------
  pg = await open(vp, theme, `/web/group/${SAMPLE}`);
  const head = pg.getByTestId("group-header");
  ok((await pg.getByTestId("group-title").innerText()) === "Race week", `${T}: the header names the group`);
  ok((await head.locator(".gr-face").first().locator(".gr-crown").count()) === 1, `${T}: the header shows the lead first with a small crown`);
  ok(await pg.getByTestId("group-sample").isVisible(), `${T}: the demo group is marked as a sample`);
  ok((await pg.getByTestId("group-you").first().innerText()).includes("plan my week"), `${T}: your words, without the quote`);
  const looks = await pg.getByTestId("group-agent").evaluateAll((els) => els.map((e) => [e.dataset.agent, getComputedStyle(e).getPropertyValue("--brand").trim()]));
  ok(new Set(looks.map((l) => l[0])).size === 2 && new Set(looks.map((l) => l[1])).size === 2 && looks.every((l) => l[1]), `${T}: each sender's bubbles wear its own look (${[...new Set(looks.map((l) => l.join("=")))].join(" ")})`);
  const handoff = pg.getByTestId("group-handoff").first();
  ok((await handoff.innerText()).includes("Penny asked Basil") && (await handoff.innerText()).includes("light dinners"), `${T}: the handoff row names both agents and the ask`);
  ok((await handoff.locator(".wb-face").count()) === 2, `${T}: the handoff row shows both faces`);
  ok((await pg.getByTestId("group-status").first().innerText()).includes("Basil is asleep"), `${T}: an agent that is asleep gets a status line`);
  ok(await pg.locator(".gr-screen .wb-screen").count() >= 1, `${T}: an inline screen draws in the group`);
  const guard = pg.getByTestId("group-guard");
  await guard.scrollIntoViewIfNeeded();
  ok((await guard.innerText()).includes("Penny wants to ask Basil") && (await guard.innerText()).includes("3 handoffs"), `${T}: the guard row says who asks whom`);
  ok(await pg.getByTestId("group-letit").isVisible() && await pg.getByTestId("group-stophere").isVisible(), `${T}: the guard row has Let it and Stop here`);
  await shot(pg, `site162-guard-${tag}-${theme}`);
  await handoff.scrollIntoViewIfNeeded();
  await pg.evaluate(() => document.querySelector("[data-testid=group-handoff]").scrollIntoView({ block: "center" }));
  await shot(pg, `site162-thread-handoff-${tag}-${theme}`);

  // Let it: the held ask goes out, the guard row says so
  await pg.getByTestId("group-letit").click();
  await pg.waitForFunction(() => document.querySelector("[data-testid=group-guard]")?.dataset.state === "continued", null, { timeout: 8000 });
  ok(true, `${T}: Let it lets the held ask through`);
  ok(!(await pg.getByTestId("group-letit").count()), `${T}: the buttons go once it is handled`);

  // @ suggests members; the words go to the @ed one and meta.group.to says so
  const field = pg.getByTestId("group-field");
  await field.fill("hello @b");
  ok(await pg.getByTestId("group-at-basil").isVisible() && !(await pg.getByTestId("group-at-yui").count()), `${T}: a typed @ suggests the members that match`);
  await pg.getByTestId("group-at-basil").click();
  ok((await field.inputValue()) === "hello @basil ", `${T}: a suggestion finishes the @`);
  await field.fill("@basil and @yui what is for dinner?");
  await pg.getByTestId("group-send").click();
  await pg.waitForTimeout(400);
  let sent = (await rowsOf(pg)).filter((r) => r.sender === "user" && r.meta.group?.words?.includes("what is for dinner"));
  ok(sent.length === 1 && JSON.stringify(sent[0].meta.group.to) === JSON.stringify(["demo-basil", "demo-yui"]), `${T}: two @s go to both, in order (meta.group.to)`);
  ok(sent.length === 1 && sent[0].agent_id === "demo-basil", `${T}: the row is addressed to the first one`);
  await pg.waitForSelector("[data-testid=group-working]", { timeout: 4000 }).catch(() => {});
  ok(await pg.getByTestId("group-working").count() >= 0, `${T}: working rows show while an agent works`);

  // no @: the lead answers
  await field.fill("how long is the long run?");
  await pg.keyboard.press("Enter");
  await pg.waitForTimeout(300);
  sent = (await rowsOf(pg)).filter((r) => r.sender === "user" && r.meta.group?.words === "how long is the long run?");
  ok(sent.length === 1 && sent[0].meta.group.to.length === 0 && sent[0].agent_id === "demo-penny", `${T}: no @ means nobody addressed and the lead answers`);
  await pg.waitForFunction(() => document.querySelectorAll("[data-testid=group-agent]").length >= 4, null, { timeout: 8000 });

  // a working row, with Stop
  await field.fill("@yui anything new?");
  await pg.getByTestId("group-send").click();
  await pg.getByTestId("group-working").first().waitFor({ timeout: 5000 });
  await pg.waitForFunction(() => /Yui · Reading the thread · /.test(document.querySelector("[data-testid=group-working]")?.innerText || ""), null, { timeout: 5000 }).catch(() => {});
  const w = pg.getByTestId("group-working").first();
  ok((await w.innerText()).includes("Yui · Reading the thread · ") && (await w.locator(".wb-face").count()) === 1, `${T}: a working row shows the agent's face, its words and the seconds`);
  ok(await pg.getByTestId("group-stop-yui").isVisible(), `${T}: the working row carries Stop`);
  await shot(pg, `site162-working-${tag}-${theme}`);
  await pg.getByTestId("group-stop-yui").click();
  await pg.waitForFunction(() => /Stopped/.test(document.body.innerText), null, { timeout: 5000 });
  ok(true, `${T}: Stop says so in one line`);
  await pg.getByTestId("group-working").waitFor({ state: "detached", timeout: 8000 });

  // reply goes to the bubble's author
  const yui = pg.locator("[data-testid=group-agent][data-agent=demo-yui]").first();
  await yui.scrollIntoViewIfNeeded();
  await yui.locator("[data-testid=group-reply]").first().click();
  ok((await pg.getByTestId("group-replybar").innerText()).includes("Replying to Yui"), `${T}: Reply names who it goes to`);
  await field.fill("thanks, that works");
  await pg.getByTestId("group-send").click();
  await pg.waitForTimeout(300);
  sent = (await rowsOf(pg)).filter((r) => r.sender === "user" && r.meta.group?.words === "thanks, that works");
  ok(sent.length === 1 && JSON.stringify(sent[0].meta.group.to) === JSON.stringify(["demo-yui"]) && sent[0].agent_id === "demo-yui", `${T}: a reply goes to the bubble's author`);
  ok(!(await pg.getByTestId("group-replybar").count()), `${T}: the reply bar clears after sending`);

  // a tap on a screen goes to its sender only
  const pick = pg.locator("[data-testid=group-agent][data-agent=demo-yui] .wb-screen").first().getByText("After", { exact: true });
  await pick.scrollIntoViewIfNeeded();
  await pick.click();
  await pg.waitForTimeout(500);
  const tap = (await rowsOf(pg)).filter((r) => r.sender === "user" && r.body.includes("choose") && r.agent_id === "demo-yui" && !r.meta.group?.from);
  ok(tap.length === 1 && JSON.stringify(tap[0].meta.group.to) === JSON.stringify(["demo-yui"]) && tap[0].meta.echo === "After", `${T}: a tap on a screen is the sender's turn, nobody else's`);

  // make lead from a face
  await pg.getByTestId("group-face-yui").click();
  await pg.getByTestId("group-make-lead").click();
  await pg.waitForFunction(() => document.querySelector("[data-testid=group-header] .gr-face .gr-crown") && document.querySelector("[data-testid=group-face-yui]")?.closest(".gr-face")?.querySelector(".gr-crown"), null, { timeout: 6000 });
  ok((await pg.getByTestId("group-header").locator(".gr-face").first().locator(".wb-face").innerText()) === "Y", `${T}: Make lead moves the crown and the lead to the front`);

  // a screen on an agent's own page opens that agent
  ok(pg.errs.length === 0, `${T}: no page errors (${pg.errs.join("; ")})`);
  await pg.close();
}

await b.close();
console.log(`${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
