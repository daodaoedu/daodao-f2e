import {
  createQueryHook,
  createImmutableHook,
  createInfiniteHook,
  createMutateHook,
} from 'swr-openapi';

import { client } from './client';
import { isMatch } from './is-match';

/**
 * 建立 SWR hooks 的 factory function
 * @param prefix - Entity 的 prefix，用於區分不同 entity 的 cache namespace
 */
export const createUseQuery = (prefix: string) =>
  createQueryHook(client, prefix);

export const createUseImmutable = (prefix: string) =>
  createImmutableHook(client, prefix);

export const createUseInfinite = (prefix: string) =>
  createInfiniteHook(client, prefix);

export const createUseMutate = (prefix: string) =>
  createMutateHook(client, prefix, isMatch);

