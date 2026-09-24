import { marked } from "marked";

// Markdown to HTML for the .md pages. Tables get a scroll box so a wide one
// scrolls inside itself on a phone instead of pushing the page sideways.
export function renderMd(md) {
  return marked.parse(md)
    .replaceAll("<table>", '<div class="md-table"><table>')
    .replaceAll("</table>", "</table></div>");
}
