import { loadBlog } from "@/components/blog/content";
import { blogLocale } from "@/components/blog/copy";
import { BlogList } from "@/components/blog/pages";
export async function generateMetadata() {
  const data = await loadBlog();
  return { title: "Journal", ...(data.preview ? { robots: { index: false, follow: false } } : {}) };
}
export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  return <BlogList locale={blogLocale(locale)} />;
}
