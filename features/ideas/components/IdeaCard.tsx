import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/atoms/button';
import {
  MoreHorizontal,
  Edit,
  Trash2,
  ExternalLink,
  Eye,
  Heart,
  MessageCircle,
  Share2
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/atoms/dropdown-menu';
import Image from '@/shared/components/Image';
import type { IdeaSchema } from '@/services/modules/ideas';
import { formatIdeaDate, truncateText, getVisibilityLabel } from '../utils';

interface IdeaCardProps {
  data: IdeaSchema;
  className?: string;
  detailLink?: string;
  onEditClick?: () => void;
  onDeleteClick?: () => void;
  onLikeClick?: () => void;
  onShareClick?: () => void;
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
  onShareClick,
  isLiked = false,
  showActions = true,
}) => {
  const hasResources = data.ideaResources && data.ideaResources.length > 0;
  const hasImages = data.imageUrls && data.imageUrls.length > 0;

  const handleCardClick = (e: React.MouseEvent) => {
    // Prevent navigation when clicking on action buttons
    const target = e.target as HTMLElement;
    if (target.closest('button') || target.closest('[role="button"]')) {
      e.preventDefault();
    }
  };

  const CardContent = () => (
    <div
      className={`
        group relative rounded-lg border transition-all duration-200 
        hover:shadow-lg hover:shadow-primary-base/10 cursor-pointer bg-white
        ${className}
      `}
      style={{
        borderColor: '#16b9b360'
      }}
      onClick={handleCardClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === 'Space') {
          e.preventDefault();
          const target = e.target as HTMLElement;
          if (!target.closest('button') && !target.closest('[role="button"]') && detailLink) {
            window.location.href = detailLink;
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
            <h3 className="heading-sm text-primary-darker mb-2 line-clamp-2">
              {data.title}
            </h3>
            <div className="flex items-center gap-2 text-xs text-basic-300">
              <span>{data.authorName || '匿名用戶'}</span>
              <span>•</span>
              <span>{formatIdeaDate(data.createdDate || '')}</span>
              <span>•</span>
              <span className="px-2 py-0.5 bg-primary-base/10 text-primary-darker rounded-full">
                {getVisibilityLabel(data.visibility)}
              </span>
            </div>
          </div>

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

      {/* Content */}
      <div className="px-4 pb-3">
        <p className="body-sm text-basic-500 leading-relaxed whitespace-pre-wrap line-clamp-4">
          {truncateText(data.content, 200)}
        </p>
      </div>

      {/* Image */}
      {hasImages && (
        <div className="px-4 pb-3">
          <div className="relative rounded-lg overflow-hidden">
            <Image
              src={data.imageUrls![0]}
              alt={data.title}
              className="w-full h-48 object-cover transition-transform duration-200 group-hover:scale-105"
            />
          </div>
        </div>
      )}

      {/* Resources */}
      {hasResources && (
        <div className="px-4 pb-3">
          <h4 className="body-sm font-medium text-basic-500 mb-2">學習資源</h4>
          <div className="space-y-2">
            {data.ideaResources!.slice(0, 2).map((resource) => (
              <Link
                key={resource.url}
                href={resource.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center p-2 rounded-lg hover:bg-primary-base/10 transition-colors group/resource"
                onClick={(e) => e.stopPropagation()}
              >
                <ExternalLink className="h-3 w-3 mr-2 text-primary-base flex-shrink-0" />
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
      <div className="px-4 py-3 border-t border-primary-base/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onLikeClick?.();
              }}
              className={`text-xs h-8 px-2 ${
                isLiked
                  ? 'text-red-500 hover:text-red-600'
                  : 'text-basic-300 hover:text-red-500'
              }`}
            >
              <Heart className={`h-3 w-3 mr-1 ${isLiked ? 'fill-current' : ''}`} />
              {data.likeCount || 0}
            </Button>

            <Button
              variant="ghost"
              size="sm"
              className="text-xs text-basic-300 hover:text-primary-base h-8 px-2"
            >
              <MessageCircle className="h-3 w-3 mr-1" />
              {data.commentCount || 0}
            </Button>
          </div>

          <div className="flex items-center space-x-2">
            {detailLink && (
              <Link href={detailLink} onClick={(e) => e.stopPropagation()}>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-xs text-basic-300 hover:text-primary-base h-8 px-2"
                >
                  <Eye className="h-3 w-3 mr-1" />
                  查看
                </Button>
              </Link>
            )}

            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onShareClick?.();
              }}
              className="text-xs text-basic-300 hover:text-primary-base h-8 px-2"
            >
              <Share2 className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );

  if (detailLink) {
    return (
      <Link href={detailLink} className="block">
        <CardContent />
      </Link>
    );
  }

  return <CardContent />;
};

export default IdeaCard;
