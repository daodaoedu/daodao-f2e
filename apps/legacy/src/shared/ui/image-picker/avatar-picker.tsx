"use client";

import { CloudUpload, X } from "lucide-react";
import { forwardRef } from "react";
import type { Control, FieldPath, FieldValues } from "react-hook-form";
import { cn } from "@/shared/lib/cn";
import { Button, type ButtonProps } from "@/shared/ui/button";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/shared/ui/form";
import { useAvatarPicker } from "./use-image-picker";

// AvatarPicker 元件 - 專門用於頭像選擇
interface AvatarPickerProps extends Omit<ButtonProps, "onChange" | "size"> {
  value?: string;
  size?: number;
  disabled?: boolean;
  onChange?: (url: string) => void;
  onFileSelect?: (file: File) => void;
}

export const AvatarPicker = forwardRef<HTMLButtonElement, AvatarPickerProps>(
  ({ value, size = 128, disabled = false, onChange, onFileSelect, className, ...props }, ref) => {
    const {
      previewUrl,
      hasPreview,
      inputRef,
      handleInputChange,
      triggerFileSelect,
      clearSelection,
      setUrl,
    } = useAvatarPicker({
      initialUrl: value,
      onFileSelect,
      onUrlChange: onChange,
    });

    const handleRemove = (e: React.MouseEvent) => {
      e.stopPropagation();
      clearSelection();
    };

    return (
      <div className="relative inline-block">
        <input
          ref={inputRef}
          type="file"
          accept=".jpeg,.jpg,.png,.webp"
          className="hidden"
          onChange={handleInputChange}
          disabled={disabled}
        />

        <Button
          ref={ref}
          type="button"
          variant="ghost"
          className={cn(
            "relative overflow-hidden rounded-full border-2 border-dashed border-basic-300 p-0",
            "transition-colors hover:border-primary-base hover:bg-primary-lightest",
            disabled && "cursor-not-allowed opacity-50",
            className
          )}
          style={{ width: size, height: size }}
          onClick={triggerFileSelect}
          disabled={disabled}
          {...props}
        >
          {hasPreview ? (
            <>
              <img
                src={previewUrl}
                alt="頭像預覽"
                className="size-full object-cover"
                onError={() => setUrl("")}
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

        {hasPreview && !disabled && (
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

AvatarPicker.displayName = "AvatarPicker";

// FormAvatarPicker 元件 - 整合 React Hook Form 的頭像選擇
interface FormAvatarPickerProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> extends Omit<AvatarPickerProps, "onChange" | "value"> {
  control: Control<TFieldValues>;
  name: TName;
  label?: string;
  required?: boolean;
  onFileSelect?: (file: File) => void;
}

export const FormAvatarPicker = <
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({
  control,
  name,
  label,
  required = false,
  onFileSelect,
  ...avatarProps
}: FormAvatarPickerProps<TFieldValues, TName>) => (
  <FormField
    control={control}
    name={name}
    render={({ field }) => (
      <FormItem>
        {label && <FormLabel required={required}>{label}</FormLabel>}
        <FormControl>
          <AvatarPicker
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

FormAvatarPicker.displayName = "FormAvatarPicker";
