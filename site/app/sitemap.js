import { businessDocs } from "../lib/business.mjs";
import { notes } from "../lib/notes.mjs";

const base = "https://www.yuigui.com";
const pages = ["/", "/mockups", "/roadmap", "/board", "/progress", "/changelog", "/developers", "/playground", "/yl", "/channel", "/notes", "/business", "/start", "/help", "/privacy"];

export default function sitemap() {
  return [
    ...pages.map((p) => ({ url: `${base}${p === "/" ? "" : p}` })),
    ...notes().map((n) => ({ url: `${base}/notes/${n.slug}`, lastModified: n.date || undefined })),
    ...businessDocs().map((d) => ({ url: `${base}/business/${d.slug}` })),
  ];
}
