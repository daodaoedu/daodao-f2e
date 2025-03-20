import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { Container, Skeleton } from '@mui/material';
import { AddCircleOutline } from '@mui/icons-material';
import { useAuth } from '@/contexts/Auth';
import SEOConfig from '@/shared/components/SEO';
import getDefaultLayout from '@/layout/DefaultLayout';
import dayjs from 'dayjs';
import { cn } from '@/utils/cn';

// 計劃列表標籤定義
const tabList = [
  {
    id: 'active',
    label: '進行中',
    isDisabled: false
  },
  {
    id: 'completed',
    label: '已完成',
    isDisabled: false
  }
];

// 標籤組件
const Tabs = ({ active, setActive }) => {
  return (
    <div className="tabs w-full flex flex-row justify-start items-stretch border-b-[1px] border-solid border-[#EDF0F7]">
      {
        tabList.map((tab) => {
          return (
            <div key={tab.id} className="w-1/2">
              <button
                type="button"
                name={tab.id}
                className={cn(
                  'w-full font-sans text-base leading-normal px-3 pt-3 bg-white',
                  tab.id === active ?
                    'text-primary-base font-bold pb-[6px] border-primary-lightest border-solid border-b-4'
                    :
                    'text-basic-400 font-normal pb-[10px]',
                  tab.isDisabled ?
                    'hover:cursor-not-allowed'
                    :
                    'hover:cursor-pointer'
                )}
                disabled={tab.isDisabled}
                onClick={() => setActive(tab.id)}
              >
                {tab.label}
              </button>
            </div>
          );
        })
      }
    </div>
  );
};

// 學習計劃卡片
const LearningPlanCard = ({ plan }) => {
  const completedTasks = plan.tasks.filter((task) => task.completed).length;
  const totalTasks = plan.tasks.length;
  const completionRate = Math.round((completedTasks / totalTasks) * 100);

  return (
    <Link
      href={`/learning-plan/${plan.id}`}
      className={cn(
        "p-4 md:py-8 md:px-10 flex flex-col gap-5 justify-start items-start",
        "border-[#EDF0F7] border-solid border-b-[1px]"
      )}
    >
      <div className="w-full flex flex-col gap-1 justify-start items-start md:flex-row md:justify-between md:items-center">
        <h3 className="font-sans font-bold text-basic-500 text-lg leading-normal">
          {plan.title}
        </h3>
        <div className="ml-auto flex flex-row justify-start items-center gap-2">
          <span className="font-sans text-basic-300 text-sm leading-normal">
            {dayjs(plan.createdAt).format('YYYY/MM/DD')}
          </span>
        </div>
      </div>

      <div>
        <p className="whitespace-pre-wrap text-base text-basic-300 font-sans leading-[1.4]">
          {plan.description || '無描述'}
        </p>
      </div>

      <div className="w-full flex justify-between items-center">
        <div className="flex items-center gap-4">
          <span className="text-primary-base font-semibold">{plan.type}</span>
          <span className="text-basic-300 text-sm">
            {plan.startDate.format('YYYY/MM/DD')} - {plan.endDate.format('YYYY/MM/DD')}
          </span>
        </div>
        <div className="flex items-center">
          <div className="bg-basic-100 rounded-full px-3 py-1 text-sm">
            進度: {completionRate}% ({completedTasks}/{totalTasks})
          </div>
        </div>
      </div>
    </Link>
  );
};

// 空列表顯示
const EmptyList = ({ onCreateClick }) => {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <div className="text-center mb-6">
        <h3 className="text-lg font-semibold text-basic-400 mb-2">還沒有學習計劃</h3>
        <p className="text-basic-300">創建你的第一個學習計劃，開始記錄學習進度</p>
      </div>
      <button
        onClick={onCreateClick}
        className="flex items-center gap-2 px-6 py-2 bg-primary-base text-white rounded-full hover:bg-primary-darker transition-colors"
      >
        <AddCircleOutline fontSize="small" />
        <span>創建學習計劃</span>
      </button>
    </div>
  );
};

const LearningPlanPage = () => {
  const router = useRouter();
  const { isLoggedIn } = useAuth();
  const [activeTab, setActiveTab] = useState('active');
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);

  // 從本地儲存讀取計劃資料
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedPlans = localStorage.getItem('learning-plans');
      if (savedPlans) {
        setPlans(JSON.parse(savedPlans).map((plan) => ({
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
        })));
      }
      setLoading(false);
    }
  }, []);

  // 按照完成狀態過濾計劃
  const filteredPlans = plans.filter((plan) => {
    const completedTasks = plan.tasks.filter((task) => task.completed).length;
    const isCompleted = completedTasks === plan.tasks.length;
    return activeTab === 'completed' ? isCompleted : !isCompleted;
  });

  // 處理創建計劃點擊
  const handleCreateClick = () => {
    if (!isLoggedIn) {
      router.push('/signin');
      return;
    }
    router.push('/learning-plan/create');
  };

  // SEO 設定
  const SEOData = {
    title: '學習計劃與打卡 | 島島阿學',
    description: '建立並追蹤你的學習進度，設定學習目標並進行每日打卡記錄，幫助你持續學習成長。',
    keywords: '學習計劃, 學習進度, 學習打卡, 自主學習, 島島阿學',
    author: '島島阿學',
    imgLink: 'https://www.daoedu.tw/preview.webp',
    link: `${process.env.HOSTNAME}${router?.asPath}`,
  };

  return (
    <>
      <SEOConfig data={SEOData} />
      <div className="bg-[#EEF9F9]">
        <div className="mx-auto w-[670px] max-w-full flex flex-col gap-6 px-4 py-8 md:py-28">
          <div className="flex justify-between items-center">
            <h2 className="text-basic-500 heading-md">
              學習計劃
            </h2>
            <div className="flex gap-4">
              <Link
                href="/learning-plan/stats"
                className="px-4 py-2 border border-primary-base text-primary-base rounded-full hover:bg-primary-lightest transition-colors"
              >
                統計報告
              </Link>
              <button
                onClick={handleCreateClick}
                className="flex items-center gap-2 px-4 py-2 bg-primary-base text-white rounded-full hover:bg-primary-darker transition-colors"
              >
                <AddCircleOutline fontSize="small" />
                <span>新增計劃</span>
              </button>
            </div>
          </div>

          <div className="rounded-[20px] overflow-hidden bg-white">
            <Tabs active={activeTab} setActive={setActiveTab} />

            {loading ? (
              <Skeleton animation="wave" width="95%" height="200px" className="mx-auto" />
            ) : (
              <>
                {filteredPlans.length > 0 ? (
                  filteredPlans.map((plan) => (
                    <LearningPlanCard key={plan.id} plan={plan} />
                  ))
                ) : (
                  <EmptyList onCreateClick={handleCreateClick} />
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

LearningPlanPage.getLayout = getDefaultLayout;

export default LearningPlanPage;
