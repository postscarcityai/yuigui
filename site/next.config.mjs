/** @type {import('next').NextConfig} */
export default {
  reactStrictMode: true,
  // SITE-19: /og draws previews at request time with these fonts and captured screens.
  outputFileTracingIncludes: { "/og": ["./lib/og/fonts/*", "./public/og/screens/*"] },
  // SITE-13 merged these pages. Old links keep working.
  async redirects() {
    return [
      { source: "/plan", destination: "/business/plan", permanent: true },
      { source: "/deck", destination: "/business/plan", permanent: true },
      // SITE-15: these specs already had their own page.
      { source: "/developers/yl", destination: "/yl", permanent: true },
      { source: "/developers/channel", destination: "/channel", permanent: true },
      { source: "/developers/reactions", destination: "/reactions", permanent: true },
      // SITE-30: Notes became Thoughts, Yui's blog.
      { source: "/notes", destination: "/thoughts", permanent: true },
      { source: "/notes/:slug", destination: "/thoughts/:slug", permanent: true },
    ];
  },
};
