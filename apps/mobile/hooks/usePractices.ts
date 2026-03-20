// apps/mobile/hooks/usePractices.ts
import { useCallback, useMemo, useRef, useState } from "react";
import {
  createPracticeCheckIn,
  useMutate,
  usePracticeById,
  usePracticeCheckIns,
} from "@daodao/api";
import type { components } from "@daodao/api/src/types";

// 正確名稱是 CheckInEntity（不是 CheckInItem）
type CheckInItem = components["schemas"]["CheckInEntity"];

// ── usePractice ───────────────────────────────────────────────────────────────

// 注意：此 wrapper 僅應在 `[id]` route component 使用，id 由路由保證非空。
export function usePractice(id: string) {
  const { data, error, isLoading, mutate } = usePracticeById(id);
  return {
    practice: data?.data ?? undefined,
    isLoading,
    error,
    mutate,
  };
}

// ── useCheckIns ───────────────────────────────────────────────────────────────

// 注意：同 usePractice，id 由 [id] 路由保證非空。
export function useCheckIns(practiceId: string) {
  const { data, error, isLoading, mutate } = usePracticeCheckIns(practiceId, {
    limit: 365,
  });

  const checkIns: CheckInItem[] = data?.data ?? [];

  // CheckInEntity 有 checkinDate（YYYY-MM-DD）和 createdAt（ISO datetime）兩個欄位
  // 用 checkinDate 語義更正確（記錄打卡日期，不受 createdAt 時區影響）
  const checkInDates = useMemo(
    () => checkIns.map((ci) => ci.checkinDate),
    [checkIns]
  );

  return { checkIns, checkInDates, isLoading, error, mutate };
}

// ── useCheckIn ────────────────────────────────────────────────────────────────

interface CheckInParams {
  practiceId: string;
  note?: string;
}

interface CheckInResult {
  success: boolean;
  error?: string;
}

export function useCheckIn() {
  const [isChecking, setIsChecking] = useState(false);
  const isCheckingRef = useRef(false);
  const mutate = useMutate();

  const checkIn = useCallback(
    async ({ practiceId, note }: CheckInParams): Promise<CheckInResult> => {
      if (isCheckingRef.current) {
        return { success: false, error: "正在處理中" };
      }

      isCheckingRef.current = true;
      setIsChecking(true);

      try {
        // CheckInRequest 的 tags 是必填（non-optional）
        await createPracticeCheckIn(practiceId, {
          note: note ?? "",
          imageUrls: [],
          tags: [],
        });
        // swr-openapi 的 useMutate key 格式是 2-tuple：[path, { params }]
        // 順序：先刷新詳情，再刷新列表（與 packages/api 的 refreshPracticeCaches 一致）
        await mutate([
          "/api/v1/practices/{id}",
          { params: { path: { id: practiceId } } },
        ] as const);
        await mutate([
          "/api/v1/me/practices",
          { params: { query: {} } },
        ] as const);
        return { success: true };
      } catch (error) {
        const message = error instanceof Error ? error.message : "打卡失敗，請稍後再試";
        return { success: false, error: message };
      } finally {
        isCheckingRef.current = false;
        setIsChecking(false);
      }
    },
    [mutate]
  );

  return { checkIn, isChecking };
}
