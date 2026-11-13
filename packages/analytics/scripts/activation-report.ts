import { basename, dirname, join, resolve } from "node:path";
import { readFile, realpath, writeFile } from "node:fs/promises";
import { parseArgs } from "node:util";
import { evaluateLeaderActivation } from "../src/lib/blog-activation";

async function main() {
  const { values } = parseArgs({
    options: { input: { type: "string" }, output: { type: "string" } },
  });
  if (!values.input || !values.output)
    throw new Error("--input PRIVATE_EXPORT_JSON --output PRIVATE_REPORT_JSON required");
  const output = join(await realpath(dirname(resolve(values.output))), basename(values.output));
  if (/(^|[\\/])(public|articles|images)([\\/]|$)/.test(output))
    throw new Error("Activation report is private, not a public article asset");
  const exported = JSON.parse(await readFile(values.input, "utf8"));
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
