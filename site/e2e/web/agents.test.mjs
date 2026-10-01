// YUI-245 e2e: agents on the web, on the demo relay (no sign in, no network): the drawer (chats, menu rows, the
// Agent tab), your agents (switch, order, edit, rename, remove with the app's confirm), Add agent end to end
// (crew, a pairing code, the wait for the gateway, Say hi), groups of shared agents, light and dark, 390 px and desktop.
//   npx next build && npx next start -p 3245 &   then   node e2e/web/agents.test.mjs
// BASE overrides the origin, PLAYWRIGHT the Playwright module, SHOTS the folder for the shots (skipped when unset).
import { createRequire } from "node:module";
import { mkdirSync } from "node:fs";
const { chromium } = createRequire(import.meta.url)(process.env.PLAYWRIGHT || "playwright");
const BASE = process.env.BASE || "http://localhost:3245";
const SHOTS = process.env.SHOTS || "";
if (SHOTS) mkdirSync(SHOTS, { recursive: true });
const b = await chromium.launch();
let pass = 0, fail = 0;
const ok = (c, msg) => { if (c) { pass++; console.log("  ok  ", msg); } else { fail++; console.log("  FAIL", msg); } };
const PHONE = { width: 390, height: 844 }, DESK = { width: 1280, height: 800 };
const wire = (pg, id = "demo-penny") => pg.evaluate((a) => window.yuiWebDemo.wire(a).map((r) => r.body), id);
const shot = async (pg, name) => { if (SHOTS) await pg.screenshot({ path: `${SHOTS}/${name}.png` }); };

async function open(vp, theme, { path = "/web/agent/demo-penny", sample = "penny", extra = "" } = {}) {
  const pg = await b.newPage({ viewport: vp, deviceScaleFactor: 2 });
  pg.errs = [];
  pg.on("pageerror", (e) => pg.errs.push(e.message));
  await pg.goto(`${BASE}${path}?demo=${sample}&theme=${theme}${extra}`);
  await pg.waitForSelector("[data-testid=stage-record]");
  await pg.waitForTimeout(500);
  return pg;
}
// At phone width the drawer slides in; on a computer it is a column.
async function drawer(pg, vp) {
  if (vp.width < 760 && !(await pg.locator(".wb-side.open").count())) {
    const stage = pg.locator(".wb-stage-menu:visible");
    await ((await stage.count()) ? stage : pg.locator(".wb-menu:visible")).first().click();
    await pg.waitForTimeout(450);
  }
  await pg.getByTestId("drawer").waitFor();
}
async function switcher(pg, vp) {
  await drawer(pg, vp);
  await pg.getByTestId("agent-bar").click();
  await pg.getByTestId("agents-panel").waitFor();
}

