"use client";

/**
 * View Tracking Hooks
 * 提供瀏覽追蹤相關的 React Hooks
 */

import { useCallback, useEffect, useRef } from "react";
import { client } from "../client";

export type ViewTrackingEntityType =
  | "practice"
  | "resource"
  | "persona_question"
  | "practice_checkin";

type UntypedPostClient = {
  POST: (url: string, init: { body: unknown }) => Promise<unknown>;
};

/** 巢狀資源記錄觀看時需要的父層 ID（如打卡需帶所屬 practice） */
type RecordViewOptions = { practiceId?: string | number };

/**
 * 記錄瀏覽事件的 Hook（fire-and-forget）
 * 進入詳情頁時呼叫，不等待結果
 */
export const useRecordView = () => {
  return useCallback(
    (
      entityType: ViewTrackingEntityType,
      entityId: string | number,
      options?: RecordViewOptions
    ) => {
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
      } else if (entityType === "persona_question") {
        // 尚未同步進 generated types（server dev branch 合併後才有），先走 untyped client
        (client as unknown as UntypedPostClient)
          .POST(`/api/v1/persona/questions/${entityId}/view`, { body: undefined })
          .catch(() => {
            // fire-and-forget: ignore errors
          });
      } else if (entityType === "practice_checkin") {
        // 打卡的觀看端點掛在所屬 practice 底下，缺 practiceId 就無從記錄
        if (options?.practiceId == null) return;
        // 尚未同步進 generated types（server dev branch 合併後才有），先走 untyped client
        (client as unknown as UntypedPostClient)
          .POST(`/api/v1/practices/${options.practiceId}/checkins/${entityId}/view`, {
            body: undefined,
          })
          .catch(() => {
            // fire-and-forget: ignore errors
          });
      }
    },
    []
  );
};

const READ_PROGRESS_THRESHOLDS = [25, 50, 75, 100];

export const useRecordReadProgress = (practiceId: string | number) => {
  const tracked = useRef(new Set<number>());

  useEffect(() => {
    tracked.current = new Set<number>();

    const handleScroll = () => {
      const el = document.documentElement;
      const depth = Math.round(((el.scrollTop + el.clientHeight) / el.scrollHeight) * 100);
      for (const threshold of READ_PROGRESS_THRESHOLDS) {
        if (depth >= threshold && !tracked.current.has(threshold)) {
          tracked.current.add(threshold);
          (client as unknown as UntypedPostClient)
            .POST(`/api/v1/practices/${practiceId}/progress`, {
              body: { depthPercent: threshold },
            })
            .catch(() => {});
        }
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, [practiceId]);
};

export const useRecordTimeSpent = (practiceId: string | number) => {
  const startTime = useRef(Date.now());

  useEffect(() => {
    startTime.current = Date.now();

    const send = () => {
      const seconds = Math.round((Date.now() - startTime.current) / 1000);
      if (seconds < 5) return;
      (client as unknown as UntypedPostClient)
        .POST(`/api/v1/practices/${practiceId}/time-spent`, {
          body: { seconds },
        })
        .catch(() => {});
    };

    const onVisibilityChange = () => {
      if (document.visibilityState === "hidden") send();
    };

    document.addEventListener("visibilitychange", onVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", onVisibilityChange);
      send();
    };
  }, [practiceId]);
};
