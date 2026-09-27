// Site search for the chat (SITE-64). One in-memory index over what yuigui.com says: every page,
// thought, spec, business doc, ship log entry, See it entry and playground demo, cut into sections
// so a hit can link straight to its heading. Built once per server instance from content/.
import { readFileSync } from "node:fs";
import path from "node:path";
import { thoughts } from "../thoughts.mjs";
import { specDocs } from "../spec.mjs";
import { businessDocs } from "../business.mjs";
import { slug } from "../slug.mjs";
import { SCREENS, DEMOS, MEDIA, SCIENCE, FLOWS, DATA } from "../yl/samples.mjs";

const content = (f) => path.join(process.cwd(), "content", f);
const json = (f) => JSON.parse(readFileSync(content(f), "utf8"));

// The pages that are code, not markdown. What each is for, in the words a visitor would search with.
export const PAGES = [
  ["/", "What it does", "The home page. Meet Yui, a generative user interface: your AI agent draws native iPhone screens (timers, forms, choices, cards) instead of walls of text. The homepage film."],
  ["/mockups", "See it", "Real Yui screens, each drawn from a few lines of Yui Lines: timers, forms, charts, decks, maps, music tools, games. Releases with screenshots and clips."],
  ["/start", "Get Yui", "Get started: install the alpha from TestFlight on an iPhone with iOS 26, sign in with Apple, connect a Hermes agent in three steps or another agent (OpenClaw, Claude Code, Cursor, MCP, webhook, A2A, AG-UI, a local model). Ask for a hand if you have no agent yet."],
  ["/roadmap", "Roadmap", "Where Yui is now, what shipped, what is next and later. The MVP, epics, Native Yui, Hermes for everyone."],
  ["/board", "Board", "Live work, exported from the project board: now, next, done."],
  ["/progress", "Shipped", "The dated ship log with screenshots, one entry per thing that shipped."],
  ["/changelog", "Builds", "Every TestFlight build and release, and the release timeline."],
  ["/timeline", "Timeline", "Watch Yui grow day by day: the GitHub history, builds and screenshots."],
  ["/thoughts", "Thoughts", "Yui's blog. Release posts, Why posts and Call posts. RSS feed."],
  ["/developers", "Developers", "How Yui works for developers: Yui Lines, parsers, adapters, the relay, MCP, embeds."],
  ["/developers/where-yui-stands", "Where Yui stands", "A SWOT with sources: what is new about Yui and what is not, prior art, the token benchmark and its limits."],
  ["/playground", "Playground", "Try Yui Lines in the browser: pick a sample, tap through it, see the lines sent back to the agent. No install."],
  ["/developers/library", "Library", "Every screen preset and saved flow, drawn live and searchable. library.json for agents."],
  ["/yl", "Yui Lines spec", "The screen language: one short line per element, every preset and its options."],
  ["/channel", "Channel guide", "What every agent on the Yui channel is told, and the eval that scores models on it."],
  ["/reactions", "Reactions", "Hold a message to react: build it, no, ask me, love it, later, priority. What each tells your agent."],
  ["/developers/specs", "All specs", "Every spec: agents, relay, adapters, MCP, browser, macOS, Telegram, native Yui, vault, tables, flows."],
  ["/developers/community", "Community", "The community gallery of screens people made."],
  ["/contribute", "Contribute", "Yui@home: lend your AI agent's idle tokens. It picks a card off the backlog, does the work and opens a pull request. The spec template for feature requests."],
  ["/earn", "Build to earn", "A draft: merged work and feedback that ships earns points on a public ledger. No token exists and nothing is for sale."],
  ["/business", "Business", "Who Yui is for, positioning, competitors, outreach, revenue models, the plan."],
  ["/help", "Help", "Help with the app: signing in, pairing an agent, TestFlight, common problems, contact."],
  ["/privacy", "Privacy", "What Yui stores, where, for how long, and how to delete it. Every table by name."],
];

