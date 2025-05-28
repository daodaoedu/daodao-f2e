import React from 'react';
import {
  Play,
  Pause,
  CheckCircle,
  Archive,
  FileText
} from 'lucide-react';
import { cn } from '@/utils/cn';
import { PracticeStatus } from '@/services/modules/practice/schema';
import { getStatusLabel, getStatusColor } from '@/services/modules/practice/utils';

interface StatusBadgeProps {
  status: PracticeStatus;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
  className?: string;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  size = 'md',
  showIcon = true,
  className = ''
}) => {
  const color = getStatusColor(status);
  const label = getStatusLabel(status);

  const getStatusConfig = () => {
    const configs = {
      active: { icon: Play },
      paused: { icon: Pause },
      completed: { icon: CheckCircle },
      archived: { icon: Archive },
      draft: { icon: FileText }
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

  return (
    <span
      className={cn(
        'inline-flex items-center space-x-1 font-medium rounded-full',
        sizeClasses,
        className
      )}
      style={{
        backgroundColor: `${color}20`,
        color
      }}
    >
      {showIcon && IconComponent && <IconComponent className={iconSizeClass} />}
      <span>{label}</span>
    </span>
  );
};

export default StatusBadge;
