import React from 'react';
import { FolderOpen, TrendingUp, RefreshCw, Compass } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useContentTypeRecommendations } from '@/services/recommendation';
import { useAuth } from '@/contexts/Auth';
import { type RecommendationItem } from '@/services/recommendation/core/schema';
import Link from 'next/link';

interface ProjectsRecommendationSectionProps {
  className?: string;
  limit?: number;
  showHeader?: boolean;
}

const ProjectsRecommendationSection: React.FC<ProjectsRecommendationSectionProps> = ({
  className = '',
  limit = 5,
  showHeader = true,
}) => {
  const { user } = useAuth();

  // Use recommendation service to get project-specific recommendations
  const {
    items: recommendationItems,
    hasMore,
    isLoading,
    error,
    mutate: refreshRecommendations,
  } = useContentTypeRecommendations('project', {
    userId: user?.id,
    limit,
  });

  // Filter only project type items from recommendations
  const projectRecommendations = recommendationItems.filter((item) => item.type === 'project');

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
              <FolderOpen className="w-5 h-5 text-primary-base" />
              推薦學習計劃
            </CardTitle>
          </CardHeader>
        )}
        <CardContent>
          <div className="space-y-4">
            {Array.from({ length: 3 }, (_, index) => (
              <div key={`project-rec-skeleton-${Date.now()}-${index}`} className="animate-pulse">
                <div className="bg-basic-100 rounded-lg h-36" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!projectRecommendations || projectRecommendations.length === 0) {
    return (
      <Card className={`w-full ${className}`}>
        {showHeader && (
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-lg">
              <FolderOpen className="w-5 h-5 text-primary-base" />
              推薦學習計劃
            </CardTitle>
          </CardHeader>
        )}
        <CardContent>
          <div className="text-center py-8">
            <FolderOpen className="w-12 h-12 text-basic-200 mx-auto mb-4" />
            <p className="text-basic-400 mb-2">暫無推薦計劃</p>
            <p className="text-sm text-basic-300">
              多參與學習活動，我們就能為你推薦適合的學習計劃
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Convert recommendation items to display format
  const ProjectRecommendationCard = ({ item }: { item: RecommendationItem }) => {
    if (item.type !== 'project') {
      return null; // Skip non-project items
    }

    return (
      <Card className="hover:shadow-md transition-shadow duration-200 border border-basic-200">
        <CardContent className="p-4">
          <div className="space-y-3">
            {/* Header */}
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <Link
                  href={`/projects/detail?id=${item.id}`}
                  className="text-lg font-semibold text-basic-black hover:text-primary-base transition-colors line-clamp-1"
                >
                  {item.title}
                </Link>
                <p className="text-sm text-basic-400 mt-1">
                  {new Date(item.createdDate).toLocaleDateString('zh-TW')}
                </p>
              </div>
              {item.reason && (
                <Badge variant="secondary" className="bg-primary-100 text-primary-700 text-xs">
                  {item.reason}
                </Badge>
              )}
            </div>

            {/* Description */}
            <p className="text-basic-600 text-sm line-clamp-2 leading-relaxed">
              {item.description}
            </p>

            {/* Author Info */}
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-primary-100 rounded-full flex items-center justify-center">
                <span className="text-xs font-medium text-primary-600">
                  {item.user.name.charAt(0)}
                </span>
              </div>
              <span className="text-sm text-basic-500">{item.user.name}</span>
              {item.participants && (
                <div className="text-xs text-basic-400 ml-auto">
                  {item.participants} 人參與
                </div>
              )}
            </div>

            {/* Tags */}
            {item.tags && item.tags.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {item.tags.slice(0, 3).map((tag: string) => (
                  <Badge key={`tag-${tag}`} variant="outline" className="text-xs">
                    {tag}
                  </Badge>
                ))}
                {item.tags.length > 3 && (
                  <Badge variant="outline" className="text-xs text-basic-400">
                    +{item.tags.length - 3}
                  </Badge>
                )}
              </div>
            )}

            {/* Status */}
            {item.status && (
              <div className="flex items-center justify-between">
                <Badge
                  variant={item.status === '進行中' ? 'default' : 'secondary'}
                  className="text-xs"
                >
                  {item.status}
                </Badge>
                <Link
                  href={`/projects/detail?id=${item.id}`}
                  className="text-xs text-primary-base hover:text-primary-darker"
                >
                  查看詳情 →
                </Link>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <Card className={`w-full ${className}`}>
      {showHeader && (
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-lg">
              <FolderOpen className="w-5 h-5 text-primary-base" />
              推薦學習計劃
              {projectRecommendations.length > 0 && (
                <span className="text-sm font-normal text-basic-400">
                  ({projectRecommendations.length}+)
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
          {projectRecommendations.length > 0 && (
            <p className="text-sm text-basic-400 flex items-center gap-1">
              <Compass className="w-4 h-4" />
              根據你的學習興趣推薦的計劃
            </p>
          )}
        </CardHeader>
      )}

      <CardContent className="space-y-4">
        {projectRecommendations.map((item) => (
          <ProjectRecommendationCard key={item.id} item={item} />
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

export default ProjectsRecommendationSection;
