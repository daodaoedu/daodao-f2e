import { mkdir, mkdtemp, readFile, rm, symlink, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { readBlogSource, stageBlogAssets } from "../source";

const roots: string[] = [];
async function fixture() {
  const dir = await mkdtemp(path.join(os.tmpdir(), "website-blog-"));
  roots.push(dir);
  const root = path.join(dir, "content");
  await mkdir(path.join(root, "articles/zh-tw"), { recursive: true });
  await mkdir(path.join(root, "articles/en"), { recursive: true });
  await mkdir(path.join(root, "images"));
  await writeFile(
    path.join(root, "authors.json"),
    JSON.stringify([
      {
        id: "team",
        name: { "zh-TW": "團隊", en: "Team" },
        bio: { "zh-TW": "編輯", en: "Editors" },
      },
    ])
  );
  await writeFile(
    path.join(root, "topics.json"),
    JSON.stringify([{ id: "teaching", name: { "zh-TW": "教學", en: "Teaching" } }])
  );
  const png = Buffer.from(
    "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAusB9Wl6lJ8AAAAASUVORK5CYII=",
    "base64"
  );
  await writeFile(path.join(root, "images/pixel.png"), png);
  for (const [folder, lang] of [
    ["zh-tw", "zh-TW"],
    ["en", "en"],
  ])
    await writeFile(
      path.join(root, `articles/${folder}/guide.md`),
      `---\nid: guide\nlang: ${lang}\nslug: guide\ntitle: Guide\ndescription: A guide\nauthor_id: team\npublished_at: 2026-11-13\ntopic: teaching\ntags: []\ncta:\n  kind: beta_application\n  target_id: beta-interest\nsources: []\n---\n## Heading\n\n![Pixel](images/pixel.png)\n`
    );
  return { dir, root, png };
}
afterEach(async () => {
  await Promise.all(roots.splice(0).map((root) => rm(root, { recursive: true, force: true })));
});
describe("website content boundary and assets", () => {
  it("has a deliberate empty state only when no source is configured", async () => {
    expect((await readBlogSource({})).articles).toEqual([]);
    await expect(readBlogSource({ directory: "/missing-blog-content" })).rejects.toThrow();
  });
  it("does not reinterpret an invalid or unapproved source as an empty site", async () => {
    const { root } = await fixture();
    await expect(readBlogSource({ directory: root })).rejects.toThrow("requires private approval");
    await rm(path.join(root, "articles/en/guide.md"));
    await expect(
      readBlogSource({ directory: root, mode: "draft", origin: "http://localhost" })
    ).rejects.toThrow("Invalid Blog content");
  });
  it("stages exact approved raster bytes once per bilingual pair without private approvals", async () => {
    const { dir, root, png } = await fixture();
    const draft = await readBlogSource({
      directory: root,
      mode: "draft",
      origin: "http://localhost",
    });
    const approvalsFile = path.join(dir, "private-approvals.json");
    await writeFile(
      approvalsFile,
      JSON.stringify([
        {
          id: "guide",
          digest: draft.digests.guide,
          reviewer: "test reviewer",
          evidence: "test-only fixture",
        },
      ])
    );
    const published = await readBlogSource({ directory: root, evidenceRoot: dir, approvalsFile });
    const publicDir = path.join(dir, "public");
    const files = await stageBlogAssets(published, publicDir);
    expect(files).toEqual([`/blog-images/${draft.digests.guide}/images/pixel.png`]);
    const image = files[0];
    if (!image) throw new Error("Expected staged image");
    expect(await readFile(path.join(publicDir, image))).toEqual(png);
    expect(files.some((file) => file.includes("approvals"))).toBe(false);
    expect(await stageBlogAssets(draft, publicDir)).toEqual([]);
  });
  it("rejects approval evidence reached via a symlink back inside public content", async () => {
    const { dir, root } = await fixture();
    const internal = path.join(root, "approval.json");
    await writeFile(internal, "[]");
    const approvalsFile = path.join(dir, "link.json");
    await symlink(internal, approvalsFile);
    await expect(
      readBlogSource({ directory: root, evidenceRoot: dir, approvalsFile })
    ).rejects.toThrow("outside content root");
  });
});

it("rejects private files outside the separately trusted evidence root", async () => {
  const { dir, root } = await fixture();
  const evidenceRoot = path.join(dir, "private");
  await mkdir(evidenceRoot);
  const approvalsFile = path.join(dir, "mistaken-credential.json");
  await writeFile(approvalsFile, '{"token":"sensitive-test-value"}');
  await expect(readBlogSource({ directory: root, approvalsFile })).rejects.toThrow(
    "BLOG_EVIDENCE_ROOT"
  );
  await expect(readBlogSource({ directory: root, evidenceRoot, approvalsFile })).rejects.toThrow(
    "authorized root"
  );
});
it("does not echo malformed private JSON bytes", async () => {
  const { dir, root } = await fixture();
  const evidenceRoot = path.join(dir, "private");
  await mkdir(evidenceRoot);
  const approvalsFile = path.join(evidenceRoot, "approval.json");
  await writeFile(approvalsFile, "sensitive-test-marker malformed");
  let failure: unknown;
  try {
    await readBlogSource({ directory: root, evidenceRoot, approvalsFile });
  } catch (error) {
    failure = error;
  }
  expect(failure).toBeInstanceOf(Error);
  if (!(failure instanceof Error)) throw new Error("Expected private JSON rejection");
  expect(failure.message).toContain("Invalid JSON");
  expect(failure.message).not.toContain("sensitive-test-marker");
});

async function approvedFixture(root: string, dir: string) {
  const draft = await readBlogSource({
    directory: root,
    mode: "draft",
    origin: "http://localhost",
  });
  const approvalsFile = path.join(dir, "fixture-approval.json");
  await writeFile(
    approvalsFile,
    JSON.stringify([
      {
        id: "guide",
        digest: draft.digests.guide,
        reviewer: "engineering-test",
        evidence: "test-only fixture",
      },
    ])
  );
  return readBlogSource({ directory: root, approvalsFile, evidenceRoot: dir });
}
it("replaces publication A with exact B assets, then clears removals, draft and empty output", async () => {
  const { dir, root, png } = await fixture();
  const publicDir = path.join(dir, "public");
  const a = await approvedFixture(root, dir);
  const first = await stageBlogAssets(a, publicDir);
  const old = first[0];
  if (!old) throw new Error("Expected first asset");
  await writeFile(path.join(publicDir, "blog-images/stale.json"), "stale-fixture");
  for (const folder of ["zh-tw", "en"]) {
    const file = path.join(root, `articles/${folder}/guide.md`);
    await writeFile(file, (await readFile(file, "utf8")) + "\nPublication B.\n");
  }
  const b = await approvedFixture(root, dir);
  const second = await stageBlogAssets(b, publicDir);
  expect(second).not.toEqual(first);
  const current = second[0];
  if (!current) throw new Error("Expected replacement asset");
  expect(await readFile(path.join(publicDir, current))).toEqual(png);
  await expect(readFile(path.join(publicDir, old))).rejects.toMatchObject({ code: "ENOENT" });
  await expect(readFile(path.join(publicDir, "blog-images/stale.json"))).rejects.toMatchObject({
    code: "ENOENT",
  });
  for (const folder of ["zh-tw", "en"]) {
    const file = path.join(root, `articles/${folder}/guide.md`);
    await writeFile(
      file,
      (await readFile(file, "utf8")).replace("![Pixel](images/pixel.png)", "Image removed.")
    );
  }
  const removed = await approvedFixture(root, dir);
  expect(await stageBlogAssets(removed, publicDir)).toEqual([]);
  await expect(readFile(path.join(publicDir, current))).rejects.toMatchObject({ code: "ENOENT" });
  await stageBlogAssets(b, publicDir);
  const draft = await readBlogSource({
    directory: root,
    mode: "draft",
    origin: "http://localhost",
  });
  expect(await stageBlogAssets(draft, publicDir)).toEqual([]);
  await expect(readFile(path.join(publicDir, current))).rejects.toMatchObject({ code: "ENOENT" });
  await stageBlogAssets(b, publicDir);
  expect(await stageBlogAssets(await readBlogSource({}), publicDir)).toEqual([]);
  await expect(readFile(path.join(publicDir, current))).rejects.toMatchObject({ code: "ENOENT" });
});
it("retains the old managed asset set when preparing a new set fails", async () => {
  const { dir, root, png } = await fixture();
  const publicDir = path.join(dir, "public");
  const source = await approvedFixture(root, dir);
  const urls = await stageBlogAssets(source, publicDir);
  const image = urls[0];
  if (!image) throw new Error("Expected staged asset");
  await rm(path.join(root, "images/pixel.png"));
  await expect(stageBlogAssets(source, publicDir)).rejects.toThrow();
  expect(await readFile(path.join(publicDir, image))).toEqual(png);
});
