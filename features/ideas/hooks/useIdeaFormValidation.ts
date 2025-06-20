import { useForm, FieldValues } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import type {
  CreateIdeaFormSchema,
  UpdateIdeaFormSchema,
} from '@/services/ideas/schema';
import {
  createIdeaFormSchema,
  updateIdeaFormSchema,
} from '@/services/ideas/schema';

/**
 * 創建想法表單驗證 Hook
 * 專門處理表單驗證邏輯，不包含提交邏輯
 */
export function useIdeaFormValidation() {
  return useForm<CreateIdeaFormSchema>({
    resolver: zodResolver(createIdeaFormSchema),
    defaultValues: {
      content: '',
      tags: [],
      ideaResources: [],
    },
  });
}

/**
 * 更新想法表單驗證 Hook
 * 專門處理更新表單的驗證邏輯
 */
export function useUpdateIdeaFormValidation(defaultValues?: Partial<UpdateIdeaFormSchema>) {
  const form = useForm<UpdateIdeaFormSchema>({
    resolver: zodResolver(updateIdeaFormSchema),
    defaultValues: {
      content: '',
      tags: [],
      ideaResources: [],
      ...defaultValues,
    },
  });

  // 當 defaultValues 改變時更新表單
  useEffect(() => {
    if (defaultValues) {
      form.reset(defaultValues);
    }
  }, [defaultValues, form]);

  return form;
}

/**
 * 通用的想法表單驗證 Hook
 * 支援創建和更新模式
 */
export function useIdeaFormValidationGeneric<T extends 'create' | 'update'>(
  mode: T,
  defaultValues?: T extends 'create' ? Partial<CreateIdeaFormSchema> : Partial<UpdateIdeaFormSchema>
) {
  if (mode === 'create') {
    return useForm<CreateIdeaFormSchema>({
      resolver: zodResolver(createIdeaFormSchema),
      defaultValues: {
        content: '',
        tags: [],
        ideaResources: [],
        ...defaultValues,
      } as CreateIdeaFormSchema,
    });
  } else {
    return useForm<UpdateIdeaFormSchema>({
      resolver: zodResolver(updateIdeaFormSchema),
      defaultValues: {
        content: '',
        tags: [],
        ideaResources: [],
        ...defaultValues,
      } as UpdateIdeaFormSchema,
    });
  }
}

/**
 * 表單狀態管理工具
 */
export function useFormUtils<T extends FieldValues>(form: ReturnType<typeof useForm<T>>) {
  return {
    /**
     * 檢查表單是否有變更
     */
    isDirty: form.formState.isDirty,

    /**
     * 檢查表單是否有錯誤
     */
    hasErrors: Object.keys(form.formState.errors).length > 0,

    /**
     * 取得所有錯誤訊息
     */
    getErrorMessages: () => {
      const { errors } = form.formState;
      return Object.entries(errors).map(([field, error]) => ({
        field,
        message: error?.message as string || `${field} 有錯誤`,
      }));
    },

    /**
     * 重置表單到初始狀態
     */
    resetToInitial: () => {
      form.reset();
    },

    /**
     * 清除所有錯誤
     */
    clearErrors: () => {
      form.clearErrors();
    },

    /**
     * 設置欄位值
     */
    setValue: form.setValue,

    /**
     * 取得欄位值
     */
    getValue: form.getValues,

    /**
     * 觸發驗證
     */
    triggerValidation: form.trigger,
  };
}
