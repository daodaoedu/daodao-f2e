'use client';

import React from 'react';
import { CustomLink } from '@/shared/ui/custom-link';
import {
  Share2,
  Link as LinkIcon,
  Eye,
} from 'lucide-react';
import Shell from '@/public/assets/icons/shell.svg';
import Comment from '@/public/assets/icons/comment.svg';
import { Button } from '@/shared/ui';
import { Card, CardContent } from '@/shared/ui/card';
import { Badge } from '@/shared/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/shared/ui/avatar';
import { useAuth } from '@/entities/user';
import type { IdeaSchema } from '@/services/ideas/schema';
import { IdeaActions } from './IdeaActions';

interface IdeaCardProps {
  idea: IdeaSchema;
  onClick?: (id: string) => void;
}

function IdeaCard({
  idea,
  onClick,
}: IdeaCardProps) {
  const { user } = useAuth();

  // 檢查是否為想法的作者
  const isOwner = user?.id === idea.user?.id;

  const handleCardClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (onClick) {
      onClick(idea.id);
    }
  };

  const cardContent = (
    <Card
      className="w-full max-w-xs sm:max-w-sm md:max-w-md lg:max-w-3xl bg-basic-white rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden border border-basic-200 relative cursor-pointer"
      onClick={onClick ? handleCardClick : undefined}
      onKeyDown={onClick ? (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleCardClick(e as unknown as React.MouseEvent);
        }
      } : undefined}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      <CardContent className="p-2 sm:p-3 md:p-4">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center">
            <Avatar className="w-6 h-6 sm:w-8 sm:h-8 mr-2 sm:mr-3">
              <AvatarImage
                src={idea.user?.photoURL && idea.user.photoURL.trim() !== '' ? idea.user.photoURL : undefined}
                alt={idea.user?.name || 'user avatar'}
              />
              <AvatarFallback className="bg-primary-base text-primary-foreground text-xs sm:text-sm font-bold">
                {idea.user?.name?.charAt(0) || '?'}
              </AvatarFallback>
            </Avatar>
            <div>
              <div>
                <span className="text-xs sm:text-sm font-medium text-basic-500 mr-2">
                  {idea.user?.name || '匿名用戶'}
                </span>
              </div>
              <div className="text-xs text-basic-300 mt-0.5">
                {idea.user?.roleList?.[0] || '想法分享者'}
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-1 sm:space-x-2 mt-0">
            <Badge
              className="bg-orange-400 text-primary-foreground text-xs hidden sm:inline-block"
            >
              想法
            </Badge>
            <div className="text-xs text-basic-300 hidden sm:block">
              {new Date(idea.createdAt).toLocaleDateString('zh-TW')}
            </div>

            {/* 編輯/刪除選單 - 只有作者可見 */}
            {isOwner && <IdeaActions idea={idea} />}
          </div>
        </div>

        <p className="text-basic-500 mb-3 sm:mb-4 text-sm sm:text-base line-clamp-3 sm:line-clamp-none whitespace-pre-wrap">{idea.content}</p>

        <div className="flex gap-1 sm:gap-2 mb-3 sm:mb-4 flex-wrap">
          {idea.tags?.map((tag) => (
            <Badge
              key={tag}
              variant="secondary"
              className="px-1.5 py-0.5 sm:px-2 bg-basic-100 text-basic-300 text-xs font-medium rounded-full"
            >
              {tag}
            </Badge>
          ))}
        </div>

        {idea.resources?.[0] && (
          <div className="flex items-center p-2 sm:p-3 bg-primary-lightest rounded-lg mb-3 sm:mb-4">
            <LinkIcon size={14} className="text-primary-base mr-1 sm:mr-2 flex-shrink-0" />
            {idea.resources[0]?.url ? (
              <Button
                variant="ghost"
                onClick={(e) => {
                  e.stopPropagation();
                  window.open(idea.resources[0]?.url ?? '', '_blank');
                }}
                className="text-primary-darker text-xs sm:text-sm truncate p-0 h-auto hover:underline"
              >
                {idea.resources[0]?.name}
              </Button>
            ) : (
              <span className="text-primary-darker text-xs sm:text-sm truncate">
                {idea.resources[0]?.name}
              </span>
            )}
          </div>
        )}

        <div className="pt-3 sm:pt-4">
          <div className="flex items-center justify-end gap-4 text-xs text-basic-300">
            <div className="flex items-center gap-1">
              <Shell />
              <span>{idea.likeCount || 0}</span>
            </div>
            <div className="flex items-center gap-1">
              <Comment />
              <span>{idea.commentCount || 0}</span>
            </div>
            <div className="flex items-center gap-1">
              <Eye className="h-4 w-4" />
              <span>{idea.viewCount || 0}</span>
            </div>
            <div className="flex items-center gap-1">
              <Share2 className="h-4 w-4" />
              <span>{idea.shareCount || 0}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const content = cardContent;

  if (onClick) {
    return content;
  }

  return (
    <CustomLink href={`/ideas/${idea.id}`} className="block max-w-xs sm:max-w-sm md:max-w-md lg:max-w-3xl mx-auto">
      {content}
    </CustomLink>
  );
}

export default IdeaCard;
