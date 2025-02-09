import { forwardRef } from 'react';
import { cn } from '@/utils/cn';

interface RadioProps<T extends string | number> {
  id?: string;
  name: string;
  value: T;
  children: React.ReactNode;
  className?: string;
  isChecked?: boolean;
  isError?: boolean;
  readOnly?: boolean;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

function RadioBox<T extends string | number>(
  {
    id,
    name,
    value,
    isChecked,
    isError,
    children,
    className,
    onChange,
    readOnly,
  }: RadioProps<T>,
  ref: React.Ref<HTMLInputElement>
) {
  return (
    <label
      htmlFor={id}
      className={cn(
        'block p-2 bg-basic-100 rounded cursor-pointer border border-solid border-transparent',
        isChecked && 'bg-primary-lightest',
        isError && 'border-alert',
        className
      )}
    >
      <input
        ref={ref}
        type="radio"
        className="[clip:rect(0,0,0,0)] absolute p-0 border-0 w-0 h-0 overflow-hidden"
        name={name}
        id={id}
        value={value.toString()}
        checked={isChecked}
        onChange={onChange}
        readOnly={readOnly}
      />
      {children}
    </label>
  );
}

export default forwardRef(RadioBox);
