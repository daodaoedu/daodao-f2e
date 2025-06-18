import React from 'react';
import { Plus, X, Target, BookOpen, Link as LinkIcon } from 'lucide-react';
import { Practice, Resource, ResourceType } from '@/features/practice';
import { cn } from '@/utils/cn';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

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
      type: 'website' as ResourceType,
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
        <div className="space-y-2">
          <Label htmlFor="title">
            標題 <span className="text-alert">*</span>
          </Label>
          <Input
            id="title"
            value={formData.title || ''}
            onChange={(e) => handleFieldChange('title', e.target.value)}
            placeholder="輸入實踐標題"
            className={cn(errors.title && "border-alert focus:ring-alert")}
          />
          {errors.title && (
            <p className="body-sm text-alert">{errors.title}</p>
          )}
        </div>

        {/* 描述 */}
        <div className="space-y-2">
          <Label htmlFor="description">描述</Label>
          <Textarea
            id="description"
            value={formData.description || ''}
            onChange={(e) => handleFieldChange('description', e.target.value)}
            placeholder="描述你的學習目標和計劃..."
            rows={3}
            className="resize-none"
          />
        </div>

        {/* 內容類型（只顯示，不可編輯） */}
        <div className="space-y-2">
          <Label>內容類型</Label>
          <div className="px-3 py-2 bg-muted border border-input rounded-md body-sm text-muted-foreground">
            {currentContentType?.label || practice.contentType}
          </div>
          <p className="body-sm text-muted-foreground">內容類型在建立後無法修改</p>
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
          <div className="space-y-2">
            <Label htmlFor="totalAmount">
              總量 <span className="text-alert">*</span>
            </Label>
            <div className="relative">
              <Input
                id="totalAmount"
                type="number"
                value={formData.totalAmount || ''}
                onChange={(e) => handleFieldChange('totalAmount', parseInt(e.target.value, 10) || 0)}
                placeholder="輸入總量"
                min="1"
                max="10000"
                className={cn(
                  "pr-12",
                  errors.totalAmount && "border-alert focus:ring-alert"
                )}
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 body-sm text-muted-foreground">
                {currentContentType?.unit || '項'}
              </span>
            </div>
            {errors.totalAmount && (
              <p className="body-sm text-alert">{errors.totalAmount}</p>
            )}
          </div>

          {/* 目標日期 */}
          <div className="space-y-2">
            <Label htmlFor="targetDate">目標完成日期</Label>
            <Input
              id="targetDate"
              type="date"
              value={formData.targetDate || ''}
              onChange={(e) => handleFieldChange('targetDate', e.target.value)}
              className={cn(errors.targetDate && "border-alert focus:ring-alert")}
            />
            {errors.targetDate && (
              <p className="body-sm text-alert">{errors.targetDate}</p>
            )}
          </div>
        </div>
      </div>

      {/* 小目標 */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="heading-md text-basic-black">小目標</h3>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={addGoal}
            disabled={(formData.smallGoals || []).length >= 3}
          >
            <Plus className="h-4 w-4 mr-2" />
            新增目標
          </Button>
        </div>

        <div className="space-y-3">
          {(formData.smallGoals || []).map((goal, index) => (
            <div key={goal.id} className="flex items-center space-x-3">
              <span className="flex-shrink-0 w-6 h-6 bg-primary-base text-primary-foreground rounded-full flex items-center justify-center body-sm font-medium">
                {index + 1}
              </span>
              <Input
                value={goal.content}
                onChange={(e) => handleGoalChange(goal.id, e.target.value)}
                placeholder={`小目標 ${index + 1}`}
                className="flex-1"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => removeGoal(goal.id)}
                className="text-muted-foreground hover:text-alert p-2"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>

        {(formData.smallGoals || []).length === 0 && (
          <div className="text-center py-8 border-2 border-dashed border-border rounded-lg">
            <p className="body-md text-muted-foreground mb-3">尚未設定小目標</p>
            <Button
              type="button"
              variant="ghost"
              onClick={addGoal}
            >
              <Plus className="h-4 w-4 mr-2" />
              新增第一個目標
            </Button>
          </div>
        )}
      </div>

      {/* 學習資源 */}
      <div id="resources" className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <LinkIcon className="h-5 w-5 text-primary-base" />
            <h3 className="heading-md text-basic-black">學習資源</h3>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={addResource}
            disabled={(formData.resources || []).length >= 5}
          >
            <Plus className="h-4 w-4 mr-2" />
            新增資源
          </Button>
        </div>

        <div className="space-y-4">
          {(formData.resources || []).map((resource, index) => (
            <div key={resource.id} className="border border-border rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <span className="flex-shrink-0 w-6 h-6 bg-secondary text-secondary-foreground rounded-full flex items-center justify-center body-sm font-medium mt-2">
                  {index + 1}
                </span>
                <div className="flex-1 space-y-3">
                  <Input
                    value={resource.name}
                    onChange={(e) => handleResourceChange(resource.id, 'name', e.target.value)}
                    placeholder="資源名稱"
                  />
                  <Input
                    type="url"
                    value={resource.url || ''}
                    onChange={(e) => handleResourceChange(resource.id, 'url', e.target.value)}
                    placeholder="資源連結（選填）"
                  />
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeResource(resource.id)}
                  className="text-muted-foreground hover:text-alert p-2 mt-1"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>

        {(formData.resources || []).length === 0 && (
          <div className="text-center py-8 border-2 border-dashed border-border rounded-lg">
            <p className="body-md text-muted-foreground mb-3">尚未添加學習資源</p>
            <Button
              type="button"
              variant="ghost"
              onClick={addResource}
            >
              <Plus className="h-4 w-4 mr-2" />
              新增第一個資源
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default EditForm;
