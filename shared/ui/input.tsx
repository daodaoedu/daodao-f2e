import * as React from 'react';

import { Button } from '@/shared/ui/button';
import useControlledState from '@/hooks/useControlledState';
import { cn } from '@/utils/cn';

type IconComponent = React.ReactNode | ((value: string) => React.ReactNode);

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  value?: string | number;
  defaultValue?: string;
  placeholder?: string;
  prefixIcon?: IconComponent;
  suffixIcon?: IconComponent;
  className?: string;
  inputClassName?: string;
  onValueChange?: (value: string) => void;
  onPrefixIconClick?: (value: string) => void;
  onSuffixIconClick?: (value: string) => void;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      inputClassName,
      value,
      defaultValue,
      onChange,
      onValueChange,
      prefixIcon,
      suffixIcon,
      onPrefixIconClick,
      onSuffixIconClick,
      ...props
    },
    ref
  ) => {
    const [internalValue, setInternalValue] = useControlledState(
      defaultValue ?? '',
      value == null ? value : value.toString(),
      onValueChange
    );

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setInternalValue(e.target.value);
      onChange?.(e);
    };

    const renderIcon = (icon: IconComponent) => {
      if (typeof icon === 'function') {
        return icon(internalValue);
      }
      return icon;
    };

    const iconClassName = 'absolute top-1/2 -translate-y-1/2 text-basic-300 [&>svg]:size-5';

    return (
      <div className={cn('relative w-full', className)}>
        {prefixIcon &&
          (onPrefixIconClick ? (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className={cn(iconClassName, 'left-1')}
              onClick={() => onPrefixIconClick(internalValue)}
            >
              {renderIcon(prefixIcon)}
            </Button>
          ) : (
            <span className={cn(iconClassName, 'left-4 pointer-events-none')}>
              {renderIcon(prefixIcon)}
            </span>
          ))}
        <input
          ref={ref}
          className={cn(
            'h-10 w-full rounded-lg border border-basic-200 bg-transparent',
            'flex items-center justify-center px-3 py-1 body-md transition-colors',
            'placeholder:text-muted-foreground [&::-webkit-search-cancel-button]:hidden',
            'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-primary-base',
            'disabled:cursor-not-allowed disabled:opacity-50',
            prefixIcon && 'pl-11',
            suffixIcon && 'pr-11',
            inputClassName
          )}
          value={internalValue}
          onChange={handleChange}
          {...props}
        />
        {suffixIcon &&
          (onSuffixIconClick ? (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className={cn(iconClassName, 'right-1')}
              onClick={() => onSuffixIconClick(internalValue)}
            >
              {renderIcon(suffixIcon)}
            </Button>
          ) : (
            <span className={cn(iconClassName, 'right-4 pointer-events-none')}>
              {renderIcon(suffixIcon)}
            </span>
          ))}
      </div>
    );
  }
);
Input.displayName = 'Input';

export { Input };
