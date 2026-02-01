/**
 * User API Service
 * 提供用戶相關的 API 調用函數和 Hooks
 */

import { client } from "../client";
import type { components, paths } from "../types";

// ============================================================================
// Types
// ============================================================================

type UserResponse =
  paths["/api/v1/users/{id}"]["get"]["responses"]["200"]["content"]["application/json"];
type UserListResponse =
  paths["/api/v1/users"]["get"]["responses"]["200"]["content"]["application/json"];
type CreateUserRequest = paths["/api/v1/users"]["post"]["requestBody"] extends {
  content: { "application/json": infer T };
}
  ? T
  : never;
type UpdateUserRequest = paths["/api/v1/users/{id}"]["put"]["requestBody"] extends {
  content: { "application/json": infer T };
}
  ? T
  : never;
type UpdatePreferencesRequest = components["schemas"]["UpdatePreferencesRequest"];
type UserPreferencesResponse =
  paths["/api/v1/users/me/preferences"]["get"]["responses"]["200"]["content"]["application/json"];
type AvailablePreferencesResponse =
  paths["/api/v1/users/preferences/available"]["get"]["responses"]["200"]["content"]["application/json"];

// 明確定義偏好設定的型別
// 從 API 回應中提取 preferences 陣列的元素型別
type UserPreference = NonNullable<
  NonNullable<UserPreferencesResponse["data"]>["preferences"]
>[number];
// 明確定義 PreferenceCategory 型別
type PreferenceCategory = NonNullable<
  NonNullable<UserPreferencesResponse["data"]>["categories"]
>[number];
type PreferenceType = NonNullable<AvailablePreferencesResponse["data"]>[number];
type PreferenceOption = PreferenceType["options"][number];

// API 定義中 query 參數是 string 類型，但使用時需要 number，所以定義一個轉換層
export interface IGetUsersParams {
  page?: number;
  pageSize?: number;
  educationStage?: string | null;
  roleList?: string | null;
  location?: string | null;
  search?: string | null;
}

// ============================================================================
// Client Functions (用於 Server Components 或直接調用)
// ============================================================================

/**
 * 獲取用戶列表
 */
export const getUsers = async (params?: IGetUsersParams) => {
  return client.GET("/api/v1/users", {
    params: {
      query: {
        page: params?.page ? String(params.page) : undefined,
        pageSize: params?.pageSize ? String(params.pageSize) : undefined,
        educationStage: params?.educationStage ?? undefined,
        roleList: params?.roleList ?? undefined,
        location: params?.location ?? undefined,
        search: params?.search ?? undefined,
      },
    },
  });
};

/**
 * 根據 ID 獲取用戶資訊
 */
export const getUserById = async (id: string) => {
  return client.GET("/api/v1/users/{id}", {
    params: {
      path: { id },
    },
  });
};

/**
 * 根據 customId 獲取用戶資訊
 */
export const getUserByCustomId = async (customId: string) => {
  return client.GET("/api/v1/users/custom-id/{customId}", {
    params: {
      path: { customId },
    },
  });
};

/**
 * 獲取用戶資訊（自動判斷是 ID 還是 customId）
 * 先嘗試 customId，失敗後嘗試 ID
 */
export const getUserByIdentifier = async (identifier: string) => {
  // 先嘗試用 customId 查詢
  const customIdResponse = await getUserByCustomId(identifier);
  if (customIdResponse.data && customIdResponse.response.ok) {
    return customIdResponse;
  }

  // 如果 customId 查詢失敗，嘗試用 ID 查詢
  return getUserById(identifier);
};

/**
 * 獲取當前用戶資訊
 */
export const getCurrentUser = async () => {
  return client.GET("/api/v1/users/me");
};

/**
 * 更新當前用戶資訊
 */
export const updateCurrentUser = async (data: UpdateUserRequest) => {
  return client.PUT("/api/v1/users/me", {
    body: data,
  });
};

/**
 * 更新指定用戶資訊
 */
export const updateUser = async (id: string, data: UpdateUserRequest) => {
  return client.PUT("/api/v1/users/{id}", {
    params: {
      path: { id },
    },
    body: data,
  });
};

/**
 * 創建新用戶
 */
export const createUser = async (data: CreateUserRequest) => {
  return client.POST("/api/v1/users", {
    body: data,
  });
};

/**
 * 刪除用戶
 */
export const deleteUser = async (id: string) => {
  return client.DELETE("/api/v1/users/{id}", {
    params: {
      path: { id },
    },
  });
};

/**
 * 檢查 customId 是否可用
 */
export const checkCustomIdAvailability = async (customId: string) => {
  return client.GET("/api/v1/users/custom-id/check/{customId}", {
    params: {
      path: { customId },
    },
  });
};

/**
 * 設置當前用戶的 customId
 */
export const setCurrentUserCustomId = async (customId: string) => {
  return client.POST("/api/v1/users/me/custom-id", {
    body: { customId },
  });
};

/**
 * 刪除當前用戶的 customId
 */
export const deleteCurrentUserCustomId = async () => {
  return client.DELETE("/api/v1/users/me/custom-id");
};

/**
 * 獲取當前用戶的偏好設定
 */
export const getCurrentUserPreferences = async (options?: {
  category?: string | null;
  includeSystem?: boolean;
}) => {
  return client.GET("/api/v1/users/me/preferences", {
    params: {
      query: {
        category: options?.category ?? undefined,
        includeSystem: options?.includeSystem ?? false,
      },
    },
  });
};

/**
 * 更新當前用戶的偏好設定
 */
export const updateCurrentUserPreferences = async (preferences: UpdatePreferencesRequest) => {
  return client.PUT("/api/v1/users/me/preferences", {
    body: preferences,
  });
};

/**
 * 獲取可用的偏好設定選項
 */
export const getAvailablePreferences = async () => {
  return client.GET("/api/v1/users/preferences/available");
};

/**
 * 獲取當前登入用戶的最新測驗結果
 */
export const getLatestQuizResult = async () => {
  return client.GET("/api/v1/quiz/latest");
};

// ============================================================================
// Export Types
// ============================================================================

export type {
  UserResponse,
  UserListResponse,
  CreateUserRequest,
  UpdateUserRequest,
  UpdatePreferencesRequest,
  UserPreferencesResponse,
  AvailablePreferencesResponse,
  UserPreference,
  PreferenceCategory,
  PreferenceType,
  PreferenceOption,
};
