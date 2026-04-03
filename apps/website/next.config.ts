import path from "node:path";
import createNextIntlPlugin from "@daodao/i18n/plugin";
import { loadEnvConfig } from "@next/env";
import type { NextConfig } from "next";

// 載入 monorepo 根目錄的環境變數（apps/website -> ../../）
loadEnvConfig(path.resolve(process.cwd(), "../.."));

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
    unoptimized: true,
  },
  experimental: {
    globalNotFound: true,
    scrollRestoration: true,
  },
};

export default withNextIntl(nextConfig);