for (const [vp, tag] of [[PHONE, "390"], [DESK, "desktop"]]) for (const theme of ["light", "dark"]) {
  const T = `${theme} ${tag}`;

  // ---------- the drawer: tabs, chats ----------
  let pg = await open(vp, theme);
  await drawer(pg, vp);
  ok(await pg.getByTestId("tab-home").isVisible() && await pg.getByTestId("tab-review").isVisible() && await pg.getByTestId("tab-agent").isVisible(), `${T}: the drawer has Home, Review and Agent`);
  ok((await pg.locator(".dr-name").innerText()) === "Penny", `${T}: it wears the open agent's name`);
  ok(await pg.getByTestId("new-chat").isVisible(), `${T}: New chat is first`);
  const titles = await pg.locator(".dc-row .dc-top b").allInnerTexts();
  ok(titles.join("|") === "Hi Penny|Race week plan|Groceries", `${T}: the chats list, newest first (${titles.join("|")})`);
  ok(await pg.locator(".dc-row.open .dc-top b").innerText() === "Hi Penny", `${T}: the open one is lit`);
  await shot(pg, `web-agents-drawer-${tag}-${theme}`);

  // open an older chat: its own messages, its own address
  await pg.getByTestId("chat-demo-penny-c2").locator(".dc-main").click();
  await pg.waitForTimeout(600);
  ok(pg.url().includes("/chat/demo-penny-c2") && pg.url().includes("demo=penny"), `${T}: the address names the chat and keeps the demo`);
  if (vp.width < 760) ok(await pg.locator(".wb-side").evaluate((e) => e.getBoundingClientRect().right <= 0), `${T}: the drawer shuts behind the tap`);
  await pg.locator("[data-testid=stage-record]").click();
  await pg.waitForSelector(".wb-item");
  const said = await pg.locator(".wb-bubble").allInnerTexts();
  ok(said.some((t) => t.includes("Plan my race week")) && !said.some((t) => t.includes("Add all three")), `${T}: that chat shows its own messages only`);

  // New chat: a draft until something is said, then it is in the list
  await drawer(pg, vp);
  await pg.getByTestId("new-chat").click();
  await pg.waitForTimeout(500);
  ok(/\/chat\/[0-9a-f-]{36}/.test(pg.url()), `${T}: New chat opens a fresh address`);
  const draftUrl = pg.url();
  await drawer(pg, vp);
  ok(await pg.getByTestId("draft-chat").isVisible(), `${T}: it says it is new and waits for a word`);
  await pg.getByTestId("new-chat").click();
  await pg.waitForTimeout(300);
  ok(pg.url() === draftUrl, `${T}: New chat twice is the same chat (${draftUrl.slice(-60)} / ${pg.url().slice(-60)})`);
  const record = pg.locator("[data-testid=stage-record]");
  if (await record.count()) await record.click();
  await pg.locator("textarea[aria-label^='Message']").fill("Plan a quiet Sunday");
  await pg.getByTestId("send").click();
  await pg.waitForTimeout(2400);
  await drawer(pg, vp);
  const after = await pg.locator(".dc-row .dc-top b").allInnerTexts();
  ok(after.length === 4 && after[0] === "New chat", `${T}: the chat is in the list once a word is said (${after.join("|")})`);
  const line = await pg.locator(".dc-row").first().locator(".dc-line").innerText();
  ok(line.length > 0 && line !== "Nothing said yet", `${T}: its row shows the last line (${line.slice(0, 30)})`);

  // rename and delete
  await pg.getByRole("button", { name: "More for New chat" }).click();
  await pg.getByRole("menuitem", { name: "Rename" }).click();
  await pg.locator(".dc-rename input").fill("Quiet Sunday");
  await pg.keyboard.press("Enter");
  await pg.waitForTimeout(300);
  ok((await pg.locator(".dc-row .dc-top b").first().innerText()) === "Quiet Sunday", `${T}: rename shows at once`);
  await pg.getByRole("button", { name: "More for Groceries" }).click();
  await pg.getByRole("menuitem", { name: "Delete" }).click();
  ok((await pg.getByTestId("confirm").innerText()).includes('Delete "Groceries"?'), `${T}: delete asks first, with the chat's name`);
  await shot(pg, `web-agents-delete-chat-${tag}-${theme}`);
  await pg.getByRole("button", { name: "Keep it" }).click();
  ok(await pg.locator(".dc-row").count() === 4, `${T}: Keep it keeps it`);
  await pg.getByRole("button", { name: "More for Groceries" }).click();
  await pg.getByRole("menuitem", { name: "Delete" }).click();
  await pg.getByTestId("confirm-yes").click();
  await pg.waitForTimeout(400);
  ok(await pg.locator(".dc-row").count() === 3 && !(await pg.locator(".dc-row").allInnerTexts()).join().includes("Groceries"), `${T}: Delete removes it`);
  ok(pg.errs.length === 0, `${T}: no page errors ${pg.errs.join("|")}`);
  await pg.close();

  // ---------- menu rows from the agent, the Review tab, the Agent tab ----------
  pg = await open(vp, theme, { path: "/web/agent/demo-basil" });
  await drawer(pg, vp);
  ok(await pg.getByTestId("next-up").isVisible(), `${T}: Next up for you shows the review item`);
  ok(await pg.getByTestId("backlog-plan").isVisible() && await pg.getByTestId("shortcut-groceries").isVisible(), `${T}: backlog and shortcut rows come from the agent's menu lines`);
  await shot(pg, `web-agents-menu-${tag}-${theme}`);
  await pg.getByTestId("shortcut-groceries").click();
  await pg.waitForTimeout(500);
  ok((await wire(pg, "demo-basil")).at(-1) === "Show my grocery list", `${T}: a shortcut sends its words as your message`);
  await drawer(pg, vp);
  await pg.getByTestId("shortcut-log").click();
  await pg.waitForTimeout(400);
  ok((await wire(pg, "demo-basil")).length === 1, `${T}: words ending in a space wait in the field instead of sending`);
  await drawer(pg, vp);
  await pg.getByTestId("tab-review").click();
  ok((await pg.locator(".dr-card").first().innerText()).includes("Swap dinner Thursday?"), `${T}: Review lists what waits on you`);
  await shot(pg, `web-agents-review-${tag}-${theme}`);
  await pg.locator(".dr-card").first().click();
  await pg.waitForTimeout(500);
  ok((await wire(pg, "demo-basil")).at(-1) === "[yui] swap menu bucket=review tapped", `${T}: a review tap goes back as the same bucket line the phone sends`);
  await drawer(pg, vp);
  await pg.getByTestId("tab-agent").click();
  ok(await pg.getByTestId("about-facts").isVisible(), `${T}: the Agent tab says where it runs`);
  ok(await pg.getByTestId("drawer-controls-offline").isVisible() && await pg.getByTestId("drawer-controls-soul").isDisabled(), `${T}: an asleep agent greys Controls out and says why`);
  await shot(pg, `web-agents-about-${tag}-${theme}`);
  await pg.close();

  // ---------- your agents: switch, edit, rename, order, remove ----------
  pg = await open(vp, theme);
  await switcher(pg, vp);
  ok((await pg.getByTestId("agents-greeting").innerText()) === "Who do you want to talk to?", `${T}: your agents, with the app's line over them`);
  ok(await pg.locator(".ag-row").count() === 3, `${T}: three agents`);
  ok((await pg.locator(".ag-row.on .wb-agent-words b").innerText()).startsWith("Penny") && await pg.locator(".ag-row.on .ag-check").count() === 1, `${T}: the one you are talking to has the check`);
  ok((await pg.getByTestId("agent-demo-basil").innerText()).includes("Asleep"), `${T}: honest presence on every row`);
  await shot(pg, `web-agents-list-${tag}-${theme}`);
  await pg.getByTestId("edit-list").click();
  await pg.getByRole("button", { name: "Move Yui down" }).click();
  await pg.waitForTimeout(200);
  const order = (await pg.locator(".ag-row .wb-agent-words b").allInnerTexts()).map((t) => t.split("\n")[0].replace(/Default.*/, "").trim());
  ok(order.join("|").startsWith("Penny|Yui"), `${T}: Edit list moves an agent (${order.join("|")})`);
  await pg.getByTestId("edit-list").click();

  await pg.getByTestId("edit-demo-penny").click();
  await pg.getByTestId("edit-agent").waitFor();
  ok(await pg.getByTestId("share-safety").isVisible() && (await pg.getByTestId("share-safety").innerText()).includes("Not safe to share: it has a shell on your computer"), `${T}: the share line says why in plain words`);
  ok((await pg.getByText("Runs on Maya's Mac as the penny profile.").count()) === 1, `${T}: where it runs`);
  await pg.getByTestId("rename").fill("Penelope");
  await pg.getByRole("button", { name: "Ocean look" }).click();
  await pg.getByRole("switch", { name: /Notifications from/ }).click();
  await shot(pg, `web-agents-edit-${tag}-${theme}`);
  await pg.getByTestId("save-agent").click();
  await pg.waitForTimeout(600);
  const roster = await pg.evaluate(() => window.yuiWebDemo.host.roster().find((a) => a.id === "demo-penny"));
  ok(roster.name === "Penelope" && roster.push_muted === true && roster.theme.preset === "ocean" && roster.theme.by === "user", `${T}: Save writes the name, look and mute (${roster.name}, ${roster.theme.preset}, muted ${roster.push_muted})`);
  ok((await pg.locator(".dr-name").innerText()) === "Penelope", `${T}: and the drawer wears it`);

  // remove asks first
  ok(await pg.getByTestId("agents-panel").isVisible(), `${T}: back on your agents after Save`);
  await pg.getByTestId("edit-demo-basil").click();
  await pg.getByTestId("remove-agent").click();
  const ask = await pg.getByTestId("confirm").innerText();
  ok(ask.includes("Remove Basil?") && ask.includes("This deletes your whole conversation with Basil. The agent itself keeps running on your computer."), `${T}: Remove asks, in the app's words`);
  await shot(pg, `web-agents-remove-${tag}-${theme}`);
  await pg.getByRole("button", { name: "Keep it" }).click();
  ok((await pg.evaluate(() => window.yuiWebDemo.host.roster().length)) === 3, `${T}: Keep it removes nothing`);
  await pg.getByTestId("remove-agent").click();
  await pg.getByTestId("confirm-yes").click();
  await pg.waitForTimeout(700);
  ok((await pg.evaluate(() => window.yuiWebDemo.host.roster().map((a) => a.id).join())) === "demo-yui,demo-penny", `${T}: Remove removes it (the thread goes with it)`);
  ok(pg.errs.length === 0, `${T}: no page errors ${pg.errs.join("|")}`);
  await pg.close();

  // ---------- Add agent: the crew, then your own end to end ----------
  pg = await open(vp, theme);
  await switcher(pg, vp);
  await pg.getByTestId("add-agent-btn").click();
  await pg.getByTestId("add-agent").waitFor();
  ok(await pg.getByTestId("crew-arnold").isVisible() && (await pg.getByTestId("crew-penny").innerText()).includes("In your list"), `${T}: the crew, with who is already here`);
  ok((await pg.getByTestId("crew-all").innerText()) === "Add all 3", `${T}: Add all counts who is missing`);
  await shot(pg, `web-agents-add-${tag}-${theme}`);
  await pg.getByTestId("crew-arnold").click();
  await pg.waitForTimeout(700);
  ok(pg.url().includes("/web/agent/demo-arnold"), `${T}: a crew tap adds it and opens its thread`);
  ok((await pg.evaluate(() => window.yuiWebDemo.host.roster().some((a) => a.id === "demo-arnold"))), `${T}: it is in the list`);

  await switcher(pg, vp);
  await pg.getByTestId("add-agent-btn").click();
  await pg.getByTestId("get-code").waitFor();
  ok(await pg.getByTestId("get-code").isDisabled(), `${T}: no name, no code`);
  await pg.locator("#ag-name").fill("Nova");
  await pg.getByRole("button", { name: "Sky look" }).click();
  await pg.getByTestId("get-code").click();
  await pg.getByTestId("pairing").waitFor();
  const code = (await pg.getByTestId("pair-code").innerText()).split("\n")[0].replace(/\s/g, "");
  ok(/^\d{6}$/.test(code), `${T}: a six digit code (${code})`);
  const cmd = await pg.getByTestId("pair-command").innerText();
  ok(cmd === `hermes plugins install postscarcityai/yui/hermes-plugin/yui --enable && hermes yui pair ${code} && hermes gateway restart`, `${T}: one command to paste, with the code in it`);
  ok((await pg.getByTestId("pair-code").innerText()).includes("Expires in 10:0") || (await pg.getByTestId("pair-code").innerText()).includes("Expires in 9:5"), `${T}: it says when the code runs out`);
  ok((await pg.locator("#ag-name").count()) === 0 && (await pg.getByText("Waiting for your computer…").isVisible()), `${T}: and that it is waiting for the computer`);
  await shot(pg, `web-agents-pair-code-${tag}-${theme}`);
  // its computer claims the code: one step left, the gateway
  await pg.evaluate(() => window.yuiWebDemo.host.pair("demo-nova"));
  await pg.getByTestId("restart-step").waitFor({ timeout: 8000 });
  ok((await pg.getByTestId("restart-command").innerText()) === "hermes -p nova gateway restart", `${T}: paired, the restart step names the profile`);
  ok((await pg.getByTestId("restart-step").innerText()).includes("Nova is paired with Maya's Mac"), `${T}: and the computer`);
  await shot(pg, `web-agents-pair-restart-${tag}-${theme}`);
  await pg.evaluate(() => window.yuiWebDemo.host.listen("demo-nova"));
  await pg.getByTestId("pair-connected").waitFor({ timeout: 8000 });
  ok((await pg.getByTestId("pair-connected").innerText()).includes("Nova is connected!"), `${T}: the gateway listens: connected`);
  await shot(pg, `web-agents-pair-done-${tag}-${theme}`);
  await pg.getByTestId("say-hi").click();
  await pg.waitForTimeout(800);
  ok(pg.url().includes("/web/agent/demo-nova"), `${T}: Say hi opens Nova's thread`);
  ok((await pg.locator(".wb-head-words b").innerText()) === "Nova", `${T}: and the header wears the name`);
  ok(pg.errs.length === 0, `${T}: no page errors ${pg.errs.join("|")}`);
  await pg.close();

  // ---------- an agent given to you ----------
  pg = await open(vp, theme, { path: "/web/agent/demo-basil", sample: "shared" });
  await switcher(pg, vp);
  ok((await pg.getByTestId("agents-greeting").innerText()) === "Hi Maya. Sam set these up for you.", `${T}: Hi Maya. Sam set these up for you.`);
  ok((await pg.getByTestId("shared-footer").innerText()).startsWith("These agents run on Sam's computer"), `${T}: and where they run`);
  ok(await pg.getByTestId("add-agent-btn").count() === 0, `${T}: an invited account has no Add agent`);
  ok((await pg.getByTestId("agent-demo-quill").innerText()).includes("Paused by its owner") && (await pg.getByTestId("agent-demo-quill").innerText()).includes("From Sam"), `${T}: Paused by its owner, From Sam`);
  await shot(pg, `web-agents-shared-${tag}-${theme}`);
  await pg.getByTestId("edit-demo-basil").click();
  ok((await pg.getByTestId("shared-by").innerText()).includes("Shared by Sam"), `${T}: Shared by Sam`);
  ok(await pg.getByTestId("remove-agent").count() === 0 && await pg.getByTestId("rename").count() === 0, `${T}: not yours to rename or remove`);
  ok(await pg.getByRole("switch", { name: /Notifications from Basil/ }).isVisible(), `${T}: notifications are yours`);
  await pg.close();
}

