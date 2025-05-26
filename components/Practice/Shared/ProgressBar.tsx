// 進度條組件
import React from 'react';

interface ProgressBarProps {
  current: number;
  total: number;
  unit?: string;
  className?: string;
  color?: string;
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
  color = '#16b9b3',
  showPercentage = true,
  showNumbers = true,
  size = 'md',
  animated = false
}) => {
  const percentage = total > 0 ? Math.min(Math.round((current / total) * 100), 100) : 0;

  const sizeClasses = {
    sm: 'h-1',
    md: 'h-2',
    lg: 'h-3'
  };

  const textSizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base'
  };

  return (
    <div className={className}>
      {/* 標題和數字 */}
      {(showNumbers || showPercentage) && (
        <div className={`flex items-center justify-between mb-2 ${textSizeClasses[size]} text-gray-600`}>
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

      {/* 進度條 */}
      <div className={`w-full bg-gray-200 rounded-full ${sizeClasses[size]} overflow-hidden`}>
        <div
          className={`${sizeClasses[size]} rounded-full transition-all duration-500 ease-out ${
            animated ? 'animate-pulse' : ''
          }`}
          style={{
            width: `${percentage}%`,
            backgroundColor: color
          }}
        />
      </div>

      {/* 完成狀態提示 */}
      {percentage === 100 && (
        <div className="mt-1 text-xs text-green-600 font-medium">
          🎉 已完成！
        </div>
      )}
    </div>
  );
};

export default ProgressBar;
