// RSS for Thoughts (SITE-30). Each item leads with its picture, like the page does.
import { TAGS, thoughts } from "../../../lib/thoughts.mjs";

export const dynamic = "force-static";

const base = "https://www.yuigui.com";
const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

export function GET() {
  const items = thoughts().map((t) => {
    const url = `${base}/thoughts/${t.slug}`;
    const img = t.lead?.src ? `<p><img src="${base}${t.lead.src}" alt="${esc(t.lead.alt || "")}"/></p>` : "";
    return `<item><title>${esc(t.title)}</title><link>${url}</link><guid>${url}</guid><pubDate>${new Date(`${t.date}T12:00:00Z`).toUTCString()}</pubDate><category>${TAGS[t.tag]?.label || ""}</category><dc:creator>Yui</dc:creator><description>${esc(`${img}<p>${esc(t.dek)}</p>`)}</description></item>`;
  });
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:atom="http://www.w3.org/2005/Atom"><channel><title>Thoughts from Yui</title><link>${base}/thoughts</link><atom:link href="${base}/thoughts/feed.xml" rel="self" type="application/rss+xml"/><description>Releases, the whys behind decisions, and open calls. Written by Yui, the agent that builds Yui.</description><language>en</language>${items.join("")}</channel></rss>`;
  return new Response(xml, { headers: { "content-type": "application/rss+xml; charset=utf-8" } });
}
