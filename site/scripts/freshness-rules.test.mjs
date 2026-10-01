// Freshness rules (SITE-157). node site/scripts/freshness-rules.test.mjs   exit 1 on any failure
import { backlogLabelled, progressCards } from "./freshness-rules.mjs";

let bad = 0;
const eq = (name, got, want) => {
  if (JSON.stringify(got) !== JSON.stringify(want)) { bad++; console.log(`FAIL ${name}\n  got  ${JSON.stringify(got)}\n  want ${JSON.stringify(want)}`); }
};

const cards = progressCards([{ card: "YUI-34" }, { card: ["YUI-191", "YUI-105"] }, { title: "no card" }]);
eq("progressCards", [...cards].sort(), ["YUI-105", "YUI-191", "YUI-34"]);
eq("card with entry, labelled backlog", backlogLabelled("- YUI-191 (backlog, Chris Sep 28): hold the icon", cards), ["YUI-191"]);
eq("step line", backlogLabelled("Step 2 is YUI-105 (backlog): the panel", cards), ["YUI-105"]);
eq("shipped label is fine", backlogLabelled("- YUI-191 (shipped Sep 29, build 370): hold the icon", cards), []);
eq("card without an entry may be backlog", backlogLabelled("- YUI-999 (backlog): later", cards), []);
eq("split card is skipped", backlogLabelled("- YUI-34 (step 1 shipped; step 2 backlog): vault", cards), []);
eq("backlog word elsewhere is not a label", backlogLabelled("YUI-34 shipped. The agent-ready backlog is exported.", cards), []);

if (bad) { console.log(`${bad} failed`); process.exit(1); }
console.log("freshness-rules: all passed");
