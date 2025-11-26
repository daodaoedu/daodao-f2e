import React from 'react';
import { cn } from '@/shared/lib/cn';

interface ContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  centerContent?: boolean;
}

const Container: React.FC<ContainerProps> = ({
  children,
  className = '',
  size = 'lg',
  centerContent = true,
  ...props
}) => {
  const baseStyles = 'relative';

  const responsiveStyles = {
    lg: `
      w-full max-w-6xl
      lg:max-w-[924px]
      md:max-w-[768px]
      sm:max-w-full sm:px-4
    `,
    md: 'w-full max-w-4xl md:max-w-[768px] sm:max-w-full sm:px-4',
    sm: 'w-full max-w-2xl sm:max-w-full sm:px-4',
    xl: 'w-full max-w-7xl sm:px-4',
    full: 'w-full sm:px-4',
  };

  return (
    <div
      className={cn(
        baseStyles,
        centerContent && 'mx-auto',
        responsiveStyles[size],
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

export { Container };
export type { ContainerProps };
