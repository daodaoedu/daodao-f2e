"use client";

import {
  updatePractice,
  usePracticeById,
  type UpdatePracticeRequestType,
} from "@daodao/api";
import { useParams, useRouter } from "@daodao/i18n/navigation";
import { Button } from "@daodao/ui/components/button";
import { Form } from "@daodao/ui/components/form";
import { toast } from "@daodao/ui/components/sonner";
import { useNavigationBlockerEffect } from "@daodao/ui/hooks/navigation-blocker";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { BackgroundAnimation, PageHeader } from "@/components/layout";
import {
  type ManualPracticeFormValues,
  manualPracticeFormSchema,
} from "@/components/practice";
import { Step1 } from "@/components/practice/create/manual/steps/step-1";
import { Step2 } from "@/components/practice/create/manual/steps/step-2";
import { Step3 } from "@/components/practice/create/manual/steps/step-3";
import { Step4 } from "@/components/practice/create/manual/steps/step-4";
import {
  DurationDays,
  ExecutionTiming,
  Frequency,
  mapExecutionTimingToPracticeTimePeriods,
  parseFrequency,
  PracticeTimePeriodToExecutionTimingMap,
} from "@/constants/practice-form";

// 將表單資料轉換成 API 請求格式
const convertFormValuesToApiRequest = (
  values: ManualPracticeFormValues,
): UpdatePracticeRequestType => {
  const frequency = parseFrequency(values.frequency as Frequency);
  const practiceTimePeriods = mapExecutionTimingToPracticeTimePeriods(
    values.executionTiming as ExecutionTiming[],
  );

  const request: Record<string, unknown> = {
    title: values.name,
    durationDays: parseInt(values.durationDays, 10),
    frequencyMinDays: frequency.minDays,
    frequencyMaxDays: frequency.maxDays,
    sessionDurationMinutes: values.durationMinutes,
  };

  if (values.actionDescription) {
    request.practiceAction = values.actionDescription;
  }

  if (values.startDate) {
    request.startDate = values.startDate;
  }

  if (practiceTimePeriods.length > 0) {
    request.practiceTimePeriods = practiceTimePeriods;
  }

  if (values.tags && values.tags.length > 0) {
    request.tags = values.tags;
  }

  if (values.resources && values.resources.length > 0) {
    request.resources = values.resources.map((resource) => ({
      name: resource.name,
      url: resource.url || undefined,
    }));
  }

  if (values.customTiming) {
    request.otherContext = values.customTiming;
  }

  return request as UpdatePracticeRequestType;
};

