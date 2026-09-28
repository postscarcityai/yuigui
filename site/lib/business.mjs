import { readFileSync, readdirSync } from "node:fs";
import path from "node:path";

const dir = path.join(process.cwd(), "content", "business");

// The Google Doc copies are not shared publicly yet (anonymous visitors get a sign-in wall),
// so the site keeps them out of the page. Flip this once the docs are set to anyone with the link.
const DOCS_PUBLIC = false;
const DOC_RE = /\s*Google Doc: <?(https:\/\/docs\.google\.com\/[^\s>)]+)>?/;

// BIZ-3-revenue-models.md -> { slug: "biz-3-revenue-models", card: "BIZ-3", title, md }
export function businessDocs() {
  return readdirSync(dir)
    .filter((f) => f.endsWith(".md"))
    .sort((a, b) => a.localeCompare(b, "en", { numeric: true }))
    .map((f) => {
      const raw = readFileSync(path.join(dir, f), "utf8");
      const md = DOCS_PUBLIC ? raw : raw.replace(DOC_RE, "");
      const title = (md.match(/^# (.+)$/m)?.[1] ?? f).replace(/^Yui \| /, "");
      const doc = DOCS_PUBLIC ? raw.match(DOC_RE)?.[1] ?? null : null;
      return { slug: f.replace(/\.md$/, "").toLowerCase(), card: f.match(/^[A-Z]+-\d+/)?.[0] ?? md.match(/Card ([A-Z]+-\d+)/)?.[1] ?? "", title, doc, md };
    });
}

// One line per doc: the business page lists them, and each doc shares with its own (SITE-85).
export const BLURBS = {
  plan: "Start here. The whole plan on one page.",
  gtm: "How Yui finds its people. The current plan.",
  "use-to-earn": "Why early users should earn a stake, and what we record from day one.",
  "beta-list": "The first 20 to 50 outside testers, and where to find them.",
  "biz-1-marketing-positioning": "Who Yui is for and what we say.",
  "biz-1-competitors": "The research behind the positioning.",
  "biz-2-outreach-plan": "Where Hermes users are. Drafts only, nothing sent.",
  "biz-3-revenue-models": "What stays free, and what could pay the bills.",
  "biz-4-content-plan": "What we post and when. Detail behind the plan.",
  "biz-5-social-accounts": "Who each account is, and how it sounds.",
};
