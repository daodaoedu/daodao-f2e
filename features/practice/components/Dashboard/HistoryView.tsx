import React from 'react';
import {
  ArrowLeft, Calendar, TrendingUp, Target, Flame,
} from 'lucide-react';
import { Practice } from '@/services/practice/schema';
import { CheckInService } from '@/services/practice/checkIn';
import { Button } from '@/components/ui/button';

interface HistoryViewProps {
  practice: Practice;
  onBack: () => void;
}

const HistoryView: React.FC<HistoryViewProps> = ({
  practice,
  onBack,
}) => {
  // 格式化簽到歷史
  const formattedHistory = CheckInService.formatCheckInHistory(practice);
  const stats = CheckInService.getCheckInStats(practice);

  return (
    <div className="min-h-screen bg-primary-palest">
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        {/* 返回按鈕 */}
        <Button
          variant="ghost"
          onClick={onBack}
          className="text-basic-600 hover:text-basic-800 mb-6 flex items-center transition-colors"
        >
          <ArrowLeft className="mr-2 size-4" />
          <span>返回儀表板</span>
        </Button>

        {/* 標題區域 */}
        <div className="mb-8">
          <h1 className="heading-xl mb-2 text-basic-black">簽到歷史</h1>
          <p className="text-basic-600 body-md">
            「
            {practice.title}
            」的學習歷程記錄
          </p>
        </div>

        {/* 統計卡片 */}
        <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-4">
          <div className="rounded-lg border border-basic-200 bg-white p-6 shadow-sm">
            <div className="flex items-center">
              <Calendar className="mr-3 size-8 text-primary-base" />
              <div>
                <div className="heading-lg text-basic-black">{stats.totalCheckIns}</div>
                <div className="text-basic-600 body-sm">總簽到次數</div>
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-basic-200 bg-white p-6 shadow-sm">
            <div className="flex items-center">
              <TrendingUp className="mr-3 size-8 text-success" />
              <div>
                <div className="heading-lg text-basic-black">{stats.averageProgress}</div>
                <div className="text-basic-600 body-sm">平均進度</div>
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-basic-200 bg-white p-6 shadow-sm">
            <div className="flex items-center">
              <Target className="mr-3 size-8 text-accent" />
              <div>
                <div className="heading-lg text-basic-black">{practice.streak}</div>
                <div className="text-basic-600 body-sm">連續天數</div>
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-basic-200 bg-white p-6 shadow-sm">
            <div className="flex items-center">
              <Flame className="mr-3 size-8 text-orange-500" />
              <div>
                <div className="heading-lg text-basic-black">{stats.lastWeekCheckIns}</div>
                <div className="text-basic-600 body-sm">本週簽到</div>
              </div>
            </div>
          </div>
        </div>

        {/* 簽到歷史列表 */}
        <div className="overflow-hidden rounded-lg border border-basic-200 bg-white shadow-sm">
          <div className="border-b border-basic-200 p-6">
            <h2 className="heading-lg text-basic-black">簽到記錄</h2>
            <p className="text-basic-600 body-sm mt-1">按時間順序顯示您的學習記錄</p>
          </div>

          <div className="divide-y divide-basic-200">
            {formattedHistory.length === 0 ? (
              <div className="p-8 text-center">
                <Calendar className="mx-auto mb-4 size-12 text-basic-300" />
                <h3 className="heading-md mb-2 text-basic-500">尚無簽到記錄</h3>
                <p className="body-md text-basic-400">開始您的第一次學習簽到吧！</p>
              </div>
            ) : (
              formattedHistory.map((entry) => (
                <div
                  key={entry.date}
                  className={`hover:bg-basic-50 p-6 transition-colors ${
                    entry.isToday ? 'bg-primary-palest' : ''
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      {/* 日期和標籤 */}
                      <div className="mb-2 flex items-center space-x-3">
                        <h3 className="heading-sm text-basic-black">
                          {entry.displayDate}
                        </h3>
                        {entry.isToday && (
                          <span className="rounded-full bg-primary-base px-2 py-1 text-xs text-white">
                            今天
                          </span>
                        )}
                        {entry.isRecent && !entry.isToday && (
                          <span className="bg-success-lightest text-success-darker rounded-full px-2 py-1 text-xs">
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
                        <div className="text-basic-700 body-md mb-1">
                          學習進度：
                          <span className="font-medium">
                            +
                            {entry.progress}
                            {' '}
                            {practice.unit}
                          </span>
                        </div>
                        <div className="body-sm text-basic-500">
                          累計進度：
                          {entry.totalProgress}
                          {' '}
                          /
                          {' '}
                          {practice.totalAmount}
                          {' '}
                          {practice.unit}
                        </div>
                      </div>

                      {/* 學習筆記 */}
                      {entry.note && (
                        <div className="mb-3">
                          <div className="text-basic-600 bg-basic-50 body-sm rounded-lg p-3 italic">
                            「
                            {entry.note}
                            」
                          </div>
                        </div>
                      )}

                      {/* 標籤 */}
                      {entry.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {entry.tags.map((tag) => (
                            <span
                              key={tag}
                              className="bg-accent-lightest text-accent-darker rounded-full px-2 py-1 text-xs"
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
                        {Math.round((entry.totalProgress / practice.totalAmount) * 100)}
                        %
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
          <div className="mt-8 rounded-lg border border-basic-200 bg-white p-6 shadow-sm">
            <h2 className="heading-lg mb-4 text-basic-black">學習摘要</h2>
            <div className="text-basic-600 prose prose-sm">
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
