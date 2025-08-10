import React, { useState } from 'react';
import {
  Plus, X, Target, BookOpen, Link as LinkIcon, Clock, BarChart, Book, Video, FileText, Headphones, GraduationCap, Settings, AlertCircle,
} from 'lucide-react';
import { Practice, Resource, ResourceType } from '@/features/practice';
import { cn } from '@/utils/cn';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
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
        <div className="flex items-center space-x-3 mb-4">
          <BookOpen className="h-5 w-5 text-primary-base" />
          <h3 className="heading-sm text-basic-black">基本資訊</h3>
        </div>

        {/* 標題 */}
        <div className="space-y-2">
          <Label htmlFor="title">
            標題
            {' '}
            <span className="text-alert">*</span>
          </Label>
          <Input
            id="title"
            value={formData.title || ''}
            onChange={(e) => handleFieldChange('title', e.target.value)}
            placeholder="輸入實踐標題"
            className={cn(errors.title && 'border-alert focus:ring-alert')}
          />
          {errors.title && (
            <p className="body-sm text-alert">{errors.title}</p>
          )}
        </div>

        {/* 實踐類型（只顯示，不可編輯） */}
        <div className="space-y-2">
          <Label>實踐類型</Label>
          <div className="px-3 py-2 bg-muted border border-input rounded-md body-sm text-muted-foreground flex items-center gap-2">
            {currentContentType?.icon && React.createElement(currentContentType.icon, { className: 'h-4 w-4' })}
            {practice.contentType === 'custom' ? practice.customContentType || '自定義' : (currentContentType?.label || practice.contentType)}
          </div>
          <p className="body-sm text-muted-foreground">實踐類型在建立後無法修改</p>
        </div>
      </div>

      {/* 標籤設定 */}
      <div className="space-y-6">
        <div className="flex items-center space-x-3 mb-4">
          <Label>標籤設定</Label>
          <span className="text-sm text-muted-foreground">
            (
            {(formData.tags || []).length}
            /3)
          </span>
        </div>

        {/* 標籤下拉選單 */}
        <div className="space-y-3">
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
                (formData.tags || []).length >= 3 && 'opacity-50 cursor-not-allowed'
              )}
              >
                <SelectValue placeholder={(formData.tags || []).length >= 3 ? '已達到最多標籤數量' : '選擇標籤'} />
              </SelectTrigger>
              <SelectContent>
                <div className="space-y-1">
                  <p className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">分類標籤</p>
                  {defaultTags.categories
                    .filter((tag) => !(formData.tags || []).includes(tag.label))
                    .map((tag) => (
                      <SelectItem key={tag.id} value={tag.label}>
                        <span className={cn('px-2 py-1 rounded text-xs font-medium', tag.color)}>
                          {tag.label}
                        </span>
                      </SelectItem>
                    ))}

                  <p className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">難度標籤</p>
                  {defaultTags.difficulty
                    .filter((tag) => !(formData.tags || []).includes(tag.label))
                    .map((tag) => (
                      <SelectItem key={tag.id} value={tag.label}>
                        <span className={cn('px-2 py-1 rounded text-xs font-medium', tag.color)}>
                          {tag.label}
                        </span>
                      </SelectItem>
                    ))}

                  <p className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">時長標籤</p>
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
        </div>

        {/* 已選標籤 */}
        {(formData.tags || []).length > 0 && (
          <div className="space-y-2">
            <p className="text-sm font-medium text-foreground">已選標籤</p>
            <div className="flex flex-wrap gap-2">
              {(formData.tags || []).map((tag) => (
                <div
                  key={tag}
                  className="flex items-center px-3 py-2 bg-primary/10 border border-primary/20 rounded-lg"
                >
                  <span className="text-sm font-medium text-primary mr-2">{tag}</span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeTag(tag)}
                    className="text-primary hover:text-destructive p-0 h-auto w-auto"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 目標設定 */}
      <div className="space-y-6">
        <div className="flex items-center space-x-3 mb-4">
          <Target className="h-5 w-5 text-primary-base" />
          <h3 className="heading-sm text-basic-black">目標設定</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* 總量 */}
          <div className="space-y-2">
            <Label htmlFor="totalAmount">
              總量
              {' '}
              <span className="text-alert">*</span>
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
                  'pr-12',
                  errors.totalAmount && 'border-alert focus:ring-alert'
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

          {/* 開始日期 */}
          <div className="space-y-2">
            <Label htmlFor="startDate">開始日期</Label>
            <Input
              id="startDate"
              type="date"
              value={formData.startDate || ''}
              onChange={(e) => handleFieldChange('startDate', e.target.value)}
              className={cn(errors.startDate && 'border-alert focus:ring-alert')}
            />
            {errors.startDate && (
              <p className="body-sm text-alert">{errors.startDate}</p>
            )}
          </div>
        </div>

        {/* 每日目標設定 */}
        <div className="space-y-4 mt-6">
          <Label>每次實踐目標</Label>
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
              <Label htmlFor="time-edit" className="text-sm font-medium flex items-center">
                <Clock className="h-4 w-4 mr-1" />
                按時間
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="completion" id="completion-edit" />
              <Label htmlFor="completion-edit" className="text-sm font-medium flex items-center">
                <BarChart className="h-4 w-4 mr-1" />
                按完成量
              </Label>
            </div>
          </RadioGroup>

          {/* 時間目標 */}
          {formData.dailyGoal?.type === 'time' && (
            <div className="space-y-2">
              <Label htmlFor="dailyTime">每次進行</Label>
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
                  className="pr-12"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 body-sm text-muted-foreground">
                  分鐘
                </span>
              </div>
            </div>
          )}

          {/* 完成量目標 */}
          {formData.dailyGoal?.type === 'completion' && (
            <div className="space-y-2">
              <Label htmlFor="dailyAmount">每次完成</Label>
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
                  className="pr-12"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 body-sm text-muted-foreground">
                  {formData.dailyGoal?.unit || currentContentType?.unit || '項'}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 實踐行動 */}
      <div className="space-y-6">
        <div className="flex items-center space-x-3 mb-4">
          <Target className="h-5 w-5 text-primary-base" />
          <h3 className="heading-sm text-basic-black">實踐行動</h3>
        </div>

        <div className="space-y-2">
          <Label htmlFor="practiceAction">描述你的實踐行動</Label>
          <Textarea
            id="practiceAction"
            value={formData.practiceAction || ''}
            onChange={(e) => handleFieldChange('practiceAction', e.target.value)}
            placeholder="例如：每天閱讀30分鐘，並記錄學習筆記"
            rows={3}
            className="resize-none"
            maxLength={200}
          />
          <div className="text-xs text-muted-foreground text-right">
            {(formData.practiceAction || '').length}
            /200
          </div>
        </div>
      </div>

      {/* 學習資源 */}
      <div id="resources" className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <LinkIcon className="h-5 w-5 text-primary-base" />
            <h3 className="heading-sm text-basic-black">資源</h3>
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
                  <div>
                    <Input
                      value={resource.name}
                      onChange={(e) => handleResourceChange(resource.id, 'name', e.target.value)}
                      onBlur={(e) => validateResourceField(resource.id, 'name', e.target.value)}
                      placeholder="資源名稱"
                      className={cn(resourceErrors[resource.id]?.name && 'border-destructive')}
                    />
                    {resourceErrors[resource.id]?.name && (
                      <div className="flex items-center mt-1 text-xs text-destructive">
                        <AlertCircle className="h-3 w-3 mr-1" />
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
                      <div className="flex items-center mt-1 text-xs text-destructive">
                        <AlertCircle className="h-3 w-3 mr-1" />
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
