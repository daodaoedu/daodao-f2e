import { constants } from "node:fs";
import { open, writeFile } from "node:fs/promises";
import { parseArgs } from "node:util";
import { evaluateLeaderActivation } from "../src/lib/blog-activation";
import { resolvePrivateEvidencePaths } from "./private-evidence-paths";

async function main() {
  const { values } = parseArgs({
    options: { input: { type: "string" }, output: { type: "string" } },
  });
  if (!values.input || !values.output)
    throw new Error("--input PRIVATE_EXPORT_JSON --output PRIVATE_REPORT_JSON required");
  const { input, output } = await resolvePrivateEvidencePaths(
    process.env.BLOG_ACTIVATION_EVIDENCE_ROOT,
    values.input,
    values.output
  );
  const inputFile = await open(input, constants.O_RDONLY | constants.O_NOFOLLOW);
  let exported: { input: unknown; provenance?: unknown };
  try {
    exported = JSON.parse(await inputFile.readFile("utf8"));
  } finally {
    await inputFile.close();
  }
  const result = evaluateLeaderActivation(exported.input);
  await writeFile(
    output,
    `${JSON.stringify({ report: result, provenance: exported.provenance ?? null }, null, 2)}\n`,
    { mode: 0o600, flag: "wx" }
  );
  console.log(
    JSON.stringify({
      written: true,
      counts: result.counts,
      matureCohort: result.matureCohort,
      hostedAnalyticsDelivery: "not_verified",
    })
  );
}
main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : "Activation report failed");
  process.exitCode = 1;
});
