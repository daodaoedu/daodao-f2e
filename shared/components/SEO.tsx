import React from 'react';
import Head from 'next/head';
import type { WithContext, Thing, Graph } from 'schema-dts';

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

export default function SEO<T extends Thing = Thing>({
  data,
}: SEOProps<T>) {
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
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
      )}
    </Head>
  );
}
