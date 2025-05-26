import React, { useState } from 'react';
import { colors } from '@/constants/practice';
import { PathInfo } from '../../../services/practice';

interface StepTwoProps {
  pathInfo: PathInfo;
  handlePathInfoChange: (field: keyof PathInfo, value: string | number) => void;
  handleNextStep: () => void;
  handlePreviousStep?: () => void;
  validationErrors?: Record<string, string>;
}

const StepTwo: React.FC<StepTwoProps> = ({
  pathInfo,
  handlePathInfoChange,
  handleNextStep,
  handlePreviousStep,
  validationErrors = {}
}) => {
  const practiceDays = parseInt(pathInfo.totalAmount, 10) || 7;
  const [dailyGoalType, setDailyGoalType] = useState<string>('time');
  const [dailyGoalTime, setDailyGoalTime] = useState<number>(30);
  const [dailyGoalPages, setDailyGoalPages] = useState<number>(10);
  const [customUnit, setCustomUnit] = useState<string>('');

  const setPracticeDays = (days: number) => {
    handlePathInfoChange('totalAmount', days.toString());
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="p-4">
        <div className="flex items-center mb-2">
          <div className="w-2 h-2 rounded-full mr-2" style={{ backgroundColor: colors.primary }} />
          <span className="text-sm text-gray-500">主題實踐</span>
        </div>
        <h3 className="text-lg font-semibold" style={{ color: colors.dark }}>時間規劃</h3>
        <p className="text-sm text-gray-500 mt-1">
          設定你的學習時間和每日目標
        </p>
      </div>

      <div className="p-4 pt-0">
        <div className="space-y-4">
          {/* Date Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              開始日期 <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              className={`px-3 py-2 border rounded-md w-full focus:outline-none focus:ring-2 focus:ring-opacity-50 ${validationErrors.targetDate ? 'border-red-500' : ''
                }`}
              style={{
                borderColor: validationErrors.targetDate ? '#ef4444' : colors.primary
              }}
              value={pathInfo.targetDate}
              min={new Date().toISOString().split('T')[0]}
              onChange={(e) => handlePathInfoChange('targetDate', e.target.value)}
            />
            {validationErrors.targetDate && (
              <p className="mt-1 text-sm text-red-500">{validationErrors.targetDate}</p>
            )}
          </div>

          {/* Practice Duration */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              實踐時間 <span className="text-red-500">*</span>
            </label>
            <div className="flex items-center mb-2">
              <input
                type="range"
                min="7"
                max="30"
                className="w-full border-0 focus:ring-0 focus:outline-none" 
                style={{
                  accentColor: colors.primary
                }}
                value={practiceDays}
                onChange={(e) => setPracticeDays(parseInt(e.target.value, 10))}
              />
              <span className="ml-3 font-medium text-lg min-w-16 text-center" style={{ color: colors.primary }}>
                {practiceDays} 天
              </span>
            </div>
            <div className="flex justify-between text-xs text-gray-500 px-1">
              <span>7天</span>
              <span>14天</span>
              <span>21天</span>
              <span>30天</span>
            </div>

            {/* End Date Display */}
            <div className="mt-2 p-3 rounded-md text-sm" style={{ backgroundColor: `${colors.primary}10` }}>
              <span className="text-gray-600">結束日期：</span>
              <span className="font-medium" style={{ color: colors.dark }}>
                {(() => {
                  if (!pathInfo.targetDate) return '請先選擇開始日期';
                  const startDate = new Date(pathInfo.targetDate);
                  const endDate = new Date(startDate);
                  endDate.setDate(startDate.getDate() + practiceDays - 1);
                  return endDate.toLocaleDateString('zh-TW', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  });
                })()}
              </span>
            </div>

            <p className="text-xs text-gray-500 mt-2">
              建議選擇7-30天的時間範圍，短期目標更容易堅持完成。研究表明形成一個新習慣通常需要至少21天。
            </p>
          </div>

          {/* Daily Goal */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              每日實踐目標 <span className="text-red-500">*</span>
            </label>
            <div className="flex space-x-4 mb-3">
              <div className="flex items-center">
                <input
                  type="radio"
                  id="timeGoal"
                  name="goalType"
                  checked={dailyGoalType === 'time'}
                  onChange={() => setDailyGoalType('time')}
                  className="mr-2"
                  style={{ accentColor: colors.primary }}
                />
                <label htmlFor="timeGoal">按時間</label>
              </div>
              <div className="flex items-center">
                <input
                  type="radio"
                  id="pagesGoal"
                  name="goalType"
                  checked={dailyGoalType === 'pages'}
                  onChange={() => setDailyGoalType('pages')}
                  className="mr-2"
                  style={{ accentColor: colors.primary }}
                />
                <label htmlFor="pagesGoal">按完成量</label>
              </div>
            </div>

            {dailyGoalType === 'time' ? (
              <div className="flex items-center p-3 rounded-md" style={{ backgroundColor: `${colors.primary}10` }}>
                <span>每天完成</span>
                <select
                  className="mx-2 p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-opacity-50"
                  style={{ borderColor: colors.primary }}
                  value={dailyGoalTime}
                  onChange={(e) => setDailyGoalTime(parseInt(e.target.value, 10))}
                >
                  <option value="15">15 分鐘</option>
                  <option value="30">30 分鐘</option>
                  <option value="45">45 分鐘</option>
                  <option value="60">1 小時</option>
                  <option value="90">1.5 小時</option>
                  <option value="120">2 小時</option>
                </select>
                <span>的學習</span>
              </div>
            ) : (
              <div className="flex items-center p-3 rounded-md" style={{ backgroundColor: `${colors.primary}10` }}>
                <span>每天完成</span>
                <input
                  type="number"
                  min="1"
                  className="mx-2 p-2 w-16 border rounded-md focus:outline-none focus:ring-2 focus:ring-opacity-50"
                  style={{ borderColor: colors.primary }}
                  value={dailyGoalPages}
                  onChange={(e) => setDailyGoalPages(parseInt(e.target.value, 10))}
                />
                <input
                  type="text"
                  className="p-2 w-24 border rounded-md focus:outline-none focus:ring-2 focus:ring-opacity-50"
                  style={{ borderColor: colors.primary }}
                  placeholder="自訂單位"
                  value={customUnit}
                  onChange={(e) => setCustomUnit(e.target.value)}
                />
              </div>
            )}
          </div>

          {/* Reminder Settings */}
          <div className="border-t pt-4 mt-4">
            <h3 className="text-md font-medium text-gray-700 mb-3">提醒設定</h3>

            {/* Frequency Selection */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                提醒頻率
              </label>
              <select
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-opacity-50"
                style={{ borderColor: colors.primary }}
                defaultValue="daily"
              >
                <option value="daily">每日提醒</option>
                <option value="weekdays">週一至週五</option>
                <option value="weekends">週末</option>
                <option value="custom">自訂天數</option>
              </select>
            </div>

            {/* Time Selection */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                提醒時間
              </label>
              <select
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-opacity-50"
                style={{ borderColor: colors.primary }}
                defaultValue="evening"
              >
                <option value="morning">早上 8:00</option>
                <option value="noon">中午 12:00</option>
                <option value="evening">晚上 8:00</option>
                <option value="custom">自訂時間</option>
              </select>
            </div>

            {/* Reminder Message */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                提醒訊息
              </label>
              <textarea
                className="w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-opacity-50"
                style={{ borderColor: colors.primary }}
                rows={2}
                placeholder="例如：該來學習了！堅持就是勝利！"
                defaultValue="該來學習了！今天也要加油！💪"
              />
              <p className="text-xs text-gray-500 mt-1">
                自訂提醒訊息可以增加個人動力，研究顯示正面的自我鼓勵能有效提高學習堅持度
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="p-4 pt-0 flex justify-end">
        <button
          type="button"
          className="px-4 py-2 border text-gray-700 rounded-md hover:bg-gray-50 mr-3"
          onClick={handlePreviousStep}
        >
          返回
        </button>
        <button
          type="button"
          className="px-4 py-2 text-white rounded-md hover:opacity-90"
          style={{ backgroundColor: colors.primary }}
          onClick={handleNextStep}
        >
          下一步
        </button>
      </div>
    </div>
  );
};

export default StepTwo;
