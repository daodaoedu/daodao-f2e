import createClient, {
  type Middleware,
  ClientPathsWithMethod,
  FetchResponse,
  MaybeOptionalInit,
} from 'openapi-fetch';

import type { paths } from './openapi-types';
import getEnv from '../config/env';
import { getTokenStorage } from '../lib/storage';

export const PREFIX = 'dao-dao-server-api' as const;

export const client = createClient<paths>({
  baseUrl: process.env.NEXT_PUBLIC_API_URL,
});

const middleware: Middleware = {
  async onRequest({ request }) {
    if (getEnv().isServerSide) {
      const headers = await import('next/headers').then((mod) => mod.headers());
      Array.from(headers.entries()).forEach(([key, value]) => {
        if (key.toLowerCase() === 'accept-encoding') {
          return;
        }
        request.headers.set(key, value);
      });
    } else {
      const token = getTokenStorage().get();
      if (token) {
        request.headers.set('Authorization', `Bearer ${token}`);
      }
    }
    return request;
  },
};

client.use(middleware);

type InitParam<Init> = Init extends undefined ? never : Init;

/**
 * Generate SWR cache key
 * For use with SWRConfig fallback in Server Components
 * Automatically infers init parameter types based on the path
 *
 * @example
 * ```typescript
 * // Path without required params - no init needed
 * const key1 = getSwrKey('/api/v1/users');
 * // Type: readonly ["dao-dao-server-api", "/api/v1/users"]
 *
 * // Path with required params - init required
 * const key2 = getSwrKey('/api/v1/users/{id}', {
 *   params: { path: { id: '123' } } // ✅ TypeScript will infer the correct type
 * });
 * // Type: readonly ["dao-dao-server-api", "/api/v1/users/{id}", {...}]
 *
 * // Use in Server Component with SWRConfig
 * const response = await client.GET(path, init);
 * return (
 *   <SWRConfig value={{ fallback: { [unstable_serialize(key)]: response } }}>
 *     {children}
 *   </SWRConfig>
 * );
 * ```
 */
export const getSwrKey = <
  Path extends ClientPathsWithMethod<typeof client, 'get'>,
  Init extends MaybeOptionalInit<paths[Path], 'get'> = MaybeOptionalInit<
    paths[Path],
    'get'
  >,
>(
  path: Path,
  init: InitParam<Init>
) => [PREFIX, path, init] as const;

/**
 * Generate SWR cache key and fetch data in one call
 * Combines `getSwrKey` and API call for convenience
 * Returns both the key and response for SWRConfig fallback
 *
 * @param path - API endpoint path (automatically inferred from OpenAPI schema)
 * @param init - Optional init parameter (params, headers, etc.) based on the path requirements
 * @returns Promise of [swrKey, response] tuple for SWRConfig fallback
 *
 * @example
 * ```typescript
 * // Path without required params - no init needed
 * const [key1, response1] = await getSwrKeyWithResponse('/api/v1/users');
 *
 * // Path with required params - init required
 * const [key2, response2] = await getSwrKeyWithResponse('/api/v1/users/{id}', {
 *   params: { path: { id: '123' } } // ✅ TypeScript will infer the correct type
 * });
 *
 * // Use in Server Component with SWRConfig
 * return (
 *   <SWRConfig value={{ fallback: { [unstable_serialize(key)]: response } }}>
 *     {children}
 *   </SWRConfig>
 * );
 * ```
 *
 * @see getSwrKey - If you only need the cache key
 */
export const getSwrKeyWithResponse = async <
  Path extends ClientPathsWithMethod<typeof client, 'get'>,
  Init extends MaybeOptionalInit<paths[Path], 'get'> = MaybeOptionalInit<
    paths[Path],
    'get'
  >,
  Media extends `${string}/${string}` = 'application/json',
>(
  path: Path,
  init: InitParam<Init>
): Promise<
  readonly [
    readonly [typeof PREFIX, Path, InitParam<Init>?],
    FetchResponse<paths[Path]['get'], Init, Media>,
  ]
> => Promise.all([getSwrKey(path, init), client.GET(path, init)] as const);
