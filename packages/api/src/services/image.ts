/**
 * Image API Service
 * 提供圖片上傳與刪除相關的 API 調用函數（用於 Server Components 或直接調用）
 *
 * 注意：上傳使用 fetch 而非 client，因為 openapi-fetch 對 multipart/form-data 的類型支持有限
 * 刪除使用 client.DELETE，因為是標準的 JSON API
 */

import { getRequiredEnv } from "@daodao/config";
import { client, unauthorizedHandler } from "../client";
import type { paths } from "../types";

// ============================================================================
// Types
// ============================================================================

type UploadImageResponse =
  paths["/api/v1/images"]["post"]["responses"]["201"]["content"]["application/json"];

type UploadMultipleImagesResponse =
  paths["/api/v1/images/multiple"]["post"]["responses"]["201"]["content"]["application/json"];

type DeleteImageResponse =
  paths["/api/v1/images/{filename}"]["delete"]["responses"]["200"]["content"]["application/json"];

// ============================================================================
// Client Functions (用於 Server Components 或直接調用)
// ============================================================================

/**
 * 上傳單一圖片
 * @param file 要上傳的圖片檔案
 * @returns 上傳結果，包含圖片的 URL
 */
export const uploadImage = async (file: File): Promise<UploadImageResponse> => {
  const formData = new FormData();
  formData.append("file", file);

  const baseUrl = getRequiredEnv("NEXT_PUBLIC_API_URL");
  const response = await unauthorizedHandler.wrapFetch(`${baseUrl}/api/v1/images`, {
    method: "POST",
    body: formData,
    credentials: "include",
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({
      error: { message: "上傳失敗" },
    }));
    throw new Error(error.error?.message || "上傳失敗");
  }

  return response.json();
};

/**
 * 批量上傳多個圖片
 * @param files 要上傳的圖片檔案陣列（最多 5 個）
 * @returns 上傳結果，包含所有圖片的 URL
 */
export const uploadMultipleImages = async (
  files: File[]
): Promise<UploadMultipleImagesResponse> => {
  if (files.length === 0) {
    return {
      success: true,
      data: {
        urls: [],
        totalFiles: 0,
        totalSize: 0,
      },
      timestamp: new Date().toISOString(),
    };
  }

  const formData = new FormData();
  files.forEach((file) => {
    formData.append("files", file);
  });

  const baseUrl = getRequiredEnv("NEXT_PUBLIC_API_URL");
  const response = await unauthorizedHandler.wrapFetch(`${baseUrl}/api/v1/images/multiple`, {
    method: "POST",
    body: formData,
    credentials: "include",
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({
      error: { message: "批量上傳失敗" },
    }));
    throw new Error(error.error?.message || "批量上傳失敗");
  }

  return response.json();
};

// ============================================================================
// Delete Functions
// ============================================================================

/**
 * 刪除單一圖片
 * @param filename 要刪除的圖片檔案名稱（UUID）
 * @returns 刪除結果
 */
export const deleteImage = async (filename: string): Promise<DeleteImageResponse> => {
  const response = await client.DELETE("/api/v1/images/{filename}", {
    params: {
      path: { filename },
    },
  });

  if (response.error) {
    throw new Error(response.error.error?.message || "刪除失敗");
  }

  if (!response.data) {
    throw new Error("刪除失敗：未收到回應資料");
  }

  return response.data;
};

/**
 * 批量刪除多個圖片
 * @param filenames 要刪除的圖片檔案名稱陣列（UUID）
 * @returns 刪除結果陣列，包含成功和失敗的結果
 */
export const deleteMultipleImages = async (
  filenames: string[]
): Promise<Array<{ filename: string; success: boolean; error?: string }>> => {
  if (filenames.length === 0) {
    return [];
  }

  const results = await Promise.allSettled(filenames.map((filename) => deleteImage(filename)));

  return results.map((result, index): { filename: string; success: boolean; error?: string } => {
    const filename = filenames[index];
    if (!filename) {
      return {
        filename: "",
        success: false,
        error: "檔案名稱不存在",
      };
    }
    if (result.status === "fulfilled") {
      return {
        filename,
        success: true,
      };
    }
    return {
      filename,
      success: false,
      error: result.reason?.message || "刪除失敗",
    };
  });
};
