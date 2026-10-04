// node --test lib/web/voicefill.test.mjs
// The mapper's cases are Yui's own (YuiTests/VoiceFillTests.swift): the same words fill the same fields on the phone and here.
import test from "node:test";
import assert from "node:assert/strict";
import { canFill, fill, tokens } from "./voicefill.mjs";
import { createPageVoice } from "./pagevoice.mjs";

const f = (key, label, type = "text", extra = {}) => ({ key, label, type, ...extra });
const intake = [f("business_name", "Business name", "text", { required: true }), f("what_you_do", "What you do", "long"), f("who_it_is_for", "Who it is for")];

test("each answer lands in its field", () => {
  const got = fill("Business name is Acme Bakery. What you do, we bake sourdough and pastries. Who it's for, people in the neighborhood.", intake);
  assert.equal(got.business_name, "Acme Bakery");
  assert.equal(got.what_you_do, "We bake sourdough and pastries.");
  assert.equal(got.who_it_is_for, "People in the neighborhood");
});

test("a field left out is left alone", () => {
  assert.deepEqual(fill("business name Acme Bakery", intake), { business_name: "Acme Bakery" });
});

test("words before the first name go to the first empty field", () => {
  const got = fill("Acme Bakery. What you do is bake bread.", intake);
  assert.equal(got.business_name, "Acme Bakery");
  assert.equal(got.what_you_do, "Bake bread.");
});

test("no field name fills the first empty text field", () => {
  assert.deepEqual(fill("we bake bread", intake, { business_name: "Acme" }), { what_you_do: "We bake bread" });
  assert.deepEqual(fill("we bake bread", intake, {}), { business_name: "We bake bread" });
  assert.deepEqual(fill("we bake bread", intake, { business_name: "  " }), { business_name: "We bake bread" });
});

test("choice, yes, range and email", () => {
  const fields = [f("kind", "What are we building", "choice", { options: ["New site", "Redesign", "Shop", "Landing page"] }),
    f("logo", "Logo", "yes"), f("budget", "Budget", "range", { min: 1, max: 5 }), f("email", "Email", "email")];
  const got = fill("I want a landing page. No logo. Budget is 12. Email is ann at acme dot com", fields);
  assert.equal(got.kind, "Landing page");
  assert.equal(got.logo, false);
  assert.equal(got.budget, 5);
  assert.equal(got.email, "ann@acme.com");
  assert.equal(fill("we have a logo", [f("logo", "Logo", "yes")]).logo, true);
});

test("the longest name wins, and a key reads when the label does not", () => {
  const fields = [f("name", "Name"), f("business_name", "Business name")];
  const got = fill("business name Acme and name Ann", fields);
  assert.equal(got.business_name, "Acme");
  assert.equal(got.name, "Ann");
  assert.equal(fill("who it is for kids", [f("audience", "Audience"), f("who_it_is_for", "")]).who_it_is_for, "Kids");
});

test("a choice is heard by its option, a number by its word, a phone by its digits", () => {
  const kind = f("kind", "Kind", "choice", { options: ["Page", "Landing page"] });
  assert.equal(fill("landing page please", [kind, f("note", "Note")]).kind, "Landing page");
  assert.equal(fill("guests are three", [f("guests", "Guests", "number")]).guests, 3);
  assert.equal(fill("price is 3.5", [f("price", "Price", "number")]).price, 3.5);
  assert.equal(fill("phone is 555 123 4567", [f("phone", "Phone", "phone")]).phone, "555 123 4567");
});

test("nothing heard fills nothing, and a photo, date or time is not for a voice", () => {
  assert.deepEqual(fill("   ", intake), {});
  assert.equal(canFill([f("p", "Photo", "photo")]), false);
  assert.equal(canFill([f("d", "Date", "date"), f("t", "Time", "time")]), false);
  assert.equal(canFill(intake), true);
  assert.deepEqual(fill("photo is nice", [f("photo", "Photo", "photo")]), {});
});

test("a contraction is two tokens", () => {
  assert.deepEqual(tokens("It's here, we're ok").map((t) => t.norm), ["it", "is", "here", "we", "are", "ok"]);
});

test("the page voice: words fill the page on show, the request outlives a page that unmounts", () => {
  const pv = createPageVoice();
  assert.equal(pv.hear("business name Acme"), false);
  pv.register({ id: "biz", fields: intake, current: {} });
  const seen = [];
  const off = pv.subscribe((x) => seen.push(x));
  pv.listening = true;
  assert.equal(pv.hear("business name Acme"), true);
  pv.clear("biz"); // the page unmounts while the mic listens: it is still registered
  assert.equal(pv.id, "biz");
  assert.equal(pv.fill.values.business_name, "Acme");
  assert.equal(seen.length, 1);
  const f1 = pv.fill;
  pv.consume(f1);
  assert.equal(pv.fill, null);
  pv.listening = false;
  pv.clear("biz");
  assert.equal(pv.id, null);
  assert.equal(pv.hear("business name Acme"), false);
  off();
});

test("the page voice: words that fill nothing go on to the agent; another page drops a stale fill", () => {
  const pv = createPageVoice();
  pv.register({ id: "biz", fields: [f("photo", "Photo", "photo")], current: {} });
  assert.equal(pv.hear("hello there"), false);
  pv.register({ id: "biz", fields: intake, current: {} });
  assert.equal(pv.hear("acme bakery"), true);
  pv.register({ id: "brand", fields: intake, current: {} });
  assert.equal(pv.fill, null);
  pv.register({ id: "talk", words: true, current: "" });
  assert.equal(pv.hear("  "), false);
  assert.equal(pv.hear("we bake"), true);
  assert.equal(pv.fill.words, "we bake");
});
