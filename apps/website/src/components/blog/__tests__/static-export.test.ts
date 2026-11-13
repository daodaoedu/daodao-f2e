import { access, mkdir, mkdtemp, readFile, rm, symlink, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { topicsSchema } from "@daodao/blog-content";
import { afterEach, expect, it } from "vitest";
import { removeEmptyBlogExports } from "../static-export";

const roots: string[] = [];
afterEach(async () => {
  await Promise.all(roots.splice(0).map((root) => rm(root, { recursive: true, force: true })));
});
async function fixture() {
  const root = await mkdtemp(path.join(os.tmpdir(), "blog-export-"));
  roots.push(root);
  for (const locale of ["zh-TW", "en"])
    for (const route of ["blog/_empty", "blog/topic/_empty"]) {
      const relative = `${locale}/${route}`;
      const file = path.join(root, "out", relative);
      const meta = path.join(root, ".next/server/app", `${relative}.meta`);
      await mkdir(path.dirname(file), { recursive: true });
      await mkdir(path.dirname(meta), { recursive: true });
      await writeFile(`${file}.html`, "not found page");
      await writeFile(`${file}.txt`, "not found RSC");
      await writeFile(meta, JSON.stringify({ status: 404 }));
    }
  return root;
}
it("removes only placeholder documents, preserving real articles, lists, assets and 404", async () => {
  const root = await fixture();
  const preserved = [
    "en/blog.html",
    "en/blog/actual-guide.html",
    "404.html",
    "en/_empty.html",
    "en/blog/_empty.json",
  ];
  for (const file of preserved) await writeFile(path.join(root, "out", file), `keep ${file}`);
  const removed = await removeEmptyBlogExports(root);
  expect(removed).toHaveLength(8);
  for (const file of removed) await expect(access(path.join(root, "out", file))).rejects.toThrow();
  for (const file of preserved)
    expect(await readFile(path.join(root, "out", file), "utf8")).toBe(`keep ${file}`);
  expect(await removeEmptyBlogExports(root)).toEqual([]);
});
it("refuses a successful document before removing any earlier candidate", async () => {
  const root = await fixture();
  await writeFile(path.join(root, ".next/server/app/en/blog/topic/_empty.meta"), '{"status":200}');
  await expect(removeEmptyBlogExports(root)).rejects.toThrow("rendered 404");
  expect(await readFile(path.join(root, "out/zh-TW/blog/_empty.html"), "utf8")).toBe(
    "not found page"
  );
});
it("refuses a symlink to an outside file without changing its target", async () => {
  const root = await fixture();
  const outside = path.join(root, "outside.html");
  const exported = path.join(root, "out/en/blog/_empty.html");
  await writeFile(outside, "private original");
  await rm(exported);
  await symlink(outside, exported);
  await expect(removeEmptyBlogExports(root)).rejects.toThrow("regular contained file");
  expect(await readFile(outside, "utf8")).toBe("private original");
});
it("leaves server builds without an export directory alone", async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), "blog-server-"));
  roots.push(root);
  expect(await removeEmptyBlogExports(root)).toEqual([]);
});
it("uses a placeholder excluded by the existing topic identifier contract", () => {
  expect(
    topicsSchema.safeParse([{ id: "_empty", name: { "zh-TW": "測試", en: "Test" } }]).success
  ).toBe(false);
});
