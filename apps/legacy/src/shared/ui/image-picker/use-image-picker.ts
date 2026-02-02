"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";

// 支援的圖片格式
const SUPPORTED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

// 共用的驗證和工具函數
const validateFileType = (file: File): boolean => {
  return SUPPORTED_IMAGE_TYPES.includes(file.type);
};

const validateFileSize = (file: File, maxSize: number, maxSizeErrorMessage?: string): boolean => {
  const maxSizeBytes = maxSize * 1024;
  if (file.size > maxSizeBytes) {
    toast.error(maxSizeErrorMessage || `檔案最大限制 ${maxSize} KB`);
    return false;
  }
  return true;
};

const validateSingleFile = (file: File, maxSize: number, maxSizeErrorMessage?: string): boolean => {
  // 檢查檔案類型
  if (!validateFileType(file)) {
    toast.error("請選擇 JPEG、PNG 或 WebP 格式的圖片");
    return false;
  }

  // 檢查檔案大小
  return validateFileSize(file, maxSize, maxSizeErrorMessage);
};

const revokeObjectURL = (url: string): void => {
  if (url.startsWith("blob:")) {
    URL.revokeObjectURL(url);
  }
};

const clearFileInput = (inputRef: React.RefObject<HTMLInputElement | null>): void => {
  const input = inputRef.current;
  if (input) {
    input.value = "";
  }
};

export interface UseImagePickerOptions {
  onFileSelect?: (file: File) => void;
  onUrlChange?: (url: string) => void;
  initialUrl?: string;
  maxSize?: number;
  maxSizeErrorMessage?: string; // 檔案大小錯誤訊息
}

export const useImagePicker = ({
  onFileSelect,
  onUrlChange,
  initialUrl = "",
  maxSize = 500,
  maxSizeErrorMessage,
}: UseImagePickerOptions = {}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string>(initialUrl);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const validateFile = useCallback(
    (file: File): boolean => {
      return validateSingleFile(file, maxSize, maxSizeErrorMessage);
    },
    [maxSize, maxSizeErrorMessage]
  );

  const handleFileSelect = useCallback(
    (file: File) => {
      if (!validateFile(file)) return;

      const objectUrl = URL.createObjectURL(file);
      setPreviewUrl(objectUrl);
      setSelectedFile(file);

      onFileSelect?.(file);
    },
    [validateFile, onFileSelect]
  );

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        handleFileSelect(file);
      }
    },
    [handleFileSelect]
  );

  const triggerFileSelect = useCallback(() => {
    inputRef.current?.click();
  }, []);

  const clearSelection = useCallback(() => {
    revokeObjectURL(previewUrl);

    setPreviewUrl(initialUrl);
    setSelectedFile(null);

    clearFileInput(inputRef);

    onUrlChange?.("");
  }, [previewUrl, initialUrl, onUrlChange]);

  const setUrl = useCallback(
    (url: string) => {
      setPreviewUrl(url);
      setSelectedFile(null);
      onUrlChange?.(url);
    },
    [onUrlChange]
  );

  useEffect(() => {
    return () => {
      revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  useEffect(() => {
    if (initialUrl !== previewUrl && !selectedFile) {
      setPreviewUrl(initialUrl);
    }
  }, [initialUrl, previewUrl, selectedFile]);

  return {
    previewUrl,
    selectedFile,
    hasPreview: !!previewUrl,
    inputRef,
    handleInputChange,
    triggerFileSelect,
    clearSelection,
    setUrl,
    validateFile,
  };
};

// 專門用於頭像的 hook
// 提供頭像專用的預設值和錯誤訊息
export const useAvatarPicker = (options?: UseImagePickerOptions) => {
  return useImagePicker({
    maxSize: 500, // 頭像建議限制 500KB
    maxSizeErrorMessage: "頭像檔案不能超過 500KB",
    ...options,
  });
};

// 專門用於多檔案選擇的 hook
export interface UseMultipleImagePickerOptions {
  onFilesSelect?: (files: File[]) => void;
  maxFiles?: number;
  maxSize?: number;
  maxSizeErrorMessage?: string; // 檔案大小錯誤訊息
  maxFilesErrorMessage?: string; // 檔案數量錯誤訊息
}

export const useMultipleImagePicker = ({
  onFilesSelect,
  maxFiles = 5,
  maxSize = 500,
  maxSizeErrorMessage,
  maxFilesErrorMessage,
}: UseMultipleImagePickerOptions = {}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);

  const validateFiles = useCallback(
    (files: File[]): boolean => {
      // 檢查檔案數量
      if (files.length > maxFiles) {
        toast.error(maxFilesErrorMessage || `最多只能選擇 ${maxFiles} 個檔案`);
        return false;
      }

      // 檢查每個檔案
      const invalidFile = files.find(
        (file) => !validateSingleFile(file, maxSize, maxSizeErrorMessage)
      );

      return !invalidFile;
    },
    [maxFiles, maxSize, maxSizeErrorMessage, maxFilesErrorMessage]
  );

  const handleFilesSelect = useCallback(
    (files: File[]) => {
      if (!validateFiles(files)) return;

      const objectUrls = files.map((file) => URL.createObjectURL(file));

      setSelectedFiles(files);
      setPreviewUrls(objectUrls);
      onFilesSelect?.(files);
    },
    [validateFiles, onFilesSelect]
  );

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(e.target.files || []);
      if (files.length > 0) {
        handleFilesSelect(files);
      }
    },
    [handleFilesSelect]
  );

  const triggerFileSelect = useCallback(() => {
    inputRef.current?.click();
  }, []);

  const clearSelection = useCallback(() => {
    previewUrls.forEach(revokeObjectURL);

    setSelectedFiles([]);
    setPreviewUrls([]);

    clearFileInput(inputRef);
  }, [previewUrls]);

  const removeFile = useCallback(
    (index: number) => {
      const newFiles = selectedFiles.filter((_, i) => i !== index);
      const newUrls = previewUrls.filter((_, i) => i !== index);

      if (previewUrls[index]) {
        revokeObjectURL(previewUrls[index]);
      }

      setSelectedFiles(newFiles);
      setPreviewUrls(newUrls);
      onFilesSelect?.(newFiles);
    },
    [selectedFiles, previewUrls, onFilesSelect]
  );

  useEffect(() => {
    return () => {
      previewUrls.forEach(revokeObjectURL);
    };
  }, [previewUrls]);

  return {
    selectedFiles,
    previewUrls,
    hasFiles: selectedFiles.length > 0,
    inputRef,
    handleInputChange,
    triggerFileSelect,
    clearSelection,
    removeFile,
    validateFiles,
  };
};
