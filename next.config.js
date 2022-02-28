// const path = require("path");

module.exports = {
  reactStrictMode: false,
  images: {
    domains: ["imgur.com"],
  },
  env: {
    HOSTNAME: "https://www.daoedu.tw",
  },
  // async redirects() {
  //   return [
  //     {
  //       source: "/learn/:title",
  //       destination: "/resource/:title",
  //       permanent: true,
  //     },
  //     {
  //       source: "/list",
  //       destination: "/search",
  //       permanent: true,
  //     },
  //     {
  //       source: "/category/learn/:cat",
  //       destination: "/search",
  //       permanent: true,
  //     },
  //     {
  //       source: "/developer",
  //       destination: "/about",
  //       permanent: true,
  //     },
  //     {
  //       source: "/tag:tag",
  //       destination: "/search?q=:tag",
  //       permanent: true,
  //     },
  //     {
  //       source: "/privacy-policy",
  //       destination: "/about",
  //       permanent: true,
  //     },
  //     {
  //       source: "/terms-of-service",
  //       destination: "/about",
  //       permanent: true,
  //     },
  //   ];
  // },

  // mode: "development",
  // entry: path.resolve(__dirname, "src"),
  // resolve: {
  //   extensions: ["", ".js", ".jsx"],
  // },
  // i18n: {
  //   /**
  //    * Provide the locales you want to support in your application
  //    */
  //   // TODO: Recover zh locale after Bing's review
  //   locales: ["zh"],
  //   /**
  //    * This is the default locale you want to be used when visiting
  //    * a non-locale prefixed path.
  //    */
  //   defaultLocale: "zh",
  //   ignoreRoutes: ["/api/"],
  //   localDetection: false,
  // },
  // async headers() {
  //   return [
  //     {
  //       source: "/:all*(svg|jpg|png|webp)",
  //       locale: false,
  //       headers: [
  //         {
  //           key: "Cache-Control",
  //           value: "public, max-age=2592000, must-revalidate",
  //         },
  //       ],
  //     },
  //   ];
  // },
};
