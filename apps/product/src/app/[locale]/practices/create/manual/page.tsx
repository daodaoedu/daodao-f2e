"use client";

import { useAuth } from "@daodao/auth";
import { useTranslations } from "@daodao/i18n";
import { Link } from "@daodao/i18n/navigation";
import { Button } from "@daodao/ui/components/button";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { PracticeWizard, WizardMode } from "@/components/practice/create/wizard";

/** Only platform administrators can create official templates; the API enforces the same rule. */
const TemplateCreationEntry = () => {
  const { isLoading, isAuthenticated, isTemporary, roles } = useAuth();
  const t = useTranslations("practice");

  if (isLoading) {
    return <output>{t("loading")}</output>;
  }

  if (!isAuthenticated) {
    return null;
  }

  const canCreate =
    !isTemporary &&
    roles.some((role) => ["admin", "superadmin", "super_admin"].includes(role.toLowerCase()));

  if (canCreate) {
    return <PracticeWizard mode={WizardMode.template} />;
  }

  return (
    <main className="mx-auto flex min-h-dvh max-w-lg flex-col items-center justify-center gap-6 px-6 py-12 text-center">
      <h1 className="text-xl font-semibold text-text-primary">
        {t("wizard_title_create_template")}
      </h1>
      <p className="text-text-secondary">{t("template_access_denied")}</p>
      <Button variant="outline" asChild>
        <Link href="/practices/create/manual">{t("template_access_create_personal")}</Link>
      </Button>
    </main>
  );
};

/** `?mode=template` creates official templates; all other values create personal practices. */
const WizardFromSearchParams = () => {
  const searchParams = useSearchParams();
  return searchParams.get("mode") === WizardMode.template ? (
    <TemplateCreationEntry />
  ) : (
    <PracticeWizard mode={WizardMode.personal} />
  );
};

export default function CreateManualPracticePage() {
  return (
    <Suspense fallback={null}>
      <WizardFromSearchParams />
    </Suspense>
  );
}
