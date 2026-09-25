// Builds the Yui MCP App (INT-7): one self-contained HTML file with the site's
// web renderer, served by the yui-mcp edge function as ui://yui/screen.
//
//   npm run build     writes dist/yui-screen.html
//   npm run check     exit 1 when dist/ is stale against the sources
//
// The app repo copies dist/yui-screen.html into supabase/functions/yui-mcp
// with supabase/scripts/sync_mcp_app.py, the same way sync_yl.py copies the parser.
import { build } from "esbuild";
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const site = join(here, "../site");
const mods = join(site, "node_modules");
const out = join(here, "dist/yui-screen.html");

const js = await build({
  entryPoints: [join(here, "src/view.jsx")],
  bundle: true,
  write: false,
  minify: true,
  format: "iife",
  target: "es2020",
  jsx: "automatic",
  loader: { ".js": "jsx" },
  nodePaths: [mods],
  alias: { react: join(mods, "react"), "react-dom": join(mods, "react-dom") },
  define: { "process.env.NODE_ENV": '"production"' },
  logLevel: "error",
  legalComments: "none",
});

// KaTeX's fonts are separate files the sandbox's default CSP will not load, so
// its @font-face rules go; math falls back to the system serif.
const katex = readFileSync(join(mods, "katex/dist/katex.min.css"), "utf8").replace(/@font-face\{[^}]*\}/g, "");
const css = [
  readFileSync(join(site, "app/globals.css"), "utf8"),
  readFileSync(join(site, "app/playground/flows.css"), "utf8"),
  katex,
  readFileSync(join(here, "src/embed.css"), "utf8"),
].join("\n");
const cssMin = (await build({ stdin: { contents: css, loader: "css" }, write: false, minify: true, logLevel: "error" })).outputFiles[0].text;

// </script> inside the bundle would end the tag early.
const code = js.outputFiles[0].text.replace(/<\/script/gi, "<\\/script");
const html = `<!doctype html>
<html lang="en" data-theme="dark"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Yui</title>
<style>${cssMin}</style></head>
<body><div id="root"></div><script>${code}</script></body></html>
`;

if (process.argv.includes("--check")) {
  const have = existsSync(out) ? readFileSync(out, "utf8") : "";
  if (have !== html) {
    console.error(`stale: ${out}; run npm run build`);
    process.exit(1);
  }
  console.log("dist/yui-screen.html is current");
} else {
  mkdirSync(dirname(out), { recursive: true });
  writeFileSync(out, html);
  console.log(`wrote ${out} (${(html.length / 1024).toFixed(0)} KB)`);
}
