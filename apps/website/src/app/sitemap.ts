import { buildWebsiteSitemap } from "@daodao/shared/lib/website-seo";
import type { MetadataRoute } from "next";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  return buildWebsiteSitemap(process.env.NEXT_PUBLIC_WEBSITE_URL);
}
