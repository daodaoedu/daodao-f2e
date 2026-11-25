"use client";

import { updatePractice } from "@daodao/api";
import { useTranslations } from "@daodao/i18n";
import { toast } from "@daodao/ui/components/sonner";
import { useCallback } from "react";
import { useServerErrorMessage } from "@/lib/server-error/use-server-error-message";

/**
 * 燈塔場次實踐在 DB 仍是 draft，列表上點「打卡」前先啟用（daodao#544），
 * 與場次頁、詳情頁同一個呼叫；成功後由呼叫端刷新列表。
 */
export function useActivateCohortDraft(onActivated: () => Promise<unknown>) {
  const tCohort = useTranslations("cohort");
  const { errorMessage } = useServerErrorMessage();
  return useCallback(
    async (practiceId: string): Promise<boolean> => {
      try {
        const response = await updatePractice(practiceId, { status: "active", isDraft: false });
        if (response.error) {
          toast.error(
            errorMessage(response.error, tCohort("activate_failed"), {
              status: response.response.status,
            })
          );
          return false;
        }
        await onActivated();
        return true;
      } catch {
        toast.error(tCohort("activate_failed"));
        return false;
      }
    },
    [errorMessage, onActivated, tCohort]
  );
}
