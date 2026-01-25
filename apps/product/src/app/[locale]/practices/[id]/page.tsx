"use client";

import { useParams } from "@daodao/i18n/navigation";
import { Button } from "@daodao/ui/components/button";
import { Archive, Trash2 } from "lucide-react";
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
  ArchivePracticeResult,
  useArchivePracticeDialog,
} from "@/hooks/use-archive-practice-dialog";
import { DeletePracticeResult, useDeletePracticeDialog } from "@/hooks/use-delete-practice-dialog";

const practice: ManualPracticeFormValues & {
  total: number;
  currentProgress: number;
} = {
  // Step 1
  name: "學習 Vibe coding",
  actionDescription: "搭配 Gemini,看 30 天線上教學、實際 做一個專案。",
  durationMinutes: 40,

  // Step 2
  startDate: "2026-01-01",
  durationDays: "7",
  frequency: "2-4",

  // Step 3
  executionTiming: ["holiday", "commute", "beforeSleep"],
  customTiming: "",

  // Step 4
  tags: ["專案管理", "software", "applications", "產品設計", "AI"],
  resources: [
    {
      id: "1",
      name: "Hahow",
      url: "https://hahow.in/",
    },
    {
      id: "2",
      name: "Hahow",
    },
    {
      id: "3",
      name: "我來試試看這個特別長的資源名稱",
      url: "https://example.com/",
    },
  ],

  total: 7,
  currentProgress: 5,
};

export default function PracticeDetailPage() {
  const params = useParams();
  const practiceId = params.id as string;

  const { openArchiveDialog } = useArchivePracticeDialog();
  const { openDeleteDialog } = useDeletePracticeDialog();

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
          hasPrevious={false} // TODO: 從 API 取得
          hasNext={false} // TODO: 從 API 取得
        />

        {/* Practice Overview Card */}
        <PracticeOverviewCard
          actionDescription={practice.actionDescription || ""}
          frequency={practice.frequency}
          durationMinutes={practice.durationMinutes}
          tags={practice.tags}
          progress={practice.currentProgress}
          total={practice.total}
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
            currentProgress={practice.currentProgress}
            showRemaining
          />
        </div>

        {/* Check-in Record Card */}
        <CheckInRecordCard />
      </main>

      {/* CheckIn Stack */}
      <div className="max-w-[448px] mx-auto">
        <CheckInStack practiceId={practiceId} />
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
