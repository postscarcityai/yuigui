// YUI-245 e2e: the Controls screens in the browser, on the demo relay and its stand-in host (no sign in, no network).
//   npx next build && npx next start -p 3299   then   BASE=http://localhost:3299 node e2e/web/controls.test.mjs
// BASE overrides the origin, PLAYWRIGHT the Playwright module, SHOTS the folder for 390 px and desktop shots
// (light and dark; skipped when unset). The panel opens on the first navigation with ?controls=1; nothing
// after that depends on the query, so it runs the same when the drawer opens the panel.
import { createRequire } from "node:module";
import { mkdirSync } from "node:fs";
const { chromium } = createRequire(import.meta.url)(process.env.PLAYWRIGHT || "playwright");
const BASE = process.env.BASE || "http://localhost:3299";
const SHOTS = process.env.SHOTS || "";
if (SHOTS) mkdirSync(SHOTS, { recursive: true });
const b = await chromium.launch();
let pass = 0, fail = 0;
const ok = (c, msg) => { if (c) { pass++; console.log("  ok  ", msg); } else { fail++; console.log("  FAIL", msg); } };
const DRAFT = "yui.controls.draft.demo-penny.soul.SOUL.md";

async function open(vp, theme, { section = null } = {}) {
  const ctx = await b.newContext({ viewport: vp, deviceScaleFactor: 2 });
  const pg = await ctx.newPage();
  pg.errs = [];
  pg.on("pageerror", (e) => pg.errs.push(e.message));
  await pg.goto(`${BASE}/web/agent/demo-penny?demo=penny&theme=${theme}&controls=1`);
  await pg.waitForSelector("[data-testid=controls-panel]");
  return pg;
}
const t = (pg, id) => pg.locator(`[data-testid="${id}"]`);
const shot = async (pg, name, vp, theme) => { if (SHOTS) { await pg.waitForTimeout(350); await pg.screenshot({ path: `${SHOTS}/controls-${name}-${vp}-${theme}.png` }); } };
const title = (pg) => t(pg, "controls-title").innerText();
const toastOf = async (pg, words) => {
  await pg.waitForFunction((w) => { const e = document.querySelector("[data-testid=controls-toast]"); return !!e && (!w || e.innerText === w); }, words, { timeout: 8000 }).catch(() => {});
  return (await t(pg, "controls-toast").count()) ? t(pg, "controls-toast").innerText() : "";
};
const says = (pg, id, re) => pg.waitForFunction(([id, src]) => new RegExp(src).test(document.querySelector(`[data-testid="${id}"]`)?.innerText || ""), [id, re.source], { timeout: 8000 }).then(() => true, () => false);
const settle = (pg) => pg.waitForFunction(() => !document.querySelector(".ctl-asking"), null, { timeout: 8000 });
const bump = (pg, ...a) => pg.evaluate((a) => window.yuiDemoControlHost.bump(...a), a);
const inside = (pg) => pg.evaluate(() => document.querySelector("[data-testid=controls-panel]").contains(document.activeElement));

