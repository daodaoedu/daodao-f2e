const withNextIntl = require('next-intl/plugin')('./shared/i18n/request.ts');

const withPWA = require("next-pwa")({
  dest: "public",
  buildExcludes: [
    /build-manifest\.json$/,
    /react-loadable-manifest\.json$/,
    /dynamic-css-manifest\.json$/,
    /font-manifest\.json$/,
  ],
});

const withBundleAnalyzer = require("@next/bundle-analyzer")({
  enabled: process.env.ANALYZE === "true",
});

/** @type {import('next').NextConfig} */
const config = {
  reactStrictMode: false,
  staticPageGenerationTimeout: 600,
  transpilePackages: ["@mdxeditor/editor"],

  // Optimize server bundle size for Cloudflare Workers (3MB limit)
  experimental: {
    typedRoutes: true,
    globalNotFound: true,
    scrollRestoration: true,
    // Optimize package imports to reduce bundle size
    optimizePackageImports: [
      // Date & Time
      'react-day-picker',      // Reduce calendar bundle

      // Icons
      '@radix-ui/react-icons', // Only import used icons

      // Radix UI Components
      '@radix-ui/react-dialog',
      '@radix-ui/react-dropdown-menu',
      '@radix-ui/react-popover',
      '@radix-ui/react-select',
      '@radix-ui/react-tabs',
      '@radix-ui/react-accordion',
      '@radix-ui/react-alert-dialog',
      '@radix-ui/react-avatar',
      '@radix-ui/react-checkbox',
      '@radix-ui/react-collapsible',
      '@radix-ui/react-label',
      '@radix-ui/react-progress',
      '@radix-ui/react-radio-group',
      '@radix-ui/react-scroll-area',
      '@radix-ui/react-separator',
      '@radix-ui/react-slider',
      '@radix-ui/react-switch',
      '@radix-ui/react-tooltip',

      // Content & UI
      'react-markdown',        // Markdown renderer
      'react-share',           // Social share buttons
      'recharts',              // Chart library

      // Other UI
      'embla-carousel-react',  // Carousel
      'cmdk',                  // Command palette
      'vaul',                  // Drawer
      'sonner',                // Toast notifications
    ],

    // Exclude client-only packages from server bundle
    serverExternalPackages: [
      'html-to-image',         // Canvas/DOM manipulation (client-only)
      'lottie-web',            // Animation (client-only)
      'gsap',                  // Animation (client-only)
      '@mdxeditor/editor',     // Rich editor (client-only, already using dynamic import)
      'react-speech-recognition', // Browser API (client-only)
    ],
  },

  images: {
    unoptimized: true,
  },
  webpack: (config) => {
    const experiments = { ...config.experiments, topLevelAwait: true };

    config.module.rules.push({
      test: /\.svg$/,
      use: ["@svgr/webpack"],
    });

    return Object.assign(config, { experiments });
  },
  env: {
    PROD_URL: "https://www.daoedu.tw",
    STAGING_URL: "https://staging-daodao-f2e.daoedu.workers.dev",
  },
};

module.exports = withNextIntl(withPWA(withBundleAnalyzer(config)));
