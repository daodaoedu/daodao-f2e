import { constants } from "node:fs";
import { open, realpath } from "node:fs/promises";
import path from "node:path";

export function isWithinDirectory(root: string, file: string): boolean {
  const relative = path.relative(root, file);
  return relative !== ".." && !relative.startsWith(`..${path.sep}`) && !path.isAbsolute(relative);
}

/** Roots are caller-authorized, immutable checkout/evidence directories, not LLM-selected scopes. */
export async function readRepositoryFile(root: string, relative: string): Promise<Buffer> {
  if (path.isAbsolute(relative))
    throw new Error("Expected a relative file within the authorized root");
  const authorizedRoot = await realpath(root);
  const candidate = path.resolve(authorizedRoot, relative);
  if (!isWithinDirectory(authorizedRoot, candidate))
    throw new Error("File escapes the authorized root");
  const canonical = await realpath(candidate);
  if (!isWithinDirectory(authorizedRoot, canonical))
    throw new Error("File escapes the authorized root");
  if (typeof constants.O_NOFOLLOW !== "number") {
    throw new Error("Safe file reading requires POSIX O_NOFOLLOW support on this platform");
  }
  const handle = await open(
    candidate,
    constants.O_RDONLY | constants.O_NOFOLLOW | constants.O_NONBLOCK
  );
  try {
    const before = await handle.stat({ bigint: true });
    if (!before.isFile()) throw new Error("Expected a regular file within the authorized root");
    if ((await realpath(candidate)) !== canonical)
      throw new Error("File path changed during validation");
    const bytes = await handle.readFile();
    const after = await handle.stat({ bigint: true });
    if (
      before.size !== after.size ||
      before.mtimeNs !== after.mtimeNs ||
      before.ctimeNs !== after.ctimeNs
    ) {
      throw new Error("File changed during validation");
    }
    return bytes;
  } finally {
    await handle.close();
  }
}

/** Private parser errors must never echo bytes from a mistaken credential file. */
export async function readPrivateJson(
  evidenceRoot: string,
  requestedFile: string
): Promise<unknown> {
  const root = await realpath(evidenceRoot);
  const configuredRoot = path.resolve(evidenceRoot);
  const requested = path.resolve(requestedFile);
  let relative: string;
  if (isWithinDirectory(configuredRoot, requested))
    relative = path.relative(configuredRoot, requested);
  else if (isWithinDirectory(root, requested)) relative = path.relative(root, requested);
  else throw new Error("Private evidence file escapes the caller-authorized root");
  const bytes = await readRepositoryFile(root, relative);
  try {
    return JSON.parse(bytes.toString("utf8"));
  } catch {
    throw new Error("Invalid JSON in private evidence file");
  }
}
