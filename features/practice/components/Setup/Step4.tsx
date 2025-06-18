import React from 'react';
import { Calendar, Target, BookOpen } from 'lucide-react';
import { colors, contentTypeOptions } from '@/constants/practice';
import { PathInfo } from '@/services/practice/schema';
import { Button } from '@/components/atoms/button';

interface StepFivePreviewProps {
  pathInfo: PathInfo;
  handleCreatePath: () => void;
  // 新增的資料
  smallGoals: Array<{id: number, content: string}>;
  resources: Array<{id: number, name: string, url: string}>;
  // 新增：目標設定相關的狀態
  dailyGoalType?: string;
  dailyGoalTime?: number;
  dailyGoalPages?: number;
  customUnit?: string;
  // 新增：標籤
  selectedTags?: string[];
}

const StepFivePreview: React.FC<StepFivePreviewProps> = ({
  pathInfo,
  handleCreatePath,
  smallGoals,
  resources,
  dailyGoalType = 'time',
  dailyGoalTime = 30,
  dailyGoalPages = 10,
  customUnit = '頁',
  selectedTags = []
}) => {
  // 格式化目標顯示
  const formatGoalDisplay = (): string => {
    if (dailyGoalType === 'time') {
      return `每次 ${dailyGoalTime} 分鐘`;
    } else {
      return `每次 ${dailyGoalPages} ${customUnit}`;
    }
  };

  // 取得日期範圍格式字串
  const getDateRange = (): string => {
    if (!pathInfo.targetDate) return '未設定日期';

    const startDate = new Date(pathInfo.targetDate);
    const endDate = new Date(startDate);
    const practiceDays = parseInt(pathInfo.totalAmount, 10) || 7;
    endDate.setDate(startDate.getDate() + practiceDays);

    const formatDateForRange = (date: Date): string => {
      const year = date.getFullYear();
      const month = date.getMonth() + 1;
      const day = date.getDate();
      return `${year}/${month}/${day}`;
    };

    return `${formatDateForRange(startDate)}-${formatDateForRange(endDate)}`;
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="p-4">
        <div className="flex items-center mb-2">
          <div className="w-2 h-2 rounded-full mr-2" style={{ backgroundColor: colors.primary }} />
          <span className="text-sm text-gray-500">主題實踐</span>
        </div>
        <h3 className="text-lg font-semibold" style={{ color: colors.dark }}>預覽確認</h3>
      </div>

      <div className="p-4 pt-0">
        <div className="space-y-4">
          {/* 主題實踐概覽卡片 */}
          <div className="border rounded-lg overflow-hidden">
            {/* 主題實踐標題區域 */}
            <div className="p-4" style={{ backgroundColor: `${colors.primary}10` }}>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="font-semibold text-lg" style={{ color: colors.dark }}>
                    {pathInfo.title || "我的主題實踐"}
                  </h3>
                  <div className="flex items-center mt-1 text-sm text-gray-600">
                    <BookOpen className="h-4 w-4 mr-1" />
                    <span>
                      {contentTypeOptions.find((option) => option.id === pathInfo.contentType)?.label || "書籍"}
                    </span>
                    <span className="mx-2">•</span>
                    <Calendar className="h-4 w-4 mr-1" />
                    <span>{getDateRange()}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* 主題實踐詳細資訊 */}
            <div className="p-4">
              {/* 實踐行動 */}
              {smallGoals.length > 0 && (
                <div className="mb-4">
                  <h4 className="text-sm font-medium mb-2 flex items-center">
                    <Target className="h-4 w-4 mr-1" style={{ color: colors.primary }} />
                    我要進行實踐的是
                    <div className="ml-2 flex-1">
                      {smallGoals.map((goal, index) => (
                        <span
                          key={goal.id}
                          className="underline decoration-2"
                          style={{ textDecorationColor: colors.primary }}
                        >
                          {goal.content}
                          {index < smallGoals.length - 1 && ', '}
                        </span>
                      ))}
                    </div>
                  </h4>
                </div>
              )}

              {/* 標籤顯示 */}
              {selectedTags.length > 0 && (
                <div className="mb-4">
                  <h4 className="text-sm font-medium mb-2 flex items-center">
                    <div className="w-4 h-4 mr-1 flex items-center justify-center">
                      <span className="text-xs" style={{ color: colors.primary }}>#</span>
                    </div>
                    標籤
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedTags.map((tag) => (
                      <span
                        key={tag}
                        className="px-2 py-1 rounded-full text-xs font-medium"
                        style={{
                          backgroundColor: `${colors.primary}15`,
                          color: colors.primary,
                          border: `1px solid ${colors.primary}30`
                        }}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* 進度資訊 */}
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="p-3 bg-gray-50 rounded-md">
                  <div className="text-xs text-gray-500 mb-1">實踐天數</div>
                  <div className="font-semibold">
                    {pathInfo.totalAmount} 天
                  </div>
                </div>

                <div className="p-3 bg-gray-50 rounded-md">
                  <div className="text-xs text-gray-500 mb-1">實踐目標</div>
                  <div className="font-semibold">
                    {formatGoalDisplay()}
                  </div>
                </div>
              </div>

              {/* 資源 */}
              <div className="mb-4">
                <h4 className="text-sm font-medium mb-2 flex items-center">
                  <BookOpen className="h-4 w-4 mr-1" style={{ color: colors.primary }} />
                  資源 ({resources.length})
                </h4>

                {resources.length > 0 ? (
                  <div className="space-y-2">
                    {resources.slice(0, 3).map((resource) => ( // 只顯示前3個
                      <div key={resource.id} className="p-2 bg-gray-50 rounded-md">
                        <div className="font-medium text-sm">{resource.name}</div>
                        {resource.url && (
                          <div className="text-xs text-gray-500 truncate">{resource.url}</div>
                        )}
                      </div>
                    ))}
                    {resources.length > 3 && (
                      <div className="text-xs text-gray-500 text-center">
                        還有 {resources.length - 3} 個資源...
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-2 text-xs text-gray-500 bg-gray-50 rounded-md">
                    新增資源將能幫助有相同興趣的島友們
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* 準備開始提示 */}
          <div className="p-4 rounded-lg text-center" style={{ backgroundColor: `${colors.primary}05`, border: `1px solid ${colors.primary}30` }}>
            <div className="text-lg font-semibold mb-2" style={{ color: colors.primary }}>
              🚀 準備好開始你的主題實踐了嗎？
            </div>
            <p className="text-sm text-gray-600 mb-3">
              點擊「開始主題實踐」後，你就可以開始追蹤進度、打卡，與目標更近一步！
            </p>
            <div className="text-xs text-gray-500">
              💡 小提醒：你隨時可以在實踐過程中調整設定
            </div>
          </div>
        </div>
      </div>

      <div className="p-4 pt-0 flex justify-end">
        <Button
          onClick={handleCreatePath}
          size="lg"
          className="text-base"
        >
          🎯 開始主題實踐
        </Button>
      </div>
    </div>
  );
};

export default StepFivePreview;
