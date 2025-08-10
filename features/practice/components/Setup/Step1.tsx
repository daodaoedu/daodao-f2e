import React from 'react';
import { Plus, X } from 'lucide-react';
import { contentTypeOptions, defaultTags } from '@/constants/practice';
import { PathInfo } from '@/services/practice/schema';
import { cn } from '@/utils/cn';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface Step1Props {
  pathInfo: PathInfo;
  handlePathInfoChange: (field: keyof PathInfo, value: string | number) => void;
  handleNextStep: () => void;
  validationErrors?: Record<string, string>;
  // 標籤相關
  selectedTags: string[];
  customTag: string;
  setCustomTag: (value: string) => void;
  addTag: (tag: string) => void;
  removeTag: (tag: string) => void;
  addCustomTag: () => void;
}

const Step1: React.FC<Step1Props> = ({
  pathInfo,
  handlePathInfoChange,
  handleNextStep,
  validationErrors = {},
  selectedTags,
  customTag,
  setCustomTag,
  addTag,
  removeTag,
  addCustomTag,
}) => (
  <div className="overflow-hidden rounded-lg border border-border bg-white shadow-sm">
    <div className="p-6">
      <div className="mb-2 flex items-center">
        <div className="mr-2 size-2 rounded-full bg-primary" />
        <span className="body-sm text-muted-foreground">主題實踐</span>
      </div>
      <h3 className="heading-lg text-foreground">你想嘗試什麼？</h3>
      <p className="body-sm mt-1 text-muted-foreground">
        給你的主題實踐一個清晰的名稱
      </p>
    </div>

    <div className="space-y-6 px-6 pb-6">
      {/* 標題輸入 */}
      <div className="space-y-2">
        <Label htmlFor="pathTitle">
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
            className={cn(validationErrors.title && 'border-destructive focus:ring-destructive')}
            maxLength={100}
          />
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
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
        <Label>
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
                  'flex items-center p-3 border rounded-lg cursor-pointer transition-all hover:bg-accent',
                  isSelected && 'border-primary bg-primary/5',
                  hasError && 'border-destructive',
                  !isSelected && !hasError && 'border-border'
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
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground'
                  )}
                >
                  <Icon className="size-4" />
                </div>
                <div>
                  <p className={cn(
                    'font-medium',
                    isSelected ? 'text-primary' : 'text-foreground'
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
          <Label htmlFor="customContentType">
            自定義類型名稱
            {' '}
            <span className="text-destructive">*</span>
          </Label>
          <Input
            id="customContentType"
            placeholder="例如：運動、冥想、寫作..."
            value={pathInfo.customContentType || ''}
            onChange={(e) => handlePathInfoChange('customContentType', e.target.value)}
            className={cn(validationErrors.customContentType && 'border-destructive focus:ring-destructive')}
            maxLength={20}
          />
          {validationErrors.customContentType && (
          <p className="mt-1 text-sm text-destructive">{validationErrors.customContentType}</p>
          )}
          <p className="mt-1 text-xs text-muted-foreground">
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
      <div className="space-y-4 border-t border-border pt-6">
        <div className="flex items-center space-x-2">
          <Label>標籤設定</Label>
          <span className="text-sm text-muted-foreground">
            (
            {selectedTags.length}
            /3)
          </span>
        </div>

        <p className="text-sm text-muted-foreground">
          從預設標籤中選擇，或自定義標籤來分類你的實踐
        </p>

        {/* 標籤下拉選單 */}
        <div className="space-y-3">
          <div>
            <p className="mb-2 text-sm font-medium text-foreground">選擇標籤</p>
            <Select
              disabled={selectedTags.length >= 3}
              onValueChange={(value) => {
                if (value && !selectedTags.includes(value) && selectedTags.length < 3) {
                  addTag(value);
                }
              }}
            >
              <SelectTrigger className={cn(
                selectedTags.length >= 3 && 'opacity-50 cursor-not-allowed'
              )}
              >
                <SelectValue placeholder={selectedTags.length >= 3 ? '已達到最多標籤數量' : '選擇標籤'} />
              </SelectTrigger>
              <SelectContent>
                <div className="space-y-1">
                  <p className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">分類標籤</p>
                  {defaultTags.categories
                    .filter((tag) => !selectedTags.includes(tag.label))
                    .map((tag) => (
                      <SelectItem key={tag.id} value={tag.label}>
                        <span className={cn('px-2 py-1 rounded text-xs font-medium', tag.color)}>
                          {tag.label}
                        </span>
                      </SelectItem>
                    ))}

                  <p className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">難度標籤</p>
                  {defaultTags.difficulty
                    .filter((tag) => !selectedTags.includes(tag.label))
                    .map((tag) => (
                      <SelectItem key={tag.id} value={tag.label}>
                        <span className={cn('px-2 py-1 rounded text-xs font-medium', tag.color)}>
                          {tag.label}
                        </span>
                      </SelectItem>
                    ))}

                  <p className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">時長標籤</p>
                  {defaultTags.duration
                    .filter((tag) => !selectedTags.includes(tag.label))
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

          {/* 自定義標籤 */}
          {selectedTags.length < 3 && (
          <div className="space-y-2">
            <p className="text-sm font-medium text-foreground">自定義標籤</p>
            <div className="flex space-x-2">
              <Input
                className="flex-1"
                placeholder="輸入自定義標籤"
                value={customTag}
                onChange={(e) => setCustomTag(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && customTag.trim()) {
                    addCustomTag();
                  }
                }}
                maxLength={20}
              />
              <Button
                type="button"
                onClick={addCustomTag}
                disabled={!customTag.trim() || selectedTags.length >= 3 || selectedTags.includes(customTag.trim())}
                size="default"
              >
                <Plus className="size-4" />
              </Button>
            </div>
          </div>
          )}
        </div>

        {/* 已選標籤 */}
        {selectedTags.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-medium text-foreground">已選標籤</p>
          <div className="flex flex-wrap gap-2">
            {selectedTags.map((tag) => (
              <div
                key={tag}
                className="flex items-center rounded-lg border border-primary/20 bg-primary/10 px-3 py-2"
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

    </div>

    <div className="flex justify-end border-t border-border px-6 py-4">
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
