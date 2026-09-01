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

/**
 * 供尚未出現在 OpenAPI spec 的端點使用（目前為 /progress 與 /time-spent，
 * server 端尚未註冊到 spec）。已進 spec 的端點一律走 typed client。
 */
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
      switch (entityType) {
        case "practice":
          client
            .POST("/api/v1/practices/{id}/view", {
              params: { path: { id: String(entityId) } },
              body: { entityType: "practice", entityId: String(entityId) },
            })
            .catch(() => {
              // fire-and-forget: ignore errors
            });
          return;
        case "resource":
          client
            .POST("/api/v1/resources/{resourceId}/view", {
              params: { path: { resourceId: String(entityId) } },
            })
            .catch(() => {
              // fire-and-forget: ignore errors
            });
          return;
        case "persona_question":
          client
            .POST("/api/v1/persona/questions/{questionId}/view", {
              params: { path: { questionId: Number(entityId) } },
            })
            .catch(() => {
              // fire-and-forget: ignore errors
            });
          return;
        case "practice_checkin": {
          // 打卡的觀看端點掛在所屬 practice 底下，缺 practiceId 就無從記錄
          if (options?.practiceId == null) return;
          client
            .POST("/api/v1/practices/{id}/checkins/{checkInId}/view", {
              params: {
                path: {
                  id: String(options.practiceId),
                  checkInId: String(entityId),
                },
              },
            })
            .catch(() => {
              // fire-and-forget: ignore errors
            });
          return;
        }
        default:
          // 新增 ViewTrackingEntityType 卻忘了接上端點時，這行會在編譯期報錯；
          // runtime 靜默略過，避免追蹤問題影響主流程
          entityType satisfies never;
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
