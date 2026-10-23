"use client";

import { type UpdatePracticeRequestType, updatePractice, usePracticeById } from "@daodao/api";
import { useTranslations } from "@daodao/i18n";
import { useParams, useRouter } from "@daodao/i18n/navigation";
import { withoutChallengeLockedFields } from "@daodao/shared/lib/practice-challenge-lock";
import {
  isPracticePrivacyLocked,
  readPracticePrivacyStatus,
  withEditablePrivacy,
} from "@daodao/shared/lib/practice-privacy-lock";
import { Button } from "@daodao/ui/components/button";
import { Form } from "@daodao/ui/components/form";
import { toast } from "@daodao/ui/components/sonner";
import { useNavigationBlockerEffect } from "@daodao/ui/hooks/navigation-blocker";
import { zodResolver } from "@hookform/resolvers/zod";
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
import { useServerErrorMessage } from "@/lib/server-error/use-server-error-message";
import { toEditFormResources, toUpdateResourcesPayload } from "@/utils/practice-edit-resources";
import {
  buildScheduleUpdatePayload,
  type PracticeScheduleSource,
  toEditScheduleValues,
} from "@/utils/practice-edit-schedule";
import { minEditableStartDate } from "@/utils/practice-period";
import { getEditScheduleLocks } from "@/utils/practice-schedule-lock";

// API 錯誤響應類型
interface ApiErrorResponse {
  error?: {
    message?: string;
    details?: Array<{ path?: string; message?: string }>;
  };
  message?: string;
}

// 將表單資料轉換成 API 請求格式
// 天數、頻率、每次時間、時機只送有改的欄位：自訂值（例 45 天、每週 1-3 天）沒動就不會被蓋掉（daodao#370）
const convertFormValuesToApiRequest = (
  values: ManualPracticeFormValues,
  original: PracticeScheduleSource
): UpdatePracticeRequestType => {
  const request: Record<string, unknown> = {
    title: values.name,
    ...buildScheduleUpdatePayload(values, original),
  };

  if (values.actionDescription) {
    request.practiceAction = values.actionDescription;
  }

  if (values.startDate) {
    request.startDate = values.startDate;
  }

  request.tags = values.tags || [];

  request.resources = toUpdateResourcesPayload(values.resources || []);

  return request as UpdatePracticeRequestType;
};

