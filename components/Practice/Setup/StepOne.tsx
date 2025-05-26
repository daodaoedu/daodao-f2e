import React from 'react';
import { IoAddOutline as Plus, IoCloseOutline as X } from 'react-icons/io5';
import { colors, contentTypeOptions } from '@/constants/practice';
import { PathInfo } from '../../../services/practice';

interface StepOneProps {
  pathInfo: PathInfo;
  handlePathInfoChange: (field: keyof PathInfo, value: string | number) => void;
  handleNextStep: () => void;
  validationErrors?: Record<string, string>;
  // 新增小目標相關 props
  smallGoals: Array<{id: number, content: string}>;
  newSmallGoal: string;
  setNewSmallGoal: (value: string) => void;
  addSmallGoal: () => void;
  removeSmallGoal: (id: number) => void;
}

const StepOne: React.FC<StepOneProps> = ({
  pathInfo,
  handlePathInfoChange,
  handleNextStep,
  validationErrors = {},
  smallGoals,
  newSmallGoal,
  setNewSmallGoal,
  addSmallGoal,
  removeSmallGoal
}) => {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="p-4">
        <div className="flex items-center mb-2">
          <div className="w-2 h-2 rounded-full mr-2" style={{ backgroundColor: colors.primary }} />
          <span className="text-sm text-gray-500">主題實踐</span>
        </div>
        <h3 className="text-lg font-semibold" style={{ color: colors.dark }}>你正在學習什麼？</h3>
        <p className="text-sm text-gray-500 mt-1">
          給你的主題實踐一個清晰的名稱，並設定具體的小目標
        </p>
      </div>
      <div className="p-4 pt-0">
        <div className="space-y-4">
          {/* 主題實踐標題 */}
          <div>
            <label htmlFor="pathTitle" className="block text-sm font-medium text-gray-700 mb-1">
              主題實踐標題 <span className="text-red-500">*</span>
              <input
                id="pathTitle"
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:ring-opacity-50 ${
                  validationErrors.title ? 'border-red-500' : 'border-gray-300'
                }`}
                style={{ borderColor: validationErrors.title ? '#ef4444' : colors.primary }}
                placeholder="例如：閱讀《原子習慣》或《30天瑜伽挑戰》"
                value={pathInfo.title}
                onChange={(e) => handlePathInfoChange('title', e.target.value)}
              />
            </label>
            {validationErrors.title && (
              <p className="mt-1 text-sm text-red-500">{validationErrors.title}</p>
            )}
            <p className="text-xs text-gray-500 mt-1">
              提示：讓它具體且有激勵性
            </p>
          </div>

          {/* 內容類型 */}
          <div>
            <fieldset className="block mb-1">
              <legend className="text-sm font-medium text-gray-700">
                這個主題實踐是關於什麼類型的內容？ <span className="text-red-500">*</span>
              </legend>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-2">
                {contentTypeOptions.map((option) => {
                  const Icon = option.icon;
                  return (
                    <div
                      key={option.id}
                      className={`flex items-center p-3 border rounded-lg cursor-pointer ${
                        validationErrors.contentType ? 'border-red-500' : ''
                      }`}
                      style={{
                        borderColor: pathInfo.contentType === option.id ? colors.primary :
                                   validationErrors.contentType ? '#ef4444' : '#e5e5e5',
                        backgroundColor: pathInfo.contentType === option.id ? `${colors.primary}10` : 'white'
                      }}
                      onClick={() => handlePathInfoChange('contentType', option.id)}
                      onKeyDown={(e) => e.key === 'Enter' && handlePathInfoChange('contentType', option.id)}
                      role="button"
                      tabIndex={0}
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
              {validationErrors.contentType && (
                <p className="mt-1 text-sm text-red-500">{validationErrors.contentType}</p>
              )}
            </fieldset>
          </div>

          {/* 小目標設定 */}
          <div className="border-t pt-4">
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-medium text-gray-700">
                設定你的小目標
              </label>
              <span className="text-xs text-gray-500">{smallGoals.length}/3</span>
            </div>

            <p className="text-xs text-gray-500 mb-3">
              設定具體可衡量的小目標，幫助你保持動力並追蹤進度
            </p>

            {/* 添加小目標輸入 */}
            <div className="flex mb-3">
              <input
                type="text"
                className="flex-1 px-3 py-2 border rounded-l-md focus:outline-none focus:ring-2 focus:ring-primary focus:ring-opacity-50"
                style={{ borderColor: colors.primary }}
                placeholder="例如：完成5章內容、學習10個新概念"
                value={newSmallGoal}
                onChange={(e) => setNewSmallGoal(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && newSmallGoal.trim() && smallGoals.length < 3) {
                    addSmallGoal();
                  }
                }}
              />
              <button
                type="button"
                className={`px-3 py-2 rounded-r-md flex items-center justify-center ${
                  !newSmallGoal.trim() || smallGoals.length >= 3
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'text-white hover:opacity-90'
                }`}
                style={{
                  backgroundColor: !newSmallGoal.trim() || smallGoals.length >= 3
                    ? '#d1d5db'
                    : colors.primary
                }}
                onClick={addSmallGoal}
                disabled={!newSmallGoal.trim() || smallGoals.length >= 3}
              >
                <Plus size={18} />
              </button>
            </div>

            {/* 小目標列表 */}
            <div className="space-y-2">
              {smallGoals.map((goal) => (
                <div
                  key={goal.id}
                  className="flex items-center p-2 rounded-md"
                  style={{ backgroundColor: `${colors.primary}10` }}
                >
                  <div
                    className="w-2 h-2 rounded-full mr-2"
                    style={{ backgroundColor: colors.primary }}
                  />
                  <span className="flex-1 text-sm">{goal.content}</span>
                  <button
                    type="button"
                    className="p-1 text-gray-500 hover:text-red-500"
                    onClick={() => removeSmallGoal(goal.id)}
                  >
                    <X size={16} />
                  </button>
                </div>
              ))}

              {smallGoals.length === 0 && (
                <div className="text-center py-4 text-sm text-gray-500 bg-gray-50 rounded-md">
                  尚未添加任何小目標
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      <div className="p-4 pt-0 flex justify-end">
        <button
          type="button"
          className={`rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-opacity-50 py-2 px-4 text-sm text-white ${
            !pathInfo.title.trim()
              ? 'bg-gray-300 cursor-not-allowed'
              : ''
          }`}
          style={{
            backgroundColor: !pathInfo.title.trim() ? '#d1d5db' : colors.primary,
            borderColor: !pathInfo.title.trim() ? '#d1d5db' : colors.primary
          }}
          onClick={handleNextStep}
          disabled={!pathInfo.title.trim()}
        >
          繼續
        </button>
      </div>
    </div>
  );
};

export default StepOne;
