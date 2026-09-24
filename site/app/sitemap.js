import { businessDocs } from "../lib/business.mjs";
import { notes } from "../lib/notes.mjs";
import { specDocs } from "../lib/spec.mjs";
import { shareItems } from "../lib/share.mjs";

const base = "https://www.yuigui.com";
const pages = ["/", "/mockups", "/roadmap", "/board", "/progress", "/changelog", "/timeline", "/developers", "/playground", "/yl", "/channel", "/reactions", "/developers/specs", "/developers/community", "/notes", "/business", "/start", "/help", "/privacy"];

export default function sitemap() {
  return [
    ...pages.map((p) => ({ url: `${base}${p === "/" ? "" : p}` })),
    ...notes().map((n) => ({ url: `${base}/notes/${n.slug}`, lastModified: n.date || undefined })),
    ...specDocs().filter((d) => d.href.startsWith("/developers/")).map((d) => ({ url: `${base}${d.href}` })),
    ...businessDocs().map((d) => ({ url: `${base}/business/${d.slug}` })),
    // SITE-19 share links. scripts/capture-og.py reads this list too.
    ...shareItems().map((it) => ({ url: `${base}/s/${it.id}` })),
  ];
}
