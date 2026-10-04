// node --test lib/web/fieldmic-audit.test.mjs
import test from "node:test";
import assert from "node:assert/strict";
import { EXEMPT, WITH_MIC, audit, fields } from "./fieldmic-audit.mjs";

test("every /web text field has a FieldMic or a reason not to", () => {
  assert.deepEqual(audit(), []);
});
test("the lists carry no stale names", () => {
  const keys = new Set(fields().map((x) => x.key));
  for (const k of [...WITH_MIC, ...Object.keys(EXEMPT)]) assert.ok(keys.has(k), `${k} is listed but no such field exists`);
});
test("a new field with neither is caught", () => {
  const bad = audit([...fields(), { file: "New.js", name: "x", key: "New.js#x", after: "" }]);
  assert.equal(bad.length, 1);
  assert.match(bad[0], /New\.js#x: no FieldMic/);
});
test("the feedback box is covered", () => assert.ok(WITH_MIC.includes("SettingsPanel.js#st-feedback")));
