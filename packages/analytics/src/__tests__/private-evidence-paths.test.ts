import { execFileSync } from "node:child_process";
import { mkdir, mkdtemp, readFile, rm, stat, symlink, writeFile } from "node:fs/promises";
import { createRequire } from "node:module";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

const require = createRequire(import.meta.url);
const cli = fileURLToPath(new URL("../../scripts/activation-report.ts", import.meta.url));
const tsx = require.resolve("tsx/cli");
const fixture = JSON.stringify({
  input: {
    asOf: "2026-11-13T00:00:00Z",
    capturedAt: "2026-11-13T00:00:00Z",
    evidenceMode: "fixture",
    registrations: [],
    events: [],
    coverage: { publications: true, invitations: true, joins: true, participation: true },
  },
  provenance: { testOnly: true },
});
let folder: string;
let root: string;
let outside: string;
let input: string;
function invoke(inputPath: string, outputPath: string, configuredRoot: string | null = root) {
  const env = { ...process.env };
  delete env.BLOG_ACTIVATION_EVIDENCE_ROOT;
  if (configuredRoot !== null) env.BLOG_ACTIVATION_EVIDENCE_ROOT = configuredRoot;
  try {
    execFileSync(process.execPath, [tsx, cli, "--input", inputPath, "--output", outputPath], {
      env,
      stdio: "pipe",
    });
    return 0;
  } catch (error) {
    return (error as { status: number }).status;
  }
}
beforeEach(async () => {
  folder = await mkdtemp(join(tmpdir(), "daodao-private-report-"));
  root = join(folder, "approved");
  outside = join(folder, "outside");
  await Promise.all([mkdir(root), mkdir(outside)]);
  input = join(root, "export.json");
  await writeFile(input, fixture);
  await writeFile(join(outside, "export.json"), fixture);
});
afterEach(async () => {
  await rm(folder, { recursive: true, force: true });
});
describe("Private activation CLI capability boundary", () => {
  it("requires an explicitly configured evidence root before reading or writing", async () => {
    const output = join(root, "report.json");
    expect(invoke(input, output, null)).not.toBe(0);
    await expect(stat(output)).rejects.toMatchObject({ code: "ENOENT" });
  });
  it("rejects input outside the approved root without creating a report", async () => {
    const output = join(root, "report.json");
    expect(invoke(join(outside, "export.json"), output)).not.toBe(0);
    await expect(stat(output)).rejects.toMatchObject({ code: "ENOENT" });
  });
  it("rejects output outside the approved root", async () => {
    const output = join(outside, "report.json");
    expect(invoke(input, output)).not.toBe(0);
    await expect(stat(output)).rejects.toMatchObject({ code: "ENOENT" });
  });
  it("rejects an input symlink that escapes the approved root", async () => {
    const linked = join(root, "linked.json");
    await symlink(join(outside, "export.json"), linked);
    expect(invoke(linked, join(root, "report.json"))).not.toBe(0);
  });
  it("rejects an output parent symlink that escapes the approved root", async () => {
    await symlink(outside, join(root, "linked"));
    const output = join(outside, "report.json");
    expect(invoke(input, join(root, "linked", "report.json"))).not.toBe(0);
    await expect(stat(output)).rejects.toMatchObject({ code: "ENOENT" });
  });
  it("rejects a sibling directory sharing the approved root's name prefix", async () => {
    const sibling = `${root}-sibling`;
    await mkdir(sibling);
    await writeFile(join(sibling, "export.json"), fixture);
    expect(invoke(join(sibling, "export.json"), join(root, "report.json"))).not.toBe(0);
    expect(invoke(input, join(sibling, "report.json"))).not.toBe(0);
    await expect(stat(join(sibling, "report.json"))).rejects.toMatchObject({ code: "ENOENT" });
  });
  it("rejects relative or nonexistent root configuration", () => {
    expect(invoke(input, join(root, "report.json"), "relative-root")).not.toBe(0);
    expect(invoke(input, join(root, "report.json"), join(folder, "missing"))).not.toBe(0);
  });
  it("rejects a directory as input evidence", () => {
    expect(invoke(root, join(root, "report.json"))).not.toBe(0);
  });
  it.each([
    "input",
    "output",
    "root",
  ] as const)("rejects a requested public %s alias even when its target is inside the private root", async (alias) => {
    const privateDir = join(root, "private");
    await mkdir(privateDir);
    await writeFile(join(privateDir, "export.json"), fixture);
    await symlink(privateDir, join(root, "public"));
    const inputPath = alias === "input" ? join(root, "public", "export.json") : input;
    const outputPath =
      alias === "output" ? join(root, "public", "report.json") : join(root, "report.json");
    const configuredRoot = alias === "root" ? join(root, "public") : root;
    const validInput = alias === "root" ? join(privateDir, "export.json") : inputPath;
    const validOutput = alias === "root" ? join(privateDir, "report.json") : outputPath;
    expect(invoke(validInput, validOutput, configuredRoot)).not.toBe(0);
    await expect(stat(join(privateDir, "report.json"))).rejects.toMatchObject({ code: "ENOENT" });
    await expect(stat(join(root, "report.json"))).rejects.toMatchObject({ code: "ENOENT" });
  });
  it("creates a private report in the approved root with the actual evaluator result", async () => {
    const output = join(root, "report.json");
    expect(invoke(input, output)).toBe(0);
    const result = JSON.parse(await readFile(output, "utf8"));
    expect(result.report.counts.leaders).toBe(0);
    expect(result.report.matureCohort.rate).toBeNull();
    expect((await stat(output)).mode & 0o777).toBe(0o600);
  });
  it("refuses overwrites and final symlinks without changing existing files", async () => {
    const output = join(root, "existing.json");
    await writeFile(output, "preserve");
    expect(invoke(input, output)).not.toBe(0);
    expect(await readFile(output, "utf8")).toBe("preserve");
    const linked = join(root, "linked.json");
    await symlink(output, linked);
    expect(invoke(input, linked)).not.toBe(0);
    expect(await readFile(output, "utf8")).toBe("preserve");
  });
  it("rejects known public article asset directories even within the root", async () => {
    const publicDir = join(root, "public");
    await mkdir(publicDir);
    expect(invoke(input, join(publicDir, "report.json"))).not.toBe(0);
  });
});
