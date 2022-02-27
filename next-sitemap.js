// const { CATEGORIES } = require("./constants/category");
// 為了在node裡面使用fetch，需使用其他套件
// const axios = require("axios");
const fetch = require("node-fetch");
// import fetch from "node-fetch";
const siteUrl = process.env.SITE_URL || "https://www.daoedu.com";

const CATEGORIES = [
  {
    key: "language",
    value: "語言與文學",
  },
  {
    key: "math",
    value: "數學與邏輯",
  },
  {
    key: "comsci",
    value: "資訊與工程",
  },
  {
    key: "humanity",
    value: "人文社會",
  },
  {
    key: "natusci",
    value: "自然科學",
  },
  {
    key: "art",
    value: "藝術",
  },
  {
    key: "education",
    value: "教育",
  },
  {
    key: "life",
    value: "生活",
  },
  {
    key: "health",
    value: "運動/心理/醫學",
  },
  {
    key: "business",
    value: "商業與社會創新",
  },
  {
    key: "multires",
    value: "綜合型學習資源",
  },
  {
    key: "learningtools",
    value: "學習/教學工具",
  },
];

module.exports = {
  siteUrl,
  generateRobotsTxt: true,
  robotsTxtOptions: {
    // For dynamic sitemap
    // additionalSitemaps: [
    //     'https://www.privago.com/server-sitemap.xml'
    // ],
    policies: [
      {
        userAgent: "*",
        disallow: "/api/",
      },
      //   {
      //     userAgent: "*",
      //     allow: "",
      //   },
      //   {
      //     userAgent: "*",
      //     allow: "/search",
      //   },
      //   {
      //     userAgent: "*",
      //     allow: "/watch",
      //   },
    ],
  },
  // Use default transformation for all other cases
  transform: async (config, path) => ({
    loc: path, // => this will be exported as http(s)://<config.siteUrl>/<path>
    changefreq: config.changefreq,
    priority: config.priority,
    lastmod: config.autoLastmod ? new Date().toISOString() : undefined,
    alternateRefs: config.alternateRefs ?? [],
  }),
  additionalPaths: async () => {
    const fields = [
      {
        loc: `/`,
        priority: 1,
        lastmod: new Date().toISOString(),
      },
      {
        loc: `/search`,
        priority: 1,
        lastmod: new Date().toISOString(),
      },
      {
        loc: `/contribute/resource`,
        priority: 0.7,
        lastmod: new Date().toISOString(),
      },
      {
        loc: `/about`,
        priority: 0.5,
        lastmod: new Date().toISOString(),
      },
      {
        loc: `/locations`,
        priority: 0.5,
        lastmod: new Date().toISOString(),
      },
      {
        loc: `/activities`,
        priority: 0.5,
        lastmod: new Date().toISOString(),
      },
    ];
    CATEGORIES.forEach(({ value }) => {
      fields.push({
        loc: `/search?cats=${value}`,
        priority: 0.7,
        lastmod: new Date().toISOString(),
      });
    });

    let cursor = undefined;
    let body = {};

    for (let i = 1; i <= 2; ) {
      body = {
        ...body,
        start_cursor: cursor,
        page_size: 100,
        filter: { and: [] },
      };
      console.log("body", body);
      const result = await fetch("https://api.daoedu.tw/notion/databases", {
        method: "POST",
        body: JSON.stringify(body),
      }).then((res) => res.json());
      fields.push(
        ...(result?.payload?.results ?? []).map((item) => ({
          loc: `/resource/${
            (item?.properties["資源名稱"]?.title ?? []).find(
              (item) => item?.type === "text"
            )?.plain_text
          }`,
          priority: 0.8,
          lastmod: new Date().toISOString(),
        }))
      );
      console.log(`${cursor} 的分頁處理完成`);
      if (result?.payload?.has_more) {
        cursor = result?.payload?.next_cursor;
        continue;
      }
      i++;
    }

    // console.log("fields", fields);
    return fields;
  },
  // exclude: [""]
};