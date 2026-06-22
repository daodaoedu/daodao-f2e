"use client";

/**
 * User API Hooks
 * 提供用戶相關的 React Hooks（用於 Client Components）
 */

import useSWR from "swr";
import { client } from "../client";
import { useQuery } from "../hooks";
import type {
  CreateUserRequest,
  IGetUsersParams,
  UpdatePreferencesRequest,
  UpdateUserFormDataRequest,
  UpdateUserRequest,
} from "./user";
import {
  createCurrentUserWithFormData,
  getSettingsSummary,
  updateCurrentUserWithFormData,
} from "./user";

// ============================================================================
// Query Hooks
// ============================================================================

/**
 * 獲取用戶列表的 Hook
 */
export const useUsers = (params?: IGetUsersParams) => {
  return useQuery("/api/v1/users", {
    params: {
      query: {
        page: params?.page ? String(params.page) : undefined,
        pageSize: params?.pageSize ? String(params.pageSize) : undefined,
        educationStage: params?.educationStage ?? undefined,
        positionList: params?.positionList ?? undefined,
        location: params?.location ?? undefined,
        search: params?.search ?? undefined,
      },
    },
  });
};

/**
 * 根據 ID 獲取用戶資訊的 Hook
 */
export const useUserById = (id: string) => {
  return useQuery("/api/v1/users/{id}", {
    params: {
      path: { id },
    },
  });
};

/**
 * 根據 customId 獲取用戶資訊的 Hook
 */
export const useUserByCustomId = (customId: string) => {
  return useQuery("/api/v1/users/custom-id/{customId}", {
    params: {
      path: { customId },
    },
  });
};

/**
 * 獲取用戶資訊的 Hook（自動判斷是 ID 還是 customId）
 *
 * 注意：這個 hook 會同時查詢 customId 和 ID，優先返回成功的結果
 * 如果兩個都失敗，返回 ID 查詢的結果（因為 ID 查詢通常是最後嘗試的）
 *
 * 建議：如果知道 identifier 的類型，直接使用 useUserById 或 useUserByCustomId 會更高效
 */
export const useUserByIdentifier = (identifier: string) => {
  // 同時嘗試 customId 和 ID（React hooks 規則允許這樣做）
  const customIdQuery = useUserByCustomId(identifier);
  const idQuery = useUserById(identifier);

  // 如果 customId 查詢成功，優先返回 customId 的結果
  if (customIdQuery.data && !customIdQuery.error) {
    return customIdQuery;
  }

  // 否則返回 ID 查詢的結果
  return idQuery;
};

/**
 * 獲取當前用戶資訊的 Hook
 */
export const useCurrentUser = (options?: { enabled?: boolean }) => {
  const enabled = options?.enabled ?? true;
  return useQuery("/api/v1/users/me", enabled ? {} : null);
};

/**
 * 檢查 customId 是否可用的 Hook
 */
export const useCustomIdAvailability = (customId: string) => {
  return useQuery("/api/v1/users/custom-id/check/{customId}", {
    params: {
      path: { customId },
    },
  });
};

/**
 * 獲取當前用戶偏好設定的 Hook
 */
export const useCurrentUserPreferences = (options?: {
  category?: string | null;
  includeSystem?: boolean;
}) => {
  return useQuery("/api/v1/users/me/preferences", {
    params: {
      query: {
        category: options?.category ?? undefined,
        includeSystem: options?.includeSystem ?? false,
      },
    },
  });
};

/**
 * 獲取可用偏好設定選項的 Hook
 */
export const useAvailablePreferences = () => {
  return useQuery("/api/v1/users/preferences/available");
};

// ============================================================================
// Mutation Hooks
// ============================================================================

/**
 * 用戶相關的 Mutation Hook
 */
export const useUserMutations = () => {
  return {
    /**
     * 更新當前用戶資訊（JSON 格式，不支援檔案上傳）
     */
    updateCurrentUser: async (data: UpdateUserRequest) => {
      return client.PUT("/api/v1/users/me", {
        body: data,
      });
    },

    /**
     * 更新當前用戶資訊（FormData 格式，支援圖片上傳）
     * @param data 用戶資料
     * @param photoFile 可選的頭像圖片檔案
     */
    updateCurrentUserWithFormData: async (data: UpdateUserFormDataRequest, photoFile?: File) => {
      return updateCurrentUserWithFormData(data, photoFile);
    },

    /**
     * 創建當前用戶（用於臨時用戶完成 onboarding）
     * @param data 用戶資料
     * @param photoFile 可選的頭像圖片檔案
     */
    createCurrentUserWithFormData: async (data: UpdateUserFormDataRequest, photoFile?: File) => {
      return createCurrentUserWithFormData(data, photoFile);
    },

    /**
     * 更新指定用戶資訊
     */
    updateUser: async (id: string, data: UpdateUserRequest) => {
      return client.PUT("/api/v1/users/{id}", {
        params: {
          path: { id },
        },
        body: data,
      });
    },

    /**
     * 創建新用戶
     */
    createUser: async (data: CreateUserRequest) => {
      return client.POST("/api/v1/users", {
        body: data,
      });
    },

    /**
     * 刪除用戶
     */
    deleteUser: async (id: string) => {
      return client.DELETE("/api/v1/users/{id}", {
        params: {
          path: { id },
        },
      });
    },

    /**
     * 設置當前用戶的 customId
     */
    setCurrentUserCustomId: async (customId: string) => {
      return client.POST("/api/v1/users/me/custom-id", {
        body: { customId },
      });
    },

    /**
     * 刪除當前用戶的 customId
     */
    deleteCurrentUserCustomId: async () => {
      return client.DELETE("/api/v1/users/me/custom-id", {});
    },

    /**
     * 更新當前用戶的偏好設定
     */
    updateCurrentUserPreferences: async (preferences: UpdatePreferencesRequest) => {
      return client.PUT("/api/v1/users/me/preferences", {
        body: preferences,
      });
    },
  };
};

/**
 * 獲取設定頁完整度的 Hook
 */
export const useSettingsCompletion = () => {
  const { data, error, isLoading, mutate } = useSWR(
    "/api/v1/users/settings-summary",
    getSettingsSummary,
    { revalidateOnFocus: false }
  );

  return {
    data,
    error,
    isLoading,
    revalidate: mutate,
  };
};
