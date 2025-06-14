import toast from "react-hot-toast";
import { ChangeEvent, forwardRef, useEffect, useRef, useState } from "react";
import { uploadImagesSchema } from "@/services/images";
import { Button, type ButtonProps } from "@/components/ui/button";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { cn } from "@/utils/cn";

export interface ImageDataType {
  id: string;
  file?: File;
  url: string;
}

interface UploadFileProps extends Omit<ButtonProps, "onChange"> {
  accept?: string;
  children?: React.ReactNode;
  maxCount?: number;
  multiple?: boolean;
  ratio?: number;
  schema?: typeof uploadImagesSchema;
  onChange?: (files: ImageDataType[], e: ChangeEvent<HTMLInputElement>) => void;
  onFilesChange?: (files: File[]) => void;
  onPreviewsChange?: (previewList: string[]) => void;
}

export const UploadFile = forwardRef(
  (
    {
      accept = "image/*",
      children,
      multiple = false,
      ratio = 4 / 3,
      schema = uploadImagesSchema,
      onChange,
      onClick,
      onFilesChange,
      onPreviewsChange,
      ...props
    }: UploadFileProps,
    ref: React.Ref<HTMLButtonElement>
  ) => {
    const inputRef = useRef<HTMLInputElement>(null);
    const [urls, setUrls] = useState<string[]>([]);

    const handleChange = async (e: ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(e.target.files ?? []);
      const parsed = schema.safeParse({ files });

      if (parsed.error) {
        toast.error(parsed.error.issues[0].message);
        return;
      }
      const objectUrls = files.map(URL.createObjectURL);

      onChange?.(
        files.map((file, index) => ({
          file,
          url: objectUrls[index],
          id: crypto.randomUUID(),
        })),
        e
      );
      onFilesChange?.(files);
      onPreviewsChange?.(objectUrls);
      setUrls(objectUrls);
    };

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      onClick?.(e);
      inputRef.current?.click();
    };

    useEffect(() => {
      return () => urls.forEach(URL.revokeObjectURL);
    }, [urls]);

    return (
      <AspectRatio ratio={ratio}>
        <input
          ref={inputRef}
          type="file"
          className="hidden"
          accept={accept}
          multiple={multiple}
          onChange={handleChange}
        />
        <Button
          ref={ref}
          variant="ghost"
          onClick={handleClick}
          className={cn(
            "flex items-center gap-2 w-full h-full rounded-lg",
            "bg-primary-lightest text-primary-base hover:bg-primary-lightest/60",
            "border border-dashed border-primary-base"
          )}
          {...props}
        >
          {children}
        </Button>
      </AspectRatio>
    );
  }
);
UploadFile.displayName = "UploadFile";
