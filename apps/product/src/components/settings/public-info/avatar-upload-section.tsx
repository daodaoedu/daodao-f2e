"use client";

import { useTranslations } from "@daodao/i18n";
import { Avatar, AvatarFallback, AvatarImage } from "@daodao/ui/components/avatar";
import { FileUpload } from "@daodao/ui/components/file-upload";
import { Camera } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type { UseFormReturn } from "react-hook-form";
import type { PublicInfoFormValues } from "./schema";

interface IAvatarUploadSectionProps {
  form: UseFormReturn<PublicInfoFormValues>;
  avatarFile: File | null;
  onAvatarFileChange: (file: File | null) => void;
}

export const AvatarUploadSection = ({
  form,
  avatarFile,
  onAvatarFileChange,
}: IAvatarUploadSectionProps) => {
  const t = useTranslations("public_info_settings");
  const fileUploadRef = useRef<HTMLDivElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const photoURL = form.watch("photoURL");
  const files = avatarFile ? [avatarFile] : [];

  // 清理預覽 URL
  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  // 當檔案改變時，建立預覽 URL
  useEffect(() => {
    if (avatarFile) {
      const url = URL.createObjectURL(avatarFile);
      setPreviewUrl(url);
      return () => {
        URL.revokeObjectURL(url);
      };
    } else {
      setPreviewUrl(null);
    }
  }, [avatarFile]);

  const handleFilesChange = (newFiles: File[]) => {
    const file = newFiles.length > 0 ? newFiles[0] : null;
    onAvatarFileChange(file ?? null);
  };

  const handleAvatarClick = () => {
    // 觸發 FileUpload 的點擊事件
    const fileInput = fileUploadRef.current?.querySelector(
      'input[type="file"]'
    ) as HTMLInputElement;
    fileInput?.click();
  };

  const displayUrl = previewUrl || photoURL;

  return (
    <div className="flex flex-col items-center">
      <button
        type="button"
        onClick={handleAvatarClick}
        className="relative group cursor-pointer mb-4"
        aria-label={t("avatar_upload_aria")}
      >
        <Avatar className="size-24">
          <AvatarImage src={displayUrl || undefined} alt={t("avatar_alt")} className="bg-very-light-gray" />
          <AvatarFallback className="bg-very-light-gray text-text-dark text-xl">
            {form.watch("name")?.charAt(0) || "?"}
          </AvatarFallback>
        </Avatar>
        <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
          <Camera className="size-6 text-white" />
        </div>
      </button>
      <div ref={fileUploadRef} className="hidden">
        <FileUpload
          files={files}
          onFilesChange={handleFilesChange}
          accept="image/*"
          multiple={false}
          maxFiles={1}
        />
      </div>
    </div>
  );
};
