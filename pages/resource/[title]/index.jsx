import React, { useMemo } from "react";
import { useRouter } from "next/router";
import SEOConfig from "../../../shared/components/SEO";
import Navigation from "../../../shared/components/Navigation_v2";
import Footer from "../../../shared/components/Footer_v2";
import Resource from "../../../components/Resource";

const ResourcePage = ({ data = {} }) => {
  console.log("data", data);
  const router = useRouter();
  const title = useMemo(
    () =>
      data?.properties && data?.properties["資源名稱"]
        ? data?.properties["資源名稱"]?.title[0]?.plain_text
        : "",
    [data?.properties]
  );
  const desc = useMemo(
    () =>
      data?.properties && data?.properties["介紹"]
        ? data.properties["介紹"]?.rich_text[0]?.plain_text
        : "",
    [data?.properties]
  );
  const image = useMemo(
    () =>
      data?.properties && data?.properties["縮圖"]
        ? data.properties["縮圖"]?.files[0]?.external?.url
        : "",
    [data?.properties]
  );
  const SEOData = useMemo(
    () => ({
      title: `${title}的學習資源介紹｜島島阿學`,
      description: desc,
      keywords: "島島阿學",
      author: "島島阿學",
      copyright: "島島阿學",
      imgLink: image ?? "/preview.webp",
      link: `https://test-page.notion.dev.daoedu.tw${router.asPath}`,
    }),
    [desc, image, router.asPath, title]
  );

  return (
    <>
      <SEOConfig data={SEOData} />
      <Navigation />
      <Resource data={data} title={title} desc={desc} image={image} />
      <Footer />
    </>
  );
};

