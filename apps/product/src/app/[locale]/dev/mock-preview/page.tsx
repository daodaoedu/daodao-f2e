"use client";

import { useSheetManager } from "@daodao/ui/components/animate-ui/components/radix/sheet";
import { Button } from "@daodao/ui/components/button";
import { toast } from "@daodao/ui/components/sonner";
import { CalendarCheck } from "lucide-react";
import { useCallback, useRef } from "react";
import { BackgroundAnimation, PageHeader } from "@/components/layout";
import { PracticeDetailShell } from "@/components/practice";
import {
  CheckInPhase2SheetContent,
  CheckInSheetContent,
  type CheckInData,
} from "@/components/check-in";
import { mockCheckInsResponse, mockPractice, mockUser } from "@/components/check-in/mock-data";
import {
  ExecutionTiming as ExecutionTimingConst,
  Frequency as FrequencyConst,
  DurationDays as DurationDaysConst,
} from "@/constants/practice-form";
import { PracticeStatus } from "@/constants/practice-status";
import { useCheckInSuccessDialog } from "@/hooks/use-check-in-success-dialog";

// 將 mock 打卡資料包成 PracticeCheckInsResponse 格式
const mockCheckInsData = {
  success: true as const,
  data: mockCheckInsResponse.data,
  pagination: {
    currentPage: 1,
    totalPages: 1,
    totalItems: mockCheckInsResponse.data.length,
    itemsPerPage: 20,
    hasNext: false,
    hasPrev: false,
  },
  timestamp: mockCheckInsResponse.timestamp,
};

/**
 * 模擬打卡按鈕（不呼叫真實 API）
 * 用於 mock preview 頁面展示兩階段打卡流程
 */
function MockCheckInButton({
  taskTitle,
  progressFrom,
  progressTo,
}: {
  taskTitle: string;
  progressFrom: number;
  progressTo: number;
}) {
  const { open: openSheet } = useSheetManager();
  const { openSuccessDialog } = useCheckInSuccessDialog({ title: taskTitle });
  const closePhase1Ref = useRef<(() => void) | null>(null);
  const closePhase2Ref = useRef<(() => void) | null>(null);

  const openPhase2Sheet = useCallback(() => {
    const { close } = openSheet({
      title: "分享心得",
      description: "補充你的標籤、心得與照片",
      content: (
        <CheckInPhase2SheetContent
          taskTitle={taskTitle}
          suggestedTags={[
            "Practice",
            "New concept",
            "Interesting",
            "Stuck",
            "Next step",
            "Improve",
            "Doubt",
            "Breakthrough",
          ]}
          onComplete={async () => {
            closePhase2Ref.current?.();
            toast.success("心得已儲存！");
          }}
        />
      ),
      dismissible: true,
      closeOnEscape: true,
      showCloseButton: true,
    });
    closePhase2Ref.current = close;
  }, [taskTitle, openSheet]);

  const handlePhase1Complete = useCallback(
    async (_data: CheckInData) => {
      const result = await openSuccessDialog(
        progressFrom,
        progressTo,
        "太棒了，又完成一次行動！"
      );
      if (result.value === "share") {
        openPhase2Sheet();
      }
    },
    [openSuccessDialog, progressFrom, progressTo, openPhase2Sheet]
  );

  const openPhase1Sheet = useCallback(() => {
    const { close } = openSheet({
      title: "打卡",
      description: "記錄你的學習進度和心情",
      content: (
        <CheckInSheetContent
          taskTitle={taskTitle}
          onComplete={async (data) => {
            closePhase1Ref.current?.();
            await handlePhase1Complete(data);
          }}
        />
      ),
      dismissible: true,
      closeOnEscape: true,
      showCloseButton: true,
    });
    closePhase1Ref.current = close;
  }, [taskTitle, handlePhase1Complete, openSheet]);

  return (
    <Button variant="orange" className="w-full sm:max-w-[288px]" onClick={openPhase1Sheet}>
      <CalendarCheck className="size-4.5" />
      打卡
    </Button>
  );
}

export default function MockPreviewPage() {
  return (
    <div className="relative w-screen min-h-screen z-10 overflow-hidden overflow-y-auto bg-gray-100">
      <PageHeader leftAction="back" leftLabel="" title="主題實踐" rightActionTo="/" />
      <BackgroundAnimation />

      <PracticeDetailShell
        practice={{
          id: mockPractice.id,
          title: mockPractice.title,
          status: PracticeStatus.active,
          actionDescription: mockPractice.practiceAction,
          frequency: FrequencyConst.fourToSeven,
          durationMinutes: mockPractice.sessionDurationMinutes,
          durationDays: DurationDaysConst.twentyOne,
          startDate: mockPractice.startDate,
          executionTiming: [ExecutionTimingConst.evening],
          customTiming: "",
          tags: mockPractice.tags,
          progress: mockPractice.progressPercentage,
          resources: mockPractice.resources,
        }}
        practiceId={mockPractice.id}
        isOwner={true}
        checkInsData={mockCheckInsData}
        isLoadingCheckIns={false}
        isLoadingComments={false}
        comments={[]}
        currentUserName={mockUser.name}
        currentUserId={mockUser.id}
        currentUserPhotoURL={mockUser.photoURL ?? undefined}
        commentCount={mockPractice.stats.commentCount}
        hasPrevious={false}
        hasNext={false}
        onPrevious={() => {}}
        onNext={() => {}}
        onEditPractice={() => {}}
        onArchivePractice={() => {}}
        onDeletePractice={() => {}}
        onSubmitComment={() => {}}
        onEditComment={() => {}}
        onDeleteComment={() => {}}
        browseActivity={{
          viewCount: mockPractice.stats.viewCount,
          followers: [],
        }}
        footer={
          <footer className="fixed bottom-0 left-0 right-0 flex justify-center gap-6 p-6 border-t border-light-gray bg-very-light-gray z-20">
            <MockCheckInButton
              taskTitle={mockPractice.title}
              progressFrom={mockPractice.progressPercentage}
              progressTo={Math.min(mockPractice.progressPercentage + 8, 100)}
            />
          </footer>
        }
      />
    </div>
  );
}
