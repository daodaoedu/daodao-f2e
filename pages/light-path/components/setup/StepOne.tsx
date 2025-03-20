import React from 'react';
import { colors, contentTypeOptions } from '../../constants';
import { PathInfo } from '../../types';

interface StepOneProps {
  pathInfo: PathInfo;
  handlePathInfoChange: (field: keyof PathInfo, value: any) => void;
  handleNextStep: () => void;
}

const StepOne: React.FC<StepOneProps> = ({
  pathInfo,
  handlePathInfoChange,
  handleNextStep
}) => {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="p-4">
        <div className="flex items-center mb-2">
          <div className="w-2 h-2 rounded-full mr-2" style={{ backgroundColor: colors.primary }} />
          <span className="text-sm text-gray-500">Light Path</span>
        </div>
        <h3 className="text-lg font-semibold" style={{ color: colors.dark }}>你正在學習什麼？</h3>
        <p className="text-sm text-gray-500 mt-1">
          給你的學習路徑一個清晰的名稱，方便日後查找
        </p>
      </div>
      <div className="p-4 pt-0">
        <div className="space-y-4">
          <div>
            <label htmlFor="pathTitle" className="block text-sm font-medium text-gray-700 mb-1">路徑標題</label>
            <input
              id="pathTitle"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:ring-opacity-50"
              style={{ borderColor: colors.primary }}
              placeholder="例如：閱讀《原子習慣》或《30天瑜伽挑戰》"
              value={pathInfo.title}
              onChange={(e) => handlePathInfoChange('title', e.target.value)}
            />
            <p className="text-xs text-gray-500 mt-1">
              提示：讓它具體且有激勵性
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">這個路徑是關於什麼類型的內容？</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-2">
              {contentTypeOptions.map((option) => {
                const Icon = option.icon;
                return (
                  <div
                    key={option.id}
                    className="flex items-center p-3 border rounded-lg cursor-pointer"
                    style={{
                      borderColor: pathInfo.contentType === option.id ? colors.primary : '#e5e5e5',
                      backgroundColor: pathInfo.contentType === option.id ? `${colors.primary}10` : 'white'
                    }}
                    onClick={() => handlePathInfoChange('contentType', option.id)}
                  >
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center mr-3"
                      style={{
                        backgroundColor: pathInfo.contentType === option.id ? colors.primary : '#f1f1f1',
                        color: pathInfo.contentType === option.id ? 'white' : '#888'
                      }}
                    >
                      <Icon className="h-4 w-4" />
                    </div>
                    <div>
                      <p
                        className="font-medium"
                        style={{
                          color: pathInfo.contentType === option.id ? colors.primary : '#555'
                        }}
                      >
                        {option.label}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
      <div className="p-4 pt-0 flex justify-end">
        <button
          className="rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-opacity-50 py-2 px-4 text-sm text-white"
          style={{ backgroundColor: colors.primary, borderColor: colors.primary }}
          onClick={handleNextStep}
          disabled={!pathInfo.title}
        >
          繼續
        </button>
      </div>
    </div>
  );
};

export default StepOne;
