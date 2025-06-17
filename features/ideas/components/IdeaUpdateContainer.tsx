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
  const { updateIdea, isUpdating, uploadProgress, error: updateError } = useIdeaActions({
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
      <div className={`${className} flex items-center justify-center min-h-[400px]`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-base mx-auto" />
          <p className="mt-4 text-gray-500">載入想法資料中...</p>
        </div>
      </div>
    );
  }

  // 錯誤狀態
  if (loadError || !idea) {
    return (
      <div className={`${className} flex items-center justify-center min-h-[400px]`}>
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            無法載入想法
          </h3>
          <p className="text-gray-500 mb-4">
            {loadError || '找不到指定的想法'}
          </p>
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="bg-primary-base text-white px-4 py-2 rounded-lg hover:bg-primary-darker"
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
        <div className="mb-4 bg-white rounded-lg shadow-sm border p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">
              正在更新你的想法...
            </span>
            <span className="text-sm text-gray-500">
              {Math.round(uploadProgress)}%
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-primary-base h-2 rounded-full transition-all duration-300"
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
        <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-red-400"
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
