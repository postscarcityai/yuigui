// YUI-325: the living canvas parses Yui Lines in the browser. site/public is served as is, so the four modules it needs
// (the parser, its two imports and the shapes scene) are copied next to the canvas. Run after changing lib/yl:
//   node site/scripts/sync-canvas-yl.mjs          copy
//   node site/scripts/sync-canvas-yl.mjs --check  exit 1 if a copy has drifted (test-yl.mjs runs this)
import fs from "fs";
const FILES = ["yl.mjs", "look.mjs", "tables.mjs", "shapes.mjs"];
const from = new URL("../lib/yl/", import.meta.url), to = new URL("../public/playground/canvas/yl/", import.meta.url);
const HEAD = "// Copy of site/lib/yl/ (YUI-325). Edit the original, then run node site/scripts/sync-canvas-yl.mjs.\n";
const check = process.argv.includes("--check");
fs.mkdirSync(to, { recursive: true });
let drift = 0;
for (const f of FILES) {
  const want = HEAD + fs.readFileSync(new URL(f, from), "utf8");
  const have = fs.existsSync(new URL(f, to)) ? fs.readFileSync(new URL(f, to), "utf8") : null;
  if (have === want) continue;
  drift++;
  if (check) console.error("drift: " + f);
  else fs.writeFileSync(new URL(f, to), want);
}
if (check && drift) process.exit(1);
console.log(check ? "canvas yl copies in sync" : "copied " + drift + " of " + FILES.length);