// ---------- Controls from the drawer, and Talk about this ----------
for (const [vp, tag] of [[PHONE, "390"], [DESK, "desktop"]]) for (const theme of ["light", "dark"]) {
  const T = `${theme} ${tag}`;
  const pg = await open(vp, theme);
  await drawer(pg, vp);
  await pg.getByTestId("tab-agent").click();
  ok((await pg.getByTestId("about-what").innerText()).startsWith("Penny keeps your week"), `${T}: the Agent tab says what it does, in its own words`);
  ok((await pg.getByTestId("about-can-0").innerText()).includes("What's next today?"), `${T}: and three things to ask it`);
  const rows = await pg.locator("[data-testid^=drawer-controls-]:not([data-testid=drawer-controls-offline])").evaluateAll((e) => e.map((x) => x.dataset.testid.replace("drawer-controls-", "")));
  ok(rows.join() === "soul,memory,skills,schedules,model,channels", `${T}: its host's areas, in the app's order (${rows.join()})`);
  await shot(pg, `web-agents-about-controls-${tag}-${theme}`);
  await pg.getByTestId("about-can-1").click();
  await pg.waitForTimeout(500);
  ok((await wire(pg)).at(-1) === "Add a to-do", `${T}: a starter goes as your message`);
  await drawer(pg, vp);
  await pg.getByTestId("tab-agent").click();
  await pg.getByTestId("drawer-controls-soul").click();
  await pg.getByRole("dialog", { name: "Controls" }).waitFor();
  await pg.getByTestId("controls-talk-about").waitFor({ timeout: 8000 });
  await shot(pg, `web-agents-controls-soul-${tag}-${theme}`);
  await pg.getByTestId("controls-talk-about").click();
  await pg.getByTestId("about-chip").waitFor();
  ok((await pg.getByTestId("about-chip").innerText()).includes("SOUL.md") && (await pg.getByTestId("about-chip").innerText()).includes("Personality"), `${T}: the item is a chip over the field`);
  await shot(pg, `web-agents-about-chip-${tag}-${theme}`);
  await pg.locator("textarea[aria-label^='Message']").fill("Calmer after 9pm");
  await pg.getByTestId("send").click();
  await pg.waitForTimeout(500);
  const w = (await wire(pg)).at(-1);
  ok(/^\[yui\] attach section=soul id=SOUL\.md rev=[0-9a-f]+\nCalmer after 9pm$/.test(w), `${T}: it goes with the attach line first (${JSON.stringify(w).slice(0, 70)})`);
  ok((await pg.getByTestId("about-tag").last().innerText()) === "About SOUL.md" && (await pg.locator(".wb-user .wb-bubble").last().innerText()) === "Calmer after 9pm", `${T}: the bubble shows the words and About SOUL.md`);
  ok(await pg.getByTestId("about-chip").count() === 1, `${T}: the chip stays for the whole talk`);
  await pg.getByTestId("about-chip-remove").click();
  ok(await pg.getByTestId("about-chip").count() === 0, `${T}: x takes it off`);
  ok(pg.errs.length === 0, `${T}: no page errors ${pg.errs.join("|")}`);
  await pg.close();
}

