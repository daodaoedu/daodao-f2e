import React from 'react';
import { useRouter } from 'next/router';
import {
  Book,
  Video,
  FileText,
  Headphones,
  GraduationCap,
  Settings,
  Flame,
  Edit3,
  Trash2,
  MoreVertical
} from 'lucide-react';
import { Practice, ContentType } from '@/services/practice/schema';
import {
  calculateProgress,
  getContentTypeLabel,
  canCheckIn
} from '@/services/practice/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface PracticeCardProps {
  practice: Practice;
  onEdit?: (practice: Practice) => void;
  onDelete?: (practice: Practice) => void;
  onCheckIn?: (practice: Practice) => void;
  showActions?: boolean;
}

const PracticeCard: React.FC<PracticeCardProps> = ({
  practice,
  onEdit,
  onDelete,
  onCheckIn,
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

  const getStatusDisplay = () => {
    const statusMap = {
      draft: '草稿',
      active: '進行中',
      paused: '暫停',
      completed: '已完成',
      archived: '已封存'
    };
    return statusMap[practice.status] || '未知';
  };

  const getStatusColor = () => {
    const colorMap = {
      draft: 'bg-basic-100 text-basic-300',
      active: 'bg-tips/20 text-tips',
      paused: 'bg-orange-100 text-orange-600',
      completed: 'bg-success/20 text-success',
      archived: 'bg-basic-100 text-basic-300'
    };
    return colorMap[practice.status] || 'bg-basic-100 text-basic-300';
  };

  const progressPercentage = calculateProgress(practice.currentProgress, practice.totalAmount);
  const canDoCheckIn = canCheckIn(practice);

  const router = useRouter();

  const handleCardClick = () => {
    router.push(`/practice/${practice.id}`);
  };

  return (
    <Card
      className="w-full max-w-xs sm:max-w-sm md:max-w-md lg:max-w-3xl mx-auto bg-basic-white rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden border border-basic-100 group relative cursor-pointer"
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
      <CardContent className="p-3 sm:p-4 md:p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center">
            <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-primary-lightest flex items-center justify-center mr-2 sm:mr-3">
              {getContentIcon(practice.contentType)}
            </div>
            <div>
              <div>
                <span className="text-xs sm:text-sm font-medium text-basic-400 mr-2">
                  {getContentTypeLabel(practice.contentType, practice.customContentType)}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-1 sm:space-x-2 mt-0">
            <Badge className="bg-primary-lightest text-primary-darker text-xs hidden sm:inline-block">
              主題實踐
            </Badge>

            {showActions && (
              <div className="relative">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="p-1 text-basic-300 hover:text-basic-400 hover:bg-basic-100 rounded-lg transition-colors"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <MoreVertical size={14} />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-32" align="end">
                    {canDoCheckIn && onCheckIn && (
                      <DropdownMenuItem
                        onClick={(e) => {
                        e.stopPropagation();
                        onCheckIn(practice);
                      }}
                        className="flex items-center cursor-pointer"
                      >
                        <Flame size={14} className="mr-2" />
                        打卡
                      </DropdownMenuItem>
                    )}

                    {onEdit && (
                      <DropdownMenuItem
                        onClick={(e) => {
                        e.stopPropagation();
                        onEdit(practice);
                      }}
                        className="flex items-center cursor-pointer"
                      >
                        <Edit3 size={14} className="mr-2" />
                        編輯
                      </DropdownMenuItem>
                    )}

                    {onDelete && (
                      <DropdownMenuItem
                        className="flex items-center cursor-pointer text-destructive focus:text-destructive"
                        onClick={(e) => {
                          e.stopPropagation();
                          onDelete(practice);
                        }}
                      >
                        <Trash2 size={14} className="mr-2" />
                        刪除
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            )}
          </div>
        </div>

        <h3 className="font-bold text-basic-black mb-2 text-base sm:text-lg group-hover:text-primary-base transition-colors">
          {practice.title}
        </h3>

        {/* Tags */}
        {practice.tags && practice.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 sm:gap-2 mb-3 sm:mb-4">
            {practice.tags.slice(0, 2).map((tag) => (
              <Badge
                key={tag}
                variant="secondary"
                className="px-1.5 py-0.5 sm:px-2 bg-basic-100 text-basic-300 text-xs font-medium rounded-full"
              >
                {tag}
              </Badge>
            ))}
            {practice.tags.length > 2 && (
              <Badge
                variant="secondary"
                className="px-1.5 py-0.5 sm:px-2 bg-basic-100 text-basic-300 text-xs font-medium rounded-full"
              >
                +{practice.tags.length - 2}
              </Badge>
            )}
          </div>
        )}

        {/* Progress Bar */}
        <div className="mb-3 sm:mb-4 relative">
          <Progress
            value={progressPercentage}
            className="h-2"
          />
          <span className="absolute right-0 -top-6 text-xs text-basic-300 font-medium">
            {progressPercentage}%
          </span>
        </div>

        {/* Streak and Status Row */}
        <div className="flex items-center justify-between mb-3 sm:mb-4">
          <div className="flex items-center space-x-1">
            <Flame className="h-4 w-4 text-orange-500" />
            <span className="text-xs text-basic-300 font-medium">{practice.streak}天</span>
          </div>
          <Badge className={getStatusColor()}>
            {getStatusDisplay()}
          </Badge>
        </div>

        {practice.practiceAction && (
          <div className="pt-3 sm:pt-4 border-t border-basic-100">
            <div className="text-xs text-basic-300 mb-2">實踐行動</div>
            <p className="text-sm text-muted-foreground line-clamp-2">
              {practice.practiceAction}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PracticeCard;
