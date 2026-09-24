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
