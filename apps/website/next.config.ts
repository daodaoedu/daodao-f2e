import path from "node:path";
import createNextIntlPlugin from "@daodao/i18n/plugin";
import { loadEnvConfig } from "@next/env";
import type { NextConfig } from "next";

// 載入 monorepo 根目錄的環境變數（apps/website -> ../../）
loadEnvConfig(path.resolve(process.cwd(), "../.."));

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
  output: process.env.NEXT_OUTPUT === "export" ? "export" : undefined,
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
    remotePatterns: buildRemotePatterns(),
  },
  experimental: {
    globalNotFound: true,
    scrollRestoration: true,
  },
};

export default withNextIntl(nextConfig);
