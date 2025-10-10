import React, { useState } from 'react';
import {
  Plus, X, Target, BookOpen, Link as LinkIcon, Clock, BarChart, Book, Video, FileText, Headphones, GraduationCap, Settings, AlertCircle,
} from 'lucide-react';
import { Practice, Resource, ResourceType } from '@/features/practice';
import { cn } from '@/utils/cn';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Textarea } from '@/shared/ui/textarea';
import { Label } from '@/shared/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/ui/select';
import { RadioGroup, RadioGroupItem } from '@/shared/ui/radio-group';
import { defaultTags } from '@/constants/practice';

interface EditFormProps {
  formData: Partial<Practice>;
  onChange: (data: Partial<Practice>) => void;
  errors: Record<string, string>;
  practice: Practice;
}

const EditForm: React.FC<EditFormProps> = ({
  formData,
  onChange,
  errors,
  practice,
}) => {
  const [resourceErrors, setResourceErrors] = useState<Record<string, { name?: string; url?: string }>>({});
  // 處理基本欄位變更
  const handleFieldChange = (field: keyof Practice, value: string | number | boolean) => {
    onChange({
      ...formData,
      [field]: value,
    });
  };

  // 驗證單個資源欄位
  const validateResourceField = (resourceId: string, field: 'name' | 'url', value: string) => {
    let error = '';

    if (field === 'name') {
      if (!value.trim()) {
        error = '請輸入資源名稱';
      } else if (value.length > 100) {
        error = '資源名稱不可超過 100 字';
      }
    } else if (field === 'url' && value.trim()) {
      // 使用簡單的 URL 格式檢查
      if (!/^https?:\/\/.+/.test(value)) {
        error = '請輸入有效的網址';
      }
    }

    setResourceErrors((prev) => ({
      ...prev,
      [resourceId]: {
        ...prev[resourceId],
        [field]: error || undefined,
      },
    }));

    return !error;
  };

  // 處理資源變更
  const handleResourceChange = (resourceId: string, field: 'name' | 'url', value: string) => {
    const updatedResources = (formData.resources || []).map((resource) => (resource.id === resourceId ? { ...resource, [field]: value } : resource));
    onChange({
      ...formData,
      resources: updatedResources,
    });

    // 如果之前有錯誤，即時驗證
    if (resourceErrors[resourceId]?.[field]) {
      validateResourceField(resourceId, field, value);
    }
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
      order: currentResources.length,
    };

    onChange({
      ...formData,
      resources: [...currentResources, newResource],
    });
  };

  // 刪除資源
  const removeResource = (resourceId: string) => {
    const updatedResources = (formData.resources || []).filter((resource) => resource.id !== resourceId);
    onChange({
      ...formData,
      resources: updatedResources,
    });
  };

  // 處理標籤
  const addTag = (tag: string) => {
    const currentTags = formData.tags || [];
    if (tag && !currentTags.includes(tag) && currentTags.length < 3) {
      onChange({
        ...formData,
        tags: [...currentTags, tag],
      });
    }
  };

  const removeTag = (tagToRemove: string) => {
    const updatedTags = (formData.tags || []).filter((tag) => tag !== tagToRemove);
    onChange({
      ...formData,
      tags: updatedTags,
    });
  };

  // 內容類型選項
  const contentTypeOptions = [
    {
      value: 'book', label: '書籍', unit: '頁', icon: Book,
    },
    {
      value: 'video', label: '影片課程', unit: '集', icon: Video,
    },
    {
      value: 'articles', label: '文章', unit: '篇', icon: FileText,
    },
    {
      value: 'podcast', label: 'Podcast', unit: '集', icon: Headphones,
    },
    {
      value: 'course', label: '課程', unit: '堂', icon: GraduationCap,
    },
    {
      value: 'custom', label: '自定義', unit: '項', icon: Settings,
    },
  ];

  const currentContentType = contentTypeOptions.find((option) => option.value === practice.contentType);

  return (
    <div className="space-y-8">
      {/* 基本資訊 */}
      <div className="space-y-6">
        <div className="mb-4 flex items-center space-x-3">
          <BookOpen className="size-5 text-primary-base" />
          <h3 className="heading-sm text-basic-600">基本資訊</h3>
        </div>

        {/* 標題 */}
        <div className="space-y-2">
          <Label htmlFor="title" className="text-basic-600">
            標題
            {' '}
            <span className="text-destructive">*</span>
          </Label>
          <Input
            id="title"
            value={formData.title || ''}
            onChange={(e) => handleFieldChange('title', e.target.value)}
            placeholder="輸入實踐標題"
            className={cn(
              'text-basic-600 placeholder:text-basic-400',
              errors.title && 'border-destructive focus:ring-destructive'
            )}
          />
          {errors.title && (
            <p className="text-sm text-destructive">{errors.title}</p>
          )}
        </div>

        {/* 實踐類型（只顯示，不可編輯） */}
        <div className="space-y-2">
          <Label className="text-basic-600">實踐類型</Label>
          <div className="flex items-center gap-3 rounded-lg border border-basic-200 bg-basic-50 px-3 py-2">
            {currentContentType?.icon && (
              <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-basic-100 text-basic-400">
                {React.createElement(currentContentType.icon, { className: 'size-4' })}
              </div>
            )}
            <p className="font-medium text-basic-600">
              {practice.contentType === 'custom' ? practice.customContentType || '自定義' : (currentContentType?.label || practice.contentType)}
            </p>
          </div>
          <p className="text-xs text-basic-400">實踐類型在建立後無法修改</p>
        </div>
      </div>

      {/* 標籤設定 */}
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <Label className="text-basic-600">標籤設定</Label>
          <span className="text-sm text-basic-400">
            (
            {(formData.tags || []).length}
            /3)
          </span>
        </div>

        <p className="text-sm text-basic-400">
          從預設標籤中選擇來分類你的實踐
        </p>

        {/* 標籤下拉選單 */}
        <div>
          <Select
            disabled={(formData.tags || []).length >= 3}
            onValueChange={(value) => {
              if (value && !(formData.tags || []).includes(value) && (formData.tags || []).length < 3) {
                addTag(value);
              }
            }}
          >
            <SelectTrigger className={cn(
              'text-basic-600',
              (formData.tags || []).length >= 3 && 'opacity-50 cursor-not-allowed'
            )}
            >
              <SelectValue placeholder={(formData.tags || []).length >= 3 ? '已達到最多標籤數量' : '選擇標籤'} />
            </SelectTrigger>
            <SelectContent>
              <div className="space-y-1">
                <p className="px-2 py-1.5 text-xs font-semibold text-basic-400">分類標籤</p>
                {defaultTags.categories
                  .filter((tag) => !(formData.tags || []).includes(tag.label))
                  .map((tag) => (
                    <SelectItem key={tag.id} value={tag.label}>
                      <span className={cn('px-2 py-1 rounded text-xs font-medium', tag.color)}>
                        {tag.label}
                      </span>
                    </SelectItem>
                  ))}

                <p className="px-2 py-1.5 text-xs font-semibold text-basic-400">難度標籤</p>
                {defaultTags.difficulty
                  .filter((tag) => !(formData.tags || []).includes(tag.label))
                  .map((tag) => (
                    <SelectItem key={tag.id} value={tag.label}>
                      <span className={cn('px-2 py-1 rounded text-xs font-medium', tag.color)}>
                        {tag.label}
                      </span>
                    </SelectItem>
                  ))}

                <p className="px-2 py-1.5 text-xs font-semibold text-basic-400">時長標籤</p>
                {defaultTags.duration
                  .filter((tag) => !(formData.tags || []).includes(tag.label))
                  .map((tag) => (
                    <SelectItem key={tag.id} value={tag.label}>
                      <span className={cn('px-2 py-1 rounded text-xs font-medium', tag.color)}>
                        {tag.label}
                      </span>
                    </SelectItem>
                  ))}
              </div>
            </SelectContent>
          </Select>
        </div>

        {/* 已選標籤 */}
        {(formData.tags || []).length > 0 && (
          <div className="space-y-3">
            <Label className="text-basic-600">已選標籤</Label>
            <div className="flex flex-wrap gap-2">
              {(formData.tags || []).map((tag) => (
                <div
                  key={tag}
                  className="flex items-center rounded-lg border border-primary/20 bg-primary-lightest px-3 py-2"
                >
                  <span className="mr-2 text-sm font-medium text-primary">{tag}</span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeTag(tag)}
                    className="size-auto p-0 text-primary hover:text-destructive"
                  >
                    <X className="size-3" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 目標設定 */}
      <div className="space-y-6">
        <div className="mb-4 flex items-center space-x-3">
          <Target className="size-5 text-primary-base" />
          <h3 className="heading-sm text-basic-600">目標設定</h3>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {/* 總量 */}
          <div className="space-y-2">
            <Label htmlFor="totalAmount" className="text-basic-600">
              總量
              {' '}
              <span className="text-destructive">*</span>
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
                  'pr-12 text-basic-600 placeholder:text-basic-400',
                  errors.totalAmount && 'border-destructive focus:ring-destructive'
                )}
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-basic-400">
                {currentContentType?.unit || '項'}
              </span>
            </div>
            {errors.totalAmount && (
              <p className="text-sm text-destructive">{errors.totalAmount}</p>
            )}
          </div>

          {/* 開始日期 */}
          <div className="space-y-2">
            <Label htmlFor="startDate" className="text-basic-600">開始日期</Label>
            <Input
              id="startDate"
              type="date"
              value={formData.startDate || ''}
              onChange={(e) => handleFieldChange('startDate', e.target.value)}
              className={cn(
                'text-basic-600',
                errors.startDate && 'border-destructive focus:ring-destructive'
              )}
            />
            {errors.startDate && (
              <p className="text-sm text-destructive">{errors.startDate}</p>
            )}
          </div>
        </div>

        {/* 每日目標設定 */}
        <div className="mt-6 space-y-4">
          <Label className="text-basic-600">每次實踐目標</Label>
          <RadioGroup
            value={formData.dailyGoal?.type || 'time'}
            onValueChange={(value) => {
              onChange({
                ...formData,
                dailyGoal: {
                  ...formData.dailyGoal,
                  type: value as 'time' | 'completion',
                },
              });
            }}
            className="flex items-center space-x-6"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="time" id="time-edit" />
              <Label htmlFor="time-edit" className="flex items-center text-sm font-medium text-basic-600">
                <Clock className="mr-1 size-4" />
                按時間
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="completion" id="completion-edit" />
              <Label htmlFor="completion-edit" className="flex items-center text-sm font-medium text-basic-600">
                <BarChart className="mr-1 size-4" />
                按完成量
              </Label>
            </div>
          </RadioGroup>

          {/* 時間目標 */}
          {formData.dailyGoal?.type === 'time' && (
            <div className="space-y-2">
              <Label htmlFor="dailyTime" className="text-basic-600">每次進行</Label>
              <div className="relative">
                <Input
                  id="dailyTime"
                  type="number"
                  value={formData.dailyGoal?.timeMinutes || 30}
                  onChange={(e) => {
                    onChange({
                      ...formData,
                      dailyGoal: {
                        ...formData.dailyGoal,
                        type: 'time',
                        timeMinutes: parseInt(e.target.value, 10) || 30,
                      },
                    });
                  }}
                  min="5"
                  max="240"
                  className="pr-12 text-basic-600"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-basic-400">
                  分鐘
                </span>
              </div>
            </div>
          )}

          {/* 完成量目標 */}
          {formData.dailyGoal?.type === 'completion' && (
            <div className="space-y-2">
              <Label htmlFor="dailyAmount" className="text-basic-600">每次完成</Label>
              <div className="relative">
                <Input
                  id="dailyAmount"
                  type="number"
                  value={formData.dailyGoal?.amount || 10}
                  onChange={(e) => {
                    onChange({
                      ...formData,
                      dailyGoal: {
                        ...formData.dailyGoal,
                        type: 'completion',
                        amount: parseInt(e.target.value, 10) || 1,
                        unit: formData.dailyGoal?.unit || currentContentType?.unit || '項',
                      },
                    });
                  }}
                  min="1"
                  max="100"
                  className="pr-12 text-basic-600"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-basic-400">
                  {formData.dailyGoal?.unit || currentContentType?.unit || '項'}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 實踐行動 */}
      <div className="space-y-6">
        <div className="mb-4 flex items-center space-x-3">
          <Target className="size-5 text-primary-base" />
          <h3 className="heading-sm text-basic-600">實踐行動</h3>
        </div>

        <div className="space-y-2">
          <Label htmlFor="practiceAction" className="text-basic-600">描述你的實踐行動</Label>
          <Textarea
            id="practiceAction"
            value={formData.practiceAction || ''}
            onChange={(e) => handleFieldChange('practiceAction', e.target.value)}
            placeholder="例如：每天閱讀30分鐘，並記錄學習筆記"
            rows={3}
            className="resize-none text-basic-600 placeholder:text-basic-400"
            maxLength={200}
          />
          <div className="text-right text-xs text-basic-400">
            {(formData.practiceAction || '').length}
            /200
          </div>
        </div>
      </div>

      {/* 學習資源 */}
      <div id="resources" className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <LinkIcon className="size-5 text-primary-base" />
            <h3 className="heading-sm text-basic-600">資源</h3>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={addResource}
            disabled={(formData.resources || []).length >= 5}
          >
            <Plus className="mr-2 size-4" />
            新增資源
          </Button>
        </div>

        <div className="space-y-4">
          {(formData.resources || []).map((resource, index) => (
            <div key={resource.id} className="rounded-lg border border-border p-4">
              <div className="flex items-start space-x-3">
                <span className="body-sm mt-2 flex size-6 shrink-0 items-center justify-center rounded-full bg-secondary font-medium text-secondary-foreground">
                  {index + 1}
                </span>
                <div className="flex-1 space-y-3">
                  <div>
                    <Input
                      value={resource.name}
                      onChange={(e) => handleResourceChange(resource.id, 'name', e.target.value)}
                      onBlur={(e) => validateResourceField(resource.id, 'name', e.target.value)}
                      placeholder="資源名稱"
                      className={cn(resourceErrors[resource.id]?.name && 'border-destructive')}
                    />
                    {resourceErrors[resource.id]?.name && (
                      <div className="mt-1 flex items-center text-xs text-destructive">
                        <AlertCircle className="mr-1 size-3" />
                        <span>{resourceErrors[resource.id].name}</span>
                      </div>
                    )}
                  </div>
                  <div>
                    <Input
                      type="url"
                      value={resource.url || ''}
                      onChange={(e) => handleResourceChange(resource.id, 'url', e.target.value)}
                      onBlur={(e) => validateResourceField(resource.id, 'url', e.target.value)}
                      placeholder="資源連結（選填）"
                      className={cn(resourceErrors[resource.id]?.url && 'border-destructive')}
                    />
                    {resourceErrors[resource.id]?.url && (
                      <div className="mt-1 flex items-center text-xs text-destructive">
                        <AlertCircle className="mr-1 size-3" />
                        <span>{resourceErrors[resource.id].url}</span>
                      </div>
                    )}
                  </div>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeResource(resource.id)}
                  className="mt-1 p-2 text-muted-foreground hover:text-alert"
                >
                  <X className="size-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>

        {(formData.resources || []).length === 0 && (
          <div className="rounded-lg border border-basic-200 bg-basic-50 py-8 text-center">
            <p className="text-sm text-basic-400 mb-4">尚未添加任何資源</p>
            <Button
              type="button"
              onClick={addResource}
              className="bg-primary-base text-white hover:bg-primary-base/90"
            >
              <Plus className="mr-2 size-4" />
              添加資源
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default EditForm;
