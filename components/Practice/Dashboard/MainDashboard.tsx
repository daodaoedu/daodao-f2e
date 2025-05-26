import React, { useState } from 'react';
import { IoCalendarOutline as Calendar, IoCheckmarkCircleOutline as CheckCircle, IoPencilOutline as Edit, IoCloseOutline as X, IoArrowBackOutline as ArrowLeft, IoBookmarkOutline as Bookmark, IoOpenOutline as ExternalLink, IoAddOutline as Plus } from 'react-icons/io5';
import { Practice } from '../../../services/practice/types';
import { CheckInService } from '../../../services/practice/checkIn';

interface MainDashboardProps {
  practice: Practice;
  onCheckIn: () => void;
  onViewHistory: () => void;
  onBack: () => void;
}

// Toast 通知組件
interface ToastProps {
  visible: boolean;
  message: string;
  onClose: () => void;
}

const Toast: React.FC<ToastProps> = ({ visible, message, onClose }) => {
  if (!visible) return null;

  return (
    <div className="fixed bottom-4 right-4 bg-success text-white px-4 py-2 rounded-lg shadow-lg flex items-center z-50 animate-slide-up">
      <CheckCircle className="h-4 w-4 mr-2" />
      {message}
      <button onClick={onClose} className="ml-3 text-white hover:text-basic-200" type="button">
        <X className="h-4 w-4" />
      </button>
    </div>
  );
};