export default function EditPracticePage() {
  const router = useRouter();
  const params = useParams();
  const practiceId = params.id as string;

  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: practiceData, isLoading, error } = usePracticeById(practiceId);

  // 將 API 資料轉換為表單值
  const formValues: ManualPracticeFormValues | null = useMemo(() => {
    if (!practiceData?.data) {
      return null;
    }

    const data = practiceData.data;

    // 轉換 durationDays: number -> DurationDays (字串字面量)
    let durationDays: DurationDays = DurationDays.seven;
    if (data.durationDays) {
      const durationDaysNumber = data.durationDays;
      if (durationDaysNumber === 7) {
        durationDays = DurationDays.seven;
      } else if (durationDaysNumber === 14) {
        durationDays = DurationDays.fourteen;
      } else if (durationDaysNumber === 21) {
        durationDays = DurationDays.twentyOne;
      } else if (durationDaysNumber === 30) {
        durationDays = DurationDays.thirty;
      }
    }

    // 轉換 frequency: frequencyMinDays + frequencyMaxDays -> Frequency
    const frequencyMin = data.frequencyMinDays ?? 0;
    const frequencyMax = data.frequencyMaxDays ?? 0;
    let frequency: Frequency = Frequency.twoToFour;
    if (frequencyMin > 0 && frequencyMax > 0) {
      const frequencyStr = `${frequencyMin}-${frequencyMax}` as Frequency;
      if (
        frequencyStr === Frequency.twoToFour ||
        frequencyStr === Frequency.threeToFive ||
        frequencyStr === Frequency.fourToSeven
      ) {
        frequency = frequencyStr;
      }
    }

    // 轉換 executionTiming: practiceTimePeriods -> ExecutionTiming[]
    const executionTiming: ExecutionTiming[] = (data.practiceTimePeriods || [])
      .map((period: string) => PracticeTimePeriodToExecutionTimingMap[period])
      .filter((timing): timing is ExecutionTiming => timing !== undefined);

    // 如果沒有有效的 executionTiming，使用預設值
    const finalExecutionTiming =
      executionTiming.length > 0 ? executionTiming : [ExecutionTiming.morning];

    // 轉換 resources: API 格式 -> 表單格式
    // 注意：API 回應中目前沒有 resources 欄位，暫時設為空陣列
    const resources: Array<{ id: string; name: string; url: string }> = [];

    return {
      name: data.title || "",
      actionDescription: data.practiceAction || "",
      durationMinutes: data.sessionDurationMinutes ?? 30,
      startDate: data.startDate || "",
      durationDays,
      frequency,
      executionTiming: finalExecutionTiming,
      customTiming: data.otherContext || "",
      tags: data.tags || [],
      resources,
    };
  }, [practiceData]);

  // 初始表單值，確保所有欄位都有定義值（避免非受控輸入警告）
  const initialFormValues: ManualPracticeFormValues = useMemo(() => {
    return {
      name: "",
      actionDescription: "",
      durationMinutes: 30,
      startDate: "",
      durationDays: DurationDays.seven,
      frequency: Frequency.twoToFour,
      executionTiming: [ExecutionTiming.morning],
      customTiming: "",
      tags: [],
      resources: [],
    };
  }, []);

  const form = useForm<ManualPracticeFormValues>({
    resolver: zodResolver(manualPracticeFormSchema),
    mode: "onSubmit",
    defaultValues: initialFormValues,
  });

  // 當資料載入完成後，設定表單值
  useEffect(() => {
    if (formValues) {
      form.reset(formValues);
    }
  }, [formValues, form]);

  const handleSubmit = async (values: ManualPracticeFormValues) => {
    if (isSubmitting) {
      return;
    }

    setIsSubmitting(true);

    try {
      const apiRequest = convertFormValuesToApiRequest(values);

      const response = await updatePractice(practiceId, apiRequest);

      // 檢查是否有錯誤
      if (response.error) {
        console.error("Failed to update practice:", response.error);
        toast.error("儲存失敗，請稍後再試");
        setIsSubmitting(false);
        return;
      }

      // 提交成功後顯示成功訊息並導航回詳情頁面
      toast.success("實踐已成功更新");
      router.push(`/practices/${practiceId}`);
    } catch (error) {
      console.error("Failed to update practice:", error);
      toast.error("儲存失敗，請稍後再試");
      setIsSubmitting(false);
    }
  };

  useNavigationBlockerEffect(form.formState.isDirty);

  // Loading 狀態
  if (isLoading) {
    return (
      <div className="relative w-screen min-h-screen z-10 overflow-hidden overflow-y-auto bg-white">
        <PageHeader leftAction="back" title="編輯實踐" rightActionTo="/" />
        <BackgroundAnimation />
        <main className="max-w-[448px] mx-auto px-5 pb-6 pt-4">
          <div className="text-center text-text-dark">載入中...</div>
        </main>
      </div>
    );
  }

  // Error 狀態
  if (error || !practiceData?.data) {
    return (
      <div className="relative w-screen min-h-screen z-10 overflow-hidden overflow-y-auto bg-white">
        <PageHeader leftAction="back" title="編輯實踐" rightActionTo="/" />
        <BackgroundAnimation />
        <main className="max-w-[448px] mx-auto px-5 pb-6 pt-4">
          <div className="text-center text-text-dark">
            {error ? "載入失敗，請稍後再試" : "找不到此實踐"}
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="relative w-screen min-h-screen z-10 overflow-hidden overflow-y-auto bg-white">
      <BackgroundAnimation />

      <PageHeader title="編輯實踐" rightActionTo={`/practices/${practiceId}`} />

      <main className="relative px-5 max-w-[448px] mx-auto pb-20">
        {/* Form */}
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-6"
          >
            <Step1 form={form} />
            <Step2 form={form} />
            <Step3 form={form} />
            <Step4 form={form} />

            {/* Save Button */}
            <footer className="fixed bottom-0 left-0 right-0 flex justify-center gap-6 p-6 border-t border-light-gray bg-very-light-gray">
              <Button
                type="button"
                variant="outline"
                className="w-full sm:max-w-[288px]"
                disabled={isSubmitting}
                onClick={() => router.push(`/practices/${practiceId}`)}
              >
                取消
              </Button>
              <Button
                type="submit"
                variant="orange"
                className="w-full sm:max-w-[288px]"
                disabled={isSubmitting}
              >
                儲存
              </Button>
            </footer>
          </form>
        </Form>
      </main>
    </div>
  );
}
