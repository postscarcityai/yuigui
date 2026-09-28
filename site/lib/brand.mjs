import { readFileSync, readdirSync, statSync } from "node:fs";
import path from "node:path";
import { thoughts } from "./thoughts.mjs";
import { slug } from "./slug.mjs";

// The brand kit (/brand.json): everything Yui needs to speak for Yui, built at build time from the
// same files the site renders. Yui's mailbox (yui-mail in the app repo) reads it to find a post, a
// release, a feature, a page or a logo, and to recommend what to write or build next.
// Public by design: nothing here is private, it is the site in one file.
const SITE = "https://www.yuigui.com";
const root = process.cwd();
const content = (f) => JSON.parse(readFileSync(path.join(root, "content", f), "utf8"));
const clip = (s, n) => (typeof s === "string" && s.length > n ? s.slice(0, n - 1).trimEnd() + "…" : s || "");

const VOICE = [
  "Plain words. Short sentences. The first line answers.",
  "No em dashes. No hype words (revolutionary, game-changing, seamless). No filler.",
  "Show, then tell: a screenshot or a link to the real thing beats a claim.",
  "Honest about stage: Yui is an alpha on TestFlight. Never promise dates, prices or features.",
  "Built in public: point to the roadmap, the board and the ship log for proof.",
  "Yui is she. The crew are Arnold, Basil, Gouda, Penny and Quill.",
];

const COLORS = { coral: "#FF7E8A", cream: "#FFF9F0", ink: "#3A3340", lavender: "#9B8CFF", mint: "#4FC8A8" };

function assets() {
  const dir = path.join(root, "public", "brand");
  return readdirSync(dir).filter((f) => /\.(png|webp|jpg|svg)$/.test(f)).sort().map((f) => {
    const name = f.replace(/\.\w+$/, "");
    const mark = name.includes("-mark-");
    const square = name.includes("square") || mark;
    const on = name.match(/-on-(\w+)$/);
    return {
      name, url: `${SITE}/brand/${f}`, bytes: statSync(path.join(dir, f)).size,
      kind: mark ? "mark (the Y alone)" : name.includes("wordmark") ? "wordmark, small" : "logo",
      shape: mark ? "square 512" : square ? "square 2048" : "wide",
      background: on ? on[1] : "transparent",
    };
  });
}

function pages() {
  const txt = readFileSync(path.join(root, "public", "llms.txt"), "utf8");
  const out = [];
  for (const m of txt.matchAll(/^- \[([^\]]+)\]\((https?:[^)]+)\):?\s*(.*)$/gm)) out.push({ title: m[1], url: m[2], about: clip(m[3], 300) });
  return out;
}

export function brandKit() {
  const links = content("links.json");
  const board = content("board.json");
  const builds = content("builds.json").builds ?? [];
  const progress = content("progress.json");
  const mvp = content("mvp.json");
  const backlog = content("backlog.json");
  const showcase = content("showcase.json");
  const col = (k) => (board.columns.find((c) => c.key === k)?.cards ?? []);
  return {
    about: {
      name: "Yui",
      one_line: "An open source iPhone app where your AI agents answer with native screens instead of paragraphs.",
      what: clip(readFileSync(path.join(root, "public", "llms.txt"), "utf8").split("\n").find((l) => l.startsWith("> "))?.slice(2), 800),
      stage: "Alpha, free, open to anyone on TestFlight (iPhone, iOS 26).",
      crew: { Yui: "helper and maker", Arnold: "trainer", Basil: "nutrition, meal photo to macros", Gouda: "music", Penny: "planner", Quill: "study buddy" },
      maker: "PostScarcity AI",
      links: { site: SITE, start: `${SITE}/start`, testflight: links.testflight, app_repo: links.appRepo, hub_repo: links.github, contribute: links.contribute, thoughts: `${SITE}/thoughts`, changelog: `${SITE}/changelog`, roadmap: `${SITE}/roadmap`, board: `${SITE}/board`, progress: `${SITE}/progress`, press_kit: `${SITE}/mockups` },
    },
    voice: VOICE,
    colors: COLORS,
    assets: assets(),
    pages: pages(),
    posts: thoughts().map((t) => ({ title: t.title, date: t.date, tag: t.tag, dek: clip(t.dek, 400), url: `${SITE}/thoughts/${t.slug}` })),
    releases: builds.slice(0, 40).map((b) => ({ build: b.build, date: b.date, state: b.state, changes: (b.changes ?? []).map((c) => c.text) })),
    release_in_progress: board.release ? { version: board.release.version, status: board.release.status, cards: (board.release.cards ?? []).map((c) => ({ key: c.key, title: c.title, status: c.status })) } : null,
    shipped: progress.slice(0, 150).map((p) => ({ date: p.date, title: p.title, card: p.card, short: clip(p.short, 300), url: `${SITE}/progress#${slug(p.title)}` })),
    building: col("building").map((c) => ({ key: c.key, title: c.title, summary: clip(c.summary, 200) })),
    up_next: col("next").map((c) => ({ key: c.key, title: c.title, summary: clip(c.summary, 200) })),
    backlog: col("backlog").map((c) => ({ key: c.key, title: c.title, summary: clip(c.summary, 200) })),
    agent_cards: (backlog.cards ?? []).map((c) => ({ key: c.key, title: c.title, goal: clip(c.goal, 300), status: c.status })),
    mvp: (mvp.cards ?? []).map((c) => ({ key: c.key, title: c.title, status: c.status })),
    features: (showcase.groups ?? []).map((g) => ({ title: g.title, lede: clip(g.lede, 300), items: (g.entries ?? []).slice(0, 12).map((e) => clip(e.title, 120)) })),
    updated: board.updated,
  };
}
