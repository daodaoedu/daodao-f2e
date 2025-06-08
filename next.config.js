const isDev = process.env.NODE_ENV === 'development';
const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? '';

const withPWA = require('next-pwa')({
  dest: 'public',
  buildExcludes: [
    /build-manifest\.json$/,
    /react-loadable-manifest\.json$/,
    /dynamic-css-manifest\.json$/,
    /font-manifest\.json$/,
  ],
});

/** @type {import('next').NextConfig} */
const config = {
  reactStrictMode: false,
  staticPageGenerationTimeout: 600,
  transpilePackages: ['@mdxeditor/editor'],
  images: {
    unoptimized: true,
    domains: ['imgur.com', 'images.unsplash.com', 'lh3.googleusercontent.com'],
  },
  webpack: (config, options) => {
    const experiments = { ...config.experiments, topLevelAwait: true };

    config.module.rules.push({
      test: /\.svg$/,
      use: [options.defaultLoaders.babel, '@svgr/webpack'],
    });

    return Object.assign(config, { experiments });
  },
  env: {
    HOSTNAME: 'https://www.daoedu.tw',
    NEXT_PUBLIC_DEV_URL: 'https://dev.daodao-notion-test.pages.dev',
  },
  ...(isDev
    ? {
        async rewrites() {
          return [
            {
              source: '/dev-proxy-api/:path*',
              destination: `${apiUrl}/:path*`,
            },
          ];
        },
      }
    : {}),
};

module.exports = withPWA(config);
