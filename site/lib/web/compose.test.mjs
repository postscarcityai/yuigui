// node --test lib/web/compose.test.mjs   (YUI-244: the composer's wire formats, byte for byte the app's)
import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import * as C from "./compose.mjs";

const spec = readFileSync(new URL("../../../spec/REACTIONS.md", import.meta.url), "utf8");
const agents = [
  { id: "a-yui", name: "Yui", handle: "yui", presence: "online" },
  { id: "a-penny", name: "Penny", handle: "penny", presence: "asleep" },
  { id: "a-basil", name: "Basil", handle: "basil", presence: "online", push_muted: true },
  { id: "a-coach", name: "Coach", handle: "coach", presence: "offline" },
];

test("the six reactions are the ones in spec/REACTIONS.md", () => {
  const table = spec.split("<!-- reactions:table")[1].split("<!-- /reactions:table -->")[0];
  const rows = table.split("\n").filter((l) => l.startsWith("|")).slice(2).map((l) => l.split("|").slice(1, -1).map((c) => c.trim()));
  assert.deepEqual(C.REACTIONS, rows.map(([emoji, meaning]) => ({ emoji, meaning })));
});

test("a reaction goes out as the spec's line, quoted, changed and taken back", () => {
  const up = C.reactionOf("👍");
  assert.equal(C.reactionBody({ msg: "3a6e", reaction: up, quoting: "Want me to set up the Tuesday plan? Squats, then a 20 minute tabata." }),
    '[yui] react msg=3a6e emoji=👍 meaning="build it"\n> Want me to set up the Tuesday plan? Squats, then a 20 minute tabata.');
  assert.equal(C.reactionBody({ msg: "3a6e", reaction: C.reactionOf("🔥"), changed: true }), "[yui] react msg=3a6e emoji=🔥 meaning=priority changed=true");
  assert.equal(C.reactionBody({ msg: "3a6e", reaction: null, quoting: "hi" }), "[yui] react msg=3a6e emoji=none\n> hi");
  assert.deepEqual(C.reactionMeta({ msg: "3a6e", reaction: up }), { react: { msg: "3a6e", emoji: "👍" } });
  assert.deepEqual(C.reactionMeta({ msg: "3a6e", reaction: null }), { react: { msg: "3a6e", emoji: null } });
  assert.deepEqual(C.reactionFrom({ react: { msg: "3A6E", emoji: null } }), { msg: "3a6e", emoji: null });
  assert.equal(C.reactionFrom({}), null);
});

test("a quote is 200 characters at most, one `> ` per line", () => {
  const q = C.quoteMessage(`${"a".repeat(250)}`);
  assert.equal(q, `> ${"a".repeat(200)}…`);
  assert.equal(C.quoteMessage("one\n\ntwo"), "> one\n> two");
  assert.equal(C.quoteMessage("  "), "");
});

test("reply: the line, the body and the meta the app writes", () => {
  const q = C.replyQuote({ id: "ABC#1", role: "agent", text: 'Say "hi"\nmore' });
  assert.deepEqual(q, { msg: "abc", fromUser: false, quote: 'Say "hi"', rows: [] });
  assert.equal(C.replyLine(q), '[yui] reply to=abc from=agent quote="Say \\"hi\\""');
  assert.equal(C.replyBody("sure", q), '[yui] reply to=abc from=agent quote="Say \\"hi\\""\nsure');
  assert.equal(C.replyBody("sure", null), "sure");
  assert.deepEqual(C.replyMeta({ photos: ["p"] }, q), { photos: ["p"], reply_to: { msg: "abc", from: "agent", quote: 'Say "hi"' } });
  assert.equal(C.replyMeta(null, null), null);
  assert.equal(C.firstLine("x".repeat(130)), `${"x".repeat(120)}…`);
});

test("reply to a card quotes its title and the next rows", () => {
  const state = { screens: { 1: [{ preset: "choose", props: { q: "Move Friday?", opts: ["Yes", "No"] } }, { preset: "list", props: { items: ["Squats", "Tabata"] } }] } };
  const q = C.replyQuote({ id: "r1#0", role: "agent", yl: "x", state });
  assert.equal(q.quote, "Move Friday?");
  assert.deepEqual(q.rows, ["Squats", "Tabata"]);
  assert.equal(C.replyLine(q), '[yui] reply to=r1 from=agent quote="Move Friday?" rows="Squats | Tabata"');
  assert.equal(C.replyQuote({ id: "r2", role: "agent", text: "" }), null);
  assert.equal(C.replyQuote({ id: "r2", role: "user", text: "", photos: ["a", "b"] }).quote, "2 photos");
});

