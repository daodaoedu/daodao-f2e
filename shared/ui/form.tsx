'use client';

import * as React from 'react';
import * as LabelPrimitive from '@radix-ui/react-label';
import { ZodError, ZodSchema } from 'zod';
import { Slot } from '@radix-ui/react-slot';
import {
  Controller,
  FormProvider,
  Path,
  useFormContext,
  UseFormReturn,
  type ControllerProps,
  type FieldPath,
  type FieldValues,
} from 'react-hook-form';

import { cn } from '@/shared/lib/cn';
import { Label } from '@/shared/ui/label';

const Form = FormProvider;

type FormItemContextValue = {
  id: string;
};

const FormItemContext = React.createContext<FormItemContextValue>(
  {} as FormItemContextValue
);

type FormFieldContextValue<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> = {
  name: TName;
};

const FormFieldContext = React.createContext<FormFieldContextValue>(
  {} as FormFieldContextValue
);

const FormField = <
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({
  ...props
}: ControllerProps<TFieldValues, TName>) => (
  <FormFieldContext.Provider value={{ name: props.name }}>
    <Controller {...props} />
  </FormFieldContext.Provider>
);

const useFormField = () => {
  const fieldContext = React.useContext(FormFieldContext);
  const itemContext = React.useContext(FormItemContext);
  const { getFieldState, formState } = useFormContext();

  const fieldState = getFieldState(fieldContext.name, formState);

  if (!fieldContext) {
    throw new Error('useFormField should be used within <FormField>');
  }

  const { id } = itemContext;

  return {
    id,
    name: fieldContext.name,
    formItemId: `${id}-form-item`,
    formDescriptionId: `${id}-form-item-description`,
    formMessageId: `${id}-form-item-message`,
    ...fieldState,
  };
};

const FormItem = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  const id = React.useId();

  return (
    <FormItemContext.Provider value={{ id }}>
      <div ref={ref} className={className} {...props} />
    </FormItemContext.Provider>
  );
});
FormItem.displayName = 'FormItem';

interface FormLabelProps
  extends React.ComponentPropsWithoutRef<typeof LabelPrimitive.Root> {
  required?: boolean;
}

const FormLabel = React.forwardRef<
  React.ComponentRef<typeof LabelPrimitive.Root>,
  FormLabelProps
>(({ className, required, children, ...props }, ref) => {
  const { error, formItemId } = useFormField();

  return (
    <Label
      ref={ref}
      className={cn(
        'body-lg mb-2 block whitespace-nowrap font-bold text-basic-400',
        error && 'text-destructive',
        className
      )}
      htmlFor={formItemId}
      aria-required={required}
      {...props}
    >
      {children}
      {required && <span className="ml-1 text-alert">*</span>}
    </Label>
  );
});
FormLabel.displayName = 'FormLabel';

const FormControl = React.forwardRef<
  React.ComponentRef<typeof Slot>,
  React.ComponentPropsWithoutRef<typeof Slot>
>(({ ...props }, ref) => {
  const { error, formItemId, formDescriptionId, formMessageId } =
    useFormField();

  return (
    <Slot
      ref={ref}
      id={formItemId}
      aria-describedby={
        !error
          ? `${formDescriptionId}`
          : `${formDescriptionId} ${formMessageId}`
      }
      aria-invalid={!!error}
      {...props}
    />
  );
});
FormControl.displayName = 'FormControl';

const FormDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => {
  const { formDescriptionId } = useFormField();

  return (
    <p
      ref={ref}
      id={formDescriptionId}
      className={cn('text-[0.8rem] mb-3 block text-basic-300', className)}
      {...props}
    />
  );
});
FormDescription.displayName = 'FormDescription';

const FormMessage = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, children, ...props }, ref) => {
  const { error, formMessageId } = useFormField();
  const body = error ? String(error?.message ?? '') : children;

  if (!body) {
    return null;
  }

  return (
    <p
      ref={ref}
      id={formMessageId}
      className={cn('text-[0.8rem] font-medium text-destructive', className)}
      {...props}
    >
      {body}
    </p>
  );
});
FormMessage.displayName = 'FormMessage';

