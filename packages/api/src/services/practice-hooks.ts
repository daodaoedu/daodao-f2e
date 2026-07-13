"use client";

/**
 * Practice API Hooks
 * 提供實踐相關的 React Hooks（用於 Client Components）
 */

import useSWR from "swr";
import { client, getApiBaseUrl, unauthorizedHandler } from "../client";
import { useMutate, useQuery } from "../hooks";
import type { components, paths } from "../types";
import {
  buildCreateCheckInFormData,
  buildUpdateCheckInFormData,
  extractApiErrorMessage,
  type ICheckInFormData,
} from "./check-in-form-data";
import type {
  IGetMyPracticesParams,
  IGetPracticeCheckInsParams,
  IGetPracticeStatsParams,
  IGetPracticeTemplatesParams,
  IGetRandomPracticeTemplatesParams,
  IGetUserPracticesParams,
  PracticeSummary,
} from "./practice";
import { copyPractice, getPracticeSummary } from "./practice";

export type {
  FormDataFilePart,
  ICheckInFormData,
  IReactNativeFormDataFile,
} from "./check-in-form-data";
export { extractApiErrorMessage } from "./check-in-form-data";

// ============================================================================
// Types
// ============================================================================

export type CreatePracticeRequestType = components["schemas"]["CreatePracticeRequest"];

type UpdatePracticeRequestBody = paths["/api/v1/practices/{id}"]["put"]["requestBody"];
export type UpdatePracticeRequestType = UpdatePracticeRequestBody extends {
  content: { "application/json": infer T };
}
  ? T
  : UpdatePracticeRequestBody extends undefined
    ? never
    : NonNullable<UpdatePracticeRequestBody>["content"] extends {
          "application/json": infer T;
        }
      ? T
      : never;

// ============================================================================
// Query Hooks
// ============================================================================

/**
 * 獲取當前用戶實踐列表的 Hook
 */
export const useMyPractices = (params?: IGetMyPracticesParams) => {
  return useQuery("/api/v1/me/practices", {
    params: {
      query: {
        page: params?.page,
        limit: params?.limit,
        status: params?.status,
        search: params?.search,
        sortBy: params?.sortBy,
        sortOrder: params?.sortOrder,
        dateFrom: params?.dateFrom,
        dateTo: params?.dateTo,
      },
    },
  });
};

/**
 * 獲取當前用戶實踐統計的 Hook
 */
export const useMyPracticeStats = (params?: IGetPracticeStatsParams) => {
  return useQuery("/api/v1/me/practice-stats", {
    params: {
      query: {
        timeRange: params?.timeRange,
        includeArchived: params?.includeArchived ?? undefined,
      },
    },
  });
};

/**
 * 獲取公開實踐列表（含使用者資訊），用於 Landing Page 展示真實用戶實踐
 */
export const usePublicPractices = (params?: { limit?: number }) => {
  return useQuery("/api/v1/practices", {
    params: {
      query: {
        limit: params?.limit,
        status: "all" as const,
        include: "user",
        sort: "updatedAt" as const,
        order: "desc" as const,
      },
    },
  });
};

/**
 * 獲取實踐模板列表的 Hook
 */
export const usePracticeTemplates = (params?: IGetPracticeTemplatesParams) => {
  return useQuery("/api/v1/practices/templates", {
    params: {
      query: {
        page: params?.page,
        limit: params?.limit,
        category: params?.category,
        search: params?.search,
      },
    },
  });
};

/**
 * 獲取實踐模板分類列表的 Hook
 */
export const usePracticeTemplateCategories = () => {
  return useQuery("/api/v1/practices/templates/categories");
};

/**
 * 獲取單一實踐模板詳情的 Hook
 */
export const usePracticeTemplateById = (id: string) => {
  return useQuery("/api/v1/practices/templates/{id}", {
    params: {
      path: {
        id,
      },
    },
  });
};

/**
 * 隨機獲取實踐模板的 Hook
 */
export const useRandomPracticeTemplates = (params?: IGetRandomPracticeTemplatesParams) => {
  return useQuery("/api/v1/practices/templates/random", {
    params: {
      query: {
        count: params?.count,
        category: params?.category,
      },
    },
  });
};

/**
 * 獲取單一實踐詳情的 Hook
 */
export const usePracticeById = (id: string) => {
  return useQuery("/api/v1/practices/{id}", {
    params: {
      path: {
        id,
      },
    },
  });
};

