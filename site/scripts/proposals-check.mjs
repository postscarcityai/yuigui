// SITE-106: the credits and trail fields are linted (an unknown field or a bad url stops the sync), every
// committed proposal passes, and the trail never overwrites a line or promotes a proposal nobody accepted.
import { readdirSync, readFileSync } from "node:fs";
import assert from "node:assert/strict";
import { lint, readProposal, sourceList } from "../lib/proposals.mjs";
import { trail } from "./proposal-trail.mjs";

const dir = new URL("../../docs/proposals/", import.meta.url);
const good = readFileSync(new URL("receipts.md", dir), "utf8");
const bad = (line) => lint(readProposal("x.md", good.replace(/^(by|sources): .*\n/gm, "").replace(/^call: .*$/m, (m) => `${m}\n${line}`))).join("|");

for (const f of readdirSync(dir).filter((f) => f.endsWith(".md"))) {
  const out = lint(readProposal(f, readFileSync(new URL(f, dir), "utf8")));
  assert.deepEqual(out, [], `${f}: ${out.join("; ")}`);
}
assert.match(bad("mood: happy"), /unknown field "mood"/);
assert.match(bad("by_url: nope"), /by_url.*not an https url/);
assert.equal(bad("by: Chris\nby_url: https://www.moltbook.com/u/x"), "");
assert.match(bad("sources: A | not-a-url"), /source "A" url/);
assert.match(bad("pr: https://example.com/x"), /pr .*GitHub/);
assert.match(bad("card: nope"), /board key/);
assert.match(bad("release: 0.6.0"), /release needs status Shipped/);
assert.deepEqual(sourceList("A | https://a.io/x ; B"), [{ name: "A", url: "https://a.io/x" }, { name: "B", url: "" }]);

const found = trail({
  cards: [{ key: "YUI-9", title: "YUI-9: build PROP-4 first plan", landed: false, running: true, assignee: "yui" }],
  prs: [{ title: "[PROP-4] first plan", url: "https://github.com/o/r/pull/3", branchUrl: "https://github.com/o/r/tree/b", author: "dev", merged: false, state: "OPEN" }],
});
assert.deepEqual(found.get("PROP-4"), { card: "YUI-9", landed: false, running: true, taken: "dev", pr: "https://github.com/o/r/pull/3", branchUrl: "https://github.com/o/r/tree/b" });
console.log("proposals-check: ok");
