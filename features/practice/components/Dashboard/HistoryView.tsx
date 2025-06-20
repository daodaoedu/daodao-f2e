import React from 'react';
import { ArrowLeft, Calendar, TrendingUp, Target, Flame } from 'lucide-react';
import { Practice } from '@/services/practice/schema';
import { CheckInService } from '@/services/practice/checkIn';
import { Button } from '@/components/ui/button';

interface HistoryViewProps {
  practice: Practice;
  onBack: () => void;
}

const HistoryView: React.FC<HistoryViewProps> = ({
  practice,
  onBack
}) => {
  // 格式化簽到歷史
  const formattedHistory = CheckInService.formatCheckInHistory(practice);
  const stats = CheckInService.getCheckInStats(practice);

  return (
    <div className="min-h-screen bg-primary-palest">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 返回按鈕 */}
        <Button
          variant="ghost"
          onClick={onBack}
          className="flex items-center text-basic-600 hover:text-basic-800 mb-6 transition-colors"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          <span>返回儀表板</span>
        </Button>

        {/* 標題區域 */}
        <div className="mb-8">
          <h1 className="heading-xl text-basic-black mb-2">簽到歷史</h1>
          <p className="body-md text-basic-600">
            「{practice.title}」的學習歷程記錄
          </p>
        </div>

        {/* 統計卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm border border-basic-200 p-6">
            <div className="flex items-center">
              <Calendar className="h-8 w-8 text-primary-base mr-3" />
              <div>
                <div className="heading-lg text-basic-black">{stats.totalCheckIns}</div>
                <div className="body-sm text-basic-600">總簽到次數</div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-basic-200 p-6">
            <div className="flex items-center">
              <TrendingUp className="h-8 w-8 text-success mr-3" />
              <div>
                <div className="heading-lg text-basic-black">{stats.averageProgress}</div>
                <div className="body-sm text-basic-600">平均進度</div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-basic-200 p-6">
            <div className="flex items-center">
              <Target className="h-8 w-8 text-accent mr-3" />
              <div>
                <div className="heading-lg text-basic-black">{practice.streak}</div>
                <div className="body-sm text-basic-600">連續天數</div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-basic-200 p-6">
            <div className="flex items-center">
              <Flame className="h-8 w-8 mr-3 text-orange-500" />
              <div>
                <div className="heading-lg text-basic-black">{stats.lastWeekCheckIns}</div>
                <div className="body-sm text-basic-600">本週簽到</div>
              </div>
            </div>
          </div>
        </div>

        {/* 簽到歷史列表 */}
        <div className="bg-white rounded-lg shadow-sm border border-basic-200 overflow-hidden">
          <div className="p-6 border-b border-basic-200">
            <h2 className="heading-lg text-basic-black">簽到記錄</h2>
            <p className="body-sm text-basic-600 mt-1">按時間順序顯示您的學習記錄</p>
          </div>

          <div className="divide-y divide-basic-200">
            {formattedHistory.length === 0 ? (
              <div className="p-8 text-center">
                <Calendar className="h-12 w-12 text-basic-300 mx-auto mb-4" />
                <h3 className="heading-md text-basic-500 mb-2">尚無簽到記錄</h3>
                <p className="body-md text-basic-400">開始您的第一次學習簽到吧！</p>
              </div>
            ) : (
              formattedHistory.map((entry) => (
                <div
                  key={entry.date}
                  className={`p-6 hover:bg-basic-50 transition-colors ${
                    entry.isToday ? 'bg-primary-palest' : ''
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      {/* 日期和標籤 */}
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="heading-sm text-basic-black">
                          {entry.displayDate}
                        </h3>
                        {entry.isToday && (
                          <span className="px-2 py-1 bg-primary-base text-white rounded-full text-xs">
                            今天
                          </span>
                        )}
                        {entry.isRecent && !entry.isToday && (
                          <span className="px-2 py-1 bg-success-lightest text-success-darker rounded-full text-xs">
                            最近
                          </span>
                        )}
                        {entry.moodEmoji && (
                          <span className="text-lg" title={`心情：${entry.mood}`}>
                            {entry.moodEmoji}
                          </span>
                        )}
                      </div>

                      {/* 進度資訊 */}
                      <div className="mb-3">
                        <div className="body-md text-basic-700 mb-1">
                          學習進度：<span className="font-medium">+{entry.progress} {practice.unit}</span>
                        </div>
                        <div className="body-sm text-basic-500">
                          累計進度：{entry.totalProgress} / {practice.totalAmount} {practice.unit}
                        </div>
                      </div>

                      {/* 學習筆記 */}
                      {entry.note && (
                        <div className="mb-3">
                          <div className="body-sm text-basic-600 bg-basic-50 rounded-lg p-3 italic">
                            「{entry.note}」
                          </div>
                        </div>
                      )}

                      {/* 標籤 */}
                      {entry.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {entry.tags.map((tag) => (
                            <span
                              key={tag}
                              className="px-2 py-1 bg-accent-lightest text-accent-darker rounded-full text-xs"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* 進度百分比 */}
                    <div className="ml-6 text-right">
                      <div className="heading-sm text-basic-black">
                        {Math.round((entry.totalProgress / practice.totalAmount) * 100)}%
                      </div>
                      <div className="body-sm text-basic-500">完成度</div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* 學習摘要 */}
        {formattedHistory.length > 0 && (
          <div className="mt-8 bg-white rounded-lg shadow-sm border border-basic-200 p-6">
            <h2 className="heading-lg text-basic-black mb-4">學習摘要</h2>
            <div className="prose prose-sm text-basic-600">
              <pre className="whitespace-pre-wrap font-sans">
                {CheckInService.generateCheckInSummary(practice)}
              </pre>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default HistoryView;
