// node --test lib/web/settings.test.mjs
import test from "node:test";
import assert from "node:assert/strict";
import {
  APPEARANCE_KEY, STAGE_DEFAULT, accountLine, browserLine, buildSummary, feedbackMail, fixStage, guideOf, loadAppearance, loadPicks, loadStage,
  lookBody, lookName, lookState, lookVars, modelLeft, movePick, nativeError, perfOn, recipeOf, resetLook, resolveAppearance, saveAppearance,
  savePicks, saveStage, searchLeft, sectionOf, setAgentsKeep, setStage, togglePick, usedWords,
} from "./settings.mjs";

const mem = () => { const m = new Map(); return { getItem: (k) => (m.has(k) ? m.get(k) : null), setItem: (k, v) => m.set(k, String(v)), removeItem: (k) => m.delete(k), _m: m }; };

test("appearance: system by default, a pick sticks, the site's own switch follows", () => {
  const s = mem();
  assert.equal(loadAppearance(s), "system");
  saveAppearance("dark", s);
  assert.equal(loadAppearance(s), "dark");
  assert.equal(s.getItem("yui-theme"), "dark");
  saveAppearance("system", s);
  assert.equal(s.getItem("yui-theme"), null, "system leaves the site to its default");
  assert.equal(saveAppearance("sepia", s), "system");
  s.setItem(APPEARANCE_KEY, "nonsense");
  assert.equal(loadAppearance(s), "system");
  assert.equal(resolveAppearance("system", true), "dark");
  assert.equal(resolveAppearance("system", false), "light");
  assert.equal(resolveAppearance("light", true), "light");
  assert.equal(resolveAppearance("dark", false), "dark");
});

test("full screen: one of the mic and T always stays", () => {
  let s = { ...STAGE_DEFAULT };
  s = setStage(s, "mic", false);
  assert.deepEqual(s, { on: true, mic: false, type: true, attach: true });
  s = setStage(s, "type", false);
  assert.equal(s.type, true, "T cannot go while the mic is off");
  s = setStage(s, "mic", true);
  s = setStage(s, "type", false);
  assert.deepEqual([s.mic, s.type], [true, false]);
  assert.equal(setStage(s, "mic", false).mic, true, "and the mic cannot go while T is off");
  assert.equal(setStage(s, "bogus", false), s);
  assert.equal(fixStage({ on: true, mic: false, type: false, attach: false }).mic, true);
});

test("full screen: kept on this device, a bad record falls back to the defaults", () => {
  const s = mem();
  assert.deepEqual(loadStage(s), STAGE_DEFAULT);
  saveStage({ on: false, mic: true, type: false, attach: false }, s);
  assert.deepEqual(loadStage(s), { on: false, mic: true, type: false, attach: false });
  s.setItem("yui-web-stage", "{not json");
  assert.deepEqual(loadStage(s), STAGE_DEFAULT);
  s.setItem("yui-web-stage", JSON.stringify({ mic: false, type: false }));
  assert.equal(loadStage(s).mic, true);
});

test("home actions: pick up to four, in the order chosen, move, back to the default", () => {
  let p = null;
  for (const id of ["a/1", "a/2", "b/1", "b/2"]) p = togglePick(p, id);
  assert.deepEqual(p, ["a/1", "a/2", "b/1", "b/2"]);
  assert.deepEqual(togglePick(p, "c/1"), p, "a fifth does not fit");
  assert.deepEqual(togglePick(p, "a/2"), ["a/1", "b/1", "b/2"]);
  assert.deepEqual(movePick(p, "b/1", -1), ["a/1", "b/1", "a/2", "b/2"]);
  assert.deepEqual(movePick(p, "a/1", -1), p, "the top stays the top");
  const s = mem();
  savePicks(p, s);
  assert.deepEqual(loadPicks(s), p);
  savePicks(null, s);
  assert.equal(loadPicks(s), null);
});

test("look: the account's copy in, the same shape out", () => {
  assert.deepEqual(lookState(null), { look: null, prev: null, agentsKeep: true, via: null });
  const s = lookState({ preset: "autumn", agents_keep_looks: false, prev: {}, via: "Penny", at: "2026-10-01T10:00:00Z", by: "user" });
  assert.deepEqual(s, { look: { preset: "autumn" }, prev: {}, agentsKeep: false, via: "Penny" });
  assert.deepEqual(lookBody(s), { preset: "autumn", prev: {}, agents_keep_looks: false, via: "Penny" });
  assert.equal(lookBody(lookState(null)), null, "Yui's own look with the default switch is null");
  assert.deepEqual(lookBody(setAgentsKeep(lookState(null), false)), { agents_keep_looks: false });
});

