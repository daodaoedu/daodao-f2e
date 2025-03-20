import React from 'react';
import { colors, contentTypeOptions, motivationOptions } from '@/constants/light-path';
import { PathInfo } from '../../../services/ligtht-path';

interface StepThreeProps {
  pathInfo: PathInfo;
  handlePathInfoChange: (field: keyof PathInfo, value: string | number | boolean) => void;
  handleCreatePath: () => void;
}

const StepThree: React.FC<StepThreeProps> = ({
  pathInfo,
  handlePathInfoChange,
  handleCreatePath
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
        <h3 className="text-lg font-semibold" style={{ color: colors.dark }}>即將完成！</h3>
        <p className="text-sm text-gray-500 mt-1">
          添加更多細節以幫助你的學習
        </p>
      </div>
      <div className="p-4 pt-0">
        <div className="space-y-4">
          <div>
            <label htmlFor="targetDate" className="block text-sm font-medium text-gray-700 mb-1">
              目標完成日期（必填）
              <input
                id="targetDate"
                type="date"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:ring-opacity-50"
                style={{ borderColor: colors.primary }}
                value={pathInfo.targetDate}
                onChange={(e) => handlePathInfoChange('targetDate', e.target.value)}
                required
              />
            </label>
            <p className="text-xs text-gray-500 mt-1">
              設定目標日期有助於保持動力
            </p>
          </div>

          <fieldset className="space-y-2">
            <legend className="block text-sm font-medium text-gray-700 mb-1">
              是什麼激勵你學習這個？（可選）
            </legend>
            <div className="flex flex-wrap gap-2 mt-2">
              {motivationOptions.map((option) => (
                <button
                  key={option.id}
                  type="button"
                  className="px-3 py-2 text-sm rounded-full transition-colors"
                  style={{
                    backgroundColor: pathInfo.motivationType === option.id
                      ? `${colors.primary}20`
                      : '#f1f1f1',
                    color: pathInfo.motivationType === option.id
                      ? colors.primary
                      : '#555',
                    border: pathInfo.motivationType === option.id
                      ? `1px solid ${colors.primary}`
                      : '1px solid transparent',
                  }}
                  onClick={() => handlePathInfoChange('motivationType', option.id)}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </fieldset>

          {/* 總是顯示更具體動機的文本框 */}
          <div className="mt-3">
            <label htmlFor="customMotivation" className="text-sm font-normal text-gray-600 block mb-1">
              添加你的具體動機（可選）
              <textarea
                id="customMotivation"
                className="w-full mt-1 p-2 border rounded-md"
                style={{ borderColor: colors.primary }}
                rows={2}
                placeholder={pathInfo.motivationType ? "添加關於你動機的更多細節..." : "描述是什麼激勵你學習這個..."}
                value={pathInfo.customMotivation}
                onChange={(e) => handlePathInfoChange('customMotivation', e.target.value)}
              />
            </label>
            <p className="text-xs text-gray-500 mt-2">
              將學習與你的動機連結可以將成功機率提高42%
            </p>
          </div>

          <div
            className="p-3 rounded-lg"
            style={{
              backgroundColor: `${colors.secondary}15`,
              borderLeft: `3px solid ${colors.secondary}`
            }}
          >
            <p className="text-sm" style={{ color: colors.dark }}>
              <span className="font-medium">研究洞察：</span> 在開始新的學習旅程前明確自己的動機的人，保持一致性的可能性是普通人的2.4倍。
            </p>
          </div>

          <div>
            <div className="flex items-center mb-3">
              <label htmlFor="isPublic" className="block text-sm font-medium text-gray-700 mb-0">
                <input
                  type="checkbox"
                  id="isPublic"
                  className="mr-2"
                  checked={pathInfo.isPublic}
                  onChange={(e) => handlePathInfoChange('isPublic', e.target.checked)}
                />
                公開此學習路徑
              </label>
            </div>
            <p className="text-xs text-gray-500 ml-5">
              公開分享你的學習旅程可以增加責任感和動力
            </p>
          </div>

          <fieldset className="space-y-2">
            <legend className="block text-sm font-medium text-gray-700 mb-1">
              你想要打卡提醒嗎？
            </legend>
            <div className="mt-2">
              <div className="flex items-center mb-2">
                <label htmlFor="reminderEnabled" className="block text-sm font-medium text-gray-700 mb-0">
                  <input
                    type="checkbox"
                    id="reminderEnabled"
                    className="mr-2"
                    checked={pathInfo.reminderEnabled}
                    onChange={(e) => handlePathInfoChange('reminderEnabled', e.target.checked)}
                  />
                  啟用提醒
                </label>
              </div>

              {pathInfo.reminderEnabled && (
                <div className="ml-5">
                  <label htmlFor="reminderFrequency" className="block text-sm font-medium text-gray-700 mb-2">
                    提醒頻率
                    <select
                      id="reminderFrequency"
                      className="w-full p-2 border rounded-md"
                      style={{ borderColor: colors.primary }}
                      value={pathInfo.reminderFrequency}
                      onChange={(e) => handlePathInfoChange('reminderFrequency', e.target.value)}
                    >
                      <option value="daily">每日</option>
                      <option value="every-other-day">隔日</option>
                      <option value="twice-weekly">每週兩次</option>
                      <option value="weekly">每週</option>
                    </select>
                  </label>
                </div>
              )}
            </div>
          </fieldset>

          <div className="p-4 rounded-lg" style={{ backgroundColor: `${colors.background}20`, border: `1px solid ${colors.background}` }}>
            <h3 className="font-medium mb-2" style={{ color: colors.dark }}>Light Path 預覽</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm font-medium">標題：</span>
                <span className="text-sm">{pathInfo.title || "我的路徑"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm font-medium">內容類型：</span>
                <span className="text-sm">
                  {contentTypeOptions.find((option) => option.id === pathInfo.contentType)?.label || "書籍"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm font-medium">進度：</span>
                <span className="text-sm">
                  {pathInfo.currentProgress} / {pathInfo.totalAmount || '?'} ({progressPercentage()}%)
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="p-4 pt-0 flex justify-end">
        <button
          type="button"
          className="rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-opacity-50 py-2 px-4 text-sm text-white"
          style={{ backgroundColor: colors.primary, borderColor: colors.primary }}
          onClick={handleCreatePath}
          disabled={!pathInfo.title || !pathInfo.totalAmount || !pathInfo.targetDate}
        >
          建立路徑
        </button>
      </div>
    </div>
  );
};

export default StepThree;