// ---------- quick actions: the shortcuts of every agent, one palette ----------
for (const [vp, tag] of [[PHONE, "390"], [DESK, "desktop"]]) for (const theme of ["light", "dark"]) {
  const T = `${theme} ${tag}`;
  const pg = await open(vp, theme);
  if (vp.width < 760) { await drawer(pg, vp); await pg.getByTestId("quick-actions-btn").click(); }
  else await pg.keyboard.press("Control+k");
  await pg.getByTestId("palette").waitFor();
  ok(await pg.getByTestId("palette-input").evaluate((e) => e === document.activeElement), `${T}: the field is up as it opens`);
  await pg.waitForTimeout(400);
  ok(await pg.getByTestId("pal-a:demo-basil").isVisible(), `${T}: every agent is one row away`);
  await shot(pg, `web-agents-palette-${tag}-${theme}`);
  await pg.getByTestId("palette-input").fill("grocer");
  const first = await pg.locator("[data-testid^=pal-] b").first().innerText();
  ok(first === "Grocery list" && (await pg.locator("[data-testid^=pal-] small").first().innerText()) === "Basil", `${T}: another agent's shortcut is found by its words (${first})`);
  await shot(pg, `web-agents-palette-found-${tag}-${theme}`);
  await pg.keyboard.press("Enter");
  await pg.waitForTimeout(1200);
  ok(pg.url().includes("/web/agent/demo-basil"), `${T}: Enter opens that agent`);
  ok((await wire(pg, "demo-basil")).at(-1) === "Show my grocery list", `${T}: and sends its words as your message`);
  // used first next time
  if (vp.width < 760) { await drawer(pg, vp); await pg.getByTestId("quick-actions-btn").click(); } else await pg.keyboard.press("Control+k");
  await pg.getByTestId("palette").waitFor();
  await pg.waitForTimeout(300);
  const lead = await pg.locator("[data-testid^=pal-] b").first().innerText();
  ok(lead === "Grocery list", `${T}: what you used leads the empty palette (${lead})`);
  await pg.keyboard.press("Escape");
  ok(await pg.getByTestId("palette").count() === 0, `${T}: Escape closes it`);
  // an action: New chat, and the agent's own area
  if (vp.width < 760) { await drawer(pg, vp); await pg.getByTestId("quick-actions-btn").click(); } else await pg.keyboard.press("Control+k");
  await pg.getByTestId("palette-input").fill("new chat");
  await pg.keyboard.press("Enter");
  await pg.waitForTimeout(500);
  ok(/\/chat\/[0-9a-f-]{36}/.test(pg.url()), `${T}: New chat from the palette`);
  ok(pg.errs.length === 0, `${T}: no page errors ${pg.errs.join("|")}`);
  await pg.close();
}

