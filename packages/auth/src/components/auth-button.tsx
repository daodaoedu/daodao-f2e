"use client";

import { Button, type ButtonProps } from "@daodao/ui/components/button";
import { useAuth } from "../hooks/use-auth";

export interface AuthButtonProps extends ButtonProps {
  /** 登入後要跳轉的 URL（未登入時開啟登入彈窗） */
  redirectUrl?: string;
  /** 來源網站 */
  source?: "website" | "app";
}

/**
 * 認證按鈕組件
 * 如果已登入，正常觸發點擊；如果未登入，開啟登入彈窗
 * 登入成功後會跳轉到指定的 redirectUrl
 *
 * @example
 * ```tsx
 * <AuthButton
 *   onClick={() => console.log("已登入，執行操作")}
 *   redirectUrl="/dashboard"
 * >
 *   開始使用
 * </AuthButton>
 * ```
 */
export const AuthButton = ({ onClick, redirectUrl, source, ...props }: AuthButtonProps) => {
  const { isAuthenticated, openLoginDialog } = useAuth();

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (isAuthenticated) {
      // 已登入，執行原本的 onClick
      onClick?.(e);
    } else {
      // 未登入，開啟登入彈窗
      openLoginDialog({ redirectUrl, source });
    }
  };

  return <Button onClick={handleClick} {...props} />;
};
