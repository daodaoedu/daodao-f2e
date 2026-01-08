import createNextIntlPlugin from "@daodao/i18n/plugin";
import type { NextConfig } from "next";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const nextConfig: NextConfig = {
  output: "export",
  reactStrictMode: true,
  typedRoutes: true,
  transpilePackages: [
    "@daodao/api",
    "@daodao/assets",
    "@daodao/features-quiz",
    "@daodao/i18n",
    "@daodao/shared",
    "@daodao/ui",
  ],
  images: {
    unoptimized: true,
  },
  experimental: {
    globalNotFound: true,
    scrollRestoration: true,
  },
};

export default withNextIntl(nextConfig);
