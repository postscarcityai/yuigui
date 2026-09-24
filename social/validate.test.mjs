// node --test social/validate.test.mjs
import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, mkdirSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { parseDraft, validateDraft, validateQueue, postLength, run } from "./validate.mjs";
import { pending, advance, entryKey } from "./pending.mjs";

const root = mkdtempSync(join(tmpdir(), "yui-social-"));
mkdirSync(join(root, "site/public/progress"), { recursive: true });
writeFileSync(join(root, "site/public/progress/shot.webp"), "x");

const draft = (text, meta = {}) => {
  const m = { platform: "x", account: "yuiguiai", source: "progress.json test", media: "[/progress/shot.webp]", slot: "2026-09-29T09:00:00-04:00", status: "draft", ...meta };
  const fm = Object.entries(m).map(([k, v]) => `${k}: ${v}`).join("\n");
  return parseDraft(`---\n${fm}\n---\n${text}\n`, `${m.platform}-${m.slot}.md`);
};
const errs = (text, meta) => validateDraft(draft(text, meta), { root });
const fails = (text, pattern, meta) => {
  const e = errs(text, meta);
  assert.ok(e.some((x) => pattern.test(x)), `expected ${pattern} in ${JSON.stringify(e)}`);
};

test("a clean post passes", () => {
  assert.deepEqual(errs("Asked for 40/20 intervals, got a paragraph. Now it's a timer. yuigui.com/playground"), []);
});

test("em dash fails, hyphen and comma do not", () => {
  fails("One line in — one screen out.", /em dash/);
  assert.deepEqual(errs("One line in, one screen out. Built-in timer."), []);
});

test("banned words fail, including the fleet list", () => {
  for (const w of ["seamless", "Revolutionary", "AI-powered", "next generation", "supercharge", "the future of apps", "leverage", "delve", "Additionally", "crucial", "landscape"]) {
    fails(`Yui is ${w} stuff.`, /banned word/);
  }
});

test("BIZ-1 must-not-claims fail", () => {
  fails("The first phone app for your agent.", /"first" claim/);
  fails("The most compact UI format.", /most compact/);
  fails("Works with any agent.", /any agent/);
  fails("Every agent framework can use it.", /any agent/);
  fails("Native, unlike everyone else.", /unlike everyone/);
});

test("first outside PR is a real milestone, not a claim", () => {
  assert.deepEqual(errs("The first outside PR landed today. Thank you @someone."), []);
  assert.deepEqual(errs("Connect your first agent and see its first screen."), []);
  fails("The world's first agent screen.", /"first" claim/);
  fails("First ever native agent UI.", /"first" claim/);
  fails("We were first to ship it.", /"first" claim/);
});

test("token multipliers must be ours and name what they beat", () => {
  fails("Yui Lines is 5x smaller.", /not 1\.6x, 2\.7x or 3\.9x/);
  fails("Yui Lines is 1.6x smaller.", /without what it is against/);
  fails("3.9x smaller than lean JSON.", /without what it is against/);
  assert.deepEqual(errs("YL is 1.6x smaller than minified JSON."), []);
  assert.deepEqual(errs("1.6x fewer tokens than lean JSON, 2.7x vs pretty JSON, 3.9x vs a component tree."), []);
  assert.deepEqual(errs("timer 40/20x8 Tabata"), [], "preset syntax is not a multiplier");
});

test("PII, secrets and costs fail", () => {
  fails("Write to someone@example.com", /email/);
  fails("Call (561) 555-1234", /phone/);
  fails("It cost $40 to run.", /cost/);
  fails("Used 4,128 credits", /cost/);
  fails("key sk-ant-abcdefghijklmnopqrstuv", /api key/);
  fails("token ghp_abcdefghijklmnopqrstuvwxyz123", /github token/);
  fails("Built for a client at AMC.", /private name/);
  fails("Heathos liked it.", /private name/);
  fails("see t_8fe39aec", /task id/);
});

