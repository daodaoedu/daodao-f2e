const isDev = process.env.NODE_ENV === 'development';

const withPWA = require('next-pwa')({
  dest: 'public',
});

/** @type {import('next').NextConfig} */
const config = {
  reactStrictMode: false,
  staticPageGenerationTimeout: 600,
  transpilePackages: ['@mdxeditor/editor'],
  images: {
    domains: ['imgur.com', 'images.unsplash.com', 'lh3.googleusercontent.com'],
  },
  webpack: (config, options) => {
    const experiments = { ...config.experiments, topLevelAwait: true };

    config.module.rules.push({
      test: /\.svg$/,
      use: [
        options.defaultLoaders.babel,
        '@svgr/webpack',
      ],
    });

    return Object.assign(config, { experiments });
  },
  env: {
    HOSTNAME: 'https://www.daoedu.tw',
  },
  ...(isDev
    ? {
        async rewrites() {
          return [
            {
              source: '/dev-proxy-api/:path*',
              destination: `${process.env.NEXT_PUBLIC_API_URL}/:path*`,
            },
          ];
        },
      }
    : {}),
};

module.exports = withPWA(config);