/**
 * 獲取實踐打卡記錄列表的 Hook
 */
export const usePracticeCheckIns = (id: string, params?: IGetPracticeCheckInsParams) => {
  return useQuery("/api/v1/practices/{id}/checkins", {
    params: {
      path: {
        id,
      },
      query: {
        page: params?.page,
        limit: params?.limit,
        startDate: params?.startDate,
        endDate: params?.endDate,
        mood: params?.mood,
        include: params?.include,
      },
    },
  });
};

/**
 * 獲取指定用戶實踐列表的 Hook
 */
export const useUserPractices = (userId: string, params?: IGetUserPracticesParams) => {
  return useQuery("/api/v1/practices/user/{userId}", {
    params: {
      path: {
        userId,
      },
      query: {
        page: params?.page,
        limit: params?.limit,
        query: params?.query,
        contentType: params?.contentType,
        tags: params?.tags,
        userId: params?.userId,
        status: params?.status,
        sort: params?.sort,
        order: params?.order,
        include: params?.include,
      },
    },
  });
};

/**
 * 獲取實踐完成摘要的 Hook
 * @description 用於生成實踐完成總結圖片，組合實踐詳情、打卡記錄和鼓勵句
 * @param practiceId 實踐 ID
 * @param options SWR 選項
 * @returns 實踐摘要資料和狀態
 */
export const usePracticeSummary = (
  practiceId: string | null | undefined,
  options?: {
    /** 是否啟用查詢（預設 true） */
    enabled?: boolean;
    /** 防止重複請求的間隔（毫秒），預設 2000 */
    dedupingInterval?: number;
  }
) => {
  // 確保 practiceId 類型穩定（字串）
  const normalizedId = practiceId ? String(practiceId) : null;
  const enabled = options?.enabled !== false && !!normalizedId;

  const { data, error, isLoading, isValidating, mutate } = useSWR<{
    data: PracticeSummary | null;
    error: string | null;
  }>(
    // 使用 RESTful 風格的字串作為 key，更穩定且易於除錯
    enabled ? `/api/v1/practices/${normalizedId}/summary` : null,
    async () => {
      if (!normalizedId) {
        return { data: null, error: "缺少實踐 ID" };
      }
      return getPracticeSummary(normalizedId);
    },
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      dedupingInterval: options?.dedupingInterval ?? 2000, // 防止 2 秒內重複請求
      shouldRetryOnError: false, // 失敗不自動重試
    }
  );

  return {
    /** 實踐摘要資料 */
    summary: data?.data ?? null,
    /** 錯誤訊息 */
    error: error?.message ?? data?.error ?? null,
    /** 是否正在載入 */
    isLoading,
    /** 是否正在重新驗證 */
    isValidating,
    /** 重新獲取資料 */
    refetch: mutate,
  };
};

// ============================================================================
// Mutation Hooks
// ============================================================================

/**
 * 建立實踐的函數（用於 Client Components）
 */
export const createPractice = async (data: CreatePracticeRequestType) => {
  return client.POST("/api/v1/practices", {
    body: data,
  });
};

/**
 * 更新實踐的函數（用於 Client Components）
 */
export const updatePractice = async (id: string, data: UpdatePracticeRequestType) => {
  return client.PUT("/api/v1/practices/{id}", {
    params: {
      path: {
        id,
      },
    },
    body: data,
  });
};

/**
 * 刪除實踐的函數（用於 Client Components）
 */
export const deletePractice = async (id: string) => {
  return client.DELETE("/api/v1/practices/{id}", {
    params: {
      path: {
        id,
      },
    },
  });
};

/**
 * 創建實踐打卡記錄的請求類型
 */
export type CreateCheckInRequestType = components["schemas"]["CheckInRequest"];

/**
 * 創建實踐打卡記錄的函數（用於 Client Components）
 * @param practiceId 實踐 ID
 * @param data 打卡資料
 * @returns 創建結果
 */
export const createPracticeCheckIn = async (practiceId: string, data: CreateCheckInRequestType) => {
  return client.POST("/api/v1/practices/{id}/checkins", {
    params: {
      path: {
        id: practiceId,
      },
    },
    body: data,
  });
};

/**
 * 打卡 API 回應類型
 */
type CreateCheckInResponse =
  paths["/api/v1/practices/{id}/checkins"]["post"]["responses"]["201"]["content"]["application/json"];

