import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { ArrowBack, Timeline, BarChart, CheckCircle, CalendarToday, Favorite, Add } from '@mui/icons-material';
import dayjs from 'dayjs';
import { useAuth } from '@/contexts/Auth';
import SEOConfig from '@/shared/components/SEO';
import getDefaultLayout from '@/layout/DefaultLayout';

// 統計卡片組件
const StatCard = ({ title, value, icon, color }) => {
  return (
    <div className="bg-white rounded-lg p-5 flex flex-col items-center shadow-sm">
      <div className={`text-${color} mb-2`}>
        {icon}
      </div>
      <div className="text-3xl font-bold text-basic-500 mb-1">{value}</div>
      <div className="text-sm text-basic-300 text-center">{title}</div>
    </div>
  );
};

// 進度環形圖組件
const CircleProgress = ({ value, size = 120, strokeWidth = 10, color = 'primary-base' }) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (value / 100) * circumference;

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg height={size} width={size} className="transform -rotate-90">
        <circle
          className="text-basic-100"
          strokeWidth={strokeWidth}
          stroke="currentColor"
          fill="transparent"
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />
        <circle
          className={`text-${color}`}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          stroke="currentColor"
          fill="transparent"
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />
      </svg>
      <span className="absolute text-xl font-bold">{value}%</span>
    </div>
  );
};

