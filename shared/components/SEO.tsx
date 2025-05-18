import React from 'react';
import Head from 'next/head';
import type { WithContext, Thing, Graph } from 'schema-dts';

/**
 * Schema.org 常用類型參考指南
 * @see https://support.google.com/webmasters/answer/9012289#enhancements&zippy=%2C強化項目-amp複合式搜尋結果
 *
 * ---
 *
 * 1. 內容與創意作品類型 (CreativeWork)
 *
 * | 類型 | 說明 |
 * | ---- | ---- |
 * | Article | 文章、新聞內容 |
 * | BlogPosting | 部落格文章 |
 * | WebPage | 網頁內容 |
 * | Course | 課程內容 |
 * | Tutorial | 教程 |
 * | Book | 書籍 |
 * | Review | 評論 |
 * | VideoObject | 影片 |
 * | AudioObject | 音頻 |
 *
 * 2. 事件類型 (Event)
 *
 * | 類型 | 說明 |
 * | ---- | ---- |
 * | Event | 基本事件 |
 * | CourseInstance | 課程實例 |
 * | EducationEvent | 教育相關事件 |
 * | BusinessEvent | 商業事件 |
 * | SocialEvent | 社交活動 |
 *
 * 3. 組織與商業類型 (Organization)
 *
 * | 類型 | 說明 |
 * | ---- | ---- |
 * | Organization | 組織機構 |
 * | LocalBusiness | 本地商家 |
 * | Store | 商店 |
 * | School | 學校 |
 * | Corporation | 企業 |
 *
 * 4. 人物類型 (Person)
 *
 * | 類型 | 說明 |
 * | ---- | ---- |
 * | Person | 人物信息 |
 *
 * 5. 地點類型 (Place)
 *
 * | 類型 | 說明 |
 * | ---- | ---- |
 * | Place | 地點 |
 * | LocalBusiness | 可同時作為地點和組織 |
 *
 * 6. 產品與服務類型 (Product)
 *
 * | 類型 | 說明 |
 * | ---- | ---- |
 * | Product | 產品 |
 * | Offer | 商品報價 |
 * | Service | 服務 |
 *
 * 7. 集合類型 (Collection)
 *
 * | 類型 | 說明 |
 * | ---- | ---- |
 * | ItemList | 項目列表 |
 * | BreadcrumbList | 麵包屑導航 |
 * | FAQPage | 常見問題解答頁面 |
 * | CollectionPage | 收藏頁面 |
 * | SearchResultsPage | 搜索結果頁面 |
 *
 * 8. 特殊用途類型 (Special)
 *
 * | 類型 | 說明 |
 * | ---- | ---- |
 * | WebSite | 整個網站的信息 |
 * | SoftwareApplication | 軟件應用 |
 * | HowTo | 操作指南 |
 * | Question | 問題 |
 * | Answer | 回答 |
 */
export type SEODataType<T extends Thing = Thing> = {
  title: string;
  description?: string;
  keywords?: string;
  author?: string;
  copyright?: string;
  imgLink?: string;
  link?: string;
  structuredData?: WithContext<T> | Graph;
  themeColor?: string;
};

interface SEOProps<T extends Thing = Thing> {
  data: SEODataType<T>;
}

export default function SEO<T extends Thing = Thing>({ data }: SEOProps<T>) {
  const {
    title,
    description,
    keywords,
    author,
    copyright,
    imgLink,
    link,
    structuredData,
    themeColor = '#16b9b3',
  } = data;

  return (
    <Head>
      <title>{title}</title>
      <meta itemProp="name" content={title} />
      <link rel="shortcut icon" href="/favicon.png" />
      <link rel="apple-touch-icon" href="/favicon.png" />
      <link rel="mask-icon" href="/favicon.png" color="#5bbad5" />
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
      {imgLink && <meta property="og:image:width" content="1200" />}
      {imgLink && <meta property="og:image:height" content="630" />}

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

      {structuredData && (
        <script
          key="ld+JSON"
          type="application/ld+json"
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(structuredData, null, 2),
          }}
        />
      )}
    </Head>
  );
}
