import React from 'react';
import {
  Target, TrendingUp, RefreshCw, Sparkles,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card, CardContent, CardHeader, CardTitle,
} from '@/components/ui/card';
import { useContentTypeRecommendations } from '@/services/recommendation';
import { useAuth } from '@/contexts/Auth';
import type { Practice } from '@/services/practice/schema';
import { type RecommendationItem } from '@/services/recommendation/core/schema';
import PracticeCard from './PracticeCard';

interface PracticeRecommendationSectionProps {
  className?: string;
  limit?: number;
  showHeader?: boolean;
}

const PracticeRecommendationSection: React.FC<PracticeRecommendationSectionProps> = ({
  className = '',
  limit = 5,
  showHeader = true,
}) => {
  const { user } = useAuth();

  // Use recommendation service to get practice-specific recommendations
  const {
    items: recommendationItems,
    hasMore,
    isLoading,
    error,
    mutate: refreshRecommendations,
  } = useContentTypeRecommendations('practice', {
    userId: user?.id,
    limit,
  });

  // Filter only practice type items from recommendations
  const practiceRecommendations = recommendationItems.filter((item) => item.type === 'practice');

  const handleRefresh = () => {
    refreshRecommendations();
  };

  const handleEdit = (practice: Practice) => {
    // Navigate to edit page
    window.location.href = `/practice/${practice.id}/edit`;
  };

  const handleDelete = (practice: Practice) => {
    console.log('Delete practice:', practice.id);
    // Handle delete operation
  };

  const handleCheckIn = (practice: Practice) => {
    console.log('Check in practice:', practice.id);
    // Handle check-in operation
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
              <Target className="size-5 text-primary-base" />
              推薦主題實踐
            </CardTitle>
          </CardHeader>
        )}
        <CardContent>
          <div className="space-y-4">
            {Array.from({ length: 3 }, (_, index) => (
              <div key={`practice-rec-skeleton-${Date.now()}-${index}`} className="animate-pulse">
                <div className="h-40 rounded-lg bg-basic-100" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!practiceRecommendations || practiceRecommendations.length === 0) {
    return (
      <Card className={`w-full ${className}`}>
        {showHeader && (
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Target className="size-5 text-primary-base" />
              推薦主題實踐
            </CardTitle>
          </CardHeader>
        )}
        <CardContent>
          <div className="py-8 text-center">
            <Target className="mx-auto mb-4 size-12 text-basic-200" />
            <p className="mb-2 text-basic-400">暫無推薦實踐</p>
            <p className="text-sm text-basic-300">
              多瀏覽和參與實踐活動，我們就能為你提供更精準的推薦
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Convert recommendation items to Practice format for PracticeCard
  const convertToPracticeSchema = (item: RecommendationItem): Practice => {
    if (item.type !== 'practice') {
      throw new Error('Item is not of type practice');
    }
    return {
      id: item.id,
      title: item.title,
      description: item.description,
      contentType: 'course', // Default content type for recommendations
      customContentType: item.category,
      totalAmount: 100,
      currentProgress: 0,
      unit: '天',
      startDate: new Date().toISOString().split('T')[0],
      status: 'active',
      isPublic: true,
      reminderEnabled: false,
      reminderFrequency: 'daily',
      streak: 0,
      practiceAction: item.title,
      resources: [],
      checkIns: [],
      tags: item.tags || [],
      createdAt: item.createdDate,
      updatedAt: item.createdDate,
    };
  };

  return (
    <Card className={`w-full ${className}`}>
      {showHeader && (
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Target className="size-5 text-primary-base" />
              推薦主題實踐
              {practiceRecommendations.length > 0 && (
                <span className="text-sm font-normal text-basic-400">
                  (
                  {practiceRecommendations.length}
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
          {practiceRecommendations.length > 0 && (
            <p className="flex items-center gap-1 text-sm text-basic-400">
              <Sparkles className="size-4" />
              根據你的學習歷程推薦的實踐活動
            </p>
          )}
        </CardHeader>
      )}

      <CardContent className="space-y-4">
        {practiceRecommendations.map((item) => (
          <div key={item.id} className="relative">
            <PracticeCard
              practice={convertToPracticeSchema(item)}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onCheckIn={handleCheckIn}
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

export default PracticeRecommendationSection;
