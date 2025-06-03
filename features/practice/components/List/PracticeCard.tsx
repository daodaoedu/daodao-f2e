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
  Edit3,
  Trash2,
  MoreVertical,
  Eye
} from 'lucide-react';
import { Practice, ContentType } from '@/services/modules/practice/schema';
import {
  calculateProgress,
  getContentTypeLabel,
  getStatusLabel,
  canCheckIn
} from '@/services/modules/practice/utils';
import { ProgressBar } from '@/components/atoms/progress-bar';
import { StatusBadge, StatusVariant } from '@/components/atoms/status-badge';
import { Button } from '@/components/atoms/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/atoms/dropdown-menu';
import { cn } from '@/utils/cn';
import { formatDistanceToNow } from 'date-fns';
import { zhTW } from 'date-fns/locale';
import TagList from '../Shared/TagList';

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

  const getStatusVariant = (): StatusVariant => {
    return practice.status as StatusVariant;
  };

  const progressPercentage = calculateProgress(practice.currentProgress, practice.totalAmount);
  const canDoCheckIn = canCheckIn(practice);

  const handleCardClick = () => {
    if (onView) {
      onView(practice);
    }
  };

  const getProgressVariant = () => {
    if (progressPercentage === 100) return 'success';
    if (progressPercentage >= 75) return 'default';
    if (progressPercentage >= 50) return 'default';
    if (progressPercentage >= 25) return 'warning';
    return 'default';
  };

  return (
    <div
      className="bg-card rounded-lg border border-border hover:border-muted-foreground hover:shadow-md transition-all duration-200 cursor-pointer"
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
            <div className="p-2 rounded-lg bg-primary/10 text-primary">
              {getContentIcon(practice.contentType)}
            </div>

            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-semibold text-foreground truncate">
                {practice.title}
              </h3>
              <p className="text-sm text-muted-foreground">
                {getContentTypeLabel(practice.contentType)}
              </p>
            </div>
          </div>

          {showActions && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0"
                  onClick={(e) => e.stopPropagation()}
                >
                  <MoreVertical className="h-4 w-4" />
                  <span className="sr-only">開啟選單</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem onClick={(e) => {
                  e.stopPropagation();
                  onView?.(practice);
                }}>
                  <Eye className="h-4 w-4" />
                  <span>查看詳情</span>
                </DropdownMenuItem>
                
                {canDoCheckIn && onCheckIn && (
                  <DropdownMenuItem onClick={(e) => {
                    e.stopPropagation();
                    onCheckIn(practice);
                  }}>
                    <Flame className="h-4 w-4" />
                    <span>今日打卡</span>
                  </DropdownMenuItem>
                )}

                {onEdit && (
                  <DropdownMenuItem onClick={(e) => {
                    e.stopPropagation();
                    onEdit(practice);
                  }}>
                    <Edit3 className="h-4 w-4" />
                    <span>編輯實踐</span>
                  </DropdownMenuItem>
                )}

                {onDelete && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      className="text-destructive focus:text-destructive"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDelete(practice);
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                      <span>刪除實踐</span>
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>

        {practice.description && (
          <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
            {practice.description}
          </p>
        )}

        {/* 標籤顯示 */}
        {practice.tags && practice.tags.length > 0 && (
          <div className="mt-2">
            <TagList 
              tags={practice.tags} 
              maxDisplay={3} 
              showIcon={false} 
              className=""
            />
          </div>
        )}
      </div>

      <div className="px-4 pb-3">
        <ProgressBar
          current={practice.currentProgress}
          total={practice.totalAmount}
          unit={practice.unit}
          variant={getProgressVariant()}
          size="md"
        />
      </div>

      <div className="px-3 sm:px-4 py-2 sm:py-3 bg-muted/50 rounded-b-lg">
        <div className="flex items-center justify-between">
          <StatusBadge 
            status={getStatusVariant()}
            size="sm"
          />

          <div className="flex items-center space-x-2 sm:space-x-4 text-sm text-muted-foreground">
            {practice.streak > 0 && (
              <div className="flex items-center space-x-1">
                <Flame className="h-3 w-3 text-tips" />
                <span className="hidden xs:inline">{practice.streak}天</span>
                <span className="xs:hidden">{practice.streak}</span>
              </div>
            )}
            <div className="flex items-center space-x-1">
              <Calendar className="h-3 w-3" />
              <span className="hidden sm:inline">
                {formatDistanceToNow(new Date(practice.updatedAt), { 
                  addSuffix: true, 
                  locale: zhTW 
                })}
              </span>
              <span className="sm:hidden">
                {formatDistanceToNow(new Date(practice.updatedAt), { 
                  addSuffix: false, 
                  locale: zhTW 
                })}
              </span>
            </div>
          </div>
        </div>

        {practice.smallGoals.length > 0 && (
          <div className="mt-2 pt-2 border-t border-border">
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span className="hidden sm:inline">小目標</span>
              <span className="sm:hidden">目標</span>
              <span>
                {practice.smallGoals.filter((g) => g.isCompleted).length} / {practice.smallGoals.length}
              </span>
            </div>
            <div className="mt-1 flex space-x-1">
              {practice.smallGoals.slice(0, 3).map((goal) => (
                <div
                  key={goal.id}
                  className={cn(
                    "h-1 flex-1 rounded-full",
                    goal.isCompleted ? 'bg-green-500' : 'bg-muted'
                  )}
                />
              ))}
              {practice.smallGoals.length > 3 && (
                <div className="text-sm text-muted-foreground ml-1">
                  +{practice.smallGoals.length - 3}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PracticeCard;
