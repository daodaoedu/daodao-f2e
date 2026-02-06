import { useCallback, useState } from "react";

interface UseOnboardingStepReturn {
  /** 當前步驟 (1-4) */
  currentStep: number;
  /** 總步驟數 */
  totalSteps: number;
  /** 前往下一步 */
  nextStep: () => void;
  /** 返回上一步 */
  prevStep: () => void;
  /** 跳轉到指定步驟 */
  goToStep: (step: number) => void;
  /** 是否為第一步 */
  isFirstStep: boolean;
  /** 是否為最後一步（提交前） */
  isLastInputStep: boolean;
  /** 是否為成功頁面 */
  isSuccessStep: boolean;
}

/**
 * Onboarding 步驟管理 Hook
 *
 * 管理 Onboarding 流程的步驟狀態：
 * - Step 1: Profile (個人資料)
 * - Step 2: Interests (興趣領域)
 * - Step 3: Referral (來源調查)
 * - Step 4: Success (完成頁面)
 */
export const useOnboardingStep = (initialStep = 1): UseOnboardingStepReturn => {
  const [currentStep, setCurrentStep] = useState(initialStep);
  const totalSteps = 4;

  const nextStep = useCallback(() => {
    setCurrentStep((prev) => Math.min(prev + 1, totalSteps));
  }, []);

  const prevStep = useCallback(() => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  }, []);

  const goToStep = useCallback(
    (step: number) => {
      if (step >= 1 && step <= totalSteps) {
        setCurrentStep(step);
      }
    },
    []
  );

  return {
    currentStep,
    totalSteps,
    nextStep,
    prevStep,
    goToStep,
    isFirstStep: currentStep === 1,
    isLastInputStep: currentStep === 3,
    isSuccessStep: currentStep === 4,
  };
};
