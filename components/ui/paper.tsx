import React from 'react';
import { cn } from '@/utils/cn';

interface PaperProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  as?: React.ElementType;
  variant?: 'default' | 'elevated' | 'outlined';
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

const Paper: React.FC<PaperProps> = ({
  children,
  className = '',
  as: Component = 'div',
  variant = 'default',
  padding = 'lg',
  ...props
}) => {
  const baseStyles = 'bg-white rounded-xl';

  const variantStyles = {
    default: 'shadow-sm border border-basic-200',
    elevated: 'shadow-lg border-0',
    outlined: 'border-2 border-basic-200 shadow-none',
  };

  const paddingStyles = {
    none: '',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
  };

  return (
    <Component
      className={cn(
        baseStyles,
        variantStyles[variant],
        paddingStyles[padding],
        'z-10 relative',
        className
      )}
      {...props}
    >
      {children}
    </Component>
  );
};

export { Paper };
export type { PaperProps };
