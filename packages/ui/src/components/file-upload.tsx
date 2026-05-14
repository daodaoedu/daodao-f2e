"use client";

import { GalleryAddSvg } from "@daodao/assets";
import { X } from "lucide-react";
import * as React from "react";

import { cn } from "../lib/utils";

// Component to handle image preview with proper cleanup
// 使用 useState + effect cleanup 先清除 src 再 revoke，避免 React Strict Mode 雙重 effect
// 導致 URL 失效後 img 仍指向已 revoked blob URL 而破圖
const FilePreviewImage = ({ file, index }: { file: File; index: number }) => {
  const [objectUrl, setObjectUrl] = React.useState<string | null>(null);

  React.useEffect(() => {
    const url = URL.createObjectURL(file);
    setObjectUrl(url);

    return () => {
      setObjectUrl(null);
      URL.revokeObjectURL(url);
    };
  }, [file]);

  if (!objectUrl) return null;

  return (
    <img src={objectUrl} alt={`Preview ${index + 1}`} className="w-full h-full object-cover" />
  );
};

export interface FileUploadProps {
  files: File[];
  onFilesChange: (files: File[]) => void;
  accept?: string;
  multiple?: boolean;
  maxFiles?: number;
  className?: string;
  disabled?: boolean;
}

const FileUpload = React.forwardRef<HTMLDivElement, FileUploadProps>(
  (
    {
      files,
      onFilesChange,
      accept = "image/*",
      multiple = true,
      maxFiles,
      className,
      disabled = false,
      ...props
    },
    ref
  ) => {
    const fileInputRef = React.useRef<HTMLInputElement>(null);
    const [isDragging, setIsDragging] = React.useState(false);

    const handleFileSelect = (selectedFiles: File[]) => {
      const newFiles = multiple ? [...files, ...selectedFiles] : selectedFiles.slice(0, 1);

      if (maxFiles && newFiles.length > maxFiles) {
        const limitedFiles = newFiles.slice(0, maxFiles);
        onFilesChange(limitedFiles);
        return;
      }

      onFilesChange(newFiles);
    };

    const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
      const selectedFiles = Array.from(event.target.files || []);
      handleFileSelect(selectedFiles);
      // Reset input value to allow selecting the same file again
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    };

    const handleRemoveFile = (index: number) => {
      const newFiles = files.filter((_, i) => i !== index);
      onFilesChange(newFiles);
    };

    const handleDragOver = (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (!disabled) {
        setIsDragging(true);
      }
    };

    const handleDragLeave = (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);
    };

    const handleDrop = (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);

      if (disabled) {
        return;
      }

      const droppedFiles = Array.from(e.dataTransfer.files);
      handleFileSelect(droppedFiles);
    };

    const handleClick = () => {
      if (!disabled && fileInputRef.current) {
        fileInputRef.current.click();
      }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        handleClick();
      }
    };

    return (
      <div ref={ref} className={cn("w-full", className)} {...props}>
        <button
          type="button"
          disabled={disabled}
          aria-label="上傳檔案"
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={handleClick}
          onKeyDown={handleKeyDown}
          className={cn(
            "block w-full border border-solid rounded-lg p-6 text-center cursor-pointer transition-colors",
            isDragging && !disabled
              ? "border-logo-cyan bg-logo-cyan/5"
              : "border-bg-gray hover:border-logo-cyan",
            disabled && "cursor-not-allowed opacity-50"
          )}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept={accept}
            multiple={multiple}
            onChange={handleFileUpload}
            className="hidden"
            disabled={disabled}
          />
          <div className="flex flex-col items-center gap-2.5">
            <GalleryAddSvg className="size-10 text-logo-cyan" />
            <p className="text-light-gray">點擊開啟資料夾或直接拖曳</p>
          </div>
        </button>

        {files.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {files.map((file, index) => (
              <div key={`${file.name}-${index}`} className="relative">
                <div className="size-20 rounded-lg overflow-hidden border-2 border-gray-200">
                  <FilePreviewImage file={file} index={index} />
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemoveFile(index);
                  }}
                  className="absolute top-2 right-2 size-5 bg-[#295E5C66]/40 text-white rounded-full flex items-center justify-center"
                  aria-label="移除媒體"
                  disabled={disabled}
                >
                  <X className="size-3" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }
);
FileUpload.displayName = "FileUpload";

export { FileUpload };
