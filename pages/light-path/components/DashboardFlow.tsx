import React from 'react';
import Head from 'next/head';
import MainDashboard from './dashboard/MainDashboard';
import CheckInView from './dashboard/CheckInView';
import HistoryView from './dashboard/HistoryView';
import Confetti from './Confetti';
import CelebrationMessage from './CelebrationMessage';
// 標記未使用的導入
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { colors } from '../constants';
import { PathInfo, CheckInEntry, DashboardView } from '../types';

interface DashboardFlowProps {
  pathInfo: PathInfo;
  dashboardView: DashboardView;
  newProgress: number;
  checkInNote: string;
  checkInHistory: CheckInEntry[];
  showConfetti: boolean;
  celebrationMessage: string;
  setNewProgress: (value: number) => void;
  setCheckInNote: (value: string) => void;
  handleCheckin: () => void;
  handleViewHistory: () => void;
  handleSaveCheckin: () => void;
  handleBackToDashboard: () => void;
  resetDemo: () => void;
}

const DashboardFlow: React.FC<DashboardFlowProps> = ({
  pathInfo,
  dashboardView,
  newProgress,
  checkInNote,
  checkInHistory,
  showConfetti,
  celebrationMessage,
  setNewProgress,
  setCheckInNote,
  handleCheckin,
  handleViewHistory,
  handleSaveCheckin,
  handleBackToDashboard,
  resetDemo
}) => {
  return (
    <>
      <Head>
        <title>{dashboardView === 'main' ? pathInfo.title : dashboardView === 'checkin' ? '打卡' : '歷史記錄'} - Light Path</title>
        <meta name="description" content={dashboardView === 'main' ? '追蹤你的學習進度' : dashboardView === 'checkin' ? '更新你的學習進度' : '查看你的學習歷史'} />
      </Head>

      <Confetti active={showConfetti} />

      {/* 慶祝訊息 */}
      <CelebrationMessage
        message={celebrationMessage}
        isVisible={!!celebrationMessage}
      />

      {dashboardView === 'main' && (
        <MainDashboard
          pathInfo={pathInfo}
          handleCheckin={handleCheckin}
          handleViewHistory={handleViewHistory}
          resetDemo={resetDemo}
        />
      )}

      {dashboardView === 'checkin' && (
        <CheckInView
          pathInfo={pathInfo}
          newProgress={newProgress}
          checkInNote={checkInNote}
          setNewProgress={setNewProgress}
          setCheckInNote={setCheckInNote}
          handleBackToDashboard={handleBackToDashboard}
          handleSaveCheckin={handleSaveCheckin}
        />
      )}

      {dashboardView === 'history' && (
        <HistoryView
          checkInHistory={checkInHistory}
          pathInfo={pathInfo}
          handleBackToDashboard={handleBackToDashboard}
        />
      )}
    </>
  );
};

export default DashboardFlow;
