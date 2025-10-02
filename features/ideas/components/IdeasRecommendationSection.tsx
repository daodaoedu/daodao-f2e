import React from 'react';
import { Lightbulb, TrendingUp, RefreshCw } from 'lucide-react';
import { Button } from '@/shared/ui/button';
import {
  Card, CardContent, CardHeader, CardTitle,
} from '@/shared/ui/card';
import { useContentTypeRecommendations } from '@/services/recommendation';
import { useAuth } from '@/contexts/Auth';
import { type IdeaSchema } from '@/services/ideas/schema';
import { type RecommendationItem } from '@/services/recommendation/core/schema';
import IdeaCard from './IdeaCard';

interface IdeasRecommendationSectionProps {
  className?: string;
  limit?: number;
  showHeader?: boolean;
}

const IdeasRecommendationSection: React.FC<IdeasRecommendationSectionProps> = ({
  className = '',
  limit = 5,
  showHeader = true,
}) => {
  const { user } = useAuth();

  // Use recommendation service to get idea-specific recommendations
  const {
    items: recommendationItems,
    hasMore,
    isLoading,
    error,
    mutate: refreshRecommendations,
  } = useContentTypeRecommendations('idea', {
    userId: user?.id,
    limit,
  });

  // Filter only idea type items from recommendations
  const ideaRecommendations = recommendationItems.filter((item) => item.type === 'idea');

  const handleRefresh = () => {
    refreshRecommendations();
  };

  if (error) {
    return (
      <Card className={`w-full ${className}`}>
        <CardContent className="flex flex-col items-center justify-center py-8">
          <div className="text-center">
            <p className="mb-4 text-basic-400">推薦內容載入失敗</p>
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              className="flex items-center gap-2"
            >
              <RefreshCw className="size-4" />
              重新載入
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Card className={`w-full ${className}`}>
        {showHeader && (
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Lightbulb className="size-5 text-primary-base" />
              推薦想法
            </CardTitle>
          </CardHeader>
        )}
        <CardContent>
          <div className="space-y-4">
            {Array.from({ length: 3 }, (_, index) => (
              <div key={`idea-rec-skeleton-${Date.now()}-${index}`} className="animate-pulse">
                <div className="h-32 rounded-lg bg-basic-100" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!ideaRecommendations || ideaRecommendations.length === 0) {
    return (
      <Card className={`w-full ${className}`}>
        {showHeader && (
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Lightbulb className="size-5 text-primary-base" />
              推薦想法
            </CardTitle>
          </CardHeader>
        )}
        <CardContent>
          <div className="py-8 text-center">
            <Lightbulb className="mx-auto mb-4 size-12 text-basic-200" />
            <p className="mb-2 text-basic-400">暫無推薦想法</p>
            <p className="text-sm text-basic-300">
              多瀏覽和互動內容，我們就能為你提供更精準的推薦
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Convert recommendation items to IdeaSchema format for IdeaCard
  const convertToIdeaSchema = (item: RecommendationItem): IdeaSchema => {
    if (item.type !== 'idea') {
      throw new Error('Item is not of type idea');
    }
    return {
      id: item.id,
      content: item.content,
      user: item.user,
      status: 'active' as const,
      tags: item.tags,
      imageUrls: [],
      videoUrls: [],
      ideaResources: [],
      likeCount: item.likeCount,
      commentCount: item.commentCount,
      viewCount: 0,
      shareCount: 0,
      isLiked: false,
      createdDate: item.createdDate,
      updatedDate: item.createdDate,
    };
  };

  return (
    <Card className={`w-full ${className}`}>
      {showHeader && (
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Lightbulb className="size-5 text-primary-base" />
              推薦想法
              {ideaRecommendations.length > 0 && (
                <span className="text-sm font-normal text-basic-400">
                  (
                  {ideaRecommendations.length}
                  +)
                </span>
              )}
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleRefresh}
                className="hover:text-basic-600 flex items-center gap-1 text-basic-400"
              >
                <RefreshCw className="size-4" />
                <span className="hidden sm:inline">重新推薦</span>
              </Button>
            </div>
          </div>
          {ideaRecommendations.length > 0 && (
            <p className="flex items-center gap-1 text-sm text-basic-400">
              <TrendingUp className="size-4" />
              根據你的興趣推薦的創意想法
            </p>
          )}
        </CardHeader>
      )}

      <CardContent className="space-y-4">
        {ideaRecommendations.map((item) => (
          <div key={item.id} className="relative">
            <IdeaCard
              data={convertToIdeaSchema(item)}
              className="bg-basic-50 border-none shadow-none"
              showActions
            />
            {item.reason && (
              <div className="absolute right-2 top-2">
                <div className="bg-primary-100 text-primary-700 rounded-full px-2 py-1 text-xs">
                  {item.reason}
                </div>
              </div>
            )}
          </div>
        ))}

        {hasMore && (
          <div className="pt-4 text-center">
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              className="flex items-center gap-2"
            >
              <TrendingUp className="size-4" />
              載入更多推薦
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default IdeasRecommendationSection;
