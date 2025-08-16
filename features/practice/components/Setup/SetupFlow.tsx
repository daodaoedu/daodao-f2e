import React, { useState, useCallback } from 'react';
import { useRouter } from 'next/router';
import { usePracticeManager } from '@/features/practice/hooks';
import Confetti from '@/features/practice/components/Shared/Confetti';
import CelebrationMessage from '@/features/practice/components/Shared/CelebrationMessage';
import { PathInfo } from '@/services/practice/schema';
import { useScrollToTop } from '@/features/practice/hooks/useScrollToTop';
import Step1 from './Step1';
import Step2 from './Step2';
import Step3 from './Step3';
import Step4 from './Step4';

interface SetupFlowProps {
  onComplete?: (practiceId: string) => void;
  onCancel?: () => void;
}

interface Resource {
  id: number;
  name: string;
  url: string;
}

const SetupFlow: React.FC<SetupFlowProps> = ({
  onComplete,
}) => {
  const router = useRouter();
  const { createPracticeFromPathInfo } = usePracticeManager();
  const { scrollToTop } = useScrollToTop();

  const [setupStep, setSetupStep] = useState(1);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  const [pathInfo, setPathInfo] = useState<PathInfo>({
    title: '',
    contentType: 'book',
    customContentType: '',
    totalAmount: '7',
    currentProgress: '0',
    targetDate: '',
    notes: '',
    motivationType: '',
    customMotivation: '',
    lastCheckin: '',
    isPublic: true,
    reminderEnabled: false,
    reminderFrequency: 'daily',
    streak: 0,
    lastStreakDate: '',
  });

  // 新增：標籤相關狀態
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [customTag, setCustomTag] = useState('');

  // 實踐行動狀態
  const [practiceAction, setPracticeAction] = useState<string>('');

  const [resources, setResources] = useState<Resource[]>([]);
  const [newResourceName, setNewResourceName] = useState('');
  const [newResourceUrl, setNewResourceUrl] = useState('');

  // 新增：目標設定相關狀態
  const [dailyGoalType, setDailyGoalType] = useState<string>('time');
  const [dailyGoalTime, setDailyGoalTime] = useState<number>(30);
  const [dailyGoalPages, setDailyGoalPages] = useState<number>(10);
  const [customUnit, setCustomUnit] = useState<string>('頁');

  const [showConfetti, setShowConfetti] = useState(false);
  const [celebrationMessage, setCelebrationMessage] = useState('');

  const validateCurrentStep = (): boolean => {
    const errors: Record<string, string> = {};

    if (setupStep === 1) {
      if (!pathInfo.title.trim()) {
        errors.title = '請輸入標題';
      } else if (pathInfo.title.length > 100) {
        errors.title = '標題不能超過100個字元';
      }

      if (!pathInfo.contentType) {
        errors.contentType = '請選擇內容類型';
      }

      if (pathInfo.contentType === 'custom' && !pathInfo.customContentType?.trim()) {
        errors.customContentType = '請輸入自定義類型名稱';
      }
    } else if (setupStep === 2) {
      if (!pathInfo.targetDate) {
        errors.targetDate = '請選擇開始日期';
      } else {
        const selectedDate = new Date(pathInfo.targetDate);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (selectedDate < today) {
          errors.targetDate = '開始日期不能是過去的日期';
        }
      }

      const totalAmount = parseInt(pathInfo.totalAmount, 10);
      if (!totalAmount || totalAmount < 1) {
        errors.totalAmount = '總量必須大於0';
      } else if (totalAmount > 10000) {
        errors.totalAmount = '總量不能超過10000';
      }
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handlePathInfoChange = useCallback((field: keyof PathInfo, value: string | number) => {
    setPathInfo((prev) => ({
      ...prev,
      [field]: value,
    }));

    if (validationErrors[field]) {
      setValidationErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  }, [validationErrors]);

  // 標籤相關函數
  const addTag = useCallback((tag: string) => {
    const trimmedTag = tag.trim();
    if (trimmedTag && !selectedTags.includes(trimmedTag) && selectedTags.length < 3) {
      setSelectedTags((prev) => [...prev, trimmedTag]);
    }
  }, [selectedTags]);

  const removeTag = useCallback((tagToRemove: string) => {
    setSelectedTags((prev) => prev.filter((tag) => tag !== tagToRemove));
  }, []);

  const addCustomTag = useCallback(() => {
    if (customTag.trim()) {
      addTag(customTag);
      setCustomTag('');
    }
  }, [customTag, addTag]);

  const addResource = useCallback(() => {
    if (newResourceName.trim() && resources.length < 5) {
      const newResource: Resource = {
        id: Date.now(),
        name: newResourceName.trim(),
        url: newResourceUrl.trim(),
      };
      setResources((prev) => [...prev, newResource]);
      setNewResourceName('');
      setNewResourceUrl('');
    }
  }, [newResourceName, newResourceUrl, resources.length]);

  const removeResource = useCallback((id: number) => {
    setResources((prev) => prev.filter((r) => r.id !== id));
  }, []);

  const handleNextStep = useCallback(() => {
    if (!validateCurrentStep()) {
      return;
    }

    scrollToTop('smooth');
    setValidationErrors({});
    setSetupStep((prev) => Math.min(prev + 1, 4));
  }, [validateCurrentStep, scrollToTop]);

  const handlePreviousStep = useCallback(() => {
    scrollToTop('smooth');
    setValidationErrors({});
    setSetupStep((prev) => Math.max(prev - 1, 1));
  }, [scrollToTop]);

  const handleCreatePath = useCallback(async () => {
    if (!pathInfo.title.trim()) {
      setValidationErrors({ title: '請輸入標題' });
      setSetupStep(1);
      return;
    }

    try {
      setShowConfetti(true);
      setCelebrationMessage('你的主題實踐之旅，現在正式啟動！');

      // 準備每日目標設定
      const dailyGoalConfig = {
        type: dailyGoalType,
        timeMinutes: dailyGoalType === 'time' ? dailyGoalTime : undefined,
        amount: dailyGoalType === 'completion' ? dailyGoalPages : undefined,
        unit: dailyGoalType === 'completion' ? customUnit : undefined,
      };

      const practiceId = await createPracticeFromPathInfo(pathInfo, practiceAction, resources, selectedTags, dailyGoalConfig);

      setTimeout(() => {
        setShowConfetti(false);
        setCelebrationMessage('');

        if (onComplete) {
          onComplete(practiceId);
        } else {
          router.push(`/practice/${practiceId}`);
        }
      }, 3000);
    } catch (error) {
      console.error('建立實踐失敗:', error);
      setValidationErrors({ general: '建立實踐失敗，請稍後再試' });
      setShowConfetti(false);
      setCelebrationMessage('');
    }
  }, [pathInfo, practiceAction, resources, selectedTags, dailyGoalType, dailyGoalTime, dailyGoalPages, customUnit, createPracticeFromPathInfo, onComplete, router]);

  const renderStepContent = () => {
    const stepProps = {
      pathInfo,
      handlePathInfoChange,
      validationErrors,
    };

    switch (setupStep) {
      case 1:
        return (
          <Step1
            {...stepProps}
            handleNextStep={handleNextStep}
            selectedTags={selectedTags}
            customTag={customTag}
            setCustomTag={setCustomTag}
            addTag={addTag}
            removeTag={removeTag}
            addCustomTag={addCustomTag}
          />
        );
      case 2:
        return (
          <Step2
            {...stepProps}
            handleNextStep={handleNextStep}
            handlePreviousStep={handlePreviousStep}
            dailyGoalType={dailyGoalType}
            setDailyGoalType={setDailyGoalType}
            dailyGoalTime={dailyGoalTime}
            setDailyGoalTime={setDailyGoalTime}
            dailyGoalPages={dailyGoalPages}
            setDailyGoalPages={setDailyGoalPages}
            customUnit={customUnit}
            setCustomUnit={setCustomUnit}
            practiceAction={practiceAction}
            setPracticeAction={setPracticeAction}
          />
        );
      case 3:
        return (
          <Step3
            handleNextStep={handleNextStep}
            handlePrevStep={handlePreviousStep}
            validationErrors={validationErrors}
            resources={resources}
            newResourceName={newResourceName}
            newResourceUrl={newResourceUrl}
            setNewResourceName={setNewResourceName}
            setNewResourceUrl={setNewResourceUrl}
            addResource={addResource}
            removeResource={removeResource}
          />
        );
      case 4:
        return (
          <Step4
            pathInfo={pathInfo}
            handleCreatePath={handleCreatePath}
            handlePrevStep={handlePreviousStep}
            practiceAction={practiceAction}
            resources={resources}
            dailyGoalType={dailyGoalType}
            dailyGoalTime={dailyGoalTime}
            dailyGoalPages={dailyGoalPages}
            customUnit={customUnit}
            selectedTags={selectedTags}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-2xl px-4 py-8">
        <Confetti active={showConfetti} />

        <CelebrationMessage
          message={celebrationMessage}
          isVisible={!!celebrationMessage}
        />

        <div className="overflow-hidden rounded-lg border border-border bg-card shadow-sm">
          {renderStepContent()}
        </div>
      </div>
    </div>
  );
};

export default SetupFlow;
