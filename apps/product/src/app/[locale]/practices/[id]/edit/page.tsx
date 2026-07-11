"use client";

import { type UpdatePracticeRequestType, updatePractice, usePracticeById } from "@daodao/api";
import { useTranslations } from "@daodao/i18n";
import { useParams, useRouter } from "@daodao/i18n/navigation";
import { Button } from "@daodao/ui/components/button";
import { Form } from "@daodao/ui/components/form";
import { toast } from "@daodao/ui/components/sonner";
import { useNavigationBlockerEffect } from "@daodao/ui/hooks/navigation-blocker";
import { zodResolver } from "@hookform/resolvers/zod";
import { startOfDay } from "date-fns";
import { useEffect, useMemo, useState } from "react";
import { type Path, useForm } from "react-hook-form";
import { BackgroundAnimation, PageHeader } from "@/components/layout";
import {
  createManualPracticeFormSchema,
  type ManualPracticeFormValues,
} from "@/components/practice";
import { Step1 } from "@/components/practice/create/manual/steps/step-1";
import { Step2 } from "@/components/practice/create/manual/steps/step-2";
import { Step3 } from "@/components/practice/create/manual/steps/step-3";
import { Step4 } from "@/components/practice/create/manual/steps/step-4";
import {
  type PrivacyStatus,
  PrivacyStatusSelector,
} from "@/components/practice/shared/privacy-status-selector";
import {
  DurationDays,
  ExecutionTiming,
  Frequency,
  mapExecutionTimingToPracticeTimePeriods,
  PracticeTimePeriodToExecutionTimingMap,
  parseFrequency,
} from "@/constants/practice-form";
import { PracticeStatus } from "@/constants/practice-status";

// API 錯誤響應類型
interface ApiErrorResponse {
  error?: {
    message?: string;
    details?: Array<{ path?: string; message?: string }>;
  };
  message?: string;
}

