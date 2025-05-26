import React from 'react';
import { IoAddOutline as Plus, IoCloseOutline as X, IoFlagOutline as Target, IoBookOutline as BookOpen, IoLinkOutline as LinkIcon } from 'react-icons/io5';
import { Practice, Resource, ResourceType } from '../../../services/practice/types';

interface EditFormProps {
  formData: Partial<Practice>;
  onChange: (data: Partial<Practice>) => void;
  errors: Record<string, string>;
  practice: Practice;
}

interface SmallGoal {
  id: string;
  content: string;
  isCompleted: boolean;
  order: number;
}

const EditForm: React.FC<EditFormProps> = ({
  formData,
  onChange,
  errors,
  practice
}) => {
  // 處理基本欄位變更
  const handleFieldChange = (field: keyof Practice, value: string | number | boolean) => {
    onChange({
      ...formData,
      [field]: value
    });
  };

  // 處理小目標變更
  const handleGoalChange = (goalId: string, newContent: string) => {
    const updatedGoals = (formData.smallGoals || []).map((goal) =>
      goal.id === goalId ? { ...goal, content: newContent } : goal
    );
    onChange({
      ...formData,
      smallGoals: updatedGoals
    });
  };

  // 新增小目標
  const addGoal = () => {
    const currentGoals = formData.smallGoals || [];
    if (currentGoals.length >= 3) return;

    const newGoal: SmallGoal = {
      id: `goal_${Date.now()}`,
      content: '',
      isCompleted: false,
      order: currentGoals.length
    };

    onChange({
      ...formData,
      smallGoals: [...currentGoals, newGoal]
    });
  };

  // 刪除小目標
  const removeGoal = (goalId: string) => {
    const updatedGoals = (formData.smallGoals || []).filter((goal) => goal.id !== goalId);
    onChange({
      ...formData,
      smallGoals: updatedGoals
    });
  };

  // 處理資源變更
  const handleResourceChange = (resourceId: string, field: 'name' | 'url', value: string) => {
    const updatedResources = (formData.resources || []).map((resource) =>
      resource.id === resourceId ? { ...resource, [field]: value } : resource
    );
    onChange({
      ...formData,
      resources: updatedResources
    });
  };

  // 新增資源
  const addResource = () => {
    const currentResources = formData.resources || [];
    if (currentResources.length >= 5) return;

    const newResource: Resource = {
      id: `resource_${Date.now()}`,
      name: '',
      url: '',
      type: ResourceType.WEBSITE,
      order: currentResources.length
    };

    onChange({
      ...formData,
      resources: [...currentResources, newResource]
    });
  };

  // 刪除資源
  const removeResource = (resourceId: string) => {
    const updatedResources = (formData.resources || []).filter((resource) => resource.id !== resourceId);
    onChange({
      ...formData,
      resources: updatedResources
    });
  };

  // 內容類型選項
  const contentTypeOptions = [
    { value: 'book', label: '📚 書籍', unit: '頁' },
    { value: 'video', label: '🎬 影片', unit: '集' },
    { value: 'articles', label: '📄 文章', unit: '篇' },
    { value: 'podcast', label: '🎧 Podcast', unit: '集' },
    { value: 'course', label: '🎓 課程', unit: '堂' },
    { value: 'custom', label: '🎯 自定義', unit: '項' }
  ];

  // 動機類型選項
  const motivationOptions = [
    { value: 'career', label: '💼 職業發展' },
    { value: 'personal', label: '🌱 個人興趣' },
    { value: 'project', label: '🚀 專案需求' },
    { value: 'required', label: '📖 必修課程' },
    { value: 'other', label: '🎯 其他' }
  ];

  const currentContentType = contentTypeOptions.find((option) => option.value === practice.contentType);

  return (
    <div className="space-y-8">
      {/* 基本資訊 */}
      <div className="space-y-6">
        <div className="flex items-center space-x-3 mb-4">
          <BookOpen className="h-5 w-5 text-primary-base" />
          <h3 className="heading-md text-basic-black">基本資訊</h3>
        </div>

        {/* 標題 */}
        <div>
          <label className="block body-sm font-medium text-basic-700 mb-2">
            標題 <span className="text-alert">*</span>
          </label>
          <input
            type="text"
            value={formData.title || ''}
            onChange={(e) => handleFieldChange('title', e.target.value)}
            placeholder="輸入實踐標題"
            className={`w-full px-3 py-2 border rounded-lg body-md focus:outline-none focus:ring-2 focus:ring-primary-base focus:border-transparent ${
              errors.title ? 'border-alert' : 'border-basic-300'
            }`}
          />
          {errors.title && (
            <p className="mt-1 body-sm text-alert">{errors.title}</p>
          )}
        </div>

        {/* 描述 */}
        <div>
          <label className="block body-sm font-medium text-basic-700 mb-2">
            描述
          </label>
          <textarea
            value={formData.description || ''}
            onChange={(e) => handleFieldChange('description', e.target.value)}
            placeholder="描述你的學習目標和計劃..."
            rows={3}
            className="w-full px-3 py-2 border border-basic-300 rounded-lg body-md focus:outline-none focus:ring-2 focus:ring-primary-base focus:border-transparent resize-none"
          />
        </div>

        {/* 內容類型（只顯示，不可編輯） */}
        <div>
          <label className="block body-sm font-medium text-basic-700 mb-2">
            內容類型
          </label>
          <div className="px-3 py-2 bg-basic-100 border border-basic-300 rounded-lg body-md text-basic-600">
            {currentContentType?.label || practice.contentType}
          </div>
          <p className="mt-1 body-sm text-basic-500">內容類型在建立後無法修改</p>
        </div>
      </div>

      {/* 目標設定 */}
      <div className="space-y-6">
        <div className="flex items-center space-x-3 mb-4">
          <Target className="h-5 w-5 text-primary-base" />
          <h3 className="heading-md text-basic-black">目標設定</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* 總量 */}
          <div>
            <label className="block body-sm font-medium text-basic-700 mb-2">
              總量 <span className="text-alert">*</span>
            </label>
            <div className="relative">
              <input
                type="number"
                value={formData.totalAmount || ''}
                onChange={(e) => handleFieldChange('totalAmount', parseInt(e.target.value, 10) || 0)}
                placeholder="輸入總量"
                min="1"
                max="10000"
                className={`w-full px-3 py-2 border rounded-lg body-md focus:outline-none focus:ring-2 focus:ring-primary-base focus:border-transparent ${
                  errors.totalAmount ? 'border-alert' : 'border-basic-300'
                }`}
              />
              <span className="absolute right-3 top-2 body-md text-basic-500">
                {currentContentType?.unit || '項'}
              </span>
            </div>
            {errors.totalAmount && (
              <p className="mt-1 body-sm text-alert">{errors.totalAmount}</p>
            )}
          </div>

          {/* 目標日期 */}
          <div>
            <label className="block body-sm font-medium text-basic-700 mb-2">
              目標完成日期
            </label>
            <input
              type="date"
              value={formData.targetDate || ''}
              onChange={(e) => handleFieldChange('targetDate', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg body-md focus:outline-none focus:ring-2 focus:ring-primary-base focus:border-transparent ${
                errors.targetDate ? 'border-alert' : 'border-basic-300'
              }`}
            />
            {errors.targetDate && (
              <p className="mt-1 body-sm text-alert">{errors.targetDate}</p>
            )}
          </div>
        </div>
      </div>

      {/* 小目標 */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="heading-md text-basic-black">小目標</h3>
          <button
            type="button"
            onClick={addGoal}
            disabled={(formData.smallGoals || []).length >= 3}
            className="flex items-center space-x-2 px-3 py-1 text-primary-base hover:text-primary-darker disabled:text-basic-400 disabled:cursor-not-allowed transition-colors body-sm"
          >
            <Plus className="h-4 w-4" />
            <span>新增目標</span>
          </button>
        </div>

        <div className="space-y-3">
          {(formData.smallGoals || []).map((goal, index) => (
            <div key={goal.id} className="flex items-center space-x-3">
              <span className="flex-shrink-0 w-6 h-6 bg-primary-base text-white rounded-full flex items-center justify-center body-sm font-medium">
                {index + 1}
              </span>
              <input
                type="text"
                value={goal.content}
                onChange={(e) => handleGoalChange(goal.id, e.target.value)}
                placeholder={`小目標 ${index + 1}`}
                className="flex-1 px-3 py-2 border border-basic-300 rounded-lg body-md focus:outline-none focus:ring-2 focus:ring-primary-base focus:border-transparent"
              />
              <button
                type="button"
                onClick={() => removeGoal(goal.id)}
                className="flex-shrink-0 p-1 text-basic-400 hover:text-alert transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>

        {(formData.smallGoals || []).length === 0 && (
          <div className="text-center py-8 border-2 border-dashed border-basic-200 rounded-lg">
            <p className="body-md text-basic-500 mb-3">尚未設定小目標</p>
            <button
              type="button"
              onClick={addGoal}
              className="flex items-center space-x-2 mx-auto px-4 py-2 text-primary-base hover:text-primary-darker transition-colors body-sm"
            >
              <Plus className="h-4 w-4" />
              <span>新增第一個目標</span>
            </button>
          </div>
        )}
      </div>

      {/* 學習資源 */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <LinkIcon className="h-5 w-5 text-primary-base" />
            <h3 className="heading-md text-basic-black">學習資源</h3>
          </div>
          <button
            type="button"
            onClick={addResource}
            disabled={(formData.resources || []).length >= 5}
            className="flex items-center space-x-2 px-3 py-1 text-primary-base hover:text-primary-darker disabled:text-basic-400 disabled:cursor-not-allowed transition-colors body-sm"
          >
            <Plus className="h-4 w-4" />
            <span>新增資源</span>
          </button>
        </div>

        <div className="space-y-4">
          {(formData.resources || []).map((resource, index) => (
            <div key={resource.id} className="border border-basic-200 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <span className="flex-shrink-0 w-6 h-6 bg-secondary text-white rounded-full flex items-center justify-center body-sm font-medium mt-1">
                  {index + 1}
                </span>
                <div className="flex-1 space-y-3">
                  <input
                    type="text"
                    value={resource.name}
                    onChange={(e) => handleResourceChange(resource.id, 'name', e.target.value)}
                    placeholder="資源名稱"
                    className="w-full px-3 py-2 border border-basic-300 rounded-lg body-md focus:outline-none focus:ring-2 focus:ring-primary-base focus:border-transparent"
                  />
                  <input
                    type="url"
                    value={resource.url || ''}
                    onChange={(e) => handleResourceChange(resource.id, 'url', e.target.value)}
                    placeholder="資源連結（選填）"
                    className="w-full px-3 py-2 border border-basic-300 rounded-lg body-md focus:outline-none focus:ring-2 focus:ring-primary-base focus:border-transparent"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => removeResource(resource.id)}
                  className="flex-shrink-0 p-1 text-basic-400 hover:text-alert transition-colors mt-1"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {(formData.resources || []).length === 0 && (
          <div className="text-center py-8 border-2 border-dashed border-basic-200 rounded-lg">
            <p className="body-md text-basic-500 mb-3">尚未添加學習資源</p>
            <button
              type="button"
              onClick={addResource}
              className="flex items-center space-x-2 mx-auto px-4 py-2 text-primary-base hover:text-primary-darker transition-colors body-sm"
            >
              <Plus className="h-4 w-4" />
              <span>新增第一個資源</span>
            </button>
          </div>
        )}
      </div>

      {/* 動機和提醒設定 */}
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* 動機類型 */}
          <div>
            <label className="block body-sm font-medium text-basic-700 mb-2">
              學習動機
            </label>
            <select
              value={formData.motivationType || ''}
              onChange={(e) => handleFieldChange('motivationType', e.target.value)}
              className="w-full px-3 py-2 border border-basic-300 rounded-lg body-md focus:outline-none focus:ring-2 focus:ring-primary-base focus:border-transparent"
            >
              <option value="">請選擇動機</option>
              {motivationOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* 提醒設定 */}
          <div>
            <label className="block body-sm font-medium text-basic-700 mb-2">
              提醒設定
            </label>
            <div className="space-y-3">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={formData.reminderEnabled || false}
                  onChange={(e) => handleFieldChange('reminderEnabled', e.target.checked)}
                  className="rounded border-basic-300 text-primary-base focus:ring-primary-base"
                />
                <span className="body-md text-basic-700">啟用提醒通知</span>
              </label>

              {formData.reminderEnabled && (
                <select
                  value={formData.reminderFrequency || 'daily'}
                  onChange={(e) => handleFieldChange('reminderFrequency', e.target.value)}
                  className="w-full px-3 py-2 border border-basic-300 rounded-lg body-md focus:outline-none focus:ring-2 focus:ring-primary-base focus:border-transparent"
                >
                  <option value="daily">每日</option>
                  <option value="every-other-day">隔日</option>
                  <option value="twice-weekly">每週兩次</option>
                  <option value="weekly">每週</option>
                </select>
              )}
            </div>
          </div>
        </div>

        {/* 自定義動機 */}
        {formData.motivationType === 'other' && (
          <div>
            <label className="block body-sm font-medium text-basic-700 mb-2">
              請說明您的學習動機
            </label>
            <textarea
              value={formData.customMotivation || ''}
              onChange={(e) => handleFieldChange('customMotivation', e.target.value)}
              placeholder="描述您的學習動機..."
              rows={3}
              className="w-full px-3 py-2 border border-basic-300 rounded-lg body-md focus:outline-none focus:ring-2 focus:ring-primary-base focus:border-transparent resize-none"
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default EditForm;