test("mentions: the query, the matches, the fill and the target", () => {
  assert.equal(C.mentionQuery("hi @pe"), "pe");
  assert.equal(C.mentionQuery("me@example.com"), null);
  assert.equal(C.mentionQuery("@penny hello"), null);
  assert.equal(C.mentionQuery("hello"), null);
  assert.deepEqual(C.mentionMatches("@", agents, "a-yui").map((a) => a.name), ["Penny", "Basil", "Coach"]);
  assert.deepEqual(C.mentionMatches("@a", agents, "a-yui").map((a) => a.name), ["Basil", "Coach"]); // contains, in list order
  assert.deepEqual(C.mentionMatches("@c", agents, "a-yui").map((a) => a.name), ["Coach"]);
  assert.deepEqual(C.mentionMatches("@penny", agents, "a-yui"), []); // typed in full
  assert.deepEqual(C.mentionMatches("@yu", agents, "a-yui"), []);   // never the open agent
  assert.equal(C.mentionFill("hey @pe", agents[1]), "hey @Penny ");
  assert.equal(C.mentionTarget("ask @Penny to move it", agents, "a-yui").id, "a-penny");
  assert.equal(C.mentionTarget("ask @coach and @penny", agents, "a-yui").id, "a-coach"); // the first one
  assert.equal(C.mentionTarget("mail me@penny.com", agents, "a-yui"), null);
  assert.equal(C.mentionTarget("@pennyx", agents, "a-yui"), null);
  assert.equal(C.mentionTarget("hi @yui", agents, "a-yui"), null);
  assert.equal(C.mentionBody("move it", agents[1]), "[yui] mention to=penny\nmove it");
  assert.deepEqual(C.mentionMeta(null, agents[1]), { mention: { to: "a-penny", handle: "penny", name: "Penny" } });
  assert.equal(C.mentionPresence(agents[2]), "Online, muted");
  assert.equal(C.mentionPresence(agents[1]), "Asleep");
});

test("slash commands: leading slash, starts first, a finished name hides the list", () => {
  const cmds = [{ name: "new", description: "Start a new session", args: "[name]" }, { name: "model", description: "Switch" }, { name: "renew", description: "x" }];
  assert.deepEqual(C.slashMatches("/", cmds).map((c) => c.name), ["new", "model", "renew"]);
  assert.deepEqual(C.slashMatches("/ne", cmds).map((c) => c.name), ["new", "renew"]);
  assert.deepEqual(C.slashMatches("/model", cmds), []);
  assert.deepEqual(C.slashMatches("/new x", cmds), []);
  assert.deepEqual(C.slashMatches("new", cmds), []);
  assert.equal(C.slashFill(cmds[0]), "/new ");
  assert.equal(C.slashFill(cmds[1]), "/model");
  const s = C.suggestions("/ne", { agents, current: "a-yui", commands: cmds });
  assert.deepEqual(s.map((x) => [x.kind, x.title, x.fill]), [["slash", "/new", "/new "], ["slash", "/renew", "/renew"]]);
  const m = C.suggestions("hi @pe", { agents, current: "a-yui", commands: cmds });
  assert.deepEqual(m.map((x) => [x.kind, x.title, x.fill, x.detail]), [["mention", "Penny", "hi @Penny ", "Asleep"]]);
  assert.deepEqual(C.suggestions("hi @pe", { agents, current: "a-yui", commands: cmds, mentions: false }), []);
});

test("photos: the stand-in body, the meta, the paths, the caption", () => {
  assert.equal(C.photoBody("  ", 1), "Photo");
  assert.equal(C.photoBody("", 3), "3 photos");
  assert.equal(C.photoBody(" look ", 2), "look");
  assert.equal(C.photoBody("", 0), "");
  const p = C.mediaPath("U-1".repeat(0) + "11111111-1111-4111-8111-111111111111", "22222222-2222-4222-8222-222222222222", "AAAAAAAA-AAAA-4AAA-8AAA-AAAAAAAAAAAA");
  assert.equal(p, "11111111-1111-4111-8111-111111111111/22222222-2222-4222-8222-222222222222/user/aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa.jpg");
  assert.equal(C.isUserPath(p), true);
  assert.equal(C.isUserPath("x/y/agent/z.jpg"), false);
  assert.deepEqual(C.photoPaths({ photos: [p, "../../etc/passwd", 4] }), [p]);
  assert.deepEqual(C.photoMeta([p]), { photos: [p] });
  assert.equal(C.photoMeta([]), null);
  assert.equal(C.photoCaption("2 photos", 2), "");
  assert.equal(C.photoCaption("look", 2), "look");
  assert.deepEqual(C.fitSize(4096, 2048), { w: 2048, h: 1024 });
  assert.equal(C.fitSize(2048, 100), null);
  assert.equal(C.isPhotoFile({ type: "image/jpeg" }), true);
  assert.equal(C.isPhotoFile({ type: "", name: "IMG_1.HEIC" }), true);
  assert.equal(C.isPhotoFile({ type: "application/pdf", name: "a.pdf" }), false);
});

test("a pasted key is never kept as a draft", () => {
  assert.equal(C.keepable("hello"), true);
  assert.equal(C.keepable(""), false);
  assert.equal(C.keepable("use sk-abcdefghijklmnopqrstuvwxyz123456"), false);
  assert.equal(C.keepable("ghp_abcdefghijklmnopqrstuvwxyz0123456789"), false);
});
