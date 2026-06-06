import path from "node:path";
import createNextIntlPlugin from "@daodao/i18n/plugin";
import { loadEnvConfig } from "@next/env";
import type { NextConfig } from "next";

loadEnvConfig(process.cwd());

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
];

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
    unoptimized: true,
  },
  experimental: {
    globalNotFound: true,
    scrollRestoration: true,
  },
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
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
