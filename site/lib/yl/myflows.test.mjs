// node --test site/lib/yl/myflows.test.mjs (SITE-149): the remove rules of the My flows list, as the app has them.
import assert from "node:assert/strict";
import test from "node:test";
import { APP_STARTERS, confirmText, listRows, removal, rowSub } from "./myflows.mjs";

const starters = APP_STARTERS.map((name) => ({ name, title: name }));
const variants = [
  { name: "restaurant-intake", title: "Restaurant intake", base: "website-intake" },
  { name: "brunch-intake", title: "Brunch intake", base: "restaurant-intake" },
];
const rows = (removed = []) => listRows({ starters, variants, removed, steps: () => 9 });

test("variants sit under their base, deeper for variants of variants", () => {
  const r = rows();
  assert.deepEqual(r.slice(0, 4).map((x) => [x.name, x.depth]), [["website-intake", 0], ["restaurant-intake", 1], ["brunch-intake", 2], ["self-scope", 0]]);
  assert.equal(r.length, APP_STARTERS.length + 2);
  assert.equal(rowSub(r[1]), "9 steps · from website-intake");
  assert.equal(rowSub(r[0]), "9 steps · Starter");
});

test("a starter cannot be removed", () => {
  assert.deepEqual(removal(rows(), "website-intake"), []);
  assert.deepEqual(removal(rows(), "self-scope"), []);
});

test("a variant goes alone", () => {
  assert.deepEqual(removal(rows(), "brunch-intake"), ["brunch-intake"]);
  const r = rows(["brunch-intake"]);
  assert.equal(r.length, APP_STARTERS.length + 1);
  assert.ok(r.find((x) => x.name === "restaurant-intake"));
});

test("a base takes its variants along, and its confirm says so", () => {
  const r = rows();
  assert.deepEqual(removal(r, "restaurant-intake"), ["restaurant-intake", "brunch-intake"]);
  assert.match(confirmText(r[1]).message, /^Its variant goes with it/);
  assert.equal(confirmText(r[2]).message, "Your agent can send it again any time.");
  assert.equal(confirmText(r[2]).title, "Remove “Brunch intake”?");
  const gone = rows(["restaurant-intake", "brunch-intake"]);
  assert.equal(gone.length, APP_STARTERS.length);
});

test("a variant whose base is gone is still listed, so it can be removed", () => {
  const r = listRows({ starters, variants: [{ name: "orphan", title: "Orphan", base: "nothing" }], steps: () => 0 });
  assert.equal(r.at(-1).name, "orphan");
  assert.equal(rowSub(r.at(-1)), "Its base flow is gone · from nothing");
  assert.deepEqual(removal(r, "orphan"), ["orphan"]);
});