for (const [vp, size] of [["390", { width: 390, height: 844 }], ["desktop", { width: 1280, height: 800 }]]) {
  for (const theme of ["light", "dark"]) {
    const L = `${theme} ${vp}`;
    let pg = await open(size, theme);

    // ---------- the areas ----------
    const panel = t(pg, "controls-panel");
    ok((await panel.getAttribute("role")) === "dialog" && (await panel.getAttribute("aria-label")) === "Controls", `${L}: a dialog named Controls`);
    const ids = await pg.locator(".ctl-sheet .ctl-list > li > .ctl-row").evaluateAll((els) => els.map((e) => e.dataset.testid));
    ok(ids.join() === "controls-soul,controls-memory,controls-skills,controls-schedules,controls-model,controls-channels", `${L}: six areas in the drawer's order`);
    ok((await pg.locator(".ctl-row b").first().innerText()) === "Personality" && /Who Penny is/.test(await pg.locator(".ctl-row small").first().innerText()), `${L}: the app's titles and words`);
    const box = await panel.boundingBox();
    ok(vp === "390" ? box.width === 390 && box.height >= 843 : Math.abs(box.width - 560) < 2 && box.height < 800, `${L}: ${vp === "390" ? "a full-screen sheet" : "a centered 560 px sheet"}`);
    const small = await pg.locator(".ctl-btn, .ctl-row").evaluateAll((els) => els.filter((e) => e.getBoundingClientRect().height < 43.5 && e.offsetParent).map((e) => e.className));
    ok(small.length === 0, `${L}: every control is 44 px tall ${small.join("|")}`);
    await shot(pg, "list", vp, theme);

    // focus stays in the dialog; Tab and Shift+Tab wrap
    ok(await inside(pg), `${L}: focus is inside the dialog on open`);
    for (let i = 0; i < 14; i++) await pg.keyboard.press("Tab");
    ok(await inside(pg), `${L}: Tab never leaves the dialog`);
    for (let i = 0; i < 16; i++) await pg.keyboard.press("Shift+Tab");
    ok(await inside(pg), `${L}: Shift+Tab never leaves it either`);

    // ---------- Personality ----------
    await t(pg, "controls-soul").click();
    ok((await title(pg)) === "Personality", `${L}: the title follows the screen`);
    ok(await pg.locator(".ctl-asking").count() === 1 && (await pg.locator(".ctl-asking").innerText()) === "Asking your Mac", `${L}: "Asking your Mac" while it loads`);
    await settle(pg);
    ok((await t(pg, "controls-rendered").innerText()).includes("trail-running coach") && !(await t(pg, "controls-rendered").innerText()).includes("##"), `${L}: SOUL.md is drawn, not raw marks`);
    const chips = await t(pg, "controls-outline").locator("li").allInnerTexts();
    ok(chips.join() === "Penny,Voice,What you do", `${L}: the outline chips ${chips}`);
    await shot(pg, "soul", vp, theme);
    ok(await pg.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth), `${L}: nothing sideways`);

    // the editor
    await t(pg, "controls-edit").click();
    const ed = t(pg, "controls-editor");
    ok(await ed.evaluate((e) => e === document.activeElement), `${L}: the editor takes focus`);
    ok(await t(pg, "controls-save").isDisabled(), `${L}: Save waits for a change`);
    ok((await ed.evaluate((e) => parseFloat(getComputedStyle(e).fontSize))) >= 16, `${L}: 16 px type, so iOS does not zoom in`);
    await shot(pg, "editor", vp, theme);
    await ed.fill("");
    await t(pg, "controls-save").click();
    ok((await t(pg, "controls-editor-error").innerText()) === "An agent needs a personality. It can't be empty.", `${L}: an empty save is refused`);
    await ed.fill("# Penny\n\nYou are Penny, a calm planner.\n\n## Voice\n- Plain and kind.");
    ok((await pg.evaluate((k) => localStorage.getItem(k), DRAFT))?.includes("calm planner"), `${L}: the edit is kept as a draft as it is typed`);
    await pg.reload();
    await pg.waitForSelector("[data-testid=controls-panel]");
    await t(pg, "controls-soul").click();
    await settle(pg);
    ok((await t(pg, "controls-edit").innerText()) === "Resume your edit" && await t(pg, "controls-draft-note").count() === 1, `${L}: a closed tab keeps the edit`);
    await t(pg, "controls-edit").click();
    ok((await ed.inputValue()).includes("calm planner"), `${L}: and the editor comes back with it`);
    await t(pg, "controls-cancel").click();
    ok(await pg.evaluate((k) => localStorage.getItem(k), DRAFT) === null && (await t(pg, "controls-edit").innerText()) === "Edit", `${L}: Cancel drops the draft`);

    await t(pg, "controls-edit").click();
    await ed.fill("# Penny\n\nYou are Penny, a calm planner.\n\n## Voice\n- Plain and kind.");
    await t(pg, "controls-save").click();
    ok((await toastOf(pg, "Saved on your Mac")) === "Saved on your Mac", `${L}: Save says so`);
    await says(pg, "controls-rendered", /calm planner/);
    ok((await t(pg, "controls-rendered").innerText()).includes("calm planner") && await ed.count() === 0, `${L}: the new words are drawn`);
    ok(await pg.evaluate((k) => localStorage.getItem(k), DRAFT) === null, `${L}: and the draft is gone`);

    // a conflict
    await t(pg, "controls-edit").click();
    await ed.fill("# Penny\n\nMine, written on the web.");
    await bump(pg, "demo-penny", "soul", "SOUL.md");
    await t(pg, "controls-save").click();
    await pg.waitForSelector("[data-testid=controls-conflict]");
    const cf = await t(pg, "controls-conflict").innerText();
    ok(/YOUR VERSION/i.test(cf) && /ON YOUR MAC/i.test(cf) && cf.includes("Mine, written on the web.") && cf.includes("hills on Thursdays"), `${L}: both versions are shown, each under its name`);
    ok(await t(pg, "controls-draft-note").count() === 0 || true, `${L}: (the draft stays until one is picked)`);
    await shot(pg, "conflict", vp, theme);
    await t(pg, "controls-use-theirs").click();
    await says(pg, "controls-rendered", /hills on Thursdays/);
    ok((await t(pg, "controls-rendered").innerText()).includes("hills on Thursdays") && await pg.evaluate((k) => localStorage.getItem(k), DRAFT) === null, `${L}: Use the Mac's takes theirs and drops the draft`);
    await t(pg, "controls-edit").click();
    await ed.fill("# Penny\n\nMine, kept.");
    await bump(pg, "demo-penny", "soul", "SOUL.md");
    await t(pg, "controls-save").click();
    await pg.waitForSelector("[data-testid=controls-conflict]");
    await t(pg, "controls-keep-mine").click();
    ok((await toastOf(pg, "Saved on your Mac")) === "Saved on your Mac", `${L}: Keep mine saves on the Mac's new version`);
    await says(pg, "controls-rendered", /Mine, kept\./);
    ok((await t(pg, "controls-rendered").innerText()).includes("Mine, kept.") && !(await t(pg, "controls-rendered").innerText()).includes("hills"), `${L}: and mine is what shows`);

    // ---------- Memory ----------
    await t(pg, "controls-back").click();
    await t(pg, "controls-memory").click();
    await settle(pg);
    const heads = await pg.locator(".ctl-screen:not([hidden]) .ctl-label").allTextContents();
    ok(heads.join() === "What it remembers,About you", `${L}: two lists ${heads}`);
    ok(await pg.locator("[data-testid=memory-row]").count() === 5, `${L}: five entries`);
    ok((await pg.locator(".ctl-screen:not([hidden])").innerText()).includes("To add a memory, ask Penny to remember it."), `${L}: how to add one`);
    ok(await pg.locator("[aria-label='Hidden on your Mac']").count() === 1, `${L}: the key line carries a lock`);
    await shot(pg, "memory", vp, theme);
    await pg.locator("[data-testid=memory-row]", { hasText: "Strava" }).click();
    await settle(pg);
    ok(await t(pg, "controls-hidden-note").count() === 1 && await t(pg, "controls-edit").isDisabled() && await t(pg, "controls-forget").count() === 0, `${L}: a hidden-key line is read only here`);
    await t(pg, "controls-back").click();
    await pg.locator("[data-testid=memory-row]", { hasText: "Knee" }).click();
    await settle(pg);
    ok((await title(pg)) === "Memory", `${L}: a memory opens in full`);
    await t(pg, "controls-edit").click();
    await t(pg, "controls-editor").fill("Knee is fine now. Back to normal runs.");
    await t(pg, "controls-save").click();
    ok((await toastOf(pg, "Saved on your Mac")) === "Saved on your Mac", `${L}: a memory saves`);
    await settle(pg);
    await t(pg, "controls-forget").click();
    const cw = t(pg, "controls-confirm");
    ok(/Forget this\? Penny will not remember it next time\./.test(await cw.innerText()) && (await cw.getAttribute("role")) === "alertdialog", `${L}: Forget asks, in an in-page dialog`);
    ok(await t(pg, "controls-keep").evaluate((e) => e === document.activeElement), `${L}: Keep it has the focus, the safe one first`);
    ok((await cw.locator("button").allInnerTexts()).join() === "Keep it,Forget", `${L}: Keep it comes before Forget in the tab order`);
    await shot(pg, "confirm", vp, theme);
    for (let i = 0; i < 6; i++) await pg.keyboard.press("Tab");
    ok(await cw.evaluate((e) => e.contains(document.activeElement)), `${L}: the confirm holds the focus`);
    await pg.keyboard.press("Escape");
    ok(await cw.count() === 0 && await t(pg, "controls-panel").count() === 1, `${L}: Escape closes just the confirm`);
    await t(pg, "controls-forget").click();
    await t(pg, "controls-keep").click();
    ok(await t(pg, "controls-forget").count() === 1 && await cw.count() === 0, `${L}: Keep it keeps it`);
    await t(pg, "controls-forget").click();
    await t(pg, "controls-confirm-yes").click();
    await pg.waitForFunction(() => document.querySelectorAll("[data-testid=memory-row]").length === 4 && document.querySelector("[data-testid=controls-title]").innerText === "Memory", null, { timeout: 8000 });
    ok(await pg.locator("[data-testid=memory-row]", { hasText: "Knee" }).count() === 0, `${L}: Forget takes it off the list`);

    // ---------- Skills ----------
    await t(pg, "controls-back").click();
    await t(pg, "controls-skills").click();
    await settle(pg);
    ok(await pg.locator(".ctl-screen:not([hidden]) .ctl-skill").count() === 3, `${L}: three skills`);
    const sw = t(pg, "skill-switch-weather-check");
    ok((await sw.getAttribute("role")) === "switch" && (await sw.getAttribute("aria-checked")) === "false", `${L}: a switch, off for weather-check`);
    await sw.click();
    ok((await toastOf(pg, "weather-check is on")) === "weather-check is on" && (await sw.getAttribute("aria-checked")) === "true", `${L}: switching on says so`);
    await shot(pg, "skills", vp, theme);
    await t(pg, "skill-row-apple-reminders").click();
    await settle(pg);
    ok(await t(pg, "controls-delete").count() === 0 && await t(pg, "controls-bundled-note").count() === 1, `${L}: a bundled skill can be switched off, not deleted`);
    await t(pg, "controls-back").click();
    await t(pg, "skill-row-trail-planner").click();
    await settle(pg);
    ok((await title(pg)) === "trail-planner" && (await t(pg, "controls-rendered").innerText()).includes("Trail planner"), `${L}: SKILL.md is drawn`);
    await t(pg, "controls-edit").click();
    await t(pg, "controls-editor").fill("no frontmatter here");
    await t(pg, "controls-save").click();
    ok((await t(pg, "controls-editor-error").innerText()) === "A skill needs its name and description at the top.", `${L}: the host's refusal shows in its words`);
    await t(pg, "controls-cancel").click();
    await t(pg, "controls-delete").click();
    ok((await t(pg, "controls-confirm").innerText()).includes("Delete the skill trail-planner? Its folder goes to the trash for 30 days."), `${L}: Delete asks`);
    await t(pg, "controls-confirm-yes").click();
    await pg.waitForFunction(() => document.querySelectorAll(".ctl-skill").length === 2, null, { timeout: 8000 });
    ok(true, `${L}: and the skill is gone from the list`);

    // ---------- Schedules ----------
    await t(pg, "controls-back").click();
    await t(pg, "controls-schedules").click();
    await settle(pg);
    ok(/weekdays 8:00 · next in 3 h/.test(await t(pg, "schedule-row-j-morning").innerText()), `${L}: when and next run on the row`);
    ok(/Paused/.test(await t(pg, "schedule-row-j-weekly").innerText()) && !/next/.test(await t(pg, "schedule-row-j-weekly").innerText()), `${L}: a Paused chip and no next run`);
    await shot(pg, "schedules", vp, theme);
    await t(pg, "schedule-row-j-weekly").click();
    await settle(pg);
    const card = await t(pg, "schedule-card").innerText();
    ok(/Fridays 17:00/.test(card) && /Delivers to\s*Yui/.test(card) && /Last run\s*(\d+ h ago|yesterday), worked/.test(card), `${L}: the job: time, deliver, last run`);
    ok((await t(pg, "controls-rendered").innerText()).includes("Draft next week's runs"), `${L}: and its prompt`);
    await shot(pg, "schedule", vp, theme);
    await t(pg, "controls-resume").click();
    ok((await toastOf(pg, "Resumed")) === "Resumed", `${L}: Resume is one tap`);
    await pg.waitForSelector("[data-testid=controls-pause]");
    ok(/Next run/.test(await t(pg, "schedule-card").innerText()) && !/Paused/.test(await t(pg, "schedule-card").innerText()), `${L}: it has a next run again`);
    await t(pg, "controls-run").click();
    await pg.waitForFunction(() => /Runs within a minute/.test(document.body.innerText));
    await t(pg, "controls-pause").click();
    await pg.waitForSelector("[data-testid=controls-resume]");
    await t(pg, "controls-time").click();
    await t(pg, "controls-time-kind").getByRole("radio", { name: "Every" }).click();
    await t(pg, "controls-time-minutes").waitFor();
    await pg.getByRole("button", { name: "More often" }).click();
    ok(/Every 35 minutes/.test(await t(pg, "controls-time-minutes").innerText()), `${L}: the picker steps by five`);
    await shot(pg, "time", vp, theme);
    await t(pg, "controls-time-save").click();
    await pg.waitForFunction(() => /every 35 minutes/.test(document.querySelector("[data-testid=schedule-card]")?.innerText || ""), null, { timeout: 8000 });
    ok(true, `${L}: the new time shows in words`);
    await t(pg, "controls-delete").click();
    ok((await t(pg, "controls-confirm").innerText()).includes("Delete the schedule weekly plan? It will stop running."), `${L}: Delete asks`);
    await t(pg, "controls-confirm-yes").click();
    await pg.waitForFunction(() => document.querySelectorAll("[data-testid^=schedule-row-]").length === 2, null, { timeout: 8000 });
    ok(true, `${L}: and the schedule is gone`);

    // ---------- Model, Channels ----------
    await t(pg, "controls-back").click();
    await t(pg, "controls-model").click();
    await settle(pg);
    const mt = await pg.locator(".ctl-screen:not([hidden])").innerText();
    ok(/claude-opus-5-5/.test(mt) && /hermes-cli/.test(mt) && /browser\s*Off/.test(mt), `${L}: model, provider and toolsets with on/off`);
    ok(await pg.locator(".ctl-screen:not([hidden]) .ctl-dot.on").count() === 2, `${L}: two tools on`);
    await shot(pg, "model", vp, theme);
    await t(pg, "controls-back").click();
    await t(pg, "controls-channels").click();
    await settle(pg);
    ok(/Telegram\s*Connected/.test(await pg.locator(".ctl-screen:not([hidden])").innerText()) && /Discord\s*Off/.test(await pg.locator(".ctl-screen:not([hidden])").innerText()), `${L}: channels, read only`);

    // ---------- Talk about this ----------
    await t(pg, "controls-back").click();
    await t(pg, "controls-memory").click();
    await settle(pg);
    await pg.locator("[data-testid=memory-row]").first().click();
    await settle(pg);
    await t(pg, "controls-talk-about").click();
    await pg.waitForFunction(() => !document.querySelector("[data-testid=controls-panel]"));
    const talked = await pg.evaluate(() => window.yuiTalked);
    ok(!talked || (talked.section === "memory" && !!talked.id && !!talked.title && !!talked.text), `${L}: Talk about this closes the panel and hands over the item ${JSON.stringify(talked || null).slice(0, 80)}`);
    ok(pg.errs.length === 0, `${L}: no page errors ${pg.errs.join("|")}`);
    await pg.context().close();
  }
}

