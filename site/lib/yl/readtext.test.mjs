// Body text reader (SITE-97). node site/lib/yl/readtext.test.mjs   exit 1 on any failure
import { readFileSync } from "node:fs";
import { plainText, readInline, readText, textRole } from "./readtext.mjs";

let bad = 0, n = 0;
const eq = (name, got, want) => {
  n++;
  if (JSON.stringify(got) !== JSON.stringify(want)) { bad++; console.log(`FAIL ${name}\n  got  ${JSON.stringify(got)}\n  want ${JSON.stringify(want)}`); }
};

const fx = readText(readFileSync(new URL("./readtext-fixture.md", import.meta.url), "utf8"));
eq("fixture kinds", fx.map((b) => b.t), ["h", "p", "kv", "kv", "kv", "kv", "ul", "ol"]);
eq("heading", [fx[0].level, fx[0].inline[0].text], [2, "What changed"]);
eq("bold lead-in reads as a label", [fx[2].mark, fx[2].label, fx[2].value[0].text.slice(0, 8)], ["", "Fixed", "the time"]);
eq("check lead-in", [fx[3].mark, fx[3].label], ["✅", "Tests"]);
eq("cross lead-in", [fx[4].mark, fx[4].label], ["❌", "Lint"]);
eq("plain lead-in", [fx[5].mark, fx[5].label], ["", "Next step"]);
eq("list inline", fx[6].items[0].map((x) => x.t), ["b", "text", "i", "text", "code", "text"]);
eq("ordered list", fx[7].items.length, 2);
eq("no raw markers", JSON.stringify(fx).match(/\*\*|"#/) , null);

eq("a time is not a label", readText("Meet at 9:30 tomorrow.")[0].t, "p");
eq("a sentence with a colon is not a label", readText("Here is the thing you asked about the plan: it works.")[0].t, "p");
eq("link", readInline("see [Yui](/spec)"), [{ t: "text", text: "see " }, { t: "a", text: "Yui", href: "/spec" }]);
eq("snake_case stays", readInline("use my_var_name here"), [{ t: "text", text: "use my_var_name here" }]);
eq("two lines, one paragraph", readText("One thought.\nStill the same.").length, 1);
eq("blank line splits", readText("A.\n\nB.").length, 2);

eq("short line is display", textRole("Your week is ready."), "display");
eq("long line is body", textRole("Your week is ready, and I moved the long run to Saturday because of the rain on Friday."), "body");
eq("a list is body", textRole("- a\n- b"), "body");
eq("plain text drops markers", plainText("**Fixed:** the `timer`"), "Fixed: the timer");

console.log(`${n - bad}/${n} pass`);
process.exit(bad ? 1 : 0);
