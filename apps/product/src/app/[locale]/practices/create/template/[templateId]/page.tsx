"use client";

import { usePracticeTemplateById } from "@daodao/api";
import { useAuth } from "@daodao/auth";
import { useTranslations } from "@daodao/i18n";
import { Loader } from "lucide-react";
import { useParams } from "next/navigation";
import { useCallback, useMemo } from "react";
import { PageHeader } from "@/components/layout";
import { PracticeWizard, WizardMode } from "@/components/practice/create/wizard";
import { templateToWizardValues } from "@/components/practice/create/wizard/template-to-values";

/**
 * 由模版建立個人實踐：載入模版 → 轉成精靈初始值 → 走四步驟流程（帶 templateId）
 */
export default function TemplateDetailPage() {
  const t = useTranslations("practice");
  const params = useParams();
  const templateId = params.templateId as string;

  const { requireAuth } = useAuth();
  const { data, error, isLoading } = usePracticeTemplateById(templateId);

  const initialValues = useMemo(() => {
    if (!data?.data) return null;
    return templateToWizardValues(data.data);
  }, [data]);

  // 未登入時先要求登入，登入後再送出（沿用舊頁行為）
  const submitGuard = useCallback(
    (run: () => Promise<void>) => {
      requireAuth(run, {
        redirectUrl: typeof window !== "undefined" ? window.location.href : undefined,
        source: "app",
      });
    },
    [requireAuth]
  );

  if (isLoading) {
    return (
      <div className="relative z-10 flex min-h-screen w-screen items-center justify-center overflow-hidden overflow-y-auto bg-white">
        <Loader className="size-8 animate-spin text-logo-cyan" />
      </div>
    );
  }

  if (error || !initialValues) {
    return (
      <div className="relative z-10 min-h-screen w-screen overflow-hidden overflow-y-auto bg-white">
        <PageHeader leftAction="back" leftLabel="" />
        <div className="flex min-h-[60vh] flex-col items-center justify-center px-5">
          <p className="mb-4 text-text-dark">{t("template_load_error")}</p>
        </div>
      </div>
    );
  }

  return (
    <PracticeWizard
      mode={WizardMode.personal}
      initialValues={initialValues}
      templateId={templateId}
      submitGuard={submitGuard}
    />
  );
}
