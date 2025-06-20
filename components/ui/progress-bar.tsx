import React from 'react';
import { cn } from '@/utils/cn';

interface ProgressBarProps {
  current: number;
  total: number;
  unit?: string;
  className?: string;
  variant?: 'default' | 'success' | 'warning' | 'danger';
  showPercentage?: boolean;
  showNumbers?: boolean;
  size?: 'sm' | 'md' | 'lg';
  animated?: boolean;
}

const ProgressBar: React.FC<ProgressBarProps> = ({
  current,
  total,
  unit = '',
  className = '',
  variant = 'default',
  showPercentage = true,
  showNumbers = true,
  size = 'md',
  animated = false
}) => {
  const percentage = total > 0 ? Math.min(Math.round((current / total) * 100), 100) : 0;

  const getSizeClasses = () => {
    switch (size) {
      case 'sm': return 'h-1';
      case 'lg': return 'h-3';
      default: return 'h-2';
    }
  };

  const getTextSizeClasses = () => {
    switch (size) {
      case 'sm': return 'text-xs';
      case 'lg': return 'text-base';
      default: return 'text-sm';
    }
  };

  const getVariantClasses = () => {
    switch (variant) {
      case 'success': return 'bg-success';
      case 'warning': return 'bg-tips';
      case 'danger': return 'bg-alert';
      default: return 'bg-primary-base';
    }
  };

  const sizeClasses = getSizeClasses();
  const textSizeClasses = getTextSizeClasses();
  const variantClasses = getVariantClasses();

  return (
    <div className={className}>
      {(showNumbers || showPercentage) && (
        <div className={cn(
          'flex items-center justify-between mb-2 text-basic-400',
          textSizeClasses
        )}
        >
          {showNumbers && (
            <span>
              {current} / {total} {unit}
            </span>
          )}
          {showPercentage && (
            <span className="font-medium">
              {percentage}%
            </span>
          )}
        </div>
      )}

      <div className={cn(
        'w-full bg-basic-200 rounded-full overflow-hidden',
        sizeClasses
      )}
      >
        <div
          className={cn(
            'rounded-full transition-all duration-500 ease-out',
            sizeClasses,
            variantClasses,
            animated && 'animate-pulse',
            percentage >= 100 ? 'w-full' :
            percentage >= 95 ? 'w-[95%]' :
            percentage >= 90 ? 'w-[90%]' :
            percentage >= 85 ? 'w-[85%]' :
            percentage >= 80 ? 'w-[80%]' :
            percentage >= 75 ? 'w-[75%]' :
            percentage >= 70 ? 'w-[70%]' :
            percentage >= 65 ? 'w-[65%]' :
            percentage >= 60 ? 'w-[60%]' :
            percentage >= 55 ? 'w-[55%]' :
            percentage >= 50 ? 'w-1/2' :
            percentage >= 45 ? 'w-[45%]' :
            percentage >= 40 ? 'w-[40%]' :
            percentage >= 35 ? 'w-[35%]' :
            percentage >= 30 ? 'w-[30%]' :
            percentage >= 25 ? 'w-1/4' :
            percentage >= 20 ? 'w-1/5' :
            percentage >= 15 ? 'w-[15%]' :
            percentage >= 10 ? 'w-[10%]' :
            percentage >= 5 ? 'w-[5%]' : 'w-0'
          )}
        />
      </div>

      {percentage === 100 && (
        <div className="mt-1 text-xs text-success font-medium">
          已完成！
        </div>
      )}
    </div>
  );
};

export { ProgressBar };
export type { ProgressBarProps };
