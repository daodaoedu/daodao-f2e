import createNextIntlPlugin from "@daodao/i18n/plugin";
import type { NextConfig } from "next";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const nextConfig: NextConfig = {
  reactStrictMode: true,
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
};

export default withNextIntl(nextConfig);