// ---------- an MCP client asks to connect: approved on the web ----------
for (const theme of ["light", "dark"]) {
  const T = `${theme} 390`;
  let pg = await open(PHONE, theme, { path: "/web/connect/req-123" });
  await pg.getByTestId("connect-approval").waitFor();
  ok((await pg.getByTestId("connect-title").innerText()) === "Connect Claude?", `${T}: connect asks by the client's name`);
  ok((await pg.getByTestId("connect-approval").innerText()).includes("in one thread. It can't see your other threads."), `${T}: and says what it gets`);
  ok(await pg.getByTestId("connect-pick-new").getAttribute("aria-checked") === "true", `${T}: a new agent named after it is the default`);
  await shot(pg, `web-agents-connect-${theme}`);
  await pg.getByTestId("connect-allow").click();
  await pg.getByTestId("connect-result").waitFor();
  ok((await pg.getByTestId("connect-result").innerText()) === "Connected", `${T}: Allow connects it`);
  ok((await pg.getByTestId("connect-approval").innerText()).includes("Claude talks as Claude now."), `${T}: and says who it talks as`);
  ok((await pg.evaluate(() => window.yuiWebDemo.host.roster().some((a) => a.kind === "mcp" && a.name === "Claude"))), `${T}: the agent exists`);
  await shot(pg, `web-agents-connect-done-${theme}`);
  await pg.getByTestId("connect-open").click();
  await pg.waitForTimeout(600);
  ok(pg.url().includes("/web/agent/demo-claude") && await pg.getByTestId("connect-approval").count() === 0, `${T}: Open its thread`);
  await pg.close();
  pg = await open(PHONE, theme, { path: "/web/connect/req-456" });
  await pg.getByTestId("connect-deny").click();
  ok((await pg.getByTestId("connect-result").innerText()) === "Not connected", `${T}: Don't allow says so`);
  await pg.close();
  pg = await open(PHONE, theme, { path: "/web/connect/demo-expired" });
  await pg.getByTestId("connect-result").waitFor();
  ok((await pg.getByTestId("connect-approval").innerText()).includes("This request expired. Add Yui in Claude again."), `${T}: an old request says it expired`);
  await pg.close();
  pg = await open(PHONE, theme, { path: "/web/connect/demo-missing" });
  await pg.getByTestId("connect-result").waitFor();
  ok((await pg.getByTestId("connect-approval").innerText()).includes("This connect link doesn't exist."), `${T}: a bad link says so`);
  await pg.close();
}