// A markdown doc as sections: the part before the first ## is the doc's own, each ## is one more.
const plain = (s) => s.replace(/`([^`]*)`/g, "$1").replace(/\*\*?([^*]+)\*\*?/g, "$1").replace(/\[([^\]]+)\]\([^)]*\)/g, "$1");
function sections(href, full, md, kind) {
  const out = [];
  const title = full.split(" | ")[0].replace(/^Yui /, "");
  const parts = md.split(/^## /m);
  const head = parts.shift().replace(/^# .+$/m, "").trim();
  if (head) out.push({ path: href, title, kind, text: plain(head) });
  for (const p of parts) {
    const nl = p.indexOf("\n");
    const h = plain((nl < 0 ? p : p.slice(0, nl)).trim());
    const body = plain(nl < 0 ? "" : p.slice(nl + 1)).trim();
    out.push({ path: `${href}#${slug(h.split(" | ")[0])}`, title: `${title}: ${h}`, kind, text: body });
  }
  return out;
}

// A page that is JSX (Help, Start, Privacy, Home): its h2/h3 sections as text. Crude on purpose,
// the tags go and the words stay. The files ride along with the route (next.config.mjs).
const ENT = { "&apos;": "'", "&quot;": '"', "&amp;": "&", "&lt;": "<", "&gt;": ">", "&nbsp;": " " };
const untag = (s) => s.replace(/\{\s*"([^"]*)"\s*\}/g, "$1").replace(/\{[^{}]*\}/g, " ").replace(/<[^>]+>/g, " ").replace(/&[a-z]+;/g, (e) => ENT[e] || " ").replace(/\s+/g, " ").trim();
function jsxSections(file, href, title) {
  const src = readFileSync(path.join(process.cwd(), "app", file), "utf8");
  const body = src.slice(src.indexOf("return ("));
  const out = [];
  for (const part of body.split(/<h[23][^>]*>/).slice(1)) {
    const end = part.search(/<\/h[23]>/);
    const h = untag(part.slice(0, end));
    const text = untag(part.slice(end)).slice(0, 2500);
    if (h && text) out.push({ path: href, title: `${title}: ${h}`, kind: "page", text });
  }
  return out;
}

let INDEX = null;
function build() {
  const docs = [];
  const safe = (what, fn) => { try { fn(); } catch (e) { console.error(`chat index: ${what} skipped`, e.message); } };
  for (const [p, t, d] of PAGES) docs.push({ path: p, title: t, kind: "page", text: d });
  for (const [f, p, t] of [["help/page.js", "/help", "Help"], ["start/page.js", "/start", "Get Yui"], ["privacy/page.js", "/privacy", "Privacy"], ["page.js", "/", "Home"], ["earn/page.js", "/earn", "Build to earn"], ["contribute/page.js", "/contribute", "Contribute"]]) {
    safe(p, () => docs.push(...jsxSections(f, p, t)));
  }
  safe("roadmap", () => docs.push(...sections("/roadmap", "Roadmap", readFileSync(content("ROADMAP.md"), "utf8"), "roadmap")));
  safe("thoughts", () => {
    for (const t of thoughts()) {
      const md = t.parts.filter((x) => x.kind === "md").map((x) => x.md).join("\n\n");
      docs.push({ path: `/thoughts/${t.slug}`, title: `Thought: ${t.title}`, kind: "thought", date: t.date, text: plain(`${t.dek}\n\n${md}`) });
    }
  });
  safe("specs", () => { for (const d of specDocs()) docs.push(...sections(d.href, d.title, d.md, "spec")); });
  safe("business", () => { for (const d of businessDocs()) docs.push(...sections(`/business/${d.slug}`, d.title, d.md, "business")); });
  safe("progress", () => {
    for (const e of json("progress.json")) docs.push({ path: `/progress#${slug(e.title)}`, title: `Shipped ${e.date}: ${e.title}`, kind: "shipped", date: e.date, text: `${e.short || ""} ${e.body || ""}` });
  });
  safe("see it", () => {
    for (const g of json("showcase.json").groups) {
      for (const e of g.entries) docs.push({ path: `/s/${e.id}`, title: `See it: ${e.title}${g.planned ? " (planned)" : ""}`, kind: "screen", text: e.what || "" });
    }
  });
  safe("samples", () => {
    for (const s of [...SCREENS, ...DEMOS, ...MEDIA, ...SCIENCE, ...FLOWS, ...DATA]) {
      if (!s.slug) continue;
      docs.push({ path: `/playground?demo=${s.slug}`, title: `Playground demo: ${s.name.replace(/^Demo:\s*/, "")}`, kind: "demo", text: s.what || s.desc || "" });
    }
  });
  // Term stats for scoring.
  const df = new Map();
  for (const d of docs) {
    d.words = words(`${d.title} ${d.text}`);
    d.titleWords = new Set(words(d.title));
    for (const w of new Set(d.words)) df.set(w, (df.get(w) || 0) + 1);
  }
  return { docs, df, n: docs.length };
}
const index = () => (INDEX ||= build());

