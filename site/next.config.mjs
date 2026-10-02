/** @type {import('next').NextConfig} */
export default {
  reactStrictMode: true,
  // SITE-19: /og and each share link's preview image draw at request time with these fonts and captured screens.
  outputFileTracingIncludes: {
    // SITE-86: release cards read the roadmap's Latest release line and the release's picture.
    "/og": ["./lib/og/fonts/*", "./public/og/screens/*", "./public/og/release/*", "./public/og/thoughts/*", "./content/ROADMAP.md"],
    "/s/[id]/opengraph-image": ["./lib/og/fonts/*", "./public/og/screens/*"],
    // SITE-64: the chat searches the whole site at request time, including the pages written as JSX.
    "/api/chat": ["./content/**/*", "./app/page.js", "./app/help/page.js", "./app/start/page.js", "./app/privacy/page.js", "./app/earn/page.js", "./app/contribute/page.js"],
  },
  // YUI-241: Yui in the browser holds a refresh token, so /web runs under a strict policy. The policy itself
  // (YUI-264: scripts locked to a per request nonce) is set by middleware.js from lib/web/csp.mjs, one source.
  // These are the other headers /web carries.
  async headers() {
    return [{
      source: "/web/:path*",
      headers: [
        { key: "Referrer-Policy", value: "no-referrer" },
        { key: "X-Content-Type-Options", value: "nosniff" },
        { key: "Cross-Origin-Opener-Policy", value: "same-origin-allow-popups" },
      ],
    }];
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
