"use client";

/**
 * Auth API Hooks
 * 提供認證相關的 React Hooks（用於 Client Components）
 */

import { client } from "../client";
import type { paths } from "../types";

type LoginRequest =
  paths["/api/v1/auth/login"]["post"]["requestBody"] extends { content: { "application/json": infer T } }
    ? T
    : never;
type RegisterRequest =
  paths["/api/v1/auth/register"]["post"]["requestBody"] extends { content: { "application/json": infer T } }
    ? T
    : never;
type ForgotPasswordRequest =
  paths["/api/v1/auth/forgot-password"]["post"]["requestBody"] extends { content: { "application/json": infer T } }
    ? T
    : never;
type ResetPasswordRequest =
  paths["/api/v1/auth/reset-password"]["post"]["requestBody"] extends { content: { "application/json": infer T } }
    ? T
    : never;
type VerifyEmailRequest =
  paths["/api/v1/auth/verify-email"]["post"]["requestBody"] extends { content: { "application/json": infer T } }
    ? T
    : never;

// ============================================================================
// Mutation Hooks
// ============================================================================

/**
 * 認證相關的 Mutation Hook
 */
export const useAuthMutations = () => {
  return {
    /**
     * 登入
     */
    login: async (data: LoginRequest) => {
      return client.POST("/api/v1/auth/login", {
        body: data,
      });
    },

    /**
     * 註冊
     */
    register: async (data: RegisterRequest) => {
      return client.POST("/api/v1/auth/register", {
        body: data,
      });
    },

    /**
     * 登出
     */
    logout: async () => {
      return client.POST("/api/v1/auth/logout", {});
    },

    /**
     * 刷新 Token
     */
    refreshToken: async () => {
      return client.POST("/api/v1/auth/refresh", {});
    },

    /**
     * 忘記密碼
     */
    forgotPassword: async (data: ForgotPasswordRequest) => {
      return client.POST("/api/v1/auth/forgot-password", {
        body: data,
      });
    },

    /**
     * 重置密碼
     */
    resetPassword: async (data: ResetPasswordRequest) => {
      return client.POST("/api/v1/auth/reset-password", {
        body: data,
      });
    },

    /**
     * 驗證電子郵件
     */
    verifyEmail: async (data: VerifyEmailRequest) => {
      return client.POST("/api/v1/auth/verify-email", {
        body: data,
      });
    },
  };
};
