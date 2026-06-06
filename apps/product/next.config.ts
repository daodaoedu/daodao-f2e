import path from "node:path";
import createNextIntlPlugin from "@daodao/i18n/plugin";
import { loadEnvConfig } from "@next/env";
import type { NextConfig } from "next";

loadEnvConfig(process.cwd());

function buildRemotePatterns(): import("next").NextConfig["images"]["remotePatterns"] {
  const patterns: import("next").NextConfig["images"]["remotePatterns"] = [
    { protocol: "https", hostname: "lh3.googleusercontent.com" },
    { protocol: "https", hostname: "pub-*.r2.dev" },
  ];
  const r2Url = process.env.R2_PUBLIC_URL;
  if (r2Url) {
    try {
      patterns.push({ protocol: "https", hostname: new URL(r2Url).hostname });
    } catch {}
  }
  return patterns;
}

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const nextConfig: NextConfig = {
  output: "standalone",
  outputFileTracingRoot: path.join(__dirname, "../../"),
  reactStrictMode: true,
  typedRoutes: true,
  transpilePackages: [
    "@daodao/api",
    "@daodao/assets",
    "@daodao/features-mention",
    "@daodao/features-quiz",
    "@daodao/i18n",
    "@daodao/shared",
    "@daodao/ui",
  ],
  images: {
    remotePatterns: buildRemotePatterns(),
  },
  experimental: {
    globalNotFound: true,
    scrollRestoration: true,
  },
  async redirects() {
    return [
      {
        source: "/my",
        destination: "/mine",
        permanent: true,
      },
      {
        source: "/:locale/my",
        destination: "/:locale/mine",
        permanent: true,
      },
    ];
  },
};

export default withNextIntl(nextConfig);
