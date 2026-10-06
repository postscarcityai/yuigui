// node --test lib/web/film.test.mjs   (YUI-311: a streamed motion film reaches the web player)
import test from "node:test";
import assert from "node:assert/strict";
import { Thread } from "./thread.mjs";
import { filmOfPieces, filmsOfMessages, foldFilmRows, fresh, handoff, parseScenes, says, stills, themeFor } from "./film.mjs";
import { turnOf } from "./stage.mjs";
import { answerOf } from "../chat/stage.mjs";

const T0 = Date.parse("2026-10-06T10:00:00Z");
let n = 0;
const row = (o) => ({ id: `f${++n}`, sender: "agent", kind: "text", body: "", meta: {}, created_at: new Date(T0 + n * 1000).toISOString().replace("Z", "000+00:00"), delivered_at: null, handled_at: null, reaction: null, doing: null, ...o });
const yl = (s) => "```yui\n" + s + "\n```";
const thread = (rows) => { const t = new Thread(); t.load(rows); return t.messages; };
const S1 = '=== scene hook 4 ===\napi.say("Four strokes");\nc.fillStyle = api.c.accent;';
const S2 = '=== engine 6 ===\napi.say("Squeeze, bang");';
const wire = (head, scenes) => `${head}\n${scenes}\nend`;

const streamed = () => thread([
  row({ sender: "user", body: "how a car engine works" }),
  row({ body: yl(wire('motion "How an engine works" film=m7 part=1', S1)) }),
  row({ body: yl(wire("motion film=m7 part=2", S2)) }),
  row({ body: yl("motion film=m7 part=3 +last") }),
]);

test("scenes parse from the wire, with and without the word scene, and the seconds are held to 0.5..20", () => {
  const s = parseScenes(`${S1}\n${S2}\n=== long 99 ===\nx\n=== empty 3 ===\n`);
  assert.deepEqual(s.map((x) => [x.name, x.dur]), [["hook", 4], ["engine", 6], ["long", 20]]);
  assert.match(s[0].code, /api\.say/);
  assert.deepEqual(says(S1), ["Four strokes"]);
  assert.deepEqual(says("api.say('it\\'s fine'); api.say(`two`)"), ["it's fine", "two"]);
});

test("the rows of one film join into one film, in part order, done at +last", () => {
  const films = filmsOfMessages(streamed());
  assert.equal(films.length, 1);
  const f = films[0];
  assert.equal(f.id, "m7");
  assert.equal(f.title, "How an engine works");
  assert.deepEqual(f.scenes.map((s) => s.name), ["hook", "engine"]);
  assert.equal(f.done, true);
  assert.equal(f.rows.length, 3);
});

test("a film still being written is not done, and a phone that missed part 1 starts from the part it has", () => {
  const m = streamed();
  assert.equal(filmsOfMessages(m.slice(0, 2))[0].done, false);
  const late = filmsOfMessages(m.filter((x, i) => i !== 1))[0];
  assert.deepEqual(late.scenes.map((s) => s.name), ["engine"]);
});

test("an ask with no film (an old plugin) is a sketch, never a film", () => {
  const m = thread([row({ sender: "user", body: "how a heart works" }), row({ body: yl('motion "How a heart pumps blood"') })]);
  const [f] = filmsOfMessages(m);
  assert.equal(f.sketch, true);
  assert.equal(f.ask, "How a heart pumps blood");
  assert.equal(filmOfPieces(turnOf(m).pieces), null);
});

test("the record keeps one row per film; the stage still reads every row", () => {
  const m = streamed();
  const kept = foldFilmRows(m);
  assert.equal(kept.length, m.length - 2);
  assert.equal(kept[1].id, m[1].id);
  // a row that holds more than the film is never folded
  const mixed = thread([row({ body: yl(wire('motion "A" film=m8 part=1', S1)) }), row({ body: yl(wire("motion film=m8 part=2", S2) + '\nsay "Done"') })]);
  assert.equal(foldFilmRows(mixed).length, mixed.length);
});

test("the turn's film is the one the stage plays, and it is not a chunk of the answer", () => {
  const t = turnOf(streamed());
  const film = filmOfPieces(t.pieces);
  assert.equal(film.scenes.length, 2);
  assert.equal(answerOf(t.pieces).chunks.length, 0);
});

test("stream to player: scene 1 goes out alone, later scenes append, end follows the last, nothing twice", () => {
  const theme = themeFor("#ff7e8a", false);
  const rows = streamed();
  let r = handoff(filmsOfMessages(rows.slice(0, 2))[0], fresh(), theme);
  assert.deepEqual(r.posts.map((p) => Object.keys(p)[0]), ["theme", "scene"]);
  assert.equal(r.posts[1].scene.name, "hook");
  let sent = r.sent;
  assert.equal(handoff(filmsOfMessages(rows.slice(0, 2))[0], sent, theme).posts.length, 0);
  r = handoff(filmsOfMessages(rows.slice(0, 3))[0], sent, theme);
  assert.deepEqual(r.posts.map((p) => p.scene?.name), ["engine"]);
  sent = r.sent;
  r = handoff(filmsOfMessages(rows)[0], sent, theme);
  assert.deepEqual(r.posts, [{ end: true }]);
  assert.equal(handoff(filmsOfMessages(rows)[0], r.sent, theme).posts.length, 0);
});

test("a film already whole goes out in one handoff: theme, every scene, end", () => {
  const r = handoff(filmsOfMessages(streamed())[0], fresh(), themeFor("#ff7e8a", true));
  assert.deepEqual(r.posts.map((p) => Object.keys(p)[0]), ["theme", "scene", "scene", "end"]);
  assert.equal(r.posts[0].theme.ink, "#fbf7ff");
});

test("end is never sent before a scene, and an empty film owes nothing", () => {
  assert.deepEqual(handoff({ scenes: [], done: true }, fresh()).posts, []);
  assert.deepEqual(handoff(null, fresh()).posts, []);
});

test("Reduce Motion: a still per scene, near its end, with the last line it says", () => {
  const s = stills(filmsOfMessages(streamed())[0]);
  assert.equal(s.length, 2);
  assert.equal(s[0].at, 3.4);
  assert.equal(s[1].at, 9.1);
  assert.deepEqual(s.map((x) => x.caption), ["Four strokes", "Squeeze, bang"]);
});
