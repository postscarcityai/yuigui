// /api/library?q= (FLOW-2 step 2): search the library by intent. The same ranking as the
// search box on /developers/library and the yui_library MCP tool (search() in library.mjs).
// Plain string matching over /library.json: no model, no database, no spend.
// ?q= words, &kind=preset|flow, &limit=1-20 (default 5). A flow hit carries its Mermaid.
import { libraryIndex, search } from "../../../lib/yl/library.mjs";

const HEADERS = {
  "content-type": "application/json; charset=utf-8",
  "access-control-allow-origin": "*",
  "cache-control": "public, max-age=300, s-maxage=86400",
};

export function GET(req) {
  const u = new URL(req.url);
  const q = (u.searchParams.get("q") || "").slice(0, 200);
  const kind = ["preset", "flow"].includes(u.searchParams.get("kind")) ? u.searchParams.get("kind") : undefined;
  const limit = Math.min(20, Math.max(1, parseInt(u.searchParams.get("limit") || "5", 10) || 5));
  const index = libraryIndex();
  if (!q.trim()) {
    return new Response(JSON.stringify({ error: "Add ?q= with a few words, like ?q=intake or ?q=ask yes or no", library: `${index.page}`, all: "https://www.yuigui.com/library.json" }), { status: 400, headers: HEADERS });
  }
  const items = search(index.items, q, { limit, kind });
  return new Response(JSON.stringify({ q, count: items.length, items, library: index.page, spec: index.spec }, null, 1), { headers: HEADERS });
}
