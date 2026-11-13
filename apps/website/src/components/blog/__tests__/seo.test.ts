import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import type { BlogArticleType } from "../content";
import { BlogJsonLd } from "../json-ld";
import {
  type BlogSeoDataType,
  buildBlogArticleJsonLd,
  buildBlogArticleMetadata,
  buildBlogCollectionMetadata,
  buildBlogSitemap,
  mergeWebsiteSitemap,
  serializeBlogJsonLd,
} from "../seo";

const production = "https://daodao.so";
function fixture() {
  const make = (lang: "zh-TW" | "en", slug: string): BlogArticleType => ({
    file: `articles/${lang === "en" ? "en" : "zh-tw"}/peer-learning.md`,
    metadata: {
      id: "peer-learning",
      lang,
      slug,
      title: lang === "en" ? "A peer feedback guide" : "同儕回饋指南",
      description: lang === "en" ? "Prepare a feedback discussion." : "準備一次回饋討論。",
      author_id: "daodao-team",
      published_at: "2026-11-13",
      topic: "teaching",
      tags: [],
      sources: [],
      cta: { kind: "beta_application", target_id: "beta-interest" },
    },
    body: "## Discuss\n\nA feedback question.",
    images: [],
    assets: {},
  });
  const zh = make("zh-TW", "peer-feedback"),
    en = make("en", "group-feedback");
  zh.metadata.updated_at = "2026-11-15";
  const data: BlogSeoDataType = {
    articles: [zh, en],
    authors: [
      {
        id: "daodao-team",
        name: { "zh-TW": "島島阿學團隊", en: "DaoDao Team" },
        bio: { "zh-TW": "編輯團隊", en: "Editorial team" },
      },
    ],
    topics: [
      { id: "teaching", name: { "zh-TW": "教學", en: "Teaching" } },
      { id: "empty-topic", name: { "zh-TW": "尚未發表", en: "Coming soon" } },
    ],
    preview: false,
  };
  return { data, zh, en };
}
describe("validated Blog search metadata", () => {
  it("uses the actual current route and stable article ID for reciprocal locale alternates", () => {
    const { data, zh, en } = fixture();
    const english = buildBlogArticleMetadata(en, data, production);
    expect(english).toMatchObject({
      title: { absolute: "A peer feedback guide | Dao Dao Journal" },
      description: "Prepare a feedback discussion.",
      alternates: {
        canonical: `${production}/en/blog/group-feedback`,
        languages: {
          "zh-TW": `${production}/blog/peer-feedback`,
          en: `${production}/en/blog/group-feedback`,
          "x-default": `${production}/blog/peer-feedback`,
        },
      },
      authors: [{ name: "DaoDao Team" }],
      openGraph: {
        type: "article",
        title: "A peer feedback guide",
        locale: "en_US",
        publishedTime: "2026-11-13",
      },
    });
    expect(buildBlogArticleMetadata(zh, data, production).alternates).toMatchObject({
      canonical: `${production}/blog/peer-feedback`,
      languages: { en: `${production}/en/blog/group-feedback` },
    });
  });
  it("never creates alternates to absent language variants", () => {
    const { data, en } = fixture();
    data.articles = [en];
    expect(buildBlogArticleMetadata(en, data, production).alternates).toEqual({
      canonical: `${production}/en/blog/group-feedback`,
      languages: { en: `${production}/en/blog/group-feedback` },
    });
  });
  it("keeps draft discovery and publication assertions out of metadata/schema/sitemap", () => {
    const { data, en } = fixture();
    data.preview = true;
    const metadata = buildBlogArticleMetadata(en, data, production);
    expect(metadata.robots).toEqual({ index: false, follow: false });
    expect(metadata.alternates).toBeUndefined();
    expect(metadata.openGraph).not.toHaveProperty("images");
    expect(buildBlogArticleJsonLd(en, data)).toEqual([]);
    expect(buildBlogSitemap(data, production)).toEqual([]);
  });
  it("retains nonproduction noindex while using approved canonical routes", () => {
    const { data, en } = fixture();
    expect(buildBlogArticleMetadata(en, data, "https://website-dev.daodao.so")).toMatchObject({
      robots: { index: false, follow: false },
      alternates: { canonical: `${production}/en/blog/group-feedback` },
    });
    expect(buildBlogSitemap(data, "https://website-dev.daodao.so")).toEqual([]);
  });
  it("emits optional cover URLs and dimensions only from actual staged public assets", () => {
    const { data, en } = fixture();
    expect(buildBlogArticleMetadata(en, data, production).openGraph).not.toHaveProperty("images");
    en.metadata.cover = { path: "images/cover.png", alt: "A discussion diagram" };
    en.images = [{ path: "images/cover.png", width: 640, height: 360 }];
    en.assets["images/cover.png"] = `/blog-images/${"a".repeat(64)}/images/cover.png`;
    expect(buildBlogArticleMetadata(en, data, production).openGraph).toHaveProperty("images", [
      {
        url: production + en.assets["images/cover.png"],
        width: 640,
        height: 360,
        alt: "A discussion diagram",
      },
    ]);
    expect(buildBlogArticleJsonLd(en, data)[0]).toHaveProperty("image", {
      "@type": "ImageObject",
      url: production + en.assets["images/cover.png"],
      width: 640,
      height: 360,
    });
    en.assets["images/cover.png"] = "data:image/png;base64,test";
    expect(buildBlogArticleMetadata(en, data, production).openGraph).not.toHaveProperty("images");
  });
  it("matches visible headline, author and original/update dates without inventing publication times", () => {
    const { data, zh, en } = fixture();
    expect(buildBlogArticleJsonLd(zh, data)).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          "@type": "BlogPosting",
          headline: "同儕回饋指南",
          description: "準備一次回饋討論。",
          inLanguage: "zh-TW",
          datePublished: "2026-11-13",
          dateModified: "2026-11-15",
          author: { "@type": "Organization", name: "島島阿學團隊" },
        }),
        expect.objectContaining({
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "Journal", item: `${production}/blog` },
            {
              "@type": "ListItem",
              position: 2,
              name: "同儕回饋指南",
              item: `${production}/blog/peer-feedback`,
            },
          ],
        }),
      ])
    );
    expect(buildBlogArticleJsonLd(en, data)[0]).not.toHaveProperty("dateModified");
  });
  it("does not guess a person's or organization's type from an unfamiliar author name", () => {
    const { data, en } = fixture();
    en.metadata.author_id = "guest";
    data.authors = [
      {
        id: "guest",
        name: { "zh-TW": "作者", en: "Guest author" },
        bio: { "zh-TW": "作者簡介", en: "Author biography" },
      },
    ];
    expect(buildBlogArticleMetadata(en, data, production).authors).toEqual([
      { name: "Guest author" },
    ]);
    expect(buildBlogArticleJsonLd(en, data)[0]).not.toHaveProperty("author");
  });
  it("keeps empty topics and empty listings noindex and out of discovery", () => {
    const { data } = fixture();
    expect(buildBlogCollectionMetadata(data, "en", production, "empty-topic")).toMatchObject({
      title: { absolute: "Coming soon | Dao Dao Journal" },
      robots: { index: false, follow: false },
    });
    expect(
      buildBlogCollectionMetadata(data, "en", production, "empty-topic").alternates
    ).toBeUndefined();
    data.articles = [];
    expect(buildBlogCollectionMetadata(data, "zh-TW", production).robots).toEqual({
      index: false,
      follow: false,
    });
    expect(buildBlogSitemap(data, production)).toEqual([]);
  });
  it("adds only populated routes and uses real content dates and matching alternates in sitemap", () => {
    const { data } = fixture();
    const sitemap = buildBlogSitemap(data, production);
    expect(sitemap.map((row) => row.url)).toEqual([
      `${production}/blog`,
      `${production}/blog/peer-feedback`,
      `${production}/blog/topic/teaching`,
      `${production}/en/blog`,
      `${production}/en/blog/group-feedback`,
      `${production}/en/blog/topic/teaching`,
    ]);
    expect(sitemap.find((row) => row.url === `${production}/blog`)).toMatchObject({
      lastModified: "2026-11-15",
    });
    expect(sitemap.find((row) => row.url === `${production}/en/blog/group-feedback`)).toMatchObject(
      {
        lastModified: "2026-11-13",
        alternates: {
          languages: {
            "zh-TW": `${production}/blog/peer-feedback`,
            en: `${production}/en/blog/group-feedback`,
          },
        },
      }
    );
    expect(sitemap.some((row) => row.url.includes("empty-topic"))).toBe(false);
  });
  it("preserves existing main-site rows and avoids duplicate Blog URLs", () => {
    const { data } = fixture();
    const combined = mergeWebsiteSitemap(
      [{ url: `${production}/about` }, { url: `${production}/blog` }],
      buildBlogSitemap(data, production)
    );
    expect(combined.filter((row) => row.url === `${production}/blog`)).toHaveLength(1);
    expect(combined).toContainEqual({ url: `${production}/about` });
  });
  it("renders closing-script payloads as JSON data without creating executable markup", () => {
    const value = { headline: "</script><script>unsafe()</script>" };
    const encoded = serializeBlogJsonLd(value);
    expect(encoded).not.toContain("<");
    expect(JSON.parse(encoded)).toEqual(value);
    const html = renderToStaticMarkup(createElement(BlogJsonLd, { data: value }));
    expect(html.match(/type="application\/ld\+json"/g) || []).toHaveLength(1);
    expect(html).not.toContain("<script>unsafe");
    expect(html).toContain("\\u003c/script>");
    expect(() => serializeBlogJsonLd(undefined)).toThrow("serializable");
  });
});
