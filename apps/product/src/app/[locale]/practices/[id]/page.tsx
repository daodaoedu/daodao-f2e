"use client";

import {
  useArchivePractice,
  useDeletePractice,
  useMyPractices,
  usePracticeById,
  usePracticeCheckIns,
} from "@daodao/api";
import { useParams, useRouter } from "@daodao/i18n/navigation";
import { Button } from "@daodao/ui/components/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@daodao/ui/components/dropdown-menu";
import { toast } from "@daodao/ui/components/sonner";
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
  type ExecutionTiming,
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
  const { data: practicesListData } = useMyPractices({
    limit: 100, // 取得足夠的實踐列表來判斷前後實踐
  });
  const { openArchiveDialog } = useArchivePracticeDialog();
  const { openDeleteDialog } = useDeletePracticeDialog();
  const { archivePractice, restorePractice } = useArchivePractice(practiceId);
  const { deletePractice: deletePracticeById } = useDeletePractice(practiceId);

  const handleEdit = () => {
    router.push(`/practices/${practiceId}/edit`);
  };

  // 將 API 資料轉換為頁面需要的格式
  const practice:
    | (ManualPracticeFormValues & {
        total: number;
        currentProgress: number;
      })
    | null = useMemo(() => {
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
      executionTiming,
      customTiming: data.otherContext || "",

      // Step 4
      tags: data.tags || [],
      resources: [], // TODO: 需要從 API 取得資源列表

      total: data.durationDays ?? 0,
      currentProgress: data.progressPercentage ?? 0,
    };
  }, [practiceData]);

  const handleArchive = async () => {
    const result = await openArchiveDialog({
      onRestore: async () => {
        try {
          await restorePractice();
          toast.success("實踐已成功復原");
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : "復原失敗";
          console.error("Failed to restore practice:", errorMessage);
          toast.error(errorMessage);
        }
      },
    });
    if (result === ArchivePracticeResult.Archived) {
      try {
        await archivePractice();
        // 導航到封存頁面
        router.push("/settings/archived");
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "封存失敗";
        console.error("Failed to archive practice:", errorMessage);
        toast.error(errorMessage);
      }
    }
  };

  const handleDelete = async () => {
    const result = await openDeleteDialog();
    if (result === DeletePracticeResult.Deleted) {
      try {
        await deletePracticeById();
        // 導航到實踐列表頁面
        router.push("/");
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "刪除失敗";
        console.error("Failed to delete practice:", errorMessage);
        toast.error(errorMessage);
      }
    }
  };

  // 計算當前實踐在列表中的位置，並判斷是否有上一個和下一個實踐
  const { previousPracticeId, nextPracticeId, hasPrevious, hasNext } = useMemo(() => {
    const practices = practicesListData?.data || [];
    const currentIndex = practices.findIndex((practice) => String(practice.id) === practiceId);

    if (currentIndex === -1) {
      return {
        previousPracticeId: null,
        nextPracticeId: null,
        hasPrevious: false,
        hasNext: false,
      };
    }

    const previousPractice = currentIndex > 0 ? practices[currentIndex - 1] : null;
    const nextPractice = currentIndex < practices.length - 1 ? practices[currentIndex + 1] : null;

    return {
      previousPracticeId: previousPractice ? String(previousPractice.id) : null,
      nextPracticeId: nextPractice ? String(nextPractice.id) : null,
      hasPrevious: previousPractice !== null,
      hasNext: nextPractice !== null,
    };
  }, [practicesListData, practiceId]);

  const handlePrevious = () => {
    if (previousPracticeId) {
      router.push(`/practices/${previousPracticeId}`);
    }
  };

  const handleNext = () => {
    if (nextPracticeId) {
      router.push(`/practices/${nextPracticeId}`);
    }
  };

  const handleBack = () => {
    router.push("/");
  };

  // Loading 狀態
  if (isLoading) {
    return (
      <div className="relative w-screen min-h-screen z-10 overflow-hidden overflow-y-auto bg-white">
        <PageHeader leftAction="back" title="主題實踐" onLeftAction={handleBack} rightActionTo="/" />
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
        <PageHeader leftAction="back" title="主題實踐" onLeftAction={handleBack} rightActionTo="/" />
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
      <PageHeader leftAction="back" title="主題實踐" onLeftAction={handleBack} rightActionTo="/" />

      <BackgroundAnimation />

      <main className="max-w-[448px] mx-auto px-5 pb-6">
        {/* Practice Title Section */}
        <PracticeDetailTitle
          title={practice.name}
          status={practiceData?.data?.status}
          onPrevious={handlePrevious}
          onNext={handleNext}
          hasPrevious={hasPrevious}
          hasNext={hasNext}
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
        <CheckInRecordCard checkInsData={checkInsData} isLoading={isLoadingCheckIns} />
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
          practiceId={practiceId}
          practiceStatus={practiceData?.data?.status}
          lastCheckInDate={checkInsData?.data?.[0]?.checkinDate || null}
          taskTitle={practice.name}
          progressPercentage={practice?.currentProgress ?? 0}
        />
      </footer>
    </div>
  );
}
