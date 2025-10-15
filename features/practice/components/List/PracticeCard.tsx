import React from 'react';
import { CustomLink } from '@/shared/ui/custom-link';
import {
  Flame,
  Edit3,
  Trash2,
  MoreVertical,
  Share2,
  Eye,
} from 'lucide-react';
import { differenceInDays } from 'date-fns';
import Shell from '@/public/assets/icons/shell.svg';
import Comment from '@/public/assets/icons/comment.svg';
import { Practice, PracticeWithUser } from '@/services/practice/schema';
import {
  calculateProgress,
  getContentTypeLabel,
  canCheckIn,
  formatDate,
} from '@/services/practice/utils';
import { Button } from '@/shared/ui/button';
import { Card, CardContent } from '@/shared/ui/card';
import { Badge } from '@/shared/ui/badge';
import { Progress } from '@/shared/ui/progress';
import { Avatar, AvatarImage, AvatarFallback } from '@/shared/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/shared/ui/dropdown-menu';

interface PracticeCardProps {
  practice: Practice | PracticeWithUser;
  onEdit?: (practice: Practice | PracticeWithUser) => void;
  onDelete?: (practice: Practice | PracticeWithUser) => void;
  onCheckIn?: (practice: Practice | PracticeWithUser) => void;
  showActions?: boolean;
}

