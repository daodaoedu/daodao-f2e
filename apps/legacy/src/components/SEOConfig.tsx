"use client";

import Head from "next/head";
import type { Graph, Thing, WebSite, WithContext } from "schema-dts";
import getEnv from "@/shared/config/env";
import { usePathname } from "@/shared/i18n/navigation";

const env = getEnv();

/**
 * Schema.org 常用類型參考指南
 * @see https://support.google.com/webmasters/answer/9012289#enhancements&zippy=%2C強化項目-amp複合式搜尋結果
 *
 * 不需要每個頁面都添加 WebSite 的 jsonLd，只需針對頁面添加適合的 jsonLd
 *
 * | 類型 | 說明 |
 * | ---- | ---- |
 * | Article | 文章、新聞內容 |
 * | Course | 課程內容 |
 * | Book | 書籍 |
 * | Review | 評論 |
 * | VideoObject | 影片 |
 * | AudioObject | 音頻 |
 * | Event | 基本事件 |
 * | CourseInstance | 課程實例 |
 * | EducationEvent | 教育相關事件 |
 * | BusinessEvent | 商業事件 |
 * | SocialEvent | 社交活動 |
 * | Organization | 組織機構 |
 * | Store | 商店 |
 * | School | 學校 |
 * | Person | 人 |
 * | Place | 地點 |
 * | Product | 產品 |
 * | Offer | 商品報價 |
 * | Service | 服務 |
 * | ItemList | 項目列表 |
 * | BreadcrumbList | 麵包屑導航 |
 * | FAQPage | 常見問題解答頁面 |
 * | CollectionPage | 收藏頁面 |
 * | SearchResultsPage | 搜索結果頁面 |
 * | WebSite | 整個網站的信息 |
 * | HowTo | 操作指南 |
 * | Question | 問題 |
 * | Answer | 回答 |
 */
export type JsonLdType = WithContext<Thing> | Graph;

interface SEOProps {
  title: string;
  description?: string;
  keywords?: string | string[];
  author?: string;
  copyright?: string;
  imgLink?: string;
  imgWidth?: number;
  imgHeight?: number;
  link?: string;
  jsonLd?: WithContext<Thing> | Graph;
  themeColor?: string;
}

const defaultJsonLd: WithContext<WebSite> = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "島島阿學",
  url: env.siteUrl,
  inLanguage: "zh-TW",
};

export default function SEOConfig({
  title,
  description = "「島島阿學」盼能透過建立多元的學習資源網絡，讓自主學習者能找到合適的成長方法，進一步成為自己想成為的人，從中培養共好精神。目前正積極打造「可共編的學習資源平台」。",
  link: originLink,
  keywords: originKeywords = "島島阿學",
  author = "島島阿學",
  copyright = "島島阿學",
  imgLink = `${env.siteUrl}/assets/brand/horizontal-primary-logo.svg`,
  imgWidth = 1200,
  imgHeight = 630,
  jsonLd = defaultJsonLd,
  themeColor = "#16b9b3",
}: SEOProps) {
  const pathname = usePathname();

  const link = originLink ?? `${process.env.PROD_URL}${pathname || ""}`;

  const keywords = typeof originKeywords === "string" ? originKeywords : originKeywords?.join(", ");

  return (
    <Head>
      <title>{title}</title>
      <meta itemProp="name" content={title} />
      <link rel="shortcut icon" href="/assets/brand/favicon.png" />
      <link rel="apple-touch-icon" href="/assets/brand/favicon.png" />
      <link rel="mask-icon" href="/assets/brand/favicon.png" color="#5bbad5" />
      {link && <link rel="canonical" href={link} />}
      {author && <meta name="author" content={author} />}
      {copyright && <meta name="copyright" content={copyright} />}
      {description && <meta name="description" content={description} />}
      {imgLink && <meta name="thumbnail" content={imgLink} />}
      {keywords && <meta name="keywords" content={keywords} />}

      {/* schema.org */}
      {link && <meta itemProp="url" content={link} />}
      {author && <meta itemProp="author" content={author} />}
      {copyright && <meta itemProp="copyrightHolder" content={copyright} />}
      {description && <meta itemProp="description" content={description} />}
      {description && <meta itemProp="about" content={description} />}
      {description && <meta itemProp="abstract" content={description} />}
      {imgLink && <meta itemProp="image" content={imgLink} />}
      {keywords && <meta itemProp="keywords" content={keywords} />}

      {/* Open Graph data */}
      <meta property="og:type" content="website" />
      <meta property="og:site_name" content="島島阿學" />
      <meta property="og:title" content={title} />
      <meta property="og:ttl" content="345600" />
      <meta property="fb:app_id" content="374678340785771" />
      {description && <meta property="og:description" content={description} />}
      {link && <meta property="og:url" content={link} />}
      {imgLink && <meta property="og:image" content={imgLink} />}
      {imgLink && <meta property="og:image:width" content={imgWidth.toString()} />}
      {imgLink && <meta property="og:image:height" content={imgHeight.toString()} />}

      {/* Link relationship */}
      <link rel="author" href={link} />
      <link rel="publisher" href={link} />

      {/* Twitter Card data */}
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:site" content="@島島阿學" />
      {author && <meta name="twitter:creator" content={author} />}
      {imgLink && <meta name="twitter:card" content={imgLink} />}
      {imgLink && <meta name="twitter:image:src" content={imgLink} />}
      {imgLink && <meta name="twitter:image:alt" content="daodao logo" />}

      <meta name="theme-color" itemProp="theme-color" content={themeColor} />

      {typeof jsonLd === "object" && jsonLd && (
        <script type="application/ld+json">{JSON.stringify(jsonLd, null, 2)}</script>
      )}
    </Head>
  );
}
