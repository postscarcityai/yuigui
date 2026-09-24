import { readFileSync, readdirSync } from "node:fs";
import path from "node:path";

const dir = path.join(process.cwd(), "content", "business");

// BIZ-3-revenue-models.md -> { slug: "biz-3-revenue-models", card: "BIZ-3", title, md }
export function businessDocs() {
  return readdirSync(dir)
    .filter((f) => f.endsWith(".md"))
    .sort((a, b) => a.localeCompare(b, "en", { numeric: true }))
    .map((f) => {
      const md = readFileSync(path.join(dir, f), "utf8");
      const title = (md.match(/^# (.+)$/m)?.[1] ?? f).replace(/^Yui \| /, "");
      const doc = md.match(/Google Doc: <?(https:\/\/docs\.google\.com\/[^\s>)]+)/)?.[1] ?? null;
      return { slug: f.replace(/\.md$/, "").toLowerCase(), card: f.match(/^[A-Z]+-\d+/)?.[0] ?? "", title, doc, md };
    });
}
