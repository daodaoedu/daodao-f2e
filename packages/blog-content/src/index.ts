import { createHash } from "node:crypto";
import { lstat, readdir, readFile, realpath } from "node:fs/promises";
import path from "node:path";
import { imageSize } from "image-size";
import type { Nodes } from "mdast";
import { fromMarkdown } from "mdast-util-from-markdown";
import { parseDocument } from "yaml";
import { z } from "zod";
import { getArticleHeadings } from "./markdown";
import {
  type ApprovalType,
  type ArticleType,
  approvalSchema,
  articleSchema,
  authorsSchema,
  baselineSchema,
  ctaTargets,
  topicsSchema,
  webUrlSchema,
} from "./schema";

export * from "./markdown";
export * from "./schema";

export type ValidationIssueType = { file: string; message: string };
export type ValidatedArticleType = {
  file: string;
  metadata: ArticleType;
  body: string;
  images: { path: string; width: number; height: number }[];
};
export type ValidationResultType = {
  ok: boolean;
  mode: "draft" | "publish";
  articles: ValidatedArticleType[];
  digests: Record<string, string>;
  errors: ValidationIssueType[];
};
export type ValidationOptionsType = {
  mode?: "draft" | "publish";
  /** Human approval evidence is private input, never loaded from the public content root. */
  approvals?: ApprovalType[];
  /** Prior published dates supplied by the pinned published manifest, not the draft itself. */
  publishedBaseline?: Record<
    string,
    { published_at: string; slugs: { "zh-TW": string; en: string } }
  >;
};

function isWithin(root: string, file: string) {
  const relative = path.relative(root, file);
  return relative !== ".." && !relative.startsWith(`..${path.sep}`) && !path.isAbsolute(relative);
}
async function readConfined(root: string, relative: string) {
  const file = path.resolve(root, relative);
  if (
    !isWithin(root, file) ||
    !(await lstat(file)).isFile() ||
    !isWithin(root, await realpath(file))
  ) {
    throw new Error(`Expected a regular file inside content root: ${relative}`);
  }
  return readFile(file);
}
async function markdownFiles(root: string, directory = "articles"): Promise<string[]> {
  const files: string[] = [];
  for (const entry of await readdir(path.join(root, directory), { withFileTypes: true })) {
    const file = `${directory}/${entry.name}`;
    if (entry.isSymbolicLink()) throw new Error(`Symlinks are not allowed: ${file}`);
    if (entry.isDirectory()) files.push(...(await markdownFiles(root, file)));
    else if (entry.isFile() && entry.name.endsWith(".md")) files.push(file);
    else throw new Error(`Only Markdown files are allowed in articles/: ${file}`);
  }
  return files.sort();
}
function walk(node: Nodes, callback: (node: Nodes) => void) {
  callback(node);
  if ("children" in node) for (const child of node.children) walk(child, callback);
}
function parseArticle(source: string) {
  const match = /^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)([\s\S]*)$/.exec(source);
  if (!match?.[1] || !match[2]?.trim())
    throw new Error("Expected YAML frontmatter and a nonempty Markdown body");
  const document = parseDocument(match[1], {
    schema: "core",
    uniqueKeys: true,
    resolveKnownTags: false,
  });
  if (document.errors.length || document.warnings.length) {
    throw new Error(
      [...document.errors, ...document.warnings].map((error) => error.message).join("; ")
    );
  }
  const metadata = articleSchema.parse(document.toJS({ maxAliasCount: 0 }));
  return { metadata, body: match[2] };
}
function bodyReferences(body: string) {
  const root = fromMarkdown(body);
  const definitions = new Map<string, string>();
  const images: string[] = [];
  const links: string[] = [];
  const internalLinks: string[] = [];
  walk(root, (node) => {
    if (node.type === "definition") {
      if (definitions.has(node.identifier))
        throw new Error(`Duplicate Markdown definition: ${node.identifier}`);
      definitions.set(node.identifier, node.url);
    }
  });
  walk(root, (node) => {
    if (node.type === "html")
      throw new Error("Raw HTML is not supported; use Markdown links and images");
    if (node.type === "image" || node.type === "imageReference") {
      if (!node.alt?.trim()) throw new Error("Images require nonempty alt text");
      const url = node.type === "image" ? node.url : definitions.get(node.identifier);
      if (!url) throw new Error("Image reference has no definition");
      images.push(url);
    }
    if (node.type === "link" || node.type === "linkReference") {
      const url = node.type === "link" ? node.url : definitions.get(node.identifier);
      if (!url) throw new Error("Link reference has no definition");
      if (url.startsWith("#") || (url.startsWith("/") && !url.startsWith("//"))) {
        internalLinks.push(url);
      } else {
        webUrlSchema.parse(url);
        if (new URL(url).hostname === "daodao.so") internalLinks.push(url);
        else links.push(url);
      }
    }
  });
  return { images, links, internalLinks };
}