const MainDashboard: React.FC<MainDashboardProps> = ({
  practice,
  onCheckIn,
  onViewHistory,
  onBack
}) => {
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  // 計算進度百分比
  const progressPercentage = Math.round((practice.currentProgress / practice.totalAmount) * 100);

  // 獲取簽到統計
  const stats = CheckInService.getCheckInStats(practice);
  const canCheckIn = !CheckInService.hasCheckedInToday(practice);
  const todayCheckIn = CheckInService.getTodayCheckIn(practice);

  // 格式化最後簽到日期
  const formatLastCheckIn = () => {
    if (!practice.lastCheckinDate) return '尚未簽到';

    const lastDate = new Date(practice.lastCheckinDate);
    const today = new Date();
    const diffTime = today.getTime() - lastDate.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return '今天';
    if (diffDays === 1) return '昨天';
    if (diffDays < 7) return `${diffDays} 天前`;

    return lastDate.toLocaleDateString('zh-TW', {
      month: 'long',
      day: 'numeric'
    });
  };

  // 處理小目標切換
  const handleGoalToggle = () => {
    // TODO: 實現小目標切換邏輯
    setToastMessage('小目標狀態已更新！');
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  // 獲取內容類型標籤
  const getContentTypeLabel = () => {
    const typeMap: Record<string, string> = {
      book: '📚 書籍',
      video: '🎬 影片',
      articles: '📄 文章',
      podcast: '🎧 Podcast',
      course: '🎓 課程',
      custom: '🎯 自定義'
    };
    return typeMap[practice.contentType] || '📝 學習';
  };

  // 獲取狀態顏色
  const getStatusColor = () => {
    switch (practice.status) {
      case 'completed':
        return 'bg-success text-success-darker';
      case 'paused':
        return 'bg-warning text-warning-darker';
      case 'active':
        return 'bg-primary-base text-white';
      default:
        return 'bg-basic-200 text-basic-600';
    }
  };

  return (
    <div className="min-h-screen bg-primary-palest">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 返回按鈕 */}
        <button
          onClick={onBack}
          type="button"
          className="flex items-center text-basic-600 hover:text-basic-800 mb-6 transition-colors"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          <span>返回實踐列表</span>
        </button>

        {/* 主要內容 */}
        <div className="bg-white rounded-lg shadow-sm border border-basic-200 overflow-hidden">
          {/* 標題區域 */}
          <div className="p-6 border-b border-basic-200">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <h1 className="heading-xl text-basic-black">{practice.title}</h1>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor()}`}>
                    {practice.status === 'active' ? '進行中' :
                     practice.status === 'completed' ? '已完成' :
                     practice.status === 'paused' ? '暫停' : '草稿'}
                  </span>
                </div>

                {practice.description && (
                  <p className="body-md text-basic-600 mb-3">{practice.description}</p>
                )}

                <div className="flex items-center space-x-4 body-sm text-basic-500">
                  <span>{getContentTypeLabel()}</span>
                  <span>•</span>
                  <span>開始於 {new Date(practice.startDate).toLocaleDateString('zh-TW')}</span>
                  {practice.targetDate && (
                    <>
                      <span>•</span>
                      <span>目標 {new Date(practice.targetDate).toLocaleDateString('zh-TW')}</span>
                    </>
                  )}
                </div>
              </div>

              <button className="p-2 text-basic-400 hover:text-basic-600 rounded-lg hover:bg-basic-100 transition-colors" type="button">
                <Edit className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* 進度區域 */}
          <div className="p-6 border-b border-basic-200">
            <div className="mb-4">
              <div className="flex justify-between items-center mb-2">
                <span className="body-sm text-basic-700">學習進度</span>
                <span className="body-sm font-medium text-basic-900">
                  {practice.currentProgress} / {practice.totalAmount} {practice.unit}
                </span>
              </div>

              <div className="w-full bg-basic-200 rounded-full h-3">
                <div
                  className="h-3 rounded-full bg-gradient-to-r from-primary-base to-secondary transition-all duration-500"
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>

              <div className="text-right body-sm text-basic-600 mt-1">
                {progressPercentage}% 完成
              </div>
            </div>

            {/* 統計數據 */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-primary-palest rounded-lg">
                <div className="heading-md text-primary-base">{practice.currentProgress}</div>
                <div className="body-sm text-basic-600">已完成</div>
              </div>

              <div className="text-center p-4 bg-accent-lightest rounded-lg">
                <div className="heading-md text-accent flex items-center justify-center">
                  🔥 {practice.streak}
                </div>
                <div className="body-sm text-basic-600">連續天數</div>
              </div>

              <div className="text-center p-4 bg-success-lightest rounded-lg">
                <div className="heading-md text-success">{stats.totalCheckIns}</div>
                <div className="body-sm text-basic-600">總簽到次數</div>
              </div>

              <div className="text-center p-4 bg-secondary-lightest rounded-lg">
                <div className="heading-md text-secondary">{stats.averageProgress}</div>
                <div className="body-sm text-basic-600">平均進度</div>
              </div>
            </div>
          </div>

          {/* 簽到區域 */}
          <div className="p-6 border-b border-basic-200">
            <div className="bg-gradient-to-r from-primary-palest to-secondary-lightest rounded-lg p-4">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="heading-md text-basic-black mb-1">今日學習</h3>
                  {canCheckIn ? (
                    <p className="body-sm text-basic-600">準備好記錄今天的學習進度了嗎？</p>
                  ) : (
                    <div className="space-y-1">
                      <p className="body-sm text-success-darker font-medium">✅ 今日已簽到</p>
                      {todayCheckIn && (
                        <p className="body-sm text-basic-600">
                          進度：+{todayCheckIn.progress} {practice.unit}
                        </p>
                      )}
                    </div>
                  )}
                  <p className="body-sm text-basic-500 mt-1">
                    上次簽到：{formatLastCheckIn()}
                  </p>
                </div>

                <div className="flex space-x-3">
                  <button
                    onClick={onViewHistory}
                    className="flex items-center space-x-2 px-4 py-2 border border-primary-base text-primary-base rounded-lg hover:bg-primary-palest transition-colors body-sm"
                    type="button"
                  >
                    <Calendar className="h-4 w-4" />
                    <span>歷史記錄</span>
                  </button>

                  <button
                    onClick={onCheckIn}
                    disabled={!canCheckIn}
                    className="flex items-center space-x-2 px-4 py-2 bg-primary-base text-white rounded-lg hover:bg-primary-darker transition-colors body-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    type="button"
                  >
                    <Plus className="h-4 w-4" />
                    <span>{canCheckIn ? '開始簽到' : '已完成簽到'}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* 小目標區域 */}
          {practice.smallGoals.length > 0 && (
            <div className="p-6 border-b border-basic-200">
              <div className="flex justify-between items-center mb-4">
                <h3 className="heading-md text-basic-black">小目標</h3>
                <span className="body-sm text-basic-500">
                  {practice.smallGoals.filter((g) => g.isCompleted).length}/{practice.smallGoals.length} 完成
                </span>
              </div>

              <div className="space-y-3">
                {practice.smallGoals.map((goal) => (
                  <div
                    key={goal.id}
                    className={`flex items-center p-3 rounded-lg cursor-pointer transition-colors ${
                      goal.isCompleted
                        ? 'bg-success-lightest border border-success-light'
                        : 'bg-basic-50 hover:bg-basic-100 border border-basic-200'
                    }`}
                    onClick={() => handleGoalToggle()}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { handleGoalToggle(); } }}
                  >
                    <div
                      className={`flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center mr-3 ${
                        goal.isCompleted
                          ? 'bg-success text-white'
                          : 'bg-basic-300 text-basic-600'
                      }`}
                    >
                      {goal.isCompleted && <CheckCircle className="h-3 w-3" />}
                    </div>

                    <div className="flex-1">
                      <span className={`body-md ${
                        goal.isCompleted
                          ? 'text-basic-600 line-through'
                          : 'text-basic-800'
                      }`}
                      >
                        {goal.content}
                      </span>
                    </div>

                    {goal.isCompleted && (
                      <span className="body-sm text-success-darker font-medium">✓</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 學習資源區域 */}
          {practice.resources.length > 0 && (
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="heading-md text-basic-black">學習資源</h3>
                <button className="body-sm text-primary-base hover:text-primary-darker" type="button">
                  管理資源
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {practice.resources.map((resource) => (
                  <div
                    key={resource.id}
                    className="flex items-center justify-between p-3 bg-basic-50 rounded-lg border border-basic-200 hover:border-basic-300 transition-colors"
                  >
                    <div className="flex items-center flex-1">
                      <Bookmark className="h-4 w-4 text-basic-400 mr-3 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="body-sm font-medium text-basic-800 truncate">
                          {resource.name}
                        </div>
                        {resource.description && (
                          <div className="body-xs text-basic-600 truncate">
                            {resource.description}
                          </div>
                        )}
                      </div>
                    </div>

                    {resource.url && (
                      <a
                        href={resource.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center space-x-1 text-primary-base hover:text-primary-darker body-sm ml-3 flex-shrink-0"
                      >
                        <span>開啟</span>
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* 學習建議 */}
        {practice.checkIns.length > 0 && (
          <div className="mt-6 bg-white rounded-lg shadow-sm border border-basic-200 p-6">
            <h3 className="heading-md text-basic-black mb-4">📈 學習建議</h3>
            <div className="space-y-2">
              {CheckInService.getCheckInSuggestions(practice).map((suggestion) => (
                <div key={suggestion} className="body-sm text-basic-700 p-3 bg-accent-lightest rounded-lg">
                  {suggestion}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Toast 通知 */}
      <Toast
        visible={showToast}
        message={toastMessage}
        onClose={() => setShowToast(false)}
      />
    </div>
  );
};

export default MainDashboard;
