import React from 'react';
import { Check, Calendar, Target, BookOpen, Bell, Users } from 'lucide-react';
import { colors, contentTypeOptions, getUnitType } from '@/constants/practice';
import { PathInfo } from '@/services/modules/practice/schema';

interface StepFivePreviewProps {
  pathInfo: PathInfo;
  handleCreatePath: () => void;
  // 新增的資料
  smallGoals: Array<{id: number, content: string}>;
  resources: Array<{id: number, name: string, url: string}>;
}

const StepFivePreview: React.FC<StepFivePreviewProps> = ({
  pathInfo,
  handleCreatePath,
  smallGoals,
  resources
}) => {
  // 計算進度百分比
  const progressPercentage = (): number => {
    const current = parseInt(pathInfo.currentProgress, 10) || 0;
    const total = parseInt(pathInfo.totalAmount, 10) || 1;
    return Math.min(100, Math.round((current / total) * 100));
  };

  // 計算目標日期距今天數
  const getDaysUntilTarget = (): number => {
    if (!pathInfo.targetDate) return 0;
    const today = new Date();
    const target = new Date(pathInfo.targetDate);
    const diffTime = target.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="p-4">
        <div className="flex items-center mb-2">
          <div className="w-2 h-2 rounded-full mr-2" style={{ backgroundColor: colors.primary }} />
          <span className="text-sm text-gray-500">主題實踐</span>
        </div>
        <h3 className="text-lg font-semibold" style={{ color: colors.dark }}>預覽確認</h3>
        <p className="text-sm text-gray-500 mt-1">
          檢查你的主題實踐設定，確認無誤後即可開始學習之旅
        </p>
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
                    <span>{getDaysUntilTarget()} 天後完成</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-500">完成度</div>
                  <div className="text-xl font-bold" style={{ color: colors.primary }}>
                    {progressPercentage()}%
                  </div>
                </div>
              </div>
            </div>

            {/* 主題實踐詳細資訊 */}
            <div className="p-4">
              {/* 小目標 */}
              {smallGoals.length > 0 && (
                <div className="mb-4">
                  <h4 className="text-sm font-medium mb-2 flex items-center">
                    <Target className="h-4 w-4 mr-1" style={{ color: colors.primary }} />
                    小目標
                  </h4>
                  <div className="space-y-2">
                    {smallGoals.map((goal) => (
                      <div
                        key={goal.id}
                        className="flex items-center p-2 rounded-md"
                        style={{ backgroundColor: `${colors.primary}10` }}
                      >
                        <div
                          className="w-2 h-2 rounded-full mr-2"
                          style={{ backgroundColor: colors.primary }}
                        />
                        <span className="text-sm">{goal.content}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 進度資訊 */}
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="p-3 bg-gray-50 rounded-md">
                  <div className="text-xs text-gray-500 mb-1">目前進度</div>
                  <div className="font-semibold">
                    {pathInfo.currentProgress} / {pathInfo.totalAmount} {getUnitType(pathInfo.contentType)}
                  </div>
                </div>

                <div className="p-3 bg-gray-50 rounded-md">
                  <div className="text-xs text-gray-500 mb-1">目標日期</div>
                  <div className="font-semibold">
                    {pathInfo.targetDate ? new Date(pathInfo.targetDate).toLocaleDateString('zh-TW') : '未設定'}
                  </div>
                </div>
              </div>

              {/* 進度條 */}
              <div className="mb-4">
                <div className="flex justify-between text-xs text-gray-500 mb-1">
                  <span>學習進度</span>
                  <span>{pathInfo.currentProgress}/{pathInfo.totalAmount}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="h-2 rounded-full transition-all duration-300"
                    style={{
                      width: `${progressPercentage()}%`,
                      backgroundColor: colors.primary
                    }}
                  />
                </div>
              </div>

              {/* 學習資源 */}
              <div className="mb-4">
                <h4 className="text-sm font-medium mb-2 flex items-center">
                  <BookOpen className="h-4 w-4 mr-1" style={{ color: colors.primary }} />
                  學習資源 ({resources.length})
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
                    尚未添加學習資源
                  </div>
                )}
              </div>

              {/* 提醒設定 */}
              <div className="mb-4">
                <h4 className="text-sm font-medium mb-2 flex items-center">
                  <Bell className="h-4 w-4 mr-1" style={{ color: colors.primary }} />
                  提醒設定
                </h4>
                <div className="p-2 bg-gray-50 rounded-md text-sm">
                  {pathInfo.reminderEnabled ? (
                    <div className="flex items-center text-green-600">
                      <Check className="h-4 w-4 mr-1" />
                      <span>
                        已啟用 - {
                          pathInfo.reminderFrequency === 'daily' ? '每日提醒' :
                          pathInfo.reminderFrequency === 'weekly' ? '每週提醒' :
                          pathInfo.reminderFrequency === 'every-other-day' ? '每兩天一次' :
                          pathInfo.reminderFrequency === 'twice-weekly' ? '每週兩次' :
                          '自訂頻率'
                        }
                      </span>
                    </div>
                  ) : (
                    <div className="text-gray-500">未啟用提醒</div>
                  )}
                </div>
              </div>

              {/* 其他設定 */}
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="flex items-center">
                  <Users className="h-4 w-4 mr-1" style={{ color: pathInfo.isPublic ? colors.primary : '#gray' }} />
                  <span className={pathInfo.isPublic ? 'text-green-600' : 'text-gray-500'}>
                    {pathInfo.isPublic ? '公開分享' : '私人學習'}
                  </span>
                </div>
              </div>

              {/* 動機描述 */}
              {(pathInfo.motivationType || pathInfo.customMotivation) && (
                <div
                  className="mt-4 p-3 rounded-lg border-l-4"
                  style={{ backgroundColor: `${colors.secondary}15`, borderColor: colors.secondary }}
                >
                  <h4 className="text-sm font-medium mb-1">學習動機</h4>
                  <p className="text-sm text-gray-700">
                    {pathInfo.customMotivation || '為了個人成長而學習'}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* 準備開始提示 */}
          <div className="p-4 rounded-lg text-center" style={{ backgroundColor: `${colors.primary}05`, border: `1px solid ${colors.primary}30` }}>
            <div className="text-lg font-semibold mb-2" style={{ color: colors.primary }}>
              🚀 準備好開始你的學習之旅了嗎？
            </div>
            <p className="text-sm text-gray-600 mb-3">
              點擊「開始主題實踐」後，你就可以開始追蹤進度、打卡學習，並與你的目標更近一步！
            </p>
            <div className="text-xs text-gray-500">
              💡 小提醒：你隨時可以在學習過程中調整設定
            </div>
          </div>
        </div>
      </div>

      <div className="p-4 pt-0 flex justify-end">
        <button
          type="button"
          className="rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-opacity-50 py-3 px-6 text-base text-white"
          style={{ backgroundColor: colors.primary, borderColor: colors.primary }}
          onClick={handleCreatePath}
        >
          🎯 開始主題實踐
        </button>
      </div>
    </div>
  );
};

export default StepFivePreview;
