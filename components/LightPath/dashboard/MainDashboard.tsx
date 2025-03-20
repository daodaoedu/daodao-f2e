import React from 'react';
import { Calendar, Plus, Check } from 'lucide-react';
import { colors, getUnitType, contentTypeOptions } from '@/constants/light-path';
import { PathInfo } from '../../../services/ligtht-path';

interface MainDashboardProps {
  pathInfo: PathInfo;
  handleCheckin: () => void;
  handleViewHistory: () => void;
  resetDemo: () => void;
}

const MainDashboard: React.FC<MainDashboardProps> = ({
  pathInfo,
  handleCheckin,
  handleViewHistory,
  resetDemo
}) => {
  // 計算進度百分比的輔助函數
  const progressPercentage = (): number => {
    const current = parseInt(pathInfo.currentProgress, 10) || 0;
    const total = parseInt(pathInfo.totalAmount, 10) || 1;
    return Math.min(100, Math.round((current / total) * 100));
  };

  return (
    <div className="max-w-md mx-auto p-4">
      <h2 className="text-xl font-semibold mb-4" style={{ color: colors.dark }}>路徑儀表板</h2>

      <div className="bg-white rounded-lg shadow-lg overflow-hidden mb-6" style={{ borderRadius: '16px' }}>
        <div
          className="h-2"
          style={{
            background: `linear-gradient(to right, ${colors.primary}, ${colors.secondary})`,
            borderTopLeftRadius: '16px',
            borderTopRightRadius: '16px'
          }}
        />
        <div className="p-0">
          <div className="p-6">
            <div className="flex items-center mb-4">
              <div className="w-2 h-2 rounded-full mr-2" style={{ backgroundColor: colors.primary }} />
              <span className="text-sm text-gray-500">Light Path</span>
            </div>

            <h3 className="text-xl font-bold mb-1" style={{ color: colors.dark }}>{pathInfo.title}</h3>
            <p className="text-sm text-gray-500 mb-4">
              {contentTypeOptions.find((option) => option.id === pathInfo.contentType)?.label || "書籍"} • {pathInfo.totalAmount} {getUnitType(pathInfo.contentType)}
            </p>

            <div className="space-y-6">
              {/* 連續打卡指示器 */}
              {pathInfo.streak > 0 && (
                <div
                  className="flex items-center justify-between p-3 rounded-lg"
                  style={{ backgroundColor: `${colors.accent}15` }}
                >
                  <div className="flex items-center">
                    <div
                      className="w-9 h-9 rounded-full flex items-center justify-center mr-3"
                      style={{ backgroundColor: colors.accent }}
                    >
                      <span className="text-sm font-bold" style={{ color: colors.dark }}>
                        {pathInfo.streak}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium" style={{ color: colors.dark }}>
                        天連續打卡
                      </p>
                      <p className="text-xs text-gray-600">
                        {pathInfo.streak === 1
                          ? "第一天！繼續加油！"
                          : pathInfo.streak < 3
                            ? "開始得不錯！明天再來打卡，繼續保持連續記錄！"
                            : pathInfo.streak < 7
                              ? "你正在建立習慣！繼續保持！"
                              : "令人印象深刻的連續記錄！你是個專注的學習者！"}
                      </p>
                    </div>
                  </div>
                  <div
                    className="text-xs py-1 px-2 rounded flex items-center"
                    style={{
                      backgroundColor: colors.accent,
                      color: colors.dark
                    }}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="mr-1">
                      <path d="M8 12H8.01M12 12H12.01M16 12H16.01M21 12C21 16.418 16.97 20 12 20C10.5 20 9.06 19.659 7.8 19.064C7.4 18.882 7.2 18.791 7.073 18.742C6.943 18.692 6.874 18.69 6.741 18.701C6.608 18.712 6.469 18.765 6.192 18.872L3.5 19.87C3.199 19.97 3.049 20.02 2.925 19.994C2.816 19.97 2.722 19.908 2.661 19.818C2.591 19.714 2.592 19.551 2.594 19.226L2.6 17.8C2.601 17.542 2.602 17.414 2.577 17.294C2.555 17.185 2.516 17.082 2.461 16.988C2.399 16.882 2.311 16.789 2.136 16.603C1.292 15.712 0.75 14.409 0.75 13C0.75 8.582 4.78 5 9.75 5C11.701 5 13.5 5.6 15 6.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      <path d="M14 5.5C15.1651 5.5 16.3032 5.73245 17.35 6.14305M19.0045 7.5C19.6501 8.26188 20 9.4447 20 10.5C20 11.6168 19.5206 12.5404 18.75 13.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                    </svg>
                    每日
                  </div>
                </div>
              )}

              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>你的進度</span>
                  <span>{pathInfo.currentProgress} / {pathInfo.totalAmount} {getUnitType(pathInfo.contentType)}</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-4 overflow-hidden">
                  <div
                    className="h-4 rounded-full flex items-center justify-end pr-2"
                    style={{
                      width: `${progressPercentage()}%`,
                      background: `linear-gradient(to right, ${colors.primary}, ${colors.secondary})`,
                      transition: 'width 0.5s ease-in-out'
                    }}
                  >
                    {progressPercentage() >= 18 && (
                      <span className="text-xs font-bold text-white">{progressPercentage()}%</span>
                    )}
                  </div>
                </div>
                {progressPercentage() < 18 && (
                  <div className="text-right text-xs text-gray-500 mt-1">
                    {progressPercentage()}% 完成
                  </div>
                )}
              </div>

              <div className="flex justify-between text-sm text-gray-600">
                <span>上次打卡：</span>
                <span>{pathInfo.lastCheckin}</span>
              </div>

              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={handleCheckin}
                  className="flex-1 flex items-center justify-center shadow-md hover:shadow-lg transition-shadow rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-opacity-50 py-2 px-4 text-sm text-white"
                  style={{
                    background: `linear-gradient(45deg, ${colors.primary}, ${colors.secondary})`,
                    border: 'none'
                  }}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  打卡
                </button>
                <button
                  type="button"
                  onClick={handleViewHistory}
                  className="flex items-center justify-center shadow-sm hover:shadow transition-shadow rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-opacity-50 py-2 px-4 text-sm border"
                  style={{
                    borderColor: colors.primary,
                    color: colors.primary,
                    backgroundColor: 'white'
                  }}
                >
                  <Calendar className="h-4 w-4 mr-2" />
                  歷史
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-lg" style={{ borderRadius: '16px' }}>
        <div
          className="h-2"
          style={{
            background: `linear-gradient(to right, ${colors.accent}, ${colors.secondary})`,
            borderTopLeftRadius: '16px',
            borderTopRightRadius: '16px'
          }}
        />
        <div className="p-4 pb-2">
          <h3 className="text-base font-semibold" style={{ color: colors.dark }}>為什麼要定期打卡？</h3>
        </div>
        <div className="p-4 pt-0">
          <div className="space-y-3 text-sm">
            <div className="flex items-start">
              <div
                className="w-6 h-6 rounded-full flex items-center justify-center mr-2 mt-0.5"
                style={{ background: `linear-gradient(45deg, ${colors.primary}, ${colors.primary}CC)`, color: 'white' }}
              >
                <Check className="h-3 w-3" />
              </div>
              <p>建立一致的學習習慣</p>
            </div>
            <div className="flex items-start">
              <div
                className="w-6 h-6 rounded-full flex items-center justify-center mr-2 mt-0.5"
                style={{ background: `linear-gradient(45deg, ${colors.secondary}, ${colors.secondary}CC)`, color: 'white' }}
              >
                <Check className="h-3 w-3" />
              </div>
              <p>在靈感新鮮時記錄</p>
            </div>
            <div className="flex items-start">
              <div
                className="w-6 h-6 rounded-full flex items-center justify-center mr-2 mt-0.5"
                style={{ background: `linear-gradient(45deg, ${colors.accent}, ${colors.accent}CC)`, color: colors.dark }}
              >
                <Check className="h-3 w-3" />
              </div>
              <p>通過視覺進度保持動力</p>
            </div>

            <div className="h-px w-full my-2" style={{ background: `linear-gradient(to right, ${colors.primary}20, ${colors.primary}, ${colors.primary}20)` }} />

            <div className="flex justify-center">
              <div
                className="py-1 px-3 rounded-full text-xs font-medium"
                style={{ backgroundColor: `${colors.primary}15`, color: colors.primary }}
              >
                研究表明，每日打卡可提高學習效果72%
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 text-center">
        <button
          type="button"
          className="text-sm text-gray-500 hover:text-gray-700"
          onClick={resetDemo}
        >
          重置演示並重新開始
        </button>
      </div>
    </div>
  );
};

export default MainDashboard;
