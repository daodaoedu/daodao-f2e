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
      return <Target className="h-4 w-4" />;
    }
    if (suggestion.includes('時間') || suggestion.includes('簽到')) {
      return <Clock className="h-4 w-4" />;
    }
    if (suggestion.includes('連續') || suggestion.includes('表現優秀')) {
      return <TrendingUp className="h-4 w-4" />;
    }
    return <Lightbulb className="h-4 w-4" />;
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
    <Card className="bg-basic-white rounded-2xl shadow-sm border border-basic-100 mb-6">
      <CardContent className="p-4 sm:p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-full bg-primary-lightest flex items-center justify-center">
              <TrendingUp className="h-4 w-4 text-primary-base" />
            </div>
            <h3 className="text-lg font-semibold text-basic-black">學習洞察</h3>
          </div>
          <Badge className="bg-primary-lightest text-primary-darker text-xs">
            AI 建議
          </Badge>
        </div>

        {/* 統計摘要 */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
          <div className="text-center p-3 bg-basic-50 rounded-lg">
            <div className="text-lg font-semibold text-basic-black">{activePractices.length}</div>
            <div className="text-xs text-basic-300">活躍實踐</div>
          </div>
          <div className="text-center p-3 bg-basic-50 rounded-lg">
            <div className="text-lg font-semibold text-basic-black">{totalCheckIns}</div>
            <div className="text-xs text-basic-300">總打卡次數</div>
          </div>
          <div className="text-center p-3 bg-basic-50 rounded-lg">
            <div className="text-lg font-semibold text-basic-black">
              {Math.round(averageProgress)}
              %
            </div>
            <div className="text-xs text-basic-300">平均進度</div>
          </div>
          <div className="text-center p-3 bg-basic-50 rounded-lg">
            <div className="text-lg font-semibold text-basic-black">{activeStreaks}</div>
            <div className="text-xs text-basic-300">連續中</div>
          </div>
        </div>

        {/* 學習建議 */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-basic-400 mb-3">個人化建議</h4>

          {/* 顯示當前可見的建議 */}
          {allSuggestions.slice(0, visibleSuggestionsCount).map((item) => (
            <div
              key={`${item.practiceId}-${item.suggestion.slice(0, 20)}`}
              className={`flex items-start space-x-3 p-3 rounded-lg border ${getInsightColor(item.suggestion)}`}
            >
              <div className="flex-shrink-0 mt-0.5">
                {getInsightIcon(item.suggestion)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium">
                  {item.suggestion}
                </p>
                <p className="text-xs opacity-75 mt-1">
                  來自「
                  {item.practiceTitle}
                  」
                </p>
              </div>
            </div>
          ))}

          {/* 查看更多/收起按鈕 */}
          {allSuggestions.length > 3 && (
            <div className="text-center pt-3">
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
                  <ChevronDown className="h-4 w-4 ml-1" />
                </Button>
              ) : (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setVisibleSuggestionsCount(3)}
                  className="text-basic-400 hover:text-basic-600"
                >
                  <span>收起建議</span>
                  <ChevronUp className="h-4 w-4 ml-1" />
                </Button>
              )}
            </div>
          )}
        </div>

        {/* 本週表現 */}
        {thisWeekCheckIns > 0 && (
          <div className="mt-4 pt-4 border-t border-basic-100">
            <div className="flex items-center justify-between">
              <span className="text-sm text-basic-400">本週學習活躍度</span>
              <div className="flex items-center space-x-2">
                <div className="w-16 h-2 bg-basic-200 rounded-full overflow-hidden">
                  <div className={`h-full bg-primary-base rounded-full transition-all duration-300 ${
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
