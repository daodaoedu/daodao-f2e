import { lstat, realpath, stat } from "node:fs/promises";
import { basename, dirname, isAbsolute, join, relative, resolve, sep } from "node:path";

const publicAssetPath = /(^|[\\/])(public|articles|images)([\\/]|$)/i;

function assertPrivateChild(root: string, path: string): void {
  const child = relative(root, path);
  if (!child || child === ".." || child.startsWith(`..${sep}`) || isAbsolute(child)) {
    throw new Error("Evidence path must stay within BLOG_ACTIVATION_EVIDENCE_ROOT");
  }
  if (publicAssetPath.test(path)) {
    throw new Error("Activation evidence is private, not a public article asset");
  }
}

/** The operator configures the capability root independently of CLI path arguments. */
export async function resolvePrivateEvidencePaths(
  configuredRoot: string | undefined,
  inputArgument: string,
  outputArgument: string
): Promise<{ input: string; output: string }> {
  if (!configuredRoot || !isAbsolute(configuredRoot)) {
    throw new Error(
      "BLOG_ACTIVATION_EVIDENCE_ROOT must name an existing absolute private directory"
    );
  }
  if ([configuredRoot, inputArgument, outputArgument].some((path) => publicAssetPath.test(path))) {
    throw new Error("Requested evidence paths must not name public article assets");
  }
  const root = await realpath(configuredRoot);
  if (!(await stat(root)).isDirectory() || publicAssetPath.test(root)) {
    throw new Error("BLOG_ACTIVATION_EVIDENCE_ROOT must be a private directory");
  }
  const input = await realpath(resolve(inputArgument));
  assertPrivateChild(root, input);
  if (!(await stat(input)).isFile()) throw new Error("Input evidence must be a regular file");

  const requestedOutput = resolve(outputArgument);
  const output = join(await realpath(dirname(requestedOutput)), basename(requestedOutput));
  assertPrivateChild(root, output);
  try {
    await lstat(output);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return { input, output };
    throw error;
  }
  throw new Error("Output evidence already exists; refusing overwrite or symbolic link");
}
