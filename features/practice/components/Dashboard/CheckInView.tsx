import React, { useState } from 'react';
import { ArrowLeft, CheckCircle, Heart, Frown, Minus as Meh, Smile, Star, Plus, X } from 'lucide-react';
import { Practice, MoodType, CheckInInput } from '@/services/modules/practice/schema';
import { usePractices } from '@/services/modules/practice/hooks';
import { CheckInService } from '@/services/modules/practice';
import { Button } from '@/components/atoms/button';
import { Input } from '@/components/atoms/input';
import { Textarea } from '@/components/atoms/textarea';
import { Label } from '@/components/atoms/label';

interface CheckInViewProps {
  practice: Practice;
  onBack: () => void;
  onSuccess?: () => void;
}

const CheckInView: React.FC<CheckInViewProps> = ({
  practice,
  onBack,
  onSuccess
}) => {
  const { checkIn } = usePractices();

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
    { value: 'excellent' as MoodType, label: '優秀', icon: Star, color: '#10b981', emoji: '😄' },
    { value: 'good' as MoodType, label: '良好', icon: Smile, color: '#06b6d4', emoji: '😊' },
    { value: 'average' as MoodType, label: '普通', icon: Meh, color: '#6b7280', emoji: '😐' },
    { value: 'challenging' as MoodType, label: '有挑戰', icon: Heart, color: '#f59e0b', emoji: '😤' },
    { value: 'difficult' as MoodType, label: '困難', icon: Frown, color: '#ef4444', emoji: '😰' }
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
      tags: tags.filter((tag) => tag.trim())
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
        onSuccess();
      } else {
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
      <div className="max-w-md mx-auto p-4">
        <Button
          variant="ghost"
          onClick={onBack}
          className="flex items-center text-basic-600 mb-4 hover:text-basic-800 transition-colors"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          <span>返回儀表板</span>
        </Button>

        <div className="bg-white rounded-lg shadow-md border border-basic-200 overflow-hidden">
          <div className="p-6 text-center">
            <CheckCircle className="h-16 w-16 text-success mx-auto mb-4" />
            <h3 className="heading-md text-basic-black mb-2">今日已打卡</h3>
            <p className="body-md text-basic-600 mb-4">
              你今天已經完成打卡了！明天再來繼續學習吧。
            </p>

            {todayCheckIn && (
              <div className="bg-basic-50 rounded-lg p-4 text-left">
                <h4 className="body-sm font-medium text-basic-700 mb-2">今日打卡記錄</h4>
                <div className="space-y-2 body-sm text-basic-600">
                  <div>進度：+{todayCheckIn.progress} {practice.unit}</div>
                  <div>總進度：{todayCheckIn.totalProgress}/{practice.totalAmount} {practice.unit}</div>
                  {todayCheckIn.note && <div>筆記：{todayCheckIn.note}</div>}
                  {todayCheckIn.mood && (
                    <div>心情：{moodOptions.find((m) => m.value === todayCheckIn.mood)?.emoji} {moodOptions.find((m) => m.value === todayCheckIn.mood)?.label}</div>
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
    <div className="max-w-md mx-auto p-4">
      <Button
        variant="ghost"
        onClick={onBack}
        className="flex items-center text-basic-600 mb-4 hover:text-basic-800 transition-colors"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        <span>返回儀表板</span>
      </Button>

      <div className="bg-white rounded-lg shadow-md border border-basic-200 overflow-hidden">
        {/* 標題 */}
        <div className="p-6 border-b border-basic-200">
          <h3 className="heading-lg text-basic-black">{practice.title}打卡</h3>
        </div>

        {/* 錯誤訊息 */}
        {errors.length > 0 && (
          <div className="p-4 bg-alert-lighter border-l-4 border-alert">
            <ul className="body-sm text-alert-darker">
              {errors.map((error) => (
                <li key={error}>• {error}</li>
              ))}
            </ul>
          </div>
        )}

        <div className="p-6 space-y-6">

          {/* 進度輸入 */}
          <div>
            <Label htmlFor="progress-input" className="block body-sm font-medium text-basic-700 mb-2 w-full">
              今日實踐進度 <span className="text-alert">*</span>
            </Label>
            <div className="flex items-center space-x-3 mt-2">
              <div className="flex-1 relative">
                <Input
                  id="progress-input"
                  type="number"
                  value={progress}
                  onChange={(e) => setProgress(Math.max(1, parseInt(e.target.value, 10) || 1))}
                  min="1"
                  max={practice.totalAmount - practice.currentProgress}
                  className="w-full"
                />
                <span className="absolute right-3 top-2 body-sm text-basic-500">
                  {practice.unit}
                </span>
              </div>
            </div>
            {/* 新進度預覽 */}
            <div className="mt-3 bg-success-lightest rounded-lg p-3">
              <div className="flex justify-between items-center mb-2">
                <span className="body-sm font-medium text-success-darker">
                  {newProgressPercentage}% 完成
                </span>
              </div>
              <div className="w-full bg-basic-200 rounded-full h-2">
                <div
                  className="h-2 rounded-full bg-success transition-all duration-300"
                  style={{ width: `${newProgressPercentage}%` }}
                />
              </div>
            </div>
          </div>

          {/* 心情 */}
          <div>
            <span className="block body-sm font-medium text-basic-700 mb-3">
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
                    className={`p-3 rounded-lg border-2 transition-all text-center ${isSelected
                      ? 'border-primary-base bg-primary-palest'
                      : 'border-basic-200 hover:border-basic-300 hover:bg-basic-50'
                      }`}
                  >
                    <div className="text-lg mb-1">{option.emoji}</div>
                    <div className="body-xs text-basic-700">{option.label}</div>
                  </Button>
                );
              })}
            </div>
          </div>

          {/* 打卡標籤 */}
          <div>
            <Label className="block body-sm font-medium text-basic-700 mb-2">
              打卡標籤 (最多5個)
            </Label>
            {tags.length < 5 && (
              <div className="flex space-x-2 mb-3">
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
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            )}

            {/* 當前標籤 */}
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-3">
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center px-3 py-1 rounded-full bg-primary-base text-white body-sm"
                  >
                    {tag}
                    <Button
                      onClick={() => handleRemoveTag(tag)}
                      variant="ghost"
                      size="sm"
                      className="ml-2 text-white hover:text-basic-200 p-0 h-auto w-auto"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </span>
                ))}
              </div>
            )}

            {/* 建議標籤 */}
            {tags.length < 5 && (
              <div>
                <div className="body-sm text-basic-600 mb-2">常用標籤：</div>
                <div className="flex flex-wrap gap-2">
                  {suggestedTags
                    .filter((tag) => !tags.includes(tag))
                    .slice(0, 8 - tags.length)
                    .map((tag) => (
                      <Button
                        key={tag}
                        variant="ghost"
                        onClick={() => handleAddSuggestedTag(tag)}
                        className="px-3 py-1 rounded-full border border-basic-300 text-basic-600 hover:border-primary-base hover:text-primary-base transition-colors body-sm h-auto"
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
            <Label htmlFor="note-input" className="block body-sm font-medium text-basic-700 mb-2">
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
            <div className="mt-1 text-right body-sm text-basic-500">
              {note.length}/500
            </div>
          </div>
        </div>

        {/* 操作按鈕 */}
        <div className="p-6 border-t border-basic-200 bg-basic-50">
          <Button
            onClick={handleSubmit}
            disabled={submitting || progress <= 0}
            className="w-full flex items-center justify-center space-x-2"
          >
            {submitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                <span>打卡中...</span>
              </>
            ) : (
              <>
                <CheckCircle className="h-4 w-4" />
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
