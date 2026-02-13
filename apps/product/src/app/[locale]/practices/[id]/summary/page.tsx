"use client";

import { useCurrentUser, usePracticeById, usePracticeSummary } from "@daodao/api";
import { useParams, useRouter } from "@daodao/i18n/navigation";
import { useEffect, useMemo } from "react";
import { BackgroundAnimation, PageHeader } from "@/components/layout";
import { PracticeSummaryPage } from "@/components/practice/summary";

/**
 * 實踐完成總結頁面
 * 僅實踐擁有者且實踐已到期時可訪問
 */
export default function PracticeSummaryPageRoute() {
  const router = useRouter();
  const params = useParams();
  const practiceId = params.id as string;

  const { data: practiceData, isLoading: isPracticeLoading } = usePracticeById(practiceId);
  const { data: currentUserData, isLoading: isUserLoading } = useCurrentUser();
  const { summary, isLoading: isSummaryLoading, error: summaryError } = usePracticeSummary(practiceId);

  // 判斷當前用戶是否為實踐的擁有者
  const isOwner = practiceData?.data?.user?.id === currentUserData?.data?.id;

  // 判斷實踐是否已到期（completed 狀態或 endDate < now）
  const isExpired = useMemo(() => {
    if (!practiceData?.data) return false;

    const { status, endDate } = practiceData.data;

    // 如果狀態是 completed，則視為已到期
    if (status === "completed") return true;

    // 如果有結束日期，檢查是否已過期
    if (endDate) {
      const endDateTime = new Date(endDate);
      endDateTime.setHours(23, 59, 59, 999); // 設置為當天結束
      return new Date() > endDateTime;
    }

    return false;
  }, [practiceData]);

  // 權限檢查：非擁有者或實踐未到期時，重定向到實踐詳情頁
  useEffect(() => {
    // 等待資料載入完成
    if (isPracticeLoading || isUserLoading) return;

    // 未登入或不是擁有者，重定向
    if (!currentUserData?.data || !isOwner) {
      router.replace(`/practices/${practiceId}`);
      return;
    }

    // 實踐未到期，重定向
    if (!isExpired) {
      router.replace(`/practices/${practiceId}`);
      return;
    }
  }, [isPracticeLoading, isUserLoading, currentUserData, isOwner, isExpired, practiceId, router]);

  // Loading 狀態
  if (isPracticeLoading || isUserLoading) {
    return (
      <div className="relative w-screen min-h-screen z-10 overflow-hidden overflow-y-auto bg-white">
        <PageHeader leftAction="back" leftLabel="" title="實踐總結" rightActionTo="/" />
        <BackgroundAnimation />
        <main className="max-w-[448px] mx-auto px-5 pb-6 pt-4">
          <div className="text-center text-text-dark">載入中...</div>
        </main>
      </div>
    );
  }

  // 權限不足或實踐未到期（等待重定向）
  if (!isOwner || !isExpired) {
    return (
      <div className="relative w-screen min-h-screen z-10 overflow-hidden overflow-y-auto bg-white">
        <PageHeader leftAction="back" leftLabel="" title="實踐總結" rightActionTo="/" />
        <BackgroundAnimation />
        <main className="max-w-[448px] mx-auto px-5 pb-6 pt-4">
          <div className="text-center text-text-dark">重新導向中...</div>
        </main>
      </div>
    );
  }

  // 摘要載入中
  if (isSummaryLoading) {
    return (
      <div className="relative w-screen min-h-screen z-10 overflow-hidden overflow-y-auto bg-white">
        <PageHeader leftAction="back" leftLabel="" title="實踐總結" rightActionTo="/" />
        <BackgroundAnimation />
        <main className="max-w-[448px] mx-auto px-5 pb-6 pt-4">
          <div className="text-center text-text-dark">正在生成總結...</div>
        </main>
      </div>
    );
  }

  // 摘要載入錯誤
  if (summaryError || !summary) {
    return (
      <div className="relative w-screen min-h-screen z-10 overflow-hidden overflow-y-auto bg-white">
        <PageHeader leftAction="back" leftLabel="" title="實踐總結" rightActionTo="/" />
        <BackgroundAnimation />
        <main className="max-w-[448px] mx-auto px-5 pb-6 pt-4">
          <div className="text-center text-text-dark">
            {summaryError || "無法載入總結資料"}
          </div>
        </main>
      </div>
    );
  }

  return <PracticeSummaryPage summary={summary} practiceId={practiceId} />;
}
