import React from 'react';
import { Target, BookOpen, LinkIcon } from 'lucide-react';
import { contentTypeOptions } from '@/constants/practice';
import { PathInfo } from '@/services/practice/schema';
import { Button } from '@/shared/ui/button';
import { CustomLink } from '@/shared/ui/custom-link';

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
    <div>
      <div className="p-4">
        <div className="mb-2 flex items-center">
          <div className="mr-2 size-2 rounded-full bg-primary-base" />
          <span className="text-sm text-basic-400">主題實踐</span>
        </div>
        <h3 className="text-lg font-semibold text-basic-600">預覽確認</h3>
      </div>

      <div className="p-4 pt-0">
        <div className="space-y-4">
          {/* 主題實踐概覽卡片 */}
          <div className="overflow-hidden rounded-lg border border-basic-200">
            {/* 主題實踐標題區域 */}
            <div className="bg-primary-palest p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-basic-600">
                    {pathInfo.title || '我的主題實踐'}
                  </h3>
                  <div className="mt-1 flex items-center text-sm text-basic-400">
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
            <div className="p-4">
              {/* 實踐行動 */}
              {practiceAction && (
                <div className="mb-6">
                  <h4 className="mb-3 flex items-center text-sm font-medium text-basic-600">
                    <Target className="mr-2 size-4 text-primary-base" />
                    我要進行實踐的是
                  </h4>
                  <div className="rounded-lg bg-basic-50 p-4">
                    <p className="text-sm leading-relaxed text-basic-600">{practiceAction}</p>
                  </div>
                </div>
              )}

              {/* 標籤顯示 */}
              {selectedTags.length > 0 && (
                <div className="mb-6">
                  <div className="flex flex-wrap gap-2">
                    {selectedTags.map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full border border-primary-light bg-primary-palest px-3 py-1.5 text-xs font-medium text-primary-base"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* 進度資訊 */}
              <div className="mb-6 grid grid-cols-2 gap-4">
                <div className="rounded-lg bg-basic-50 p-4">
                  <div className="mb-2 text-xs text-basic-400">實踐天數</div>
                  <div className="text-lg font-bold text-basic-600">
                    {pathInfo.totalAmount}
                    {' '}
                    天
                  </div>
                </div>

                <div className="rounded-lg bg-basic-50 p-4">
                  <div className="mb-2 text-xs text-basic-400">實踐目標</div>
                  <div className="text-lg font-bold text-basic-600">
                    {formatGoalDisplay()}
                  </div>
                </div>
              </div>

              {/* 資源 */}
              <div>
                <h4 className="mb-3 flex items-center text-sm font-medium text-basic-600">
                  <BookOpen className="mr-2 size-4 text-primary-base" />
                  資源 (
                  {resources.length}
                  )
                </h4>

                {resources.length > 0 ? (
                  <div className="space-y-3">
                    {resources.slice(0, 3).map((resource) => ( // 只顯示前3個
                      <div key={resource.id} className="flex items-center rounded-lg border border-basic-200 bg-white p-3 transition-colors hover:bg-basic-50">
                        {/* 資源圖示 */}
                        <div className="mr-3 flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary-palest">
                          <LinkIcon className="size-4 text-primary-base" />
                        </div>

                        {/* 資源內容 */}
                        <div className="min-w-0 flex-1">
                          {resource.url ? (
                            <CustomLink
                              href={resource.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="group block"
                            >
                              <div className="flex items-center text-sm font-medium text-basic-600 transition-colors group-hover:text-primary-base">
                                <span className="truncate">{resource.name}</span>
                              </div>
                            </CustomLink>
                          ) : (
                            <div className="truncate text-sm font-medium text-basic-600">
                              {resource.name}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                    {resources.length > 3 && (
                      <div className="text-center text-xs text-basic-400">
                        還有
                        {' '}
                        {resources.length - 3}
                        {' '}
                        個資源...
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="rounded-lg border-2 border-dashed border-basic-200 bg-basic-50 py-8 text-center text-sm text-basic-400">
                    尚未添加資源
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* 準備開始提示 */}
          <div className="rounded-lg border border-primary-light bg-primary-palest p-4 text-center">
            <div className="mb-2 text-lg font-semibold text-primary-base">
              準備好開始你的主題實踐了嗎？
            </div>
            <p className="mb-3 text-sm text-basic-600">
              點擊「開始主題實踐」後，你就可以開始追蹤進度、打卡，與目標更近一步！
            </p>
            <div className="text-xs text-basic-400">
              小提醒：你隨時可以在實踐過程中調整設定
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-between p-4 pt-0">
        <Button
          variant="outline"
          onClick={handlePrevStep}
          className="bg-white text-basic-600 border-basic-200 hover:bg-white hover:border-primary-base hover:text-basic-600"
        >
          上一步
        </Button>
        <Button
          onClick={handleCreatePath}
          size="lg"
          className="bg-primary-base text-white hover:bg-primary-base/90 text-base"
        >
          開始主題實踐
        </Button>
      </div>
    </div>
  );
};

export default StepFivePreview;
