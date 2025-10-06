import React from 'react';
import { Target, BookOpen, LinkIcon } from 'lucide-react';
import { contentTypeOptions } from '@/constants/practice';
import { PathInfo } from '@/services/practice/schema';
import { Button } from '@/shared/ui/button';
import Link from 'next/link';

interface StepFivePreviewProps {
  pathInfo: PathInfo;
  handleCreatePath: () => void;
  handlePrevStep?: () => void;
  // 新增的資料
  practiceAction: string;
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
  handlePrevStep,
  practiceAction,
  resources,
  dailyGoalType = 'time',
  dailyGoalTime = 30,
  dailyGoalPages = 10,
  customUnit = '頁',
  selectedTags = [],
}) => {
  // 格式化目標顯示
  const formatGoalDisplay = (): string => {
    if (dailyGoalType === 'time') {
      return `每次 ${dailyGoalTime} 分鐘`;
    }
    return `每次 ${dailyGoalPages} ${customUnit}`;
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
    <div className="overflow-hidden rounded-lg bg-white shadow-md">
      <div className="p-4">
        <div className="mb-2 flex items-center">
          <div className="mr-2 size-2 rounded-full bg-primary" />
          <span className="text-sm text-gray-500">主題實踐</span>
        </div>
        <h3 className="text-lg font-semibold text-gray-900">預覽確認</h3>
      </div>

      <div className="p-4 pt-0">
        <div className="space-y-4">
          {/* 主題實踐概覽卡片 */}
          <div className="overflow-hidden rounded-lg border">
            {/* 主題實踐標題區域 */}
            <div className="bg-primary/10 p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {pathInfo.title || '我的主題實踐'}
                  </h3>
                  <div className="mt-1 flex items-center text-sm text-gray-600">
                    <BookOpen className="mr-1 size-4" />
                    <span>
                      {contentTypeOptions.find((option) => option.id === pathInfo.contentType)?.label || '書籍'}
                    </span>
                    <span className="mx-2">•</span>
                    <span>{getDateRange()}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* 主題實踐詳細資訊 */}
            <div className="mt-3">
              {/* 實踐行動 */}
              {practiceAction && (
                <div className="mb-4">
                  <h4 className="mb-2 flex items-center text-sm font-medium">
                    <Target className="mr-1 size-4 text-primary" />
                    我要進行實踐的是
                  </h4>
                  <div className="rounded-md bg-gray-50 p-3">
                    <p className="text-sm text-gray-700">{practiceAction}</p>
                  </div>
                </div>
              )}

              {/* 標籤顯示 */}
              {selectedTags.length > 0 && (
                <div className="mb-4">
                  <div className="flex flex-wrap gap-2">
                    {selectedTags.map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full border border-primary/20 bg-primary/5 px-2 py-1 text-xs font-medium text-primary"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* 進度資訊 */}
              <div className="mb-4 grid grid-cols-2 gap-4">
                <div className="rounded-md bg-gray-50 p-3">
                  <div className="mb-1 text-xs text-gray-500">實踐天數</div>
                  <div className="font-semibold">
                    {pathInfo.totalAmount}
                    {' '}
                    天
                  </div>
                </div>

                <div className="rounded-md bg-gray-50 p-3">
                  <div className="mb-1 text-xs text-gray-500">實踐目標</div>
                  <div className="font-semibold">
                    {formatGoalDisplay()}
                  </div>
                </div>
              </div>

              {/* 資源 */}
              <div className="mb-4">
                <h4 className="mb-2 flex items-center text-sm font-medium">
                  <BookOpen className="mr-1 size-4 text-primary" />
                  資源 (
                  {resources.length}
                  )
                </h4>

                {resources.length > 0 ? (
                  <div className="space-y-2">
                    {resources.slice(0, 3).map((resource) => ( // 只顯示前3個
                      <div key={resource.id} className="flex items-center rounded-lg bg-gray-50 p-3">
                        {/* 資源圖示 */}
                        <div className="mr-3 shrink-0">
                          <div className="mr-3 flex size-8 shrink-0 items-center justify-center rounded-lg">
                            <LinkIcon className="size-4 text-primary" />
                          </div>
                        </div>

                        {/* 資源內容 */}
                        <div className="min-w-0 flex-1">
                          {resource.url ? (
                            <Link
                              href={resource.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="group block"
                            >
                              <div className="flex items-center text-sm font-medium text-gray-900 transition-colors group-hover:text-primary">
                                <span className="truncate">{resource.name}</span>
                              </div>
                            </Link>
                          ) : (
                            <div className="truncate text-sm font-medium text-gray-900">
                              {resource.name}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                    {resources.length > 3 && (
                      <div className="text-center text-xs text-gray-500">
                        還有
                        {' '}
                        {resources.length - 3}
                        {' '}
                        個資源...
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="rounded-md bg-gray-50 py-2 text-center text-xs text-gray-500">
                    新增資源將能幫助有相同興趣的島友們
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* 準備開始提示 */}
          <div className="rounded-lg border border-primary/20 bg-primary/5 p-4 text-center">
            <div className="mb-2 text-lg font-semibold text-primary">
              準備好開始你的主題實踐了嗎？
            </div>
            <p className="mb-3 text-sm text-gray-600">
              點擊「開始主題實踐」後，你就可以開始追蹤進度、打卡，與目標更近一步！
            </p>
            <div className="text-xs text-gray-500">
              小提醒：你隨時可以在實踐過程中調整設定
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-between p-4 pt-0">
        <Button
          variant="outline"
          onClick={handlePrevStep}
        >
          上一步
        </Button>
        <Button
          onClick={handleCreatePath}
          size="lg"
          className="text-base"
        >
          開始主題實踐
        </Button>
      </div>
    </div>
  );
};

export default StepFivePreview;
