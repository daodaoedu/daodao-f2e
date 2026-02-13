"use client";

/**
 * Email API Hooks
 * 提供郵件服務相關的 React Hooks（用於 Client Components）
 */

import { useQuery } from "../hooks";
import type { IGetEmailHistoryParams } from "./email";

// ============================================================================
// Query Hooks
// ============================================================================

export const useEmailStats = (params?: { startDate?: string; endDate?: string }) => {
  return useQuery("/api/v1/email/stats", {
    params: {
      query: {
        startDate: params?.startDate,
        endDate: params?.endDate,
      },
    },
  });
};

export const useEmailHealth = () => {
  return useQuery("/api/v1/email/health");
};

export const useEmailHistory = (params?: IGetEmailHistoryParams) => {
  return useQuery("/api/v1/admin/email/history", {
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
