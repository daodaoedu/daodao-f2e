"use client";

import {
  createQueryHook,
  createImmutableHook,
  createInfiniteHook,
  createMutateHook,
} from "swr-openapi";

import { isMatch } from "./is-match";
import { PREFIX, client } from "./client";
import type { paths } from "./types";

export const useQuery = createQueryHook<paths, never, typeof PREFIX>(client, PREFIX) as ReturnType<
  typeof createQueryHook<paths, never, typeof PREFIX>
>;

export const useImmutable = createImmutableHook<paths, never, typeof PREFIX>(
  client,
  PREFIX
) as ReturnType<typeof createImmutableHook<paths, never, typeof PREFIX>>;

export const useInfinite = createInfiniteHook<paths, never, typeof PREFIX>(
  client,
  PREFIX
) as ReturnType<typeof createInfiniteHook<paths, never, typeof PREFIX>>;

export const useMutate = createMutateHook<paths, never>(client, PREFIX, isMatch) as ReturnType<
  typeof createMutateHook<paths, never>
>;