test("look: back to Yui's look keeps one step to undo, and names what is on", () => {
  const on = lookState({ preset: "forest", accent: "#33AA55" });
  assert.equal(lookName(on.look), "Your own mix");
  assert.equal(lookName(lookState({ preset: "forest" }).look), "Forest");
  assert.equal(lookName(null), "Yui's own");
  const off = resetLook(on);
  assert.equal(off.look, null);
  assert.deepEqual(off.prev, { preset: "forest", accent: "#33AA55" });
  assert.deepEqual(lookBody(off).prev, off.prev);
  assert.equal(resetLook(off), off, "nothing to reset");
});

test("look: the chrome wears a look through the site's tokens, and Yui's own wears nothing", () => {
  assert.deepEqual(lookVars(null, true), {});
  const v = lookVars({ preset: "forest" }, false);
  assert.match(v["--background"], /^#[0-9a-f]{6}$/i);
  assert.match(v["--brand"], /^#[0-9a-f]{6}$/i);
  assert.notEqual(lookVars({ preset: "forest" }, true)["--background"], v["--background"], "dark is its own palette");
  assert.equal(recipeOf({ preset: "autumn", accent: "#112233" }).accent, "#112233");
  assert.equal(recipeOf(null), null);
});

test("agent access: used words", () => {
  const now = Date.parse("2026-10-01T12:00:00Z");
  assert.equal(usedWords(null, now), "Never used");
  assert.equal(usedWords("2026-10-01T01:00:00Z", now), "Used today");
  assert.equal(usedWords("2026-09-30T01:00:00Z", now), "Used yesterday");
  assert.equal(usedWords("2026-09-25T01:00:00Z", now), "Used 6 days ago");
});

test("key forms: the free turns and searches left, in the app's words", () => {
  assert.equal(modelLeft({ used: 30, limit: 100 }), "Yui and your crew have 70 of 100 free turns left this month. Add your own key to keep going with no limit.");
  assert.match(searchLeft({ used: 50, limit: 50 }), /used up this month/);
  assert.match(searchLeft({ used: 10, limit: 50 }), /40 of 50 free web searches left/);
  assert.equal(nativeError({ code: "key_check_failed", message: "OpenRouter said the key is invalid" }), "OpenRouter said the key is invalid");
  assert.match(nativeError({ code: "invalid_key" }), /does not look like a key/);
  assert.match(nativeError({ code: "network" }), /Could not reach Yui/);
  assert.match(nativeError({ code: "weird" }), /Try again/);
});

test("help: the feedback mail names the build and carries the words", () => {
  const url = feedbackMail({ commit: "abc1234", guide: "v45" }, "The mic button is stuck.");
  assert.ok(url.startsWith("mailto:chris@postscarcity.ai?subject="));
  const q = new URL(url.replace("mailto:", "mailto://x/")).searchParams;
  assert.equal(q.get("subject"), "Yui feedback, web abc1234");
  assert.match(q.get("body"), /The mic button is stuck\./);
  assert.match(q.get("body"), /Commit abc1234/);
  assert.match(q.get("body"), /Channel guide v45/);
});

test("about: what the build says, and a local build says so", () => {
  assert.equal(buildSummary({ commit: "abc1234", built: "Oct 1, 2026", guide: "v45", browser: "Safari 19" }), "Yui on the web\nCommit abc1234, built Oct 1, 2026\nChannel guide v45\nSafari 19");
  assert.equal(buildSummary({}), "Yui on the web, local build");
  assert.equal(guideOf("# Yui channel guide v45 (for agents)\n"), "v45");
  assert.equal(guideOf(""), "");
  assert.equal(browserLine("Mozilla/5.0 (iPhone) AppleWebKit/605 Version/19.0 Mobile/15E148 Safari/604.1"), "Safari 19");
  assert.equal(browserLine("Mozilla/5.0 Chrome/128.0.0.0 Safari/537.36"), "Chrome 128");
});

test("account: who is signed in", () => {
  assert.deepEqual(accountLine({ email: "a@b.c" }), { title: "Signed in with Apple", email: "a@b.c" });
  assert.equal(accountLine({}, true).title, "Demo account");
});

test("speed: a dev switch, off for a person", () => {
  const s = mem();
  assert.equal(perfOn("", s), false);
  assert.equal(perfOn("?perf=1", s), true);
  assert.equal(perfOn("", s), true, "it stays on for this browser");
  assert.equal(perfOn("?perf=0", s), false);
  assert.equal(perfOn("", s), false);
});

test("a deep link names a section or nothing", () => {
  assert.equal(sectionOf("key"), "key");
  assert.equal(sectionOf("search"), "search");
  assert.equal(sectionOf("nope"), null);
});
