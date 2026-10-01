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
  // YUI-241: Yui in the browser holds a refresh token, so /web runs under a strict policy: scripts from the page
  // and Apple's sign in script, requests to Yui's backend and Apple only, nothing framing it, no plugins.
  // script-src keeps 'unsafe-inline' because Next writes its hydration data inline; see docs/specs/web-parity.md.
  async headers() {
    const backend = "https://txuibjxyfpalzvpneqgp.supabase.co";
    const csp = [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' https://appleid.cdn-apple.com",
      "style-src 'self' 'unsafe-inline'",
      // A person's photos and an agent's pictures are signed links into the private media bucket (spec/RELAY.md, Media).
      `img-src 'self' data: blob: ${backend}`,
      `media-src 'self' blob: ${backend}`,
      "font-src 'self' data:",
      `connect-src 'self' ${backend} wss://txuibjxyfpalzvpneqgp.supabase.co https://appleid.apple.com`,
      "frame-src https://appleid.apple.com",
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "form-action 'self' https://appleid.apple.com",
      "object-src 'none'",
    ].join("; ");
    return [{
      source: "/web/:path*",
      headers: [
        { key: "Content-Security-Policy", value: csp },
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
