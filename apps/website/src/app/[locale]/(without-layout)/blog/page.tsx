import { getEnv } from "@daodao/config";
import { loadBlog } from "@/components/blog/content";
import { blogLocale } from "@/components/blog/copy";
import { BlogList } from "@/components/blog/pages";
import { buildBlogCollectionMetadata } from "@/components/blog/seo";
export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  return buildBlogCollectionMetadata(
    await loadBlog(),
    blogLocale(locale),
    getEnv("NEXT_PUBLIC_WEBSITE_URL")
  );
}
export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  return <BlogList locale={blogLocale(locale)} />;
}
