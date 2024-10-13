/* eslint-disable space-in-parens */
import React, { useMemo } from 'react';
import { useRouter } from 'next/router';
import appendQuery from 'append-query';
import SEOConfig from '../../../shared/components/SEO';
import Navigation from '../../../shared/components/Navigation_v2';
import Footer from '../../../shared/components/Footer_v2';
import Resource from '../../../components/Resource';

const ResourcePage = ({ data = {} }) => {
  const router = useRouter();
  const title = useMemo(
    () =>
      data?.properties && data?.properties['資源名稱']
        ? data?.properties['資源名稱']?.title[0]?.plain_text
        : '',
    [data?.properties],
  );
  const desc = useMemo(
    () =>
      data?.properties && data?.properties['介紹']
        ? data?.properties['介紹']?.rich_text
            .map((richText) => richText.plain_text)
            .join('')
        : '',
    [data?.properties],
  );
  const image = useMemo(
    () =>
      data?.properties && data?.properties['縮圖']
        ? data?.properties['縮圖']?.files[0]?.external?.url
        : '',
    [data?.properties],
  );

  const tags = useMemo(
    () =>
      data?.properties && data?.properties['標籤']
        ? data?.properties['標籤']?.multi_select
        : [],
    [data?.properties],
  );

  const feeTags = useMemo(
    () =>
      data?.properties['費用']?.select
        ? [data?.properties['費用']?.select]
        : [],
    [data],
  );

  const videoLink = useMemo(() => data?.properties['影片']?.url, [data]);

  const link = useMemo(
    () =>
      data?.properties && data?.properties['連結']
        ? appendQuery(
            data?.properties['連結']?.url ?? '',
            'utm_source=daoedu.tw',
          )
        : '',
    [data?.properties],
  );
  const SEOData = useMemo(
    () => ({
      title: `${title}的學習資源介紹｜島島阿學`,
      description:
        desc.length < 50
          ? `${desc}\n此外，我們期盼能邀請在各領域深耕已久的夥伴們將自身累積的資源新增至教育資源網站，讓資源透明化。若您願意一同共編，請至新增資源的表單新增資源，我們將進行審核在新增至資料庫中。`
          : desc,
      keywords: '島島阿學',
      author: '島島阿學',
      copyright: '島島阿學',
      imgLink: image ?? 'https://www.daoedu.tw/preview.webp',
      link: `${process.env.HOSTNAME}${router?.asPath}`,
      structuredData: [
        {
          '@context': 'https://schema.org/',
          '@type': 'Dataset',
          name: `${title}的學習資源介紹｜島島阿學`,
          description: desc,
          url: `${process.env.HOSTNAME}${router?.asPath}`,
          keywords: tags.map(({ name }) => name),
          license: 'https://www.daoedu.tw/terms/privacypolicy',
          sameAs:
            data?.properties &&
            data?.properties['連結'] &&
            data?.properties['連結']?.url,
          isAccessibleForFree: !(
            data?.properties['費用']?.select?.name === '需付費'
          ),
          creator: { '@type': 'Organization', name: '島島阿學' },
          // distribution: [
          //   {
          //     "@type": "DataDownload",
          //     encodingFormat: "CSV",
          //     contentUrl:
          //       "https://ws.moe.edu.tw/001/Upload/4/relfile/0/5042/c7b8c3a5-cd9f-4063-91b2-d21afbf18dc3.csv",
          //   },
          // ],
        },
      ],
    }),
    [data?.properties, desc, image, router?.asPath, tags, title],
  );
  return (
    <>
      <SEOConfig data={SEOData} />
      <Navigation />
      <Resource
        data={data}
        title={title}
        desc={desc}
        image={image}
        tags={tags}
        feeTags={feeTags}
        link={link}
        videoLink={videoLink}
      />
      <Footer />
    </>
  );
};