// ---------- the gateway that never listens: an honest still nothing, a way to try again ----------
{
  const pg = await open(PHONE, "light", { extra: "&pairing=fast" });
  await switcher(pg, PHONE);
  await pg.getByTestId("add-agent-btn").click();
  await pg.locator("#ag-name").fill("Echo");
  await pg.getByTestId("get-code").click();
  await pg.getByTestId("pairing").waitFor();
  await pg.waitForTimeout(3600);
  ok(await pg.getByTestId("pair-fix").isVisible(), "stuck: still waiting? shows the fix after a while");
  await pg.evaluate(() => window.yuiWebDemo.host.pair("demo-echo"));
  await pg.getByTestId("restart-step").waitFor({ timeout: 8000 });
  await pg.getByTestId("gateway-gave-up").waitFor({ timeout: 8000 });
  ok(true, "gave up: still nothing from its gateway, said plainly");
  await shot(pg, "web-agents-pair-gaveup-390-light");
  await pg.getByRole("button", { name: "Try again" }).click();
  await pg.waitForTimeout(300);
  ok(await pg.getByTestId("gateway-gave-up").count() === 0, "Try again goes back to waiting");
  await pg.evaluate(() => window.yuiWebDemo.host.listen("demo-echo"));
  await pg.getByTestId("pair-connected").waitFor({ timeout: 8000 });
  ok(true, "and it connects when the gateway comes up");
  await pg.close();
}

