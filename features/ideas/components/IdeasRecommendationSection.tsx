import React from 'react';
import { Lightbulb, TrendingUp, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card, CardContent, CardHeader, CardTitle,
} from '@/components/ui/card';
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
            <p className="text-basic-400 mb-4">推薦內容載入失敗</p>
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              className="flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
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
              <Lightbulb className="w-5 h-5 text-primary-base" />
              推薦想法
            </CardTitle>
          </CardHeader>
        )}
        <CardContent>
          <div className="space-y-4">
            {Array.from({ length: 3 }, (_, index) => (
              <div key={`idea-rec-skeleton-${Date.now()}-${index}`} className="animate-pulse">
                <div className="bg-basic-100 rounded-lg h-32" />
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
              <Lightbulb className="w-5 h-5 text-primary-base" />
              推薦想法
            </CardTitle>
          </CardHeader>
        )}
        <CardContent>
          <div className="text-center py-8">
            <Lightbulb className="w-12 h-12 text-basic-200 mx-auto mb-4" />
            <p className="text-basic-400 mb-2">暫無推薦想法</p>
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
              <Lightbulb className="w-5 h-5 text-primary-base" />
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
                className="flex items-center gap-1 text-basic-400 hover:text-basic-600"
              >
                <RefreshCw className="w-4 h-4" />
                <span className="hidden sm:inline">重新推薦</span>
              </Button>
            </div>
          </div>
          {ideaRecommendations.length > 0 && (
            <p className="text-sm text-basic-400 flex items-center gap-1">
              <TrendingUp className="w-4 h-4" />
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
              className="border-none shadow-none bg-basic-50"
              showActions
            />
            {item.reason && (
              <div className="absolute top-2 right-2">
                <div className="bg-primary-100 text-primary-700 px-2 py-1 rounded-full text-xs">
                  {item.reason}
                </div>
              </div>
            )}
          </div>
        ))}

        {hasMore && (
          <div className="text-center pt-4">
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              className="flex items-center gap-2"
            >
              <TrendingUp className="w-4 h-4" />
              載入更多推薦
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default IdeasRecommendationSection;
