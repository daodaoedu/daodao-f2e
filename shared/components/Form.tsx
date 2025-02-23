import {
  FormProvider,
  FieldValues,
  UseFormReturn,
  SubmitHandler,
  SubmitErrorHandler,
} from 'react-hook-form';

interface FormProps<T extends FieldValues> {
  methods: UseFormReturn<T>;
  onSubmit: SubmitHandler<T>;
  onError?: SubmitErrorHandler<T>;
  children: React.ReactNode;
}

function Form<TFieldValues extends FieldValues = FieldValues>({
  methods,
  onSubmit,
  onError,
  children,
}: FormProps<TFieldValues>) {
  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit(onSubmit, onError)}>{children}</form>
    </FormProvider>
  );
}

export default Form;