const STOP = new Set("a an and are as at be but by can do does for from how i in is it its me my of on or so that the this to was what when where which who why will with you your yui".split(" "));
function words(s) {
  return (s.toLowerCase().match(/[a-z0-9][a-z0-9-]*/g) || []).filter((w) => w.length > 1 && !STOP.has(w));
}

function snippet(text, terms, n = 280) {
  const lower = text.toLowerCase();
  const hits = terms.map((t) => lower.indexOf(t)).filter((i) => i >= 0);
  const at = hits.length ? Math.min(...hits) : 0;
  const start = Math.max(0, at - 60);
  const s = text.slice(start, start + n).replace(/\s+/g, " ").trim();
  return `${start > 0 ? "..." : ""}${s}${start + n < text.length ? "..." : ""}`;
}

// Best matches first: [{ path, title, kind, snippet }]. Plain word match, weighted by rarity, titles count triple.
export function searchSite(query, k = 6) {
  const { docs, df, n } = index();
  const terms = [...new Set(words(String(query || "")))].slice(0, 12);
  if (!terms.length) return [];
  const scored = [];
  for (const d of docs) {
    let score = 0;
    for (const t of terms) {
      const tf = d.words.reduce((c, w) => c + (w === t || (t.length > 3 && w.startsWith(t)) ? 1 : 0), 0);
      if (!tf) continue;
      const idf = Math.log(1 + n / (df.get(t) || 1));
      score += idf * (Math.min(tf, 6) / (1 + d.words.length / 400) + (d.titleWords.has(t) ? 3 : 0));
    }
    if (score > 0) scored.push([d.kind === "page" ? score * 1.6 + 1 : score, d]);
  }
  scored.sort((a, b) => b[0] - a[0]);
  return scored.slice(0, k).map(([, d]) => ({ path: d.path, title: d.title, kind: d.kind, snippet: snippet(d.text, terms) }));
}

// The text of one page (every section on it), clipped, or null for a path the site does not have.
export function readPage(p, max = 6000) {
  const want = String(p || "").split("#")[0];
  const hits = index().docs.filter((d) => d.path === p || d.path.split("#")[0] === want);
  if (!hits.length) return null;
  const text = hits.map((d) => `## ${d.title}\n${d.text}`).join("\n\n");
  return { path: want, title: hits[0].title, text: text.length > max ? `${text.slice(0, max)}\n\n[cut here, search for a narrower part]` : text };
}

// Only real pages on this site. A path the chat may send the visitor to.
const DYNAMIC = /^\/(thoughts|developers|business|s)\/[a-z0-9-]+$/;
export function sitePath(p) {
  const s = String(p || "").trim();
  if (!/^\/(?!\/)[\w\-/.?=&#%]*$/.test(s)) return null;
  const bare = s.split(/[?#]/)[0] || "/";
  if (PAGES.some(([x]) => x === bare) || DYNAMIC.test(bare) || index().docs.some((d) => d.path.split(/[?#]/)[0] === bare)) return s;
  return null;
}

// Every page, one line each, for the agent's map of the site.
export function siteMap() {
  return PAGES.map(([p, t]) => `${p} ${t}`).join("\n");
}
