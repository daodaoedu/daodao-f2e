"use client";

import { useTranslations } from "@daodao/i18n";
import { PageShell } from "@/components/layout";
import { BugReportForm } from "@/components/settings/bug-report/bug-report-form";

export default function BugReportPage() {
  const t = useTranslations("app_product");

  return (
    <PageShell headerProps={{ leftAction: "back", leftLabel: "", title: t("bug_page_title") }}>
      <BugReportForm />
    </PageShell>
  );
}
