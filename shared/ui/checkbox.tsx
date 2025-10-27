import type { FieldPath, FieldValues, Control } from 'react-hook-form';
import * as React from 'react';
import * as CheckboxPrimitive from '@radix-ui/react-checkbox';
import { Check } from 'lucide-react';

import { cn } from '@/shared/lib/cn';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from './form';
import {
  defaultRenderOption,
  Option,
  OptionProps,
  OptionWithFormProps,
} from './option';

const Checkbox = React.forwardRef<
  React.ComponentRef<typeof CheckboxPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root>
>(({ className, ...props }, ref) => (
  <CheckboxPrimitive.Root
    ref={ref}
    className={cn(
      'peer h-4 w-4 shrink-0 rounded-sm border border-basic-200 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:border-primary data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground',
      className
    )}
    {...props}
  >
    <CheckboxPrimitive.Indicator
      className={cn('flex items-center justify-center text-current')}
    >
      <Check className="size-4" />
    </CheckboxPrimitive.Indicator>
  </CheckboxPrimitive.Root>
));
Checkbox.displayName = CheckboxPrimitive.Root.displayName;

const CheckboxWithForm = <
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
      <FormItem className="flex flex-col gap-1">
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
                          field.onChange([
                            ...(field?.value ?? []),
                            option.value,
                          ]);
                        } else {
                          field.onChange(
                            field.value?.filter(
                              (v: string) => v !== option.value
                            )
                          );
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
CheckboxWithForm.displayName = 'CheckboxWithForm';

interface CheckboxFieldWithFormProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> {
  control: Control<TFieldValues>;
  name: TName;
  label?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
}

const CheckboxFieldWithForm = <
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({
  control,
  name,
  label,
  required,
  disabled,
  className,
}: CheckboxFieldWithFormProps<TFieldValues, TName>) => (
  <FormField
    control={control}
    name={name}
    render={({ field }) => (
      <FormItem className={cn('flex flex-row items-center', className)}>
        <FormControl>
          <Checkbox
            checked={field.value}
            onCheckedChange={field.onChange}
            disabled={disabled}
          />
        </FormControl>
        {label && (
          <FormLabel required={required} className="mb-0 pl-2 text-base">
            {label}
          </FormLabel>
        )}
        <FormMessage />
      </FormItem>
    )}
  />
);

CheckboxFieldWithForm.displayName = 'CheckboxFieldWithForm';

export { Checkbox, CheckboxWithForm, CheckboxFieldWithForm };
