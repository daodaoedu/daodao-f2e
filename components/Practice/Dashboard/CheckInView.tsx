import React, { useState } from 'react';
import { IoArrowBackOutline as ArrowLeft, IoCheckmarkCircleOutline as CheckCircle, IoHeartOutline as Heart, IoSadOutline as Frown, IoRemoveOutline as Meh, IoHappyOutline as Smile, IoStarOutline as Star, IoAddOutline as Plus, IoCloseOutline as X } from 'react-icons/io5';
import { Practice, MoodType, CheckInInput } from '../../../services/practice/types';
import { usePractice } from '../../../contexts/PracticeContext';
import { CheckInService } from '../../../services/practice/checkIn';

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
  const { checkIn, canCheckInToday } = usePractice();

  const [progress, setProgress] = useState<number>(1);
  const [note, setNote] = useState<string>('');
  const [mood, setMood] = useState<MoodType | undefined>(undefined);
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState<string>('');
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [errors, setErrors] = useState<string[]>([]);

  // 檢查是否可以簽到
  const canCheckIn = canCheckInToday(practice.id);

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
  const currentProgressPercentage = Math.round((practice.currentProgress / practice.totalAmount) * 100);
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

  // 處理簽到提交
  const handleSubmit = async () => {
    if (!canCheckIn) {
      setErrors(['今天已經簽到過了']);
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

      // 簽到成功，顯示成功訊息
      if (onSuccess) {
        onSuccess();
      } else {
        onBack();
      }
    } catch (error) {
      setErrors([error instanceof Error ? error.message : '簽到失敗']);
    } finally {
      setSubmitting(false);
    }
  };

  // 如果已經簽到，顯示已簽到狀態
  if (!canCheckIn) {
    const todayCheckIn = CheckInService.getTodayCheckIn(practice);

    return (
      <div className="max-w-md mx-auto p-4">
        <button
          type="button"
          className="flex items-center text-basic-600 mb-4 hover:text-basic-800 transition-colors"
          onClick={onBack}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          <span>返回儀表板</span>
        </button>

        <div className="bg-white rounded-lg shadow-md border border-basic-200 overflow-hidden">
          <div className="p-6 text-center">
            <CheckCircle className="h-16 w-16 text-success mx-auto mb-4" />
            <h3 className="heading-md text-basic-black mb-2">今日已簽到</h3>
            <p className="body-md text-basic-600 mb-4">
              你今天已經完成簽到了！明天再來繼續學習吧。
            </p>

            {todayCheckIn && (
              <div className="bg-basic-50 rounded-lg p-4 text-left">
                <h4 className="body-sm font-medium text-basic-700 mb-2">今日簽到記錄</h4>
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
      <button
        type="button"
        className="flex items-center text-basic-600 mb-4 hover:text-basic-800 transition-colors"
        onClick={onBack}
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        <span>返回儀表板</span>
      </button>

      <div className="bg-white rounded-lg shadow-md border border-basic-200 overflow-hidden">
        {/* 標題 */}
        <div className="p-6 border-b border-basic-200">
          <h3 className="heading-lg text-basic-black">學習簽到</h3>
          <p className="body-sm text-basic-600 mt-1">
            記錄你在「{practice.title}」中的學習進度
          </p>
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
          {/* 當前進度顯示 */}
          <div className="bg-primary-palest rounded-lg p-4">
            <div className="flex justify-between items-center mb-3">
              <span className="body-sm text-basic-700">當前進度</span>
              <span className="body-sm font-medium text-basic-900">
                {practice.currentProgress} / {practice.totalAmount} {practice.unit}
              </span>
            </div>
            <div className="w-full bg-basic-200 rounded-full h-2 mb-2">
              <div
                className="h-2 rounded-full bg-primary-base transition-all duration-300"
                style={{ width: `${currentProgressPercentage}%` }}
              />
            </div>
            <div className="text-right body-sm text-basic-600">
              {currentProgressPercentage}% 完成
            </div>
          </div>

          {/* 進度輸入 */}
          <div>
            <label className="block body-sm font-medium text-basic-700 mb-2 w-full">
              今日學習進度 <span className="text-alert">*</span>
              <div className="flex items-center space-x-3 mt-2">
                <div className="flex-1 relative">
                  <input
                    id="progress-input"
                    type="number"
                    value={progress}
                    onChange={(e) => setProgress(Math.max(1, parseInt(e.target.value, 10) || 1))}
                    min="1"
                    max={practice.totalAmount - practice.currentProgress}
                    className="w-full px-3 py-2 border border-basic-300 rounded-lg body-md focus:outline-none focus:ring-2 focus:ring-primary-base focus:border-transparent"
                  />
                  <span className="absolute right-3 top-2 body-sm text-basic-500">
                    {practice.unit}
                  </span>
                </div>
                <span className="body-sm text-basic-600">
                  新進度：{practice.currentProgress + progress}/{practice.totalAmount}
                </span>
              </div>
            </label>
            {/* 新進度預覽 */}
            <div className="mt-3 bg-success-lightest rounded-lg p-3">
              <div className="flex justify-between items-center mb-2">
                <span className="body-sm text-success-darker">簽到後進度</span>
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

          {/* 學習心情 */}
          <div>
            <span className="block body-sm font-medium text-basic-700 mb-3">
              今日學習心情
            </span>
            <div className="grid grid-cols-5 gap-2">
              {moodOptions.map((option) => {
                const isSelected = mood === option.value;

                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setMood(option.value)}
                    className={`p-3 rounded-lg border-2 transition-all text-center ${
                      isSelected
                        ? 'border-primary-base bg-primary-palest'
                        : 'border-basic-200 hover:border-basic-300 hover:bg-basic-50'
                    }`}
                  >
                    <div className="text-2xl mb-1">{option.emoji}</div>
                    <div className="body-xs text-basic-700">{option.label}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 學習標籤 */}
          <div>
            <label className="block body-sm font-medium text-basic-700 mb-2">
              學習標籤 (最多5個)
              {tags.length < 5 && (
                <div className="flex space-x-2 mb-3">
                  <input
                    type="text"
                    id="new-tag-input"
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleAddTag()}
                    placeholder="輸入標籤"
                    maxLength={20}
                    className="flex-1 px-3 py-2 border border-basic-300 rounded-lg body-sm focus:outline-none focus:ring-2 focus:ring-primary-base focus:border-transparent"
                  />
                  <button
                    type="button"
                    onClick={handleAddTag}
                    disabled={!newTag.trim()}
                    className="px-3 py-2 bg-basic-100 text-basic-600 rounded-lg hover:bg-basic-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
              )}
            </label>

            {/* 當前標籤 */}
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-3">
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center px-3 py-1 rounded-full bg-primary-base text-white body-sm"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      className="ml-2 text-white hover:text-basic-200"
                    >
                      <X className="h-3 w-3" />
                    </button>
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
                      <button
                        key={tag}
                        type="button"
                        onClick={() => handleAddSuggestedTag(tag)}
                        className="px-3 py-1 rounded-full border border-basic-300 text-basic-600 hover:border-primary-base hover:text-primary-base transition-colors body-sm"
                      >
                        {tag}
                      </button>
                    ))}
                </div>
              </div>
            )}
          </div>

          {/* 學習筆記 */}
          <div>
            <label htmlFor="note-input" className="block body-sm font-medium text-basic-700 mb-2">
              學習筆記 (選填)
            </label>
            <textarea
              id="note-input"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="今天學到了什麼？有什麼心得或困難嗎？"
              rows={4}
              maxLength={500}
              className="w-full px-3 py-2 border border-basic-300 rounded-lg body-md focus:outline-none focus:ring-2 focus:ring-primary-base focus:border-transparent resize-none"
            />
            <div className="mt-1 text-right body-sm text-basic-500">
              {note.length}/500
            </div>
          </div>

          {/* 簽到建議 */}
          <div className="bg-accent-lightest border border-accent rounded-lg p-4">
            <h4 className="body-sm font-medium text-accent-darker mb-2">💡 學習小提示</h4>
            <p className="body-sm text-accent-darker">
              定期簽到可以幫助你建立學習習慣，記錄學習心情和筆記能讓你更好地回顧學習歷程！
            </p>
          </div>
        </div>

        {/* 操作按鈕 */}
        <div className="p-6 border-t border-basic-200 bg-basic-50">
          <button
            type="button"
            onClick={handleSubmit}
            disabled={submitting || progress <= 0}
            className="w-full flex items-center justify-center space-x-2 px-6 py-3 bg-primary-base text-white rounded-lg hover:bg-primary-darker transition-colors body-md font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                <span>簽到中...</span>
              </>
            ) : (
              <>
                <CheckCircle className="h-4 w-4" />
                <span>完成簽到</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CheckInView;
