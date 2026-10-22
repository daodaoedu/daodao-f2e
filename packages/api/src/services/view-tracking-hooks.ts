"use client";

/**
 * View Tracking Hooks
 * 提供瀏覽追蹤相關的 React Hooks
 */

import { useCallback, useEffect, useRef } from "react";
import { client } from "../client";
import { createTimeSpentReporter, type TimeSpentReporter } from "./time-spent-reporter";

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
          // 尚未同步進 generated types（server dev branch 合併後才有），先走 untyped client
          (client as unknown as UntypedPostClient)
            .POST(`/api/v1/persona/questions/${entityId}/view`, { body: undefined })
            .catch(() => {
              // fire-and-forget: ignore errors
            });
          return;
        case "practice_checkin": {
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

/**
 * 記錄實踐詳情頁停留時間；離開頁面或分頁隱藏時回報。
 * 回傳 stop：實踐已刪除時呼叫，跳頁 unmount 就不會再送 time-spent（否則 404，daodao#369）。
 */
export const useRecordTimeSpent = (practiceId: string | number) => {
  const reporterRef = useRef<TimeSpentReporter | null>(null);

  useEffect(() => {
    const reporter = createTimeSpentReporter({
      now: () => Date.now(),
      post: (seconds) => {
        (client as unknown as UntypedPostClient)
          .POST(`/api/v1/practices/${practiceId}/time-spent`, {
            body: { seconds },
          })
          .catch(() => {});
      },
    });
    reporterRef.current = reporter;

    const onVisibilityChange = () => {
      if (document.visibilityState === "hidden") reporter.send();
    };

    document.addEventListener("visibilitychange", onVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", onVisibilityChange);
      reporter.send();
    };
  }, [practiceId]);

  const stop = useCallback(() => {
    reporterRef.current?.stop();
  }, []);

  return { stop };
};
