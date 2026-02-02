/**
 * User API Service
 * 提供用戶相關的 API 調用函數和 Hooks
 */

import { getRequiredEnv } from "@daodao/config";
import { client, unauthorizedHandler } from "../client";
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
 * 更新當前用戶資訊（JSON 格式，不支援檔案上傳）
 */
export const updateCurrentUser = async (data: UpdateUserRequest) => {
  return client.PUT("/api/v1/users/me", {
    body: data,
  });
};

/**
 * 更新用戶 API 回應類型
 */
type UpdateUserResponse =
  paths["/api/v1/users/me"]["put"]["responses"]["200"]["content"]["application/json"];

/**
 * FormData 版本的更新用戶請求類型
 * 支援直接傳送檔案
 */
export interface UpdateUserFormDataRequest {
  name?: string;
  customId?: string;
  location?: string;
  gender?: string;
  birthDay?: string;
  selfIntroduction?: string;
  personalSlogan?: string;
  isOpenLocation?: boolean;
  isOpenProfile?: boolean;
  isSubscribeEmail?: boolean;
  tagList?: string[];
  roleList?: string[];
  interestList?: string[];
  contactList?: {
    instagram?: string;
    discord?: string;
    line?: string;
    facebook?: string;
    threads?: string;
    linkedin?: string;
    website?: string;
    github?: string;
  };
  wantToDoList?: string[];
  professionalField?: string[];
  educationStage?: string;
  share?: string | string[];
  preferences?: Record<string, string[]>;
  referralSource?: string;
}

/**
 * 更新當前用戶資訊（FormData 格式，支援圖片上傳）
 * @param data 用戶資料
 * @param photoFile 可選的頭像圖片檔案
 * @returns 更新結果
 */
export const updateCurrentUserWithFormData = async (
  data: UpdateUserFormDataRequest,
  photoFile?: File
): Promise<UpdateUserResponse> => {
  const formData = new FormData();

  // 基本欄位（string）
  if (data.name) formData.append("name", data.name);
  if (data.customId) formData.append("customId", data.customId);
  if (data.location) formData.append("location", data.location);
  if (data.gender) formData.append("gender", data.gender);
  if (data.birthDay) formData.append("birthDay", data.birthDay);
  if (data.selfIntroduction) formData.append("selfIntroduction", data.selfIntroduction);
  if (data.personalSlogan) formData.append("personalSlogan", data.personalSlogan);

  // Boolean 欄位需轉成字串
  if (data.isOpenLocation !== undefined) {
    formData.append("isOpenLocation", String(data.isOpenLocation));
  }
  if (data.isOpenProfile !== undefined) {
    formData.append("isOpenProfile", String(data.isOpenProfile));
  }
  if (data.isSubscribeEmail !== undefined) {
    formData.append("isSubscribeEmail", String(data.isSubscribeEmail));
  }

  // 其他 string 欄位
  if (data.educationStage) formData.append("educationStage", data.educationStage);
  if (data.referralSource) formData.append("referralSource", data.referralSource);

  // 陣列/物件欄位需轉成 JSON 字串
  if (data.tagList) formData.append("tagList", JSON.stringify(data.tagList));
  if (data.roleList) formData.append("roleList", JSON.stringify(data.roleList));
  if (data.interestList) formData.append("interestList", JSON.stringify(data.interestList));
  if (data.contactList) formData.append("contactList", JSON.stringify(data.contactList));
  if (data.wantToDoList) formData.append("wantToDoList", JSON.stringify(data.wantToDoList));
  if (data.professionalField) formData.append("professionalField", JSON.stringify(data.professionalField));
  if (data.share) formData.append("share", JSON.stringify(data.share));
  if (data.preferences) formData.append("preferences", JSON.stringify(data.preferences));

  // 圖片檔案（後端期望欄位名為 'avatar'）
  if (photoFile) formData.append("avatar", photoFile);

  const baseUrl = getRequiredEnv("NEXT_PUBLIC_API_URL");
  const response = await unauthorizedHandler.wrapFetch(`${baseUrl}/api/v1/users/me`, {
    method: "PUT",
    body: formData,
    credentials: "include",
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({
      error: { message: "更新失敗" },
    }));
    const error = new Error(errorData.error?.message || "更新失敗") as Error & {
      details?: Array<{ path?: string; message?: string }>;
    };
    // 附加驗證錯誤詳情（供表單使用）
    if (errorData.error?.details && Array.isArray(errorData.error.details)) {
      error.details = errorData.error.details;
    }
    throw error;
  }

  return response.json();
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
  UpdateUserResponse,
  UpdatePreferencesRequest,
  UserPreferencesResponse,
  AvailablePreferencesResponse,
  UserPreference,
  PreferenceCategory,
  PreferenceType,
  PreferenceOption,
};
