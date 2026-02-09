import { zodResolver } from "@hookform/resolvers/zod";
import { createContext, type ReactNode, useCallback, useContext, useState } from "react";
import { type UseFormReturn, useForm } from "react-hook-form";
import {
  type CreatePracticeInput,
  createPracticeSchema,
  defaultCreatePracticeValues,
} from "@/types/create-practice";

interface CreatePracticeContextValue {
  form: UseFormReturn<CreatePracticeInput>;
  currentStep: number;
  totalSteps: number;
  goToStep: (step: number) => void;
  nextStep: () => void;
  prevStep: () => void;
  resetForm: () => void;
  isFirstStep: boolean;
  isLastStep: boolean;
}

const CreatePracticeContext = createContext<CreatePracticeContextValue | null>(null);

const TOTAL_STEPS = 5;

interface CreatePracticeProviderProps {
  children: ReactNode;
  initialValues?: Partial<CreatePracticeInput>;
}

export function CreatePracticeProvider({ children, initialValues }: CreatePracticeProviderProps) {
  const [currentStep, setCurrentStep] = useState(1);

  const form = useForm<CreatePracticeInput>({
    resolver: zodResolver(createPracticeSchema),
    defaultValues: {
      ...defaultCreatePracticeValues,
      ...initialValues,
    },
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
    form.reset(defaultCreatePracticeValues);
    setCurrentStep(1);
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
