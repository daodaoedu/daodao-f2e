import React from 'react';
import { useRouter } from 'next/router';
import {
  CheckCircle,
  Edit,
  ArrowLeft,
  Plus,
  Flame,
  Book,
  Video,
  FileText,
  Headphones,
  GraduationCap,
  Settings,
  LinkIcon
} from 'lucide-react';
import { toast } from 'sonner';
import { Practice } from '@/services/practice/schema';
import { CheckInService } from '@/services/practice/checkIn';
import { useScrollToTop } from '@/features/practice/hooks/useScrollToTop';
import { formatSmartDate, formatDate } from '@/services/practice/utils';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Progress } from '@/components/ui/progress';
import TagList from '../Shared/TagList';

interface MainDashboardProps {
  practice: Practice;
  onCheckIn: () => void;
  onBack: () => void;
}

const MainDashboard: React.FC<MainDashboardProps> = ({
  practice,
  onCheckIn,
  onBack
}) => {
  const router = useRouter();
  const { scrollToTop } = useScrollToTop();

  // 顯示 Toast 通知
  const showToastNotification = (message: string) => {
    toast.info(message);
  };

  // 計算進度百分比
  const progressPercentage = Math.round(
    (practice.currentProgress / practice.totalAmount) * 100
  );

  // 獲取簽到統計
  const stats = CheckInService.getCheckInStats(practice);
  const canCheckIn = !CheckInService.hasCheckedInToday(practice);
  const todayCheckIn = CheckInService.getTodayCheckIn(practice);

  // 格式化最後打卡日期
  const formatLastCheckIn = () => {
    if (!practice.lastCheckinDate) return '尚未打卡';
    return formatSmartDate(practice.lastCheckinDate);
  };

  // 獲取內容類型圖標
  const getContentTypeIcon = () => {
    const iconMap: Record<string, React.ReactNode> = {
      book: <Book className="h-4 w-4" />,
      video: <Video className="h-4 w-4" />,
      articles: <FileText className="h-4 w-4" />,
      podcast: <Headphones className="h-4 w-4" />,
      course: <GraduationCap className="h-4 w-4" />,
      custom: <Settings className="h-4 w-4" />
    };
    return iconMap[practice.contentType] || <Book className="h-4 w-4" />;
  };

  // 獲取內容類型標籤
  const getContentTypeLabel = () => {
    const typeMap: Record<string, string> = {
      book: '書籍',
      video: '影片',
      articles: '文章',
      podcast: 'Podcast',
      course: '課程',
      custom: practice.customContentType || '自定義'
    };
    return typeMap[practice.contentType] || '學習';
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

  // 導航到編輯頁面
  const handleEdit = () => {
    router.push(`/practice/${practice.id}/edit`).then(() => {
      scrollToTop('auto');
    });
    showToastNotification('正在跳轉到編輯頁面...');
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
                  <h1 className="text-2xl font-bold text-foreground">
                    {practice.title}
                  </h1>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor()}`}>
                    {practice.status === 'active' ? '進行中' :
                      practice.status === 'completed' ? '已完成' :
                        practice.status === 'paused' ? '暫停' : '草稿'}
                  </span>
                </div>

                {practice.description && (
                  <p className="text-base text-muted-foreground mb-3">
                    {practice.description}
                  </p>
                )}

                <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    {getContentTypeIcon()}
                    <span>{getContentTypeLabel()}</span>
                  </div>
                  <span>•</span>
                  <span>
                    {formatDate(practice.startDate)}
                    {practice.targetDate && (
                      ` - ${formatDate(practice.targetDate)}`
                    )}
                  </span>
                </div>

                {/* 標籤顯示 */}
                {practice.tags && practice.tags.length > 0 && (
                  <div className="mt-3">
                    <TagList tags={practice.tags} maxDisplay={6} />
                  </div>
                )}
              </div>

              <Button
                variant="ghost"
                size="sm"
                onClick={handleEdit}
                className="p-2 text-muted-foreground hover:text-foreground rounded-lg"
                title="編輯實踐"
              >
                <Edit className="h-5 w-5" />
              </Button>
            </div>
          </div>

          {/* 進度區域 */}
          <div className="p-6 border-b border-border">
            {/* Progress Bar */}
            <div className="mb-3 sm:mb-4 relative">
              <Progress
                value={progressPercentage}
                className="h-3"
              />
              <span className="absolute right-0 -top-7 text-lg text-basic-300 font-medium">
                {progressPercentage}%
              </span>
            </div>

            {/* 統計數據 */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-primary/5 rounded-lg">
                <div className="text-xl font-bold text-primary">
                  {practice.currentProgress} / {practice.totalAmount} {practice.unit}
                </div>
                <div className="text-sm text-muted-foreground">已完成</div>
              </div>

              <div className="text-center p-4 bg-orange-50 rounded-lg">
                <div className="text-xl font-bold text-orange-500 flex items-center justify-center gap-1">
                  <Flame className="h-5 w-5" />
                  {practice.streak}
                </div>
                <div className="text-sm text-muted-foreground">連續天數</div>
              </div>

              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-xl font-bold text-green-600">
                  {stats.totalCheckIns}
                </div>
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

          {/* 實踐行動區域 */}
          {practice.practiceAction && (
            <div className="p-6 border-b border-border">
              <h3 className="ml-4 text-lg font-medium text-foreground mb-3 flex items-center">
                實踐行動
              </h3>
              <div className="p-4 bg-primary/5 rounded-lg">
                <p className="text-sm text-foreground">{practice.practiceAction}</p>
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
                    <p className="text-sm text-muted-foreground">
                      準備好記錄今天的學習進度了嗎？
                    </p>
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
                      <div
                        key={checkIn.id || index}
                        className="flex items-center space-x-3 py-3 border-b border-border last:border-b-0"
                      >
                        <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0" />
                        <div className="flex-1">
                          <p className="text-sm text-foreground">
                            我在{' '}
                            <span className="text-green-600 font-medium">
                              {formatSmartDate(checkIn.date)}
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
                    <p className="text-xs text-muted-foreground mt-1">
                      開始你的第一次打卡吧！
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* 學習資源區域 */}
          {practice.resources.length > 0 && (
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="heading-md text-basic-black">資源</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {practice.resources.map((resource) => (
                  <div
                    key={resource.id}
                    className="flex items-center justify-between p-3 bg-primary/5 rounded-lg border border-basic-200 hover:border-basic-300 transition-colors"
                  >
                    {resource.url && (
                      <Link
                        href={resource.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center space-x-1 text-primary-base hover:text-primary-darker body-sm ml-3 flex-shrink-0"
                      >
                        <div className="flex items-center flex-1">
                          <div className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center mr-3">
                            <LinkIcon className="h-4 w-4 text-primary" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="body-sm font-medium text-basic-800 truncate">
                              {resource.name}
                            </div>
                          </div>
                        </div>
                      </Link>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

      </div>

    </div>
  );
};

export default MainDashboard;
