'use client';

import {
  createQueryHook,
  createImmutableHook,
  createInfiniteHook,
  createMutateHook,
} from 'swr-openapi';

import { isMatch } from './is-match';
import { PREFIX, client } from './client';

export const useQuery = createQueryHook(client, PREFIX);
export const useImmutable = createImmutableHook(client, PREFIX);
export const useInfinite = createInfiniteHook(client, PREFIX);
export const useMutate = createMutateHook(client, PREFIX, isMatch);
