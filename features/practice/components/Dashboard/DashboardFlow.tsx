import React, { useState } from 'react';
import Head from 'next/head';
import { Practice } from '@/services/practice/schema';
import { DashboardView } from '@/features/practice';
import MainDashboard from '@/features/practice/components/Dashboard/MainDashboard';
import CheckInView from '@/features/practice/components/Dashboard/CheckInView';
import HistoryView from '@/features/practice/components/Dashboard/HistoryView';
import Confetti from '@/features/practice/components/Shared/Confetti';
import CelebrationMessage from '@/features/practice/components/Shared/CelebrationMessage';
import { useScrollToTop } from '@/features/practice/hooks/useScrollToTop';

interface DashboardFlowProps {
  practice: Practice;
  onBack: () => void;
}

const DashboardFlow: React.FC<DashboardFlowProps> = ({
  practice,
  onBack
}) => {
  const [currentView, setCurrentView] = useState<DashboardView>('main');
  const [showConfetti, setShowConfetti] = useState(false);
  const [celebrationMessage, setCelebrationMessage] = useState('');
  const { scrollToTop } = useScrollToTop();

  // 處理打卡成功
  const handleCheckInSuccess = () => {
    // 顯示慶祝動畫
    setShowConfetti(true);
    setCelebrationMessage('🎉 打卡成功！繼續保持學習的好習慣！');

    // 滾動到頂部並返回主儀表板
    scrollToTop('smooth');
    setCurrentView('main');

    // 3秒後隱藏慶祝訊息
    setTimeout(() => {
      setShowConfetti(false);
      setCelebrationMessage('');
    }, 3000);
  };

  // 處理視圖切換
  const handleViewChange = (view: DashboardView) => {
    // 在切換視圖時滾動到頂部
    scrollToTop('smooth');
    setCurrentView(view);
  };

  const getPageTitle = () => {
    switch (currentView) {
      case 'checkin':
        return '學習打卡';
      case 'history':
        return '打卡歷史';
      default:
        return practice.title;
    }
  };

  const getPageDescription = () => {
    switch (currentView) {
      case 'checkin':
        return '記錄你的學習進度';
      case 'history':
        return '查看你的學習歷史';
      default:
        return '追蹤你的學習進度';
    }
  };

  return (
    <>
      <Head>
        <title>{getPageTitle()} - 主題實踐</title>
        <meta name="description" content={getPageDescription()} />
      </Head>

      {/* 慶祝動畫 */}
      <Confetti active={showConfetti} />

      {/* 慶祝訊息 */}
      <CelebrationMessage
        message={celebrationMessage}
        isVisible={!!celebrationMessage}
      />

      {/* 主要內容 */}
      <div className="min-h-screen bg-primary-palest">
        {currentView === 'main' && (
          <MainDashboard
            practice={practice}
            onCheckIn={() => handleViewChange('checkin')}
            onBack={onBack}
          />
        )}

        {currentView === 'checkin' && (
          <CheckInView
            practice={practice}
            onBack={() => handleViewChange('main')}
            onSuccess={handleCheckInSuccess}
          />
        )}

        {currentView === 'history' && (
          <HistoryView
            practice={practice}
            onBack={() => handleViewChange('main')}
          />
        )}
      </div>
    </>
  );
};

export default DashboardFlow;