export default function EditPracticePage() {
  const t = useTranslations("practice");
  const { errorMessage: serverErrorMessage, fieldMessage: serverFieldMessage } =
    useServerErrorMessage();
  const router = useRouter();
  const params = useParams();
  const practiceId = params.id as string;

  const [isSubmitting, setIsSubmitting] = useState(false);
  // 讀不到原本隱私時維持 undefined：不預設 private，存檔也不送，避免把公開實踐改回私人（daodao#358）
  const [privacyStatus, setPrivacyStatus] = useState<PrivacyStatus | undefined>(undefined);

  const { data: practiceData, isLoading, error } = usePracticeById(practiceId);

  // 共同挑戰實踐：名稱、期間、隱私由挑戰統一設定（FR-CC-05、FR-CC-10），server 端亦會拒絕這些欄位
  const isChallenge = practiceData?.data?.isChallenge === true;
  // 燈塔本期實踐：隱私由場次統一設定，server 收到 privacyStatus 會回 400（前端型別待 gen:types 同步）
  const isCohortPrivacyLocked =
    (practiceData?.data as { isCohortPrivacyLocked?: boolean } | undefined)
      ?.isCohortPrivacyLocked === true;
  const isPrivacyLocked = isPracticePrivacyLocked({ isChallenge, isCohortPrivacyLocked });

  // 已有打卡記錄才鎖期間與頻率（與 server stripLockedFields 一致）；
  // 共同挑戰另鎖期間，但頻率仍可改（server CHALLENGE_LOCKED_UPDATE_FIELDS 不含頻率，daodao#385）
  const { periodLocked, frequencyLocked } = useMemo(
    () => getEditScheduleLocks({ ...practiceData?.data, isChallenge }),
    [practiceData?.data, isChallenge]
  );

  // 取得日期驗證的最小日期
  // 對於已排程的實踐，應該允許保留原本的開始日期（即使已經過去）
  const minStartDate = useMemo(
    () => minEditableStartDate(practiceData?.data?.startDate, new Date()),
    [practiceData?.data?.startDate]
  );

  // 使用 minStartDate 來創建 schema
  // 期間鎖住時（共同挑戰、已打卡）天數／頻率不必填：原值是 null 也要能改其他欄位（daodao#370）
  const scheduleLocked = periodLocked;
  const formSchema = useMemo(() => {
    return createManualPracticeFormSchema({ minStartDate, scheduleLocked }, t);
  }, [minStartDate, scheduleLocked, t]);

  // 將 API 資料轉換為表單值
  const formValues: ManualPracticeFormValues | null = useMemo(() => {
    if (!practiceData?.data) {
      return null;
    }

    const data = practiceData.data;

    // 天數、頻率、每次時間、時機照原值帶入，不再只認預設值（daodao#370）
    const schedule = toEditScheduleValues(data);

    // 轉換 resources: API 格式 -> 表單格式
    // isLocked（教練加入的資源）server 已回傳，前端型別待 gen:types 同步；toEditFormResources 以選填欄位讀取
    const resources = toEditFormResources(data.resources || []);

    return {
      name: data.title || "",
      actionDescription: data.practiceAction || "",
      startDate: data.startDate || "",
      ...schedule,
      tags: data.tags || [],
      resources,
    };
  }, [practiceData]);

  // 初始表單值，確保所有欄位都有定義值（避免非受控輸入警告）
  const initialFormValues: ManualPracticeFormValues = useMemo(() => {
    return {
      name: "",
      actionDescription: "",
      durationMinutes: null,
      startDate: "",
      durationDays: "",
      frequency: "",
      executionTiming: [],
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
      const ps = readPracticePrivacyStatus(practiceData.data as { privacyStatus?: unknown });
      if (ps) setPrivacyStatus(ps);
    }
  }, [formValues, form, practiceData]);

  const handleSubmit = async (values: ManualPracticeFormValues) => {
    if (isSubmitting) {
      return;
    }

    setIsSubmitting(true);

    try {
      const apiRequest = withEditablePrivacy(
        withoutChallengeLockedFields(
          convertFormValuesToApiRequest(values, practiceData?.data ?? {}),
          isChallenge
        ),
        privacyStatus,
        isPrivacyLocked
      ) as UpdatePracticeRequestType;

      const response = await updatePractice(practiceId, apiRequest);

      // 檢查是否有錯誤
      if (response.error) {
        const errorResponse = response.error as ApiErrorResponse;
        const error = errorResponse.error || errorResponse;
        // server 訊息只有中文，經共用轉換後才顯示（daodao#353）
        let errorMessage = serverErrorMessage(response.error, t("edit_save_failed"), {
          status: response.response.status,
        });

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
                  message: serverFieldMessage(detail.message),
                });
              }
            });

            // 使用第一個具體錯誤訊息作為 toast 訊息
            const firstDetail = details[0];
            if (firstDetail?.message) {
              errorMessage = serverErrorMessage(response.error, t("edit_save_failed"), {
                status: response.response.status,
                detailMessage: firstDetail.message,
              });
            }
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
      <div className="relative w-full min-h-screen z-10 overflow-hidden overflow-y-auto bg-white">
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
      <div className="relative w-full min-h-screen z-10 overflow-hidden overflow-y-auto bg-white">
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
    <div className="relative w-full min-h-screen z-10 overflow-hidden overflow-y-auto bg-white">
      <BackgroundAnimation />

      <PageHeader title={t("edit_title")} rightActionTo={`/practices/${practiceId}`} />

      <main className="relative px-5 max-w-[448px] mx-auto pb-20">
        {/* Form */}
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            {isChallenge && (
              <p className="rounded-lg bg-logo-cyan/10 px-4 py-3 text-sm text-text-dark">
                {t("edit_challenge_locked")}
              </p>
            )}
            <Step1 form={form} nameDisabled={isChallenge} />
            <Step2
              form={form}
              disabled={periodLocked}
              frequencyDisabled={frequencyLocked}
              minStartDate={minStartDate}
            />
            <Step3 form={form} />
            <Step4 form={form} />

            {/* Privacy Status */}
            {!isPrivacyLocked && (
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <PrivacyStatusSelector value={privacyStatus} onChange={setPrivacyStatus} />
              </div>
            )}
            {isCohortPrivacyLocked && (
              <p className="rounded-lg bg-logo-cyan/10 px-4 py-3 text-sm text-text-dark">
                {t("edit_cohort_privacy_locked")}
              </p>
            )}

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
