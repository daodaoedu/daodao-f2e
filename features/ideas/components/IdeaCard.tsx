import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  MoreHorizontal,
  Edit,
  Trash2,
  FileText,
  Eye,
} from 'lucide-react';
import Comment from '@/public/assets/icons/comment.svg';
import Shell from '@/public/assets/icons/shell.svg';
import DefaultAvatar from '@/public/assets/icons/default-avatar.svg';
import { Image } from '@/components/ui/image';
import type { IdeaSchema } from '@/services/ideas';
import { ROLE } from '@/constants/member';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
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
        group relative cursor-pointer rounded-lg 
        border-0 bg-white shadow-sm transition-all duration-200 hover:shadow-md
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
        <div className="mb-3 flex items-start justify-between">
          <div className="flex-1">
            <div className="mb-2 flex items-start gap-3">
              {data.user?.photoURL ? (
                <Image
                  src={data.user.photoURL}
                  alt={`${data.user.name}'s avatar`}
                  width={30}
                  height={30}
                  className="rounded-full"
                />
              ) : (
                <div className="size-[30px] shrink-0">
                  <DefaultAvatar />
                </div>
              )}
              <div className="min-w-0 flex-1">
                <div className="mb-1 flex items-center gap-2">
                  <span className="text-sm font-medium text-[#536166]">{data.user?.name || '匿名用戶'}</span>
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
            <div className="whitespace-nowrap rounded-full bg-primary-base px-3 py-1 text-xs text-white">
              想法
            </div>
            <span className="text-xs text-basic-300">{formatIdeaDate(data.createdDate || '')}</span>
            {showActions && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="size-8 p-0 text-basic-300 opacity-0 transition-opacity hover:text-basic-500 group-hover:opacity-100"
                  >
                    <MoreHorizontal className="size-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-32">
                  <DropdownMenuItem onClick={onEditClick} className="text-sm">
                    <Edit className="mr-2 size-3" />
                    編輯
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={onDeleteClick}
                    className="text-sm text-red-600 focus:text-red-600"
                  >
                    <Trash2 className="mr-2 size-3" />
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
        <p className="body-sm line-clamp-4 whitespace-pre-wrap leading-relaxed text-basic-500">
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
                className="inline-flex items-center rounded-full border border-primary-base/20 bg-basic-100 px-2 py-1 text-xs text-gray-700"
              >
                {tag}
              </span>
            ))}
            {data.tags.length > 3 && (
              <span className="text-xs text-basic-300">
                +
                {data.tags.length - 3}
              </span>
            )}
          </div>
        </div>
      )}

      {/* Image */}
      {hasImages && (
        <div className="px-4 pb-3">
          <div className="relative overflow-hidden rounded-lg">
            <Image
              src={data.imageUrls![0]}
              alt={data.imageUrls[0]}
              width={400}
              height={192}
              className="h-48 w-full object-cover transition-transform duration-200 group-hover:scale-105"
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
                className="hover:bg-basic-50/50 group/resource flex items-center rounded-lg p-2 transition-colors"
                onClick={(e) => e.stopPropagation()}
              >
                <FileText className="mr-2 size-5 shrink-0 text-primary-base" />
                <span className="body-sm truncate text-basic-500 group-hover/resource:text-primary-darker">
                  {resource.name}
                </span>
              </Link>
            ))}
            {data.ideaResources!.length > 2 && (
              <p className="body-sm pl-5 text-basic-300">
                還有
                {' '}
                {data.ideaResources!.length - 2}
                {' '}
                個資源...
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
            className={`flex h-8 items-center gap-1 px-2 text-xs ${isLiked
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
            <Eye className="size-3" />
            <span>{data.viewCount || 0}</span>
          </div>
        </div>
      </div>
    </div>
  );

  return <CardContent />;
};

export default IdeaCard;
