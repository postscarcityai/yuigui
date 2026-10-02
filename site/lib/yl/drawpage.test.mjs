// draw's page (spec/YL.md, draw). node site/lib/yl/drawpage.test.mjs   exit 1 on any failure
// The shape and policy cases mirror the app's StageRedesignTests (DrawPage.ratio, DrawPage.html).
import { DRAW_POLICY, drawPage, drawRatio, drawWords } from "./drawpage.mjs";

let bad = 0, n = 0;
const eq = (name, got, want) => {
  n++;
  if (JSON.stringify(got) !== JSON.stringify(want)) { bad++; console.log(`FAIL ${name}\n  got  ${JSON.stringify(got)}\n  want ${JSON.stringify(want)}`); }
};
const near = (a, b) => Math.abs(a - b) < 0.001;

eq("shape from the viewBox", near(drawRatio(undefined, '<svg viewBox="0 0 360 240"></svg>'), 1.5), true);
eq("ratio= wins over the viewBox", near(drawRatio("16:9", '<svg viewBox="0 0 10 10"></svg>'), 16 / 9), true);
eq("ratio=4/3", near(drawRatio("4/3", ""), 4 / 3), true);
eq("ratio=1.6 (a number once parsed)", near(drawRatio(1.6, ""), 1.6), true);
eq("no viewBox is 4:3", near(drawRatio(undefined, "<canvas></canvas>"), 4 / 3), true);
eq("a wrong number never makes a sliver (wide)", near(drawRatio("100:1", ""), 4), true);
eq("a wrong number never makes a sliver (tall)", near(drawRatio(undefined, "<svg viewBox='0 0 10 400'></svg>"), 0.7), true);
eq("a ratio that is not one falls back to the viewBox", near(drawRatio("wide", '<svg viewBox="0,0,300,100"></svg>'), 3), true);

const html = drawPage('<svg viewBox="0 0 4 3"><circle class="draw" cx="2" cy="1" r="1"/></svg>', { accent: "#e8663a" }, { dark: true });
eq("the page loads nothing from outside", html.includes("default-src 'none'"), true);
eq("the policy names no host", /http|connect-src/.test(DRAW_POLICY), false);
eq("the agent's accent is a variable", html.includes("--accent:#e8663a"), true);
eq("the markup is in the page", html.includes('<circle class="draw"'), true);
eq("a color cannot break out of its rule", drawPage("", { accent: "red;}</style><script>x()</script>" }).includes("x()"), false);
eq("Reduce Motion shows it finished", drawPage("", {}, { still: true }).includes("*{animation:none!important"), true);
eq("rough and wash are defined, the filter is on the page", [html.includes(".rough{filter:url(#yui-rough)}"), html.includes(".wash{fill-opacity:.18}"), html.includes('id="yui-rough"')], [true, true, true]);
eq("light pages say so", drawPage("", {}, { dark: false }).includes("color-scheme:light"), true);

eq("words: the caption", drawWords({ title: "Push tap", caption: "Tap the banner." }), "Tap the banner.");
eq("words: the title when there is no caption", drawWords({ title: "Push tap" }), "Push tap");
eq("words: nothing", drawWords({}), "");

console.log(`${n - bad} passed, ${bad} failed`);
process.exit(bad ? 1 : 0);
