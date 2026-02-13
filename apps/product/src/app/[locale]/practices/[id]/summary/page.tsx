"use client";

import { useCurrentUser, usePracticeById, usePracticeSummary } from "@daodao/api";
import { useParams, useRouter } from "@daodao/i18n/navigation";
import { endOfDay, isAfter } from "date-fns";
import { useEffect, useMemo } from "react";
import { BackgroundAnimation, PageHeader } from "@/components/layout";
import { PracticeSummaryPage } from "@/components/practice/summary";
import { PracticeStatus } from "@/constants/practice-status";

/**
 * 頁面狀態 Shell（Loading / Error / 重新導向等共用外框）
 */
function PageShell({ message }: { message: string }) {
  return (
    <div className="relative w-screen min-h-screen z-10 overflow-hidden overflow-y-auto bg-white">
      <PageHeader leftAction="back" leftLabel="" title="" rightActionTo="/" />
      <BackgroundAnimation />
      <main className="max-w-[448px] mx-auto px-5 pb-6 pt-4">
        <div className="text-center text-text-dark">{message}</div>
      </main>
    </div>
  );
}

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
    if (status === PracticeStatus.completed) return true;

    // 如果有結束日期，檢查是否已過期
    if (endDate) {
      return isAfter(new Date(), endOfDay(new Date(endDate)));
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
    return <PageShell message="載入中..." />;
  }

  // 權限不足或實踐未到期（等待重定向）
  if (!isOwner || !isExpired) {
    return <PageShell message="重新導向中..." />;
  }

  // 摘要載入中
  if (isSummaryLoading) {
    return <PageShell message="正在生成總結..." />;
  }

  // 摘要載入錯誤
  if (summaryError || !summary) {
    return <PageShell message={summaryError ? "載入失敗，請稍後再試" : "無法載入總結資料"} />;
  }

  return <PracticeSummaryPage summary={summary} />;
}
