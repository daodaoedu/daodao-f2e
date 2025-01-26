import { cn } from '@/utils/cn';
import React from 'react';

interface InputFieldProps {
  children: React.ReactNode;
  className?: string;
}

const InputField = ({ children, className }: InputFieldProps) => {
  return (
    <div className={cn("flex flex-col gap-2", className)}>
      {children}
    </div>
  );
};

interface LabelProps {
  htmlFor: string;
  children: string;
  isRequired: boolean;
  className?: string;
}
const Label = ({
  htmlFor,
  isRequired,
  className,
  children
}: LabelProps) => {
  return (
    <label
      htmlFor={htmlFor}
      className={cn(
        "text-base text-basic-500 font-medium font-sans",
        className,
      )}
    >
      {isRequired ? `${children} *` : children}
    </label>
  );
};

interface DescriptionProps {
  children: React.ReactNode;
  className?: string;
}
const Description = ({ children, className }: DescriptionProps) => {
  return (
    <div className={cn(
      "text-sm md:text-base text-basic-300 font-sans",
      className)}
    >
      {children}
    </div>
  );
};

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  id: string;
  name: string;
  className?: string;
}
const Input = ({
  id,
  name,
  className,
  ...props
}: InputProps) => {
  return (
    <input
      id={id}
      name={name}
      {...props}
      className={cn(
        "border border-gray-300 rounded-md px-4 py-3 text-sm",
        "focus:border-primary-base focus:outline-none focus:ring-1 focus:ring-primary-base",
        className
      )}
    />
  );
};

interface TextAreaProps extends React.InputHTMLAttributes<HTMLTextAreaElement> {
  id: string;
  name: string;
  className?: string;
}
const TextArea = ({
  id,
  name,
  className,
  ...props
}: TextAreaProps) => {
  return (
    <textarea
      id={id}
      name={name}
      {...props}
      className={cn(
        "border border-gray-300 rounded-md px-4 py-3 text-sm resize-none",
        "min-h-28",
        "focus:border-primary-base focus:outline-none focus:ring-1 focus:ring-primary-base",
        className
      )}
    />
  );
};

InputField.Label = Label;
InputField.Description = Description;
InputField.Input = Input;
InputField.TextArea = TextArea;

export default InputField;
