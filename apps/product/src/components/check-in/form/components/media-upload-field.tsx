import { FileUpload } from "@daodao/ui/components/file-upload";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@daodao/ui/components/form";
import imageCompression from "browser-image-compression";
import { X } from "lucide-react";
import { useCallback, useState } from "react";
import type { UseFormReturn } from "react-hook-form";
import type { CheckInFormValuesType } from "../schema";

const MAX_MEDIA_SIZE = 500 * 1024; // 500KB（與後端 multer 限制一致）
const MAX_MEDIA_SIZE_MB = MAX_MEDIA_SIZE / 1024 / 1024;
// GIF 不經 Canvas 壓縮（會丟失動畫），超過限制直接拒絕
const COMPRESSIBLE_TYPES = ["image/jpeg", "image/png", "image/webp"];
const ALLOWED_TYPES = [...COMPRESSIBLE_TYPES, "image/gif"];

interface IMediaUploadFieldProps {
  form: UseFormReturn<CheckInFormValuesType>;
  /** 既有的圖片 URL（編輯模式時顯示） */
  existingImages?: string[];
  /** 既有圖片變更時的回調（使用者刪除既有圖片） */
  onExistingImagesChange?: (urls: string[]) => void;
}

/**
 * 媒體上傳欄位組件
 * - 可壓縮格式（JPG/PNG/WebP）超過 500KB 自動壓縮
 * - GIF 超過 500KB 直接拒絕（壓縮會丟失動畫）
 */
export const MediaUploadField = ({ form, existingImages = [], onExistingImagesChange }: IMediaUploadFieldProps) => {
  const [isCompressing, setIsCompressing] = useState(false);
  const [keptImages, setKeptImages] = useState<string[]>(existingImages);

  const handleRemoveExistingImage = useCallback(
    (index: number) => {
      const updated = keptImages.filter((_, i) => i !== index);
      setKeptImages(updated);
      onExistingImagesChange?.(updated);
    },
    [keptImages, onExistingImagesChange]
  );

  const handleFilesChange = useCallback(
    async (newFiles: File[], fieldOnChange: (files: File[]) => void) => {
      // 格式驗證
      const invalidFormat = newFiles.filter((f) => !ALLOWED_TYPES.includes(f.type));
      if (invalidFormat.length > 0) {
        form.setError("media", {
          type: "manual",
          message: `不支援的格式（${invalidFormat.map((f) => f.name).join("、")}），請上傳 JPG、PNG、WebP 或 GIF`,
        });
        fieldOnChange(newFiles.filter((f) => ALLOWED_TYPES.includes(f.type)));
        return;
      }

      // GIF 超過限制直接拒絕（Canvas 壓縮會丟失動畫）
      const oversizedGifs = newFiles.filter(
        (f) => f.type === "image/gif" && f.size > MAX_MEDIA_SIZE
      );
      if (oversizedGifs.length > 0) {
        form.setError("media", {
          type: "manual",
          message: `GIF 大小不能超過 500KB（${oversizedGifs.map((f) => f.name).join("、")} 超過限制）`,
        });
        fieldOnChange(newFiles.filter((f) => !(f.type === "image/gif" && f.size > MAX_MEDIA_SIZE)));
        return;
      }

      // 無需壓縮
      const needsCompression = newFiles.some(
        (f) => COMPRESSIBLE_TYPES.includes(f.type) && f.size > MAX_MEDIA_SIZE
      );
      if (!needsCompression) {
        form.clearErrors("media");
        fieldOnChange(newFiles);
        return;
      }

      // 壓縮可壓縮格式的大圖
      setIsCompressing(true);
      try {
        const compressed = await Promise.all(
          newFiles.map(async (file) => {
            if (!COMPRESSIBLE_TYPES.includes(file.type) || file.size <= MAX_MEDIA_SIZE) {
              return file;
            }
            const blob = await imageCompression(file, {
              maxSizeMB: MAX_MEDIA_SIZE_MB * 0.9,
              maxWidthOrHeight: 1920,
              useWebWorker: true,
            });
            // imageCompression 回傳 Blob，需轉回 File 以通過 z.instanceof(File) 驗證
            return new File([blob], file.name, { type: blob.type });
          })
        );
        form.clearErrors("media");
        fieldOnChange(compressed);
      } catch {
        form.setError("media", {
          type: "manual",
          message: "圖片壓縮失敗，請重試",
        });
      } finally {
        setIsCompressing(false);
      }
    },
    [form]
  );

  return (
    <FormField
      control={form.control}
      name="media"
      render={({ field }) => (
        <FormItem className="mb-16 md:mb-8">
          <div className="mb-3 flex items-center justify-between gap-2">
            <FormLabel className="block text-base font-medium text-text-dark">
              上傳照片
            </FormLabel>

            <FormDescription className="text-sm text-light-gray">
              {isCompressing ? "壓縮中..." : `已上傳 ${keptImages.length + (field.value?.length || 0)}/3 張`}
            </FormDescription>
          </div>

          {/* 既有圖片預覽（可刪除） */}
          {keptImages.length > 0 && (
            <div className="mb-3 flex flex-wrap gap-2">
              {keptImages.map((url, index) => (
                <div key={url} className="relative">
                  <div className="size-20 rounded-lg overflow-hidden border-2 border-gray-200">
                    <img src={url} alt={`既有圖片 ${index + 1}`} className="w-full h-full object-cover" />
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveExistingImage(index)}
                    className="absolute top-2 right-2 size-5 bg-[#295E5C66]/40 text-white rounded-full flex items-center justify-center"
                    aria-label="移除圖片"
                  >
                    <X className="size-3" />
                  </button>
                </div>
              ))}
            </div>
          )}

          <FormControl>
            <FileUpload
              files={field.value}
              onFilesChange={(newFiles) => handleFilesChange(newFiles, field.onChange)}
              accept="image/jpeg,image/png,image/webp,image/gif"
              multiple
              maxFiles={3 - keptImages.length}
              disabled={isCompressing}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};
