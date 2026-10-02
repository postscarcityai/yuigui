// Every page shares as itself (SITE-85). pageMeta turns a page's own title and line into its metadata:
// og and twitter tags, its url, and an og:image drawn by /og?page=<key> from its row in lib/og/pages.mjs.
// Next replaces the layout's openGraph whole when a page sets one, so everything a share needs is here.
// The image URL carries a hash of what it draws, so a changed picture is a new URL chat apps fetch fresh.
import { createHash } from "node:crypto";
import { PAGES } from "./pages.mjs";
import { latestRelease, releaseVersion } from "./release.mjs";

export const SITE_URL = "https://www.yuigui.com";

// A share card line fits one line of a chat preview: 160 characters at most, cut at the last whole word,
// with a full stop in place of the cut so it never ends mid-thought. Short lines come back unchanged.
export function oneLine(text, max = 160) {
  const t = String(text ?? "").replace(/\s+/g, " ").trim();
  if (t.length <= max) return t;
  const cut = t.slice(0, max - 1);
  const sentence = cut.match(/^(.{60,}[.!?])\s/)?.[1];
  if (sentence) return sentence;
  return cut.replace(/[\s,;:\u2013\u2014-]+\S*$/, "").replace(/[,;:.]+$/, "") + ".";
}

// "Contribute with your agent | Yui" -> "Contribute with your agent" for the picture's headline.
export const headOf = (title) => title.replace(/\s*\|\s*Yui$/, "");

export function pageImage(key, head) {
  const row = PAGES[key];
  if (!row) throw new Error(`og: no row for "${key}" in lib/og/pages.mjs`);
  let v = createHash("sha1").update(`${key}\n${head}\n${row.eyebrow}\n${row.yl}`).digest("hex").slice(0, 10);
  // A row that follows the release (SITE-86) versions its image by the release: build number first.
  if (row.release) {
    const rv = releaseVersion(latestRelease());
    v = `${rv.split("-")[0]}-${createHash("sha1").update(`${v}\n${rv}`).digest("hex").slice(0, 10)}`;
  }
  return `/og?page=${encodeURIComponent(key)}&title=${encodeURIComponent(head)}&v=${v}`;
}

// title and description are the page's own words; path is its URL (null for a private link like /i/<code>,
// which then carries no og:url); key picks the picture (default: path). share: { title, description } when the
// share card says something other than the tab. image: a fixed picture's URL (the home page, SITE-103).
export function pageMeta({ title, description, path, key = path, share = {}, image: still, ...rest }) {
  const head = headOf(share.title || title);
  description = oneLine(description || "Yui puts a screen of buttons, pickers and cards on your agent's answers.");
  if (share.description) share = { ...share, description: oneLine(share.description) };
  const image = { url: still || pageImage(key, head), width: 1200, height: 630, alt: `${head}, on Yui` };
  return {
    title,
    description,
    ...rest,
    openGraph: { title: share.title || title, description: share.description || description, ...(path ? { url: `${SITE_URL}${path}` } : {}), siteName: "Yui", type: "website", images: [image] },
    twitter: { card: "summary_large_image", title: share.title || title, description: share.description || description, images: [image.url] },
  };
}
