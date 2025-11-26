import React, { useCallback, useMemo } from 'react';
import type { UpdateIdeaFormSchema } from '@/services/ideas/schema';
import { useIdea } from '@/features/ideas/hooks/useIdeas';
import { useIdeaActions } from '@/features/ideas/hooks/useIdeaActions';
import { useIdeasCache } from '@/features/ideas/hooks/useIdeasCache';
import { ideaToUpdateFormDefaults } from '@/features/ideas/utils/typeConverters';
import IdeaForm from './IdeaForm';

interface IdeaUpdateContainerProps {
  ideaId: string;
  onSuccess?: () => void;
  onError?: (error: Error) => void;
  onCancel?: () => void;
  className?: string;
}

/**
 * 更新想法容器組件
 * 整合想法加載、表單驗證、提交邏輯和快取管理
 */
export const IdeaUpdateContainer: React.FC<IdeaUpdateContainerProps> = ({
  ideaId,
  onSuccess,
  onError,
  onCancel,
  className,
}) => {
  const { idea, isLoading: isLoadingIdea, error: loadError } = useIdea(ideaId);
  const { updateIdeaInCache } = useIdeasCache();
  const {
    updateIdea, isUpdating, uploadProgress, error: updateError,
  } = useIdeaActions({
    onSuccess: () => {
      // 成功回調在 handleSubmit 中處理
    },
    onError: (err) => {
      console.error('Failed to update idea:', err);
      onError?.(err);
    },
  });

  // 轉換想法數據為表單預設值
  const defaultValues = useMemo(() => {
    if (!idea) return undefined;
    return ideaToUpdateFormDefaults(idea);
  }, [idea]);

  const handleSubmit = useCallback(async (formData: UpdateIdeaFormSchema): Promise<void> => {
    const updatedIdea = await updateIdea(formData);

    // 更新快取
    updateIdeaInCache(updatedIdea);

    // 成功回調
    onSuccess?.();
  }, [updateIdea, updateIdeaInCache, onSuccess]);

  // 載入狀態
  if (isLoadingIdea) {
    return (
      <div className={`${className} flex min-h-[400px] items-center justify-center`}>
        <div className="text-center">
          <div className="mx-auto size-12 animate-spin rounded-full border-b-2 border-primary-base" />
          <p className="mt-4 text-gray-500">載入想法資料中...</p>
        </div>
      </div>
    );
  }

  // 錯誤狀態
  if (loadError || !idea) {
    return (
      <div className={`${className} flex min-h-[400px] items-center justify-center`}>
        <div className="text-center">
          <div className="mb-4 text-6xl text-red-500">⚠️</div>
          <h3 className="mb-2 text-lg font-medium text-gray-900">
            無法載入想法
          </h3>
          <p className="mb-4 text-gray-500">
            {loadError || '找不到指定的想法'}
          </p>
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="rounded-lg bg-primary-base px-4 py-2 text-white hover:bg-primary-darker"
            >
              返回
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={className}>
      {/* 上傳進度指示器 */}
      {isUpdating && uploadProgress > 0 && (
        <div className="mb-4 rounded-lg border bg-white p-4 shadow-sm">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">
              正在更新你的想法...
            </span>
            <span className="text-sm text-gray-500">
              {Math.round(uploadProgress)}
              %
            </span>
          </div>
          <div className="h-2 w-full rounded-full bg-gray-200">
            <div
              className="h-2 rounded-full bg-primary-base transition-all duration-300"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
          <div className="mt-2 text-xs text-gray-500">
            {uploadProgress < 25 && '正在準備檔案...'}
            {uploadProgress >= 25 && uploadProgress < 75 && '正在上傳檔案...'}
            {uploadProgress >= 75 && uploadProgress < 90 && '正在儲存更改...'}
            {uploadProgress >= 90 && '即將完成...'}
          </div>
        </div>
      )}

      {/* 錯誤訊息 */}
      {updateError && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-4">
          <div className="flex">
            <div className="shrink-0">
              <svg
                className="size-5 text-red-400"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">
                更新想法時發生錯誤
              </h3>
              <div className="mt-2 text-sm text-red-700">
                {updateError}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 表單組件 */}
      <IdeaForm
        mode="update"
        defaultValues={defaultValues}
        onSubmit={handleSubmit}
        onCancel={onCancel}
        isLoading={isUpdating}
      />
    </div>
  );
};

export default IdeaUpdateContainer;
