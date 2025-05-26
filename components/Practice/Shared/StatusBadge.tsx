// 狀態標籤組件
import React from 'react';
import { IoPlayOutline as Play, IoPauseOutline as Pause, IoCheckmarkCircleOutline as CheckCircle, IoArchiveOutline as Archive, IoDocumentTextOutline as FileText } from 'react-icons/io5';
import { PracticeStatus } from '../../../services/practice/types';
import { getStatusLabel, getStatusColor } from '../../../services/practice/utils';

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

  const getIcon = () => {
    const iconProps = {
      className: size === 'sm' ? 'h-3 w-3' : size === 'lg' ? 'h-5 w-5' : 'h-4 w-4'
    };

    switch (status) {
      case 'active': return <Play {...iconProps} />;
      case 'paused': return <Pause {...iconProps} />;
      case 'completed': return <CheckCircle {...iconProps} />;
      case 'archived': return <Archive {...iconProps} />;
      case 'draft': return <FileText {...iconProps} />;
      default: return null;
    }
  };

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-2.5 py-1',
    lg: 'text-base px-3 py-1.5'
  };

  return (
    <span
      className={`inline-flex items-center space-x-1 font-medium rounded-full ${sizeClasses[size]} ${className}`}
      style={{
        backgroundColor: `${color}20`,
        color
      }}
    >
      {showIcon && getIcon()}
      <span>{label}</span>
    </span>
  );
};

export default StatusBadge;
