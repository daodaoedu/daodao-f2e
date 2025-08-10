import type { FieldPath, FieldValues } from 'react-hook-form';
import * as React from 'react';
import * as RadioGroupPrimitive from '@radix-ui/react-radio-group';
import { Circle } from 'lucide-react';

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

const RadioGroup = React.forwardRef<
  React.ComponentRef<typeof RadioGroupPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Root>
>(({ className, ...props }, ref) => (
  <RadioGroupPrimitive.Root
    className={cn('grid gap-2', className)}
    {...props}
    ref={ref}
  />
));
RadioGroup.displayName = RadioGroupPrimitive.Root.displayName;

const RadioGroupItem = React.forwardRef<
  React.ComponentRef<typeof RadioGroupPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Item>
>(({ className, ...props }, ref) => (
  <RadioGroupPrimitive.Item
    ref={ref}
    className={cn(
      'aspect-square h-4 w-4 rounded-full border border-primary text-primary shadow focus:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50',
      className
    )}
    {...props}
  >
    <RadioGroupPrimitive.Indicator className="flex items-center justify-center">
      <Circle className="h-3.5 w-3.5 fill-primary" />
    </RadioGroupPrimitive.Indicator>
  </RadioGroupPrimitive.Item>
));
RadioGroupItem.displayName = RadioGroupPrimitive.Item.displayName;

const RadioGroupWithForm = <
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
          <FormControl ref={field.ref}>
            <RadioGroup
              onValueChange={field.onChange}
              value={field.value}
              className={className}
            >
              {Array.isArray(options) &&
                options.map((option) => (
                  <FormItem key={option.value}>
                    <FormControl>
                      <RadioGroupItem
                        className="sr-only"
                        value={option.value}
                      />
                    </FormControl>
                    {renderOption({
                      ...option,
                      Option,
                      isChecked: field.value === option.value,
                    })}
                  </FormItem>
                ))}
            </RadioGroup>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
RadioGroupWithForm.displayName = 'RadioGroupWithForm';

export { RadioGroup, RadioGroupItem, RadioGroupWithForm };
