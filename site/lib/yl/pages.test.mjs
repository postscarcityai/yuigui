// Pages (YL.md section 5): which page a reply brings forward, and which pages
// stand (their pickers are tools, not asks). The app's twins are
// ChatStore.pageUpdate and YLScreen.namedScreens (YUI-183).
//   node site/lib/yl/pages.test.mjs     exit 1 on any failure
import { pageForward, parse, quietToAgent, standingPages } from "./yl.mjs";
import { BASIL_KNOWN, BASIL_WEEK } from "./basil-week.mjs";

let bad = 0, n = 0;
const eq = (name, got, want) => {
  n++;
  if (JSON.stringify(got) !== JSON.stringify(want)) { bad++; console.log(`FAIL ${name}\n  got  ${JSON.stringify(got)}\n  want ${JSON.stringify(want)}`); }
};
const fwd = (text, known = {}, style = {}) => pageForward(parse(text, known), style);

eq("a line sent to a page brings it forward", fwd(`say "Focus time."
>2 timer 25m Focus`), 2);
eq("the last page a reply adds to wins", fwd(`>2 timer 25m Focus
>3 list "Milk"|"Eggs" +check`), 3);
eq("a reply with nothing on a page stays", fwd(`say "Hi."`), null);
eq("a patch never moves the person", fwd(`~focus +done`, { focus: "timer" }), null);
eq("clear alone never moves the person", fwd(`>2 clear`), null);
eq("a workout opens on the stage, not on its page", fwd(`>2 timer 40/20x8 Tabata`), null);

// YUI-183: Basil's week lands as a deck with words for the chat, and This week
// and Groceries are redrawn and saved. The person stays on the answer.
eq("words + a redraw of a named page keep you on the answer", pageForward(parse(BASIL_WEEK, BASIL_KNOWN)), null);
const redrawOnly = BASIL_WEEK.split("\n").filter((l) => /^(>|~|save )/.test(l) || /^\S+@(wk|week-plan|groc|aisle)/.test(l)).join("\n");
eq("the same redraw alone brings its page forward", pageForward(parse(redrawOnly, BASIL_KNOWN)), 4);
eq("a redraw that is not saved still brings its page forward", fwd(`say "New list."
>4 clear
>4 list "Milk" +check`), 4);
eq("a page added to beside a redraw still comes forward", fwd(`say "Done."
>3 clear
>3 card "This week"
save this week
>2 timer 25m Focus
>3`), 2);

eq("standing: the pages this reply saved", standingPages(parse(BASIL_WEEK, BASIL_KNOWN)), ["3", "4"]);
eq("standing: a save from the chat or the stage is not a page", standingPages(parse(`card "Hi"
save hello
>full
timer 5m
save five`)), []);

// A tick that reaches a native agent's runtime, quietly (YUI-185b, RELAY.md Events).
const tick = (id, checked = true) => ({ id, preset: "list", item: "Pay the water bill", checked });
eq("a tick on a named list on a native agent's page goes, quiet", quietToAgent(tick("today", true), { screen: "2", native: true }), true);
eq("untick goes too", quietToAgent(tick("today", false), { screen: "4", native: true }), true);
eq("a tick in the chat stays on the phone", quietToAgent(tick("today"), { screen: "1", native: true }), false);
eq("a tick on the stage stays", quietToAgent(tick("today"), { screen: "full", native: true }), false);
eq("an unnamed list stays", quietToAgent(tick("n2"), { screen: "2", native: true }), false);
eq("a connected (Hermes) agent's page stays", quietToAgent(tick("today"), { screen: "2", native: false }), false);
eq("anything but a tick is not this rule", quietToAgent({ id: "today", preset: "pick", picked: ["a"] }, { screen: "2", native: true }), false);

console.log(`${n - bad} passed, ${bad} failed`);
process.exit(bad ? 1 : 0);
