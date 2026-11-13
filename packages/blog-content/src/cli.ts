import { realpath } from "node:fs/promises";
import { createRequire } from "node:module";
import path from "node:path";
import { parseArgs } from "node:util";
import {
  type ApprovalType,
  approvalSchema,
  baselineSchema,
  isWithinDirectory,
  readPrivateJson,
  type ValidationOptionsType,
  validateRepository,
} from "./index";

// The config workspace is CommonJS; standalone ESM needs an actual require bridge.
const { getEnv }: typeof import("@daodao/config") = createRequire(import.meta.url)(
  "@daodao/config"
);

try {
  const { values } = parseArgs({
    options: {
      root: { type: "string" },
      mode: { type: "string", default: "publish" },
      approvals: { type: "string" },
      baseline: { type: "string" },
    },
  });
  if (!values.root || !["draft", "publish"].includes(values.mode))
    throw new Error("Usage: --root PATH [--mode draft|publish] [--approvals PRIVATE_JSON]");
  const configuredContentRoot = getEnv("BLOG_CONTENT_DIR");
  if (!configuredContentRoot)
    throw new Error("Validation requires trusted BLOG_CONTENT_DIR configuration");
  const contentRoot = await realpath(configuredContentRoot);
  if (![path.resolve(configuredContentRoot), contentRoot].includes(path.resolve(values.root))) {
    throw new Error("Requested content root is outside the caller-authorized checkout");
  }
  const mode = values.mode === "draft" ? "draft" : "publish";
  let approvals: ApprovalType[] = [];
  let evidenceRoot: string | undefined;
  if (values.approvals || values.baseline) {
    const configuredRoot = getEnv("BLOG_EVIDENCE_ROOT");
    if (!configuredRoot)
      throw new Error("Private evidence requires trusted BLOG_EVIDENCE_ROOT configuration");
    evidenceRoot = configuredRoot;
    if (isWithinDirectory(contentRoot, await realpath(configuredRoot)))
      throw new Error("Private evidence root must be outside the public content root");
  }
  if (mode === "publish") {
    if (!values.approvals)
      throw new Error("Publish mode requires --approvals pointing outside the content root");
    if (
      isWithinDirectory(contentRoot, path.resolve(values.approvals)) ||
      isWithinDirectory(path.resolve(configuredContentRoot), path.resolve(values.approvals))
    ) {
      throw new Error("Approval evidence must be outside the public content root");
    }
    if (!evidenceRoot) throw new Error("Missing trusted evidence root");
    approvals = approvalSchema.parse(await readPrivateJson(evidenceRoot, values.approvals));
  }
  let publishedBaseline: ValidationOptionsType["publishedBaseline"];
  if (values.baseline) {
    if (!evidenceRoot) throw new Error("Missing trusted evidence root");
    publishedBaseline = baselineSchema.parse(await readPrivateJson(evidenceRoot, values.baseline));
  }
  const result = await validateRepository(contentRoot, { mode, approvals, publishedBaseline });
  console.log(JSON.stringify(result, null, 2));
  if (!result.ok) process.exitCode = 1;
} catch (error) {
  console.log(
    JSON.stringify({
      ok: false,
      errors: [{ message: error instanceof Error ? error.message : "Private validation failed" }],
    })
  );
  process.exitCode = 1;
}
