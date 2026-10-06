// Freshness rules (SITE-157). node site/scripts/freshness-rules.test.mjs   exit 1 on any failure
import { backlogLabelled, progressCards, staleWhereHeading, onPhonesBuild } from "./freshness-rules.mjs";

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

const oct5 = new Date("2026-10-05T12:00:00Z");
eq("heading today is fresh", staleWhereHeading("## Where Yui is now (Oct 5)", oct5), null);
eq("heading 3 days old is fresh", staleWhereHeading("## Where Yui is now (Oct 2)", oct5), null);
eq("heading 5 days old is stale", staleWhereHeading("## Where Yui is now (Sep 30)", oct5), 5);
eq("the old Sep 27 heading is stale", staleWhereHeading("## Where Yui is now (Sep 27)", oct5), 8);
eq("other heading is ignored", staleWhereHeading("## What the pitch actually says", oct5), null);
eq("december heading in january", staleWhereHeading("## Where Yui is now (Dec 30)", new Date("2027-01-02T00:00:00Z")), null);
eq("on phones build", onPhonesBuild("- **On phones:** Yui 0.6.2, build 392, on TestFlight since Sep 30."), 392);
eq("also on phones is not the newest", onPhonesBuild("- **Also on phones:** Yui 0.6.1, build 380"), null);
eq("before that is not the newest", onPhonesBuild("- **Before that:** Yui 0.6.3, build 522"), null);

if (bad) { console.log(`${bad} failed`); process.exit(1); }
console.log("freshness-rules: all passed");
