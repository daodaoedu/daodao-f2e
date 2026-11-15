import path from "node:path";
import { configuredBlogSource } from "../src/components/blog/config";
import { readBlogSource, stageBlogAssets } from "../src/components/blog/source";

async function main() {
  const source = await readBlogSource(configuredBlogSource());
  const files = await stageBlogAssets(source, path.resolve("public"));
  console.log(
    `Blog assets prepared: ${files.length}; mode=${source.preview ? "draft" : "publish"}`
  );
}
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
