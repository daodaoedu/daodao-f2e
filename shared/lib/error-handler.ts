import { useCallback } from 'react';
import { UseFormReturn, Path } from 'react-hook-form';
import { toast } from 'sonner';
import { ApiError } from '@/shared/api';
import getEnv from '../config/env';

/**
 * API 錯誤詳細資訊介面
 */
interface ApiErrorDetail {
  path: string;
  message: string;
}

/**
 * 錯誤處理選項
 */
interface ErrorHandlerOptions {
  /** 預設錯誤訊息 */
  defaultMessage?: string;
  /** 是否顯示 toast 通知 */
  showToast?: boolean;
  /** 是否記錄錯誤日誌 */
  logError?: boolean;
}

/**
 * 記錄錯誤日誌
 */
const logErrorMessage = (error: unknown, context: string) => {
  if (getEnv().isDevelopment) {
    // eslint-disable-next-line no-console
    console.error(`${context}:`, error);
  }
};

/**
 * 提取錯誤訊息
 * @param error - 錯誤物件
 * @param defaultMessage - 預設錯誤訊息
 * @returns 錯誤訊息字串
 */
export const getErrorMessage = (
  error: unknown,
  defaultMessage = '發生未知錯誤'
): string => {
  if (error instanceof ApiError) {
    return error.data?.details?.[0]?.message || error.message || defaultMessage;
  }

  if (error instanceof Error) {
    return error.message || defaultMessage;
  }

  return defaultMessage;
};

/**
 * 處理一般錯誤（不涉及表單）
 * @param error - 錯誤物件
 * @param options - 錯誤處理選項
 */
export const handleError = (
  error: unknown,
  options: ErrorHandlerOptions = {}
) => {
  const {
    defaultMessage = '操作失敗，請稍後再試',
    showToast = true,
    logError = true,
  } = options;

  // 記錄錯誤日誌
  if (logError) {
    logErrorMessage(error, 'Error');
  }

  const errorMessage = getErrorMessage(error, defaultMessage);

  if (showToast) {
    toast.error(errorMessage);
  }

  return errorMessage;
};

/**
 * 處理 API 錯誤並設定表單錯誤
 * @param error - 錯誤物件
 * @param form - React Hook Form 實例
 * @param options - 錯誤處理選項
 */
export const handleFormError = <T extends Record<string, unknown>>(
  error: unknown,
  form?: UseFormReturn<T>,
  options: ErrorHandlerOptions = {}
) => {
  const {
    defaultMessage = '操作失敗，請稍後再試',
    showToast = true,
    logError = true,
  } = options;

  if (logError) {
    logErrorMessage(error, 'Form error');
  }

  // 處理 ApiError 且有詳細錯誤資訊
  if (error instanceof ApiError && Array.isArray(error.data?.details)) {
    const details = error.data.details as ApiErrorDetail[];

    if (form) {
      details.forEach(({ path, message }) => {
        if (path && message) {
          form.setError(path as Path<T>, { message });
        }
      });
    }

    if (showToast && details.length > 0) {
      toast.error(details[0].message);
    }

    return;
  }

  handleError(error, { defaultMessage, showToast, logError: false });
};

/**
 * 建立錯誤處理器的 Hook
 * @param form - React Hook Form 實例
 * @param defaultOptions - 預設錯誤處理選項
 */
export const useErrorHandler = <T extends Record<string, unknown>>(
  form?: UseFormReturn<T>,
  defaultOptions: ErrorHandlerOptions = {}
) => {
  const handleFormErrorWithDefaults = useCallback(
    (error: unknown, options: ErrorHandlerOptions = {}) =>
      handleFormError(error, form, { ...defaultOptions, ...options }),
    [form, defaultOptions]
  );

  const handleErrorWithDefaults = useCallback(
    (error: unknown, options: ErrorHandlerOptions = {}) =>
      handleError(error, { ...defaultOptions, ...options }),
    [defaultOptions]
  );

  return {
    handleFormError: handleFormErrorWithDefaults,
    handleError: handleErrorWithDefaults,
    getErrorMessage,
  };
};
