"use client";

import { Button } from "@daodao/ui/components/button";
import { toast } from "@daodao/ui/components/sonner";
import { useCallback } from "react";

type ArchivedPractice = {
  id: string;
  title: string;
  description: string | null;
  status: "archived";
};

// Mock 資料
const practices: ArchivedPractice[] = [
  {
    id: "1",
    title: "閱讀原子習慣",
    description: "點精油, 跟著 Youtube 教學做",
    status: "archived",
  },
  {
    id: "2",
    title: "閱讀原子習慣",
    description: "點精油, 跟著 Youtube 教學做",
    status: "archived",
  },
  {
    id: "3",
    title: "閱讀原子習慣",
    description: "點精油, 跟著 Youtube 教學做",
    status: "archived",
  },
];

export const ArchivedContentList = () => {
  const handleUnarchive = useCallback(async (_practiceId: string) => {
    // 顯示 toast，帶有復原按鈕
    return new Promise<void>((resolve) => {
      const handleUnarchiveConfirm = () => {
        // 用戶沒有點擊復原，確認取消封存
        console.log('unarchive success');
        resolve();
      };

      toast.success("實踐已成功取消封存", {
        action: {
          label: "復原",
          onClick: () => {
            // 用戶點擊復原，取消封存
            resolve();
          },
        },
        onAutoClose: handleUnarchiveConfirm,
        onDismiss: handleUnarchiveConfirm,
      });
    });
  }, []);

  if (practices.length === 0) {
    return (
      <div className="bg-white rounded-2xl p-6">
        <h2 className="text-lg font-medium text-bg-dark mb-6">主題實踐</h2>
        <div className="text-center py-8 text-basic-400">
          <p>尚無已封存的內容</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <h2 className="font-medium text-text-dark mb-3">主題實踐</h2>

      <div className="space-y-2">
        {practices.map((practice) => (
          <div
            key={practice.id}
            className="flex items-center justify-between gap-2 p-4 rounded-lg border-b border-bg-gray hover:shadow-sm transition-shadow bg-white"
          >
            <div className="flex-1 min-w-0">
              <h3 className="text-base font-medium text-text-dark line-clamp-1 mb-1">
                {practice.title}
              </h3>
              <p className="text-xs text-text-dark line-clamp-1">
                {practice.description}
              </p>
            </div>
            <div className="shrink-0">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleUnarchive(practice.id)}
                className="h-9 px-5"
              >
                取消封存
              </Button>
            </div>
          </div>
        ))}
      </div>
    </>
  );
};
