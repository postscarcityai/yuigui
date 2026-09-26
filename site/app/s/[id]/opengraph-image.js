// The preview image for a share link (SITE-19). Drawn the first time someone asks for it (a social card
// crawler, usually), then cached until the next deploy. It used to be drawn at build time: 219 links, plus
// a copy of each for X, were most of a four-minute deploy (Sep 26). X reads this image too; it falls back
// to og:image when there is no twitter:image. Fonts and captured screens ship with it (next.config.mjs).
import { ImageResponse } from "next/og";
import { OG_SIZE, OgCard, eyebrowOf, ogFonts, screenDataUrl } from "../../../lib/og/card";
import { shareItem } from "../../../lib/share.mjs";

export const size = OG_SIZE;
export const contentType = "image/png";
export const alt = "A Yui screen and the Yui Lines that draw it";
export const dynamicParams = true;
export const generateStaticParams = () => [];

export default async function Image({ params }) {
  const it = shareItem((await params).id);
  if (!it) return new Response("Not found", { status: 404 });
  const screen = await screenDataUrl(it.id);
  return new ImageResponse(<OgCard title={it.title} yl={it.yl} screen={screen} agent={it.agent} what={it.what} eyebrow={eyebrowOf(it)} />, { ...OG_SIZE, fonts: await ogFonts() });
}
