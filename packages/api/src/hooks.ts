"use client";

import { useMemo } from "react";
import {
  createImmutableHook,
  createInfiniteHook,
  createMutateHook,
  createQueryHook,
} from "swr-openapi";
import { client, PREFIX } from "./client";
import { isMatch } from "./is-match";
import { deserializeQueryInit, serializeQueryInit } from "./stable-query-init";

const rawUseQuery = createQueryHook(client, PREFIX);
const rawUseImmutable = createImmutableHook(client, PREFIX);

/**
 * Stabilize init reference for swr-openapi cache keys.
 * See `stable-query-init.ts` for why this is required on mobile.
 */
function useStableQueryInit<T>(init: T): T {
  const serialized = serializeQueryInit(init as object | null | undefined);
  return useMemo(() => deserializeQueryInit<T>(serialized) as T, [serialized]);
}

/**
 * Preserve call signatures from swr-openapi while stabilizing init.
 * Typed loosely at the wrapper boundary; public exports re-assert original types.
 */
function wrapStableInitHook<THook extends (path: never, init?: never, config?: never) => unknown>(
  useRaw: THook
): THook {
  const wrapped = (path: never, init?: never, config?: never) => {
    // swr-openapi: useQuery(path, ...[init, config])
    const stableInit = useStableQueryInit(init);
    return useRaw(path, stableInit as never, config);
  };
  return wrapped as THook;
}

export const useQuery = wrapStableInitHook(rawUseQuery);
export const useImmutable = wrapStableInitHook(rawUseImmutable);
export const useInfinite = createInfiniteHook(client, PREFIX);
export const useMutate = createMutateHook(client, PREFIX, isMatch);

/** Module-level constant for `useQuery(path, EMPTY_QUERY_INIT)` — stable by reference too */
export const EMPTY_QUERY_INIT = Object.freeze({});
