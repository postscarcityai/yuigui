import { readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import { renderMd } from "./md.mjs";

const dir = path.join(process.cwd(), "content", "spec");

// Every spec/*.md, in reading order (SITE-15). `npm run sync` copies them into content/spec.
// Three already had their own page before SITE-15 and keep it; the rest live at /developers/<slug>.
const ORDER = [
  ["yl", "Yui Lines", "/yl", "The screen language: one short line per element, every preset and its options."],
  ["channel", "Channel guide", "/channel", "What every agent on the Yui channel is told, and the eval that scores it."],
  ["reactions", "Reactions", "/reactions", "Hold a message and react. What each of the six tells your agent to do."],
  ["benchmark", "Benchmark", null, "Yui Lines against JSON, token by token, on ten real screens."],
  ["agents", "Agents", null, "How an agent gets into Yui: pairing codes, the host API, names and colors."],
  ["relay", "Relay", null, "How messages travel between your machine and the app, and how push works."],
  ["adapters", "Adapters", null, "Every agent framework Yui plans to reach, Hermes first, and in what order."],
  ["hosting", "Hosting", null, "Where Yui's hosted connector runs (Cloudflare, beside the Supabase relay), what it costs, and why."],
  ["openclaw", "OpenClaw", null, "Your OpenClaw agent in Yui: install the channel plugin, pair, and what the agent is told."],
  ["webhook", "Webhook bridge", null, "Any agent that answers an HTTP POST, in Yui: what each turn sends and what to answer."],
  ["a2a", "A2A bridge", null, "Add any A2A agent (ADK, LangGraph, CrewAI) by its Agent Card: how turns, tasks and restarts map."],
  ["mcp", "MCP server", null, "Any MCP client (Claude Code, Cursor, n8n) puts a screen on your phone and reads the taps back."],
  ["games", "Games (draft)", null, "Draft: how an agent could describe a whole new game in lines, a board kit with rule words, not code."],
  ["flywheel", "Preset flywheel", null, "How custom screens agents keep sending become presets: the shape log, the weekly report and the checklist."],
];

// [{ slug, label, href, blurb, title, md }]. A spec file missing from ORDER still shows, last.
export function specDocs() {
  const files = readdirSync(dir).filter((f) => f.endsWith(".md"));
  const known = ORDER.map(([s]) => s);
  const extra = files.map((f) => f.replace(/\.md$/, "").toLowerCase()).filter((s) => !known.includes(s)).sort();
  return [...ORDER, ...extra.map((s) => [s, s[0].toUpperCase() + s.slice(1), null, ""])]
    .filter(([s]) => files.includes(`${s.toUpperCase()}.md`))
    .map(([slug, label, href, blurb]) => {
      const md = readFileSync(path.join(dir, `${slug.toUpperCase()}.md`), "utf8");
      const title = md.match(/^# (.+)$/m)?.[1] ?? label;
      return { slug, label, href: href ?? `/developers/${slug}`, blurb, title, md };
    });
}

// Rendered html plus its h2/h3 outline, read back from the ids renderMd gives them.
export function renderDoc(md) {
  const html = renderMd(md);
  const toc = [...html.matchAll(/<h([23]) id="([^"]+)">(.*?)<\/h\1>/g)]
    .map(([, n, id, t]) => ({ level: Number(n), id, text: t.replace(/<[^>]+>/g, "").replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">") }));
  return { html, toc };
}