/**
 * 創建實踐打卡記錄（使用 FormData 統一提交）
 * Web / Mobile 共用；mobile 需先 initMobileClient 以注入 Bearer token
 * @param practiceId 實踐 ID
 * @param data 表單資料（包含圖片檔案，支援 RN { uri, type, name }）
 * @returns 創建結果
 */
export const createPracticeCheckInWithFormData = async (
  practiceId: string,
  data: ICheckInFormData
): Promise<CreateCheckInResponse> => {
  const formData = buildCreateCheckInFormData(data);
  const baseUrl = getApiBaseUrl();
  const response = await unauthorizedHandler.wrapFetch(
    `${baseUrl}/api/v1/practices/${practiceId}/checkins`,
    {
      method: "POST",
      body: formData,
      credentials: "include",
    }
  );

  if (!response.ok) {
    const error = await response.json().catch(() => ({
      error: { message: "打卡失敗" },
    }));
    throw new Error(extractApiErrorMessage(error, "打卡失敗"));
  }

  return response.json();
};

/**
 * 更新實踐打卡記錄（使用 FormData 統一提交）
 * @param practiceId 實踐 ID
 * @param checkInId 打卡記錄 ID
 * @param data 表單資料（包含圖片檔案）
 * @returns 更新結果
 */
export const updatePracticeCheckInWithFormData = async (
  practiceId: string,
  checkInId: string,
  data: Partial<ICheckInFormData>
): Promise<CreateCheckInResponse> => {
  const formData = buildUpdateCheckInFormData(data);
  const baseUrl = getApiBaseUrl();
  const response = await unauthorizedHandler.wrapFetch(
    `${baseUrl}/api/v1/practices/${practiceId}/checkins/${checkInId}`,
    {
      method: "PUT",
      body: formData,
      credentials: "include",
    }
  );

  if (!response.ok) {
    const error = await response.json().catch(() => ({
      error: { message: "更新打卡失敗" },
    }));
    throw new Error(extractApiErrorMessage(error, "更新打卡失敗"));
  }

  return response.json();
};

/**
 * 刷新實踐相關的 cache（共用函數）
 * @param mutate mutate 函數
 * @param practiceId 實踐 ID
 * @param options 選項
 * @param options.skipDetail 是否跳過刷新實踐詳情（用於封存等操作，因為封存後可能無法訪問詳情）
 */
const refreshPracticeCaches = async (
  mutate: ReturnType<typeof useMutate>,
  practiceId: string,
  options?: { skipDetail?: boolean }
) => {
  // 1. 刷新單個實踐詳情的 cache（如果沒有跳過）
  if (!options?.skipDetail) {
    try {
      await mutate([
        "/api/v1/practices/{id}",
        {
          params: {
            path: {
              id: practiceId,
            },
          },
        },
      ] as const);
    } catch (error) {
      // 如果刷新實踐詳情失敗（例如實踐已被封存或刪除），忽略錯誤
      // 繼續刷新其他 cache
      console.warn("Failed to refresh practice detail cache:", error);
    }
  }

  // 2. 刷新實踐列表的 cache（使用 pattern matching 來匹配所有 query 參數組合）
  await mutate([
    "/api/v1/me/practices",
    {
      params: {
        query: {},
      },
    },
  ] as const);

  // 3. 刷新實踐統計的 cache（使用 pattern matching 來匹配所有 query 參數組合）
  await mutate([
    "/api/v1/me/practice-stats",
    {
      params: {
        query: {},
      },
    },
  ] as const);
};

/**
 * Hook 用於創建實踐打卡記錄（自動處理 cache 刷新）
 * @param practiceId 實踐 ID
 * @returns 創建打卡記錄的函數和狀態
 */
export const useCreatePracticeCheckIn = (practiceId: string) => {
  const mutate = useMutate();

  const createCheckIn = async (formData: ICheckInFormData) => {
    // 創建打卡記錄（函數會直接拋出錯誤）
    const response = await createPracticeCheckInWithFormData(practiceId, formData);

    // 刷新打卡列表的 cache（使用空 query 對象來匹配所有 query 參數組合）
    await mutate([
      "/api/v1/practices/{id}/checkins",
      {
        params: {
          path: {
            id: practiceId,
          },
          query: {},
        },
      },
    ] as const);

    // 刷新實踐相關的 cache
    await refreshPracticeCaches(mutate, practiceId);

    return response;
  };

  return { createCheckIn };
};

/**
 * Hook 用於更新實踐打卡記錄（自動處理 cache 刷新）
 * @param practiceId 實踐 ID
 * @param checkInId 打卡記錄 ID
 * @returns 更新打卡記錄的函數
 */
