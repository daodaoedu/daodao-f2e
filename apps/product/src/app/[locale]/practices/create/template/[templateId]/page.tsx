"use client";

import {
  type CreatePracticeRequestType,
  createPractice,
  getRandomPracticeTemplates,
  type PracticeTemplateType,
  usePracticeTemplateById,
} from "@daodao/api";
import { ArrowRightOutlineSvg, CompassSvg, Deco4Svg } from "@daodao/assets";
import { useAuth } from "@daodao/auth";
import { useRouter } from "@daodao/i18n/navigation";
import { Badge } from "@daodao/ui/components/badge";
import { Button } from "@daodao/ui/components/button";
import { toast } from "@daodao/ui/components/sonner";
import { cn } from "@daodao/ui/lib/utils";
import { format } from "date-fns";
import { Loader, RefreshCcw } from "lucide-react";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { PageHeader } from "@/components/layout";
import {
  ExecutionDurationCard,
  ExecutionTimingCard,
  type ManualPracticeFormValues,
  PracticeOverviewCard,
  ResourceCard,
} from "@/components/practice";
import {
  DURATION_DAYS_NUMBER_OPTIONS,
  DurationDays,
  DurationDaysNumberToStringMap,
  type ExecutionTiming,
  Frequency,
  mapExecutionTimingToPracticeTimePeriods,
  PracticeTimePeriodToExecutionTimingMap,
  parseFrequency,
} from "@/constants/practice-form";

// 將 API 的 practiceTimePeriods 映射到 executionTiming
const mapPracticeTimePeriodsToExecutionTiming = (periods: string[]): ExecutionTiming[] => {
  const mapped = periods
    .map((period) => PracticeTimePeriodToExecutionTimingMap[period])
    .filter((timing): timing is ExecutionTiming => timing !== undefined);

  return mapped.length > 0 ? mapped : [];
};

// 將 API 的 frequencyMinDays 和 frequencyMaxDays 映射到 frequency
const mapFrequencyToFormValue = (minDays: number | null, maxDays: number | null): Frequency => {
  if (minDays === null || maxDays === null) {
    return Frequency.threeToFive; // 預設值
  }

  // 根據範圍映射到對應的選項
  if (minDays >= 2 && maxDays <= 4) {
    return Frequency.twoToFour;
  }
  if (minDays >= 3 && maxDays <= 5) {
    return Frequency.threeToFive;
  }
  if (minDays >= 4 && maxDays <= 7) {
    return Frequency.fourToSeven;
  }

  // 預設值
  return Frequency.threeToFive;
};

// 將 API 的 durationDays 映射到表單的 durationDays (字串)
const mapDurationDaysToString = (days: number | null): DurationDays => {
  if (days === null) {
    return DurationDays.thirty; // 預設值
  }

  // 找到最接近的選項
  const closest = DURATION_DAYS_NUMBER_OPTIONS.reduce((prev, curr) =>
    Math.abs(curr - days) < Math.abs(prev - days) ? curr : prev
  );

  // 將數字轉換為對應的字串常數
  return DurationDaysNumberToStringMap[closest];
};

// 將 API 的 PracticeTemplate 轉換成 ManualPracticeFormValues
const convertTemplateToFormValues = (template: PracticeTemplateType): ManualPracticeFormValues => {
  // 預設開始日期為今天
  const today = new Date();
  const startDate = format(today, "yyyy-MM-dd");

  return {
    // Step 1
    name: template.title,
    actionDescription: template.practiceAction || template.title,
    durationMinutes: template.sessionDurationMinutes ?? 30,

    // Step 2
    startDate,
    durationDays: mapDurationDaysToString(template.durationDays),
    frequency: mapFrequencyToFormValue(template.frequencyMinDays, template.frequencyMaxDays),

    // Step 3
    executionTiming: mapPracticeTimePeriodsToExecutionTiming(template.practiceTimePeriods),
    customTiming: "",

    // Step 4
    tags: template.suggestedTags || [],
    resources: (template.resources || []).map((resource) => ({
      id: resource.id,
      name: resource.name,
      url: resource.url,
    })),
  };
};

