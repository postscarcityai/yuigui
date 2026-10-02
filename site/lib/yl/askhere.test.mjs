// YUI-277: the question lives on the page it asks about.
//   node site/lib/yl/askhere.test.mjs     exit 1 on any failure
import { askHere, compareOf, questionOf } from "./askhere.mjs";

let bad = 0, n = 0;
const eq = (name, got, want) => {
  n++;
  if (JSON.stringify(got) !== JSON.stringify(want)) { bad++; console.log(`FAIL ${name}\n  got  ${JSON.stringify(got)}\n  want ${JSON.stringify(want)}`); }
};
const page = (id, t, pic) => ({ id, preset: "page", props: { title: t }, ...(pic ? { pic: { id: `${id}s` } } : {}) });
const choose = (id, q, options) => ({ id, preset: "choose", props: { q, options } });
const ids = (steps) => steps.map((m) => m.id + (m.ask ? `+${m.ask.id}` : ""));

eq("a choose after a page joins that page", ids(askHere([page("p1", "Look", true), choose("c1", "Which?", ["A", "B"])])), ["p1+c1"]);
eq("a pick and an ask join too", ids(askHere([page("p1", "x"), { id: "k", preset: "pick", props: {} }, page("p2", "y"), { id: "a", preset: "ask", props: {} }])), ["p1+k", "p2+a"]);
eq("a question with no page before it stays alone", ids(askHere([choose("c1", "Q", []), page("p1", "x")])), ["c1", "p1"]);
eq("two questions in a row: the first joins, the second stands", ids(askHere([page("p1", "x"), choose("c1", "Q", []), choose("c2", "Q2", [])])), ["p1+c1", "c2"]);
eq("a slide or form does not join a page", ids(askHere([page("p1", "x"), { id: "s", preset: "slide", props: {} }])), ["p1", "s"]);
eq("keep: a workout move stays its own step", ids(askHere([page("p1", "x"), choose("e1-sets", "Set", [])], (m) => m.id === "e1-sets")), ["p1", "e1-sets"]);
eq("the input is not changed", (() => { const a = [page("p1", "x"), choose("c1", "Q", [])]; askHere(a); return a.length; })(), 2);
eq("questionOf: a page's ask", questionOf(askHere([page("p1", "x"), choose("c1", "Q", [])])[0]).id, "c1");
eq("questionOf: a bare page has none", questionOf(page("p1", "x")), null);

// Chris, Oct 2: three drawing looks, then "Which drawing look should Yui use?" on the next screen.
const looks = [page("a", "Look A: Hand drawn", true), page("b", "Look B: Clean lines", true), page("c", "Look C: Chalk", true),
  choose("q", "Which drawing look should Yui use?", ["A", "B", "C", "None, try again", "You decide"])];
const grouped = askHere(looks);
eq("the looks question joins the last look", ids(grouped), ["a", "b", "c+q"]);
eq("compare: A, B and C point at their pages", compareOf(grouped, 2).map((h) => `${h.option}=${h.page.id}`), ["A=a", "B=b", "C=c"]);
eq("compare: a lone question after the pages sees them too", compareOf([...looks.slice(0, 3), looks[3]], 3).map((h) => h.option), ["A", "B", "C"]);
eq("compare: words in the title match words in options", compareOf([page("x", "Hand drawn", true), page("y", "Chalk", true), choose("q", "Which?", ["Hand drawn", "Chalk", "Neither"])], 2).map((h) => h.page.id), ["x", "y"]);
eq("compare: one match is not a comparison", compareOf([page("x", "Look A", true), choose("q", "Which?", ["A", "B"])], 1), []);
eq("compare: pages with no picture never show", compareOf([page("x", "Look A"), page("y", "Look B"), choose("q", "Which?", ["A", "B"])], 2), []);
eq("compare: an option is not found inside a word", compareOf([page("x", "Data", true), page("y", "Beta", true), choose("q", "Which?", ["A", "B"])], 2), []);
eq("compare: a page after the question is not offered", compareOf([page("x", "Look A", true), choose("q", "Which?", ["A", "B"]), page("y", "Look B", true)], 1), []);

console.log(`${n - bad} passed, ${bad} failed`);
process.exit(bad ? 1 : 0);
