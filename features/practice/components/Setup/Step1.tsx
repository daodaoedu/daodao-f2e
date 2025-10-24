import React from 'react';
import { contentTypeOptions, defaultTags } from '@/constants/practice';
import { PathInfo } from '@/services/practice/schema';
import { cn } from '@/shared/lib/cn';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Label } from '@/shared/ui/label';
import { MultipleSelector } from '@/shared/ui/multiple-selector';
import { OptionProps } from '@/shared/ui/option';

interface Step1Props {
  pathInfo: PathInfo;
  handlePathInfoChange: (field: keyof PathInfo, value: string | number) => void;
  handleNextStep: () => void;
  validationErrors?: Record<string, string>;
  // 標籤相關
  selectedTags: string[];
  setSelectedTags: (tags: string[]) => void;
}

// 準備所有標籤選項
const allTagOptions: OptionProps[] = [
  ...defaultTags.categories.map(tag => ({
    value: tag.label,
    label: tag.label,
    group: '分類標籤',
  })),
  ...defaultTags.difficulty.map(tag => ({
    value: tag.label,
    label: tag.label,
    group: '難度標籤',
  })),
  ...defaultTags.duration.map(tag => ({
    value: tag.label,
    label: tag.label,
    group: '時長標籤',
  })),
];

const Step1: React.FC<Step1Props> = ({
  pathInfo,
  handlePathInfoChange,
  handleNextStep,
  validationErrors = {},
  selectedTags,
  setSelectedTags,
}) => (
  <div>
    <div className="p-6">
      <div className="mb-2 flex items-center">
        <div className="mr-2 size-2 rounded-full bg-primary-base" />
        <span className="body-sm text-basic-400">主題實踐</span>
      </div>
      <h3 className="heading-lg text-basic-600">你想嘗試什麼？</h3>
      <p className="body-sm mt-1 text-basic-400">
        給你的主題實踐一個清晰的名稱
      </p>
    </div>

    <div className="space-y-6 px-6 pb-6">
      {/* 標題輸入 */}
      <div className="space-y-2">
        <Label htmlFor="pathTitle" className="text-basic-600">
          我想要...
          {' '}
          <span className="text-destructive">*</span>
        </Label>
        <div className="relative">
          <Input
            id="pathTitle"
            placeholder="例如：閱讀《原子習慣》或《30天瑜伽挑戰》"
            value={pathInfo.title}
            onChange={(e) => handlePathInfoChange('title', e.target.value)}
            className={cn(
              'text-basic-600 placeholder:text-basic-400',
              validationErrors.title && 'border-destructive focus:ring-destructive'
            )}
            maxLength={100}
          />
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-basic-400">
            {pathInfo.title.length}
            /100
          </span>
        </div>
        {validationErrors.title && (
        <p className="text-sm text-destructive">{validationErrors.title}</p>
        )}
      </div>

      {/* 內容類型選擇 */}
      <div className="space-y-3">
        <Label className="text-basic-600">
          實踐類型
          {' '}
          <span className="text-destructive">*</span>
        </Label>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {contentTypeOptions.map((option) => {
            const Icon = option.icon;
            const isSelected = pathInfo.contentType === option.id;
            const hasError = validationErrors.contentType;

            return (
              <div
                key={option.id}
                className={cn(
                  'flex items-center p-3 border rounded-lg cursor-pointer transition-all hover:bg-basic-50',
                  isSelected && 'border-primary-base bg-primary-palest',
                  hasError && 'border-destructive',
                  !isSelected && !hasError && 'border-basic-200'
                )}
                onClick={() => handlePathInfoChange('contentType', option.id)}
                onKeyDown={(e) => e.key === 'Enter' && handlePathInfoChange('contentType', option.id)}
                role="button"
                tabIndex={0}
              >
                <div
                  className={cn(
                    'w-8 h-8 rounded-full flex items-center justify-center mr-3',
                    isSelected
                      ? 'bg-primary-base text-white'
                      : 'bg-basic-100 text-basic-400'
                  )}
                >
                  <Icon className="size-4" />
                </div>
                <div>
                  <p className={cn(
                    'font-medium',
                    isSelected ? 'text-primary-base' : 'text-basic-600'
                  )}
                  >
                    {option.label}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* 自定義類型輸入框 */}
        {pathInfo.contentType === 'custom' && (
        <div className="mt-3">
          <Label htmlFor="customContentType" className="text-basic-600">
            自定義類型名稱
            {' '}
            <span className="text-destructive">*</span>
          </Label>
          <Input
            id="customContentType"
            placeholder="例如：運動、冥想、寫作..."
            value={pathInfo.customContentType || ''}
            onChange={(e) => handlePathInfoChange('customContentType', e.target.value)}
            className={cn(
              'text-basic-600 placeholder:text-basic-400',
              validationErrors.customContentType && 'border-destructive focus:ring-destructive'
            )}
            maxLength={20}
          />
          {validationErrors.customContentType && (
          <p className="mt-1 text-sm text-destructive">{validationErrors.customContentType}</p>
          )}
          <p className="mt-1 text-xs text-basic-400">
            {(pathInfo.customContentType || '').length}
            /20
          </p>
        </div>
        )}

        {validationErrors.contentType && (
        <p className="text-sm text-destructive">{validationErrors.contentType}</p>
        )}
      </div>

      {/* 標籤設定 */}
      <div className="space-y-4 border-t border-basic-200 pt-6">
        <div className="flex items-center space-x-2">
          <Label className="text-basic-600">標籤設定</Label>
          <span className="text-sm text-basic-400">
            (
            {selectedTags.length}
            /3)
          </span>
        </div>

        <p className="text-sm text-basic-400">
          從預設標籤中選擇，或輸入自定義標籤來分類你的實踐
        </p>

        <MultipleSelector
          value={selectedTags.map(tag => ({ value: tag, label: tag }))}
          onChange={(options: OptionProps[]) => {
            setSelectedTags(options.map(o => o.value));
          }}
          options={allTagOptions}
          placeholder="搜尋或新增標籤（最多3個）"
          maxSelected={3}
          onMaxSelected={() => {
            // 可以在這裡顯示提示訊息
          }}
          creatable
          groupBy="group"
          emptyIndicator={
            <p className="text-center text-sm text-basic-400">沒有找到標籤</p>
          }
        />
      </div>

    </div>

    <div className="flex justify-end border-t border-basic-200 px-6 py-4">
      <Button
        onClick={handleNextStep}
        disabled={
            !pathInfo.title.trim() ||
            !pathInfo.contentType ||
            (pathInfo.contentType === 'custom' && !pathInfo.customContentType?.trim())
          }
        className="min-w-20"
      >
        下一步
      </Button>
    </div>
  </div>
);

export default Step1;
