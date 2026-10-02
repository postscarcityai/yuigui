import { businessDocs } from "../lib/business.mjs";
import { thoughts } from "../lib/thoughts.mjs";
import { proposals } from "../lib/proposals.mjs";
import { specDocs } from "../lib/spec.mjs";
import { shareItems } from "../lib/share.mjs";

const base = "https://www.yuigui.com";
const pages = ["/", "/crew", "/mockups", "/mockups/chats", "/mockups/home", "/mockups/type", "/films", "/roadmap", "/proposals", "/board", "/progress", "/changelog", "/timeline", "/developers", "/developers/where-yui-stands", "/developers/draw", "/playground", "/developers/library", "/yl", "/channel", "/reactions", "/developers/specs", "/developers/community", "/contribute", "/earn", "/thoughts", "/business", "/start", "/help", "/privacy"];

export default function sitemap() {
  return [
    ...pages.map((p) => ({ url: `${base}${p === "/" ? "" : p}` })),
    ...thoughts().map((n) => ({ url: `${base}/thoughts/${n.slug}`, lastModified: n.date || undefined })),
    ...proposals().map((p) => ({ url: `${base}/proposals/${p.slug}`, lastModified: p.date || undefined })),
    ...specDocs().filter((d) => d.href.startsWith("/developers/")).map((d) => ({ url: `${base}${d.href}` })),
    ...businessDocs().map((d) => ({ url: `${base}/business/${d.slug}` })),
    // SITE-19 share links. scripts/capture-og.py reads this list too.
    ...shareItems().map((it) => ({ url: `${base}/s/${it.id}` })),
  ];
}
