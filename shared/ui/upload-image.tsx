'use client';

import useSWR from 'swr';
import toast from 'react-hot-toast';
import {
  ChangeEvent,
  forwardRef,
  useEffect,
  useReducer,
  useRef,
  useState,
} from 'react';
import {
  Check, CloudUpload, Dice5Icon, Link2Icon, X,
} from 'lucide-react';
import { Image } from '@/shared/ui/image';
import { uploadImagesSchema } from '@/services/images';
import { Button, type ButtonProps } from '@/shared/ui/button';
import { AspectRatio } from '@/shared/ui/aspect-ratio';
import { cn } from '@/shared/lib/cn';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/shared/ui/form';
import { Control, FieldPath, FieldValues } from 'react-hook-form';
import ResponsiveModal, { ResponsiveModalSize } from './responsive-modal';
import {
  Tabs, TabsContent, TabsList, TabsTrigger,
} from './tabs';
import { Separator } from './separator';
import { Input } from './input';
import { Skeleton } from './skeleton';

export interface ImageDataType {
  id: string;
  file?: File;
  url: string;
}

enum TabEnum {
  Upload = 'upload',
  Random = 'random',
}

const fetchRandomImage = async ([width, height, random]: [
  number,
  number,
  number
]) => {
  const response = await fetch(
    `https://picsum.photos/${width}/${height}?random=${random}`
  );
  const blob = await response.blob();
  return new Promise<string>((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target?.result?.toString() ?? '');
    reader.readAsDataURL(blob);
  });
};

interface UploadFileProps extends Omit<ButtonProps, 'onChange'> {
  accept?: string;
  children?: React.ReactNode;
  maxCount?: number;
  multiple?: boolean;
  ratio?: number;
  height?: number;
  schema?: typeof uploadImagesSchema;
  value?: string[];
  onChange?: (files: ImageDataType[], e: ChangeEvent<HTMLInputElement>) => void;
  onFilesChange?: (files: File[]) => void;
  onPreviewsChange?: (previewList: string[]) => void;
}

