import * as CheckboxPrimitive from "@radix-ui/react-checkbox";
import { Check } from "lucide-react";
import * as React from "react";
import type { FieldPath, FieldValues } from "react-hook-form";

import { cn } from "@/shared/lib/cn";
import {
  type BaseFormFieldProps,
  FormControl,
  FormField,
  FormFieldWrapperFlex,
  FormItem,
  FormLabel,
  FormMessage,
} from "./form";
import { defaultRenderOption, Option, type OptionProps, type OptionWithFormProps } from "./option";

const Checkbox = React.forwardRef<
  React.ComponentRef<typeof CheckboxPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root>
>(({ className, ...props }, ref) => (
  <CheckboxPrimitive.Root
    ref={ref}
    className={cn(
      "peer h-4 w-4 shrink-0 rounded-sm border border-basic-200 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:border-primary data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground",
      className
    )}
    {...props}
  >
    <CheckboxPrimitive.Indicator className={cn("flex items-center justify-center text-current")}>
      <Check className="size-4" />
    </CheckboxPrimitive.Indicator>
  </CheckboxPrimitive.Root>
));
Checkbox.displayName = CheckboxPrimitive.Root.displayName;

const FormCheckboxGroup = <
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
  TOption extends OptionProps = OptionProps,
>({
  options,
  label,
  required,
  className,
  renderOption = defaultRenderOption,
  maxSelection,
  showCounter = false,
  ...props
}: OptionWithFormProps<TFieldValues, TName, TOption>) => (
  <FormField
    {...props}
    render={({ field }) => (
      <FormItem className="flex flex-col">
        <div className="flex items-center justify-between">
          {label && <FormLabel required={required}>{label}</FormLabel>}
          {showCounter && maxSelection && (
            <span className="text-sm text-gray-500">
              ({field.value?.length || 0}/{maxSelection})
            </span>
          )}
        </div>
        <div className={className}>
          {Array.isArray(options) &&
            options.map((option) => {
              const isSelected = field.value?.includes(option.value);
              const isDisabled = maxSelection
                ? !isSelected && (field.value?.length || 0) >= maxSelection
                : false;

              return (
                <FormItem key={option.value}>
                  <FormControl>
                    <Checkbox
                      className="sr-only"
                      checked={isSelected}
                      disabled={isDisabled}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          field.onChange([...(field?.value ?? []), option.value]);
                        } else {
                          field.onChange(field.value?.filter((v: string) => v !== option.value));
                        }
                      }}
                    />
                  </FormControl>
                  {renderOption({
                    ...option,
                    Option,
                    isChecked: isSelected,
                    isDisabled,
                  })}
                </FormItem>
              );
            })}
        </div>
        <FormMessage />
      </FormItem>
    )}
  />
);
FormCheckboxGroup.displayName = "FormCheckboxGroup";

interface FormCheckboxProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> extends BaseFormFieldProps<TFieldValues, TName> {
  className?: string;
}

const FormCheckbox = <
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({
  control,
  name,
  label,
  required,
  disabled,
  className,
}: FormCheckboxProps<TFieldValues, TName>) => (
  <FormFieldWrapperFlex
    control={control}
    name={name}
    label={label}
    required={required}
    direction="row"
    labelPosition="after"
    className={className}
  >
    {(field) => (
      <Checkbox checked={field.value} onCheckedChange={field.onChange} disabled={disabled} />
    )}
  </FormFieldWrapperFlex>
);

FormCheckbox.displayName = "FormCheckbox";

export { Checkbox, FormCheckboxGroup, FormCheckbox };
