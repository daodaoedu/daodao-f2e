import { isProductionWebsite, PRODUCTION_WEBSITE_URL } from "@daodao/shared/lib/website-seo";
import type { Metadata, MetadataRoute } from "next";
import type { BlogArticleType, loadBlog } from "./content";
import { type BlogLocaleType, blogCopy, blogPath } from "./copy";
export type BlogSeoDataType = Awaited<ReturnType<typeof loadBlog>>;
const locales: BlogLocaleType[] = ["zh-TW", "en"];
const siteName = "Dao Dao Journal";
function absolute(path: string) {
  return `${PRODUCTION_WEBSITE_URL}${path}`;
}
function localeCode(locale: BlogLocaleType) {
  return locale === "en" ? "en_US" : "zh_TW";
}
function languageUrls(articles: BlogArticleType[]) {
  const languages: Record<string, string> = {};
  for (const locale of locales) {
    const article = articles.find((a) => a.metadata.lang === locale);
    if (article) languages[locale] = absolute(blogPath(locale, article.metadata.slug));
  }
  if (languages["zh-TW"]) languages["x-default"] = languages["zh-TW"];
  return languages;
}
function publicCover(article: BlogArticleType) {
  const cover = article.metadata.cover;
  if (!cover) return;
  const image = article.images.find((i) => i.path === cover.path);
  const relative = article.assets[cover.path];
  if (!image || !relative?.startsWith("/blog-images/")) return;
  const url = new URL(relative, PRODUCTION_WEBSITE_URL);
  if (url.origin !== PRODUCTION_WEBSITE_URL || !url.pathname.startsWith("/blog-images/")) return;
  return { url: url.href, width: image.width, height: image.height, alt: cover.alt };
}
export function buildBlogArticleMetadata(
  article: BlogArticleType,
  data: BlogSeoDataType,
  websiteUrl: string | undefined
): Metadata {
  const m = article.metadata;
  const canonical = absolute(blogPath(m.lang, m.slug));
  const author = data.authors.find((a) => a.id === m.author_id);
  const variants = data.articles.filter((a) => a.metadata.id === m.id);
  const languages = languageUrls(variants);
  const image = data.preview ? undefined : publicCover(article);
  const noindex = data.preview || !isProductionWebsite(websiteUrl);
  return {
    title: { absolute: `${m.title} | ${siteName}` },
    description: m.description,
    authors: author ? [{ name: author.name[m.lang] }] : undefined,
    publisher: "Dao Dao",
    robots: noindex ? { index: false, follow: false } : undefined,
    alternates: data.preview ? undefined : { canonical, languages },
    openGraph: {
      type: "article",
      title: m.title,
      description: m.description,
      siteName,
      locale: localeCode(m.lang),
      alternateLocale: variants
        .filter((a) => a.metadata.lang !== m.lang)
        .map((a) => localeCode(a.metadata.lang)),
      url: data.preview ? undefined : canonical,
      publishedTime: data.preview ? undefined : m.published_at,
      modifiedTime: data.preview ? undefined : m.updated_at,
      ...(image ? { images: [image] } : {}),
    },
    twitter: {
      card: image ? "summary_large_image" : "summary",
      title: m.title,
      description: m.description,
      ...(image ? { images: [image.url] } : {}),
    },
  };
}
function collectionArticles(data: BlogSeoDataType, locale: BlogLocaleType, topic?: string) {
  return data.articles.filter(
    (a) => a.metadata.lang === locale && (!topic || a.metadata.topic === topic)
  );
}
export function buildBlogCollectionMetadata(
  data: BlogSeoDataType,
  locale: BlogLocaleType,
  websiteUrl: string | undefined,
  topic?: string
): Metadata {
  const copy = blogCopy[locale];
  const topicName = topic ? data.topics.find((t) => t.id === topic)?.name[locale] : undefined;
  const title = topicName || copy.title;
  const description = topicName ? `${topicName} · ${copy.intro}` : copy.intro;
  const path = `${blogPath(locale)}${topic ? `/topic/${topic}` : ""}`;
  const articles = collectionArticles(data, locale, topic);
  const discoverable = !data.preview && articles.length > 0;
  const languages: Record<string, string> = {};
  for (const lang of locales)
    if (collectionArticles(data, lang, topic).length > 0)
      languages[lang] = absolute(`${blogPath(lang)}${topic ? `/topic/${topic}` : ""}`);
  if (languages["zh-TW"]) languages["x-default"] = languages["zh-TW"];
  return {
    title: { absolute: `${title} | ${siteName}` },
    description,
    robots:
      !discoverable || !isProductionWebsite(websiteUrl)
        ? { index: false, follow: false }
        : undefined,
    alternates: discoverable ? { canonical: absolute(path), languages } : undefined,
    openGraph: {
      type: "website",
      title,
      description,
      siteName,
      locale: localeCode(locale),
      url: discoverable ? absolute(path) : undefined,
    },
  };
}
export function buildBlogArticleJsonLd(article: BlogArticleType, data: BlogSeoDataType) {
  if (data.preview) return [];
  const m = article.metadata;
  const canonical = absolute(blogPath(m.lang, m.slug));
  const author = data.authors.find((a) => a.id === m.author_id);
  const image = publicCover(article);
  return [
    {
      "@context": "https://schema.org",
      "@type": "BlogPosting",
      "@id": `${canonical}#article`,
      headline: m.title,
      description: m.description,
      inLanguage: m.lang,
      mainEntityOfPage: canonical,
      datePublished: m.published_at,
      ...(m.updated_at ? { dateModified: m.updated_at } : {}),
      ...(author?.id === "daodao-team"
        ? { author: { "@type": "Organization", name: author.name[m.lang] } }
        : {}),
      publisher: {
        "@type": "Organization",
        name: "Dao Dao",
        url: PRODUCTION_WEBSITE_URL,
        logo: {
          "@type": "ImageObject",
          url: absolute(`/assets/blog/${m.lang === "en" ? "en" : "zh"}-light.svg`),
        },
      },
      ...(image
        ? {
            image: {
              "@type": "ImageObject",
              url: image.url,
              width: image.width,
              height: image.height,
            },
          }
        : {}),
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Journal", item: absolute(blogPath(m.lang)) },
        { "@type": "ListItem", position: 2, name: m.title, item: canonical },
      ],
    },
  ];
}
export function serializeBlogJsonLd(value: unknown) {
  const serialized = JSON.stringify(value);
  if (serialized === undefined) throw new Error("JSON-LD must be serializable");
  return serialized.replace(/</g, "\\u003c");
}
function latestDate(articles: BlogArticleType[]) {
  return articles
    .map((a) => a.metadata.updated_at || a.metadata.published_at)
    .sort((a, b) => a.localeCompare(b, "en"))
    .at(-1);
}
function collectionSitemapPath(locale: BlogLocaleType, topic?: string) {
  const base = blogPath(locale);
  return topic ? `${base}/topic/${topic}` : base;
}
function collectionSitemapRows(data: BlogSeoDataType, topic?: string): MetadataRoute.Sitemap {
  const languages: Record<string, string> = {};
  for (const locale of locales)
    if (collectionArticles(data, locale, topic).length)
      languages[locale] = absolute(collectionSitemapPath(locale, topic));
  if (languages["zh-TW"]) languages["x-default"] = languages["zh-TW"];
  const rows: MetadataRoute.Sitemap = [];
  for (const locale of locales) {
    const articles = collectionArticles(data, locale, topic);
    if (articles.length)
      rows.push({
        url: absolute(collectionSitemapPath(locale, topic)),
        lastModified: latestDate(articles),
        alternates: { languages },
      });
  }
  return rows;
}
export function buildBlogSitemap(
  data: BlogSeoDataType,
  websiteUrl: string | undefined
): MetadataRoute.Sitemap {
  if (data.preview || !isProductionWebsite(websiteUrl) || !data.articles.length) return [];
  const rows = collectionSitemapRows(data);
  for (const article of data.articles)
    rows.push({
      url: absolute(blogPath(article.metadata.lang, article.metadata.slug)),
      lastModified: article.metadata.updated_at || article.metadata.published_at,
      alternates: {
        languages: languageUrls(data.articles.filter((a) => a.metadata.id === article.metadata.id)),
      },
    });
  for (const topic of data.topics) rows.push(...collectionSitemapRows(data, topic.id));
  return rows.sort((a, b) => {
    if (a.url === b.url) return 0;
    return a.url < b.url ? -1 : 1;
  });
}
export function mergeWebsiteSitemap(base: MetadataRoute.Sitemap, blog: MetadataRoute.Sitemap) {
  return [...new Map([...base, ...blog].map((row) => [row.url, row])).values()];
}