export const getStaticProps = async ({ params }) => {
  if (process.env.NODE_ENV === 'development') {
    return {
      props: {
        data: {
          object: 'page',
          id: 'ca3d9900-589f-4d81-bc3a-4afb101c5e88',
          created_time: '2022-02-21T03:29:00.000Z',
          last_edited_time: '2022-02-21T03:31:00.000Z',
          created_by: {
            object: 'user',
            id: '804e887d-17dd-4a9b-8899-4efba5b74c88',
          },
          last_edited_by: {
            object: 'user',
            id: '804e887d-17dd-4a9b-8899-4efba5b74c88',
          },
          cover: null,
          icon: null,
          parent: {
            type: 'database_id',
            database_id: 'edc9ef67-0495-412c-803d-4028510c518e',
          },
          archived: false,
          properties: {
            資源類型: {
              id: '%3C%3Dko',
              type: 'multi_select',
              multi_select: [
                {
                  id: '939b8a00-7ebf-4eff-88ad-8e76ebbdb63a',
                  name: '組織/社群',
                  color: 'blue',
                },
              ],
            },
            創建者: {
              id: 'A%7DLo',
              type: 'multi_select',
              multi_select: [],
            },
            縮圖: {
              id: 'TZ_W',
              type: 'files',
              files: [
                {
                  name: 'https://i.imgur.com/ODMrt7U.jpg',
                  type: 'external',
                  external: {
                    url: 'https://i.imgur.com/ODMrt7U.jpg',
                  },
                },
              ],
            },
            領域名稱: {
              id: 'Vv%3Ew',
              type: 'multi_select',
              multi_select: [
                {
                  id: '97cfdb81-658d-4189-b376-9d8b634b3e8c',
                  name: '綜合型學習資源',
                  color: 'red',
                },
              ],
            },
            補充資源: {
              id: '%5Bn%60T',
              type: 'rich_text',
              rich_text: [],
            },
            連結: {
              id: '%5E%3A%7By',
              type: 'url',
              url: 'https://www.facebook.com/104intern/',
            },
            費用: {
              id: 'h%7B%3Dv',
              type: 'select',
              select: {
                id: 'vlJK',
                name: '免費',
                color: 'pink',
              },
            },
            介紹: {
              id: 'k_Vg',
              type: 'rich_text',
              rich_text: [
                {
                  type: 'text',
                  text: {
                    content:
                      '104實習小編每天給你最新企業實習機會：電商實習、財務金融實習、行銷實習、軟體工程師實習、餐飲業實習...，各科系學生都可以透過實習認識工作內容和職場，提早摸索就業方向跟興趣！',
                    link: null,
                  },
                  annotations: {
                    bold: false,
                    italic: false,
                    strikethrough: false,
                    underline: false,
                    code: false,
                    color: 'default',
                  },
                  plain_text:
                    '104實習小編每天給你最新企業實習機會：電商實習、財務金融實習、行銷實習、軟體工程師實習、餐飲業實習...，各科系學生都可以透過實習認識工作內容和職場，提早摸索就業方向跟興趣！',
                  href: null,
                },
              ],
            },
            標籤: {
              id: 'nWGj',
              type: 'multi_select',
              multi_select: [
                {
                  id: 'ccf5f692-a00e-497e-a495-62e3dff4e452',
                  name: '實習',
                  color: 'gray',
                },
                {
                  id: 'i>]t',
                  name: '生涯探索',
                  color: 'default',
                },
              ],
            },
            地區: {
              id: 'pai%5E',
              type: 'multi_select',
              multi_select: [],
            },
            影片: {
              id: 'jC%3CM',
              type: 'url',
              url: 'https://www.youtube.com/watch?v=Mv_uPvf_pGQ',
            },
            年齡層: {
              id: 'wS%3Cy',
              type: 'multi_select',
              multi_select: [
                {
                  id: 'D<Fb',
                  name: '國高中',
                  color: 'green',
                },
                {
                  id: 'b~_o',
                  name: '大學以上',
                  color: 'green',
                },
              ],
            },
            資源名稱: {
              id: 'title',
              type: 'title',
              title: [
                {
                  type: 'text',
                  text: {
                    content: '大學生找實習',
                    link: null,
                  },
                  annotations: {
                    bold: true,
                    italic: false,
                    strikethrough: false,
                    underline: false,
                    code: false,
                    color: 'default',
                  },
                  plain_text: '大學生找實習',
                  href: null,
                },
              ],
            },
          },
          url: 'https://www.notion.so/ca3d9900589f4d81bc3a4afb101c5e88',
        },
      },
    };
  }

  const title = params?.title ?? '';

  const data = await fetch('https://api.daoedu.tw/notion/databases', {
    method: 'POST',
    body: JSON.stringify({
      filter: {
        and: [
          {
            property: '資源名稱',
            title: {
              contains: title,
            },
          },
        ],
      },
    }),
  }).then((res) => res.json());

  return {
    props: {
      data:
        (data?.payload?.results ?? []).find(({ properties }) =>
          (
            (properties['資源名稱']?.title ?? []).find(
              (item) => item?.type === 'text',
            )?.plain_text ?? ''
          ).trim(),
        ) || {},
    },
  };
};

// stackoverflow.com/questions/62057131/next-js-getstaticpaths-list-every-path-or-only-those-in-the-immediate-vicinity
export const getStaticPaths = async () => {
  if (process.env.NODE_ENV === 'development') {
    return {
      paths: [
        {
          params: {
            title: '大學生找實習',
          },
        },
      ],
      fallback: false,
    };
  }

  const pathList = [];
  let cursor;
  for (let i = 0; i <= 0; ) {
    const body = {
      start_cursor: cursor,
    };
    // eslint-disable-next-line no-await-in-loop
    const result = await fetch('https://api.daoedu.tw/notion/databases', {
      method: 'POST',
      body: JSON.stringify(body),
    }).then((res) => res.json());

    const batchPathList = (result?.payload?.results ?? []).map((item) => ({
      params: {
        title: (
          (item?.properties['資源名稱']?.title ?? []).find(
            // eslint-disable-next-line no-shadow
            (item) => item?.type === 'text',
          )?.plain_text ?? ''
        ).trim(),
        // .replace(/\./g, "%2E"), // or try &#46; reference: https://stackoverflow.com/questions/4938900/how-to-encode-periods-for-urls-in-javascript
      },
    }));
    pathList.push(...batchPathList);

    if (result?.payload?.has_more) {
      cursor = result?.payload?.next_cursor;
      // eslint-disable-next-line no-continue
      continue;
    }
    // eslint-disable-next-line no-plusplus
    i++;
  }
  console.log('打包長度:', pathList.length);
  console.log('result:', pathList);

  return {
    paths: pathList,
    // paths: [{ params: { title: "test" } }], // indicates that no page needs be created at build time
    fallback: false, // indicates the type of fallback
    // fallback: "blocking",
  };
};

export default ResourcePage;
