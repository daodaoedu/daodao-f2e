"use client";

import { ArrowRightOutlineSvg } from "@daodao/assets";
import { useTranslations } from "@daodao/i18n";
import { CustomLink } from "@daodao/ui/components/custom-link";
import { Inbox } from "lucide-react";
import { PageShell } from "@/components/layout";
import { BugReportForm } from "@/components/settings/bug-report/bug-report-form";

export default function BugReportPage() {
  const t = useTranslations("app_product");

  return (
    <PageShell headerProps={{ leftAction: "back", leftLabel: "", title: t("bug_page_title") }}>
      {/* 我的回報：查看自己送過的回報與團隊回覆（daodao#451） */}
      <CustomLink
        href="/settings/bug-report/mine"
        className="mb-5 flex items-center gap-2 py-4 px-3 rounded bg-white hover:bg-light-blue transition-colors"
      >
        <Inbox className="size-4.5 text-light-gray shrink-0" />
        <span className="flex-1 text-base text-text-dark">{t("bug_mine_title")}</span>
        <ArrowRightOutlineSvg className="size-4.5 text-bg-dark shrink-0" />
      </CustomLink>
      <BugReportForm />
    </PageShell>
  );
}