// 橫向進度條組件
const ProgressBar = ({ label, value, color = 'primary-base' }) => {
  return (
    <div className="mb-4">
      <div className="flex justify-between mb-1">
        <span className="text-sm font-medium text-basic-400">{label}</span>
        <span className="text-sm text-basic-300">{value}%</span>
      </div>
      <div className="w-full h-2 bg-basic-100 rounded-full overflow-hidden">
        <div
          className={`h-full bg-${color}`}
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
};

// 獲取星期名稱
const getDayName = (day) => {
  const days = ['週日', '週一', '週二', '週三', '週四', '週五', '週六'];
  return days[day];
};

// 主組件
const LearningStatsPage = () => {
  const router = useRouter();
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { isLoggedIn } = useAuth();
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalPlans: 0,
    completedPlans: 0,
    totalTasks: 0,
    completedTasks: 0,
    totalCheckIns: 0,
    currentStreak: 0,
    longestStreak: 0,
    mostActiveDay: null,
    mostActiveType: null,
    typeStats: [],
    averageCompletionRate: 0,
    mostRecentCheckIn: null,
    weeklyActivity: []
  });

    // 計算統計指標
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const calculateStats = () => {
    // 基本統計
    const totalPlans = plans.length;
    const completedPlans = plans.filter((plan) =>
      plan.tasks.length > 0 && plan.tasks.every((task) => task.completed)
    ).length;

    const totalTasks = plans.reduce((sum, plan) => sum + plan.tasks.length, 0);
    const completedTasks = plans.reduce((sum, plan) =>
      sum + plan.tasks.filter((task) => task.completed).length, 0
    );

  // 從本地儲存讀取數據
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedPlans = localStorage.getItem('learning-plans');
      if (savedPlans) {
        const parsedPlans = JSON.parse(savedPlans).map((plan) => ({
          ...plan,
          startDate: dayjs(plan.startDate),
          endDate: dayjs(plan.endDate),
          createdAt: plan.createdAt ? dayjs(plan.createdAt) : dayjs(),
          tasks: plan.tasks.map((task) => ({
            ...task,
            checkIns: task.checkIns ? task.checkIns.map((checkIn) => ({
              ...checkIn,
              date: dayjs(checkIn.date)
            })) : []
          }))
        }));
        setPlans(parsedPlans);
      }
      setLoading(false);
    }
  }, []);

  // 計算統計資料
  useEffect(() => {
    if (plans.length > 0) {
      calculateStats();
    }
  }, [plans]);

    // 打卡統計
    let allCheckIns = [];
    plans.forEach((plan) => {
      plan.tasks.forEach((task) => {
        if (task.checkIns && task.checkIns.length > 0) {
          allCheckIns = [...allCheckIns, ...task.checkIns];
        }
      });
    });

    const totalCheckIns = allCheckIns.length;

    // 計算連續打卡天數
    let checkInDates = allCheckIns.map((checkIn) => checkIn.date.format('YYYY-MM-DD'));
    checkInDates = [...new Set(checkInDates)].sort((a, b) => dayjs(b).diff(dayjs(a)));

    // 當前連續天數
    let currentStreak = 0;
    if (checkInDates.length > 0) {
      const latestDate = dayjs(checkInDates[0]);
      const today = dayjs().startOf('day');
      const isRecent = latestDate.diff(today, 'day') >= -1;

      if (isRecent) {
        currentStreak = 1;
        for (let i = 1; i < checkInDates.length; i += 1) {
          const currentDate = dayjs(checkInDates[i - 1]);
          const prevDate = dayjs(checkInDates[i]);

          if (currentDate.diff(prevDate, 'day') === 1) {
            currentStreak += 1;
          } else {
            break;
          }
        }
      }
    }

    // 最長連續天數
    let longestStreak = 0;
    let currentCount = 1;

    for (let i = 1; i < checkInDates.length; i += 1) {
      const currentDate = dayjs(checkInDates[i - 1]);
      const prevDate = dayjs(checkInDates[i]);

      if (currentDate.diff(prevDate, 'day') === 1) {
        currentCount += 1;
      } else {
        longestStreak = Math.max(longestStreak, currentCount);
        currentCount = 1;
      }
    }

    longestStreak = Math.max(longestStreak, currentCount);

    // 最活躍的星期和計劃類型
    const dayCount = { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 };
    const typeCount = {};

    checkInDates.forEach((date) => {
      const day = dayjs(date).day();
      dayCount[day] += 1;
    });

    plans.forEach((plan) => {
      if (!typeCount[plan.type]) {
        typeCount[plan.type] = { count: 0, completed: 0, total: 0 };
      }

      typeCount[plan.type].count += 1;

      // 計算每種類型的任務完成情況
      const typeTasks = plan.tasks.length;
      const typeCompletedTasks = plan.tasks.filter((task) => task.completed).length;

      typeCount[plan.type].total += typeTasks;
      typeCount[plan.type].completed += typeCompletedTasks;
    });

    // 處理類型統計資料
    const typeStats = Object.keys(typeCount).map((type) => ({
      type,
      count: typeCount[type].count,
      completionRate: typeCount[type].total > 0
        ? Math.round((typeCount[type].completed / typeCount[type].total) * 100)
        : 0
    })).sort((a, b) => b.count - a.count);

    const mostActiveDay = Object.keys(dayCount).reduce((a, b) => dayCount[a] > dayCount[b] ? a : b, 0);
    const mostActiveType = typeStats.length > 0 ? typeStats[0].type : null;

    // 平均完成率
    const averageCompletionRate = totalTasks > 0
      ? Math.round((completedTasks / totalTasks) * 100)
      : 0;

    // 最近一次打卡
    const mostRecentCheckIn = allCheckIns.length > 0
      ? allCheckIns.sort((a, b) => b.date.diff(a.date))[0].date
      : null;

    // 生成每週活動數據 (最近 7 天)
    const weeklyActivity = [];
    const today = dayjs().startOf('day');

    for (let i = 6; i >= 0; i -= 1) {
      const date = today.subtract(i, 'day');
      const dateStr = date.format('YYYY-MM-DD');
      const count = checkInDates.filter((d) => d === dateStr).length;

      weeklyActivity.push({
        date: date.format('MM/DD'),
        count,
        day: ['日', '一', '二', '三', '四', '五', '六'][date.day()]
      });
    }

    setStats({
      totalPlans,
      completedPlans,
      totalTasks,
      completedTasks,
      totalCheckIns,
      currentStreak,
      longestStreak,
      mostActiveDay: getDayName(parseInt(mostActiveDay, 10)),
      mostActiveType,
      typeStats,
      averageCompletionRate,
      mostRecentCheckIn,
      weeklyActivity
    });
  };

  // SEO 資料
  const SEOData = {
    title: '學習統計 | 島島阿學',
    description: '查看你的學習計劃統計數據，了解學習進度和習慣。',
    keywords: '學習統計, 學習進度, 學習打卡, 自主學習, 島島阿學',
    author: '島島阿學',
    imgLink: 'https://www.daoedu.tw/preview.webp',
    link: `${process.env.HOSTNAME}${router?.asPath}`,
  };

  if (loading) {
    return (
      <>
        <SEOConfig data={SEOData} />
        <div className="bg-[#EEF9F9] min-h-screen">
          <div className="mx-auto w-[670px] max-w-full px-4 py-8 md:py-28">
            <div className="text-center">
              <p>載入中...</p>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <SEOConfig data={SEOData} />
      <div className="bg-[#EEF9F9] min-h-screen">
        <div className="mx-auto w-[670px] max-w-full px-4 py-8 md:py-28">
          <div className="mb-4">
            <Link
              href="/learning-plan"
              className="inline-flex items-center gap-1 text-primary-base hover:text-primary-darker"
            >
              <ArrowBack fontSize="small" />
              <span>返回計劃列表</span>
            </Link>
          </div>

          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-basic-500">學習統計</h1>
            <div className="text-sm text-basic-300">
              最後更新: {dayjs().format('YYYY/MM/DD HH:mm')}
            </div>
          </div>

          {plans.length > 0 ? (
            <>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <StatCard
                  title="總計劃數"
                  value={stats.totalPlans}
                  icon={<Timeline fontSize="large" />}
                  color="primary-base"
                />
                <StatCard
                  title="總打卡次數"
                  value={stats.totalCheckIns}
                  icon={<CalendarToday fontSize="large" />}
                  color="amber-500"
                />
                <StatCard
                  title="連續打卡"
                  value={stats.currentStreak}
                  icon={<Favorite fontSize="large" />}
                  color="rose-500"
                />
                <StatCard
                  title="任務完成率"
                  value={`${stats.averageCompletionRate}%`}
                  icon={<CheckCircle fontSize="large" />}
                  color="emerald-500"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="bg-white rounded-lg p-5">
                  <h2 className="text-lg font-bold text-basic-500 mb-4">學習成就</h2>

                  <div className="flex flex-col items-center">
                    <CircleProgress value={stats.averageCompletionRate} color="primary-base" />
                    <div className="mt-4 text-center">
                      <div className="text-sm text-basic-300 mb-2">整體學習完成率</div>
                      <div className="text-basic-500">
                        已完成 {stats.completedTasks} / {stats.totalTasks} 個任務
                      </div>
                    </div>
                  </div>

                  <div className="mt-6">
                    <div className="text-sm font-medium text-basic-400 mb-2">關鍵數據</div>
                    <div className="flex flex-col gap-4">
                      <div className="flex justify-between items-center">
                        <span className="text-basic-400">已完成計劃</span>
                        <span className="text-primary-base font-medium">{stats.completedPlans} / {stats.totalPlans}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-basic-400">最長連續打卡</span>
                        <span className="text-primary-base font-medium">{stats.longestStreak} 天</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-basic-400">最活躍的一天</span>
                        <span className="text-primary-base font-medium">{stats.mostActiveDay || '無資料'}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-basic-400">最近一次打卡</span>
                        <span className="text-primary-base font-medium">
                          {stats.mostRecentCheckIn ? stats.mostRecentCheckIn.format('MM/DD HH:mm') : '無資料'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg p-5">
                  <h2 className="text-lg font-bold text-basic-500 mb-4">學習類型分析</h2>

                  {stats.typeStats.length > 0 ? (
                    <div className="space-y-4">
                      {stats.typeStats.map((typeStat) => (
                        <ProgressBar
                          key={typeStat.type}
                          label={`${typeStat.type} (${typeStat.count})`}
                          value={typeStat.completionRate}
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="text-center text-basic-300 py-4">
                      無類型統計資料
                    </div>
                  )}

                  <div className="mt-6">
                    <div className="text-sm font-medium text-basic-400 mb-2">最近一週活動</div>
                    <div className="grid grid-cols-7 gap-1 mt-2">
                      {stats.weeklyActivity.map((day) => (
                        <div key={`${day.date}-${day.count}`} className="flex flex-col items-center">
                          <div className="text-xs text-basic-300">{day.day}</div>
                          <div className="text-xs text-basic-300 mb-1">{day.date}</div>
                          <div
                            className={`w-8 h-8 rounded-md flex items-center justify-center ${
                              day.count > 0 ? 'bg-primary-lightest text-primary-base' : 'bg-basic-100 text-basic-300'
                            }`}
                          >
                            {day.count}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg p-5">
                <h2 className="text-lg font-bold text-basic-500 mb-4">學習建議</h2>

                <div className="space-y-4">
                  <div className="p-3 bg-amber-50 border border-amber-100 rounded-lg">
                    {stats.currentStreak > 3 ? (
                      <p className="text-amber-700">
                        太棒了！你已經連續學習 {stats.currentStreak} 天，繼續保持這個好習慣！
                      </p>
                    ) : (
                      <p className="text-amber-700">
                        嘗試建立連續學習的習慣，連續打卡可以幫助你更好地掌握知識。
                      </p>
                    )}
                  </div>

                  {stats.averageCompletionRate < 50 ? (
                    <div className="p-3 bg-rose-50 border border-rose-100 rounded-lg">
                      <p className="text-rose-700">
                        你的任務完成率不高，可以嘗試設定更小、更容易達成的學習目標。
                      </p>
                    </div>
                  ) : stats.averageCompletionRate >= 90 ? (
                    <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-lg">
                      <p className="text-emerald-700">
                        你的任務完成率非常高！可以考慮挑戰自己，設定更多樣化的學習目標。
                      </p>
                    </div>
                  ) : null}

                  {stats.mostActiveType && (
                    <div className="p-3 bg-primary-lightest border border-primary-lighter rounded-lg">
                      <p className="text-primary-darker">
                        你最常學習的類型是「{stats.mostActiveType}」，可以嘗試拓展其他領域的學習。
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </>
          ) : (
            <div className="bg-white rounded-lg p-8 text-center">
              <BarChart sx={{ fontSize: 60 }} className="text-basic-200 mb-4" />
              <h2 className="text-xl font-semibold text-basic-400 mb-2">尚未有學習統計資料</h2>
              <p className="text-basic-300 mb-6">創建並完成一些學習計劃，這裡將顯示你的學習數據</p>
              <Link
                href="/learning-plan/create"
                className="inline-flex items-center gap-2 px-4 py-2 bg-primary-base text-white rounded-full hover:bg-primary-darker transition-colors"
              >
                <Add fontSize="small" />
                <span>創建學習計劃</span>
              </Link>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

LearningStatsPage.getLayout = getDefaultLayout;

export default LearningStatsPage;