// 將表單資料轉換成 API 請求格式
const convertFormValuesToApiRequest = (
  values: ManualPracticeFormValues
): UpdatePracticeRequestType => {
  const frequency = parseFrequency(values.frequency as Frequency);
  const practiceTimePeriods = mapExecutionTimingToPracticeTimePeriods(
    values.executionTiming as ExecutionTiming[]
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

  request.tags = values.tags || [];

  request.resources = (values.resources || []).map((resource) => ({
    name: resource.name,
    url: resource.url || undefined,
  }));

  if (values.customTiming) {
    request.otherContext = values.customTiming;
  }

  return request as UpdatePracticeRequestType;
};

export default function EditPracticePage() {
  const t = useTranslations("practice");
  const router = useRouter();
  const params = useParams();
  const practiceId = params.id as string;

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [privacyStatus, setPrivacyStatus] = useState<PrivacyStatus>("private");

  const { data: practiceData, isLoading, error } = usePracticeById(practiceId);

  // 檢查實踐是否已經開始（狀態為 active）
  const isPracticeStarted = useMemo(() => {
    return practiceData?.data?.status === PracticeStatus.active;
  }, [practiceData?.data?.status]);

  // 取得日期驗證的最小日期
  // 對於已排程的實踐，應該允許保留原本的開始日期（即使已經過去）
  const minStartDate = useMemo(() => {
    const today = startOfDay(new Date());
    const practiceStartDate = practiceData?.data?.startDate
      ? startOfDay(new Date(practiceData.data.startDate))
      : today;

    return practiceStartDate < today ? practiceStartDate : today;
  }, [practiceData?.data?.startDate]);

  // 使用 minStartDate 來創建 schema
  const formSchema = useMemo(() => {
    return createManualPracticeFormSchema({ minStartDate });
  }, [minStartDate]);

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
    const resources = (data.resources || []).map((resource) => ({
      id: resource.id,
      name: resource.name,
      url: resource.url || "",
    }));

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
    resolver: zodResolver(formSchema),
    mode: "onSubmit",
    defaultValues: initialFormValues,
  });

  // 當資料載入完成後，設定表單值
  useEffect(() => {
    if (formValues) {
      form.reset(formValues);
    }
    if (practiceData?.data) {
      const ps = (practiceData.data as Record<string, unknown>).privacyStatus as
        | PrivacyStatus
        | undefined;
      if (ps) setPrivacyStatus(ps);
    }
  }, [formValues, form, practiceData]);

  const handleSubmit = async (values: ManualPracticeFormValues) => {
    if (isSubmitting) {
      return;
    }

    setIsSubmitting(true);

    try {
      const apiRequest = {
        ...convertFormValuesToApiRequest(values),
        privacyStatus,
      } as UpdatePracticeRequestType;

      const response = await updatePractice(practiceId, apiRequest);

      // 檢查是否有錯誤
      if (response.error) {
        const errorResponse = response.error as ApiErrorResponse;
        const error = errorResponse.error || errorResponse;
        let errorMessage = t("edit_save_failed");

        // 處理錯誤訊息
        if (typeof error === "object" && error !== null) {
          // 檢查是否有 details 陣列
          if ("details" in error && Array.isArray(error.details)) {
            // 處理 details 陣列中的每個錯誤
            const details = error.details;

            details.forEach((detail) => {
              if (detail.path && detail.message) {
                // 將錯誤設置到對應的表單欄位（使用 Path 支援嵌套路徑如 resources.0.name）
                form.setError(detail.path as Path<ManualPracticeFormValues>, {
                  type: "server",
                  message: detail.message,
                });
              }
            });

            // 使用第一個具體錯誤訊息作為 toast 訊息
            const firstDetail = details[0];
            if (firstDetail?.message) {
              errorMessage = firstDetail.message;
            }
          } else if ("message" in error && error.message) {
            // 如果沒有 details，使用頂層 message
            errorMessage = String(error.message);
          }
        }

        console.error("Failed to update practice:", response.error);
        toast.error(errorMessage);
        setIsSubmitting(false);
        return;
      }

      // 提交成功後顯示成功訊息並導航回詳情頁面
      toast.success(t("edit_save_success"));
      router.push(`/practices/${practiceId}`);
    } catch (error) {
      console.error("Failed to update practice:", error);
      toast.error(t("edit_save_failed"));
      setIsSubmitting(false);
    }
  };

  useNavigationBlockerEffect(form.formState.isDirty);

  // Loading 狀態
  if (isLoading) {
    return (
      <div className="relative w-screen min-h-screen z-10 overflow-hidden overflow-y-auto bg-white">
        <PageHeader leftAction="back" leftLabel="" title={t("edit_title")} rightActionTo="/" />
        <BackgroundAnimation />
        <main className="max-w-[448px] mx-auto px-5 pb-6 pt-4">
          <div className="text-center text-text-dark">{t("loading")}</div>
        </main>
      </div>
    );
  }

  // Error 狀態
  if (error || !practiceData?.data) {
    return (
      <div className="relative w-screen min-h-screen z-10 overflow-hidden overflow-y-auto bg-white">
        <PageHeader leftAction="back" leftLabel="" title={t("edit_title")} rightActionTo="/" />
        <BackgroundAnimation />
        <main className="max-w-[448px] mx-auto px-5 pb-6 pt-4">
          <div className="text-center text-text-dark">
            {error ? t("load_failed") : t("not_found")}
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="relative w-screen min-h-screen z-10 overflow-hidden overflow-y-auto bg-white">
      <BackgroundAnimation />

      <PageHeader title={t("edit_title")} rightActionTo={`/practices/${practiceId}`} />

      <main className="relative px-5 max-w-[448px] mx-auto pb-20">
        {/* Form */}
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            <Step1 form={form} />
            <Step2 form={form} disabled={isPracticeStarted} minStartDate={minStartDate} />
            <Step3 form={form} />
            <Step4 form={form} />

            {/* Privacy Status */}
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <PrivacyStatusSelector value={privacyStatus} onChange={setPrivacyStatus} />
            </div>

            {/* Save Button */}
            <footer className="fixed bottom-0 left-0 right-0 flex justify-center gap-6 p-6 border-t border-light-gray bg-very-light-gray">
              <Button
                type="button"
                variant="outline"
                className="w-full sm:max-w-[288px]"
                disabled={isSubmitting}
                onClick={() => router.push(`/practices/${practiceId}`)}
              >
                {t("edit_cancel")}
              </Button>
              <Button
                type="submit"
                variant="orange"
                className="w-full sm:max-w-[288px]"
                disabled={isSubmitting}
              >
                {t("edit_save")}
              </Button>
            </footer>
          </form>
        </Form>
      </main>
    </div>
  );
}
