// What Yui says on the 404 (SITE-104). First person, sparing with "I" (PROP-6), plain words, no em dashes.
// A combinatorial line (opener x middle x offer, well over a thousand) most of the time, a hand-written one the rest.
// It uses the path they asked for, and links the proposal when that path is a page a proposal promises.
import { pick } from "./rng.mjs";

const OPENERS = [
  "Hm.", "Oh no.", "Well.", "I looked everywhere.", "I checked twice.", "I flipped every card.", "Not here.", "A wrong turn.",
  "Oops.", "So close.", "Huh.", "I drew a blank.", "I tried.", "Sorry about that.", "Plot twist.", "Odd.", "I checked the drawer.", "Nothing yet.",
];
const MIDDLES = [
  "{p} isn't here.", "There's nothing at {p}.", "{p} slipped off the map.", "I can't find {p}.", "{p} doesn't lead anywhere.",
  "Nobody lives at {p}.", "{p} is a blank page.", "{p} went for a walk.", "The screen for {p} never got drawn.",
  "{p} is not one of my screens.", "The trail to {p} goes cold.", "{p} was never on the list.",
];
const OFFERS = [
  "Want to start from the top?", "Home is a good reset.", "Tell me what you were after.", "The playground is more fun anyway.",
  "Draw another and see what I make.", "Ask, and I'll point the way.", "I'll keep sketching while you decide.", "A link may have gone stale.",
  "Pick a door.", "Check the address, or ask me.", "Here is a sketch to make up for it.", "Every wrong turn gets a drawing.",
];
const HAND = [
  "You found the edge of the site. The view is nice.",
  "This page is between drafts.",
  "I only draw what exists, so here is a sketch of nothing.",
  "Lost is a fine place to be for a minute. Stay as long as you like.",
  "Somewhere a link is pointing at {p} and feeling bad about it.",
  "No page here, but the drawing is fresh. It won't come again.",
  "The address is off by a letter, or a page moved. Either way, welcome.",
  "{p} is a page I haven't drawn. Yet is a big word.",
  "This screen is empty on purpose. Reload for a new one.",
  "You can't get lost on a site this small. And yet.",
  "Ask me for what you wanted. I'm quicker than the sitemap.",
  "Every reload draws a different scene. This is the only one like it.",
  "I keep this page for the wrong turns. Yours is a good one.",
  "Nothing at {p}, but plenty next door.",
  "The page you want may be a proposal. Those live in one place.",
  "Not a page. A sketchbook. Poke the drawing.",
];
const PROBES = /(^|\/)(wp-|\.env|\.git|admin|phpmyadmin|xmlrpc|cgi-bin|vendor\/|config\.)|\.(php|asp|aspx|jsp|cgi|sql|bak)$/i;
const PROBE_LINES = [
  "Nice try. There's no {p} here, only a drawing.",
  "That door belongs to another kind of site. This one is just a sketchbook.",
  "{p} is not a thing here. Try the playground, it's friendlier.",
];

export function shortPath(raw) {
  let p = String(raw || "/").split(/[?#]/)[0];
  try { p = decodeURI(p); } catch {}
  p = p.replace(/[^\w\-./~ ]/g, "").replace(/\/+$/, "") || "/";
  return p.length > 34 ? `${p.slice(0, 33)}...` : p;
}

// -> { text, link?: { href, label } }
export function makeLine(rng, rawPath, promised = {}) {
  const p = shortPath(rawPath);
  const fill = (s) => s.replaceAll("{p}", p);
  const hit = promised[p.toLowerCase()];
  if (hit) {
    return {
      text: rng() < 0.5 ? `${p} isn't a page yet. It's a proposal.` : `${p} is a page I promised, and haven't drawn. It's a proposal.`,
      link: { href: `/proposals/${hit.slug}`, label: `Read ${hit.id}: ${hit.title}` },
    };
  }
  if (PROBES.test(p)) return { text: fill(pick(rng, PROBE_LINES)) };
  if (rng() < 0.3) return { text: fill(pick(rng, HAND)) };
  return { text: fill(`${pick(rng, OPENERS)} ${pick(rng, MIDDLES)} ${pick(rng, OFFERS)}`) };
}
export const LINE_SPACE = OPENERS.length * MIDDLES.length * OFFERS.length + HAND.length;
