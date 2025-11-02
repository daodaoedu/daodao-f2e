import React from 'react';
import { useRouter } from 'next/navigation';
import {
  CheckCircle,
  Edit,
  Plus,
  Flame,
  Book,
  Video,
  FileText,
  Headphones,
  GraduationCap,
  Settings,
  LinkIcon,
} from 'lucide-react';
import { toast } from 'sonner';
import { Practice } from '@/services/practice/schema';
import { CheckInService } from '@/services/practice/checkIn';
import { useScrollToTop } from '@/features/practice/hooks/useScrollToTop';
import { formatSmartDate, formatDate } from '@/services/practice/utils';
import { Button } from '@/shared/ui/button';
import { BackButton } from '@/shared/ui/back-button';
import { CustomLink } from '@/shared/ui/custom-link';
import { Progress } from '@/shared/ui/progress';
import TagList from '../Shared/TagList';

interface MainDashboardProps {
  practice: Practice;
  currentUserId?: string;
  commentSection: React.ReactNode;
  onCheckIn: () => void;
  onBack: () => void;
}

const MainDashboard: React.FC<MainDashboardProps> = ({
  practice,
  currentUserId,
  commentSection,
  onCheckIn,
  onBack,
}) => {
  const router = useRouter();
  const { scrollToTop } = useScrollToTop();

  // Check if current user is the owner of this practice
  const isOwner = currentUserId && practice.user?.id === currentUserId;

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
      book: <Book className="size-4" />,
      video: <Video className="size-4" />,
      articles: <FileText className="size-4" />,
      podcast: <Headphones className="size-4" />,
      course: <GraduationCap className="size-4" />,
      custom: <Settings className="size-4" />,
    };
    return iconMap[practice.contentType] || <Book className="size-4" />;
  };

  // 獲取內容類型標籤
  const getContentTypeLabel = () => {
    const typeMap: Record<string, string> = {
      book: '書籍',
      video: '影片',
      articles: '文章',
      podcast: 'Podcast',
      course: '課程',
      custom: practice.customContentType || '自定義',
    };
    return typeMap[practice.contentType] || '學習';
  };

  // 獲取每日目標顯示
  const getDailyGoalDisplay = () => {
    if (!practice.dailyGoal) {
      return '--';
    }

    const {
      type, timeMinutes, amount, unit,
    } = practice.dailyGoal;

    if (type === 'time' && timeMinutes) {
      return `${timeMinutes} 分鐘`;
    } if (type === 'completion' && amount && unit) {
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
        return 'bg-yellow-100 text-yellow-700';
      default:
        return 'bg-basic-200 text-basic-600';
    }
  };

  // 導航到編輯頁面
  const handleEdit = () => {
    router.push(`/practice/${practice.id}/edit`);
    scrollToTop('auto');
    showToastNotification('正在跳轉到編輯頁面...');
  };

  return (
    <div className="min-h-screen bg-primary-palest pt-24">
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        {/* 返回按鈕 */}
        <BackButton
          onClick={onBack}
          className="mb-6 text-basic-500 hover:text-basic-black"
        />
        {/* 主要內容 */}
        <div className="overflow-hidden rounded-2xl bg-basic-white">
          {/* 標題區域 */}
          <div className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="mb-2 flex items-center space-x-3">
                  <h1 className="text-2xl font-bold text-basic-black">
                    {practice.title}
                  </h1>
                  <span className={`rounded-full px-3 py-1 text-xs font-medium whitespace-nowrap ${getStatusColor()}`}>
                    {practice.status === 'active' ? '進行中'
                      : practice.status === 'completed' ? '已完成'
                        : practice.status === 'paused' ? '暫停' : '草稿'}
                  </span>
                </div>

                {practice.description && (
                  <p className="mb-3 text-base text-basic-500">
                    {practice.description}
                  </p>
                )}

                <div className="flex items-center space-x-4 text-sm text-basic-500">
                  <div className="flex items-center gap-1">
                    {getContentTypeIcon()}
                    <span>{getContentTypeLabel()}</span>
                  </div>
                  {practice.startDate && (
                    <>
                      <span>•</span>
                      <span>
                        {formatDate(practice.startDate)}
                        {practice.targetDate && (
                          ` - ${formatDate(practice.targetDate)}`
                        )}
                      </span>
                    </>
                  )}
                </div>

                {/* 標籤顯示 */}
                {practice.tags && practice.tags.length > 0 && (
                  <div className="mt-3">
                    <TagList tags={practice.tags} maxDisplay={6} />
                  </div>
                )}
              </div>

              {isOwner && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleEdit}
                  className="rounded-lg p-2 text-basic-500 hover:text-basic-black"
                  title="編輯實踐"
                >
                  <Edit className="size-5" />
                </Button>
              )}
            </div>
          </div>

          {/* 進度區域 */}
          <div className="p-6">
            {/* Progress Bar */}
            <div className="relative mb-3 sm:mb-4">
              <Progress
                value={progressPercentage}
                className="h-3"
              />
              <span className="absolute -top-7 right-0 text-lg font-medium text-basic-300">
                {progressPercentage}
                %
              </span>
            </div>

            {/* 統計數據 */}
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
              <div className="rounded-lg bg-primary/5 p-4 text-center">
                <div className="text-xl font-bold text-primary">
                  {practice.currentProgress}
                  {' '}
                  /
                  {practice.totalAmount}
                  {' '}
                  {practice.unit}
                </div>
                <div className="text-sm text-basic-500">已完成</div>
              </div>

              <div className="rounded-lg bg-orange-50 p-4 text-center">
                <div className="flex items-center justify-center gap-1 text-xl font-bold text-orange-500">
                  <Flame className="size-5" />
                  {practice.streak}
                </div>
                <div className="text-sm text-basic-500">連續天數</div>
              </div>

              <div className="rounded-lg bg-green-50 p-4 text-center">
                <div className="text-xl font-bold text-green-600">
                  {stats.totalCheckIns}
                </div>
                <div className="text-sm text-basic-500">打卡次數</div>
              </div>

              <div className="rounded-lg bg-blue-50 p-4 text-center">
                <div className="text-xl font-bold text-blue-600">
                  {getDailyGoalDisplay()}
                </div>
                <div className="text-sm text-basic-500">每次目標</div>
              </div>
            </div>
          </div>

          {/* 實踐行動區域 */}
          {practice.practiceAction && (
            <div className="p-6">
              <h3 className="mb-3 ml-4 flex items-center text-lg font-medium text-basic-black">
                實踐行動
              </h3>
              <div className="rounded-lg bg-primary/5 p-4">
                <p className="text-sm text-basic-black">{practice.practiceAction}</p>
              </div>
            </div>
          )}

          {/* 打卡區域 - 只有主題擁有者可以看到 */}
          {isOwner && (
            <div className="p-6">
              <div className="space-y-6">
                {/* 打卡 */}
                <div className="rounded-lg bg-gradient-to-r from-primary/10 to-blue-50 p-4">
                  <h3 className="mb-3 text-lg font-semibold text-basic-black">打卡</h3>
                  {canCheckIn ? (
                    <div className="space-y-3">
                      <p className="text-sm text-basic-500">
                        準備好記錄今天的學習進度了嗎？
                      </p>
                      <Button
                        onClick={() => {
                          console.log('打卡按鈕被點擊');
                          onCheckIn();
                        }}
                        className="flex items-center justify-center space-x-2"
                        type="button"
                      >
                        <Plus className="size-4" />
                        <span>開始打卡</span>
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="flex items-center space-x-2">
                        <div className="flex size-8 items-center justify-center rounded-full bg-success">
                          <CheckCircle className="size-5 text-white" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-green-600">今日已打卡</p>
                          {todayCheckIn && (
                            <p className="text-xs text-basic-500">
                              進度：+{todayCheckIn.progress}{practice.unit ? ` ${practice.unit}` : ' 天'}
                            </p>
                          )}
                        </div>
                      </div>
                      <Button
                        disabled
                        variant="secondary"
                        className="flex cursor-not-allowed items-center justify-center space-x-2"
                      >
                        <CheckCircle className="size-4" />
                        <span>已完成打卡</span>
                      </Button>
                    </div>
                  )}
                </div>

              {/* 打卡記錄 */}
              <div className="rounded-lg border border-basic-200 bg-basic-white p-4">
                <div className="mb-4">
                  <h3 className="text-lg font-semibold text-basic-black">打卡記錄</h3>
                  <div className="mt-2 flex items-center justify-between text-sm text-basic-500">
                    <span>上次打卡</span>
                    <span>{formatLastCheckIn()}</span>
                  </div>
                </div>

                {practice.checkIns && practice.checkIns.length > 0 ? (
                  <div className="max-h-80 space-y-2 overflow-y-auto">
                    {practice.checkIns.map((checkIn, index) => (
                      <div
                        key={checkIn.id || index}
                        className="border-b border-basic-200 py-3 last:border-b-0"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="size-2 shrink-0 rounded-full bg-primary" />
                            <span className="text-sm font-medium text-basic-black">
                              {formatDate(checkIn.date)}
                            </span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className="text-sm font-medium text-primary">
                              +{checkIn.progress}{practice.unit ? ` ${practice.unit}` : ' 天'}
                            </span>
                            <span className="text-xs text-basic-400">
                              (累積 {checkIn.totalProgress}{practice.unit ? ` ${practice.unit}` : ' 天'})
                            </span>
                          </div>
                        </div>
                        {checkIn.note && (
                          <div className="ml-5 mt-2">
                            <p className="text-xs text-basic-500">{checkIn.note}</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-8 text-center">
                    <p className="text-sm text-basic-500">還沒有打卡記錄</p>
                    <p className="mt-1 text-xs text-basic-500">
                      開始你的第一次打卡吧！
                    </p>
                  </div>
                )}
                </div>
              </div>
            </div>
          )}

          {/* 學習資源區域 */}
          {practice.resources && practice.resources.length > 0 && (
            <div className="p-6">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="heading-md text-basic-black">資源</h3>
              </div>

              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                {practice.resources.map((resource) => (
                  <div
                    key={resource.id}
                    className="flex items-center justify-between rounded-lg border border-basic-200 bg-primary/5 p-3 transition-colors hover:border-basic-300"
                  >
                    {resource.url && (
                      <CustomLink
                        href={resource.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="body-sm ml-3 flex shrink-0 items-center space-x-1 text-primary-base hover:text-primary-darker"
                      >
                        <div className="flex flex-1 items-center">
                          <div className="mr-3 flex size-8 shrink-0 items-center justify-center rounded-lg">
                            <LinkIcon className="size-4 text-primary" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="text-basic-800 body-sm truncate font-medium">
                              {resource.name}
                            </div>
                          </div>
                        </div>
                      </CustomLink>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* 留言區域 - 獨立卡片 */}
        <div className="mt-6 rounded-2xl bg-basic-white p-4 md:p-8 lg:p-10">
          {commentSection}
        </div>
      </div>
    </div>
  );
};

export default MainDashboard;
