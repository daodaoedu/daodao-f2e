import { zodResolver } from "@hookform/resolvers/zod";
import { createContext, type ReactNode, useCallback, useContext, useMemo, useState } from "react";
import { type UseFormReturn, useForm } from "react-hook-form";
import {
  createManualPracticeFormSchema,
  type ManualPracticeFormValuesType,
} from "@/components/practice/create/manual/schema";
import type { PrivacyStatus } from "@/components/practice/shared/privacy-status-selector";
import { DurationDays, Frequency } from "@/constants/practice-form";
import { useMobileTranslation } from "@/i18n";

interface ICreatePracticeContextValue {
  form: UseFormReturn<ManualPracticeFormValuesType>;
  currentStep: number;
  totalSteps: number;
  goToStep: (step: number) => void;
  nextStep: () => void;
  prevStep: () => void;
  resetForm: () => void;
  isFirstStep: boolean;
  isLastStep: boolean;
  // 產品資料模型的 schema 不含隱私設定，對齊 product 由頁面層自行持有
  privacyStatus: PrivacyStatus;
  setPrivacyStatus: (value: PrivacyStatus) => void;
}

const CreatePracticeContext = createContext<ICreatePracticeContextValue | null>(null);

const TOTAL_STEPS = 5;

// 今天日期字串（yyyy-MM-dd），避免額外依賴 date-fns
const formatToday = (): string => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const getDefaultValues = (): ManualPracticeFormValuesType => ({
  name: "",
  actionDescription: "",
  startDate: formatToday(),
  durationDays: DurationDays.thirty,
  frequency: Frequency.threeToFive,
  durationMinutes: 30,
  executionTiming: [],
  customTiming: "",
  tags: [],
  resources: [],
});

interface CreatePracticeProviderProps {
  children: ReactNode;
}

export function CreatePracticeProvider({ children }: CreatePracticeProviderProps) {
  const t = useMobileTranslation("practice");
  const [currentStep, setCurrentStep] = useState(1);
  // 對齊 product manual/page.tsx：預設「即時公開」
  const [privacyStatus, setPrivacyStatus] = useState<PrivacyStatus>("public");
  const manualPracticeSchema = useMemo(() => createManualPracticeFormSchema(t), [t]);

  const form = useForm<ManualPracticeFormValuesType>({
    resolver: zodResolver(manualPracticeSchema),
    defaultValues: getDefaultValues(),
    mode: "onChange",
  });

  const goToStep = useCallback((step: number) => {
    if (step >= 1 && step <= TOTAL_STEPS) {
      setCurrentStep(step);
    }
  }, []);

  const nextStep = useCallback(() => {
    setCurrentStep((prev) => (prev < TOTAL_STEPS ? prev + 1 : prev));
  }, []);

  const prevStep = useCallback(() => {
    setCurrentStep((prev) => (prev > 1 ? prev - 1 : prev));
  }, []);

  const resetForm = useCallback(() => {
    form.reset(getDefaultValues());
    setCurrentStep(1);
    setPrivacyStatus("public");
  }, [form]);

  return (
    <CreatePracticeContext.Provider
      value={{
        form,
        currentStep,
        totalSteps: TOTAL_STEPS,
        goToStep,
        nextStep,
        prevStep,
        resetForm,
        isFirstStep: currentStep === 1,
        isLastStep: currentStep === TOTAL_STEPS,
        privacyStatus,
        setPrivacyStatus,
      }}
    >
      {children}
    </CreatePracticeContext.Provider>
  );
}

export function useCreatePractice() {
  const context = useContext(CreatePracticeContext);
  if (!context) {
    throw new Error("useCreatePractice must be used within CreatePracticeProvider");
  }
  return context;
}
