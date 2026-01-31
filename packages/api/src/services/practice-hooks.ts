"use client";

/**
 * Practice API Hooks
 * 提供實踐相關的 React Hooks（用於 Client Components）
 */

import { client } from "../client";
import { useMutate, useQuery } from "../hooks";
import { uploadMultipleImages, deleteMultipleImages } from "./image";
import type {
  IGetMyPracticesParams,
  IGetPracticeStatsParams,
  IGetPracticeTemplatesParams,
  IGetRandomPracticeTemplatesParams,
  IGetPracticeCheckInsParams,
} from "./practice";
import type { components, paths } from "../types";

// ============================================================================
// Types
// ============================================================================

export type CreatePracticeRequestType = components["schemas"]["CreatePracticeRequest"];

type UpdatePracticeRequestBody = paths["/api/v1/practices/{id}"]["put"]["requestBody"];
export type UpdatePracticeRequestType = UpdatePracticeRequestBody extends {
  content: { "application/json": infer T };
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
export const usePracticeCheckIns = (
  id: string,
  params?: IGetPracticeCheckInsParams
) => {
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
 * 創建實踐打卡記錄的請求類型
 */
export type CreateCheckInRequestType = components["schemas"]["CheckInRequest"];

/**
 * 打卡表單資料類型（用於封裝函數）
 * mood 應該是已經轉換好的 API 格式（ApiMoodType）
 */
export interface ICheckInFormData {
  mood: components["schemas"]["CheckInRequest"]["mood"] | undefined;
  tags: string[];
  description: string;
  media: File[];
}

/**
 * 創建實踐打卡記錄的函數（用於 Client Components）
 * @param practiceId 實踐 ID
 * @param data 打卡資料
 * @returns 創建結果
 */
export const createPracticeCheckIn = async (
  practiceId: string,
  data: CreateCheckInRequestType
) => {
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
 * 創建實踐打卡記錄（封裝函數，自動處理圖片上傳和資料轉換）
 * @param practiceId 實踐 ID
 * @param formData 表單資料（包含圖片檔案）
 * @returns 創建結果
 */
export const createPracticeCheckInWithFormData = async (
  practiceId: string,
  formData: ICheckInFormData
) => {
  // 1. 上傳圖片（如果有）
  let imageUrls: string[] = [];
  let uploadedFilenames: string[] = [];
  
  try {
    if (formData.media && formData.media.length > 0) {
      const uploadResult = await uploadMultipleImages(formData.media);
      imageUrls = uploadResult.data.urls.map((item) => item.url);
      uploadedFilenames = uploadResult.data.urls.map((item) => item.filename);
    }

    // 2. 構建 API 請求資料
    // @TODO: 注意：API 沒有 tags 欄位，所以 tags 會被忽略
    // mood 已經在組件層轉換好了
    const checkInRequest: CreateCheckInRequestType = {
      mood: formData.mood,
      note: formData.description || undefined,
      imageUrls,
    };

    // 3. 調用 API 創建打卡記錄
    const response = await createPracticeCheckIn(practiceId, checkInRequest);
    
    // 如果創建失敗，清理已上傳的圖片
    if (response.error && uploadedFilenames.length > 0) {
      await deleteMultipleImages(uploadedFilenames).catch((error) => {
        // 記錄刪除失敗的錯誤，但不影響主要錯誤的拋出
        console.error("清理已上傳圖片失敗:", error);
      });
    }
    
    return response;
  } catch (error) {
    // 如果圖片上傳或創建打卡記錄時發生異常，清理已上傳的圖片
    if (uploadedFilenames.length > 0) {
      await deleteMultipleImages(uploadedFilenames).catch((deleteError) => {
        // 記錄刪除失敗的錯誤，但不影響主要錯誤的拋出
        console.error("清理已上傳圖片失敗:", deleteError);
      });
    }
    throw error;
  }
};

/**
 * Hook 用於創建實踐打卡記錄（自動處理 cache 刷新）
 * @param practiceId 實踐 ID
 * @returns 創建打卡記錄的函數和狀態
 */
export const useCreatePracticeCheckIn = (practiceId: string) => {
  const mutate = useMutate();

  const createCheckIn = async (formData: ICheckInFormData) => {
    // 創建打卡記錄
    const response = await createPracticeCheckInWithFormData(practiceId, formData);

    if (response.error) {
      const errorMessage =
        response.error && typeof response.error === "object" && "message" in response.error
          ? String(response.error.message)
          : "打卡失敗";
      throw new Error(errorMessage);
    }

    // 刷新相關的 cache
    // 1. 刷新打卡列表的 cache
    await mutate([
      "/api/v1/practices/{id}/checkins",
      {
        params: {
          path: {
            id: practiceId,
          },
        },
      },
    ] as const);

    // 2. 刷新實踐列表的 cache（dashboard 使用）
    // 使用 pattern matching 來匹配所有 query 參數組合
    await mutate([
      "/api/v1/me/practices",
      {
        params: {
          query: {},
        },
      },
    ] as const);

    // 3. 刷新實踐統計的 cache（dashboard 使用）
    // 使用 pattern matching 來匹配所有 query 參數組合
    await mutate([
      "/api/v1/me/practice-stats",
      {
        params: {
          query: {},
        },
      },
    ] as const);

    // 4. 刷新單個實踐詳情的 cache（實踐詳情頁使用）
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

    return response;
  };

  return { createCheckIn };
};
