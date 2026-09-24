/** @type {import('next').NextConfig} */
export default {
  reactStrictMode: true,
  // SITE-13 merged these pages. Old links keep working.
  async redirects() {
    return [
      { source: "/plan", destination: "/business/plan", permanent: true },
      { source: "/deck", destination: "/business/plan", permanent: true },
      // SITE-15: these specs already had their own page.
      { source: "/developers/yl", destination: "/yl", permanent: true },
      { source: "/developers/channel", destination: "/channel", permanent: true },
      { source: "/developers/reactions", destination: "/reactions", permanent: true },
    ];
  },
};