test("platform limits", () => {
  fails("a".repeat(281), /281 characters, x limit is 280/);
  assert.equal(postLength(`${"a".repeat(250)} https://www.yuigui.com/some/very/long/path/that/goes/on`), 274);
  fails("Two\nlines", /one line/, { platform: "instagram" });
  fails("Nice #buildinpublic", /no hashtags/, { platform: "instagram" });
  fails("hi", /unknown platform/, { platform: "myspace" });
});

test("threads split on ---, each post checked", () => {
  const d = draft(`First post is fine here.\n---\n${"b".repeat(300)}`.replace("First", "One"));
  assert.equal(d.posts.length, 2);
  const e = validateDraft(d, { root });
  assert.ok(e.some((x) => /\(post 2\)/.test(x)), JSON.stringify(e));
  fails("one\n---\ntwo", /does not take threads/, { platform: "linkedin" });
});

test("media must exist and be present", () => {
  fails("hi", /media not found/, { media: "[site/public/progress/missing.webp]" });
  fails("hi", /no media/, { media: "[]" });
  assert.deepEqual(errs("hi", { media: "[site/public/progress/shot.webp]" }), []);
});

test("frontmatter is required", () => {
  assert.deepEqual(validateDraft(parseDraft("no frontmatter"), { root }), ["missing frontmatter"]);
  fails("hi", /bad status/, { status: "live" });
  fails("hi", /bad slot/, { slot: "tomorrow" });
});

test("two posts on one account in one slot fail, other accounts and rejected drafts do not", () => {
  const a = draft("one");
  const b = { ...draft("two"), file: "b.md" };
  const c = { ...draft("three", { platform: "bluesky" }), file: "c.md" };
  const r = { ...draft("four", { status: "rejected" }), file: "r.md" };
  const out = validateQueue([a, b, c, r]);
  assert.deepEqual([...out.keys()], ["b.md"]);
});

test("run() over a directory exits 1 on any failure", () => {
  const q = join(root, "social/queue");
  mkdirSync(q, { recursive: true });
  const lines = [];
  writeFileSync(join(q, "ok.md"), "---\nplatform: x\naccount: yuiguiai\nsource: t\nmedia: [/progress/shot.webp]\nslot: 2026-09-29T09:00:00-04:00\nstatus: draft\n---\nOne line in, one screen out.\n");
  assert.equal(run([q], { root, log: (l) => lines.push(l) }), 0);
  writeFileSync(join(q, "bad.md"), "---\nplatform: x\naccount: yuiguiai\nsource: t\nmedia: [/progress/shot.webp]\nslot: 2026-09-30T09:00:00-04:00\nstatus: draft\n---\nA seamless experience.\n");
  assert.equal(run([q], { root, log: (l) => lines.push(l) }), 1);
  assert.ok(lines.some((l) => l.includes("bad.md") && l.includes("seamless")));
});

test("high-water mark: new entries only, nothing dropped on a missed run", () => {
  const e1 = { date: "2026-09-24", card: "YUI-27", title: "a" };
  const e2 = { date: "2026-09-25", card: "YUI-28", title: "b" };
  const e3 = { date: "2026-09-26", title: "Week of Sep 21: c" };
  let state = advance({ floor: "2026-09-24", done: [] }, [entryKey(e1)], [e1]);
  assert.deepEqual(pending([e1], state), []);
  // Two ships while the drafter was down: both come back, oldest first.
  assert.deepEqual(pending([e3, e2, e1], state).map((e) => e.date), ["2026-09-25", "2026-09-26"]);
  state = advance(state, [entryKey(e2)], [e3, e2, e1]);
  assert.deepEqual(pending([e3, e2, e1], state), [e3]);
  assert.equal(state.hwm, "2026-09-25");
  // A backdated entry after the floor still shows up; history before the floor does not.
  const late = { date: "2026-09-24", card: "YUI-26", title: "late" };
  const old = { date: "2026-09-01", card: "YUI-1", title: "old" };
  assert.deepEqual(pending([e3, e2, late, e1, old], state).map((e) => e.card ?? e.title), ["YUI-26", "Week of Sep 21: c"]);
});
