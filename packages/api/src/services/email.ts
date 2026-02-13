/**
 * Email API Service
 * 提供郵件服務相關的 API 調用函數
 */

import { client } from "../client";
import type { components, paths } from "../types";

// ============================================================================
// Types
// ============================================================================

export type EmailStatsResponse = components["schemas"]["EmailStatsResponse"];
export type EmailHealthResponse = components["schemas"]["EmailHealthResponse"];
export type EmailPreviewResponse = components["schemas"]["EmailPreviewResponse"];
export type EmailValidationResponse = components["schemas"]["EmailValidationResponse"];
export type BulkEmailResponse = components["schemas"]["BulkEmailResponse"];
export type CustomEmailRequest = components["schemas"]["CustomEmailRequest"];
export type BulkEmailRequest = components["schemas"]["BulkEmailRequest"];
export type PreviewEmailRequest = components["schemas"]["PreviewEmailRequest"];
export type ValidateEmailRequest = components["schemas"]["ValidateEmailRequest"];
export type EmailHistoryResponse =
  paths["/api/v1/admin/email/history"]["get"]["responses"]["200"]["content"]["application/json"];

export type EmailTemplate =
  | "welcome"
  | "verification"
  | "password-reset"
  | "contact"
  | "marathon"
  | "custom";

export interface IGetEmailHistoryParams {
  emailType?: string;
  status?: "sent" | "failed" | "pending";
  recipient?: string;
  userId?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
  sortBy?: "sentAt" | "createdAt";
  sortOrder?: "asc" | "desc";
}

// ============================================================================
// Client Functions
// ============================================================================

export const getEmailStats = async (params?: { startDate?: string; endDate?: string }) => {
  return client.GET("/api/v1/email/stats", {
    params: {
      query: {
        startDate: params?.startDate,
        endDate: params?.endDate,
      },
    },
  });
};

export const getEmailHealth = async () => {
  return client.GET("/api/v1/email/health");
};

export const getEmailHistory = async (params?: IGetEmailHistoryParams) => {
  return client.GET("/api/v1/admin/email/history", {
    params: {
      query: {
        emailType: params?.emailType,
        status: params?.status,
        recipient: params?.recipient,
        userId: params?.userId,
        startDate: params?.startDate,
        endDate: params?.endDate,
        page: params?.page ? String(params.page) : undefined,
        limit: params?.limit ? String(params.limit) : undefined,
        sortBy: params?.sortBy,
        sortOrder: params?.sortOrder,
      },
    },
  });
};

export const sendVerificationEmail = async (data: {
  email: string;
  verifyLink: string;
  name?: string;
}) => {
  return client.POST("/api/v1/email/verification", { body: data });
};

export const sendWelcomeEmail = async (data: {
  email: string;
  name: string;
  hasCompletedQuiz: boolean;
  practiceUrl?: string;
  quizUrl?: string;
  illustrationUrl?: string;
  unsubscribeUrl?: string;
  userId?: number;
}) => {
  return client.POST("/api/v1/email/welcome", { body: data });
};

export const sendMarathonEmail = async (data: {
  email: string;
  name: string;
  marathonTitle: string;
  marathonDate?: string;
  marathonDescription?: string;
}) => {
  return client.POST("/api/v1/email/marathon", { body: data });
};

export const sendCustomEmail = async (data: CustomEmailRequest) => {
  return client.POST("/api/v1/email/custom", { body: data });
};

export const sendBulkEmail = async (data: BulkEmailRequest) => {
  return client.POST("/api/v1/email/bulk", { body: data });
};

export const previewEmail = async (data: PreviewEmailRequest) => {
  return client.POST("/api/v1/email/preview", { body: data });
};

export const validateEmail = async (email: string) => {
  return client.POST("/api/v1/email/validate", { body: { email } });
};
