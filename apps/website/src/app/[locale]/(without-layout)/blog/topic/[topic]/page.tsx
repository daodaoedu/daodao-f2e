import { getEnv } from "@daodao/config";
import { notFound } from "next/navigation";
import { loadBlog } from "@/components/blog/content";
import { blogLocale } from "@/components/blog/copy";
import { BlogList } from "@/components/blog/pages";
import { buildBlogCollectionMetadata } from "@/components/blog/seo";
export const dynamicParams = false;
export async function generateStaticParams() {
  const data = await loadBlog();
  return data.topics.flatMap((topic) =>
    ["zh-TW", "en"].map((locale) => ({ locale, topic: topic.id }))
  );
}
export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; topic: string }>;
}) {
  const { locale, topic } = await params;
  const data = await loadBlog();
  if (!data.topics.some((t) => t.id === topic)) notFound();
  return buildBlogCollectionMetadata(
    data,
    blogLocale(locale),
    getEnv("NEXT_PUBLIC_WEBSITE_URL"),
    topic
  );
}
export default async function Page({
  params,
}: {
  params: Promise<{ locale: string; topic: string }>;
}) {
  const { locale, topic } = await params;
  const data = await loadBlog();
  if (!data.topics.some((t) => t.id === topic)) notFound();
  return <BlogList locale={blogLocale(locale)} topic={topic} />;
}
