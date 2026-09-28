// Preview image for any Yui Lines (SITE-19): /og?yl=<share code>[&title=...]. Playground share
// links and embeds point their og:image here. The screen is drawn from the parsed lines.
// /og?page=<key>&title=... is a site page's own preview (SITE-85): its row in lib/og/pages.mjs.
import { ImageResponse } from "next/og";
import { OG_SIZE, OgCard, eyebrowOf, ogFonts, screenDataUrl } from "../../lib/og/card";
import { readYL } from "../../lib/share-code.mjs";
import { cleanYL, findSample, shareItem } from "../../lib/share.mjs";
import { PAGES } from "../../lib/og/pages.mjs";

export async function GET(req) {
  const q = new URL(req.url).searchParams;
  const pg = PAGES[q.get("page")];
  const it = !pg && q.get("id") ? shareItem(q.get("id")) : null;
  const s = q.get("demo") ? findSample(q.get("demo")) : null;
  const yl = pg?.yl || it?.yl || (s ? cleanYL(s.yl) : cleanYL(await readYL(q.get("yl"))));
  const title = (q.get("title") || it?.title || s?.name || (yl ? "Made in the Yui playground" : "Yui Lines playground")).slice(0, 80);
  return new ImageResponse(<OgCard title={title} yl={yl || "timer 40/20x8 Tabata"} agent={pg ? "Yui" : it?.agent || s?.agent} eyebrow={pg ? pg.eyebrow : it ? eyebrowOf(it) : undefined} screen={it ? await screenDataUrl(it.id) : null} />, {
    ...OG_SIZE,
    fonts: await ogFonts(),
    headers: { "cache-control": "public, max-age=86400, s-maxage=31536000, immutable" },
  });
}
