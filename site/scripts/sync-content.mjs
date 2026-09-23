// Copies ../ROADMAP.md into content/ so Vercel (which only uploads site/) can read it.
import { copyFileSync, existsSync } from "node:fs";
const src = new URL("../../ROADMAP.md", import.meta.url);
const dst = new URL("../content/ROADMAP.md", import.meta.url);
if (existsSync(src)) { copyFileSync(src, dst); console.log("synced ROADMAP.md"); }
else console.log("ROADMAP.md not found above site/, using committed copy");
