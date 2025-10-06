import { cn } from '@/utils/cn';
import { ReactNode } from 'react';

interface SectionHeaderProps {
  title: string | ReactNode;
  subtitle?: string;
  variant?: 'dark' | 'light';
  size?: 'md' | 'lg';
  alignment?: 'left' | 'center' | 'right';
  className?: string;
  titleClassName?: string;
  subtitleClassName?: string;
  showSubtitle?: boolean;
}

export function SectionHeader({
  title,
  subtitle,
  variant = 'dark',
  size = 'lg',
  alignment = 'center',
  className,
  titleClassName,
  subtitleClassName,
  showSubtitle = true,
}: SectionHeaderProps) {
  const variantStyles = {
    dark: 'text-primary-darker',
    light: 'text-white',
  };

  const sizeStyles = {
    md: {
      spacing: 'mb-12',
    },
    lg: {
      spacing: 'mb-16',
    },
  };

  const alignmentStyles = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right',
  };

  const currentVariant = variantStyles[variant];
  const currentSize = sizeStyles[size];
  const currentAlignment = alignmentStyles[alignment];

  return (
    <div
      className={cn(
        'section-header',
        currentAlignment,
        currentSize.spacing,
        className
      )}
    >
      <h2
        className={cn(
          'mb-2 text-[1.75rem] font-bold',
          currentVariant,
          titleClassName
        )}
      >
        {title}
      </h2>

      {showSubtitle && subtitle && (
        <h3
          className={cn(
            'mx-auto max-w-2xl text-sm',
            currentVariant,
            subtitleClassName,
            alignment === 'left' && 'mx-0',
            alignment === 'right' && 'mx-0 ml-auto'
          )}
        >
          {subtitle}
        </h3>
      )}
    </div>
  );
}
