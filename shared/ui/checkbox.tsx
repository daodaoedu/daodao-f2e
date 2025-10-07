import type { FieldPath, FieldValues } from 'react-hook-form';
import * as React from 'react';
import * as CheckboxPrimitive from '@radix-ui/react-checkbox';
import { Check } from 'lucide-react';

import { cn } from '@/utils/cn';
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
      'peer h-4 w-4 shrink-0 rounded-sm border border-basic-200 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=checked]:border-primary data-[state=checked]:text-primary-foreground',
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
  TOption extends OptionProps = OptionProps
>({
    options,
    label,
    required,
    className,
    renderOption = defaultRenderOption,
    ...props
  }: OptionWithFormProps<TFieldValues, TName, TOption>) => (
    <FormField
      {...props}
      render={({ field }) => (
        <FormItem className="flex flex-col gap-1">
          {label && <FormLabel required={required}>{label}</FormLabel>}
          <div className={className}>
            {Array.isArray(options) &&
              options.map((option) => (
                <FormItem key={option.value}>
                  <FormControl>
                    <Checkbox
                      className="sr-only"
                      checked={field.value?.includes(option.value)}
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
                    isChecked: field.value?.includes(option.value),
                  })}
                </FormItem>
              ))}
          </div>
          <FormMessage />
        </FormItem>
      )}
    />
  );
CheckboxWithForm.displayName = 'CheckboxWithForm';

export { Checkbox, CheckboxWithForm };
