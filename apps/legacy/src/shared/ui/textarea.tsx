import * as React from "react";
import type { FieldPath, FieldValues } from "react-hook-form";

import { cn } from "@/shared/lib/cn";
import { type BaseFormFieldProps, FormFieldWrapper } from "./form";

const Textarea = React.forwardRef<HTMLTextAreaElement, React.ComponentProps<"textarea">>(
  ({ className, ...props }, ref) => (
    <textarea
      className={cn(
        "flex min-h-[60px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-base shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-primary-base disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
        className
      )}
      ref={ref}
      {...props}
    />
  )
);
Textarea.displayName = "Textarea";

interface FormTextareaProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> extends BaseFormFieldProps<TFieldValues, TName> {
  placeholder?: string;
  className?: string;
  rows?: number;
}

const FormTextarea = <
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({
  control,
  name,
  label,
  required,
  disabled,
  placeholder,
  className,
  rows,
}: FormTextareaProps<TFieldValues, TName>) => (
  <FormFieldWrapper control={control} name={name} label={label} required={required}>
    {(field) => (
      <Textarea
        {...field}
        placeholder={placeholder}
        disabled={disabled}
        className={className}
        rows={rows}
      />
    )}
  </FormFieldWrapper>
);

FormTextarea.displayName = "FormTextarea";

export { Textarea, FormTextarea };
