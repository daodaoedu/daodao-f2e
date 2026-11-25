"use client";

import { useAuthContext } from "@daodao/auth";
import { createContext, type ReactNode, useContext, useEffect, useState } from "react";
import { initialLayoutGuest, resolvedLayoutGuest } from "./sidebar-gutter";

/**
 * 伺服器端讀到的「有沒有登入 cookie」（daodao#567）。
 * 只是版面的樂觀判斷；真正的登入狀態仍以 AuthProvider 為準。null＝不知道。
 */
const SessionHintContext = createContext<boolean | null>(null);

export function SessionHintProvider({
  hasSessionCookie,
  children,
}: {
  hasSessionCookie: boolean | null;
  children: ReactNode;
}) {
  return (
    <SessionHintContext.Provider value={hasSessionCookie}>{children}</SessionHintContext.Provider>
  );
}

/**
 * 版面是否當作訪客：第一次畫面用伺服器的 cookie 判斷，登入檢查完成後以實際狀態修正。
 * 共用外框（側欄空位）與探索頁（訪客頁首）共用，兩者同時切換。
 */
export function useLayoutGuest(): boolean {
  const hasSessionCookie = useContext(SessionHintContext);
  const { isLoading, isAuthenticated } = useAuthContext();
  const [isGuest, setIsGuest] = useState(() => initialLayoutGuest(hasSessionCookie));
  useEffect(() => {
    const resolved = resolvedLayoutGuest({ isLoading, isAuthenticated });
    if (resolved !== null) setIsGuest(resolved);
  }, [isLoading, isAuthenticated]);
  return isGuest;
}
