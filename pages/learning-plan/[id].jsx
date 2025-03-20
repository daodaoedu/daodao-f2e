import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { Skeleton, CircularProgress } from '@mui/material';
import { ArrowBack, CheckCircle, RadioButtonUnchecked, EventNote, CalendarToday, Delete, Add } from '@mui/icons-material';
import { useAuth } from '@/contexts/Auth';
import SEOConfig from '@/shared/components/SEO';
import getDefaultLayout from '@/layout/DefaultLayout';
import dayjs from 'dayjs';
import { cn } from '@/utils/cn';

// 任務組件
const Task = ({ task, planId, onCompleteTask, onCheckIn }) => {
  return (
    <div className="border border-[#EDF0F7] rounded-lg p-4 mb-4">
      <div className="flex items-start justify-between">
        <div className="flex items-start">
          <button
            onClick={() => onCompleteTask(planId, task.id)}
            className="mr-2 mt-1"
          >
            {task.completed ? (
              <CheckCircle className="text-[#16b9b3]" />
            ) : (
              <RadioButtonUnchecked className="text-basic-300" />
            )}
          </button>
          <div>
            <h4 className={cn(
              "text-base font-medium",
              task.completed ? "text-basic-300 line-through" : "text-basic-500"
            )}
            >
              {task.content}
            </h4>

            {task.checkIns && task.checkIns.length > 0 && (
              <div className="mt-1 text-sm text-basic-300">
                最近打卡: {task.checkIns[task.checkIns.length - 1].date.format('YYYY/MM/DD HH:mm')}
                <span className="ml-2">共 {task.checkIns.length} 次打卡</span>
              </div>
            )}

            {task.checkIns && task.checkIns.length > 0 && (
              <div className="mt-4">
                <div className="text-sm font-medium text-basic-400 mb-2">打卡記錄:</div>
                {task.checkIns.slice(0, 2).map((checkIn) => (
                  <div key={checkIn.id} className="bg-[#f9f9f9] p-3 rounded mb-2">
                    <div className="text-xs text-basic-300 mb-1">{checkIn.date.format('YYYY/MM/DD HH:mm')}</div>
                    <div className="text-sm text-basic-500">{checkIn.note || '今日已完成學習'}</div>
                  </div>
                ))}

                {task.checkIns.length > 2 && (
                  <div className="text-primary-base text-sm font-medium">
                    還有 {task.checkIns.length - 2} 條打卡記錄...
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <button
          onClick={() => onCheckIn(planId, task.id)}
          className="flex items-center gap-1 px-3 py-1 bg-[#EEF9F9] text-[#16b9b3] rounded-full hover:bg-primary-lightest transition-colors"
        >
          <EventNote fontSize="small" />
          <span className="text-sm">打卡</span>
        </button>
      </div>
    </div>
  );
};

// 進度條組件
const ProgressBar = ({ value }) => {
  return (
    <div className="w-full h-2 bg-basic-100 rounded-full overflow-hidden">
      <div
        className="h-full bg-primary-base"
        style={{ width: `${value}%` }}
      />
    </div>
  );
};

// 狀態卡片組件
const StatCard = ({ icon, value, label }) => {
  return (
    <div className="bg-white rounded-lg p-4 flex flex-col items-center shadow-sm">
      <div className="text-primary-base mb-1">
        {icon}
      </div>
      <div className="text-xl font-bold text-basic-500">{value}</div>
      <div className="text-sm text-basic-300">{label}</div>
    </div>
  );
};

// 打卡對話框
const CheckInDialog = ({ isOpen, onClose, onSave, note, setNote }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-md p-6">
        <h3 className="text-lg font-bold text-basic-500 mb-4">今日打卡</h3>

        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="記錄今天的學習心得、進度或遇到的問題..."
          className="w-full p-3 border border-basic-200 rounded-lg min-h-[150px] mb-4"
        />

        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-basic-200 rounded text-basic-400"
          >
            取消
          </button>
          <button
            onClick={onSave}
            className="px-4 py-2 bg-primary-base text-white rounded hover:bg-primary-darker"
          >
            完成打卡
          </button>
        </div>
      </div>
    </div>
  );
};

// 主要組件
const LearningPlanDetailPage = () => {
  const router = useRouter();
  const { id } = router.query;
  const { isLoggedIn } = useAuth();
  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [checkInDialogOpen, setCheckInDialogOpen] = useState(false);
  const [checkInNote, setCheckInNote] = useState('');
  const [checkInTaskId, setCheckInTaskId] = useState(null);

  // 從本地儲存獲取計劃詳情
  useEffect(() => {
    if (typeof window !== 'undefined' && id) {
      const savedPlans = localStorage.getItem('learning-plans');
      if (savedPlans) {
        const planData = JSON.parse(savedPlans).find((p) => p.id === id);
        if (planData) {
          setPlan({
            ...planData,
            startDate: dayjs(planData.startDate),
            endDate: dayjs(planData.endDate),
            createdAt: planData.createdAt ? dayjs(planData.createdAt) : dayjs(),
            tasks: planData.tasks.map((task) => ({
              ...task,
              checkIns: task.checkIns ? task.checkIns.map((checkIn) => ({
                ...checkIn,
                date: dayjs(checkIn.date)
              })) : []
            }))
          });
        }
      }
      setLoading(false);
    }
  }, [id]);

  // 計算進度
  const calculateProgress = () => {
    if (!plan || plan.tasks.length === 0) return 0;
    const completedTasks = plan.tasks.filter((task) => task.completed).length;
    return Math.round((completedTasks / plan.tasks.length) * 100);
  };

  // 計算總打卡次數
  const calculateTotalCheckIns = () => {
    if (!plan) return 0;
    return plan.tasks.reduce((total, task) => {
      return total + (task.checkIns ? task.checkIns.length : 0);
    }, 0);
  };

  // 計算連續打卡天數
  const calculateStreakDays = () => {
    if (!plan) return 0;

    // 獲取所有打卡日期並排序
    let allDates = [];
    plan.tasks.forEach((task) => {
      if (task.checkIns && task.checkIns.length > 0) {
        task.checkIns.forEach((checkIn) => {
          allDates.push(checkIn.date.format('YYYY-MM-DD'));
        });
      }
    });

    // 去重並從新到舊排序
    allDates = [...new Set(allDates)].sort((a, b) => dayjs(b).diff(dayjs(a)));

    if (allDates.length === 0) return 0;

    // 檢查最近的日期是否是今天或昨天，否則連續天數歸零
    const latestDate = dayjs(allDates[0]);
    const today = dayjs().startOf('day');
    const isRecent = latestDate.diff(today, 'day') >= -1;

    if (!isRecent) return 0;

    // 計算連續天數
    let streak = 1;
    for (let i = 1; i < allDates.length; i++) {
      const currentDate = dayjs(allDates[i - 1]);
      const prevDate = dayjs(allDates[i]);

      // 如果日期差距為1天，連續天數+1
      if (currentDate.diff(prevDate, 'day') === 1) {
        streak++;
      } else {
        break;
      }
    }

    return streak;
  };

  // 處理任務完成狀態切換
  const handleCompleteTask = (planId, taskId) => {
    if (!plan) return;

    const newPlan = { ...plan };
    const taskIndex = newPlan.tasks.findIndex((task) => task.id === taskId);
    newPlan.tasks[taskIndex].completed = !newPlan.tasks[taskIndex].completed;

    // 更新本地儲存
    const savedPlans = localStorage.getItem('learning-plans');
    if (savedPlans) {
      const plans = JSON.parse(savedPlans);
      const planIndex = plans.findIndex((p) => p.id === planId);
      plans[planIndex] = {
        ...newPlan,
        startDate: newPlan.startDate.format(),
        endDate: newPlan.endDate.format(),
        createdAt: newPlan.createdAt.format(),
        tasks: newPlan.tasks.map((task) => ({
          ...task,
          checkIns: task.checkIns ? task.checkIns.map((checkIn) => ({
            ...checkIn,
            date: checkIn.date.format()
          })) : []
        }))
      };
      localStorage.setItem('learning-plans', JSON.stringify(plans));
    }

    setPlan(newPlan);
  };

  // 打開打卡對話框
  const handleCheckIn = (planId, taskId) => {
    setCheckInTaskId(taskId);
    setCheckInNote('');
    setCheckInDialogOpen(true);
  };

  // 儲存打卡記錄
  const handleSaveCheckIn = () => {
    const newPlan = { ...plan };
    const taskIndex = newPlan.tasks.findIndex((task) => task.id === checkInTaskId);

    if (!newPlan.tasks[taskIndex].checkIns) {
      newPlan.tasks[taskIndex].checkIns = [];
    }

    newPlan.tasks[taskIndex].checkIns.push({
      id: Date.now().toString(),
      date: dayjs(),
      note: checkInNote
    });

    // 更新本地儲存
    const savedPlans = localStorage.getItem('learning-plans');
    if (savedPlans) {
      const plans = JSON.parse(savedPlans);
      const planIndex = plans.findIndex((p) => p.id === id);
      plans[planIndex] = {
        ...newPlan,
        startDate: newPlan.startDate.format(),
        endDate: newPlan.endDate.format(),
        createdAt: newPlan.createdAt.format(),
        tasks: newPlan.tasks.map((task) => ({
          ...task,
          checkIns: task.checkIns ? task.checkIns.map((checkIn) => ({
            ...checkIn,
            date: checkIn.date.format()
          })) : []
        }))
      };
      localStorage.setItem('learning-plans', JSON.stringify(plans));
    }

    setPlan(newPlan);
    setCheckInDialogOpen(false);
  };

  // SEO 資料
  const SEOData = {
    title: plan ? `${plan.title} | 學習計劃 | 島島阿學` : '學習計劃詳情 | 島島阿學',
    description: plan ? `追蹤「${plan.title}」的學習進度，完成任務並記錄每日學習心得。` : '查看學習計劃詳情和打卡記錄。',
    keywords: '學習計劃, 學習進度, 學習打卡, 自主學習, 島島阿學',
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
            <Skeleton animation="wave" width="95%" height="400px" className="mx-auto" />
          </div>
        </div>
      </>
    );
  }

  if (!plan) {
    return (
      <>
        <SEOConfig data={SEOData} />
        <div className="bg-[#EEF9F9] min-h-screen">
          <div className="mx-auto w-[670px] max-w-full px-4 py-8 md:py-28">
            <div className="text-center">
              <h2 className="text-xl font-semibold text-basic-400 mb-4">找不到此學習計劃</h2>
              <Link
                href="/learning-plan"
                className="inline-flex items-center gap-2 px-4 py-2 bg-primary-base text-white rounded-full hover:bg-primary-darker transition-colors"
              >
                <ArrowBack fontSize="small" />
                <span>返回計劃列表</span>
              </Link>
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

          <div className="bg-white rounded-[20px] p-6 mb-6">
            <div className="mb-6">
              <div className="flex justify-between items-start">
                <h1 className="text-2xl font-bold text-basic-500 mb-2">{plan.title}</h1>
                <div className="px-3 py-1 bg-primary-lightest text-primary-base rounded-full text-sm">
                  {plan.type}
                </div>
              </div>

              <div className="text-sm text-basic-300 mb-4">
                {plan.startDate.format('YYYY/MM/DD')} - {plan.endDate.format('YYYY/MM/DD')}
              </div>

              {plan.description && (
                <p className="text-basic-400 mb-6">{plan.description}</p>
              )}

              <div className="mb-4">
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium text-basic-500">
                    進度 {calculateProgress()}%
                  </span>
                  <span className="text-sm text-basic-300">
                    完成 {plan.tasks.filter((t) => t.completed).length}/{plan.tasks.length} 個任務
                  </span>
                </div>
                <ProgressBar value={calculateProgress()} />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 mb-6">
              <StatCard
                icon={<EventNote />}
                value={calculateTotalCheckIns()}
                label="總計打卡次數"
              />
              <StatCard
                icon={<CalendarToday />}
                value={calculateStreakDays()}
                label="連續打卡天數"
              />
              <StatCard
                icon={<CheckCircle />}
                value={`${calculateProgress()}%`}
                label="完成率"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-bold text-basic-500">任務清單</h2>
              </div>

              {plan.tasks.map((task) => (
                <Task
                  key={task.id}
                  task={task}
                  planId={plan.id}
                  onCompleteTask={handleCompleteTask}
                  onCheckIn={handleCheckIn}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      <CheckInDialog
        isOpen={checkInDialogOpen}
        onClose={() => setCheckInDialogOpen(false)}
        onSave={handleSaveCheckIn}
        note={checkInNote}
        setNote={setCheckInNote}
      />
    </>
  );
};

LearningPlanDetailPage.getLayout = getDefaultLayout;

export default LearningPlanDetailPage;
