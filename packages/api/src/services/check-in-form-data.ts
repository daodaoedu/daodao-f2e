/**
 * Check-in FormData helpers (web File/Blob + React Native { uri, type, name })
 */

import type { components } from "../types";

/**
 * React Native FormData file part (expo-image-picker / fetch multipart)
 * @see https://github.com/facebook/react-native/blob/main/packages/react-native/Libraries/Network/FormData.js
 */
export interface IReactNativeFormDataFile {
  uri: string;
  type: string;
  name: string;
}

/**
 * File part accepted by check-in multipart upload.
 * - Web: File / Blob
 * - React Native: { uri, type, name }
 */
export type FormDataFilePart = Blob | File | IReactNativeFormDataFile;

/**
 * 打卡表單資料類型（用於封裝函數）
 * mood 應該是已經轉換好的 API 格式（ApiMoodType）
 */
export interface ICheckInFormData {
  mood: components["schemas"]["CheckInRequest"]["mood"] | undefined;
  tags: string[];
  description: string;
  media: FormDataFilePart[];
  /** 編輯時要保留的既有圖片 URL */
  existingImageUrls?: string[];
}

/**
 * 從 daodao-server / openapi-fetch 錯誤 body 抽出可顯示訊息
 */
export function extractApiErrorMessage(errorBody: unknown, fallback = "Request failed"): string {
  if (errorBody == null) return fallback;
  if (typeof errorBody === "string" && errorBody.trim()) return errorBody;
  if (errorBody instanceof Error) {
    return errorBody.message.trim() ? errorBody.message : fallback;
  }
  if (typeof errorBody !== "object") return fallback;

  const body = errorBody as Record<string, unknown>;

  // Nested { error: { message } } or { error: "..." } — daodao-server ApiErrorResponse
  if ("error" in body && body.error != null) {
    if (typeof body.error === "string" && body.error.trim()) {
      return body.error;
    }
    if (typeof body.error === "object") {
      const nested = body.error as Record<string, unknown>;
      if (typeof nested.message === "string" && nested.message.trim()) {
        return nested.message;
      }
    }
  }

  if (typeof body.message === "string" && body.message.trim()) {
    return body.message;
  }

  return fallback;
}

function appendFilePart(formData: FormData, fieldName: string, file: FormDataFilePart): void {
  // RN FormData accepts { uri, type, name }; DOM FormData expects Blob/File.
  // Cast is required so the same helper works on both platforms.
  formData.append(fieldName, file as Blob);
}

/**
 * 建立「新增打卡」multipart FormData
 */
export function buildCreateCheckInFormData(data: ICheckInFormData): FormData {
  const formData = new FormData();

  if (data.mood) formData.append("mood", data.mood);
  if (data.description) formData.append("note", data.description);

  // tags 必填（後端 min 1）；有內容才 append
  if (data.tags && data.tags.length > 0) {
    formData.append("tags", JSON.stringify(data.tags));
  }

  if (data.media && data.media.length > 0) {
    data.media.forEach((file) => {
      appendFilePart(formData, "images", file);
    });
  }

  return formData;
}

/**
 * 建立「更新打卡」multipart FormData
 */
export function buildUpdateCheckInFormData(data: Partial<ICheckInFormData>): FormData {
  const formData = new FormData();

  // 使用 !== undefined 確保空字串也能被發送
  if (data.mood !== undefined) formData.append("mood", data.mood ?? "");
  if (data.description !== undefined) formData.append("note", data.description);

  // 空陣列也要發送以便清除標籤
  if (data.tags !== undefined) {
    formData.append("tags", JSON.stringify(data.tags));
  }

  // 空陣列代表清空所有圖片
  if (data.existingImageUrls !== undefined) {
    formData.append("imageUrls", JSON.stringify(data.existingImageUrls));
  }

  if (data.media && data.media.length > 0) {
    data.media.forEach((file) => {
      appendFilePart(formData, "images", file);
    });
  }

  return formData;
}
