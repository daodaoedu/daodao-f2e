/* eslint-disable no-await-in-loop */
// const { CATEGORIES } = require("./constants/category");
// 為了在node裡面使用fetch，需使用其他套件
// const axios = require("axios");
const fetch = require('node-fetch');
// import fetch from "node-fetch";
const siteUrl = process.env.SITE_URL || 'https://www.daoedu.tw';
const { Feed } = require('feed');
const fs = require('fs');

const stringSanitizer = (string = '') =>
  string
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
const CATEGORIES = [
  {
    key: 'language',
    value: '語言與文學',
  },
  {
    key: 'math',
    value: '數學與邏輯',
  },
  {
    key: 'comsci',
    value: '資訊與工程',
  },
  {
    key: 'humanity',
    value: '人文社會',
  },
  {
    key: 'natusci',
    value: '自然科學',
  },
  {
    key: 'art',
    value: '藝術',
  },
  {
    key: 'education',
    value: '教育',
  },
  {
    key: 'life',
    value: '生活',
  },
  {
    key: 'health',
    value: '運動/心理/醫學',
  },
  {
    key: 'business',
    value: '商業與社會創新',
  },
  {
    key: 'multires',
    value: '綜合型學習資源',
  },
  {
    key: 'learningtools',
    value: '學習/教學工具',
  },
];

module.exports = {
  siteUrl,
  generateRobotsTxt: true,
  robotsTxtOptions: {
    // For dynamic sitemap
    // additionalSitemaps: [
    //     'https://www.daoedu.tw/server-sitemap.xml'
    // ],
    policies: [
      {
        userAgent: '*',
        disallow: '/api/',
      },
      //   {
      //     userAgent: "*",
      //     allow: "",
      //   },
      //   {
      //     userAgent: "*",
      //     allow: "/search",
      //   },
    ],
  },
  // https://www.sitemaps.org/protocol.html
  // Use default transformation for all other cases
  transform: async (config, path) => ({
    loc: path, // => this will be exported as http(s)://<config.siteUrl>/<path>
    changefreq: config.changefreq, // always hourly daily weekly monthly yearly never
    priority: config.priority, // 0.0 - 1.0
    lastmod: config.autoLastmod ? new Date().toISOString() : undefined,
    alternateRefs: config.alternateRefs ?? [],
  }),
  additionalPaths: async () => {
    const siteURL = 'https://www.daoedu.tw';
    const date = new Date();
    const author = {
      name: '島島阿學多元學習社群',
      email: 'contact@daoedu.tw',
      link: 'https://www.daoedu.tw',
    };

    const feed = new Feed({
      title: '島島阿學多元學習社群',
      description:
        '「島島阿學」盼能透過建立多元的學習資源網絡，讓自主學習者能找到合適的成長方法，進一步成為自己想成為的人，從中培養共好精神。目前正積極打造「可共編的學習資源平台」。',
      id: siteURL,
      link: siteURL,
      image: `${siteURL}/preview.webp`,
      favicon: `${siteURL}/favicon.png`,
      copyright: `All rights reserved ${date.getFullYear()}, 島島阿學`,
      updated: date,
      generator: 'Feed for Node.js',
      feedLinks: {
        rss2: `${siteURL}/rss/feed.xml`,
        json: `${siteURL}/rss/feed.json`,
        atom: `${siteURL}/rss/atom.xml`,
      },
      author,
    });
    const fields = [
      {
        loc: `/`,
        changefreq: 'daily',
        priority: 1.0,
        lastmod: new Date().toISOString(),
      },
      {
        loc: `/search`,
        changefreq: 'daily',
        priority: 1.0,
        lastmod: new Date().toISOString(),
      },
      {
        loc: `/contribute/resource`,
        changefreq: 'daily',
        priority: 0.7,
        lastmod: new Date().toISOString(),
      },
      {
        loc: `/about`,
        changefreq: 'daily',
        priority: 0.5,
        lastmod: new Date().toISOString(),
      },
      {
        loc: `/locations`,
        changefreq: 'daily',
        priority: 0.5,
        lastmod: new Date().toISOString(),
      },
      {
        loc: `/activities`,
        changefreq: 'daily',
        priority: 0.5,
        lastmod: new Date().toISOString(),
      },
      {
        loc: `/terms/privacypolicy`,
        changefreq: 'daily',
        priority: 0.5,
        lastmod: new Date().toISOString(),
      },
    ];
    CATEGORIES.forEach(({ value }) => {
      fields.push({
        loc: `/search?cats=${value}`,
        changefreq: 'daily',
        priority: 0.7,
        lastmod: new Date().toISOString(),
      });
    });

    let cursor;
    let body = {};

    // eslint-disable-next-line space-in-parens
    for (let i = 1; i <= 1; ) {
      body = {
        ...body,
        start_cursor: cursor,
        page_size: 100,
        filter: { and: [] },
      };
      const result = await fetch('https://api.daoedu.tw/notion/databases', {
        method: 'POST',
        body: JSON.stringify(body),
      }).then((res) => res.json());
      fields.push(
        ...(result?.payload?.results ?? []).map((item) => ({
          loc: `/resource/${
            (item?.properties['資源名稱']?.title ?? []).find(
              // eslint-disable-next-line no-shadow
              (item) => item?.type === 'text',
            )?.plain_text
          }`,
          priority: 0.8,
          lastmod: new Date().toISOString(),
        })),
      );

      (result?.payload?.results ?? []).forEach((item) => {
        const title = stringSanitizer(
          (item?.properties['資源名稱']?.title ?? []).find(
            // eslint-disable-next-line no-shadow
            (item) => item?.type === 'text',
          )?.plain_text || '',
        );
        const url = `https://www.daoedu.tw/resource/${stringSanitizer(title)}`;
        const image = stringSanitizer(item?.properties['縮圖']?.files[0]?.name);
        const desc = stringSanitizer(
          (item?.properties['介紹']?.rich_text ?? []).find(
            // eslint-disable-next-line no-shadow
            (item) => item?.type === 'text',
          )?.plain_text || '',
        );
        // const desc = item?.properties["介紹"]?.rich_text[0].plain_text;
        const createdTime = item?.created_time;
        feed.addItem({
          title: `${title}的學習資源介紹｜島島阿學`,
          id: url,
          link: url,
          image,
          description: desc,
          content: desc,
          author: [author],
          contributor: [author],
          date: new Date(createdTime),
        });
      });

      console.log(`${cursor} 的分頁處理完成`);
      if (result?.payload?.has_more) {
        cursor = result?.payload?.next_cursor;
        // eslint-disable-next-line no-continue
        continue;
      }
      // eslint-disable-next-line no-plusplus
      i++;
    }
    try {
      fs.mkdirSync('./public/rss', { recursive: true });
      fs.writeFileSync('./public/rss/feed.xml', feed.rss2());
      fs.writeFileSync('./public/rss/atom.xml', feed.atom1());
      fs.writeFileSync('./public/rss/feed.json', feed.json1());
      console.log('產生RSS成功');
    } catch (error) {
      console.log('產生RSS失敗：', error);
    }
    return fields;
  },
};
