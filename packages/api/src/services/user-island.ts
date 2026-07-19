// Imports
import { client } from "../client";
import type { paths } from "../types";

// Types
export type UserIslandResponseType =
  paths["/api/v1/users/{identifier}/island"]["get"]["responses"]["200"]["content"]["application/json"];
export type IslandDataType = NonNullable<UserIslandResponseType["data"]>;
export type IslandPracticeType = IslandDataType["practices"][number];

/**
 * 取得 3D 島嶼頁 islandData 聚合資料
 *
 * 無需登入；帶認證可取得 viewerRelation（self/connection）與對應的隱私過濾結果。
 * SSR 呼叫時需手動轉發 auth_token cookie（傳入 headers.Cookie），
 * 否則 server 端 fetch 不會帶入瀏覽器的認證資訊。
 */
export const getUserIsland = async (identifier: string, headers?: Record<string, string>) => {
  return client.GET("/api/v1/users/{identifier}/island", {
    params: {
      path: {
        identifier,
      },
    },
    ...(headers && { headers }),
    cache: "no-store",
  });
};