export const useUpdatePracticeCheckIn = (practiceId: string, checkInId: string) => {
  const mutate = useMutate();

  const updateCheckIn = async (formData: Partial<ICheckInFormData>) => {
    const response = await updatePracticeCheckInWithFormData(practiceId, checkInId, formData);

    // 刷新打卡列表的 cache（使用空 query 對象來匹配所有 query 參數組合）
    await mutate([
      "/api/v1/practices/{id}/checkins",
      {
        params: {
          path: {
            id: practiceId,
          },
          query: {},
        },
      },
    ] as const);

    // 刷新實踐相關的 cache
    await refreshPracticeCaches(mutate, practiceId);

    return response;
  };

  return { updateCheckIn };
};

/**
 * Hook 用於封存實踐（自動處理 cache 刷新）
 * @param practiceId 實踐 ID
 * @returns 封存實踐的函數
 */
export const useArchivePractice = (practiceId: string) => {
  const mutate = useMutate();

  const archivePractice = async () => {
    const response = await updatePractice(practiceId, {
      status: "archived",
    } as UpdatePracticeRequestType);

    if (response.error) {
      throw new Error(extractApiErrorMessage(response.error, "封存失敗"));
    }

    // 刷新相關的 cache（跳過實踐詳情，因為封存後可能無法訪問）
    await refreshPracticeCaches(mutate, practiceId, { skipDetail: true });

    return response;
  };

  const restorePractice = async () => {
    // 使用專門的 unarchive API 端點，而不是 PUT 更新狀態
    // 後端會根據是否有打卡記錄自動決定恢復後的狀態（active 或 not_started）
    const response = await client.POST("/api/v1/practices/{id}/unarchive", {
      params: {
        path: {
          id: practiceId,
        },
      },
    });

    if (response.error) {
      throw new Error(extractApiErrorMessage(response.error, "復原失敗"));
    }

    // 刷新相關的 cache
    await refreshPracticeCaches(mutate, practiceId);

    return response;
  };

  return { archivePractice, restorePractice };
};

/**
 * Hook 用於取消封存實踐（自動處理 cache 刷新）
 * 返回一個函數，可以接受 practiceId 作為參數，適用於列表頁面
 * @returns 取消封存實踐的函數
 */
export const useUnarchivePractice = () => {
  const mutate = useMutate();

  const unarchivePractice = async (practiceId: string) => {
    // 使用專門的 unarchive API 端點，而不是 PUT 更新狀態
    // 後端會根據是否有打卡記錄自動決定恢復後的狀態（active 或 not_started）
    const response = await client.POST("/api/v1/practices/{id}/unarchive", {
      params: {
        path: {
          id: practiceId,
        },
      },
    });

    if (response.error) {
      throw new Error(extractApiErrorMessage(response.error, "取消封存失敗"));
    }

    // 刷新相關的 cache
    await refreshPracticeCaches(mutate, practiceId);

    return response;
  };

  return { unarchivePractice };
};

/**
 * Hook 用於刪除實踐（自動處理 cache 刷新）
 * @param practiceId 實踐 ID
 * @returns 刪除實踐的函數
 */
export const useDeletePractice = (practiceId: string) => {
  const mutate = useMutate();

  const deletePracticeById = async () => {
    const response = await deletePractice(practiceId);

    if (response.error) {
      throw new Error(extractApiErrorMessage(response.error, "刪除失敗"));
    }

    // 刷新相關的 cache（不需要刷新單個實踐詳情，因為已經刪除了）
    await mutate([
      "/api/v1/me/practices",
      {
        params: {
          query: {},
        },
      },
    ] as const);

    await mutate([
      "/api/v1/me/practice-stats",
      {
        params: {
          query: {},
        },
      },
    ] as const);

    return response;
  };

  return { deletePractice: deletePracticeById };
};

/**
 * Hook 用於複製實踐（複製他人或自己的實踐）
 * @returns copyPractice(practiceId) → 回傳新實踐 id
 */
export const useCopyPractice = () => {
  const copy = async (practiceId: string): Promise<{ id: string }> => {
    const result = await copyPractice(practiceId);
    try {
      await updatePractice(result.id, { privacyStatus: "public" });
    } catch {
      console.error("[useCopyPractice] 設定公開隱私狀態失敗，複製仍成功");
    }
    return result;
  };

  return { copyPractice: copy };
};