export const UploadImage = forwardRef(
  (
    {
      accept = 'image/*',
      children,
      multiple = false,
      ratio = 4 / 3,
      height = 360,
      schema = uploadImagesSchema,
      value,
      onChange,
      onClick,
      onFilesChange,
      onPreviewsChange,
      ...props
    }: UploadFileProps,
    ref: React.Ref<HTMLButtonElement>
  ) => {
    const inputRef = useRef<HTMLInputElement>(null);
    const imageWrapperRef = useRef<HTMLDivElement>(null);
    const [urls, setUrls] = useState<string[]>(value ?? []);
    const [isOpen, setIsOpen] = useState(false);
    const [tab, setTab] = useState(TabEnum.Upload);
    const [random, dispatchRandom] = useReducer((state) => state + 1, 0);
    const { data, error, isValidating } = useSWR<string>(
      tab === 'random'
        ? [Math.floor(height * ratio) * 2, Math.floor(height) * 2, random]
        : null,
      fetchRandomImage,
      {
        errorRetryCount: 2,
        errorRetryInterval: 1000,
      }
    );
    const hasImage = urls.length > 0;

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

    useEffect(() => () => urls.forEach(URL.revokeObjectURL), [urls]);

    return (
      <>
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
            type="button"
            variant="ghost"
            onClick={() => setIsOpen(true)}
            className={cn(
              'relative w-full h-full rounded-lg overflow-hidden',
              'border border-dashed border-primary-base'
            )}
            {...props}
          >
            {hasImage && (
              <Image src={urls[0]} alt="upload" className="object-cover" fill />
            )}
            <span
              className={cn(
                'absolute inset-0 flex justify-center items-center gap-2',
                'text-primary-base hover:bg-primary-lightest/80 transition-opacity',
                !hasImage ? 'bg-primary-lightest' : 'opacity-0 hover:opacity-100'
              )}
            >
              {children}
            </span>
          </Button>
        </AspectRatio>
        <ResponsiveModal
          open={isOpen}
          onClose={() => setIsOpen(false)}
          title="選擇封面"
          className="bg-primary-palest"
          titleClassName="text-left"
          size={ResponsiveModalSize.Large}
        >
          <Tabs
            defaultValue={TabEnum.Upload}
            className="rounded-lg bg-basic-white"
            onValueChange={(_tab) => setTab(_tab as TabEnum)}
          >
            <TabsList>
              <TabsTrigger value={TabEnum.Upload} className="basis-1/2">
                圖片上傳
              </TabsTrigger>
              <TabsTrigger value={TabEnum.Random} className="basis-1/2">
                隨機圖片
              </TabsTrigger>
            </TabsList>
            <Separator />
            <TabsContent value={TabEnum.Upload} className="md:p-6 lg:p-6">
              <div>
                <div
                  ref={imageWrapperRef}
                  className={cn(
                    'p-10 mb-4 flex flex-col justify-center items-center gap-3 w-full',
                    'border border-dashed border-primary-base rounded-lg'
                  )}
                  style={{ height: `${height}px` }}
                >
                  <CloudUpload size={48} className="mb-1" />
                  <div className="body-md">將你要上傳的圖片檔案拖曳到這裡</div>
                  <ul className="body-sm flex list-disc gap-6 text-basic-300">
                    <li>大小限制: 500KB</li>
                    <li>格式限制: .png、.jpg</li>
                  </ul>
                  <Button
                    type="button"
                    variant="outline"
                    size="lg"
                    onClick={handleClick}
                  >
                    選取檔案
                  </Button>
                </div>
                <div className="flex items-center gap-4">
                  <Input
                    type="text"
                    placeholder="請輸入影像連結"
                    prefixIcon={<Link2Icon />}
                    suffixIcon={<X />}
                    onSuffixIconClick={() => {
                      console.log('suffixIconClick');
                    }}
                  />
                  <Button type="button" variant="outline" size="lg">
                    上傳
                  </Button>
                </div>
              </div>
            </TabsContent>
            <TabsContent value={TabEnum.Random} className="md:p-6 lg:p-6">
              <div className="mb-4 flex justify-center">
                {isValidating && (
                  <Skeleton style={{ width: `${height * ratio}px` }}>
                    <AspectRatio ratio={ratio} />
                  </Skeleton>
                )}
                {!isValidating && error && (
                  <Skeleton
                    className="bg-alert/10"
                    style={{ width: `${height * ratio}px` }}
                  >
                    <AspectRatio
                      ratio={ratio}
                      className="flex items-center justify-center text-alert"
                    >
                      圖片生成失敗，請稍後再試
                    </AspectRatio>
                  </Skeleton>
                )}
                {!isValidating && !error && data && (
                  <Image
                    src={data}
                    alt="random"
                    width={height * ratio}
                    height={height}
                  />
                )}
              </div>
              <div className="flex justify-center">
                <Button
                  type="button"
                  variant="outline"
                  size="lg"
                  onClick={dispatchRandom}
                >
                  <Dice5Icon size={15} />
                  隨機生成
                </Button>
              </div>
            </TabsContent>
          </Tabs>
          <footer className="mt-2 flex justify-center pb-4">
            <Button type="button" size="lg">
              <Check size={16} />
              確認
            </Button>
          </footer>
        </ResponsiveModal>
      </>
    );
  }
);
UploadImage.displayName = 'UploadFile';

interface FormUploadImageProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
> extends Omit<UploadFileProps, 'onChange' | 'value'> {
  control: Control<TFieldValues>;
  name: TName;
  label?: string;
  required?: boolean;
  disabled?: boolean;
  onFileSelect?: (files: ImageDataType[]) => void;
}

