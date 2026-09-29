// The 404 (SITE-104): a new ASCII scene, colors and line from Yui on every visit. It still answers HTTP 404.
import Lost from "../lib/lost/Lost";
import { proposals } from "../lib/proposals.mjs";

export const metadata = { title: "Page not found | Yui", robots: { index: false, follow: false } };

// Pages a proposal promises ("a /you landing page"), so a 404 on one of them can point at the proposal.
function promisedPages() {
  const map = {};
  try {
    for (const p of proposals()) {
      for (const m of String(p.becomes || "").matchAll(/(?<![\w/])(\/[a-z][a-z0-9-]*)(?=[\s,.;:)]|$)/g)) map[m[1]] ??= { id: p.id, title: p.title, slug: p.slug };
    }
  } catch {}
  return map;
}

export default function NotFound() {
  return <Lost promised={promisedPages()} />;
}
