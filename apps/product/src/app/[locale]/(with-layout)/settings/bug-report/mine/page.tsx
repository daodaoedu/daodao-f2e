"use client";

import { useTranslations } from "@daodao/i18n";
import { Suspense } from "react";
import { PageShell } from "@/components/layout";
import { MyBugReports } from "@/components/settings/bug-report/my-bug-reports";

export default function MyBugReportsPage() {
  const t = useTranslations("app_product");

  return (
    <PageShell headerProps={{ leftAction: "back", leftLabel: "", title: t("bug_mine_title") }}>
      <Suspense>
        <MyBugReports />
      </Suspense>
    </PageShell>
  );
}
