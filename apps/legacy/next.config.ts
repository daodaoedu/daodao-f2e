import path from "node:path";
import { loadEnvConfig } from "@next/env";
import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

loadEnvConfig(process.cwd());

const withNextIntl = createNextIntlPlugin("./src/shared/i18n/request.ts");

const nextConfig: NextConfig = {
  reactStrictMode: false,
  staticPageGenerationTimeout: 600,
  typedRoutes: true,
  output: "standalone",
  // Exclude client-only packages from server bundle
  serverExternalPackages: [
    "html-to-image", // Canvas/DOM manipulation (client-only)
    "lottie-web", // Animation (client-only)
    "gsap", // Animation (client-only)
    "react-speech-recognition", // Browser API (client-only)
    "regenerator-runtime", // Async/await support (client-only)
  ],

  // Optimize server bundle size for Cloudflare Workers (3MB limit)
  experimental: {
    globalNotFound: true,
    scrollRestoration: true,
    // Optimize package imports to reduce bundle size
    optimizePackageImports: [
      // Date & Time
      "react-day-picker", // Reduce calendar bundle

      // Icons
      "@radix-ui/react-icons", // Only import used icons

      // Radix UI Components
      "@radix-ui/react-dialog",
      "@radix-ui/react-dropdown-menu",
      "@radix-ui/react-popover",
      "@radix-ui/react-select",
      "@radix-ui/react-tabs",
      "@radix-ui/react-accordion",
      "@radix-ui/react-alert-dialog",
      "@radix-ui/react-avatar",
      "@radix-ui/react-checkbox",
      "@radix-ui/react-collapsible",
      "@radix-ui/react-label",
      "@radix-ui/react-progress",
      "@radix-ui/react-radio-group",
      "@radix-ui/react-scroll-area",
      "@radix-ui/react-separator",
      "@radix-ui/react-slider",
      "@radix-ui/react-switch",
      "@radix-ui/react-tooltip",

      // Content & UI
      "react-markdown", // Markdown renderer
      "react-share", // Social share buttons

      // Other UI
      "embla-carousel-react", // Carousel
      "cmdk", // Command palette
      "vaul", // Drawer
      "sonner", // Toast notifications
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

    // Add path aliases
    if (!config.resolve) {
      config.resolve = {};
    }
    if (!config.resolve.alias) {
      config.resolve.alias = {};
    }
    config.resolve.alias = {
      ...config.resolve.alias,
      "@": path.resolve(__dirname, "./src"),
      "@/src": path.resolve(__dirname, "./src"),
      "@/public": path.resolve(__dirname, "./public"),
    };

    return Object.assign(config, { experiments });
  },
  env: {
    PROD_URL: "https://www.daoedu.tw",
    STAGING_URL: "https://staging-daodao-f2e.daoedu.workers.dev",
  },
};

export default withNextIntl(nextConfig);
