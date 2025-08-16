import React, { useState } from 'react';
import { Practice } from '@/services/practice/schema';
import { CheckInService } from '@/services/practice/checkIn';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  TrendingUp, Clock, Target, Lightbulb, ChevronDown, ChevronUp,
} from 'lucide-react';

interface LearningInsightsProps {
  practices: Practice[];
}

const LearningInsights: React.FC<LearningInsightsProps> = ({ practices }) => {
  const [visibleSuggestionsCount, setVisibleSuggestionsCount] = useState(3);

  // 過濾有打卡記錄的實踐
  const activePractices = practices.filter((p) => p.checkIns && p.checkIns.length > 0);

  if (activePractices.length === 0) {
    return null;
  }

  // 收集所有建議
  const allSuggestions = activePractices.flatMap((practice) => CheckInService.getCheckInSuggestions(practice).map((suggestion) => ({
    suggestion,
    practiceTitle: practice.title,
    practiceId: practice.id,
  })));

  // 計算總體統計
  const totalCheckIns = activePractices.reduce((sum, p) => sum + (p.checkIns?.length || 0), 0);
  const averageProgress = activePractices.reduce((sum, p) => {
    const progress = (p.currentProgress / p.totalAmount) * 100;
    return sum + progress;
  }, 0) / activePractices.length;

  const activeStreaks = activePractices.filter((p) => p.streak > 0).length;
  const thisWeekCheckIns = activePractices.reduce((sum, p) => {
    const stats = CheckInService.getCheckInStats(p);
    return sum + stats.lastWeekCheckIns;
  }, 0);

  if (allSuggestions.length === 0) {
    return null;
  }

  const getInsightIcon = (suggestion: string) => {
    if (suggestion.includes('進度') || suggestion.includes('快要完成')) {
      return <Target className="size-4" />;
    }
    if (suggestion.includes('時間') || suggestion.includes('簽到')) {
      return <Clock className="size-4" />;
    }
    if (suggestion.includes('連續') || suggestion.includes('表現優秀')) {
      return <TrendingUp className="size-4" />;
    }
    return <Lightbulb className="size-4" />;
  };

  const getInsightColor = (suggestion: string) => {
    if (suggestion.includes('表現優秀') || suggestion.includes('快要完成')) {
      return 'bg-success/10 text-success border-success/20';
    }
    if (suggestion.includes('建議') || suggestion.includes('考慮')) {
      return 'bg-tips/10 text-tips border-tips/20';
    }
    if (suggestion.includes('放緩') || suggestion.includes('較少')) {
      return 'bg-orange-50 text-orange-600 border-orange-200';
    }
    return 'bg-primary/10 text-primary border-primary/20';
  };

  return (
    <Card className="mb-6 rounded-2xl border border-basic-100 bg-basic-white shadow-sm">
      <CardContent className="p-4 sm:p-6">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="flex size-8 items-center justify-center rounded-full bg-primary-lightest">
              <TrendingUp className="size-4 text-primary-base" />
            </div>
            <h3 className="text-lg font-semibold text-basic-black">學習洞察</h3>
          </div>
          <Badge className="bg-primary-lightest text-xs text-primary-darker">
            AI 建議
          </Badge>
        </div>

        {/* 統計摘要 */}
        <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="bg-basic-50 rounded-lg p-3 text-center">
            <div className="text-lg font-semibold text-basic-black">{activePractices.length}</div>
            <div className="text-xs text-basic-300">活躍實踐</div>
          </div>
          <div className="bg-basic-50 rounded-lg p-3 text-center">
            <div className="text-lg font-semibold text-basic-black">{totalCheckIns}</div>
            <div className="text-xs text-basic-300">總打卡次數</div>
          </div>
          <div className="bg-basic-50 rounded-lg p-3 text-center">
            <div className="text-lg font-semibold text-basic-black">
              {Math.round(averageProgress)}
              %
            </div>
            <div className="text-xs text-basic-300">平均進度</div>
          </div>
          <div className="bg-basic-50 rounded-lg p-3 text-center">
            <div className="text-lg font-semibold text-basic-black">{activeStreaks}</div>
            <div className="text-xs text-basic-300">連續中</div>
          </div>
        </div>

        {/* 學習建議 */}
        <div className="space-y-3">
          <h4 className="mb-3 text-sm font-medium text-basic-400">個人化建議</h4>

          {/* 顯示當前可見的建議 */}
          {allSuggestions.slice(0, visibleSuggestionsCount).map((item) => (
            <div
              key={`${item.practiceId}-${item.suggestion.slice(0, 20)}`}
              className={`flex items-start space-x-3 rounded-lg border p-3 ${getInsightColor(item.suggestion)}`}
            >
              <div className="mt-0.5 shrink-0">
                {getInsightIcon(item.suggestion)}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium">
                  {item.suggestion}
                </p>
                <p className="mt-1 text-xs opacity-75">
                  來自「
                  {item.practiceTitle}
                  」
                </p>
              </div>
            </div>
          ))}

          {/* 查看更多/收起按鈕 */}
          {allSuggestions.length > 3 && (
            <div className="pt-3 text-center">
              {visibleSuggestionsCount < allSuggestions.length ? (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setVisibleSuggestionsCount((prev) => Math.min(prev + 3, allSuggestions.length))}
                  className="text-primary hover:text-primary-darker"
                >
                  <span>
                    查看更多建議 (
                    {Math.min(3, allSuggestions.length - visibleSuggestionsCount)}
                    {' '}
                    個)
                  </span>
                  <ChevronDown className="ml-1 size-4" />
                </Button>
              ) : (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setVisibleSuggestionsCount(3)}
                  className="hover:text-basic-600 text-basic-400"
                >
                  <span>收起建議</span>
                  <ChevronUp className="ml-1 size-4" />
                </Button>
              )}
            </div>
          )}
        </div>

        {/* 本週表現 */}
        {thisWeekCheckIns > 0 && (
          <div className="mt-4 border-t border-basic-100 pt-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-basic-400">本週學習活躍度</span>
              <div className="flex items-center space-x-2">
                <div className="h-2 w-16 overflow-hidden rounded-full bg-basic-200">
                  <div className={`h-full rounded-full bg-primary-base transition-all duration-300 ${
                    thisWeekCheckIns >= 7 ? 'w-full'
                      : thisWeekCheckIns >= 6 ? 'w-[86%]'
                        : thisWeekCheckIns >= 5 ? 'w-[71%]'
                          : thisWeekCheckIns >= 4 ? 'w-[57%]'
                            : thisWeekCheckIns >= 3 ? 'w-[43%]'
                              : thisWeekCheckIns >= 2 ? 'w-[29%]'
                                : thisWeekCheckIns >= 1 ? 'w-[14%]' : 'w-0'
                  }`}
                  />
                </div>
                <span className="text-sm font-medium text-basic-black">
                  {thisWeekCheckIns}
                  /7
                </span>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default LearningInsights;
