import { copyFile, mkdir, readFile, realpath } from "node:fs/promises";
import path from "node:path";
import {
  approvalSchema,
  authorsSchema,
  baselineSchema,
  topicsSchema,
  type ValidatedArticleType,
  validateRepository,
} from "@daodao/blog-content";
import { assertPreviewOrigin } from "./policy";
export type BlogSourceOptionsType = {
  directory?: string;
  mode?: string;
  origin?: string;
  approvalsFile?: string;
  baselineFile?: string;
};
export type BlogSourceType = {
  root: string | null;
  articles: ValidatedArticleType[];
  authors: ReturnType<typeof authorsSchema.parse>;
  topics: ReturnType<typeof topicsSchema.parse>;
  preview: boolean;
  digests: Record<string, string>;
};
export async function readBlogSource(options: BlogSourceOptionsType): Promise<BlogSourceType> {
  const mode = options.mode ?? "publish";
  if (mode !== "publish" && mode !== "draft") throw new Error("Unknown BLOG_CONTENT_MODE");
  if (!options.directory)
    return { root: null, articles: [], authors: [], topics: [], preview: false, digests: {} };
  assertPreviewOrigin(mode, options.origin || "");
  const root = await realpath(options.directory);
  if (mode === "publish" && !options.approvalsFile)
    throw new Error("Published Blog requires private approval evidence");
  if (options.approvalsFile) {
    const relative = path.relative(root, await realpath(options.approvalsFile));
    if (relative !== ".." && !relative.startsWith(`..${path.sep}`) && !path.isAbsolute(relative))
      throw new Error("Approval evidence must be outside content root");
  }
  const approvals = options.approvalsFile
    ? approvalSchema.parse(JSON.parse(await readFile(options.approvalsFile, "utf8")))
    : [];
  const publishedBaseline = options.baselineFile
    ? baselineSchema.parse(JSON.parse(await readFile(options.baselineFile, "utf8")))
    : undefined;
  const result = await validateRepository(root, { mode, approvals, publishedBaseline });
  if (!result.ok) throw new Error(`Invalid Blog content: ${JSON.stringify(result.errors)}`);
  const authors = authorsSchema.parse(
    JSON.parse(await readFile(path.join(root, "authors.json"), "utf8"))
  );
  const topics = topicsSchema.parse(
    JSON.parse(await readFile(path.join(root, "topics.json"), "utf8"))
  );
  return {
    root,
    articles: result.articles,
    authors,
    topics,
    preview: mode === "draft",
    digests: result.digests,
  };
}
export function publishedImagePath(source: BlogSourceType, id: string, image: string) {
  const digest = source.digests[id];
  if (!digest) throw new Error(`No validated content digest for ${id}`);
  return `/blog-images/${digest}/${image}`;
}
export async function stageBlogAssets(source: BlogSourceType, publicDirectory: string) {
  const staged = new Set<string>();
  if (source.preview || !source.root) return [];
  for (const article of source.articles)
    for (const image of article.images) {
      const url = publishedImagePath(source, article.metadata.id, image.path);
      if (staged.has(url)) continue;
      const destination = path.join(publicDirectory, url);
      await mkdir(path.dirname(destination), { recursive: true });
      await copyFile(path.join(source.root, image.path), destination);
      staged.add(url);
    }
  return [...staged].sort();
}