/** Read-only validation. A valid draft is never proof of human approval or deployment. */
export async function validateRepository(
  rootPath: string,
  options: ValidationOptionsType = {}
): Promise<ValidationResultType> {
  const modeResult = z.enum(["draft", "publish"]).safeParse(options.mode ?? "publish");
  if (!modeResult.success)
    return {
      ok: false,
      mode: "publish",
      articles: [],
      digests: {},
      errors: [{ file: rootPath, message: "Unknown validation mode" }],
    };
  const mode = modeResult.data;
  const result: ValidationResultType = { ok: false, mode, articles: [], digests: {}, errors: [] };
  const fail = (file: string, error: unknown) =>
    result.errors.push({ file, message: error instanceof Error ? error.message : String(error) });
  let sourceFile = rootPath;
  try {
    const root = await realpath(rootPath);
    sourceFile = "authors.json";
    const authorBytes = await readConfined(root, "authors.json");
    const authors = authorsSchema.parse(JSON.parse(authorBytes.toString("utf8")));
    const authorIds = new Set(authors.map((author) => author.id));
    if (authorIds.size !== authors.length)
      throw new Error("authors.json contains duplicate author ids");
    sourceFile = "topics.json";
    const topicBytes = await readConfined(root, "topics.json");
    const topics = topicsSchema.parse(JSON.parse(topicBytes.toString("utf8")));
    const topicIds = new Set(topics.map((topic) => topic.id));
    if (topicIds.size !== topics.length)
      throw new Error("topics.json contains duplicate topic ids");
    sourceFile = "publishedBaseline";
    const baseline = baselineSchema.parse(options.publishedBaseline ?? {});
    sourceFile = "approvalEvidence";
    const approvals = approvalSchema.parse(options.approvals ?? []);
    const approvalIds = new Set(approvals.map((approval) => approval.id));
    if (approvalIds.size !== approvals.length) throw new Error("Duplicate approval ids");
    const pairs = new Map<
      string,
      { article: ValidatedArticleType; bytes: Buffer; assets: Map<string, Buffer> }[]
    >();
    const routes = new Set<string>();
    const languages = new Set<string>();
    sourceFile = "articles/";
    const files = await markdownFiles(root);
    if (!files.length)
      throw new Error("articles/ must contain at least one bilingual article pair");
    for (const file of files) {
      try {
        const bytes = await readConfined(root, file);
        const { metadata, body } = parseArticle(bytes.toString("utf8"));
        if (file !== `articles/${metadata.lang === "zh-TW" ? "zh-tw" : "en"}/${metadata.id}.md`)
          throw new Error("Expected articles/<zh-tw|en>/<id>.md matching frontmatter");
        const route = `${metadata.lang}/${metadata.slug}`;
        const identity = `${metadata.id}/${metadata.lang}`;
        if (routes.has(route)) throw new Error(`Duplicate locale/slug: ${route}`);
        if (languages.has(identity)) throw new Error(`Duplicate article id/language: ${identity}`);
        routes.add(route);
        languages.add(identity);
        if (!authorIds.has(metadata.author_id))
          throw new Error(`Unknown author_id: ${metadata.author_id}`);
        if (!topicIds.has(metadata.topic)) throw new Error(`Unknown topic: ${metadata.topic}`);
        const published = Object.hasOwn(baseline, metadata.id) ? baseline[metadata.id] : undefined;
        if (published && published.published_at !== metadata.published_at)
          throw new Error("published_at differs from the published baseline");
        if (published && published.slugs[metadata.lang] !== metadata.slug)
          throw new Error("slug differs from the published baseline");
        const assets = new Map<string, Buffer>();
        const imageMetadata: ValidatedArticleType["images"] = [];
        const { images, links } = bodyReferences(body);
        const sourceLinks = new Set(
          links.filter((link) => link !== ctaTargets[metadata.cta.target_id])
        );
        if (
          metadata.sources.some((url) => !sourceLinks.has(url)) ||
          [...sourceLinks].some((url) => !metadata.sources.includes(url))
        )
          throw new Error(
            "Body external links and frontmatter sources must match (excluding primary CTA)"
          );
        if (metadata.cover) images.push(metadata.cover.path);
        for (const image of images) {
          if (
            !/^images\/[a-zA-Z0-9/_-]+\.(png|jpe?g|webp|avif|gif)$/.test(image) ||
            image.split("/").includes("..")
          ) {
            throw new Error(`Image must use a local images/ raster path: ${image}`);
          }
          const absolute = path.resolve(root, image);
          const imageRoot = path.resolve(root, "images");
          if (!isWithin(imageRoot, await realpath(absolute)))
            throw new Error(`Image escapes images/: ${image}`);
          const imageBytes = await readConfined(root, image);
          const dimensions = imageSize(imageBytes);
          const expectedType = path.extname(image).slice(1).replace("jpeg", "jpg");
          if (dimensions.type !== expectedType)
            throw new Error(`Image format does not match extension: ${image}`);
          if (!dimensions.width || !dimensions.height)
            throw new Error(`Invalid image dimensions: ${image}`);
          if (!imageMetadata.some((item) => item.path === image))
            imageMetadata.push({ path: image, width: dimensions.width, height: dimensions.height });
          assets.set(image, imageBytes);
        }
        const article = { file, metadata, body, images: imageMetadata };
        result.articles.push(article);
        const pair = pairs.get(metadata.id) ?? [];
        pair.push({ article, bytes, assets });
        pairs.set(metadata.id, pair);
      } catch (error) {
        fail(file, error);
      }
    }
    const articleRoutes = new Map(
      result.articles.map((article) => [
        `${article.metadata.lang === "en" ? "/en" : ""}/blog/${article.metadata.slug}`,
        article,
      ])
    );
    const sitePaths = [
      "",
      "/about",
      "/quiz",
      "/action-maker",
      "/learning-marathons/2025S1",
      "/terms/ipr",
      "/terms/service",
      "/terms/privacy-policy",
    ];
    const knownPages = new Set(sitePaths.flatMap((route) => [route || "/", `/en${route}`]));
    for (const article of result.articles) {
      const currentRoute = `${article.metadata.lang === "en" ? "/en" : ""}/blog/${article.metadata.slug}`;
      for (const link of bodyReferences(article.body).internalLinks) {
        try {
          const url = new URL(link, `https://daodao.so${currentRoute}`);
          if (url.origin !== "https://daodao.so") throw new Error(`Unsafe internal link: ${link}`);
          const targetPath = decodeURIComponent(url.pathname).replace(/\/$/, "") || "/";
          const target = articleRoutes.get(targetPath);
          const isBlog = /^\/(?:en\/)?blog(?:\/|$)/.test(targetPath);
          if (
            !target &&
            targetPath !== "/blog" &&
            targetPath !== "/en/blog" &&
            !knownPages.has(targetPath)
          ) {
            throw new Error(`Unresolved internal link: ${link}`);
          }
          if (url.hash && isBlog) {
            const fragment = decodeURIComponent(url.hash.slice(1));
            if (
              !target ||
              !getArticleHeadings(target.body).some((heading) => heading.id === fragment)
            ) {
              throw new Error(`Unresolved article fragment: ${link}`);
            }
          }
        } catch (error) {
          fail(article.file, error);
        }
      }
    }
    for (const [id, entries] of pairs) {
      if (
        entries.length !== 2 ||
        new Set(entries.map((entry) => entry.article.metadata.lang)).size !== 2
      ) {
        fail(id, "Expected exactly one zh-TW and one en article");
        continue;
      }
      if (new Set(entries.map((entry) => entry.article.metadata.published_at)).size !== 1) {
        fail(id, "Bilingual pair must share the original published_at");
        continue;
      }
      const hash = createHash("sha256");
      const inputs = new Map<string, Buffer>([
        ["authors.json", authorBytes],
        ["topics.json", topicBytes],
      ]);
      for (const entry of entries) {
        inputs.set(entry.article.file, entry.bytes);
        for (const [name, bytes] of entry.assets) inputs.set(name, bytes);
      }
      for (const name of [...inputs.keys()].sort()) {
        const bytes = inputs.get(name);
        if (bytes)
          hash
            .update(JSON.stringify([name, bytes.length]))
            .update("\n")
            .update(bytes)
            .update("\n");
      }
      const digest = hash.digest("hex");
      result.digests[id] = digest;
      if (
        mode === "publish" &&
        !approvals.some((approval) => approval.id === id && approval.digest === digest)
      ) {
        fail(id, "Missing or stale bilingual approval digest");
      }
    }
  } catch (error) {
    fail(sourceFile, error);
  }
  result.ok = result.errors.length === 0;
  if (!result.ok) {
    result.articles = [];
    result.digests = {};
  }
  return result;
}
