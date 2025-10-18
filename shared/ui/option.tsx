import type { Control, ControllerProps, FieldPath, FieldValues } from 'react-hook-form';
import { cn } from '@/shared/lib/cn';
import { FormLabel } from './form';

interface OptionLabelProps {
  isChecked?: boolean;
  isDisabled?: boolean;
  className?: string;
  children: React.ReactNode;
}

export const Option = ({
  children,
  isChecked,
  isDisabled,
  className,
}: OptionLabelProps) => (
  <FormLabel
    className={cn(
      'block m-0 p-2.5 text-center cursor-pointer border border-solid border-basic-200 rounded-lg',
      isChecked && 'bg-primary-lightest border-primary-base',
      isDisabled && 'cursor-not-allowed opacity-50',
      className
    )}
  >
    {children}
  </FormLabel>
);

export interface OptionProps<TValue extends string = string> {
  value: TValue;
  label: string;
  disable?: boolean;
  /** fixed option that can't be removed. */
  fixed?: boolean;
  /** Group the options by providing key. */
  [key: string]: string | boolean | undefined;
}

export type RenderOptionProps<TOption extends OptionProps = OptionProps> = {
  Option: React.ComponentType<OptionLabelProps>;
  isChecked: boolean;
  isDisabled?: boolean;
} & TOption;

export type RenderOptionFn<TOption extends OptionProps = OptionProps> = (
  props: RenderOptionProps<TOption>
) => React.ReactNode;

export interface OptionWithFormProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
  TOption extends OptionProps = OptionProps,
> extends Omit<ControllerProps<TFieldValues, TName>, 'render'> {
  control: Control<TFieldValues, unknown, TFieldValues>;
  options: TOption[];
  label?: string;
  required?: boolean;
  className?: string;
  renderOption?: RenderOptionFn<TOption>;
  maxSelection?: number;
  showCounter?: boolean;
}

export const defaultRenderOption: RenderOptionFn = ({ isChecked, isDisabled, label }) => (
  <Option isChecked={isChecked} isDisabled={isDisabled}>{label}</Option>
);
