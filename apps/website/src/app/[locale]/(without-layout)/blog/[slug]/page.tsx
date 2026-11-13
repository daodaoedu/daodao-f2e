import { notFound } from "next/navigation";
import { loadBlog } from "@/components/blog/content";
import { blogLocale } from "@/components/blog/copy";
import { BlogArticle } from "@/components/blog/pages";
export const dynamicParams = false;
export async function generateStaticParams() {
  const data = await loadBlog();
  return data.articles.map((a) => ({ locale: a.metadata.lang, slug: a.metadata.slug }));
}
export async function generateMetadata() {
  const data = await loadBlog();
  return { ...(data.preview ? { robots: { index: false, follow: false } } : {}) };
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
  return <BlogArticle article={article} locale={blogLocale(locale)} />;
}
