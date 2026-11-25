"use client";

import useSWR, { type SWRConfiguration } from "swr";
import { client, PREFIX } from "../client";

/** HTTP outcome of one lighthouse access check; `count` is the list length on success. */
export type LighthouseAccessProbe = { status: number; count: number | null };

type LighthouseAccessProbePath =
  | "/api/v1/lighthouse/organizations"
  | "/api/v1/lighthouse/my-cohort-resource-bindings";

// 與一般查詢不同的 init，同一個 cache key 才不會存兩種資料形狀；
// useMutate()(["/api/v1/lighthouse/organizations"]) 不帶 init，仍會刷新這裡。
const ACCESS_PROBE_INIT = Object.freeze({ accessProbe: true });

/**
 * Lighthouse access check that keeps the HTTP status (daodao#568).
 *
 * swr-openapi throws only the error body, and the server labels 403, 429 and
 * 500 alike as `APP_ERROR`, so callers could not tell "not a member" from an
 * outage. This resolves with the status instead of throwing on HTTP errors;
 * network failures still surface as SWR `error`.
 */
export const useLighthouseAccessProbe = (
  path: LighthouseAccessProbePath,
  enabled: boolean,
  config?: SWRConfiguration<LighthouseAccessProbe>
) =>
  useSWR<LighthouseAccessProbe>(
    enabled ? [PREFIX, path, ACCESS_PROBE_INIT] : null,
    async () => {
      const res = await client.GET(path);
      const list = (res.data as { data?: unknown } | undefined)?.data;
      return {
        status: res.response.status,
        count: res.error === undefined && Array.isArray(list) ? list.length : null,
      };
    },
    config
  );
