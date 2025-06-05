import React, { useState } from 'react';
import Head from 'next/head';
import { Practice } from '@/services/modules/practice/schema';
import { DashboardView } from '@/services/modules/practice';
import MainDashboard from './MainDashboard';
import CheckInView from './CheckInView';
import HistoryView from './HistoryView';
import Confetti from '../Shared/Confetti';
import CelebrationMessage from '../Shared/CelebrationMessage';

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

  // 處理打卡成功
  const handleCheckInSuccess = () => {
    // 顯示慶祝動畫
    setShowConfetti(true);
    setCelebrationMessage('🎉 打卡成功！繼續保持學習的好習慣！');

    // 返回主儀表板
    setCurrentView('main');

    // 3秒後隱藏慶祝訊息
    setTimeout(() => {
      setShowConfetti(false);
      setCelebrationMessage('');
    }, 3000);
  };

  // 處理視圖切換
  const handleViewChange = (view: DashboardView) => {
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
