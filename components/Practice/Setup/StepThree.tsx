import React from 'react';
import { IoAddOutline as Plus, IoCloseOutline as X } from 'react-icons/io5';
import { colors } from '@/constants/practice';

interface StepThreeResourcesProps {
  handleNextStep: () => void;
  validationErrors?: Record<string, string>;
  // 學習資源相關 props
  resources: Array<{id: number, name: string, url: string}>;
  newResourceName: string;
  newResourceUrl: string;
  setNewResourceName: (value: string) => void;
  setNewResourceUrl: (value: string) => void;
  addResource: () => void;
  removeResource: (id: number) => void;
}

const StepThreeResources: React.FC<StepThreeResourcesProps> = ({
  handleNextStep,
  validationErrors = {},
  resources,
  newResourceName,
  newResourceUrl,
  setNewResourceName,
  setNewResourceUrl,
  addResource,
  removeResource
}) => {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="p-4">
        <div className="flex items-center mb-2">
          <div className="w-2 h-2 rounded-full mr-2" style={{ backgroundColor: colors.primary }} />
          <span className="text-sm text-gray-500">主題實踐</span>
        </div>
        <h3 className="text-lg font-semibold" style={{ color: colors.dark }}>你的學習資源</h3>
        <p className="text-sm text-gray-500 mt-1">
          新增可能會用的資源，例如書籍、Podcast、影片
        </p>
      </div>

      <div className="p-4 pt-0">
        <div className="space-y-4">
          {/* 提示訊息 */}
          <div className="p-3 rounded-md" style={{ backgroundColor: `${colors.background}20` }}>
            <p className="text-sm" style={{ color: colors.dark }}>
              💡 添加學習資源可以幫助你更好地組織和追蹤學習材料
            </p>
          </div>

          {/* 添加資源表單 */}
          <div className="border rounded-md p-4">
            <div className="flex justify-between items-center mb-3">
              <h4 className="text-sm font-medium text-gray-700">添加資源</h4>
              <span className="text-xs text-gray-500">{resources.length}/5</span>
            </div>

            <div className="space-y-3">
              {/* 資源名稱 */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  資源名稱 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:ring-opacity-50"
                  style={{ borderColor: colors.primary }}
                  placeholder="例如：原子習慣、How to Learn Faster podcast"
                  value={newResourceName}
                  onChange={(e) => setNewResourceName(e.target.value)}
                />
              </div>

              {/* 資源連結 */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  資源連結
                </label>
                <input
                  type="url"
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:ring-opacity-50"
                  style={{ borderColor: colors.primary }}
                  placeholder="https://..."
                  value={newResourceUrl}
                  onChange={(e) => setNewResourceUrl(e.target.value)}
                />
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  className={`px-4 py-2 rounded-md text-white text-sm flex items-center ${
                    !newResourceName.trim() || resources.length >= 5
                      ? 'bg-gray-300 cursor-not-allowed'
                      : 'hover:opacity-90'
                  }`}
                  style={{
                    backgroundColor: !newResourceName.trim() || resources.length >= 5
                      ? '#d1d5db'
                      : colors.primary
                  }}
                  onClick={addResource}
                  disabled={!newResourceName.trim() || resources.length >= 5}
                >
                  <Plus size={16} className="mr-1" />
                  添加資源
                </button>

                {validationErrors.resources && (
                  <p className="mt-2 text-sm text-red-500">{validationErrors.resources}</p>
                )}
              </div>
            </div>
          </div>

          {/* 資源列表 */}
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2">已添加的資源</h4>

            {resources.length > 0 ? (
              <div className="space-y-2">
                {resources.map((resource) => (
                  <div key={resource.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                    <div className="flex-1">
                      <div className="font-medium text-sm">{resource.name}</div>
                      {resource.url && (
                        <a
                          href={resource.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs hover:underline"
                          style={{ color: colors.primary }}
                        >
                          {resource.url}
                        </a>
                      )}
                    </div>
                    <button
                      type="button"
                      className="text-red-500 hover:text-red-700 ml-2"
                      onClick={() => removeResource(resource.id)}
                    >
                      <X size={16} />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 text-gray-500 bg-gray-50 rounded-md">
                <p className="text-sm">尚未添加任何資源</p>
                <p className="text-xs mt-1">添加學習資源來更好地組織你的學習材料</p>
              </div>
            )}
          </div>

          {/* 學習提示 */}
          <div
            className="p-3 rounded-lg border-l-4"
            style={{ backgroundColor: `${colors.secondary}15`, borderColor: colors.secondary }}
          >
            <p className="text-sm" style={{ color: colors.dark }}>
              <span className="font-medium">學習建議：</span>
              將相關的學習資源集中管理，可以提高學習效率並減少尋找資料的時間。
            </p>
          </div>
        </div>
      </div>

      <div className="p-4 pt-0 flex justify-end">
        <button
          type="button"
          className="rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-opacity-50 py-2 px-4 text-sm text-white"
          style={{ backgroundColor: colors.primary, borderColor: colors.primary }}
          onClick={handleNextStep}
        >
          繼續
        </button>
      </div>
    </div>
  );
};

export default StepThreeResources;
