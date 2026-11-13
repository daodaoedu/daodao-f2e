import { lstat, mkdir, mkdtemp, realpath, rename, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import {
  approvalSchema,
  authorsSchema,
  baselineSchema,
  readPrivateJson,
  readRepositoryFile,
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
  evidenceRoot?: string;
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
  if ((options.approvalsFile || options.baselineFile) && !options.evidenceRoot)
    throw new Error("Private evidence requires trusted BLOG_EVIDENCE_ROOT configuration");
  const approvals = options.approvalsFile
    ? approvalSchema.parse(await readPrivateJson(options.evidenceRoot || "", options.approvalsFile))
    : [];
  const publishedBaseline = options.baselineFile
    ? baselineSchema.parse(await readPrivateJson(options.evidenceRoot || "", options.baselineFile))
    : undefined;
  const result = await validateRepository(root, { mode, approvals, publishedBaseline });
  if (!result.ok) throw new Error(`Invalid Blog content: ${JSON.stringify(result.errors)}`);
  const authors = authorsSchema.parse(
    JSON.parse((await readRepositoryFile(root, "authors.json")).toString("utf8"))
  );
  const topics = topicsSchema.parse(
    JSON.parse((await readRepositoryFile(root, "topics.json")).toString("utf8"))
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
/** Prebuild owns this generated directory; public deployments serve the separately built out/. */
export async function stageBlogAssets(source: BlogSourceType, publicDirectory: string) {
  await mkdir(publicDirectory, { recursive: true });
  const work = await mkdtemp(path.join(path.dirname(publicDirectory), ".blog-images-stage-"));
  const next = path.join(work, "next");
  const previous = path.join(work, "previous");
  const destination = path.join(publicDirectory, "blog-images");
  const staged = new Set<string>();
  let phase: "staging" | "backed-up" | "committed" = "staging";
  try {
    await mkdir(next);
    if (!source.preview && source.root) {
      for (const article of source.articles)
        for (const image of article.images) {
          const url = publishedImagePath(source, article.metadata.id, image.path);
          if (staged.has(url)) continue;
          const target = path.join(next, url.slice("/blog-images/".length));
          await mkdir(path.dirname(target), { recursive: true });
          await writeFile(target, await readRepositoryFile(source.root, image.path));
          staged.add(url);
        }
    }
    let existing = false;
    try {
      const current = await lstat(destination);
      if (!current.isDirectory()) throw new Error("Managed Blog image output must be a directory");
      existing = true;
    } catch (error) {
      if (!(error instanceof Error && "code" in error && error.code === "ENOENT")) throw error;
    }
    if (existing) {
      await rename(destination, previous);
      phase = "backed-up";
    }
    try {
      await rename(next, destination);
      phase = "committed";
    } catch (error) {
      if (phase === "backed-up") {
        await rename(previous, destination);
        phase = "staging";
      }
      throw error;
    }
    return [...staged].sort();
  } finally {
    // If rollback itself fails, retain the previous directory for recovery outside public/.
    if (phase !== "backed-up") await rm(work, { recursive: true, force: true });
  }
}
