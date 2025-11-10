import createClient from 'openapi-fetch';

import type { paths } from '@/shared/api/openapi-types';

export const client = createClient<paths>({
  baseUrl: process.env.NEXT_PUBLIC_API_URL,
});

/**
 * SWR cache key prefixes for each entity
 * 集中管理所有 entity 的 prefix，避免衝突
 */
export const prefixKeys = {
  user: 'user',
} as const;

export type PrefixKey = keyof typeof prefixKeys;
