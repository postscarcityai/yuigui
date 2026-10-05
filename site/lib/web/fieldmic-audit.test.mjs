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
test("the preset renderers are scanned, and the +other answer box has a mic (YUI-290)", () => {
  const keys = fields().map((x) => x.key);
  assert.ok(keys.includes("presets.js#Type your own"));
  assert.ok(WITH_MIC.includes("presets.js#Type your own"));
  const bad = audit([...fields(), { file: "presets.js", name: "New field", key: "presets.js#New field", after: "" }]);
  assert.match(bad.join("\n"), /presets\.js#New field: no FieldMic/);
});
