import { businessDocs } from "../lib/business.mjs";
import { thoughts } from "../lib/thoughts.mjs";
import { specDocs } from "../lib/spec.mjs";
import { shareItems } from "../lib/share.mjs";

const base = "https://www.yuigui.com";
const pages = ["/", "/mockups", "/roadmap", "/board", "/progress", "/changelog", "/timeline", "/developers", "/playground", "/developers/library", "/yl", "/channel", "/reactions", "/developers/specs", "/developers/community", "/developers/contribute", "/earn", "/thoughts", "/business", "/start", "/help", "/privacy"];

export default function sitemap() {
  return [
    ...pages.map((p) => ({ url: `${base}${p === "/" ? "" : p}` })),
    ...thoughts().map((n) => ({ url: `${base}/thoughts/${n.slug}`, lastModified: n.date || undefined })),
    ...specDocs().filter((d) => d.href.startsWith("/developers/")).map((d) => ({ url: `${base}${d.href}` })),
    ...businessDocs().map((d) => ({ url: `${base}/business/${d.slug}` })),
    // SITE-19 share links. scripts/capture-og.py reads this list too.
    ...shareItems().map((it) => ({ url: `${base}/s/${it.id}` })),
  ];
}
