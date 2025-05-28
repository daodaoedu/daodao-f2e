import React from 'react';
import {
  Book,
  Video,
  FileText,
  Headphones,
  GraduationCap,
  Settings,
  Calendar,
  Flame,
  Play,
  Pause,
  CheckCircle,
  Archive,
  Edit3,
  Trash2,
  MoreVertical
} from 'lucide-react';
import { Practice, ContentType, PracticeStatus } from '@/services/modules/practice/schema';
import {
  calculateProgress,
  getContentTypeLabel,
  getStatusLabel,
  getStatusColor,
  formatDate,
  canCheckIn
} from '@/services/modules/practice/utils';

interface PracticeCardProps {
  practice: Practice;
  onEdit?: (practice: Practice) => void;
  onDelete?: (practice: Practice) => void;
  onCheckIn?: (practice: Practice) => void;
  onView?: (practice: Practice) => void;
  showActions?: boolean;
}

const PracticeCard: React.FC<PracticeCardProps> = ({
  practice,
  onEdit,
  onDelete,
  onCheckIn,
  onView,
  showActions = true
}) => {
  const [showMenu, setShowMenu] = React.useState(false);
  const menuRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getContentIcon = (contentType: ContentType) => {
    const iconProps = { className: "h-5 w-5" };

    switch (contentType) {
      case 'book': return <Book {...iconProps} />;
      case 'video': return <Video {...iconProps} />;
      case 'articles': return <FileText {...iconProps} />;
      case 'podcast': return <Headphones {...iconProps} />;
      case 'course': return <GraduationCap {...iconProps} />;
      default: return <Settings {...iconProps} />;
    }
  };

  const getStatusIcon = (status: PracticeStatus) => {
    const iconProps = { className: "h-4 w-4" };

    switch (status) {
      case 'active': return <Play {...iconProps} />;
      case 'paused': return <Pause {...iconProps} />;
      case 'completed': return <CheckCircle {...iconProps} />;
      case 'archived': return <Archive {...iconProps} />;
      default: return null;
    }
  };

  const progressPercentage = calculateProgress(practice.currentProgress, practice.totalAmount);
  const statusColor = getStatusColor(practice.status);
  const canDoCheckIn = canCheckIn(practice);

  const handleCardClick = () => {
    if (onView) {
      onView(practice);
    }
  };

  const handleActionClick = (e: React.MouseEvent, action: () => void) => {
    e.stopPropagation();
    action();
    setShowMenu(false);
  };

  return (
    <div
      className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200 cursor-pointer"
      onClick={handleCardClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleCardClick();
        }
      }}
    >
      <div className="p-4 pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3 flex-1">
            <div
              className="p-2 rounded-lg"
              style={{ backgroundColor: `${statusColor}20`, color: statusColor }}
            >
              {getContentIcon(practice.contentType)}
            </div>

            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-semibold text-gray-900 truncate">
                {practice.title}
              </h3>
              <p className="text-sm text-gray-500">
                {getContentTypeLabel(practice.contentType)}
              </p>
            </div>
          </div>

          {showActions && (
            <div className="relative" ref={menuRef}>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowMenu(!showMenu);
                }}
                className="p-1 rounded-md hover:bg-gray-100 transition-colors"
              >
                <MoreVertical className="h-4 w-4 text-gray-400" />
              </button>

              {showMenu && (
                <div className="absolute right-0 top-8 w-48 bg-white rounded-md shadow-lg border border-gray-200 py-1 z-10">
                  {canDoCheckIn && onCheckIn && (
                    <button
                      type="button"
                      onClick={(e) => handleActionClick(e, () => onCheckIn(practice))}
                      className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-2"
                    >
                      <CheckCircle className="h-4 w-4" />
                      <span>打卡</span>
                    </button>
                  )}

                  {onEdit && (
                    <button
                      type="button"
                      onClick={(e) => handleActionClick(e, () => onEdit(practice))}
                      className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-2"
                    >
                      <Edit3 className="h-4 w-4" />
                      <span>編輯</span>
                    </button>
                  )}

                  {onDelete && (
                    <button
                      type="button"
                      onClick={(e) => handleActionClick(e, () => onDelete(practice))}
                      className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center space-x-2"
                    >
                      <Trash2 className="h-4 w-4" />
                      <span>刪除</span>
                    </button>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {practice.description && (
          <p className="mt-2 text-sm text-gray-600 line-clamp-2">
            {practice.description}
          </p>
        )}
      </div>

      <div className="px-4 pb-3">
        <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
          <span>進度</span>
          <span>{practice.currentProgress} / {practice.totalAmount} {practice.unit}</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="h-2 rounded-full transition-all duration-300"
            style={{
              width: `${progressPercentage}%`,
              backgroundColor: statusColor
            }}
          />
        </div>
        <div className="mt-1 text-xs text-gray-500 text-right">
          {progressPercentage}% 完成
        </div>
      </div>

      <div className="px-4 py-3 bg-gray-50 rounded-b-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div style={{ color: statusColor }}>
              {getStatusIcon(practice.status)}
            </div>
            <span
              className="text-xs font-medium px-2 py-1 rounded-full"
              style={{
                backgroundColor: `${statusColor}20`,
                color: statusColor
              }}
            >
              {getStatusLabel(practice.status)}
            </span>
          </div>

          <div className="flex items-center space-x-4 text-xs text-gray-500">
            {practice.streak > 0 && (
              <div className="flex items-center space-x-1">
                <Flame className="h-3 w-3 text-orange-500" />
                <span>{practice.streak}天</span>
              </div>
            )}
            <div className="flex items-center space-x-1">
              <Calendar className="h-3 w-3" />
              <span>{formatDate(practice.updatedAt)}</span>
            </div>
          </div>
        </div>

        {practice.smallGoals.length > 0 && (
          <div className="mt-2 pt-2 border-t border-basic-200">
            <div className="flex items-center justify-between text-xs text-basic-400">
              <span>小目標</span>
              <span>
                {practice.smallGoals.filter((g) => g.isCompleted).length} / {practice.smallGoals.length}
              </span>
            </div>
            <div className="mt-1 flex space-x-1">
              {practice.smallGoals.slice(0, 3).map((goal) => (
                <div
                  key={goal.id}
                  className={`h-1 flex-1 rounded-full ${
                    goal.isCompleted ? 'bg-success' : 'bg-basic-200'
                  }`}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PracticeCard;
