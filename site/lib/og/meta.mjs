// Every page shares as itself (SITE-85). pageMeta turns a page's own title and line into its metadata:
// og and twitter tags, its url, and an og:image drawn by /og?page=<key> from its row in lib/og/pages.mjs.
// Next replaces the layout's openGraph whole when a page sets one, so everything a share needs is here.
// The image URL carries a hash of what it draws, so a changed picture is a new URL chat apps fetch fresh.
import { createHash } from "node:crypto";
import { PAGES } from "./pages.mjs";

export const SITE_URL = "https://www.yuigui.com";

// "Contribute with your agent | Yui" -> "Contribute with your agent" for the picture's headline.
export const headOf = (title) => title.replace(/\s*\|\s*Yui$/, "");

export function pageImage(key, head) {
  const row = PAGES[key];
  if (!row) throw new Error(`og: no row for "${key}" in lib/og/pages.mjs`);
  const v = createHash("sha1").update(`${key}\n${head}\n${row.eyebrow}\n${row.yl}`).digest("hex").slice(0, 10);
  return `/og?page=${encodeURIComponent(key)}&title=${encodeURIComponent(head)}&v=${v}`;
}

// title and description are the page's own words; path is its URL (null for a private link like /i/<code>,
// which then carries no og:url); key picks the picture (default: path).
export function pageMeta({ title, description, path, key = path, ...rest }) {
  const head = headOf(title);
  const image = { url: pageImage(key, head), width: 1200, height: 630, alt: `${head}, on Yui` };
  return {
    title,
    description,
    ...rest,
    openGraph: { title, description, ...(path ? { url: `${SITE_URL}${path}` } : {}), siteName: "Yui", type: "website", images: [image] },
    twitter: { card: "summary_large_image", title, description, images: [image.url] },
  };
}
