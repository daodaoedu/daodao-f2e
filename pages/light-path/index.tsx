import React, { useState } from 'react';
import Head from 'next/head';
import SetupFlow from './components/SetupFlow';
import DashboardFlow from './components/DashboardFlow';
import { PathInfo, CheckInEntry, MainView, DashboardView, MotivationType } from './types';

const LightPath: React.FC = () => {
  // 主視圖狀態 - 控制顯示應用的哪一部分
  const [mainView, setMainView] = useState<MainView>('setup');

  // 設置流程狀態
  const [setupStep, setSetupStep] = useState<number>(1);
  const [pathInfo, setPathInfo] = useState<PathInfo>({
    title: '',
    contentType: 'book',
    totalAmount: '',
    currentProgress: '0',
    targetDate: '',
    notes: '',
    motivationType: '',
    customMotivation: '',
    lastCheckin: '',
    isPublic: true,
    reminderEnabled: false,
    reminderFrequency: 'daily',
    streak: 0,
    lastStreakDate: ''
  });

  // 紙屑動畫狀態
  const [showConfetti, setShowConfetti] = useState<boolean>(false);
  const [celebrationMessage, setCelebrationMessage] = useState<string>('');

  // 儀表板視圖狀態
  const [dashboardView, setDashboardView] = useState<DashboardView>('main');
  const [newProgress, setNewProgress] = useState<number>(0);
  const [checkInNote, setCheckInNote] = useState<string>('');

  // 模擬歷史數據
  const [checkInHistory, setCheckInHistory] = useState<CheckInEntry[]>([
    { date: "2025年3月13日", time: "晚上8:30", progress: "112 / 320", note: "完成了關於習慣堆疊的章節 - 真是個有趣的概念！" },
    { date: "2025年3月12日", time: "晚上9:45", progress: "96 / 320", note: "關於「提示-渴望-反應-獎勵」循環的部分很有啟發性" },
    { date: "2025年3月10日", time: "晚上7:15", progress: "78 / 320", note: "" },
    { date: "2025年3月8日", time: "晚上10:20", progress: "65 / 320", note: "今天開始閱讀書的第2部分" }
  ]);

  // 處理設置流程中的輸入變化
  const handlePathInfoChange = (field: keyof PathInfo, value: string | number | boolean | string[]) => {
    setPathInfo((prev) => {
      if (field === 'isPublic' || field === 'reminderEnabled') {
        return { ...prev, [field]: typeof value === 'boolean' ? value : prev[field] };
      }
      if (field === 'streak') {
        return { ...prev, [field]: typeof value === 'number' ? value : prev[field] };
      }
      if (field === 'motivationType') {
        let motivationValue: MotivationType = prev[field]; // 預設保持原值
        if (typeof value === 'string') {
          // 檢查 value 是否符合 MotivationType
          const validMotivations: MotivationType[] = ['career', 'personal', 'project', 'required', 'other', ''];
          motivationValue = validMotivations.includes(value as MotivationType) ? (value as MotivationType) : '';
        } else if (Array.isArray(value)) {
          // 如果是 string[]，取第一個有效值或轉為字串
          const firstValue = value[0];
          const validMotivations: MotivationType[] = ['career', 'personal', 'project', 'required', 'other', ''];
          motivationValue = firstValue && validMotivations.includes(firstValue as MotivationType)
            ? (firstValue as MotivationType)
            : '';
        }
        return { ...prev, [field]: motivationValue };
      }
      return { ...prev, [field]: value };
    });
  };

  // 設置流程導航
  const handleNextStep = () => {
    setSetupStep(setupStep + 1);
  };

  const handlePreviousStep = () => {
    setSetupStep(setupStep - 1);
  };

  const handleCreatePath = () => {
    // 在實際應用中，這裡會儲存到後端
    setPathInfo({
      ...pathInfo,
      lastCheckin: "剛剛建立",
      streak: 1,
      lastStreakDate: new Date().toISOString().split('T')[0]
    });

    // 顯示紙屑動畫和慶祝訊息
    setShowConfetti(true);
    setCelebrationMessage("太棒了！你的學習路徑已建立。是時候開始你的學習之旅了！");

    // 延遲後，切換到儀表板
    setTimeout(() => {
      setMainView('dashboard');
      setDashboardView('main');

      // 設置初始newProgress值
      setNewProgress(parseInt(pathInfo.currentProgress, 10) || 0);
      // 轉場後隱藏紙屑
      setTimeout(() => {
        setShowConfetti(false);
        setCelebrationMessage('');
      }, 1000);
    }, 3000);
  };

  // 儀表板導航
  const handleCheckin = () => {
    setDashboardView('checkin');
    setNewProgress(parseInt(pathInfo.currentProgress, 10) + 1);
  };

  const handleViewHistory = () => {
    setDashboardView('history');
  };

  const handleSaveCheckin = () => {
    // 取得當前日期
    const now = new Date();
    const options: Intl.DateTimeFormatOptions = { hour: 'numeric', minute: 'numeric', hour12: true };
    const timeString = now.toLocaleTimeString('zh-TW', options);

    const dateOptions: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' };
    const dateString = now.toLocaleDateString('zh-TW', dateOptions);
    const todayDate = now.toISOString().split('T')[0];

    // 檢查是否為新的一天（用於連續記錄）
    let newStreak = pathInfo.streak;
    const lastDate = pathInfo.lastStreakDate;

    // 如果是首次打卡或在不同的一天打卡
    if (!lastDate || lastDate !== todayDate) {
      // 如果昨天有打卡，增加連續天數
      if (!lastDate) {
        newStreak = 1; // 首次打卡
      } else {
        const lastDateTime = new Date(lastDate);
        const oneDayAgo = new Date(now);
        oneDayAgo.setDate(oneDayAgo.getDate() - 1);

        if (lastDateTime.toISOString().split('T')[0] === oneDayAgo.toISOString().split('T')[0]) {
          // 昨天有打卡，增加連續天數
          newStreak += 1;
          setShowConfetti(true);

          // 慶祝連續天數里程碑
          if (newStreak === 3) {
            setCelebrationMessage("3天連續打卡！你正在建立一個好習慣！");
          } else if (newStreak === 7) {
            setCelebrationMessage("太棒了！達成7天連續打卡！你的熱情燃燒中！");
          } else if (newStreak === 14) {
            setCelebrationMessage("14天！連續兩週的持續學習！");
          } else if (newStreak === 21) {
            setCelebrationMessage("21天連續！你已經形成了持久的習慣！");
          } else if (newStreak === 30) {
            setCelebrationMessage("30天！整整一個月的學習！真是太棒了！");
          } else if (newStreak % 10 === 0) {
            setCelebrationMessage(`${newStreak}天連續記錄！繼續加油，你做得很好！`);
          } else {
            setCelebrationMessage(`${newStreak}天連續記錄！繼續保持！`);
          }

          setTimeout(() => {
            setShowConfetti(false);
            setCelebrationMessage('');
          }, 3000);
        } else if (lastDateTime < oneDayAgo) {
          // 超過一天，重置連續天數
          newStreak = 1;
        }
      }
    }

    // 創建新的歷史記錄
    const newEntry: CheckInEntry = {
      date: dateString,
      time: timeString,
      progress: `${newProgress} / ${pathInfo.totalAmount}`,
      note: checkInNote
    };

    // 更新打卡歷史
    setCheckInHistory([newEntry, ...checkInHistory]);

    // 更新路徑資訊，包含進度和連續天數
    setPathInfo({
      ...pathInfo,
      currentProgress: newProgress.toString(),
      lastCheckin: "剛剛",
      streak: newStreak,
      lastStreakDate: todayDate
    });

    // 清空筆記
    setCheckInNote('');

    // 返回儀表板
    setDashboardView('main');
  };

  const handleBackToDashboard = () => {
    setDashboardView('main');
  };

  // 重置演示
  const resetDemo = () => {
    setMainView('setup');
    setSetupStep(1);
    setPathInfo({
      title: '',
      contentType: 'book',
      totalAmount: '',
      currentProgress: '0',
      targetDate: '',
      notes: '',
      motivationType: '',
      customMotivation: '',
      lastCheckin: '',
      isPublic: true,
      reminderEnabled: false,
      reminderFrequency: 'daily',
      streak: 0,
      lastStreakDate: ''
    });
  };

  // 根據主視圖渲染對應的內容
  return (
    <>
      <Head>
        <title>Light Path - 學習進度追蹤</title>
        <meta name="description" content="追蹤你的學習進度，建立學習習慣" />
      </Head>

      {mainView === 'setup' ? (
        <SetupFlow
          setupStep={setupStep}
          pathInfo={pathInfo}
          handlePathInfoChange={handlePathInfoChange}
          handleNextStep={handleNextStep}
          handlePreviousStep={handlePreviousStep}
          handleCreatePath={handleCreatePath}
          showConfetti={showConfetti}
          celebrationMessage={celebrationMessage}
        />
      ) : (
        <DashboardFlow
          pathInfo={pathInfo}
          dashboardView={dashboardView}
          newProgress={newProgress}
          checkInNote={checkInNote}
          checkInHistory={checkInHistory}
          showConfetti={showConfetti}
          celebrationMessage={celebrationMessage}
          setNewProgress={setNewProgress}
          setCheckInNote={setCheckInNote}
          handleCheckin={handleCheckin}
          handleViewHistory={handleViewHistory}
          handleSaveCheckin={handleSaveCheckin}
          handleBackToDashboard={handleBackToDashboard}
          resetDemo={resetDemo}
        />
      )}
    </>
  );
};

export default LightPath;
