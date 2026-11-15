import { readFile } from "node:fs/promises";
import path from "node:path";
import { removeEmptyBlogExports } from "../src/components/blog/static-export";

async function main() {
  const manifest = JSON.parse(
    await readFile(path.resolve(".next/required-server-files.json"), "utf8")
  );
  if (manifest.config.output !== "export") return;
  const files = await removeEmptyBlogExports(path.resolve("."));
  console.log(`Removed ${files.length} empty Blog export artifacts`);
}
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
