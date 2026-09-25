// Share preview for a Thought (SITE-30): title, tag, dek, and the lead screenshot in the phone.
// Satori reads jpeg, not webp, so the lead is copied to public/og/thoughts/<slug>.jpg when written.
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { OG_SIZE, OgCard, ogFonts } from "../../../lib/og/card";
import { TAGS, thoughts } from "../../../lib/thoughts.mjs";

export const size = OG_SIZE;
export const contentType = "image/png";
export const alt = "A Thought from Yui";

export function generateStaticParams() {
  return thoughts().map((t) => ({ slug: t.slug }));
}

export default async function Image({ params }) {
  const { slug } = await params;
  const t = thoughts().find((x) => x.slug === slug);
  let screen = null;
  try { screen = `data:image/jpeg;base64,${(await readFile(join(process.cwd(), "public/og/thoughts", `${slug}.jpg`))).toString("base64")}`; } catch { /* drawn from the lines */ }
  const eyebrow = `THOUGHTS | ${(TAGS[t?.tag]?.label || "").toUpperCase()}`;
  return new ImageResponse(<OgCard title={t?.title || "Thoughts"} what={t?.dek} yl={screen ? null : t?.lead?.yl} screen={screen} agent="Yui" eyebrow={eyebrow} />, { ...OG_SIZE, fonts: await ogFonts() });
}
