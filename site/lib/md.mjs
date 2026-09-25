import { marked } from "marked";
import { slug } from "./slug.mjs";

// Markdown to HTML for the .md pages. Tables get a scroll box so a wide one
// scrolls inside itself on a phone instead of pushing the page sideways.
export function renderMd(md) {
  return marked.parse(md)
    // h2, h3 and h4 get ids, so other pages can link to a section (/roadmap#adapters, /yl#chart).
    .replace(/<h([234])>(.*?)<\/h\1>/g, (_, n, t) => `<h${n} id="${slug(t.replace(/<[^>]+>/g, "").split(" | ")[0])}">${t}</h${n}>`)
    .replaceAll("<table>", '<div class="md-table"><table>')
    .replaceAll("</table>", "</table></div>");
}
