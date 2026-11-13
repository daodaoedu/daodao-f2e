import "server-only";
import { readFile } from "node:fs/promises";
import path from "node:path";
import type { ValidatedArticleType } from "@daodao/blog-content";
import { cache } from "react";
import { configuredBlogSource } from "./config";
import { publishedImagePath, readBlogSource } from "./source";
export type BlogArticleType = ValidatedArticleType & { assets: Record<string, string> };
export const loadBlog = cache(async () => {
  const source = await readBlogSource(configuredBlogSource());
  const articles: BlogArticleType[] = await Promise.all(
    source.articles.map(async (article) => {
      const assets: Record<string, string> = {};
      for (const image of article.images) {
        if (source.preview && source.root) {
          const ext = path.extname(image.path).slice(1).replace("jpg", "jpeg");
          assets[image.path] =
            `data:image/${ext};base64,${(await readFile(path.join(source.root, image.path))).toString("base64")}`;
        } else assets[image.path] = publishedImagePath(source, article.metadata.id, image.path);
      }
      return { ...article, assets };
    })
  );
  return { articles, authors: source.authors, topics: source.topics, preview: source.preview };
});
