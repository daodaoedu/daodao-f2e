/**
 * Next.js API Client
 * 統一管理 Next.js API Routes 的調用
 *
 * 此 client 用於調用前端應用內部的 API Routes（/api/*）
 * 與後端 API client 不同，後者用於調用外部後端服務（NEXT_PUBLIC_API_URL）
 */

import { getRequiredEnv } from "@daodao/config";

// ============================================================================
// Base Client
// ============================================================================

/**
 * 取得 API 基礎 URL
 * Server-side 需要完整 URL，Client-side 使用相對路徑
 */
const getApiBaseUrl = (): string => {
  if (typeof window === "undefined") {
    // Server-side: 需要完整的 URL
    return getRequiredEnv("NEXT_PUBLIC_APP_URL");
  }
  // Client-side: 使用相對路徑
  return "";
};

/**
 * 統一的 fetch 包裝函數
 * 處理錯誤和回應解析
 */
const apiFetch = async <T>(
  endpoint: string,
  options?: RequestInit
): Promise<{ success: true; data: T } | { success: false; error: string }> => {
  const baseUrl = getApiBaseUrl();
  const url = `${baseUrl}${endpoint}`;

  try {
    const response = await fetch(url, {
      ...options,
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        ...options?.headers,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: data.error || `HTTP ${response.status}: ${response.statusText}`,
      };
    }

    return {
      success: true,
      data: data.data || data,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
};

// ============================================================================
// Export Base Client
// ============================================================================

export { apiFetch, getApiBaseUrl };
