import { useCallback, useState } from "react";

interface UseOnboardingStepReturn {
  currentStep: number;
  totalSteps: number;
  nextStep: () => void;
  prevStep: () => void;
  goToStep: (step: number) => void;
  isFirstStep: boolean;
  isLastInputStep: boolean;
  isSuccessStep: boolean;
}

/**
 * Onboarding 步驟管理 Hook
 *
 * totalSteps 由外部傳入，支援動態流程（步驟數可變）：
 * - Step 1:         Profile（固定）
 * - Steps 2..N-1:  動態流程步驟 or 固定的 Interests + Referral
 * - Step N:         Success
 */
export const useOnboardingStep = (totalSteps: number, initialStep = 1): UseOnboardingStepReturn => {
  const [currentStep, setCurrentStep] = useState(initialStep);

  const nextStep = useCallback(() => {
    setCurrentStep((prev) => Math.min(prev + 1, totalSteps));
  }, [totalSteps]);

  const prevStep = useCallback(() => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  }, []);

  const goToStep = useCallback(
    (step: number) => {
      if (step >= 1 && step <= totalSteps) {
        setCurrentStep(step);
      }
    },
    [totalSteps]
  );

  return {
    currentStep,
    totalSteps,
    nextStep,
    prevStep,
    goToStep,
    isFirstStep: currentStep === 1,
    isLastInputStep: currentStep === totalSteps - 1,
    isSuccessStep: currentStep === totalSteps,
  };
};
