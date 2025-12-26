"use client";

import {
  createImmutableHook,
  createInfiniteHook,
  createMutateHook,
  createQueryHook,
} from "swr-openapi";
import { client, PREFIX } from "./client";
import { isMatch } from "./is-match";

export const useQuery = createQueryHook(client, PREFIX);
export const useImmutable = createImmutableHook(client, PREFIX);
export const useInfinite = createInfiniteHook(client, PREFIX);
export const useMutate = createMutateHook(client, PREFIX, isMatch);
