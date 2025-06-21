import React, { useCallback } from 'react';
import type { CreateIdeaFormSchema } from '@/services/ideas/schema';
import { useIdeaActions } from '@/features/ideas/hooks/useIdeaActions';
import { useIdeasCache } from '@/features/ideas/hooks/useIdeasCache';
import IdeaForm from './IdeaForm';

interface IdeaCreateContainerProps {
  onSuccess?: (ideaId: string) => void;
  onError?: (error: Error) => void;
  onCancel?: () => void;
  className?: string;
}

/**
 * 創建想法容器組件
 * 整合表單驗證、提交邏輯和快取管理
 */
export const IdeaCreateContainer: React.FC<IdeaCreateContainerProps> = ({
  onSuccess,
  onError,
  onCancel,
  className,
}) => {
  const { addIdeaToCache } = useIdeasCache();
  const { createIdea, isCreating, uploadProgress, error } = useIdeaActions({
    onSuccess: () => {
      // 成功回調在 handleSubmit 中處理
    },
    onError: (createError) => {
      console.error('Failed to create idea:', createError);
      onError?.(createError);
    },
  });

  const handleSubmit = useCallback(async (formData: CreateIdeaFormSchema): Promise<void> => {
    const newIdea = await createIdea(formData);

    // 添加到快取中
    addIdeaToCache(newIdea);

    // 成功回調
    onSuccess?.(newIdea.id);
  }, [createIdea, addIdeaToCache, onSuccess]);

  return (
    <div className={className}>
      {/* 上傳進度指示器 */}
      {isCreating && uploadProgress > 0 && (
        <div className="mb-4 bg-white rounded-lg shadow-sm border p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">
              正在處理你的想法...
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
            {uploadProgress >= 75 && uploadProgress < 90 && '正在儲存想法...'}
            {uploadProgress >= 90 && '即將完成...'}
          </div>
        </div>
      )}

      {/* 錯誤訊息 */}
      {error && (
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
                發布想法時發生錯誤
              </h3>
              <div className="mt-2 text-sm text-red-700">
                {error}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 表單組件 */}
      <IdeaForm
        mode="create"
        onSubmit={handleSubmit}
        onCancel={onCancel}
        isLoading={isCreating}
      />
    </div>
  );
};

export default IdeaCreateContainer;