interface ParseSchemaAutoFocusProps<
  T extends FieldValues,
  S extends ZodSchema,
> {
  form: UseFormReturn<T>;
  schema: S;
  onSuccess?: () => void;
  onError?: (errors: ZodError) => void;
}

function parseSchemaAutoFocus<T extends FieldValues, S extends ZodSchema>({
  form,
  schema,
  onSuccess,
  onError,
}: ParseSchemaAutoFocusProps<T, S>) {
  const parsed = schema.safeParse(form.getValues());
  if (parsed.success) {
    onSuccess?.();
    return;
  }
  const { errors } = parsed.error;

  const parsePath = (path: (string | number)[]) => path.join('.') as Path<T>;

  form.clearErrors();
  if (errors[0]?.path) {
    form.setFocus(parsePath(errors[0].path));
  }
  errors.forEach((error) => {
    form.setError(parsePath(error.path), error);
  });
  onError?.(parsed.error);
}

// 基礎 Form 元件 props 類型
interface BaseFormFieldProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
> {
  control: ControllerProps<TFieldValues, TName>['control'];
  name: TName;
  label?: string;
  required?: boolean;
  // eslint-disable-next-line react/no-unused-prop-types
  disabled?: boolean;
}

// Form 元件 wrapper props
interface FormFieldWrapperProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
> extends BaseFormFieldProps<TFieldValues, TName> {
  className?: string;
  labelClassName?: string;
  children: (field: Parameters<ControllerProps<TFieldValues, TName>['render']>[0]['field']) => React.ReactNode;
}

// 通用的 FormFieldWrapper 元件
const FormFieldWrapper = <
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
>({
  control,
  name,
  label,
  required,
  className,
  labelClassName,
  children,
}: FormFieldWrapperProps<TFieldValues, TName>) => (
  <FormField
    control={control}
    name={name}
    render={({ field }) => (
      <FormItem className={className}>
        {label && <FormLabel required={required} className={labelClassName}>{label}</FormLabel>}
        <FormControl>
          {children(field)}
        </FormControl>
        <FormMessage />
      </FormItem>
    )}
  />
);

// 特殊佈局的 FormFieldWrapper (如 checkbox 需要 label 在右邊)
interface FormFieldWrapperFlexProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
> extends BaseFormFieldProps<TFieldValues, TName> {
  className?: string;
  labelClassName?: string;
  direction?: 'row' | 'column';
  labelPosition?: 'before' | 'after';
  children: (field: Parameters<ControllerProps<TFieldValues, TName>['render']>[0]['field']) => React.ReactNode;
}

const FormFieldWrapperFlex = <
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
>({
  control,
  name,
  label,
  required,
  className,
  labelClassName,
  direction = 'column',
  labelPosition = 'before',
  children,
}: FormFieldWrapperFlexProps<TFieldValues, TName>) => (
  <FormField
    control={control}
    name={name}
    render={({ field }) => (
      <FormItem className={cn(
        direction === 'row' ? 'flex flex-row items-center' : 'flex flex-col',
        className
      )}>
        {labelPosition === 'before' && label && (
          <FormLabel required={required} className={labelClassName}>
            {label}
          </FormLabel>
        )}
        <FormControl>
          {children(field)}
        </FormControl>
        {labelPosition === 'after' && label && (
          <FormLabel required={required} className={cn('mb-0 pl-2 text-base', labelClassName)}>
            {label}
          </FormLabel>
        )}
        <FormMessage />
      </FormItem>
    )}
  />
);

export {
  useFormField,
  Form,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
  FormField,
  parseSchemaAutoFocus,
  FormFieldWrapper,
  FormFieldWrapperFlex,
  type BaseFormFieldProps,
  type FormFieldWrapperProps,
  type FormFieldWrapperFlexProps,
};
