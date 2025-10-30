'use client';

import useSWR from 'swr';
import { forwardRef, useReducer, useState } from 'react';
import { Control, FieldPath, FieldValues } from 'react-hook-form';
import { Check, CloudUpload, Dice5Icon, Link2Icon, X } from 'lucide-react';
import { Image } from '@/shared/ui/image';
import { Button, type ButtonProps } from '@/shared/ui/button';
import { AspectRatio } from '@/shared/ui/aspect-ratio';
import { cn } from '@/shared/lib/cn';
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from '@/shared/ui/form';
import ResponsiveModal, { ResponsiveModalSize } from '../responsive-modal';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../tabs';
import { Separator } from '../separator';
import { Input } from '../input';
import { Skeleton } from '../skeleton';
import { useMultipleImagePicker } from './use-image-picker';

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
  number,
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

interface ImagePickerProps extends Omit<ButtonProps, 'onChange'> {
  children?: React.ReactNode;
  maxCount?: number;
  multiple?: boolean;
  ratio?: number;
  height?: number;
  value?: string[];
  onChange?: (files: ImageDataType[]) => void;
  onFilesChange?: (files: File[]) => void;
  onPreviewsChange?: (previewList: string[]) => void;
}

export const ImagePicker = forwardRef<HTMLButtonElement, ImagePickerProps>(
  (
    {
      children,
      multiple = false,
      ratio = 4 / 3,
      height = 360,
      value,
      onChange,
      onFilesChange,
      onPreviewsChange,
      ...props
    },
    ref
  ) => {
    const [isOpen, setIsOpen] = useState(false);
    const [tab, setTab] = useState(TabEnum.Upload);
    const [random, dispatchRandom] = useReducer((state) => state + 1, 0);
    const [urlInput, setUrlInput] = useState('');

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

    // 使用多檔案上傳 hook
    const {
      previewUrls,
      hasFiles,
      inputRef,
      handleInputChange,
      triggerFileSelect,
    } = useMultipleImagePicker({
      maxFiles: multiple ? 5 : 1,
      onFilesSelect: (files) => {
        const imageData = files.map((file, index) => ({
          id: crypto.randomUUID(),
          file,
          url: previewUrls[index] || URL.createObjectURL(file),
        }));

        onChange?.(imageData);
        onFilesChange?.(files);
        onPreviewsChange?.(previewUrls);
      },
    });

    const hasImage = hasFiles || (value && value.length > 0);
    const displayUrl = hasFiles ? previewUrls[0] : value?.[0];

    const handleUrlUpload = () => {
      if (!urlInput.trim()) return;

      const imageData: ImageDataType = {
        id: crypto.randomUUID(),
        url: urlInput.trim(),
      };

      onChange?.([imageData]);
      onPreviewsChange?.([urlInput.trim()]);
      setUrlInput('');
    };

    const handleRandomImageSelect = () => {
      if (!data) return;

      const imageData: ImageDataType = {
        id: crypto.randomUUID(),
        url: data,
      };

      onChange?.([imageData]);
      onPreviewsChange?.([data]);
      setIsOpen(false);
    };

    const handleConfirm = () => {
      if (tab === TabEnum.Random && data) {
        handleRandomImageSelect();
      }
      setIsOpen(false);
    };

    return (
      <>
        <AspectRatio ratio={ratio}>
          <input
            ref={inputRef}
            type="file"
            className="hidden"
            accept=".jpeg,.jpg,.png,.webp"
            multiple={multiple}
            onChange={handleInputChange}
          />
          <Button
            ref={ref}
            type="button"
            variant="ghost"
            onClick={() => setIsOpen(true)}
            className={cn(
              'relative size-full overflow-hidden rounded-lg',
              'border border-dashed border-primary-base'
            )}
            {...props}
          >
            {hasImage && displayUrl && (
              <Image
                src={displayUrl}
                alt="upload"
                className="object-cover"
                fill
              />
            )}
            <span
              className={cn(
                'absolute inset-0 flex items-center justify-center gap-2',
                'text-primary-base transition-opacity hover:bg-primary-lightest/80',
                !hasImage
                  ? 'bg-primary-lightest'
                  : 'opacity-0 hover:opacity-100'
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
                  className={cn(
                    'mb-4 flex w-full flex-col items-center justify-center gap-3 p-10',
                    'rounded-lg border border-dashed border-primary-base'
                  )}
                  style={{ height: `${height}px` }}
                >
                  <CloudUpload size={48} className="mb-1" />
                  <div className="body-md">將你要上傳的圖片檔案拖曳到這裡</div>
                  <ul className="body-sm flex list-disc gap-6 text-basic-300">
                    <li>大小限制: 500KB</li>
                    <li>格式限制: .jpeg、.jpg、.png、.webp</li>
                  </ul>
                  <Button
                    type="button"
                    variant="outline"
                    size="lg"
                    onClick={triggerFileSelect}
                  >
                    選取檔案
                  </Button>
                </div>
                <div className="flex items-center gap-4">
                  <Input
                    type="text"
                    placeholder="請輸入影像連結"
                    value={urlInput}
                    onChange={(e) => setUrlInput(e.target.value)}
                    prefixIcon={<Link2Icon />}
                    suffixIcon={<X />}
                    onSuffixIconClick={() => setUrlInput('')}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="lg"
                    onClick={handleUrlUpload}
                    disabled={!urlInput.trim()}
                  >
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
            <Button type="button" size="lg" onClick={handleConfirm}>
              <Check size={16} />
              確認
            </Button>
          </footer>
        </ResponsiveModal>
      </>
    );
  }
);

ImagePicker.displayName = 'ImagePicker';

// FormImagePicker 元件 - 整合 React Hook Form
interface FormImagePickerProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> {
  control: Control<TFieldValues>;
  name: TName;
  label?: string;
  required?: boolean;
  disabled?: boolean;
  onFileSelect?: (files: ImageDataType[]) => void;
  // ImagePicker 的其他 props
  multiple?: boolean;
  ratio?: number;
  height?: number;
}

export const FormImagePicker = <
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({
  control,
  name,
  label,
  required = false,
  disabled = false,
  onFileSelect,
  multiple,
  ratio,
  height,
}: FormImagePickerProps<TFieldValues, TName>) => {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          {label && <FormLabel required={required}>{label}</FormLabel>}
          <FormControl>
            <ImagePicker
              multiple={multiple}
              ratio={ratio}
              height={height}
              value={field.value ? [field.value] : []}
              onChange={(files) => {
                // 更新表單值為第一個檔案的 URL
                if (files.length > 0) {
                  field.onChange(files[0].url);
                } else {
                  field.onChange('');
                }
                // 通知父元件
                onFileSelect?.(files);
              }}
              disabled={disabled}
            >
              選擇圖片
            </ImagePicker>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

FormImagePicker.displayName = 'FormImagePicker';
