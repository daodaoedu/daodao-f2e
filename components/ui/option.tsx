import type { ControllerProps, FieldPath, FieldValues } from "react-hook-form";
import { cn } from "@/utils/cn";
import { FormLabel } from "./form";

interface OptionLabelProps {
  isChecked?: boolean;
  className?: string;
  children: React.ReactNode;
}

export const Option = ({
  children,
  isChecked,
  className,
}: OptionLabelProps) => (
  <FormLabel
    className={cn(
      "block m-0 p-2.5 text-center cursor-pointer border border-solid border-basic-200 rounded-lg",
      isChecked && "bg-primary-lightest border-primary-base",
      className
    )}
  >
    {children}
  </FormLabel>
);

export interface OptionProps {
  label: string;
  value: string;
}

export type RenderOptionProps<TOption extends OptionProps = OptionProps> = {
  Option: React.ComponentType<OptionLabelProps>;
  isChecked: boolean;
} & TOption;

export type RenderOptionFn<TOption extends OptionProps = OptionProps> = (
  props: RenderOptionProps<TOption>
) => React.ReactNode;

export interface OptionWithFormProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
  TOption extends OptionProps = OptionProps
> extends Omit<ControllerProps<TFieldValues, TName>, "render"> {
  options: TOption[];
  label?: string;
  required?: boolean;
  className?: string;
  renderOption?: RenderOptionFn<TOption>;
}

export const defaultRenderOption: RenderOptionFn = ({ isChecked, label }) => (
  <Option isChecked={isChecked}>{label}</Option>
);
