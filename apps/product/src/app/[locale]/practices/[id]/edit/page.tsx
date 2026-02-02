"use client";

import { type UpdatePracticeRequestType, updatePractice, usePracticeById } from "@daodao/api";
import { useParams, useRouter } from "@daodao/i18n/navigation";
import { getStorage, StorageEnum } from "@daodao/shared";
import { Button } from "@daodao/ui/components/button";
import { Form } from "@daodao/ui/components/form";
import { toast } from "@daodao/ui/components/sonner";
import { useNavigationBlockerEffect } from "@daodao/ui/hooks/navigation-blocker";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { BackgroundAnimation, PageHeader } from "@/components/layout";
import { type ManualPracticeFormValues, manualPracticeFormSchema } from "@/components/practice";
import { Step1 } from "@/components/practice/create/manual/steps/step-1";
import { Step2 } from "@/components/practice/create/manual/steps/step-2";
import { Step3 } from "@/components/practice/create/manual/steps/step-3";
import { Step4 } from "@/components/practice/create/manual/steps/step-4";
import { convertFormValuesToApiRequest } from "@/components/practice/create/manual/utils";
import {
  DurationDays,
  ExecutionTiming,
  Frequency,
  PracticeTimePeriodToExecutionTimingMap,
} from "@/constants/practice-form";
import { PracticeStatus } from "@/constants/practice-status";

export default function EditPracticePage() {
  const router = useRouter();
  const params = useParams();
  const practiceId = params.id as string;

  const [isSubmitting, setIsSubmitting] = useState(false);
  const draftStorage = getStorage<{ formValues: unknown; practiceId?: string }>(
    StorageEnum.ManualPracticeDraft
  );

  const { data: practiceData, isLoading, error } = usePracticeById(practiceId);

  // 檢查並清空同個 practiceId 的暫存資料
  useEffect(() => {
    const savedDraft = draftStorage.get();
    if (savedDraft?.practiceId === practiceId) {
      // 如果是同個實踐 ID，清空暫存資料
      draftStorage.remove();
    }
  }, [practiceId, draftStorage]);

  // 檢查實踐是否已經開始（狀態為 active）
  const isPracticeStarted = useMemo(() => {
    return practiceData?.data?.status === PracticeStatus.active;
  }, [practiceData?.data?.status]);

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
      executionTiming,
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
      // 編輯頁面送出時，isDraft 設為 false（正式發布）
      const apiRequest = convertFormValuesToApiRequest(values, false);

      const response = await updatePractice(practiceId, apiRequest);

      // 檢查是否有錯誤
      if (response.error) {
        const errorMessage =
          response.error && typeof response.error === "object" && "message" in response.error
            ? String(response.error.message)
            : "儲存失敗，請稍後再試";
        console.error("Failed to update practice:", response.error);
        toast.error(errorMessage);
        setIsSubmitting(false);
        return;
      }

      // 提交成功後清除暫存資料（如果有的話）
      const savedDraft = draftStorage.get();
      if (savedDraft?.practiceId === practiceId) {
        draftStorage.remove();
      }

      // 提交成功後顯示成功訊息並導航回詳情頁面
      toast.success("實踐已成功更新");
      router.push(`/practices/${practiceId}`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "儲存失敗，請稍後再試";
      console.error("Failed to update practice:", error);
      toast.error(errorMessage);
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
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            <Step1 form={form} />
            <Step2 form={form} disabled={isPracticeStarted} />
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
