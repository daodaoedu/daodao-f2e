"use client";

import { useAuth } from "@daodao/auth";
import { useTranslations } from "@daodao/i18n";
import { useDialog } from "@daodao/ui/hooks/use-dialog";
import { useCallback, useState } from "react";
import { useSWRConfig } from "swr";

export enum LogoutResult {
  /** 用戶已成功登出 */
  LoggedOut,
  /** 用戶取消了操作 */
  Cancelled,
}

/**
 * 使用全局 DialogManager 來顯示登出確認對話框的 Hook
 *
 * @example
 * ```tsx
 * const { openLogoutDialog, isLoggingOut } = useLogoutDialog();
 *
 * // 當需要顯示對話框時
 * const result = await openLogoutDialog();
 *
 * if (result === LogoutResult.LoggedOut) {
 *   // 用戶已成功登出
 * }
 * ```
 */
export function useLogoutDialog() {
  const t = useTranslations("common");
  const { openWarningDialog } = useDialog();
  const { logout } = useAuth();
  const { cache } = useSWRConfig();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const openLogoutDialog = useCallback(async (): Promise<LogoutResult> => {
    // 顯示確認對話框
    const result = await openWarningDialog({
      title: t("logout_title"),
      message: t("logout_message"),
      textAlign: "left",
      buttons: [
        { label: t("logout_confirm"), value: "confirm", variant: "outline" },
        { label: t("cancel"), value: "cancel", variant: "orange" },
      ],
    });

    // 如果用戶取消，直接返回
    if (result.value !== "confirm") {
      return LogoutResult.Cancelled;
    }

    // 用戶確認登出
    setIsLoggingOut(true);
    try {
      // 執行登出
      await logout();

      // 清除 SWR cache
      if (cache instanceof Map) {
        cache.clear();
      }

      // 重定向到登入頁（用 hard navigation 切斷 route protection 的競態 redirect）
      window.location.href = "/auth/login";

      return LogoutResult.LoggedOut;
    } finally {
      setIsLoggingOut(false);
    }
  }, [openWarningDialog, logout, cache, t]);

  return { openLogoutDialog, isLoggingOut };
}
