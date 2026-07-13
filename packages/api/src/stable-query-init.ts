/**
 * Stabilize openapi-fetch / swr-openapi query `init` objects.
 *
 * swr-openapi builds cache keys as `[prefix, path, init]` and memoizes with
 * reference equality on `init`. Passing a fresh object every render
 * (`useQuery(path, { params: ... })`) changes the key every time → endless
 * revalidation / perpetual isLoading / blank UI (seen on persona carousel).
 *
 * Serializing to JSON and memo-parsing yields a stable reference when content
 * is unchanged (including the common `enabled ? {} : null` pattern).
 */

export type StableInitInput = object | null | undefined;

/**
 * Pure helper: produce a deterministic serialization key for an init value.
 * - `null` → disabled query (swr-openapi convention)
 * - `undefined` → omitted init (path-only query)
 * - object → JSON string (key order is insertion order; callers should build
 *   objects consistently)
 */
export function serializeQueryInit(init: StableInitInput): string {
  if (init === null) return "__null__";
  if (init === undefined) return "__undefined__";
  return JSON.stringify(init);
}

/**
 * Pure helper: deserialize a key back to init (for tests / non-hook use).
 */
export function deserializeQueryInit<T = unknown>(serialized: string): T | null | undefined {
  if (serialized === "__null__") return null;
  if (serialized === "__undefined__") return undefined;
  return JSON.parse(serialized) as T;
}
