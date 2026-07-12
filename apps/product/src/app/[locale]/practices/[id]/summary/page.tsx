"use client";

import { useCurrentUser, usePracticeById, usePracticeSummary } from "@daodao/api";
import { useTranslations } from "@daodao/i18n";
import { useParams, useRouter } from "@daodao/i18n/navigation";
import { toast } from "@daodao/ui/components/sonner";
import { useEffect, useRef } from "react";
import { BackgroundAnimation, PageHeader } from "@/components/layout";
import { PracticeSummaryPage } from "@/components/practice/summary";

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
  const t = useTranslations("practice");
  const router = useRouter();
  const params = useParams();
  const practiceId = params.id as string;

  const { data: practiceData, isLoading: isPracticeLoading } = usePracticeById(practiceId);
  const { data: currentUserData, isLoading: isUserLoading } = useCurrentUser();
  const {
    summary,
    isLoading: isSummaryLoading,
    error: summaryError,
  } = usePracticeSummary(practiceId);

  // 判斷當前用戶是否為實踐的擁有者
  const isOwner = practiceData?.data?.user?.id === currentUserData?.data?.id;

  // task 10.1: 公開/延遲分享練習完成後顯示 toast
  const toastShownRef = useRef(false);
  useEffect(() => {
    if (!practiceData?.data || toastShownRef.current) return;
    const privacyStatus = (practiceData.data as Record<string, unknown>).privacyStatus as
      | string
      | undefined;
    const isDismissed =
      typeof window !== "undefined" && localStorage.getItem(TOAST_DISMISSED_KEY) === "1";
    if (!isDismissed && (privacyStatus === "public" || privacyStatus === "delayed")) {
      toastShownRef.current = true;
      toast(t("summary_public_toast"), {
        description: t("summary_public_toast_description"),
        action: {
          label: t("summary_public_toast_dismiss"),
          onClick: () => {
            localStorage.setItem(TOAST_DISMISSED_KEY, "1");
          },
        },
        duration: 6000,
      });
    }
  }, [practiceData]);

  // 權限檢查：非擁有者時，重定向到實踐詳情頁
  // 注意：active/ending 狀態也可進入總結頁（UI 鎖定機制控制可用功能）
  useEffect(() => {
    if (isPracticeLoading || isUserLoading) return;

    if (!currentUserData?.data || !isOwner) {
      router.replace(`/practices/${practiceId}`);
      return;
    }
  }, [isPracticeLoading, isUserLoading, currentUserData, isOwner, practiceId, router]);

  // Loading 狀態
  if (isPracticeLoading || isUserLoading) {
    return <PageShell message={t("loading")} />;
  }

  // 權限不足（等待重定向）
  if (!isOwner) {
    return <PageShell message={t("summary_redirecting")} />;
  }

  // 摘要載入中
  if (isSummaryLoading) {
    return <PageShell message={t("summary_generating")} />;
  }

  // 摘要載入錯誤
  if (summaryError || !summary) {
    return <PageShell message={summaryError ? t("summary_load_failed") : t("summary_no_data")} />;
  }

  return <PracticeSummaryPage summary={summary} />;
}
