import React, { useState } from 'react';
import {
  ArrowLeft, CheckCircle, Heart, Frown, Minus as Meh, Smile, Star, Plus, X,
} from 'lucide-react';
import { Practice, MoodType, CheckInInput } from '@/services/practice/schema';
import { CheckInService } from '@/features/practice';
import { usePracticeManager } from '@/features/practice/hooks';
import { useScrollToTop } from '@/features/practice/hooks/useScrollToTop';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Textarea } from '@/shared/ui/textarea';
import { Label } from '@/shared/ui/label';

interface CheckInViewProps {
  practice: Practice;
  onBack: () => void;
  onSuccess?: () => void;
}

const CheckInView: React.FC<CheckInViewProps> = ({
  practice,
  onBack,
  onSuccess,
}) => {
  const { checkIn } = usePracticeManager();
  const { scrollToTop } = useScrollToTop();

  const [progress, setProgress] = useState<number>(1);
  const [note, setNote] = useState<string>('');
  const [mood, setMood] = useState<MoodType | undefined>(undefined);
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState<string>('');
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [errors, setErrors] = useState<string[]>([]);

  // 檢查是否可以打卡
  const canCheckIn = !CheckInService.hasCheckedInToday(practice);

  // 心情選項
  const moodOptions = [
    {
      value: 'excellent' as MoodType, label: '優秀', icon: Star, color: '#10b981',
    },
    {
      value: 'good' as MoodType, label: '良好', icon: Smile, color: '#06b6d4',
    },
    {
      value: 'average' as MoodType, label: '普通', icon: Meh, color: '#6b7280',
    },
    {
      value: 'challenging' as MoodType, label: '有挑戰', icon: Heart, color: '#f59e0b',
    },
    {
      value: 'difficult' as MoodType, label: '困難', icon: Frown, color: '#ef4444',
    },
  ];

  // 常用標籤建議
  const suggestedTags = ['閱讀', '筆記', '練習', '複習', '新概念', '困難', '有趣', '完成章節'];

  // 計算進度百分比
  const newProgressPercentage = Math.round(((practice.currentProgress + progress) / practice.totalAmount) * 100);

  // 處理標籤添加
  const handleAddTag = () => {
    if (newTag.trim() && tags.length < 5 && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()]);
      setNewTag('');
    }
  };

  // 處理標籤刪除
  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove));
  };

  // 添加建議標籤
  const handleAddSuggestedTag = (tag: string) => {
    if (tags.length < 5 && !tags.includes(tag)) {
      setTags([...tags, tag]);
    }
  };

  // 處理打卡提交
  const handleSubmit = async () => {
    if (!canCheckIn) {
      setErrors(['今天已經打卡過了']);
      return;
    }

    const checkInInput: CheckInInput = {
      practiceId: practice.id,
      progress,
      note: note.trim(),
      mood,
      tags: tags.filter((tag) => tag.trim()),
    };

    // 驗證輸入
    const validation = CheckInService.validateCheckInInput(practice, checkInInput);
    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }

    setSubmitting(true);
    setErrors([]);

    try {
      await checkIn(checkInInput);

      // 打卡成功，顯示成功訊息
      if (onSuccess) {
        // 滾動到頂部
        scrollToTop('smooth');
        onSuccess();
      } else {
        // 滾動到頂部
        scrollToTop('smooth');
        onBack();
      }
    } catch (error) {
      setErrors([error instanceof Error ? error.message : '打卡失敗']);
    } finally {
      setSubmitting(false);
    }
  };

  // 如果已經打卡，顯示已打卡狀態
  if (!canCheckIn) {
    const todayCheckIn = CheckInService.getTodayCheckIn(practice);

    return (
      <div className="mx-auto max-w-md p-4">
        <Button
          variant="ghost"
          onClick={onBack}
          className="text-basic-600 hover:text-basic-800 mb-4 flex items-center transition-colors"
        >
          <ArrowLeft className="mr-2 size-4" />
          <span>返回儀表板</span>
        </Button>

        <div className="overflow-hidden rounded-lg border border-basic-200 bg-white shadow-md">
          <div className="p-6 text-center">
            <CheckCircle className="mx-auto mb-4 size-16 text-success" />
            <h3 className="heading-md mb-2 text-basic-black">今日已打卡</h3>
            <p className="text-basic-600 body-md mb-4">
              你今天已經完成打卡了！明天再來繼續學習吧。
            </p>

            {todayCheckIn && (
              <div className="bg-basic-50 rounded-lg p-4 text-left">
                <h4 className="text-basic-700 body-sm mb-2 font-medium">今日打卡記錄</h4>
                <div className="text-basic-600 body-sm space-y-2">
                  <div>
                    進度：+
                    {todayCheckIn.progress}
                    {' '}
                    {practice.unit}
                  </div>
                  <div>
                    總進度：
                    {todayCheckIn.totalProgress}
                    /
                    {practice.totalAmount}
                    {' '}
                    {practice.unit}
                  </div>
                  {todayCheckIn.note && (
                  <div>
                    筆記：
                    {todayCheckIn.note}
                  </div>
                  )}
                  {todayCheckIn.mood && (
                    <div className="flex items-center gap-1">
                      心情：
                      {(() => {
                        const moodOption = moodOptions.find((m) => m.value === todayCheckIn.mood);
                        return (
                          <>
                            {moodOption?.icon && React.createElement(moodOption.icon, { className: 'h-4 w-4' })}
                            {moodOption?.label}
                          </>
                        );
                      })()}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-md p-4">
      <Button
        variant="ghost"
        onClick={onBack}
        className="text-basic-600 hover:text-basic-800 mb-4 flex items-center transition-colors"
      >
        <ArrowLeft className="mr-2 size-4" />
        <span>返回儀表板</span>
      </Button>

      <div className="overflow-hidden rounded-lg border border-basic-200 bg-white shadow-md">
        {/* 標題 */}
        <div className="border-b border-basic-200 p-6">
          <h3 className="heading-lg text-basic-black">
            {practice.title}
            打卡
          </h3>
        </div>

        {/* 錯誤訊息 */}
        {errors.length > 0 && (
          <div className="bg-alert-lighter border-l-4 border-alert p-4">
            <ul className="text-alert-darker body-sm">
              {errors.map((error) => (
                <li key={error}>
                  •
                  {error}
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="space-y-6 p-6">

          {/* 進度輸入 */}
          <div>
            <Label htmlFor="progress-input" className="text-basic-700 body-sm mb-2 block w-full font-medium">
              今日實踐進度
              {' '}
              <span className="text-alert">*</span>
            </Label>
            <div className="mt-2 flex items-center space-x-3">
              <div className="relative flex-1">
                <Input
                  id="progress-input"
                  type="number"
                  value={progress}
                  onChange={(e) => setProgress(Math.max(1, parseInt(e.target.value, 10) || 1))}
                  min="1"
                  max={practice.totalAmount - practice.currentProgress}
                  className="w-full"
                />
                <span className="body-sm absolute right-3 top-2 text-basic-500">
                  {practice.unit}
                </span>
              </div>
            </div>
            {/* 新進度預覽 */}
            <div className="bg-success-lightest mt-3 rounded-lg p-3">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-success-darker body-sm font-medium">
                  {newProgressPercentage}
                  % 完成
                </span>
              </div>
              <div className="h-2 w-full rounded-full bg-basic-200">
                <div className={`h-2 rounded-full bg-success transition-all duration-300 ${
                  newProgressPercentage >= 100 ? 'w-full'
                    : newProgressPercentage >= 90 ? 'w-[90%]'
                      : newProgressPercentage >= 80 ? 'w-4/5'
                        : newProgressPercentage >= 70 ? 'w-[70%]'
                          : newProgressPercentage >= 60 ? 'w-3/5'
                            : newProgressPercentage >= 50 ? 'w-1/2'
                              : newProgressPercentage >= 40 ? 'w-2/5'
                                : newProgressPercentage >= 30 ? 'w-[30%]'
                                  : newProgressPercentage >= 20 ? 'w-1/5'
                                    : newProgressPercentage >= 10 ? 'w-[10%]' : 'w-[5%]'
                }`}
                />
              </div>
            </div>
          </div>

          {/* 心情 */}
          <div>
            <span className="text-basic-700 body-sm mb-3 block font-medium">
              心情
            </span>
            <div className="grid grid-cols-5 gap-2">
              {moodOptions.map((option) => {
                const isSelected = mood === option.value;

                return (
                  <Button
                    key={option.value}
                    variant="ghost"
                    onClick={() => setMood(option.value)}
                    className={`rounded-lg border-2 p-2 text-center transition-all ${isSelected
                      ? 'border-primary-base bg-primary-palest'
                      : 'hover:bg-basic-50 border-basic-200 hover:border-basic-300'
                    }`}
                  >
                    <div className="flex items-center justify-center gap-1">
                      {React.createElement(option.icon, {
                        className: `h-4 w-4 ${
                          option.value === 'excellent' ? 'text-green-500'
                            : option.value === 'good' ? 'text-cyan-500'
                              : option.value === 'average' ? 'text-gray-500'
                                : option.value === 'challenging' ? 'text-amber-500'
                                  : option.value === 'difficult' ? 'text-red-500' : 'text-gray-400'
                        }`,
                      })}
                      <span className="text-basic-700 text-xs">{option.label}</span>
                    </div>
                  </Button>
                );
              })}
            </div>
          </div>

          {/* 打卡標籤 */}
          <div>
            <Label className="text-basic-700 body-sm mb-2 block font-medium">
              打卡標籤 (最多5個)
            </Label>
            {tags.length < 5 && (
              <div className="mb-3 flex space-x-2">
                <Input
                  type="text"
                  id="new-tag-input"
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleAddTag()}
                  placeholder="輸入標籤"
                  maxLength={20}
                  className="flex-1"
                />
                <Button
                  onClick={handleAddTag}
                  disabled={!newTag.trim()}
                  size="sm"
                  className="px-3 py-2"
                >
                  <Plus className="size-4" />
                </Button>
              </div>
            )}

            {/* 當前標籤 */}
            {tags.length > 0 && (
              <div className="mb-3 flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className="body-sm inline-flex items-center rounded-full bg-primary-base px-3 py-1 text-white"
                  >
                    {tag}
                    <Button
                      onClick={() => handleRemoveTag(tag)}
                      variant="ghost"
                      size="sm"
                      className="ml-2 size-auto p-0 text-white hover:text-basic-200"
                    >
                      <X className="size-3" />
                    </Button>
                  </span>
                ))}
              </div>
            )}

            {/* 建議標籤 */}
            {tags.length < 5 && (
              <div>
                <div className="text-basic-600 body-sm mb-2">常用標籤：</div>
                <div className="flex flex-wrap gap-2">
                  {suggestedTags
                    .filter((tag) => !tags.includes(tag))
                    .slice(0, 8 - tags.length)
                    .map((tag) => (
                      <Button
                        key={tag}
                        variant="ghost"
                        onClick={() => handleAddSuggestedTag(tag)}
                        className="text-basic-600 body-sm h-auto rounded-full border border-basic-300 px-3 py-1 transition-colors hover:border-primary-base hover:text-primary-base"
                      >
                        {tag}
                      </Button>
                    ))}
                </div>
              </div>
            )}
          </div>

          {/* 心情或想法? */}
          <div>
            <Label htmlFor="note-input" className="text-basic-700 body-sm mb-2 block font-medium">
              心情或想法?
            </Label>
            <Textarea
              id="note-input"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="有什麼心得或困難嗎？"
              rows={4}
              maxLength={500}
              className="w-full resize-none"
            />
            <div className="body-sm mt-1 text-right text-basic-500">
              {note.length}
              /500
            </div>
          </div>
        </div>

        {/* 操作按鈕 */}
        <div className="bg-basic-50 border-t border-basic-200 p-6">
          <Button
            onClick={handleSubmit}
            disabled={submitting || progress <= 0}
            className="flex w-full items-center justify-center space-x-2"
          >
            {submitting ? (
              <>
                <div className="size-4 animate-spin rounded-full border-b-2 border-white" />
                <span>打卡中...</span>
              </>
            ) : (
              <>
                <CheckCircle className="size-4" />
                <span>完成打卡</span>
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CheckInView;
