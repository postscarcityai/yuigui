// The preview image for a share link (SITE-19), built once per link at build time.
import { ImageResponse } from "next/og";
import { OG_SIZE, OgCard, eyebrowOf, ogFonts, screenDataUrl } from "../../../lib/og/card";
import { shareItem, shareItems } from "../../../lib/share.mjs";

export const size = OG_SIZE;
export const contentType = "image/png";
export const alt = "A Yui screen and the Yui Lines that draw it";
export const dynamicParams = false;
export const generateStaticParams = () => shareItems().map((it) => ({ id: it.id }));

export default async function Image({ params }) {
  const it = shareItem((await params).id);
  const screen = await screenDataUrl(it.id);
  return new ImageResponse(<OgCard title={it.title} yl={it.yl} screen={screen} agent={it.agent} what={it.what} eyebrow={eyebrowOf(it)} />, { ...OG_SIZE, fonts: await ogFonts() });
}
