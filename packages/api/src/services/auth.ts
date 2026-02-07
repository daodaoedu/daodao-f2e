/**
 * Auth API Service
 * 提供認證相關的 API 調用函數
 */

import { getRequiredEnv } from "@daodao/config";
import { client } from "../client";
import type { paths } from "../types";

const API_URL = getRequiredEnv("NEXT_PUBLIC_API_URL");

// ============================================================================
// Types
// ============================================================================

type LoginRequest = paths["/api/v1/auth/login"]["post"]["requestBody"] extends {
  content: { "application/json": infer T };
}
  ? T
  : never;
type RegisterRequest = paths["/api/v1/auth/register"]["post"]["requestBody"] extends {
  content: { "application/json": infer T };
}
  ? T
  : never;
type ForgotPasswordRequest = paths["/api/v1/auth/forgot-password"]["post"]["requestBody"] extends {
  content: { "application/json": infer T };
}
  ? T
  : never;
type ResetPasswordRequest = paths["/api/v1/auth/reset-password"]["post"]["requestBody"] extends {
  content: { "application/json": infer T };
}
  ? T
  : never;
type VerifyEmailRequest = paths["/api/v1/auth/verify-email"]["post"]["requestBody"] extends {
  content: { "application/json": infer T };
}
  ? T
  : never;
type ResendVerificationRequest =
  NonNullable<paths["/api/v1/auth/resend-verification"]["post"]["requestBody"]> extends {
    content: { "application/json": infer T };
  }
    ? T
    : never;

// ============================================================================
// Client Functions (用於 Server Components 或直接調用)
// ============================================================================

/**
 * 登入
 */
export const login = async (data: LoginRequest) => {
  return client.POST("/api/v1/auth/login", {
    body: data,
  });
};

/**
 * 註冊
 */
export const register = async (data: RegisterRequest) => {
  return client.POST("/api/v1/auth/register", {
    body: data,
  });
};

/**
 * 登出
 */
export const logout = async () => {
  return client.POST("/api/v1/auth/logout");
};

/**
 * 刷新 Token
 */
export const refreshToken = async () => {
  return client.POST("/api/v1/auth/refresh");
};

/**
 * 忘記密碼
 */
export const forgotPassword = async (data: ForgotPasswordRequest) => {
  return client.POST("/api/v1/auth/forgot-password", {
    body: data,
  });
};

/**
 * 重置密碼
 */
export const resetPassword = async (data: ResetPasswordRequest) => {
  return client.POST("/api/v1/auth/reset-password", {
    body: data,
  });
};

/**
 * 驗證電子郵件
 */
export const verifyEmail = async (data: VerifyEmailRequest) => {
  return client.POST("/api/v1/auth/verify-email", {
    body: data,
  });
};

/**
 * 重新發送驗證郵件
 */
export const resendVerificationEmail = async (data: ResendVerificationRequest) => {
  return client.POST("/api/v1/auth/resend-verification", {
    body: data,
  });
};

/**
 * 獲取當前認證用戶資訊（支援臨時用戶）
 * 使用 /api/v1/auth/me 端點，可正確處理臨時用戶狀態
 */
export const getAuthMe = async () => {
  return client.GET("/api/v1/auth/me");
};

/**
 * 啟動 Google OAuth 登入（重定向到後端）
 * 注意：這會觸發瀏覽器重定向，不返回 Response
 */
export const initiateGoogleOAuth = (state?: string) => {
  const url = state
    ? `${API_URL}/api/v1/auth/google?state=${encodeURIComponent(state)}`
    : `${API_URL}/api/v1/auth/google`;
  // 這會由瀏覽器處理重定向，不需要返回 Response
  if (typeof window !== "undefined") {
    window.location.href = url;
  }
};

// ============================================================================
// Export Types
// ============================================================================

export type {
  LoginRequest,
  RegisterRequest,
  ForgotPasswordRequest,
  ResetPasswordRequest,
  VerifyEmailRequest,
  ResendVerificationRequest,
};
