import path from "node:path";
import { loadEnvConfig } from "@next/env";
import { removeEmptyBlogExports } from "../src/components/blog/static-export";

loadEnvConfig(path.resolve("../.."));
if (process.env.NEXT_OUTPUT === "export")
  removeEmptyBlogExports(path.resolve("."))
    .then((files) => console.log(`Removed ${files.length} empty Blog export artifacts`))
    .catch((error) => {
      console.error(error);
      process.exitCode = 1;
    });