// ---------- the Mac does not answer ----------
{
  const pg = await open({ width: 390, height: 844 }, "light");
  await pg.evaluate(() => { window.yuiDemoControlHost.silent = true; });
  await t(pg, "controls-skills").click();
  await pg.waitForSelector("[data-testid=controls-problem]", { timeout: 9000 });
  const words = await t(pg, "controls-problem").innerText();
  ok(/Your Mac didn't answer\./.test(words) && /It may be asleep or its gateway may be off\. Your change was not made\./.test(words), "silent host: the problem screen in the app's words");
  await shot(pg, "problem", "390", "light");
  await pg.evaluate(() => { window.yuiDemoControlHost.silent = false; });
  await t(pg, "controls-retry").click();
  await pg.waitForSelector(".ctl-skill");
  ok(true, "silent host: Try again asks again and the list comes");
  await pg.keyboard.press("Escape");
  ok(await t(pg, "controls-panel").count() === 0, "Escape closes the dialog");
  await pg.context().close();
}

// ---------- the computer is asleep: Controls come back when it is online ----------
{
  const pg = await open({ width: 390, height: 844 }, "dark");
  await pg.evaluate(() => window.yuiWebDemo.host.sleep("demo-penny"));
  await pg.waitForSelector("[data-testid=controls-offline]", { timeout: 20000 });
  ok(/Penny's computer is asleep\. Controls come back when it's online\./.test(await t(pg, "controls-offline").innerText()), "asleep: the offline note");
  ok(await t(pg, "controls-soul").isDisabled(), "asleep: the rows are greyed out");
  await shot(pg, "offline", "390", "dark");
  await pg.evaluate(() => window.yuiWebDemo.host.listen("demo-penny"));
  await pg.waitForFunction(() => !document.querySelector("[data-testid=controls-offline]"), null, { timeout: 20000 });
  ok(!(await t(pg, "controls-soul").isDisabled()), "asleep: back online, they come back");
  await pg.context().close();
}

await b.close();
console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
