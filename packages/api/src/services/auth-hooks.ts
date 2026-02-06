"use client";

/**
 * Auth API Hooks
 * 提供認證相關的 React Hooks（用於 Client Components）
 */

import { client } from "../client";
import type {
  ForgotPasswordRequest,
  LoginRequest,
  RegisterRequest,
  ResendVerificationRequest,
  ResetPasswordRequest,
  VerifyEmailRequest,
} from "./auth";

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

    /**
     * 重新發送驗證郵件
     */
    resendVerificationEmail: async (data: ResendVerificationRequest) => {
      return client.POST("/api/v1/auth/resend-verification", {
        body: data,
      });
    },

    /**
     * 獲取當前認證用戶資訊
     */
    getAuthMe: async () => {
      return client.GET("/api/v1/auth/me");
    },
  };
};
