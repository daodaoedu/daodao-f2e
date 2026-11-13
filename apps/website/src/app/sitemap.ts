import { getEnv } from "@daodao/config";
import { buildWebsiteSitemap } from "@daodao/shared/lib/website-seo";
import type { MetadataRoute } from "next";
import { loadBlog } from "@/components/blog/content";
import { buildBlogSitemap, mergeWebsiteSitemap } from "@/components/blog/seo";
export const dynamic = "force-static";
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const websiteUrl = getEnv("NEXT_PUBLIC_WEBSITE_URL");
  return mergeWebsiteSitemap(
    buildWebsiteSitemap(websiteUrl),
    buildBlogSitemap(await loadBlog(), websiteUrl)
  );
}
