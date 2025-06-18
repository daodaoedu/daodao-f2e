import React from 'react';
import { Plus, X, Hash } from 'lucide-react';
import { contentTypeOptions, defaultTags } from '@/constants/practice';
import { PathInfo } from '@/services/practice/schema';
import { cn } from '@/utils/cn';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface Step1Props {
  pathInfo: PathInfo;
  handlePathInfoChange: (field: keyof PathInfo, value: string | number) => void;
  handleNextStep: () => void;
  validationErrors?: Record<string, string>;
  smallGoals: Array<{id: number; content: string}>;
  newSmallGoal: string;
  setNewSmallGoal: (value: string) => void;
  addSmallGoal: () => void;
  removeSmallGoal: (id: number) => void;
  // 新增：標籤相關
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
  smallGoals,
  newSmallGoal,
  setNewSmallGoal,
  addSmallGoal,
  removeSmallGoal,
  selectedTags,
  customTag,
  setCustomTag,
  addTag,
  removeTag,
  addCustomTag
}) => {
  return (
    <div className="bg-white rounded-lg border border-border shadow-sm overflow-hidden">
      <div className="p-6">
        <div className="flex items-center mb-2">
          <div className="w-2 h-2 rounded-full mr-2 bg-primary" />
          <span className="body-sm text-muted-foreground">主題實踐</span>
        </div>
        <h3 className="heading-lg text-foreground">你想嘗試什麼？</h3>
        <p className="body-sm text-muted-foreground mt-1">
          給你的主題實踐一個清晰的名稱
        </p>
      </div>

      <div className="px-6 pb-6 space-y-6">
        {/* 標題輸入 */}
        <div className="space-y-2">
          <Label htmlFor="pathTitle">
            我想要... <span className="text-destructive">*</span>
          </Label>
          <Input
            id="pathTitle"
            placeholder="例如：閱讀《原子習慣》或《30天瑜伽挑戰》"
            value={pathInfo.title}
            onChange={(e) => handlePathInfoChange('title', e.target.value)}
            className={cn(validationErrors.title && "border-destructive focus:ring-destructive")}
          />
          {validationErrors.title && (
            <p className="text-sm text-destructive">{validationErrors.title}</p>
          )}
        </div>

        {/* 內容類型選擇 */}
        <div className="space-y-3">
          <Label>
            實踐類型 <span className="text-destructive">*</span>
          </Label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {contentTypeOptions.map((option) => {
              const Icon = option.icon;
              const isSelected = pathInfo.contentType === option.id;
              const hasError = validationErrors.contentType;

              return (
                <div
                  key={option.id}
                  className={cn(
                    "flex items-center p-3 border rounded-lg cursor-pointer transition-all hover:bg-accent",
                    isSelected && "border-primary bg-primary/5",
                    hasError && "border-destructive",
                    !isSelected && !hasError && "border-border"
                  )}
                  onClick={() => handlePathInfoChange('contentType', option.id)}
                  onKeyDown={(e) => e.key === 'Enter' && handlePathInfoChange('contentType', option.id)}
                  role="button"
                  tabIndex={0}
                >
                  <div
                    className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center mr-3",
                      isSelected
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground"
                    )}
                  >
                    <Icon className="h-4 w-4" />
                  </div>
                  <div>
                    <p className={cn(
                      "font-medium",
                      isSelected ? "text-primary" : "text-foreground"
                    )}
                    >
                      {option.label}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
          {validationErrors.contentType && (
            <p className="text-sm text-destructive">{validationErrors.contentType}</p>
          )}
        </div>

        {/* 標籤設定 */}
        <div className="space-y-4 border-t border-border pt-6">
          <div className="flex items-center space-x-2">
            <Hash className="h-4 w-4 text-primary" />
            <Label>標籤設定</Label>
            <span className="text-sm text-muted-foreground">({selectedTags.length}/8)</span>
          </div>

          <p className="text-sm text-muted-foreground">
            選擇或自定義標籤，幫助你更好地分類和管理實踐
          </p>

          {/* 預設標籤 */}
          <div className="space-y-3">
            <div>
              <p className="text-sm font-medium text-foreground mb-2">分類標籤</p>
              <div className="flex flex-wrap gap-2">
                {defaultTags.categories.map((tag) => (
                  <Button
                    key={tag.id}
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => addTag(tag.label)}
                    disabled={selectedTags.includes(tag.label) || selectedTags.length >= 8}
                    className={cn(
                      "px-3 py-1 h-auto text-xs font-medium transition-all",
                      tag.color,
                      selectedTags.includes(tag.label)
                        ? "opacity-50 cursor-not-allowed"
                        : "hover:scale-105 cursor-pointer",
                      selectedTags.length >= 8 && !selectedTags.includes(tag.label) && "opacity-30 cursor-not-allowed"
                    )}
                  >
                    {tag.label}
                  </Button>
                ))}
              </div>
            </div>

            <div>
              <p className="text-sm font-medium text-foreground mb-2">難度標籤</p>
              <div className="flex flex-wrap gap-2">
                {defaultTags.difficulty.map((tag) => (
                  <Button
                    key={tag.id}
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => addTag(tag.label)}
                    disabled={selectedTags.includes(tag.label) || selectedTags.length >= 8}
                    className={cn(
                      "px-3 py-1 h-auto text-xs font-medium transition-all",
                      tag.color,
                      selectedTags.includes(tag.label)
                        ? "opacity-50 cursor-not-allowed"
                        : "hover:scale-105 cursor-pointer",
                      selectedTags.length >= 8 && !selectedTags.includes(tag.label) && "opacity-30 cursor-not-allowed"
                    )}
                  >
                    {tag.label}
                  </Button>
                ))}
              </div>
            </div>

            <div>
              <p className="text-sm font-medium text-foreground mb-2">時長標籤</p>
              <div className="flex flex-wrap gap-2">
                {defaultTags.duration.map((tag) => (
                  <Button
                    key={tag.id}
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => addTag(tag.label)}
                    disabled={selectedTags.includes(tag.label) || selectedTags.length >= 8}
                    className={cn(
                      "px-3 py-1 h-auto text-xs font-medium transition-all",
                      tag.color,
                      selectedTags.includes(tag.label)
                        ? "opacity-50 cursor-not-allowed"
                        : "hover:scale-105 cursor-pointer",
                      selectedTags.length >= 8 && !selectedTags.includes(tag.label) && "opacity-30 cursor-not-allowed"
                    )}
                  >
                    {tag.label}
                  </Button>
                ))}
              </div>
            </div>
          </div>

          {/* 自定義標籤 */}
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
                disabled={!customTag.trim() || selectedTags.length >= 8 || selectedTags.includes(customTag.trim())}
                size="default"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* 已選標籤 */}
          {selectedTags.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm font-medium text-foreground">已選標籤</p>
              <div className="flex flex-wrap gap-2">
                {selectedTags.map((tag) => (
                  <div
                    key={tag}
                    className="flex items-center px-3 py-1 bg-primary/10 border border-primary/20 rounded-full"
                  >
                    <span className="text-xs font-medium text-primary mr-2">{tag}</span>
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

        {/* 小目標設定 */}
        <div className="space-y-4 border-t border-border pt-6">
          <div className="flex justify-between items-center">
            <Label>設定你的小目標</Label>
            <span className="body-sm text-muted-foreground">{smallGoals.length}/3</span>
          </div>

          <p className="text-sm text-muted-foreground">
            設定具體可衡量的小目標，幫助你保持動力並追蹤進度
          </p>

          <div className="flex space-x-2">
            <Input
              className="flex-1"
              placeholder="例如：完成5章內容、學習10個新概念"
              value={newSmallGoal}
              onChange={(e) => setNewSmallGoal(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter' && newSmallGoal.trim() && smallGoals.length < 3) {
                  addSmallGoal();
                }
              }}
            />
            <Button
              type="button"
              onClick={addSmallGoal}
              disabled={!newSmallGoal.trim() || smallGoals.length >= 3}
              size="default"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>

          <div className="space-y-2">
            {smallGoals.map((goal) => (
              <div
                key={goal.id}
                className="flex items-center p-3 bg-primary/5 border border-primary/20 rounded-lg"
              >
                <div className="w-2 h-2 rounded-full mr-3 bg-primary" />
                <span className="flex-1 text-sm">{goal.content}</span>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeSmallGoal(goal.id)}
                  className="text-muted-foreground hover:text-destructive p-1"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}

            {smallGoals.length === 0 && (
              <div className="text-center py-6 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground">尚未添加任何小目標</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="px-6 py-4 border-t border-border flex justify-end">
        <Button
          onClick={handleNextStep}
          disabled={!pathInfo.title.trim()}
          className="min-w-20"
        >
          下一步
        </Button>
      </div>
    </div>
  );
};

export default Step1;
