import { execFileSync, spawnSync } from "node:child_process";
import { mkdir, mkdtemp, readFile, rm, symlink, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { getEnv } from "@daodao/config";
import { afterEach, describe, expect, it, vi } from "vitest";
import {
  getArticleHeadings,
  readPrivateJson,
  readRepositoryFile,
  validateRepository,
} from "../index";

const fileRace = vi.hoisted(() => ({ target: "", replacement: "" }));
vi.mock("node:fs/promises", async (importOriginal) => {
  const fs = await importOriginal<typeof import("node:fs/promises")>();
  return {
    ...fs,
    realpath: async (file: Parameters<typeof fs.realpath>[0]) => {
      const resolved = await fs.realpath(file);
      if (file === fileRace.target) {
        fileRace.target = "";
        await fs.rename(file, `${String(file)}.before-race`);
        await fs.symlink(fileRace.replacement, file);
      }
      return resolved;
    },
  };
});

const roots: string[] = [];
const authors = [
  { id: "team", name: { "zh-TW": "團隊", en: "Team" }, bio: { "zh-TW": "編輯", en: "Editors" } },
];
const topics = [{ id: "teaching", name: { "zh-TW": "教學", en: "Teaching" } }];
function article(lang: "zh-TW" | "en", overrides = "", body = "## Heading\n\nContent.") {
  return `---\nid: sample\nlang: ${lang}\nslug: ${lang === "en" ? "sample-en" : "sample"}\ntitle: Sample\ndescription: Example\nauthor_id: team\npublished_at: 2026-11-12\ntopic: teaching\ntags: []\ncta:\n  kind: beta_application\n  target_id: beta-interest\nsources: []\n${overrides}---\n${body}\n`;
}
async function fixture() {
  const root = await mkdtemp(path.join(os.tmpdir(), "blog-content-"));
  roots.push(root);
  await mkdir(path.join(root, "articles/zh-tw"), { recursive: true });
  await mkdir(path.join(root, "articles/en"), { recursive: true });
  await writeFile(path.join(root, "authors.json"), JSON.stringify(authors));
  await writeFile(path.join(root, "topics.json"), JSON.stringify(topics));
  await writeFile(path.join(root, "articles/zh-tw/sample.md"), article("zh-TW"));
  await writeFile(path.join(root, "articles/en/sample.md"), article("en"));
  return root;
}
async function replace(root: string, from: string, to: string, lang = "en") {
  const file = path.join(root, `articles/${lang === "zh-TW" ? "zh-tw" : "en"}/sample.md`);
  await writeFile(file, (await readFile(file, "utf8")).replace(from, to));
}
afterEach(async () => {
  fileRace.target = "";
  fileRace.replacement = "";
  await Promise.all(roots.splice(0).map((root) => rm(root, { recursive: true, force: true })));
});

describe("shared bilingual content validation", () => {
  it("accepts optional-cover bilingual drafts and returns exact original dates plus stable digests", async () => {
    const root = await fixture();
    const result = await validateRepository(root, { mode: "draft" });
    expect(result.errors).toEqual([]);
    expect(result.articles.map((entry) => entry.metadata.lang).sort()).toEqual(["en", "zh-TW"]);
    expect(result.articles[0]?.metadata.published_at).toBe("2026-11-12");
    expect(result.digests.sample).toMatch(/^[a-f0-9]{64}$/);
    expect((await validateRepository(root, { mode: "draft" })).digests).toEqual(result.digests);
  });
  it("requires external approval by default and detects post-review edits", async () => {
    const root = await fixture();
    const draft = await validateRepository(root, { mode: "draft" });
    expect((await validateRepository(root)).errors).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ message: "Missing or stale bilingual approval digest" }),
      ])
    );
    const digest = draft.digests.sample;
    if (!digest) throw new Error("Expected sample digest");
    const approvals = [
      { id: "sample", digest, reviewer: "test reviewer", evidence: "test-only approval fixture" },
    ];
    expect((await validateRepository(root, { approvals })).ok).toBe(true);
    await replace(root, "Content.", "Changed content.");
    expect((await validateRepository(root, { approvals })).ok).toBe(false);
  });
  it("rejects incomplete pairs", async () => {
    const root = await fixture();
    await rm(path.join(root, "articles/en/sample.md"));
    expect((await validateRepository(root, { mode: "draft" })).errors).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ message: "Expected exactly one zh-TW and one en article" }),
      ])
    );
  });
  it.each([
    ["published_at: 2026-11-12", "published_at: 2026-02-30", "calendar date"],
    ["author_id: team", "author_id: missing", "Unknown author_id"],
    ["topic: teaching", "topic: missing", "Unknown topic"],
    ["target_id: beta-interest", "target_id: booking", "beta-interest"],
    [
      "published_at: 2026-11-12",
      "published_at: 2026-11-12\nupdated_at: 2026-11-11",
      "must not precede",
    ],
    ["title: Sample", "title: Sample\ntitle: Other", "unique"],
    ["lang: en", "lang: zh-TW", "matching frontmatter"],
  ])("rejects invalid metadata: %s => %s", async (from, to, message) => {
    const root = await fixture();
    await replace(root, from, to);
    const result = await validateRepository(root, { mode: "draft" });
    expect(result.ok).toBe(false);
    expect(
      result.errors.some(
        (error) => error.file === "articles/en/sample.md" && error.message.includes(message)
      )
    ).toBe(true);
  });
  it("rejects per-language route collisions between different ids", async () => {
    const root = await fixture();
    await writeFile(
      path.join(root, "articles/en/other.md"),
      article("en").replace("id: sample", "id: other")
    );
    expect(
      (await validateRepository(root, { mode: "draft" })).errors.some((error) =>
        error.message.includes("Duplicate locale/slug")
      )
    ).toBe(true);
  });
  it("compares publication dates and slugs against an externally supplied published baseline", async () => {
    const root = await fixture();
    const publishedBaseline = {
      sample: { published_at: "2026-11-11", slugs: { "zh-TW": "sample", en: "sample-en" } },
    };
    expect(
      (await validateRepository(root, { mode: "draft", publishedBaseline })).errors.some((error) =>
        error.message.includes("published_at differs")
      )
    ).toBe(true);
    publishedBaseline.sample.published_at = "2026-11-12";
    publishedBaseline.sample.slugs.en = "old-slug";
    expect(
      (await validateRepository(root, { mode: "draft", publishedBaseline })).errors.some((error) =>
        error.message.includes("slug differs")
      )
    ).toBe(true);
  });
  it("accepts reference images and invalidates approvals when an asset or author changes", async () => {
    const root = await fixture();
    await mkdir(path.join(root, "images"));
    await writeFile(
      path.join(root, "images/diagram.png"),
      Buffer.from(
        "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAusB9Wl6lJ8AAAAASUVORK5CYII=",
        "base64"
      )
    );
    await replace(root, "Content.", "![Diagram][diagram]\n\n[diagram]: images/diagram.png");
    const draft = await validateRepository(root, { mode: "draft" });
    expect(draft.ok).toBe(true);
    expect(draft.articles.find((entry) => entry.metadata.lang === "en")?.images).toEqual([
      { path: "images/diagram.png", width: 1, height: 1 },
    ]);
    const digest = draft.digests.sample;
    if (!digest) throw new Error("Expected digest");
    const approvals = [{ id: "sample", digest, reviewer: "test", evidence: "fixture" }];
    await writeFile(
      path.join(root, "images/diagram.png"),
      Buffer.from(
        "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAusB9Wl6lJ8AAAAASUVORK5CYII=",
        "base64"
      )
    );
    await writeFile(
      path.join(root, "images/diagram.png"),
      Buffer.concat([
        await readFile(path.join(root, "images/diagram.png")),
        Buffer.from("changed trailing bytes"),
      ])
    );
    expect((await validateRepository(root, { approvals })).ok).toBe(false);
    const next = await validateRepository(root, { mode: "draft" });
    expect(next.digests.sample).not.toBe(digest);
    await writeFile(
      path.join(root, "authors.json"),
      JSON.stringify([{ ...authors[0], name: { "zh-TW": "編輯團隊", en: "Editing team" } }])
    );
    expect((await validateRepository(root, { mode: "draft" })).digests.sample).not.toBe(
      next.digests.sample
    );
  });
  it.each([
    "![No file](images/missing.png)",
    "![](images/diagram.png)",
    "![Escape](images/../authors.json)",
    "<img src='javascript:alert(1)'>",
    "[Unsafe](javascript:alert(1))",
    "[Source](https://example.com/)",
  ])("rejects bad body resources: %s", async (body) => {
    const root = await fixture();
    await replace(root, "Content.", body);
    expect((await validateRepository(root, { mode: "draft" })).ok).toBe(false);
  });
  it("rejects symlinked image escape", async () => {
    const root = await fixture();
    await mkdir(path.join(root, "images"));
    await symlink(path.join(root, "authors.json"), path.join(root, "images/escape.png"));
    await replace(root, "Content.", "![Escape](images/escape.png)");
    expect(
      (await validateRepository(root, { mode: "draft" })).errors.some((error) =>
        error.message.includes("escapes images")
      )
    ).toBe(true);
  });
  it("requires source parity and excludes the primary beta CTA", async () => {
    const root = await fixture();
    await replace(root, "sources: []", "sources: [https://example.com/source]");
    await replace(
      root,
      "Content.",
      "[Source](https://example.com/source)\n\n[Apply](https://tally.so/r/44WXdk)"
    );
    expect((await validateRepository(root, { mode: "draft" })).ok).toBe(true);
    await replace(root, "[Source](https://example.com/source)", "No source link.");
    expect((await validateRepository(root, { mode: "draft" })).ok).toBe(false);
  });
  it("rejects corrupt image bytes and exposes no partial article list on failure", async () => {
    const root = await fixture();
    await mkdir(path.join(root, "images"));
    await writeFile(path.join(root, "images/bad.png"), "not an image");
    await replace(root, "Content.", "![Bad](images/bad.png)");
    const result = await validateRepository(root, { mode: "draft" });
    expect(result.ok).toBe(false);
    expect(result.articles).toEqual([]);
    expect(result.digests).toEqual({});
  });
  it("accepts internal Blog links without treating them as external source references", async () => {
    const root = await fixture();
    await replace(
      root,
      "Content.",
      "[Blog](/blog) [English](/en/blog/sample-en) [Anchor](#heading)"
    );
    expect((await validateRepository(root, { mode: "draft" })).ok).toBe(true);
  });
  it("runtime-validates mode and baseline from non-TypeScript callers", async () => {
    const root = await fixture();
    const invalidMode = JSON.parse('{"mode":"bypass"}');
    expect((await validateRepository(root, invalidMode)).ok).toBe(false);
    const invalidBaseline = JSON.parse('{"mode":"draft","publishedBaseline":{"sample":{}}}');
    expect((await validateRepository(root, invalidBaseline)).ok).toBe(false);
  });
  it("rejects inconsistent original publication dates within the same bilingual release", async () => {
    const root = await fixture();
    await replace(root, "published_at: 2026-11-12", "published_at: 2026-11-13");
    expect(
      (await validateRepository(root, { mode: "draft" })).errors.some((error) =>
        error.message.includes("pair must share")
      )
    ).toBe(true);
  });
  it("rejects SVG content renamed with a raster extension", async () => {
    const root = await fixture();
    await mkdir(path.join(root, "images"));
    await writeFile(
      path.join(root, "images/spoof.png"),
      '<svg xmlns="http://www.w3.org/2000/svg" width="10" height="10"></svg>'
    );
    await replace(root, "Content.", "![Spoof](images/spoof.png)");
    expect(
      (await validateRepository(root, { mode: "draft" })).errors.some((error) =>
        error.message.includes("format does not match")
      )
    ).toBe(true);
  });
  it("accepts an explicitly decorative cover and rejects unlabeled empty alt", async () => {
    const root = await fixture();
    await mkdir(path.join(root, "images"));
    await writeFile(
      path.join(root, "images/cover.png"),
      Buffer.from(
        "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAusB9Wl6lJ8AAAAASUVORK5CYII=",
        "base64"
      )
    );
    await replace(
      root,
      "sources: []",
      'sources: []\ncover:\n  path: images/cover.png\n  alt: ""\n  decorative: true'
    );
    expect((await validateRepository(root, { mode: "draft" })).ok).toBe(true);
    await replace(root, "  decorative: true", "");
    expect((await validateRepository(root, { mode: "draft" })).ok).toBe(false);
  });
  it.each([
    "/en/blog/no-such-article",
    "#missing",
    "/blog/sample#missing",
    "/unknown-page",
  ])("rejects unresolved internal links: %s", async (link) => {
    const root = await fixture();
    await replace(root, "Content.", `[Link](${link})`);
    const result = await validateRepository(root, { mode: "draft" });
    expect(result.ok).toBe(false);
    expect(
      result.errors.some(
        (error) => error.file === "articles/en/sample.md" && /Unresolved/.test(error.message)
      )
    ).toBe(true);
  });
  it("resolves same and cross-language article fragments, main-site pages and duplicate Unicode headings", async () => {
    const root = await fixture();
    const headings = getArticleHeadings("## 你好 **世界**\n\n## 你好 **世界**\n");
    expect(headings).toEqual([
      { depth: 2, id: "你好-世界", text: "你好 世界" },
      { depth: 2, id: "你好-世界-1", text: "你好 世界" },
    ]);
    await replace(
      root,
      "Content.",
      "[Same](#heading) [Cross](/blog/sample#heading) [About](/about) [English](/en/about) [Absolute](https://daodao.so/en/blog/sample-en#heading)"
    );
    expect((await validateRepository(root, { mode: "draft" })).ok).toBe(true);
  });
  it("reports malformed registry files at the actionable filename", async () => {
    const root = await fixture();
    await writeFile(path.join(root, "authors.json"), "{");
    const result = await validateRepository(root, { mode: "draft" });
    expect(result.errors[0]?.file).toBe("authors.json");
    expect(result.articles).toEqual([]);
  });
  it("rejects noncanonical same-host HTTP links rather than treating them as external sources", async () => {
    const root = await fixture();
    const link = "http://daodao.so/en/blog/no-such-article";
    await replace(root, "sources: []", `sources: [${link}]`);
    await replace(root, "Content.", `[Missing](${link})`);
    expect((await validateRepository(root, { mode: "draft" })).ok).toBe(false);
  });
  it("gives punctuation and emoji headings nonempty anchors without collisions with real section headings", () => {
    expect(
      getArticleHeadings("## 😀\n\n## !!!\n\n## Section\n").map((heading) => heading.id)
    ).toEqual(["section", "section-1", "section-2"]);
  });
  it("confines private evidence to the caller-approved root and redacts malformed bytes", async () => {
    const root = await fixture();
    const evidenceRoot = await mkdtemp(path.join(os.tmpdir(), "private-blog-evidence-"));
    roots.push(evidenceRoot);
    const file = path.join(evidenceRoot, "approvals.json");
    await writeFile(file, "TOP-SECRET-DO-NOT-ECHO");
    await expect(readPrivateJson(evidenceRoot, file)).rejects.toThrow(
      "Invalid JSON in private evidence file"
    );
    await expect(readPrivateJson(evidenceRoot, path.join(root, "authors.json"))).rejects.toThrow(
      "escapes"
    );
    await symlink(path.join(root, "authors.json"), path.join(evidenceRoot, "outside.json"));
    await expect(
      readPrivateJson(evidenceRoot, path.join(evidenceRoot, "outside.json"))
    ).rejects.toThrow("escapes");
  });
  it("rejects final-component symlinks even to a regular file within the authorized root", async () => {
    const root = await fixture();
    await symlink(path.join(root, "authors.json"), path.join(root, "alias.json"));
    await expect(readRepositoryFile(root, "alias.json")).rejects.toThrow();
  });
  it("uses rendered GFM text for outline labels and validates GFM literal source links", async () => {
    expect(getArticleHeadings("## ~~Old~~ New\n")).toEqual([
      { depth: 2, id: "old-new", text: "Old New" },
    ]);
    const root = await fixture();
    await replace(root, "Content.", "https://example.com/source");
    expect((await validateRepository(root, { mode: "draft" })).ok).toBe(false);
    await replace(root, "sources: []", "sources: [https://example.com/source]");
    expect((await validateRepository(root, { mode: "draft" })).ok).toBe(true);
  });
  it("rejects a symlink swapped in after the path check without exposing outside article bytes", async () => {
    const root = await fixture();
    const outside = await fixture();
    await replace(outside, "Content.", "PRIVATE-OUTSIDE-CONTENT");
    const fs = await import("node:fs/promises");
    fileRace.replacement = await fs.realpath(path.join(outside, "articles/en/sample.md"));
    fileRace.target = await fs.realpath(path.join(root, "articles/en/sample.md"));
    const result = await validateRepository(root, { mode: "draft" });
    expect(result.ok).toBe(false);
    expect(JSON.stringify(result)).not.toContain("PRIVATE-OUTSIDE-CONTENT");
  });
  it("does not enumerate filenames through a root articles directory symlink", async () => {
    const root = await fixture();
    const outside = await fixture();
    await rm(path.join(root, "articles"), { recursive: true });
    await writeFile(path.join(outside, "articles/en/private-filename.md"), article("en"));
    await symlink(path.join(outside, "articles"), path.join(root, "articles"));
    const result = await validateRepository(root, { mode: "draft" });
    expect(result.ok).toBe(false);
    expect(JSON.stringify(result)).not.toContain("private-filename");
  });
  it("CLI uses the same validator and fails closed without private approval evidence", async () => {
    const root = await fixture();
    const packageRoot = fileURLToPath(new URL("../../", import.meta.url));
    const cli = path.join(packageRoot, "src/cli.ts");
    const executable = path.join(packageRoot, "node_modules/.bin/tsx");
    const cliEnv = { PATH: getEnv("PATH") ?? "", BLOG_CONTENT_DIR: root };
    const draft = JSON.parse(
      execFileSync(executable, [cli, "--root", root, "--mode", "draft"], {
        encoding: "utf8",
        timeout: 5000,
        env: cliEnv,
      })
    );
    expect(draft.ok).toBe(true);
    const typo = spawnSync(executable, [cli, "--root", root, "--mode", "typo"], {
      encoding: "utf8",
      timeout: 5000,
      env: cliEnv,
    });
    expect(typo.status).toBe(1);
    const evidenceRoot = await mkdtemp(path.join(os.tmpdir(), "blog-evidence-"));
    roots.push(evidenceRoot);
    const evidence = path.join(evidenceRoot, "approvals.json");
    await writeFile(
      evidence,
      JSON.stringify([
        { id: "sample", digest: draft.digests.sample, reviewer: "test", evidence: "test-only" },
      ])
    );
    const approved = spawnSync(executable, [cli, "--root", root, "--approvals", evidence], {
      encoding: "utf8",
      timeout: 5000,
      env: { ...cliEnv, BLOG_EVIDENCE_ROOT: evidenceRoot },
    });
    expect(approved.status).toBe(0);
    expect(JSON.parse(approved.stdout).ok).toBe(true);
    const published = spawnSync(executable, [cli, "--root", root], {
      encoding: "utf8",
      timeout: 5000,
      env: cliEnv,
    });
    expect(published.status).toBe(1);
    expect(JSON.parse(published.stdout).errors[0].message).toContain("requires --approvals");
    await writeFile(path.join(root, "approvals.json"), "[]");
    const publicEvidence = spawnSync(
      executable,
      [cli, "--root", root, "--approvals", path.join(root, "approvals.json")],
      { encoding: "utf8", timeout: 5000, env: { ...cliEnv, BLOG_EVIDENCE_ROOT: evidenceRoot } }
    );
    expect(publicEvidence.status).toBe(1);
    expect(publicEvidence.stdout).toContain("outside the public content root");
  }, 30_000);
});
