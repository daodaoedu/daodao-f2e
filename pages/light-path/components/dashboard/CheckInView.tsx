import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { colors, getUnitType } from '../../constants';
import { PathInfo } from '../../types';

interface CheckInViewProps {
  pathInfo: PathInfo;
  newProgress: number;
  checkInNote: string;
  setNewProgress: (value: number) => void;
  setCheckInNote: (value: string) => void;
  handleBackToDashboard: () => void;
  handleSaveCheckin: () => void;
}

const CheckInView: React.FC<CheckInViewProps> = ({
  pathInfo,
  newProgress,
  checkInNote,
  setNewProgress,
  setCheckInNote,
  handleBackToDashboard,
  handleSaveCheckin
}) => {
  // 計算進度百分比的輔助函數
  const progressPercentage = (): number => {
    const current = parseInt(pathInfo.currentProgress) || 0;
    const total = parseInt(pathInfo.totalAmount) || 1;
    return Math.min(100, Math.round((current / total) * 100));
  };

  return (
    <div className="max-w-md mx-auto p-4">
      <button
        className="flex items-center text-gray-600 mb-4 hover:text-gray-900"
        onClick={handleBackToDashboard}
      >
        <ArrowLeft className="h-4 w-4 mr-1" />
        <span>返回路徑</span>
      </button>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="p-4">
          <h3 className="text-lg font-semibold" style={{ color: colors.dark }}>打卡到你的路徑</h3>
          <p className="text-sm text-gray-500 mt-1">
            更新你在"{pathInfo.title}"中的進度
          </p>
        </div>
        <div className="p-4 pt-0">
          <div className="space-y-6">
            {/* 當前進度顯示 */}
            <div
              className="p-4 rounded-lg"
              style={{ backgroundColor: `${colors.background}20` }}
            >
              <div className="flex justify-between text-sm mb-2">
                <span>當前進度</span>
                <span className="font-medium">{pathInfo.currentProgress} / {pathInfo.totalAmount} {getUnitType(pathInfo.contentType)}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5 mb-1">
                <div
                  className="h-2.5 rounded-full"
                  style={{
                    width: `${progressPercentage()}%`,
                    backgroundColor: colors.primary
                  }}
                />
              </div>
              <div className="text-right text-xs text-gray-500">
                {progressPercentage()}% 完成
              </div>
            </div>

            {/* 更新進度 */}
            <div>
              <label htmlFor="newProgress" className="block text-sm font-medium text-gray-700 mb-1">更新進度至</label>
              <div className="flex items-center mt-2">
                <input
                  id="newProgress"
                  type="number"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:ring-opacity-50 mr-2"
                  style={{ borderColor: colors.primary }}
                  value={newProgress}
                  onChange={(e) => setNewProgress(parseInt(e.target.value) || 0)}
                />
                <span className="text-sm text-gray-500">/ {pathInfo.totalAmount} {getUnitType(pathInfo.contentType)}</span>
              </div>
            </div>

            {/* 添加簡短筆記 */}
            <div>
              <label htmlFor="checkInNote" className="block text-sm font-medium text-gray-700 mb-1">添加筆記（可選）</label>
              <textarea
                id="checkInNote"
                className="w-full mt-1 p-2 border rounded-md"
                style={{ borderColor: colors.primary }}
                rows={3}
                placeholder="今天你學到了什麼？有什麼有趣的見解嗎？"
                value={checkInNote}
                onChange={(e) => setCheckInNote(e.target.value)}
              />
              <p className="text-xs text-gray-500 mt-1">
                你的筆記將被保存到打卡歷史記錄中
              </p>
            </div>

            <div
              className="p-3 rounded-lg border text-sm"
              style={{
                backgroundColor: `${colors.accent}10`,
                borderColor: colors.accent
              }}
            >
              <p>定期打卡有助於建立學習習慣並跟蹤你的進度！</p>
            </div>
          </div>
        </div>
        <div className="p-4 pt-0 flex justify-end">
          <button
            className="rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-opacity-50 py-2 px-4 text-sm text-white"
            style={{ backgroundColor: colors.primary, borderColor: colors.primary }}
            onClick={handleSaveCheckin}
          >
            保存打卡
          </button>
        </div>
      </div>
    </div>
  );
};

export default CheckInView;
