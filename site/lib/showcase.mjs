// Card key -> its place on /mockups (SITE-14), so the board and the roadmap link to the screens.
// A card's first shipped entry wins; a card with only a planned mock links to that.
import showcase from "../content/showcase.json";

const where = new Map();
for (const g of showcase.groups) {
  for (const e of g.entries) for (const k of e.cards) if (!where.has(k)) where.set(k, `/mockups#${e.id}`);
}

export const seeIt = (key) => where.get(key) || null;

// Links every card id in rendered roadmap HTML: to its screen when it has one, else to its board tile.
// Skips text inside links, code and headings.
export function linkCards(html, onBoard) {
  let skip = 0;
  return html.split(/(<[^>]+>)/).map((part) => {
    const tag = part.match(/^<(\/?)(a|code|pre|h[1-6])\b/i);
    if (tag) { skip += tag[1] ? -1 : 1; return part; }
    if (part.startsWith("<") || skip > 0) return part;
    return part.replace(/\b((?:YUI|SITE|INT|OSS|BIZ|MVP|FLOW|SOC)-\d+)\b/g, (k) => {
      const href = seeIt(k) || (onBoard.has(k) ? `/board#${k}` : null);
      return href ? `<a href="${href}">${k}</a>` : k;
    });
  }).join("");
}
