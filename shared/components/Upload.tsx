import toast from 'react-hot-toast';
import {
  ChangeEvent, useEffect, useRef, useState,
} from 'react';
import { uploadImagesSchema } from '@/services/images';
import { Button, type ButtonProps } from '@/components/ui/button';

export interface ImageDataType {
  id: string;
  file?: File;
  url: string;
}

interface UploadProps extends Omit<ButtonProps, 'onChange'> {
  accept?: string;
  children?: React.ReactNode;
  maxCount?: number;
  multiple?: boolean;
  validate?: typeof uploadImagesSchema;
  variant?: ButtonProps['variant'];
  onChange?: (files: ImageDataType[], e: ChangeEvent<HTMLInputElement>) => void;
  onFilesChange?: (files: File[]) => void;
  onPreviewsChange?: (previewList: string[]) => void;
}

function Upload({
  accept = 'image/*',
  children,
  multiple = false,
  validate = uploadImagesSchema,
  onChange,
  onClick,
  onFilesChange,
  onPreviewsChange,
  variant = 'secondary',
  ...props
}: UploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [urls, setUrls] = useState<string[]>([]);

  const handleChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    const parsed = validate.safeParse({ files });

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

  const handleClick = (
    e: React.MouseEvent<HTMLButtonElement>
  ) => {
    onClick?.(e);
    inputRef.current?.click();
  };

  useEffect(() => () => urls.forEach(URL.revokeObjectURL), [urls]);

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        className="hidden"
        accept={accept}
        multiple={multiple}
        onChange={handleChange}
      />
      <Button
        variant={variant}
        onClick={handleClick}
        {...props}
      >
        {children}
      </Button>
    </>
  );
}

export default Upload;