// 將表單資料轉換成 API 請求格式
const convertFormValuesToApiRequest = (
  values: ManualPracticeFormValues
): CreatePracticeRequestType => {
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

  return request as CreatePracticeRequestType;
};

export default function TemplateDetailPage() {
  const router = useRouter();
  const params = useParams();
  const templateId = params.templateId as string;

  // 取得認證狀態
  const { requireAuth } = useAuth();

  // 取得模板詳情
  const { data, error, isLoading } = usePracticeTemplateById(templateId);

  // 將 API 回應轉換成表單格式
  const template = useMemo(() => {
    if (!data?.data) {
      return null;
    }
    return convertTemplateToFormValues(data.data);
  }, [data]);

  const [showActions, setShowActions] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowActions(true);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  // 建立實踐的核心邏輯
  const doCreatePractice = useCallback(async () => {
    if (isSubmitting || !template) {
      return;
    }

    setIsSubmitting(true);

    try {
      const apiRequest = convertFormValuesToApiRequest(template);

      const response = await createPractice(apiRequest);

      if (response.error) {
        const errorMessage =
          response.error && typeof response.error === "object" && "message" in response.error
            ? String(response.error.message)
            : "建立實踐失敗";
        console.error("Failed to create practice:", errorMessage);
        toast.error(errorMessage);
        setIsSubmitting(false);
        return;
      }

      // 取得新建立的實踐 ID
      const practiceId = response.data?.data?.id;

      // 提交成功後導航到成功頁面
      if (practiceId) {
        router.push(
          `/practices/create/success?practiceName=${encodeURIComponent(template.name || "")}&practiceId=${encodeURIComponent(practiceId)}`
        );
      } else {
        router.push(
          `/practices/create/success?practiceName=${encodeURIComponent(template.name || "")}`
        );
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "建立實踐失敗，請稍後再試";
      console.error("Failed to create practice:", err);
      toast.error(errorMessage);
      setIsSubmitting(false);
    }
  }, [isSubmitting, template, router]);

  // 處理建立按鈕點擊 - 使用 requireAuth 包裝
  const handleCreate = useCallback(() => {
    requireAuth(doCreatePractice, {
      redirectUrl: typeof window !== "undefined" ? window.location.href : undefined,
      source: "app",
    });
  }, [requireAuth, doCreatePractice]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      // 取得 1 個隨機模板
      const response = await getRandomPracticeTemplates({
        count: 1,
      });

      const templates = response.data?.data?.[0];

      if (!templates) {
        // 如果沒有模板，導航回列表頁面
        router.push("/practices/create");
        return;
      }

      router.replace(`/practices/create/template/${templates.id}`);
    } catch (error) {
      // 發生錯誤時導航回列表頁面
      console.error("Failed to fetch random templates:", error);
      router.push("/practices/create");
    } finally {
      setIsRefreshing(false);
    }
  };

  // Loading 狀態
  if (isLoading) {
    return (
      <div className="relative w-screen min-h-screen z-10 overflow-hidden overflow-y-auto bg-logo-cyan flex items-center justify-center">
        <Loader className="size-8 animate-spin text-white" />
      </div>
    );
  }

  // Error 狀態
  if (error || !template) {
    return (
      <div className="relative w-screen min-h-screen z-10 overflow-hidden overflow-y-auto bg-logo-cyan">
        <PageHeader leftAction="back" leftLabel="" rightActionTo="/" variant="light" />
        <div className="flex flex-col items-center justify-center min-h-[60vh] px-5">
          <p className="text-white mb-4">載入模板時發生錯誤</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-screen min-h-screen z-10 overflow-hidden overflow-y-auto bg-logo-cyan">
      <Deco4Svg className="absolute top-0 right-0" width={270} height={484} />

      {/* Top Navigation */}
      <PageHeader leftAction="back" leftLabel="" rightActionTo="/" variant="light" />

      <main className="relative max-w-[600px] md:max-w-[680px] mx-auto pb-8">
        {/* Category Label */}
        <div className="py-4">
          <div className="max-w-[448px] mx-auto px-5">
            <Badge variant="secondary" size="sm" className="text-xs md:text-sm mb-2">
              主題實踐
            </Badge>
            <div className="flex md:flex-col md:gap-3">
              <div className="flex flex-1 items-start gap-1">
                <div className="flex-1">
                  <h1 className="text-2xl leading-normal md:text-4xl font-medium text-white mb-1">
                    {template.name}
                  </h1>
                  <p className="text-sm text-white">{template.actionDescription}</p>
                </div>
                {/* Mobile：右側 */}
                <div className="shrink-0 md:hidden">
                  <Button
                    variant="white"
                    onClick={handleRefresh}
                    disabled={!showActions || isRefreshing}
                    className="group text-sm font-normal h-[35px] px-3 transition-opacity duration-500 ease-out"
                  >
                    {isRefreshing ? (
                      <Loader className="size-4.5 animate-spin" />
                    ) : showActions ? (
                      <RefreshCcw className="size-4.5 group-hover:animate-spin-reverse" />
                    ) : (
                      <Loader className="size-4.5 animate-spin" />
                    )}
                    換一個
                  </Button>
                </div>
              </div>
              {/* Desktop：副標題の下 */}
              <div className="hidden md:block">
                <Button
                  variant="white"
                  onClick={handleRefresh}
                  disabled={!showActions || isRefreshing}
                  className="group text-sm font-normal h-[35px] px-3 transition-opacity duration-500 ease-out"
                >
                  {isRefreshing ? (
                    <Loader className="size-4.5 animate-spin" />
                  ) : showActions ? (
                    <RefreshCcw className="size-4.5 group-hover:animate-spin-reverse" />
                  ) : (
                    <Loader className="size-4.5 animate-spin" />
                  )}
                  換一個
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-t-2xl">
        <div className="max-w-[448px] mx-auto pt-4 px-5 pb-28">
          {/* Course Overview Card */}
          <div className="relative mb-3.5">
            {/* Compass Icon */}
            <div className="absolute -top-14 -right-1 z-10">
              <CompassSvg width={109} height={114} />
            </div>

            <PracticeOverviewCard
              actionDescription={template.actionDescription}
              frequency={template.frequency}
              durationMinutes={template.durationMinutes}
              tags={template.tags}
            />
          </div>

          {/* Execution Timing and Duration Cards */}
          <div className="grid grid-cols-2 gap-4 mb-3.5">
            {/* Execution Timing Card */}
            <ExecutionTimingCard
              executionTiming={template.executionTiming}
              customTiming={template.customTiming}
            />

            {/* Execution Duration Card */}
            <ExecutionDurationCard
              durationDays={template.durationDays}
              startDate={template.startDate}
            />
          </div>

          {/* Recommended Resources Section */}
          {Array.isArray(template.resources) && template.resources.length > 0 && (
            <div>
              <h2 className="text-sm text-center font-medium text-white mt-4 mb-3.5">
                推薦你使用以下資源
              </h2>
              <div className="grid grid-cols-2 gap-3">
                {template.resources?.map((resource) => (
                  <ResourceCard
                    key={resource.id}
                    resource={{
                      id: resource.id,
                      name: resource.name,
                      url: resource.url,
                    }}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
        </div>

        {/* Action Button */}
        <footer
          className={cn(
            "fixed bottom-0 left-0 right-0 flex justify-center p-6 bg-very-light-gray transition-transform duration-500 ease-out border-t border-light-gray",
            showActions ? "translate-y-0" : "translate-y-full"
          )}
        >
          <Button
            onClick={handleCreate}
            disabled={isSubmitting}
            variant="orange"
            className="w-full sm:max-w-[288px]"
          >
            {isSubmitting ? (
              <>
                <Loader className="size-4.5 animate-spin" />
                建立中...
              </>
            ) : (
              <>
                看起來不錯
                <ArrowRightOutlineSvg className="size-4.5" />
              </>
            )}
          </Button>
        </footer>
      </main>
    </div>
  );
}
