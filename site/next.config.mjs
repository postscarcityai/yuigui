/** @type {import('next').NextConfig} */
export default {
  reactStrictMode: true,
  // SITE-13 merged these pages. Old links keep working.
  async redirects() {
    return [
      { source: "/plan", destination: "/business/plan", permanent: true },
      { source: "/deck", destination: "/business/plan", permanent: true },
    ];
  },
};
