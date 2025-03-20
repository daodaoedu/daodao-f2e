import React from 'react';
import { Check } from 'lucide-react';
import { colors, getUnitType } from '@/constants/light-path';
import { PathInfo } from '../../../services/ligtht-path';

interface StepTwoProps {
  pathInfo: PathInfo;
  handlePathInfoChange: (field: keyof PathInfo, value: string | number) => void;
  handleNextStep: () => void;
}

const StepTwo: React.FC<StepTwoProps> = ({
  pathInfo,
  handlePathInfoChange,
  handleNextStep
}) => {
  // 計算進度百分比的輔助函數
  const progressPercentage = (): number => {
    const current = parseInt(pathInfo.currentProgress, 10) || 0;
    const total = parseInt(pathInfo.totalAmount, 10) || 1;
    return Math.min(100, Math.round((current / total) * 100));
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="p-4">
        <div className="flex items-center mb-2">
          <div className="w-2 h-2 rounded-full mr-2" style={{ backgroundColor: colors.primary }} />
          <span className="text-sm text-gray-500">Light Path</span>
        </div>
        <h3 className="text-lg font-semibold" style={{ color: colors.dark }}>如何追蹤進度？</h3>
        <p className="text-sm text-gray-500 mt-1">
          設置簡單的追蹤方式以保持動力
        </p>
      </div>
      <div className="p-4 pt-0">
        <div className="space-y-4">
          <div>
            <label htmlFor="totalAmount" className="block text-sm font-medium text-gray-700 mb-1">
              總數量
              <input
                id="totalAmount"
                type="number"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:ring-opacity-50"
                style={{ borderColor: colors.primary }}
                placeholder={pathInfo.contentType === 'custom' ? "例如：30天" : "例如：100"}
                value={pathInfo.totalAmount}
                onChange={(e) => handlePathInfoChange('totalAmount', e.target.value)}
              />
            </label>
            <p className="text-xs text-gray-500 mt-1">
              {pathInfo.contentType === 'custom'
                ? "這個挑戰會持續多少天？"
                : pathInfo.contentType === 'book'
                  ? "這本書有多少頁？"
                  : pathInfo.contentType === 'video'
                    ? "有多少個影片或課程？"
                    : pathInfo.contentType === 'podcast'
                      ? "你將會聽多少集？"
                      : pathInfo.contentType === 'articles'
                        ? "你將閱讀多少篇文章？"
                        : "你總共要完成多少單元？"}
            </p>
          </div>

          <div>
            <label htmlFor="currentProgress" className="block text-sm font-medium text-gray-700 mb-1">
              起始點（可選）
              <input
                id="currentProgress"
                type="number"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:ring-opacity-50"
                style={{ borderColor: colors.primary }}
                placeholder="例如：0"
                value={pathInfo.currentProgress}
                onChange={(e) => handlePathInfoChange('currentProgress', e.target.value)}
              />
            </label>
            <p className="text-xs text-gray-500 mt-1">
              如果你已經開始了，輸入你已完成的量
            </p>
          </div>

          <div className="pt-2">
            <div className="flex justify-between mb-1">
              <span className="block text-sm font-medium text-gray-700">起始進度</span>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg border">
              <div className="flex justify-between text-sm mb-1">
                <span>
                  {pathInfo.currentProgress} / {pathInfo.totalAmount || '?'} {getUnitType(pathInfo.contentType)}已完成
                </span>
                <span>
                  {progressPercentage()}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div
                  className="h-2.5 rounded-full"
                  style={{
                    width: `${progressPercentage()}%`,
                    backgroundColor: colors.primary
                  }}
                />
              </div>
            </div>

            <div className="mt-4 p-3 rounded-lg" style={{ backgroundColor: `${colors.background}20`, border: `1px solid ${colors.background}` }}>
              <h4 className="text-sm font-medium flex items-center" style={{ color: colors.primary }}>
                <Check className="h-4 w-4 mr-1" />
                包含打卡功能
              </h4>
              <p className="text-xs text-gray-600 mt-1">
                你可以通過定期打卡輕鬆更新進度，保持動力
              </p>
            </div>
          </div>
        </div>
      </div>
      <div className="p-4 pt-0 flex justify-end">
        <button
          type="button"
          className="rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-opacity-50 py-2 px-4 text-sm text-white"
          style={{ backgroundColor: colors.primary, borderColor: colors.primary }}
          onClick={handleNextStep}
          disabled={!pathInfo.totalAmount}
        >
          繼續
        </button>
      </div>
    </div>
  );
};

export default StepTwo;
