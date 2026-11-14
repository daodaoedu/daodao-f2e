import { lstat, readFile, realpath, unlink } from "node:fs/promises";
import path from "node:path";

/** Next 15 exports notFound() HTML with status metadata that a plain static host cannot read. */
export async function removeEmptyBlogExports(websiteDirectory: string): Promise<string[]> {
  const output = path.join(await realpath(websiteDirectory), "out");
  try {
    if (!(await lstat(output)).isDirectory()) throw new Error("Export output must be a directory");
  } catch (error) {
    if (error instanceof Error && "code" in error && error.code === "ENOENT") return [];
    throw error;
  }
  const files: string[] = [];
  for (const locale of ["zh-TW", "en"])
    for (const route of ["blog/_empty", "blog/topic/_empty"]) {
      const relative = `${locale}/${route}`;
      const targets: string[] = [];
      for (const extension of ["html", "txt"]) {
        const target = path.join(output, `${relative}.${extension}`);
        try {
          const info = await lstat(target);
          if (!info.isFile() || (await realpath(target)) !== target)
            throw new Error("Empty Blog export must be a regular contained file");
          targets.push(target);
        } catch (error) {
          if (error instanceof Error && "code" in error && error.code === "ENOENT") continue;
          throw error;
        }
      }
      if (targets.length === 0) continue;
      const metadata = JSON.parse(
        await readFile(path.join(websiteDirectory, ".next/server/app", `${relative}.meta`), "utf8")
      );
      if (metadata.status !== 404) throw new Error("Empty Blog export must have rendered 404");
      files.push(...targets);
    }
  // Preflight every candidate before removing any file; valid content cannot use underscore IDs.
  for (const file of files) await unlink(file);
  return files.map((file) => path.relative(output, file));
}
