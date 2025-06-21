import React from 'react';
import {
  Play,
  Pause,
  CheckCircle,
  Archive,
  FileText,
  Clock,
  AlertCircle,
  CheckCheck
} from 'lucide-react';
import { cn } from '@/utils/cn';

export type StatusVariant =
  | 'draft'
  | 'active'
  | 'paused'
  | 'completed'
  | 'archived'
  | 'pending'
  | 'warning'
  | 'success'
  | 'error';

interface StatusBadgeProps {
  status: StatusVariant;
  label?: string;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
  className?: string;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  label,
  size = 'md',
  showIcon = true,
  className = ''
}) => {
  const getStatusConfig = () => {
    const configs = {
      draft: {
        icon: FileText,
        label: '草稿',
        className: 'bg-basic-300/20 text-basic-300 border-basic-300/30'
      },
      active: {
        icon: Play,
        label: '進行中',
        className: 'bg-primary-base/20 text-primary-base border-primary-base/30'
      },
      paused: {
        icon: Pause,
        label: '暫停',
        className: 'bg-tips/20 text-tips border-tips/30'
      },
      completed: {
        icon: CheckCircle,
        label: '已完成',
        className: 'bg-success/20 text-success border-success/30'
      },
      archived: {
        icon: Archive,
        label: '已封存',
        className: 'bg-basic-400/20 text-basic-400 border-basic-400/30'
      },
      pending: {
        icon: Clock,
        label: '待處理',
        className: 'bg-basic-300/20 text-basic-300 border-basic-300/30'
      },
      warning: {
        icon: AlertCircle,
        label: '警告',
        className: 'bg-tips/20 text-tips border-tips/30'
      },
      success: {
        icon: CheckCheck,
        label: '成功',
        className: 'bg-success/20 text-success border-success/30'
      },
      error: {
        icon: AlertCircle,
        label: '錯誤',
        className: 'bg-alert/20 text-alert border-alert/30'
      }
    };
    return configs[status];
  };

  const getIconSizeClass = () => {
    switch (size) {
      case 'sm': return 'h-3 w-3';
      case 'lg': return 'h-5 w-5';
      default: return 'h-4 w-4';
    }
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'sm': return 'text-xs px-2 py-0.5';
      case 'lg': return 'text-base px-3 py-1.5';
      default: return 'text-sm px-2.5 py-1';
    }
  };

  const config = getStatusConfig();
  const IconComponent = config?.icon;
  const iconSizeClass = getIconSizeClass();
  const sizeClasses = getSizeClasses();
  const displayLabel = label || config?.label || '未知';

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 font-medium rounded-full border',
        sizeClasses,
        config?.className,
        className
      )}
    >
      {showIcon && IconComponent && <IconComponent className={iconSizeClass} />}
      <span>{displayLabel}</span>
    </span>
  );
};

export { StatusBadge };
export type { StatusBadgeProps };
