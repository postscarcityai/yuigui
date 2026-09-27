/** @type {import('next').NextConfig} */
export default {
  reactStrictMode: true,
  // SITE-19: /og and each share link's preview image draw at request time with these fonts and captured screens.
  outputFileTracingIncludes: {
    "/og": ["./lib/og/fonts/*", "./public/og/screens/*"],
    "/s/[id]/opengraph-image": ["./lib/og/fonts/*", "./public/og/screens/*"],
    // SITE-64: the chat searches the whole site at request time, including the pages written as JSX.
    "/api/chat": ["./content/**/*", "./app/page.js", "./app/help/page.js", "./app/start/page.js", "./app/privacy/page.js", "./app/earn/page.js", "./app/contribute/page.js"],
  },
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
      // OSS-6: Yui@home moved up to its own page, next to the backlog it serves.
      { source: "/developers/contribute", destination: "/contribute", permanent: true },
      // SITE-62: people say "the builds page"; it is the changelog.
      { source: "/builds", destination: "/changelog", permanent: false },
    ];
  },
};