const PracticeCard: React.FC<PracticeCardProps> = ({
  practice,
  onEdit,
  onDelete,
  onCheckIn,
  showActions = true,
}) => {

  const getStatusDisplay = () => {
    const statusMap = {
      draft: '草稿',
      active: '進行中',
      paused: '暫停',
      completed: '已完成',
      archived: '已封存',
    };
    return statusMap[practice.status] || '未知';
  };

  const getStatusColor = () => {
    const colorMap = {
      draft: 'bg-basic-100 text-basic-300',
      active: 'bg-tips/20 text-tips',
      paused: 'bg-orange-100 text-orange-600',
      completed: 'bg-success/20 text-success',
      archived: 'bg-basic-100 text-basic-300',
    };
    return colorMap[practice.status] || 'bg-basic-100 text-basic-300';
  };

  const progressPercentage = calculateProgress(practice.currentProgress, practice.totalAmount);
  const canDoCheckIn = canCheckIn(practice);

  const cardContent = (
    <Card
      className="group relative w-full max-w-xs cursor-pointer overflow-hidden rounded-2xl border border-basic-200 bg-basic-white shadow-sm transition-all duration-300 hover:shadow-lg sm:max-w-sm md:max-w-md lg:max-w-3xl"
    >
      <CardContent className="p-3 sm:p-4 md:p-6">
        <div className="mb-4 flex items-start justify-between">
          <div className="flex items-center">
            <Avatar className="w-6 h-6 sm:w-8 sm:h-8 mr-2 sm:mr-3">
              <AvatarImage
                src={'user' in practice && practice.user?.photoURL && practice.user.photoURL.trim() !== '' ? practice.user.photoURL : undefined}
                alt={'user' in practice ? practice.user?.name || 'user avatar' : 'user avatar'}
              />
              <AvatarFallback className="bg-primary-base text-primary-foreground text-xs sm:text-sm font-bold">
                {'user' in practice && practice.user?.name ? practice.user.name.charAt(0) : '?'}
              </AvatarFallback>
            </Avatar>
            <div>
              <div>
                <span className="text-xs sm:text-sm font-medium text-basic-500 mr-2">
                  {'user' in practice && practice.user?.name ? practice.user.name : '匿名用戶'}
                </span>
              </div>
              <div className="text-xs text-basic-300 mt-0.5">
                {getContentTypeLabel(practice.contentType, practice.customContentType)}
              </div>
            </div>
          </div>

          <div className="mt-0 flex items-center space-x-1 sm:space-x-2">
            <Badge className="hidden bg-primary-lightest text-xs text-primary-darker sm:inline-block">
              主題實踐
            </Badge>
            {practice.startDate && (
              <div className="text-xs text-basic-300 hidden sm:block">
                {practice.targetDate ? (
                  <>
                    {formatDate(practice.startDate)}
                    {' - '}
                    {formatDate(practice.targetDate)}
                    {' ('}
                    {differenceInDays(new Date(practice.targetDate), new Date(practice.startDate)) + 1}
                    天)
                  </>
                ) : (
                  formatDate(practice.startDate)
                )}
              </div>
            )}

            {showActions && (
              <div className="relative">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="rounded-lg p-1 text-basic-300 transition-colors hover:bg-basic-100 hover:text-basic-400"
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
                        className="flex cursor-pointer items-center"
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
                        className="flex cursor-pointer items-center"
                      >
                        <Edit3 size={14} className="mr-2" />
                        編輯
                      </DropdownMenuItem>
                    )}

                    {onDelete && (
                      <DropdownMenuItem
                        className="flex cursor-pointer items-center text-destructive focus:text-destructive"
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

        <h3 className="mb-2 text-base font-bold text-basic-black transition-colors sm:text-lg">
          {practice.title}
        </h3>

        {/* Tags */}
        {practice.tags && practice.tags.length > 0 && (
          <div className="mb-3 flex flex-wrap gap-1 sm:mb-4 sm:gap-2">
            {practice.tags.slice(0, 2).map((tag) => (
              <Badge
                key={tag}
                variant="secondary"
                className="rounded-full bg-basic-100 px-1.5 py-0.5 text-xs font-medium text-basic-300 sm:px-2"
              >
                {tag}
              </Badge>
            ))}
            {practice.tags.length > 2 && (
              <Badge
                variant="secondary"
                className="rounded-full bg-basic-100 px-1.5 py-0.5 text-xs font-medium text-basic-300 sm:px-2"
              >
                +
                {practice.tags.length - 2}
              </Badge>
            )}
          </div>
        )}

        {/* Progress Bar */}
        <div className="relative mb-3 sm:mb-4">
          <Progress
            value={progressPercentage}
            className="h-2"
          />
          <span className="absolute -top-6 right-0 text-xs font-medium text-basic-300">
            {progressPercentage}
            %
          </span>
        </div>

        {/* Streak and Status Row */}
        <div className="mb-3 flex items-center justify-between sm:mb-4">
          <div className="flex items-center space-x-1">
            <Flame className="size-4 text-orange-500" />
            <span className="text-xs font-medium text-basic-300">
              {practice.streak}
              天
            </span>
          </div>
          <Badge className={getStatusColor()}>
            {getStatusDisplay()}
          </Badge>
        </div>

        {practice.practiceAction && (
          <div className="border-t border-basic-100 pt-3 sm:pt-4">
            <div className="mb-2 text-xs text-basic-300">實踐行動</div>
            <p className="line-clamp-2 text-sm text-muted-foreground">
              {practice.practiceAction}
            </p>
          </div>
        )}

        {/* Action Buttons - Shell, Comment, Eye, Share */}
        <div className="pt-3 sm:pt-4">
          <div className="flex items-center justify-end gap-4 text-xs text-basic-300">
            <div className="flex items-center gap-1">
              <Shell />
              <span>{practice.likeCount || 0}</span>
            </div>
            <div className="flex items-center gap-1">
              <Comment />
              <span>{practice.commentCount || 0}</span>
            </div>
            <div className="flex items-center gap-1">
              <Eye className="h-4 w-4" />
              <span>{practice.viewCount || 0}</span>
            </div>
            <div className="flex items-center gap-1">
              <Share2 className="h-4 w-4" />
              <span>{practice.shareCount || 0}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <CustomLink href={`/practice/${practice.id}`} className="block max-w-xs sm:max-w-sm md:max-w-md lg:max-w-3xl mx-auto">
      {cardContent}
    </CustomLink>
  );
};

export default PracticeCard;
