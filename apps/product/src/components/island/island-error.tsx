"use client";

import { useTranslations } from "@daodao/i18n";
import { Link, useRouter } from "@daodao/i18n/navigation";
import { Button } from "@daodao/ui/components/button";
import { RefreshCcw } from "lucide-react";

/**
 * islandData 載入失敗錯誤頁＋重試（task 4.4）
 */
export function IslandError({ identifier }: { identifier: string }) {
  const t = useTranslations("island");
  const router = useRouter();

  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center gap-4 bg-gradient-to-b from-[#F3FCFC] to-[#A9EDE8] px-6 text-center">
      <h1 className="text-lg font-medium text-text-dark">{t("error_title")}</h1>
      <p className="text-sm text-text-dark/70">{t("error_desc")}</p>
      <div className="flex gap-3">
        <Button variant="orange" onClick={() => router.refresh()}>
          <RefreshCcw className="size-4" />
          {t("error_retry")}
        </Button>
        <Button variant="ghost" asChild>
          <Link href={`/users/${identifier}`}>{t("back_to_profile")}</Link>
        </Button>
      </div>
    </div>
  );
}
