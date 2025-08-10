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

import { cn } from '@/utils/cn';
import { Label } from '@/components/ui/label';

const Form = FormProvider;

type FormItemContextValue = {
  id: string;
};

const FormItemContext = React.createContext<FormItemContextValue>(
  {} as FormItemContextValue
);

type FormFieldContextValue<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
> = {
  name: TName;
};

const FormFieldContext = React.createContext<FormFieldContextValue>(
  {} as FormFieldContextValue
);

const FormField = <
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
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
>(({
  className, required, children, ...props
}, ref) => {
  const { error, formItemId } = useFormField();

  return (
    <Label
      ref={ref}
      className={cn(
        'block mb-3 body-lg font-bold text-basic-500 whitespace-nowrap',
        error && 'text-destructive',
        className
      )}
      htmlFor={formItemId}
      aria-required={required}
      {...props}
    >
      {children}
      {required && <span className="text-alert ml-1">*</span>}
    </Label>
  );
});
FormLabel.displayName = 'FormLabel';

const FormControl = React.forwardRef<
  React.ComponentRef<typeof Slot>,
  React.ComponentPropsWithoutRef<typeof Slot>
>(({ ...props }, ref) => {
  const {
    error, formItemId, formDescriptionId, formMessageId,
  } = useFormField();

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
      className={cn('block mb-3 body-lg text-basic-500', className)}
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
  S extends ZodSchema
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
  form.setFocus(parsePath(errors[0].path));
  errors.forEach((error) => {
    form.setError(parsePath(error.path), error);
  });
  onError?.(parsed.error);
}

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
};
