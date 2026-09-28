// node --test site/lib/chat/lines.test.mjs (SITE-65)
import assert from "node:assert/strict";
import test from "node:test";
import { parse } from "../yl/yl.mjs";
import { brief } from "./brief.mjs";
import { cleanLines, splitReply, tapLabel, tapLine } from "./lines.mjs";

test("a reply splits into text and screens", () => {
  const parts = splitReply("Yui draws screens.\n```yui\nchoose \"Want one?\" Timer|Beat\n```\nTap one.");
  assert.deepEqual(parts, [{ text: "Yui draws screens." }, { yl: 'choose "Want one?" Timer|Beat' }, { text: "Tap one." }]);
});

test("an unclosed block still draws", () => {
  assert.deepEqual(splitReply("Here.\n```yui\ntimer 5m Plank"), [{ text: "Here." }, { yl: "timer 5m Plank" }]);
});

test("plain text stays text", () => {
  assert.deepEqual(splitReply("Yes, it is free."), [{ text: "Yes, it is free." }]);
});

test("media, custom, theme, menu and screen switches are dropped", () => {
  const yl = [
    'say Hi', "image https://evil.example/x.png", "camera \"Snap\"", "custom {\"a\":1}", "theme app autumn",
    "menu backlog x \"y\"", ">2 say page two", "visual orb", "put todo k=1", "choose \"Q?\" A|B",
  ].join("\n");
  assert.equal(cleanLines(yl), 'say Hi\nchoose "Q?" A|B');
});

test("links: Yui's own kept, site paths made whole, others removed", () => {
  assert.equal(cleanLines('card "Get it" cta=Join url=https://testflight.apple.com/join/abc'), 'card "Get it" cta=Join url=https://testflight.apple.com/join/abc');
  assert.equal(cleanLines('card "Play" cta=Go url=/playground'), 'card "Play" cta=Go url=https://www.yuigui.com/playground');
  assert.equal(cleanLines('card "Bad" cta=Go url=https://evil.example/'), 'card "Bad" cta=Go');
  assert.equal(cleanLines('card "Bad" cta=Go url="javascript:alert(1)"'), 'card "Bad" cta=Go');
});

test("patches keep their preset", () => {
  assert.equal(cleanLines("~loop bpm=110\n~image x"), "~loop bpm=110");
});

test("taps go back like the channel sends them", () => {
  assert.equal(tapLine({ id: "n1", preset: "choose", choice: "Legs" }), "[yui] n1 choose choice=Legs");
  assert.equal(tapLine({ id: "n2", preset: "pick", picked: ["Two words", "B"] }), '[yui] n2 pick picked="Two words|B"');
  assert.equal(tapLine({ id: "n1", preset: "game", kind: "tictactoe", move: 5, x: [5], o: [] }), "[yui] n1 game kind=tictactoe move=5 x=5 o=");
  assert.equal(tapLabel({ id: "n1", preset: "choose", choice: "Legs" }), "Legs");
  assert.equal(tapLabel({ id: "n2", preset: "pick", picked: ["A", "B"] }), "A, B");
  assert.equal(tapLabel({ id: "n3", preset: "card", cta: "Start" }), "Start");
});

test("every screen line in the brief parses", () => {
  const b = brief({ path: "/" });
  const blocks = [...b.matchAll(/```yui\n([\s\S]*?)```/g)].map((m) => m[1]);
  const inline = [...b.slice(b.indexOf("What you can draw"), b.indexOf("Rules:")).matchAll(/`([^`\n]+)`/g)].map((m) => m[1]);
  assert.ok(blocks.length >= 2);
  const lines = [...blocks.flatMap((x) => x.split("\n")), ...inline].map((l) => l.trim()).filter((l) => l && l !== "end");
  for (const line of lines) {
    for (const op of parse(line)) assert.notEqual(op.op, "error", `${line}: ${op.message}`);
  }
  assert.ok(lines.length > 20, `checked ${lines.length} lines`);
});

test("the brief has no dashes and no task ids", () => {
  const b = brief({ path: "/" });
  // Only the brief's own words: "Right now" and the site map are read from content at start-up.
  const own = b.slice(0, b.indexOf("# Right now")) + b.slice(b.indexOf("# How you talk"), b.indexOf("# The site map"));
  assert.doesNotMatch(own, /[–—]/);
  assert.doesNotMatch(own, /\bt_[0-9a-f]{6,}\b/);
});

test("the stage and the contact form get through", () => {
  assert.equal(cleanLines(">full\ndeck \"Tour\"\npage \"One\" body=\"Hi\"\nend"), ">full\ndeck \"Tour\"\npage \"One\" body=\"Hi\"\nend");
  assert.equal(cleanLines(">2 timer 5m"), "");
  const form = `form@contact "Stay in touch" first_name:text! last_name:text! email:email! phone:phone submit="Send"`;
  assert.equal(cleanLines(form), form);
  assert.equal(parse(form)[0].id, "contact");
});

test("a flow gets through: by name, and inline with its Mermaid kept to its own end (SITE-68)", () => {
  assert.equal(cleanLines("flow@onboard onboarding"), "flow@onboard onboarding");
  const inline = 'flow@c "Check-in" submit=Send\nflowchart TD\n  %% a: choose "Energy?" Low|High\n  a[Energy] --> s\n  subgraph s [Later]\n    b --> c\n  end\n  %% b: page "Thanks"\nend\nvideo https://x.test/a.mp4\nsay "After"';
  assert.equal(cleanLines(inline), 'flow@c "Check-in" submit=Send\nflowchart TD\n  %% a: choose "Energy?" Low|High\n  a[Energy] --> s\n  subgraph s [Later]\n    b --> c\n  end\n  %% b: page "Thanks"\nend\nsay "After"');
  const f = parse(cleanLines(inline)).find((o) => o.preset === "flow" || o.props?.nodes);
  assert.ok(f, "the kept flow parses");
});

test("a sent flow goes back as one tap, labelled with the answers (SITE-68)", () => {
  const ev = { id: "onboard", preset: "flow", flow: { you: { name: "Sam" }, know: 2, want: ["Get fit"] }, path: ["hi", "you", "know", "want"] };
  assert.equal(tapLine(ev), '[yui] onboard flow flow="{\'you\':{\'name\':\'Sam\'},\'know\':2,\'want\':[\'Get fit\']}" path="hi|you|know|want"');
  assert.equal(tapLabel(ev), "Sam, 2, Get fit");
});
