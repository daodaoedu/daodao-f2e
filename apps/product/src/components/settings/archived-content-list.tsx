"use client";

import type { UpdatePracticeRequestType } from "@daodao/api";
import { updatePractice, useMyPractices, useUnarchivePractice } from "@daodao/api";
import { useTranslations } from "@daodao/i18n";
import { Button } from "@daodao/ui/components/button";
import { toast } from "@daodao/ui/components/sonner";
import { useCallback, useState } from "react";

export const ArchivedContentList = () => {
  const t = useTranslations("app_product");
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
        toast.success(t("archived_unarchived"), {
          action: {
            label: t("undo"),
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
                      : t("archived_restore_failed");
                  console.error("Failed to restore archive:", errorMessage);
                  toast.error(errorMessage);
                  return;
                }

                // 刷新已封存實踐列表的 cache
                await mutate();

                toast.success(t("archived_restored"));
              } catch (error) {
                const errorMessage =
                  error instanceof Error ? error.message : t("archived_restore_failed");
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
        const errorMessage =
          error instanceof Error ? error.message : t("archived_unarchive_failed");
        console.error("Failed to unarchive practice:", errorMessage);
        toast.error(errorMessage);
        setUnarchivingIds((prev) => {
          const next = new Set(prev);
          next.delete(practiceId);
          return next;
        });
      }
    },
    [unarchivePractice, mutate, unarchivingIds, t]
  );

  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl p-6">
        <h2 className="text-lg font-medium text-bg-dark mb-6">{t("archived_practices_title")}</h2>
        <div className="text-center py-8 text-basic-400">
          <p>{t("loading")}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-2xl p-6">
        <h2 className="text-lg font-medium text-bg-dark mb-6">{t("archived_practices_title")}</h2>
        <div className="text-center py-8 text-basic-400">
          <p>{t("load_failed_retry")}</p>
        </div>
      </div>
    );
  }

  if (practices.length === 0) {
    return (
      <div className="bg-white rounded-2xl p-6">
        <h2 className="text-lg font-medium text-bg-dark mb-6">{t("archived_practices_title")}</h2>
        <div className="text-center py-8 text-basic-400">
          <p>{t("archived_empty")}</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <h2 className="font-medium text-text-dark mb-3">{t("archived_practices_title")}</h2>

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
                {unarchivingIds.has(practice.id) ? t("processing") : t("archived_unarchive")}
              </Button>
            </div>
          </div>
        ))}
      </div>
    </>
  );
};