export const getStaticProps = async ({ params }) => {
  if (process.env.NODE_ENV === "development") {
    return {
      props: {
        data: {
          object: "page",
          id: "ca3d9900-589f-4d81-bc3a-4afb101c5e88",
          created_time: "2022-02-21T03:29:00.000Z",
          last_edited_time: "2022-02-21T03:31:00.000Z",
          created_by: {
            object: "user",
            id: "804e887d-17dd-4a9b-8899-4efba5b74c88",
          },
          last_edited_by: {
            object: "user",
            id: "804e887d-17dd-4a9b-8899-4efba5b74c88",
          },
          cover: null,
          icon: null,
          parent: {
            type: "database_id",
            database_id: "edc9ef67-0495-412c-803d-4028510c518e",
          },
          archived: false,
          properties: {
            資源類型: {
              id: "%3C%3Dko",
              type: "multi_select",
              multi_select: [
                {
                  id: "939b8a00-7ebf-4eff-88ad-8e76ebbdb63a",
                  name: "組織/社群",
                  color: "blue",
                },
              ],
            },
            創建者: {
              id: "A%7DLo",
              type: "multi_select",
              multi_select: [],
            },
            縮圖: {
              id: "TZ_W",
              type: "files",
              files: [
                {
                  name: "https://i.imgur.com/ODMrt7U.jpg",
                  type: "external",
                  external: {
                    url: "https://i.imgur.com/ODMrt7U.jpg",
                  },
                },
              ],
            },
            領域名稱: {
              id: "Vv%3Ew",
              type: "multi_select",
              multi_select: [
                {
                  id: "97cfdb81-658d-4189-b376-9d8b634b3e8c",
                  name: "綜合型學習資源",
                  color: "red",
                },
              ],
            },
            補充資源: {
              id: "%5Bn%60T",
              type: "rich_text",
              rich_text: [],
            },
            連結: {
              id: "%5E%3A%7By",
              type: "url",
              url: "https://www.facebook.com/104intern/",
            },
            費用: {
              id: "h%7B%3Dv",
              type: "select",
              select: {
                id: "vlJK",
                name: "免費",
                color: "pink",
              },
            },
            介紹: {
              id: "k_Vg",
              type: "rich_text",
              rich_text: [
                {
                  type: "text",
                  text: {
                    content:
                      "104實習小編每天給你最新企業實習機會：電商實習、財務金融實習、行銷實習、軟體工程師實習、餐飲業實習...，各科系學生都可以透過實習認識工作內容和職場，提早摸索就業方向跟興趣！",
                    link: null,
                  },
                  annotations: {
                    bold: false,
                    italic: false,
                    strikethrough: false,
                    underline: false,
                    code: false,
                    color: "default",
                  },
                  plain_text:
                    "104實習小編每天給你最新企業實習機會：電商實習、財務金融實習、行銷實習、軟體工程師實習、餐飲業實習...，各科系學生都可以透過實習認識工作內容和職場，提早摸索就業方向跟興趣！",
                  href: null,
                },
              ],
            },
            標籤: {
              id: "nWGj",
              type: "multi_select",
              multi_select: [
                {
                  id: "ccf5f692-a00e-497e-a495-62e3dff4e452",
                  name: "實習",
                  color: "gray",
                },
                {
                  id: "i>]t",
                  name: "生涯探索",
                  color: "default",
                },
              ],
            },
            地區: {
              id: "pai%5E",
              type: "multi_select",
              multi_select: [],
            },
            年齡層: {
              id: "wS%3Cy",
              type: "multi_select",
              multi_select: [
                {
                  id: "D<Fb",
                  name: "國高中",
                  color: "green",
                },
                {
                  id: "b~_o",
                  name: "大學以上",
                  color: "green",
                },
              ],
            },
            資源名稱: {
              id: "title",
              type: "title",
              title: [
                {
                  type: "text",
                  text: {
                    content: "大學生找實習",
                    link: null,
                  },
                  annotations: {
                    bold: true,
                    italic: false,
                    strikethrough: false,
                    underline: false,
                    code: false,
                    color: "default",
                  },
                  plain_text: "大學生找實習",
                  href: null,
                },
              ],
            },
          },
          url: "https://www.notion.so/ca3d9900589f4d81bc3a4afb101c5e88",
        },
      },
    };
  }

  const title = params?.title ?? "";

  const data = await fetch("https://api.daoedu.tw/notion/databases", {
    method: "POST",
    body: JSON.stringify({
      filter: {
        and: [
          {
            property: "資源名稱",
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
      data: (data?.payload?.results ?? []).find(
        ({ properties }) =>
          properties && properties["資源名稱"]?.title[0]?.plain_text
      ),
    },
  };
};

// stackoverflow.com/questions/62057131/next-js-getstaticpaths-list-every-path-or-only-those-in-the-immediate-vicinity
export const getStaticPaths = async () => {
  if (process.env.NODE_ENV === "development") {
    return {
      paths: [
        {
          params: {
            title: "大學生找實習",
          },
        },
      ],
      fallback: false,
    };
  }
  const pathList = [];
  let cursor = undefined;
  for (let i = 0; i <= 1; ) {
    let body = {
      start_cursor: cursor,
    };
    const result = await fetch("https://api.daoedu.tw/notion/databases", {
      method: "POST",
      body: JSON.stringify(body),
    }).then((res) => res.json());
    pathList.push(
      ...(result?.payload?.results ?? []).map((item) => ({
        params: {
          title: (item?.properties["資源名稱"]?.title ?? []).find(
            (item) => item?.type === "text"
          )?.plain_text,
          // title: item?.properties["資源名稱"]?.title[0]?.plain_text,
          // id: item?.id,
        },
      }))
    );

    if (result?.payload?.has_more) {
      cursor = result?.payload?.next_cursor;
      continue;
    }
    i++;
  }
  console.log("result:", pathList);
  return {
    paths: pathList,
    // paths: [{ params: { title: "test" } }], // indicates that no page needs be created at build time
    fallback: false, // indicates the type of fallback
    // fallback: "blocking",
  };
};

export default ResourcePage;
