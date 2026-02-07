"use client";

import { useRouter as useI18nRouter } from "@daodao/i18n/navigation";
import { useCallback } from "react";
import { useNavigationBlocker } from "./navigation-blocker";
import { useUnsavedChangesConfirm } from "./use-unsaved-changes-confirm";

type Router = ReturnType<typeof useI18nRouter>;

/**
 * 安全的 Router Hook，會在導航前檢查是否有未儲存的變更
 * 如果有未儲存的變更，會顯示確認對話框
 *
 * @example
 * ```typescript
 * const router = useSafeRouter();
 *
 * // 使用方式與原本的 useRouter 相同
 * router.push("/dashboard");
 * router.replace("/profile");
 * router.back();
 * ```
 */
export const useSafeRouter = (): Router => {
  const router = useI18nRouter();
  const { isBlocked } = useNavigationBlocker();
  const confirmUnsavedChanges = useUnsavedChangesConfirm();

  const checkBeforeNavigate = useCallback(async (): Promise<boolean> => {
    if (isBlocked) {
      return await confirmUnsavedChanges();
    }
    return true;
  }, [isBlocked, confirmUnsavedChanges]);

  const safePush = useCallback<Router["push"]>(
    async (href, options) => {
      const shouldNavigate = await checkBeforeNavigate();
      if (shouldNavigate) {
        router.push(href, options);
      }
    },
    [router, checkBeforeNavigate]
  );

  const safeReplace = useCallback<Router["replace"]>(
    async (href, options) => {
      const shouldNavigate = await checkBeforeNavigate();
      if (shouldNavigate) {
        router.replace(href, options);
      }
    },
    [router, checkBeforeNavigate]
  );

  const safeBack = useCallback<Router["back"]>(async () => {
    const shouldNavigate = await checkBeforeNavigate();
    if (shouldNavigate) {
      router.back();
    }
  }, [router, checkBeforeNavigate]);

  return {
    ...router,
    push: safePush,
    replace: safeReplace,
    back: safeBack,
  };
};
