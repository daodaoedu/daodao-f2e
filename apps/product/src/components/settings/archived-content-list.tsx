"use client";

import type { UpdatePracticeRequestType } from "@daodao/api";
import { updatePractice, useMyPractices, useUnarchivePractice } from "@daodao/api";
import { Button } from "@daodao/ui/components/button";
import { toast } from "@daodao/ui/components/sonner";
import { useCallback, useState } from "react";

export const ArchivedContentList = () => {
  const [unarchivingIds, setUnarchivingIds] = useState<Set<string>>(new Set());
  const { unarchivePractice } = useUnarchivePractice();

  // 查詢已封存的實踐
  const { data, isLoading, error, mutate } = useMyPractices({
    status: "archived",
    limit: 100,
  });

  const practices = data?.data || [];

  const handleUnarchive = useCallback(
    async (practiceId: string) => {
      // 防止重複點擊
      if (unarchivingIds.has(practiceId)) {
        return;
      }

      setUnarchivingIds((prev) => new Set(prev).add(practiceId));

      try {
        // 使用封裝好的 hook 來取消封存（自動處理 cache 刷新）
        await unarchivePractice(practiceId);

        // 刷新已封存實踐列表的 cache
        await mutate();

        // 顯示成功 toast，帶有復原按鈕
        toast.success("實踐已成功取消封存", {
          action: {
            label: "復原",
            onClick: async () => {
              // 用戶點擊復原，重新封存
              try {
                const restoreResponse = await updatePractice(practiceId, {
                  status: "archived",
                } as UpdatePracticeRequestType);

                if (restoreResponse.error) {
                  const errorMessage =
                    restoreResponse.error &&
                    typeof restoreResponse.error === "object" &&
                    "message" in restoreResponse.error
                      ? String(restoreResponse.error.message)
                      : "復原失敗";
                  console.error("Failed to restore archive:", errorMessage);
                  toast.error(errorMessage);
                  return;
                }

                // 刷新已封存實踐列表的 cache
                await mutate();

                toast.success("已復原封存");
              } catch (error) {
                const errorMessage = error instanceof Error ? error.message : "復原失敗";
                console.error("Failed to restore archive:", errorMessage);
                toast.error(errorMessage);
              }
            },
          },
        });

        setUnarchivingIds((prev) => {
          const next = new Set(prev);
          next.delete(practiceId);
          return next;
        });
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "取消封存失敗";
        console.error("Failed to unarchive practice:", errorMessage);
        toast.error(errorMessage);
        setUnarchivingIds((prev) => {
          const next = new Set(prev);
          next.delete(practiceId);
          return next;
        });
      }
    },
    [unarchivePractice, mutate, unarchivingIds]
  );

  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl p-6">
        <h2 className="text-lg font-medium text-bg-dark mb-6">主題實踐</h2>
        <div className="text-center py-8 text-basic-400">
          <p>載入中...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-2xl p-6">
        <h2 className="text-lg font-medium text-bg-dark mb-6">主題實踐</h2>
        <div className="text-center py-8 text-basic-400">
          <p>載入失敗，請稍後再試</p>
        </div>
      </div>
    );
  }

  if (practices.length === 0) {
    return (
      <div className="bg-white rounded-2xl p-6">
        <h2 className="text-lg font-medium text-bg-dark mb-6">主題實踐</h2>
        <div className="text-center py-8 text-basic-400">
          <p>尚無已封存的內容</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <h2 className="font-medium text-text-dark mb-3">主題實踐</h2>

      <div className="space-y-2">
        {practices.map((practice) => (
          <div
            key={practice.id}
            className="flex items-center justify-between gap-2 p-4 rounded-lg border-b border-bg-gray hover:shadow-sm transition-shadow bg-white"
          >
            <div className="flex-1 min-w-0">
              <h3 className="text-base font-medium text-text-dark line-clamp-1 mb-1">
                {practice.title}
              </h3>
              <p className="text-xs text-text-dark line-clamp-1">{practice.practiceAction || ""}</p>
            </div>
            <div className="shrink-0">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleUnarchive(practice.id)}
                disabled={unarchivingIds.has(practice.id)}
                className="h-9 px-5"
              >
                {unarchivingIds.has(practice.id) ? "處理中..." : "取消封存"}
              </Button>
            </div>
          </div>
        ))}
      </div>
    </>
  );
};
