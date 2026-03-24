"use client";

/**
 * View Tracking Hooks
 * 提供瀏覽追蹤相關的 React Hooks
 */

import { useCallback } from "react";
import { client } from "../client";

export type ViewTrackingEntityType = "practice" | "resource";

/**
 * 記錄瀏覽事件的 Hook（fire-and-forget）
 * 進入詳情頁時呼叫，不等待結果
 */
export const useRecordView = () => {
  return useCallback((entityType: ViewTrackingEntityType, entityId: string | number) => {
    if (entityType === "practice") {
      client
        .POST("/api/v1/practices/{id}/view", {
          params: { path: { id: String(entityId) } },
          body: { entityType: "practice", entityId: String(entityId) },
        })
        .catch(() => {
          // fire-and-forget: ignore errors
        });
    } else if (entityType === "resource") {
      client
        .POST("/api/v1/resources/{resourceId}/view", {
          params: { path: { resourceId: String(entityId) } },
        })
        .catch(() => {
          // fire-and-forget: ignore errors
        });
    }
  }, []);
};
