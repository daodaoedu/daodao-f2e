import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { colors } from '../../constants';
import { PathInfo, CheckInEntry } from '../../types';

interface HistoryViewProps {
  checkInHistory: CheckInEntry[];
  pathInfo: PathInfo;
  handleBackToDashboard: () => void;
}

const HistoryView: React.FC<HistoryViewProps> = ({
  checkInHistory,
  pathInfo,
  handleBackToDashboard
}) => {
  return (
    <div className="max-w-md mx-auto p-4">
      <button
        type="button"
        className="flex items-center text-gray-600 mb-4 hover:text-gray-900"
        onClick={handleBackToDashboard}
      >
        <ArrowLeft className="h-4 w-4 mr-1" />
        <span>返回路徑</span>
      </button>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="p-4">
          <h3 className="text-lg font-semibold" style={{ color: colors.dark }}>打卡歷史</h3>
          <p className="text-sm text-gray-500 mt-1">
            "{pathInfo.title}"的進度歷程
          </p>
        </div>
        <div className="p-4 pt-0">
          <div className="space-y-4">
            {checkInHistory.map((entry, index) => (
              <div
                key={`checkin-${entry.date}`}
                className="p-3 border rounded-lg"
                style={{
                  backgroundColor: index === 0 ? `${colors.background}20` : 'white',
                  borderColor: index === 0 ? colors.background : '#e5e5e5'
                }}
              >
                <div className="flex justify-between items-start mb-1">
                  <div className="font-medium text-sm">{entry.date}</div>
                  <div className="text-xs text-gray-500">{entry.time}</div>
                </div>
                <div className="text-sm mb-2">{entry.progress}</div>
                {entry.note && (
                  <div className="text-sm mt-2 p-2 bg-gray-50 rounded italic text-gray-700">
                    "{entry.note}"
                  </div>
                )}
              </div>
            ))}

            <div className="flex justify-center mt-4">
              <button
                type="button"
                className="rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-opacity-50 py-1 px-3 text-sm border"
                style={{
                  borderColor: colors.primary,
                  color: colors.primary,
                  backgroundColor: 'white'
                }}
              >
                查看更多歷史記錄
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HistoryView;
