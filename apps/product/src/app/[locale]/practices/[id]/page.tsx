"use client";

import { usePracticeById, usePracticeCheckIns } from "@daodao/api";
import { useParams, useRouter } from "@daodao/i18n/navigation";
import { Button } from "@daodao/ui/components/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@daodao/ui/components/dropdown-menu";
import { Archive, Ellipsis, Trash2 } from "lucide-react";
import { useMemo } from "react";
import { CheckInButton, CheckInRecordCard, CheckInStack } from "@/components/check-in";
import { BackgroundAnimation, PageHeader } from "@/components/layout";
import {
  ExecutionDurationCard,
  ExecutionTimingCard,
  type ManualPracticeFormValues,
  PracticeDetailTitle,
  PracticeOverviewCard,
} from "@/components/practice";
import {
  DurationDays,
  ExecutionTiming,
  Frequency,
  PracticeTimePeriodToExecutionTimingMap,
} from "@/constants/practice-form";
import {
  ArchivePracticeResult,
  useArchivePracticeDialog,
} from "@/hooks/use-archive-practice-dialog";
import { DeletePracticeResult, useDeletePracticeDialog } from "@/hooks/use-delete-practice-dialog";

export default function PracticeDetailPage() {
  const router = useRouter();
  const params = useParams();
  const practiceId = params.id as string;

  const { data: practiceData, isLoading, error } = usePracticeById(practiceId);
  const { data: checkInsData, isLoading: isLoadingCheckIns } = usePracticeCheckIns(practiceId, {
    limit: 30,
  });
  const { openArchiveDialog } = useArchivePracticeDialog();
  const { openDeleteDialog } = useDeletePracticeDialog();

  const handleEdit = () => {
    router.push(`/practices/${practiceId}/edit`);
  };

  // 將 API 資料轉換為頁面需要的格式
  const practice: (ManualPracticeFormValues & {
    total: number;
    currentProgress: number;
  }) | null = useMemo(() => {
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

    return {
      // Step 1
      name: data.title,
      actionDescription: data.practiceAction || "",
      durationMinutes: data.sessionDurationMinutes ?? 0,

      // Step 2
      startDate: data.startDate || "",
      durationDays,
      frequency,

      // Step 3
      executionTiming: finalExecutionTiming,
      customTiming: data.otherContext || "",

      // Step 4
      tags: data.tags || [],
      resources: [], // TODO: 需要從 API 取得資源列表

      total: data.durationDays ?? 0,
      currentProgress: data.progressPercentage ?? 0,
    };
  }, [practiceData]);

  const handleArchive = async () => {
    const result = await openArchiveDialog(practiceId);
    if (result === ArchivePracticeResult.Archived) {
      // TODO: 實作封存功能
    }
  };

  const handleDelete = async () => {
    const result = await openDeleteDialog(practiceId);
    if (result === DeletePracticeResult.Deleted) {
      // TODO: 實作刪除功能
    }
  };

  // TODO: 取得上一個和下一個實踐的 ID（需要從 API 取得實踐列表）
  const handlePrevious = () => {
    // router.push(`/practices/${previousId}`);
  };

  const handleNext = () => {
    // router.push(`/practices/${nextId}`);
  };

  // Loading 狀態
  if (isLoading) {
    return (
      <div className="relative w-screen min-h-screen z-10 overflow-hidden overflow-y-auto bg-white">
        <PageHeader leftAction="back" title="主題實踐" rightActionTo="/" />
        <BackgroundAnimation />
        <main className="max-w-[448px] mx-auto px-5 pb-6 pt-4">
          <div className="text-center text-text-dark">載入中...</div>
        </main>
      </div>
    );
  }

  // Error 狀態
  if (error || !practice) {
    return (
      <div className="relative w-screen min-h-screen z-10 overflow-hidden overflow-y-auto bg-white">
        <PageHeader leftAction="back" title="主題實踐" rightActionTo="/" />
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
      <PageHeader leftAction="back" title="主題實踐" rightActionTo="/" />

      <BackgroundAnimation />

      <main className="max-w-[448px] mx-auto px-5 pb-6">
        {/* Practice Title Section */}
        <PracticeDetailTitle
          title={practice.name}
          onPrevious={handlePrevious}
          onNext={handleNext}
          hasPrevious={false} // TODO: 從 API 取得實踐列表來判斷
          hasNext={false} // TODO: 從 API 取得實踐列表來判斷
        />

        <div className="flex items-center justify-between mb-4">
          <p className="text-base font-medium text-text-dark">執行方式</p>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <Ellipsis className="size-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleEdit} className="text-center">
                編輯實踐
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        {/* Practice Overview Card */}
        <PracticeOverviewCard
          actionDescription={practice.actionDescription || ""}
          frequency={practice.frequency}
          durationMinutes={practice.durationMinutes}
          tags={practice.tags}
          progress={practice.currentProgress}
          showProgress
        />

        {/* Execution Timing and Remaining Cards */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <ExecutionTimingCard
            executionTiming={practice.executionTiming}
            customTiming={practice.customTiming}
          />
          <ExecutionDurationCard
            durationDays={practice.durationDays}
            startDate={practice.startDate}
            showRemaining
          />
        </div>

        {/* Check-in Record Card */}
        <CheckInRecordCard
          checkInsData={checkInsData}
          isLoading={isLoadingCheckIns}
        />
      </main>

      {/* CheckIn Stack */}
      <div className="max-w-[448px] mx-auto">
        <CheckInStack practiceId={practiceId} checkInsData={checkInsData} />
      </div>

      <div className="flex flex-col w-fit gap-4 mx-auto pb-40 pt-6">
        <Button variant="white" className="px-8" onClick={handleArchive}>
          <Archive className="size-4.5" />
          <span>封存實踐</span>
        </Button>
        <Button variant="ghost" className="px-8 border border-logo-cyan" onClick={handleDelete}>
          <Trash2 className="size-4.5" />
          <span>刪除實踐</span>
        </Button>
      </div>

      <footer className="fixed bottom-0 left-0 right-0 flex justify-center gap-6 p-6 border-t border-light-gray bg-very-light-gray z-20">
        {/* 打卡按鈕 */}
        <CheckInButton
          variant="orange"
          className="w-full sm:max-w-[288px]"
          taskTitle={practice.name}
          onComplete={() => {}}
        />
      </footer>
    </div>
  );
}
