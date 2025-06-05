import React, { useState } from 'react';
import { CheckCircle, Edit, X, ArrowLeft, Bookmark, ExternalLink, Plus } from 'lucide-react';
import { Practice } from '@/services/modules/practice/schema';
import { CheckInService } from '@/services/modules/practice/checkIn';
import { Button } from '@/components/atoms/button';
import TagList from '../Shared/TagList';

interface MainDashboardProps {
  practice: Practice;
  onCheckIn: () => void;
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
  onBack
}) => {
  const [showToast, setShowToast] = useState(false);

  // 計算進度百分比
  const progressPercentage = Math.round((practice.currentProgress / practice.totalAmount) * 100);

  // 獲取簽到統計
  const stats = CheckInService.getCheckInStats(practice);
  const canCheckIn = !CheckInService.hasCheckedInToday(practice);
  const todayCheckIn = CheckInService.getTodayCheckIn(practice);

  // 格式化最後打卡日期
  const formatLastCheckIn = () => {
    if (!practice.lastCheckinDate) return '尚未打卡';

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

  // 獲取每日目標顯示
  const getDailyGoalDisplay = () => {
    if (!practice.dailyGoal) {
      return '--';
    }

    const { type, timeMinutes, amount, unit } = practice.dailyGoal;

    if (type === 'time' && timeMinutes) {
      return `${timeMinutes} 分鐘`;
    } else if (type === 'completion' && amount && unit) {
      return `${amount} ${unit}`;
    }

    return '--';
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
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 返回按鈕 */}
        <Button
          variant="ghost"
          onClick={onBack}
          className="flex items-center text-muted-foreground hover:text-foreground mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          <span>返回實踐列表</span>
        </Button>

        {/* 主要內容 */}
        <div className="bg-card rounded-lg shadow-sm border border-border overflow-hidden">
          {/* 標題區域 */}
          <div className="p-6 border-b border-border">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <h1 className="text-2xl font-bold text-foreground">{practice.title}</h1>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor()}`}>
                    {practice.status === 'active' ? '進行中' :
                      practice.status === 'completed' ? '已完成' :
                        practice.status === 'paused' ? '暫停' : '草稿'}
                  </span>
                </div>

                {practice.description && (
                  <p className="text-base text-muted-foreground mb-3">{practice.description}</p>
                )}

                <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                  <span>{getContentTypeLabel()}</span>
                  <span>•</span>
                  <span>
                    {new Date(practice.startDate).toLocaleDateString('zh-TW', {
                      year: 'numeric',
                      month: 'numeric',
                      day: 'numeric'
                    }).replace(/\//g, '/')}
                    {practice.targetDate && (
                      `-${new Date(practice.targetDate).toLocaleDateString('zh-TW', {
                        year: 'numeric',
                        month: 'numeric',
                        day: 'numeric'
                      }).replace(/\//g, '/')}`
                    )}
                  </span>
                </div>

                {/* 標籤顯示 */}
                {practice.tags && practice.tags.length > 0 && (
                  <div className="mt-3">
                    <div className="mb-2 text-xs text-gray-500">
                      實踐標籤 ({practice.tags.length}):
                    </div>
                    <TagList tags={practice.tags} maxDisplay={6} />
                  </div>
                )}
              </div>

              <Button
                variant="ghost"
                size="sm"
                className="p-2 text-muted-foreground hover:text-foreground rounded-lg"
              >
                <Edit className="h-5 w-5" />
              </Button>
            </div>
          </div>

          {/* 進度區域 */}
          <div className="p-6 border-b border-border">
            <div className="mb-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-foreground font-medium">實踐進度</span>
              </div>

              <div className="w-full bg-muted rounded-full h-3">
                <div
                  className="h-3 rounded-full bg-gradient-to-r from-primary to-primary/80 transition-all duration-500"
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>
            </div>

            {/* 統計數據 */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-primary/5 rounded-lg">
                <div className="text-xl font-bold text-primary">{practice.currentProgress} / {practice.totalAmount} {practice.unit}</div>
                <div className="text-sm text-muted-foreground">已完成</div>
              </div>

              <div className="text-center p-4 bg-orange-50 rounded-lg">
                <div className="text-xl font-bold text-orange-500 flex items-center justify-center">
                  🔥 {practice.streak}
                </div>
                <div className="text-sm text-muted-foreground">連續天數</div>
              </div>

              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-xl font-bold text-green-600">{stats.totalCheckIns}</div>
                <div className="text-sm text-muted-foreground">打卡次數</div>
              </div>

              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-xl font-bold text-blue-600">
                  {getDailyGoalDisplay()}
                </div>
                <div className="text-sm text-muted-foreground">每次目標</div>
              </div>
            </div>
          </div>

          {/* 小目標區域 */}
          {practice.smallGoals && practice.smallGoals.length > 0 && (
            <div className="p-6 border-b border-border">
              {/* 小目標統計 */}
              <div className="mt-4 p-3 bg-primary/5 rounded-lg">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">完成進度</span>
                  <span className="text-primary font-medium">
                    {practice.smallGoals.filter((g) => g.isCompleted).length} / {practice.smallGoals.length} 個目標
                  </span>
                </div>
                <div className="w-full bg-muted rounded-full h-2 mt-2">
                  <div
                    className="h-2 rounded-full bg-primary transition-all duration-500"
                    style={{
                      width: `${practice.smallGoals.length > 0
                        ? (practice.smallGoals.filter((g) => g.isCompleted).length / practice.smallGoals.length) * 100
                        : 0}%`
                    }}
                  />
                </div>
              </div>
            </div>
          )}

          {/* 打卡區域 */}
          <div className="p-6 border-b border-border">
            <div className="space-y-6">
              {/* 打卡 */}
              <div className="bg-gradient-to-r from-primary/10 to-blue-50 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-foreground mb-3">打卡</h3>
                {canCheckIn ? (
                  <div className="space-y-3">
                    <p className="text-sm text-muted-foreground">準備好記錄今天的學習進度了嗎？</p>
                    <Button
                      onClick={onCheckIn}
                      className="flex items-center justify-center space-x-2"
                    >
                      <Plus className="h-4 w-4" />
                      <span>開始打卡</span>
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 bg-success rounded-full flex items-center justify-center">
                        <CheckCircle className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-green-600">今日已打卡</p>
                        {todayCheckIn && (
                          <p className="text-xs text-muted-foreground">
                            進度：+{todayCheckIn.progress} {practice.unit}
                          </p>
                        )}
                      </div>
                    </div>
                    <Button
                      disabled
                      variant="secondary"
                      className="flex items-center justify-center space-x-2 cursor-not-allowed"
                    >
                      <CheckCircle className="h-4 w-4" />
                      <span>已完成打卡</span>
                    </Button>
                  </div>
                )}
              </div>

              {/* 打卡記錄 */}
              <div className="bg-card rounded-lg border border-border p-4">
                <div className="mb-4">
                  <h3 className="text-lg font-semibold text-foreground">打卡記錄</h3>
                  <div className="flex items-center justify-between text-muted-foreground text-sm mt-2">
                    <span>上次打卡</span>
                    <span>{formatLastCheckIn()}</span>
                  </div>
                </div>

                {practice.checkIns.length > 0 ? (
                  <div className="max-h-80 overflow-y-auto space-y-2">
                    {practice.checkIns.map((checkIn, index) => (
                      <div key={checkIn.id || index} className="flex items-center space-x-3 py-3 border-b border-border last:border-b-0">
                        <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0" />
                        <div className="flex-1">
                          <p className="text-sm text-foreground">
                            我在{' '}
                            <span className="text-green-600 font-medium">
                              {new Date(checkIn.date).toLocaleDateString('zh-TW', {
                                month: 'numeric',
                                day: 'numeric'
                              })}
                            </span>{' '}
                            實踐{' '}
                            <span className="text-primary font-medium">
                              {practice.title}
                            </span>{' '}
                            <span className="text-muted-foreground">
                              {checkIn.progress}
                            </span>{' '}
                            <span className="text-muted-foreground">
                              ({practice.unit})
                            </span>
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-sm text-muted-foreground">還沒有打卡記錄</p>
                    <p className="text-xs text-muted-foreground mt-1">開始你的第一次打卡吧！</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* 學習資源區域 */}
          {practice.resources.length > 0 && (
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="heading-md text-basic-black">學習資源</h3>
                <Button
                  variant="link"
                  className="text-sm text-primary hover:text-primary/80"
                >
                  管理資源
                </Button>
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
          <div className="mt-6 bg-card rounded-lg shadow-sm border border-border p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4">📈 學習建議</h3>
            <div className="space-y-2">
              {CheckInService.getCheckInSuggestions(practice).map((suggestion) => (
                <div key={suggestion} className="text-sm text-foreground p-3 bg-accent/50 rounded-lg">
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
        message=""
        onClose={() => setShowToast(false)}
      />
    </div>
  );
};

export default MainDashboard;