// ---------- a pairing code that ran out gets a new one ----------
{
  const pg = await open(PHONE, "light");
  await switcher(pg, PHONE);
  await pg.getByTestId("add-agent-btn").click();
  await pg.locator("#ag-name").fill("Late");
  await pg.getByTestId("get-code").click();
  await pg.getByTestId("pairing").waitFor();
  const first = (await pg.getByTestId("pair-code").innerText()).split("\n")[0];
  // the page's clock jumps eleven minutes
  await pg.evaluate(() => { const real = Date.now; Date.now = () => real() + 11 * 60000; });
  await pg.getByTestId("new-code").waitFor({ timeout: 4000 });
  ok(await pg.getByTestId("pair-fix").isVisible() && (await pg.getByTestId("pair-fix").innerText()).includes("That code ran out."), "an old code says it ran out");
  await shot(pg, "web-agents-pair-expired-390-light");
  await pg.getByTestId("new-code").click();
  await pg.waitForTimeout(800);
  const second = (await pg.getByTestId("pair-code").innerText()).split("\n")[0];
  ok(first !== second, `Get a new code gives another (${first} -> ${second})`);
  await pg.close();
}

// ---------- nothing in the list: the first agent ----------
{
  const pg = await open(PHONE, "light");
  for (const id of ["demo-yui", "demo-penny", "demo-basil"]) await pg.evaluate(async (i) => { await window.yuiWebDemo.call("yui-agents", { action: "delete", id: i }); }, id);
  await pg.waitForSelector("[data-testid=no-agents]", { timeout: 20000 });
  ok(await pg.getByTestId("first-add").isVisible(), "no agents: Add your first agent");
  await shot(pg, "web-agents-empty-390-light");
  await pg.close();
}

await b.close();
console.log(`${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
