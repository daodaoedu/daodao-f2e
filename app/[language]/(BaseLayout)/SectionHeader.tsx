import { cn } from '@/utils/cn';
import { ReactNode } from 'react';

interface SectionHeaderProps {
  title: string | ReactNode;
  subtitle?: string;
  variant?: 'default' | 'light' | 'dark' | 'primary';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  alignment?: 'left' | 'center' | 'right';
  className?: string;
  titleClassName?: string;
  subtitleClassName?: string;
  showSubtitle?: boolean;
}

export function SectionHeader({
  title,
  subtitle,
  variant = 'default',
  size = 'lg',
  alignment = 'center',
  className,
  titleClassName,
  subtitleClassName,
  showSubtitle = true,
}: SectionHeaderProps) {
  const variantStyles = {
    default: {
      title: 'text-primary-darker',
      subtitle: 'text-primary-darker',
    },
    light: {
      title: 'text-white',
      subtitle: 'text-white',
    },
    dark: {
      title: 'text-primary-darker',
      subtitle: 'text-primary-darker',
    },
    primary: {
      title: 'text-primary-darker',
      subtitle: 'text-primary-darker',
    },
  };

  const sizeStyles = {
    sm: {
      title: 'text-[28px]',
      subtitle: 'text-sm',
      spacing: 'mb-8',
    },
    md: {
      title: 'text-[28px]',
      subtitle: 'text-sm',
      spacing: 'mb-12',
    },
    lg: {
      title: 'text-[28px]',
      subtitle: 'text-sm',
      spacing: 'mb-16',
    },
    xl: {
      title: 'text-[28px]',
      subtitle: 'text-sm',
      spacing: 'mb-20',
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
    <div className={cn(
      'section-header',
      currentAlignment,
      currentSize.spacing,
      className
    )}>
      <h2 className={cn(
        'font-bold mb-2',
        currentSize.title,
        currentVariant.title,
        titleClassName
      )}>
        {title}
      </h2>
      
      {showSubtitle && subtitle && (
        <h3 className={cn(
          'max-w-2xl mx-auto',
          currentSize.subtitle,
          currentVariant.subtitle,
          subtitleClassName,
          alignment === 'left' && 'mx-0',
          alignment === 'right' && 'mx-0 ml-auto'
        )}>
          {subtitle}
        </h3>
      )}
    </div>
  );
}