export const FormUploadImage = <
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
>({
  control,
  name,
  label,
  required = false,
  disabled = false,
  onFileSelect,
  ...uploadProps
}: FormUploadImageProps<TFieldValues, TName>) => {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          {label && <FormLabel required={required}>{label}</FormLabel>}
          <FormControl>
            <UploadImage
              {...uploadProps}
              value={field.value ? [field.value] : []}
              onChange={onFileSelect}
              disabled={disabled}
            >
              選擇圖片
            </UploadImage>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

FormUploadImage.displayName = 'FormUploadImage';

interface UploadAvatarProps extends Omit<ButtonProps, 'onChange' | 'size'> {
  value?: string;
  size?: number;
  disabled?: boolean;
  onChange?: (url: string) => void;
  onFileSelect?: (file: File) => void;
}

export const UploadAvatar = forwardRef<HTMLButtonElement, UploadAvatarProps>(
  (
    {
      value,
      size = 128,
      disabled = false,
      onChange,
      onFileSelect,
      className,
      ...props
    },
    ref
  ) => {
    const inputRef = useRef<HTMLInputElement>(null);
    const [previewUrl, setPreviewUrl] = useState<string>(value || '');

    const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      const validation = uploadImagesSchema.safeParse({ files: [file] });
      if (!validation.success) {
        toast.error(validation.error.issues[0].message);
        return;
      }

      const objectUrl = URL.createObjectURL(file);
      setPreviewUrl(objectUrl);

      onFileSelect?.(file);
    };

    const handleClick = () => {
      if (!disabled) {
        inputRef.current?.click();
      }
    };

    const handleRemove = (e: React.MouseEvent) => {
      e.stopPropagation();
      setPreviewUrl('');
      onChange?.('');
      
      if (inputRef.current) {
        inputRef.current.value = '';
      }
    };

    useEffect(() => {
      setPreviewUrl(value || '');
    }, [value]);

    return (
      <div className="relative inline-block">
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
          disabled={disabled}
        />
        
        <Button
          ref={ref}
          type="button"
          variant="ghost"
          className={cn(
            'relative overflow-hidden rounded-full border-2 border-dashed border-basic-300 p-0',
            'hover:border-primary-base hover:bg-primary-lightest transition-colors',
            disabled && 'opacity-50 cursor-not-allowed',
            className
          )}
          style={{ width: size, height: size }}
          onClick={handleClick}
          disabled={disabled}
          {...props}
        >
          {previewUrl ? (
            <>
              <img
                src={previewUrl}
                alt="頭像預覽"
                className="size-full object-cover"
                onError={() => setPreviewUrl('')}
              />
              {!disabled && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 transition-opacity hover:opacity-100">
                  <CloudUpload className="size-6 text-white" />
                </div>
              )}
            </>
          ) : (
            <div className="flex flex-col items-center justify-center text-basic-400">
              <CloudUpload className="mb-1 size-8" />
              <span className="text-xs">點擊上傳</span>
            </div>
          )}
        </Button>

        {previewUrl && !disabled && (
          <Button
            type="button"
            variant="alert"
            size="sm"
            className="absolute -right-2 -top-2 size-6 rounded-full p-0"
            onClick={handleRemove}
          >
            <X className="size-3" />
          </Button>
        )}
      </div>
    );
  }
);

UploadAvatar.displayName = 'UploadAvatar';

interface FormUploadAvatarProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
> extends Omit<UploadAvatarProps, 'onChange' | 'value'> {
  control: Control<TFieldValues>;
  name: TName;
  label?: string;
  required?: boolean;
  onFileSelect?: (file: File) => void;
}

export const FormUploadAvatar = <
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
>({
  control,
  name,
  label,
  required = false,
  onFileSelect,
  ...avatarProps
}: FormUploadAvatarProps<TFieldValues, TName>) => (
  <FormField
    control={control}
    name={name}
    render={({ field }) => (
      <FormItem>
        {label && <FormLabel required={required}>{label}</FormLabel>}
        <FormControl>
          <UploadAvatar
            {...avatarProps}
            value={field.value}
            onChange={field.onChange}
            onFileSelect={onFileSelect}
          />
        </FormControl>
        <FormMessage />
      </FormItem>
    )}
  />
);

FormUploadAvatar.displayName = 'FormUploadAvatar';
