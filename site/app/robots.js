export default function robots() {
  // /brand is the unlisted brand lab (round 1), kept out of search while we decide.
  return { rules: { userAgent: "*", allow: "/", disallow: "/brand" }, sitemap: "https://www.yuigui.com/sitemap.xml" };
}
