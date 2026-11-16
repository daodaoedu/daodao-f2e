import { getEnv } from "@daodao/config";
import { notFound } from "next/navigation";
import { loadBlog } from "@/components/blog/content";
import { blogLocale } from "@/components/blog/copy";
import { BlogJsonLd } from "@/components/blog/json-ld";
import { BlogArticle } from "@/components/blog/pages";
import { buildBlogArticleJsonLd, buildBlogArticleMetadata } from "@/components/blog/seo";
export const dynamicParams = false;
export async function generateStaticParams() {
  const data = await loadBlog();
  // Next 15 static export rejects zero paths; this invalid content slug renders only notFound().
  if (data.articles.length === 0)
    return ["zh-TW", "en"].map((locale) => ({ locale, slug: "_empty" }));
  return data.articles.map((a) => ({ locale: a.metadata.lang, slug: a.metadata.slug }));
}
export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  const data = await loadBlog();
  const article = data.articles.find((a) => a.metadata.lang === locale && a.metadata.slug === slug);
  if (!article) notFound();
  return buildBlogArticleMetadata(article, data, getEnv("NEXT_PUBLIC_WEBSITE_URL"));
}
export default async function Page({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  const data = await loadBlog();
  const article = data.articles.find((a) => a.metadata.lang === locale && a.metadata.slug === slug);
  if (!article) notFound();
  const schema = buildBlogArticleJsonLd(article, data);
  return (
    <>
      {schema.length > 0 && <BlogJsonLd data={schema} />}
      <BlogArticle article={article} locale={blogLocale(locale)} />
    </>
  );
}
