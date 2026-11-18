import { buildWebsiteRobots } from "@daodao/shared/lib/website-seo";
import type { MetadataRoute } from "next";

export const dynamic = "force-static";

export default function robots(): MetadataRoute.Robots {
  return buildWebsiteRobots(process.env.NEXT_PUBLIC_WEBSITE_URL);
}
