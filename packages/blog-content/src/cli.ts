import { readFile, realpath } from "node:fs/promises";
import path from "node:path";
import { parseArgs } from "node:util";
import { type ApprovalType, approvalSchema, baselineSchema, validateRepository } from "./index.js";

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
  const mode = values.mode === "draft" ? "draft" : "publish";
  let approvals: ApprovalType[] = [];
  if (mode === "publish") {
    if (!values.approvals)
      throw new Error("Publish mode requires --approvals pointing outside the content root");
    const relative = path.relative(await realpath(values.root), await realpath(values.approvals));
    if (!relative.startsWith(`..${path.sep}`) && !path.isAbsolute(relative))
      throw new Error("Approval evidence must be outside the public content root");
    approvals = approvalSchema.parse(JSON.parse(await readFile(values.approvals, "utf8")));
  }
  const publishedBaseline = values.baseline
    ? baselineSchema.parse(JSON.parse(await readFile(values.baseline, "utf8")))
    : undefined;
  const result = await validateRepository(values.root, { mode, approvals, publishedBaseline });
  console.log(JSON.stringify(result, null, 2));
  if (!result.ok) process.exitCode = 1;
} catch (error) {
  console.log(
    JSON.stringify({
      ok: false,
      errors: [{ message: error instanceof Error ? error.message : String(error) }],
    })
  );
  process.exitCode = 1;
}
