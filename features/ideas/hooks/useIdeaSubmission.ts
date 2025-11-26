import { useState, useCallback } from 'react';
import type {
  CreateIdeaFormSchema,
  UpdateIdeaFormSchema,
  IdeaSchema,
} from '@/services/ideas/schema';
import { ideaAPI } from '@/services/ideas/api';
import {
  formToCreateApiRequest,
  formToUpdateApiRequest,
  hasFilesToUpload,
  getFilesToUpload,
} from '@/features/ideas/utils/typeConverters';

/**
 * 文件上傳服務介面
 * TODO: 實作真實的文件上傳服務
 */
interface FileUploadService {
  uploadImages(files: File[]): Promise<string[]>;
  uploadVideos(files: File[]): Promise<string[]>;
}

// Mock 文件上傳服務
const mockFileUploadService: FileUploadService = {
  uploadImages: async (files: File[]) => {
    // TODO: 實作真實的圖片上傳
    return files.map(
      (file, index) => `https://mock.example.com/images/${Date.now()}_${index}_${file.name}`
    );
  },
  uploadVideos: async (files: File[]) => {
    // TODO: 實作真實的影片上傳
    return files.map(
      (file, index) => `https://mock.example.com/videos/${Date.now()}_${index}_${file.name}`
    );
  },
};

/**
 * 想法創建提交 Hook
 * 專門處理創建想法的提交邏輯，包含文件上傳
 */
export function useIdeaSubmission(options?: {
  onSuccess?: (idea: IdeaSchema) => void;
  onError?: (error: Error) => void;
  fileUploadService?: FileUploadService;
}) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const fileService = options?.fileUploadService || mockFileUploadService;

  const submit = useCallback(
    async (formData: CreateIdeaFormSchema): Promise<IdeaSchema> => {
      setIsSubmitting(true);
      setUploadProgress(0);

      try {
        let imageUrls: string[] = [];
        let videoUrls: string[] = [];

        // 如果有文件需要上傳，先上傳文件
        if (hasFilesToUpload(formData)) {
          const { imageFiles, videoFiles } = getFilesToUpload(formData);

          setUploadProgress(25);

          // 並行上傳圖片和影片
          const [uploadedImageUrls, uploadedVideoUrls] = await Promise.all([
            imageFiles.length > 0
              ? fileService.uploadImages(imageFiles)
              : Promise.resolve([]),
            videoFiles.length > 0
              ? fileService.uploadVideos(videoFiles)
              : Promise.resolve([]),
          ]);

          imageUrls = uploadedImageUrls;
          videoUrls = uploadedVideoUrls;

          setUploadProgress(75);
        }

        // 轉換為 API 請求格式
        const requestData = formToCreateApiRequest(
          formData,
          imageUrls,
          videoUrls
        );

        setUploadProgress(90);

        // 發送 API 請求
        const response = await ideaAPI.create(requestData);

        setUploadProgress(100);

        if (response.success && response.data) {
          options?.onSuccess?.(response.data);
          return response.data;
        }
        throw new Error('創建想法失敗');
      } catch (error) {
        const errorInstance = error instanceof Error ? error : new Error('提交失敗');
        options?.onError?.(errorInstance);
        throw errorInstance;
      } finally {
        setIsSubmitting(false);
        setUploadProgress(0);
      }
    },
    [options, fileService]
  );

  return {
    submit,
    isSubmitting,
    uploadProgress,
  };
}

/**
 * 想法更新提交 Hook
 * 專門處理更新想法的提交邏輯
 */
export function useIdeaUpdateSubmission(options?: {
  onSuccess?: (idea: IdeaSchema) => void;
  onError?: (error: Error) => void;
  fileUploadService?: FileUploadService;
}) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const fileService = options?.fileUploadService || mockFileUploadService;

  const submit = useCallback(
    async (formData: UpdateIdeaFormSchema): Promise<IdeaSchema> => {
      setIsSubmitting(true);
      setUploadProgress(0);

      try {
        let imageUrls: string[] = [];
        let videoUrls: string[] = [];

        // 如果有新文件需要上傳，先上傳文件
        if (hasFilesToUpload(formData)) {
          const { imageFiles, videoFiles } = getFilesToUpload(formData);

          setUploadProgress(25);

          // 並行上傳圖片和影片
          const [uploadedImageUrls, uploadedVideoUrls] = await Promise.all([
            imageFiles.length > 0
              ? fileService.uploadImages(imageFiles)
              : Promise.resolve([]),
            videoFiles.length > 0
              ? fileService.uploadVideos(videoFiles)
              : Promise.resolve([]),
          ]);

          imageUrls = uploadedImageUrls;
          videoUrls = uploadedVideoUrls;

          setUploadProgress(75);
        }

        // 轉換為 API 請求格式
        const requestData = formToUpdateApiRequest(
          formData,
          imageUrls,
          videoUrls
        );

        setUploadProgress(90);

        // 發送 API 請求
        const response = await ideaAPI.update(requestData);

        setUploadProgress(100);

        if (response.success && response.data) {
          options?.onSuccess?.(response.data);
          return response.data;
        }
        throw new Error('更新想法失敗');
      } catch (error) {
        const errorInstance = error instanceof Error ? error : new Error('更新失敗');
        options?.onError?.(errorInstance);
        throw errorInstance;
      } finally {
        setIsSubmitting(false);
        setUploadProgress(0);
      }
    },
    [options, fileService]
  );

  return {
    submit,
    isSubmitting,
    uploadProgress,
  };
}

/**
 * 想法刪除 Hook
 * 專門處理刪除想法的邏輯
 */
export function useIdeaDeletion(options?: {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const submit = useCallback(
    async (ideaId: string): Promise<void> => {
      setIsSubmitting(true);

      try {
        await ideaAPI.delete(ideaId);
        options?.onSuccess?.();
      } catch (error) {
        const errorInstance = error instanceof Error ? error : new Error('刪除失敗');
        options?.onError?.(errorInstance);
        throw errorInstance;
      } finally {
        setIsSubmitting(false);
      }
    },
    [options]
  );

  return {
    submit,
    isSubmitting,
  };
}

// 批量操作功能已移除，如需要可考慮在未來重新實現
