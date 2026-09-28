// Preview image for any Yui Lines (SITE-19): /og?yl=<share code>[&title=...]. Playground share
// links and embeds point their og:image here. The screen is drawn from the parsed lines.
// /og?page=<key>&title=... is a site page's own preview (SITE-85): its row in lib/og/pages.mjs.
// A row marked release (the home page, /changelog, /progress, /mockups) draws the latest release (SITE-86).
import { ImageResponse } from "next/og";
import { OG_SIZE, OgCard, eyebrowOf, ogFonts, screenDataUrl } from "../../lib/og/card";
import { readYL } from "../../lib/share-code.mjs";
import { cleanYL, findSample, shareItem } from "../../lib/share.mjs";
import { PAGES } from "../../lib/og/pages.mjs";
import { latestRelease, releaseScreen, releaseTag } from "../../lib/og/release.mjs";

export async function GET(req) {
  const q = new URL(req.url).searchParams;
  const key = q.get("page");
  const pg = PAGES[key];
  if (pg?.release) return releaseCard(key, pg, q.get("title"));
  const it = !pg && q.get("id") ? shareItem(q.get("id")) : null;
  const s = q.get("demo") ? findSample(q.get("demo")) : null;
  const yl = pg?.yl || it?.yl || (s ? cleanYL(s.yl) : cleanYL(await readYL(q.get("yl"))));
  const title = (q.get("title") || it?.title || s?.name || (yl ? "Made in the Yui playground" : "Yui Lines playground")).slice(0, 80);
  return new ImageResponse(<OgCard title={title} yl={yl || "timer 40/20x8 Tabata"} agent={pg ? "Yui" : it?.agent || s?.agent} eyebrow={pg ? pg.eyebrow : it ? eyebrowOf(it) : undefined} screen={it ? await screenDataUrl(it.id) : null} />, {
    ...OG_SIZE,
    fonts: await ogFonts(),
    headers: CACHE,
  });
}

// Each image URL carries its version (?v=), so every version can cache for a year.
const CACHE = { "cache-control": "public, max-age=86400, s-maxage=31536000, immutable" };

// The release card: the page's eyebrow with the version and date, its headline, what the release is,
// and a screen from the release in the phone. No release line: the row's own lines, like any page.
async function releaseCard(key, pg, title) {
  const rel = latestRelease();
  const screen = rel ? releaseScreen(rel) : null;
  const what = rel && (key === "/" ? `On TestFlight now, build ${rel.build}. Your agent draws the screen: a timer, a form, a choice.` : `Latest: Yui ${rel.version}, ${rel.name}.`);
  return new ImageResponse(<OgCard title={(title || "Yui").slice(0, 80)} yl={screen ? null : pg.yl} what={what} screen={screen} agent="Yui" eyebrow={rel ? `${pg.eyebrow} | ${releaseTag(rel).toUpperCase()}` : pg.eyebrow} />, {
    ...OG_SIZE,
    fonts: await ogFonts(),
    headers: CACHE,
  });
}
