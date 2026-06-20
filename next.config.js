/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "http",
        hostname: "localhost",
        port: "1337",
        pathname: "/uploads/**",
      },
      {
        protocol: "https",
        hostname: "**.amazonaws.com",
        pathname: "/**",
      },
      {
        // Add your production Strapi domain here
        protocol: "https",
        hostname: process.env.STRAPI_MEDIA_HOST || "localhost",
        pathname: "/uploads/**",
      },
{
        protocol: "https",
        hostname: "res.cloudinary.com",
        pathname: "/**",
      },
    ],
    formats: ["image/avif", "image/webp"],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },

  // Enable React strict mode
  reactStrictMode: true,

  // Logging for ISR revalidation during development
  logging: {
    fetches: {
      fullUrl: true,
    },
  },

  // Headers for security and caching
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-XSS-Protection", value: "1; mode=block" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        ],
      },
      {
        source: "/sitemap.xml",
        headers: [
          { key: "Cache-Control", value: "public, max-age=3600, s-maxage=3600" },
        ],
      },
    ];
  },

  // Redirects
  //
  // NOTE: www→apex canonicalization is done at the Vercel domain level
  // (Project → Settings → Domains: www.islam-24.com permanently redirects
  // to islam-24.com). Doing it here in next.config.js with a host matcher
  // collided with Vercel's own primary-domain redirect (apex→www, the
  // pre-fix state) and produced an infinite 307↔308 loop on every URL
  // — including /robots.txt — which broke Ahrefs/Google crawling. Always
  // canonicalize the host at exactly one layer, not both.
  async redirects() {
    return [
      {
        source: "/apps/sabab",
        destination: "/apps/sabab/index.html",
        permanent: false,
      },
      {
        source: "/home",
        destination: "/",
        permanent: true,
      },
      // Human-friendly topical aliases requested for LLM/AEO discovery.
      // They point at the canonical routes to avoid duplicate indexed pages.
      {
        source: "/quran",
        destination: "/category/quran-tafsir",
        permanent: true,
      },
      {
        source: "/hadith",
        destination: "/category/hadith",
        permanent: true,
      },
      {
        source: "/articles",
        destination: "/blog",
        permanent: true,
      },
      // Asma Allah: old /article/name-NN-X → new /asma-allah/name-NN-X
      // Slug preserved (Phase C2 decision 6) so the path swap is mechanical.
      {
        source: "/article/:slug(name-\\d+-.+)",
        destination: "/asma-allah/:slug",
        permanent: true,
      },
      // Legacy URL patterns surfaced in Strapi-authored homepage tiles
      // and historical backlinks. Singular `/article/:slug` and
      // `/category/:slug` are the canonical routes.
      {
        source: "/articles/:slug",
        destination: "/article/:slug",
        permanent: true,
      },
      {
        source: "/categories/:slug",
        destination: "/category/:slug",
        permanent: true,
      },
      // /blog?page=1 is identical to /blog — collapse it to one canonical URL.
      {
        source: "/blog",
        has: [{ type: "query", key: "page", value: "1" }],
        destination: "/blog",
        permanent: true,
      },
    ];
  },
};

module.exports = nextConfig;


// Injected content via Sentry wizard below

const { withSentryConfig } = require("@sentry/nextjs");

module.exports = withSentryConfig(module.exports, {
  // For all available options, see:
  // https://www.npmjs.com/package/@sentry/webpack-plugin#options

  org: "islam-24",
  project: "javascript-nextjs",

  // Only print logs for uploading source maps in CI
  silent: !process.env.CI,

  // For all available options, see:
  // https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/

  // Upload a larger set of source maps for prettier stack traces (increases build time)
  widenClientFileUpload: true,

  // Route browser requests to Sentry through a Next.js rewrite to circumvent ad-blockers.
  // This can increase your server load as well as your hosting bill.
  // Note: Check that the configured route will not match with your Next.js middleware, otherwise reporting of client-
  // side errors will fail.
  tunnelRoute: "/monitoring",

  webpack: {
    // Enables automatic instrumentation of Vercel Cron Monitors. (Does not yet work with App Router route handlers.)
    // See the following for more information:
    // https://docs.sentry.io/product/crons/
    // https://vercel.com/docs/cron-jobs
    automaticVercelMonitors: true,

    // Tree-shaking options for reducing bundle size
    treeshake: {
      // Automatically tree-shake Sentry logger statements to reduce bundle size
      removeDebugLogging: true,
    },
  },
});
