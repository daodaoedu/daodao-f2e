import { useState, useCallback } from 'react';
import useSWRMutation from 'swr/mutation';
import { ideaAPI, getIdeaPathname } from '@/services/modules/ideas';
import type { CreateIdeaSchema, UpdateIdeaSchema, IdeaSchema } from '@/services/modules/ideas';
import { validateIdeaForm } from '../utils';

interface UseIdeaFormOptions {
  ideaId?: string;
  onSuccess?: (idea: IdeaSchema) => void;
  onError?: (error: Error) => void;
}

interface UseIdeaFormReturn {
  // State
  isSubmitting: boolean;
  error: string | null;
  validationErrors: Record<string, string>;

  // Actions
  createIdea: (data: CreateIdeaSchema) => Promise<void>;
  updateIdea: (data: UpdateIdeaSchema) => Promise<void>;
  validateForm: (data: Partial<CreateIdeaSchema | UpdateIdeaSchema>) => boolean;
  clearError: () => void;
}

/**
 * 處理Idea表單相關邏輯的Hook
 */
export const useIdeaForm = ({
  ideaId,
  onSuccess,
  onError,
}: UseIdeaFormOptions = {}): UseIdeaFormReturn => {
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);

  // Create mutation
  const {
    trigger: triggerCreate,
    isMutating: isCreating,
  } = useSWRMutation(
    getIdeaPathname(),
    ideaAPI.create,
    {
      onSuccess: (data) => {
        setError(null);
        setValidationErrors({});
        onSuccess?.(data);
      },
      onError: (err) => {
        const errorMessage = err.message || '創建失敗，請稍後再試';
        setError(errorMessage);
        onError?.(err);
      },
    }
  );

  // Update mutation
  const {
    trigger: triggerUpdate,
    isMutating: isUpdating,
  } = useSWRMutation(
    ideaId ? getIdeaPathname({ ideaId }) : null,
    ideaAPI.update,
    {
      onSuccess: (data) => {
        setError(null);
        setValidationErrors({});
        onSuccess?.(data);
      },
      onError: (err) => {
        const errorMessage = err.message || '更新失敗，請稍後再試';
        setError(errorMessage);
        onError?.(err);
      },
    }
  );

  const validateForm = useCallback((data: Partial<CreateIdeaSchema | UpdateIdeaSchema>): boolean => {
    const validation = validateIdeaForm({
      title: data.title || '',
      content: data.content || '',
      ideaResources: data.ideaResources || [],
    });

    setValidationErrors(validation.errors);
    return validation.isValid;
  }, []);

  const createIdea = useCallback(async (data: CreateIdeaSchema) => {
    setError(null);

    if (!validateForm(data)) {
      return;
    }

    try {
      await triggerCreate(data);
    } catch (err) {
      // Error handling is done in onError callback
      console.error('Failed to create idea:', err);
    }
  }, [triggerCreate, validateForm]);

  const updateIdea = useCallback(async (data: UpdateIdeaSchema) => {
    setError(null);

    if (!validateForm(data)) {
      return;
    }

    try {
      await triggerUpdate(data);
    } catch (err) {
      // Error handling is done in onError callback
      console.error('Failed to update idea:', err);
    }
  }, [triggerUpdate, validateForm]);

  const clearError = useCallback(() => {
    setError(null);
    setValidationErrors({});
  }, []);

  return {
    // State
    isSubmitting: isCreating || isUpdating,
    error,
    validationErrors,

    // Actions
    createIdea,
    updateIdea,
    validateForm,
    clearError,
  };
};
