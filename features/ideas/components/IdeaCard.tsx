import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { Button } from '@/components/atoms/button';
import {
  MoreHorizontal,
  Edit,
  Trash2,
  FileText,
  Eye
} from 'lucide-react';
import Comment from '@/public/assets/icons/comment.svg';
import Shell from '@/public/assets/icons/shell.svg';
import DefaultAvatar from '@/public/assets/icons/default-avatar.svg';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/atoms/dropdown-menu';
import Image from '@/shared/components/Image';
import type { IdeaSchema } from '@/services/ideas';
import { ROLE } from '@/constants/member';
import { formatIdeaDate, truncateText } from '../utils';

interface IdeaCardProps {
  data: IdeaSchema;
  className?: string;
  detailLink?: string;
  onEditClick?: () => void;
  onDeleteClick?: () => void;
  onLikeClick?: () => void;
  isLiked?: boolean;
  showActions?: boolean;
}

const IdeaCard: React.FC<IdeaCardProps> = ({
  data,
  className = '',
  detailLink,
  onEditClick,
  onDeleteClick,
  onLikeClick,
  isLiked = false,
  showActions = true,
}) => {
  const router = useRouter();
  const hasResources = data.ideaResources && data.ideaResources.length > 0;
  const hasImages = data.imageUrls && data.imageUrls.length > 0;

  const handleCardClick = (e: React.MouseEvent) => {
    console.log('Card clicked!', detailLink); // Debug log

    // Prevent navigation when clicking on specific interactive elements
    const target = e.target as HTMLElement;

    // Get the card element itself
    const cardElement = e.currentTarget;

    // Check for specific interactive elements that should prevent navigation
    // but exclude the card itself
    if (
      target.tagName === 'BUTTON' ||
      target.closest('a[href]') || // Resource links
      (target.closest('button') && target.closest('button') !== cardElement) ||
      target.closest('[role="menuitem"]') ||
      target.closest('.dropdown-menu')
    ) {
      console.log('Clicked on interactive element, preventing navigation');
      return;
    }

    // Navigate to detail page if detailLink is provided
    if (detailLink) {
      console.log('Navigating to:', detailLink);
      router.push(detailLink);
    } else {
      console.log('No detailLink provided');
    }
  };

  const CardContent = () => (
    <div
      className={`
        group relative transition-all duration-200 
        cursor-pointer border-0 bg-white rounded-lg shadow-sm hover:shadow-md
        ${className}
      `}
      onClick={handleCardClick}
      style={{ cursor: 'pointer' }}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === 'Space') {
          e.preventDefault();
          const target = e.target as HTMLElement;
          if (!target.closest('button') && !target.closest('[role="button"]') && !target.closest('a') && detailLink) {
            router.push(detailLink);
          }
        }
      }}
      role="button"
      tabIndex={0}
    >
      {/* Header */}
      <div className="p-4 pb-3">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <div className="flex items-start gap-3 mb-2">
              {data.user?.photoURL ? (
                <Image
                  src={data.user.photoURL}
                  alt={`${data.user.name}'s avatar`}
                  width="30px"
                  height="30px"
                  borderRadius="9999px"
                />
              ) : (
                <div className="w-[30px] h-[30px] flex-shrink-0">
                  <DefaultAvatar />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium text-sm text-[#536166]">{data.user?.name || '匿名用戶'}</span>
                </div>
                {data.user?.roleList?.[0] && (
                  <div className="text-sm font-normal text-[#92989A]">
                    {ROLE.find((r) => r.value === data.user.roleList[0])?.label || data.user.roleList[0]}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="px-3 py-1 text-xs bg-primary-base rounded-full text-white whitespace-nowrap">
              想法
            </div>
            <span className="text-xs text-basic-300">{formatIdeaDate(data.createdDate || '')}</span>
            {showActions && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="opacity-0 group-hover:opacity-100 transition-opacity text-basic-300 hover:text-basic-500 h-8 w-8 p-0"
                  >
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-32">
                  <DropdownMenuItem onClick={onEditClick} className="text-sm">
                    <Edit className="h-3 w-3 mr-2" />
                    編輯
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={onDeleteClick}
                    className="text-sm text-red-600 focus:text-red-600"
                  >
                    <Trash2 className="h-3 w-3 mr-2" />
                    刪除
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 pb-3">
        <p className="body-sm text-basic-500 leading-relaxed whitespace-pre-wrap line-clamp-4">
          {truncateText(data.content, 200)}
        </p>
      </div>

      {/* Tags */}
      {data.tags && data.tags.length > 0 && (
        <div className="px-4 pb-3">
          <div className="flex flex-wrap gap-1">
            {data.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-basic-100 text-gray-700 border border-primary-base/20"
              >
                {tag}
              </span>
            ))}
            {data.tags.length > 3 && (
              <span className="text-xs text-basic-300">+{data.tags.length - 3}</span>
            )}
          </div>
        </div>
      )}

      {/* Image */}
      {hasImages && (
        <div className="px-4 pb-3">
          <div className="relative rounded-lg overflow-hidden">
            <Image
              src={data.imageUrls![0]}
              alt={data.imageUrls[0]}
              width="400"
              height="192"
              className="w-full h-48 object-cover transition-transform duration-200 group-hover:scale-105"
            />
          </div>
        </div>
      )}

      {/* Resources */}
      {hasResources && (
        <div className="px-4 pb-3">
          <div className="space-y-2">
            {data.ideaResources!.slice(0, 2).map((resource) => (
              <Link
                key={resource.url}
                href={resource.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center p-2 rounded-lg hover:bg-basic-50/50 transition-colors group/resource"
                onClick={(e) => e.stopPropagation()}
              >
                <FileText className="h-5 w-5 mr-2 text-primary-base flex-shrink-0" />
                <span className="body-sm text-basic-500 group-hover/resource:text-primary-darker truncate">
                  {resource.name}
                </span>
              </Link>
            ))}
            {data.ideaResources!.length > 2 && (
              <p className="body-sm text-basic-300 pl-5">
                還有 {data.ideaResources!.length - 2} 個資源...
              </p>
            )}
          </div>
        </div>
      )}

      {/* Footer Actions */}
      <div className="px-4 py-3">
        <div className="flex items-center justify-end gap-4 text-xs text-basic-300">
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onLikeClick?.();
            }}
            className={`text-xs h-8 px-2 flex items-center gap-1 ${isLiked
              ? 'text-primary-base'
              : 'text-basic-300 hover:text-primary-base'
              }`}
          >
            <Shell className={isLiked ? 'fill-primary-base' : ''} />
            <span>{data.likeCount || 0}</span>
          </Button>

          <div className="flex items-center gap-1">
            <Comment />
            <span>{data.commentCount || 0}</span>
          </div>

          <div className="flex items-center gap-1">
            <Eye className="h-3 w-3" />
            <span>{data.viewCount || 0}</span>
          </div>
        </div>
      </div>
    </div>
  );

  return <CardContent />;
};

export default IdeaCard;
