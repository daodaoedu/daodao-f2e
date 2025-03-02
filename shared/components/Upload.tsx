import { ChangeEvent, useEffect, useRef, useState } from 'react';
import Button, { ButtonProps } from './Button';

interface UploadProps extends Omit<ButtonProps<'button'>, 'onChange' | 'as'> {
  accept?: string;
  children?: React.ReactNode;
  validate?: (file: File[]) => boolean | Promise<boolean>;
  onChange?: (e: ChangeEvent<HTMLInputElement>) => void;
  onFilesChange?: (files: File[]) => void;
  onPreviewChange?: (previewList: string[]) => void;
}

function Upload({
  accept = 'image/*',
  children,
  validate,
  onChange,
  onClick,
  onFilesChange,
  onPreviewChange,
  ...props
}: UploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [urls, setUrls] = useState<string[]>([]);

  const handleChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);

    if (validate) {
      const isValid = await validate(files);

      if (!isValid) return;
    }

    const objectUrls = files.map(URL.createObjectURL);

    onChange?.(e);
    onFilesChange?.(files);
    onPreviewChange?.(objectUrls);
    setUrls(objectUrls);
  };

  const handleClick = (
    e: React.MouseEvent<HTMLButtonElement | HTMLAnchorElement>
  ) => {
    onClick?.(e as React.MouseEvent<HTMLButtonElement>);
    inputRef.current?.click();
  };

  useEffect(() => {
    return () => urls.forEach(URL.revokeObjectURL);
  }, [urls]);

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        className="hidden"
        accept={accept}
        onChange={handleChange}
      />
      <Button
        variant="solid"
        color="secondary"
        onClick={handleClick}
        {...props}
      >
        {children}
      </Button>
    </>
  );
}

export default Upload;
