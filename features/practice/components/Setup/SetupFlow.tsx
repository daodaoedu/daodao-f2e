import React, { useState, useCallback } from 'react';
import { ArrowLeft, Check } from 'lucide-react';
import { useRouter } from 'next/router';
import { usePracticeManager } from '@/features/practice/hooks';
import Step1 from './Step1';
import Step2 from './Step2';
import Step3 from './Step3';
import Step4 from './Step4';
import Confetti from '@/features/practice/components/Shared/Confetti';
import CelebrationMessage from '@/features/practice/components/Shared/CelebrationMessage';
import { PathInfo } from '@/services/modules/practice/schema';

interface SetupFlowProps {
  onComplete?: (practiceId: string) => void;
  onCancel?: () => void;
}

interface SmallGoal {
  id: number;
  content: string;
}

interface Resource {
  id: number;
  name: string;
  url: string;
}

const SetupFlow: React.FC<SetupFlowProps> = ({
  onComplete,
  onCancel
}) => {
  const router = useRouter();
  const { createPracticeFromPathInfo } = usePracticeManager();

  const [setupStep, setSetupStep] = useState(1);
  const [hoveredStep, setHoveredStep] = useState<number | null>(null);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  const [pathInfo, setPathInfo] = useState<PathInfo>({
    title: '',
    contentType: 'book',
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
    lastStreakDate: ''
  });

  const [smallGoals, setSmallGoals] = useState<SmallGoal[]>([]);
  const [newSmallGoal, setNewSmallGoal] = useState('');

  const [resources, setResources] = useState<Resource[]>([]);
  const [newResourceName, setNewResourceName] = useState('');
  const [newResourceUrl, setNewResourceUrl] = useState('');

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
      [field]: value
    }));

    if (validationErrors[field]) {
      setValidationErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  }, [validationErrors]);

  const addSmallGoal = useCallback(() => {
    if (newSmallGoal.trim() && smallGoals.length < 3) {
      const newGoal: SmallGoal = {
        id: Date.now(),
        content: newSmallGoal.trim()
      };
      setSmallGoals((prev) => [...prev, newGoal]);
      setNewSmallGoal('');
    }
  }, [newSmallGoal, smallGoals.length]);

  const removeSmallGoal = useCallback((id: number) => {
    setSmallGoals((prev) => prev.filter((goal) => goal.id !== id));
  }, []);

  const addResource = useCallback(() => {
    if (newResourceName.trim() && resources.length < 5) {
      const newResource: Resource = {
        id: Date.now(),
        name: newResourceName.trim(),
        url: newResourceUrl.trim()
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

    setValidationErrors({});
    setSetupStep((prev) => Math.min(prev + 1, 4));
  }, [validateCurrentStep]);

  const handlePreviousStep = useCallback(() => {
    setValidationErrors({});
    setSetupStep((prev) => Math.max(prev - 1, 1));
  }, []);

  const handleCreatePath = useCallback(async () => {
    if (!pathInfo.title.trim()) {
      setValidationErrors({ title: '請輸入標題' });
      setSetupStep(1);
      return;
    }

    try {
      setShowConfetti(true);
      setCelebrationMessage('🎉 恭喜你建立了主題實踐！開始你的學習之旅！');

      const practiceId = await createPracticeFromPathInfo(pathInfo, smallGoals, resources);

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
  }, [pathInfo, smallGoals, resources, createPracticeFromPathInfo, onComplete, router]);

  const handleCancel = useCallback(() => {
    if (onCancel) {
      onCancel();
    } else {
      router.push('/practice');
    }
  }, [onCancel, router]);

  const steps = [
    { step: 1, label: '基本設定' },
    { step: 2, label: '進度目標' },
    { step: 3, label: '學習資源' },
    { step: 4, label: '預覽確認' }
  ];

  const renderStepIndicator = () => {
    return (
      <div className="w-full flex justify-center mb-8">
        <div className="flex items-center max-w-md w-full">
          {steps.map((stepInfo, index) => {
            const isActive = stepInfo.step === setupStep;
            const isCompleted = stepInfo.step < setupStep;

            let stepBgColor = '#f1f1f1';
            let stepTextColor = '#aaa';
            let stepBorder = 'none';

            if (isActive) {
              stepBgColor = '#16b9b3';
              stepTextColor = 'white';
            } else if (isCompleted) {
              stepBgColor = '#16b9b320';
              stepTextColor = '#16b9b3';
              stepBorder = '1px solid #16b9b3';
            }

            return (
              <React.Fragment key={stepInfo.step}>
                <div className="flex flex-col items-center">
                  <div
                    className="relative w-8 h-8 rounded-full flex items-center justify-center font-medium transition-colors"
                    style={{
                      backgroundColor: stepBgColor,
                      color: stepTextColor,
                      border: stepBorder
                    }}
                    onMouseEnter={() => setHoveredStep(stepInfo.step)}
                    onMouseLeave={() => setHoveredStep(null)}
                  >
                    {isCompleted ? <Check className="h-4 w-4" /> : stepInfo.step}

                    {hoveredStep === stepInfo.step && (
                      <div className="absolute top-10 bg-basic-800 text-white text-xs rounded px-2 py-1 whitespace-nowrap z-10">
                        {stepInfo.label}
                      </div>
                    )}
                  </div>
                  <div className="mt-2 text-xs text-center text-basic-600 whitespace-nowrap">
                    {stepInfo.label}
                  </div>
                </div>
                {index < steps.length - 1 && (
                  <div
                    className="h-1 flex-1 mx-4 transition-colors"
                    style={{
                      backgroundColor: isCompleted ? '#16b9b3' : '#f1f1f1'
                    }}
                  />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>
    );
  };

  const renderStepContent = () => {
    const stepProps = {
      pathInfo,
      handlePathInfoChange,
      validationErrors
    };

    switch (setupStep) {
      case 1:
        return (
          <Step1
            {...stepProps}
            handleNextStep={handleNextStep}
            smallGoals={smallGoals}
            newSmallGoal={newSmallGoal}
            setNewSmallGoal={setNewSmallGoal}
            addSmallGoal={addSmallGoal}
            removeSmallGoal={removeSmallGoal}
          />
        );
      case 2:
        return (
          <Step2
            {...stepProps}
            handleNextStep={handleNextStep}
            handlePreviousStep={handlePreviousStep}
          />
        );
      case 3:
        return (
          <Step3
            handleNextStep={handleNextStep}
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
            smallGoals={smallGoals}
            resources={resources}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-primary-palest">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <Confetti active={showConfetti} />

        <CelebrationMessage
          message={celebrationMessage}
          isVisible={!!celebrationMessage}
        />

        {setupStep > 1 && setupStep <= 4 && (
          <button
            type="button"
            className="flex items-center text-basic-600 hover:text-basic-800 mb-6 transition-colors"
            onClick={handlePreviousStep}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            <span>返回上一步</span>
          </button>
        )}

        <div className="flex justify-between items-center mb-6">
          <button
            type="button"
            onClick={handleCancel}
            className="text-basic-500 hover:text-basic-700 body-sm transition-colors"
          >
            取消建立
          </button>
          <span className="body-sm text-basic-500">步驟 {setupStep} / {steps.length}</span>
        </div>

        {renderStepIndicator()}

        <div className="bg-white rounded-lg shadow-sm border border-basic-200 overflow-hidden">
          {renderStepContent()}
        </div>
      </div>
    </div>
  );
};

export default SetupFlow;
