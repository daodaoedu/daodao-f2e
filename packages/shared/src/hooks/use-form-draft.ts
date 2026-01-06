"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { type FieldValues, type Path, type UseFormReturn, useWatch } from "react-hook-form";
import { getStorage, type StorageEnum } from "../lib/storage";

export interface DraftData<TFormValues> {
  formValues: TFormValues;
  currentStep?: number;
  [key: string]: unknown;
}

export interface UseFormDraftOptions<TFormValues extends FieldValues> {
  /** Storage key 用於儲存暫存資料 */
  storageKey: StorageEnum;
  /** React Hook Form 實例 */
  form: UseFormReturn<TFormValues>;
  /** 當前步驟（可選） */
  currentStep?: number;
  /** 是否啟用自動儲存，預設為 true */
  autoSave?: boolean;
  /** 自動儲存的 debounce 時間（毫秒），預設為 500 */
  debounceMs?: number;
  /** 是否在首次載入時檢查暫存資料，預設為 true */
  checkOnMount?: boolean;
  /** 表單值變化時的監聽函數 */
  onFormValuesChange?: (values: TFormValues) => void;
}

export interface UseFormDraftReturn<TFormValues extends FieldValues> {
  /** 是否有暫存資料 */
  hasDraft: boolean;
  /** 暫存資料 */
  draft: DraftData<TFormValues> | null;
  /** 是否顯示恢復對話框 */
  showRestoreDialog: boolean;
  /** 設置是否顯示恢復對話框 */
  setShowRestoreDialog: (show: boolean) => void;
  /** 是否正在檢查暫存資料 */
  isCheckingDraft: boolean;
  /** 恢復暫存資料 */
  restoreDraft: () => void;
  /** 清除暫存資料 */
  clearDraft: () => void;
  /** 手動儲存暫存資料 */
  saveDraft: () => void;
}

/**
 * 表單暫存 Hook
 * 用於自動儲存和恢復表單資料
 *
 * @example
 * ```tsx
 * const form = useForm<FormValues>({ ... });
 * const {
 *   hasDraft,
 *   showRestoreDialog,
 *   setShowRestoreDialog,
 *   restoreDraft,
 *   clearDraft,
 * } = useFormDraft({
 *   storageKey: StorageEnum.ManualPracticeDraft,
 *   form,
 *   currentStep,
 * });
 * ```
 */
