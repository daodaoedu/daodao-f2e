import { cn } from '@/utils/cn';

interface SectionHeaderProps {
  title: string;
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
      title: 'text-2xl md:text-3xl',
      subtitle: 'text-base md:text-lg',
      spacing: 'mb-8',
    },
    md: {
      title: 'text-2xl md:text-3xl',
      subtitle: 'text-lg md:text-xl',
      spacing: 'mb-12',
    },
    lg: {
      title: 'text-3xl md:text-4xl',
      subtitle: 'text-lg md:text-xl',
      spacing: 'mb-16',
    },
    xl: {
      title: 'text-4xl md:text-5xl',
      subtitle: 'text-xl md:text-2xl',
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
        'font-bold mb-4',
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
