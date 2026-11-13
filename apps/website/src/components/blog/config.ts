import { getEnv } from "@daodao/config";
import type { BlogSourceOptionsType } from "./source";
export function configuredBlogSource(): BlogSourceOptionsType {
  return {
    directory: getEnv("BLOG_CONTENT_DIR"),
    mode: getEnv("BLOG_CONTENT_MODE", "publish"),
    origin: getEnv("NEXT_PUBLIC_WEBSITE_URL"),
    approvalsFile: getEnv("BLOG_APPROVALS_FILE"),
    baselineFile: getEnv("BLOG_PUBLISHED_BASELINE_FILE"),
  };
}
