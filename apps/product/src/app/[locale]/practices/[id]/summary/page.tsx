"use client";

import { useCurrentUser, usePracticeById, usePracticeSummary } from "@daodao/api";
import { useParams, useRouter } from "@daodao/i18n/navigation";
import { toast } from "@daodao/ui/components/sonner";
import { endOfDay, isAfter } from "date-fns";
import { useEffect, useMemo, useRef } from "react";
import { BackgroundAnimation, PageHeader } from "@/components/layout";
import { PracticeSummaryPage } from "@/components/practice/summary";
import { PracticeStatus } from "@/constants/practice-status";

const TOAST_DISMISSED_KEY = "showcase_public_toast_dismissed";

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

  // task 10.1: 公開/延遲分享練習完成後顯示 toast
  const toastShownRef = useRef(false);
  useEffect(() => {
    if (!practiceData?.data || toastShownRef.current) return;
    const privacyStatus = (practiceData.data as Record<string, unknown>).privacyStatus as string | undefined;
    const isDismissed = typeof window !== "undefined" && localStorage.getItem(TOAST_DISMISSED_KEY) === "1";
    if (!isDismissed && (privacyStatus === "public" || privacyStatus === "delayed")) {
      toastShownRef.current = true;
      toast("你的實踐打卡內容已公開", {
        description: "已顯示在靈感廣場，讓更多人看見你的成長！",
        action: {
          label: "不再顯示",
          onClick: () => {
            localStorage.setItem(TOAST_DISMISSED_KEY, "1");
          },
        },
        duration: 6000,
      });
    }
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
