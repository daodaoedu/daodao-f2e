"use client";

import { useAuth } from "../hooks/use-auth";

interface LoginButtonProps {
  children: React.ReactNode;
  redirectUrl?: string;
  className?: string;
  onClick?: () => void;
}

/**
 * 登入按鈕組件
 * 點擊後啟動 OAuth 登入流程
 *
 * @example
 * ```typescript
 * <LoginButton redirectUrl="/dashboard">
 *   Enter App
 * </LoginButton>
 * ```
 */
export const LoginButton = ({ children, redirectUrl, className, onClick }: LoginButtonProps) => {
  const { login } = useAuth();

  const handleClick = () => {
    if (onClick) {
      onClick();
    }
    login(redirectUrl);
  };

  return (
    <button type="button" onClick={handleClick} className={className}>
      {children}
    </button>
  );
};