export function useFormDraft<TFormValues extends FieldValues>(
  options: UseFormDraftOptions<TFormValues>
): UseFormDraftReturn<TFormValues> {
  const {
    storageKey,
    form,
    currentStep = 1,
    autoSave = true,
    debounceMs = 500,
    checkOnMount = true,
    onFormValuesChange,
  } = options;

  const draftStorage = useMemo(() => getStorage<DraftData<TFormValues>>(storageKey), [storageKey]);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isRestoringRef = useRef(false);
  const isInitialMountRef = useRef(true);
  const prevValuesRef = useRef<string>("");

  const [showRestoreDialog, setShowRestoreDialog] = useState(false);
  const [draft, setDraft] = useState<DraftData<TFormValues> | null>(null);
  const [isCheckingDraft, setIsCheckingDraft] = useState(checkOnMount);

  useEffect(() => {
    if (!checkOnMount) {
      setIsCheckingDraft(false);
      return;
    }

    // 使用 setTimeout 確保在下一幀執行，避免阻塞渲染
    const timer = setTimeout(() => {
      const savedDraft = draftStorage.get();
      if (savedDraft?.formValues) {
        setDraft(savedDraft);
        setShowRestoreDialog(true);
      }
      setIsCheckingDraft(false);
    }, 0);

    return () => clearTimeout(timer);
  }, [draftStorage, checkOnMount]);

  // 恢復暫存資料
  const restoreDraft = () => {
    if (!draft) return;

    isRestoringRef.current = true;

    // 恢復表單資料
    Object.keys(draft.formValues).forEach((key) => {
      const formKey = key as Path<TFormValues>;
      form.setValue(formKey, draft.formValues[formKey as keyof TFormValues] as never, {
        shouldDirty: false,
      });
    });

    // 恢復後標記使用者已經互動過，允許後續自動儲存
    hasUserInteractedRef.current = true;
    setShowRestoreDialog(false);

    // 恢復完成後，允許自動儲存
    setTimeout(() => {
      isRestoringRef.current = false;
    }, 100);
  };

  // 清除暫存資料
  const clearDraft = () => {
    draftStorage.remove();
    setShowRestoreDialog(false);
    setDraft(null);
  };

  // 手動儲存暫存資料
  const saveDraft = () => {
    const currentFormValues = form.getValues();
    draftStorage.set({
      formValues: currentFormValues,
      currentStep,
    } as DraftData<TFormValues>);
  };

  // 使用 useWatch 監聽所有表單欄位變化
  const watchedValues = useWatch({
    control: form.control,
  });

  // 追蹤初始值，用於判斷是否真的改變了
  const initialValuesRef = useRef<string>("");
  const hasUserInteractedRef = useRef(false);

  // 初始化時記錄初始值
  useEffect(() => {
    if (initialValuesRef.current === "") {
      initialValuesRef.current = JSON.stringify(watchedValues);
    }
  }, [watchedValues]);

  // 監聽表單的 isDirty 狀態，判斷使用者是否開始編輯
  useEffect(() => {
    if (form.formState.isDirty) {
      hasUserInteractedRef.current = true;
    }
  }, [form.formState.isDirty]);

  // 自動儲存表單資料
  useEffect(() => {
    if (!autoSave) return;
    if (showRestoreDialog) return;
    if (isRestoringRef.current) return;
    if (isCheckingDraft) return;

    // 如果使用者還沒有開始編輯，不進行儲存
    if (!hasUserInteractedRef.current) {
      return;
    }

    // 首次 mount 時不儲存
    if (isInitialMountRef.current) {
      isInitialMountRef.current = false;
      prevValuesRef.current = JSON.stringify(watchedValues);
      return;
    }

    // 檢查值是否真的改變了（與上一次儲存的值比較）
    const currentValuesString = JSON.stringify(watchedValues);
    if (currentValuesString === prevValuesRef.current) {
      return;
    }
    prevValuesRef.current = currentValuesString;

    // 清除之前的 timeout
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    // 延遲儲存，避免頻繁寫入 storage
    saveTimeoutRef.current = setTimeout(() => {
      const currentFormValues = form.getValues();
      draftStorage.set({
        formValues: currentFormValues,
        currentStep,
      } as DraftData<TFormValues>);

      onFormValuesChange?.(currentFormValues);
    }, debounceMs);

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [
    watchedValues,
    currentStep,
    showRestoreDialog,
    autoSave,
    debounceMs,
    form,
    draftStorage,
    onFormValuesChange,
    isCheckingDraft,
  ]);

  // 當步驟變化時立即儲存（只有在使用者已互動時）
  useEffect(() => {
    if (!autoSave) return;
    if (showRestoreDialog || isRestoringRef.current) return;
    if (isCheckingDraft) return;

    // 如果使用者還沒有開始編輯，不進行儲存
    if (!hasUserInteractedRef.current) {
      return;
    }

    // 清除之前的 timeout
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    // 延遲儲存
    saveTimeoutRef.current = setTimeout(() => {
      const currentFormValues = form.getValues();
      draftStorage.set({
        formValues: currentFormValues,
        currentStep,
      } as DraftData<TFormValues>);
    }, 100);

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [currentStep, form, showRestoreDialog, autoSave, draftStorage, isCheckingDraft]);

  return {
    hasDraft: !!draft,
    draft,
    showRestoreDialog,
    setShowRestoreDialog,
    isCheckingDraft,
    restoreDraft,
    clearDraft,
    saveDraft,
  };
}
