"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { PracticeWizard, WizardMode } from "@/components/practice/create/wizard";

/** `?mode=template` → 建立模版；其餘皆為個人實踐 */
const WizardFromSearchParams = () => {
  const searchParams = useSearchParams();
  const mode =
    searchParams.get("mode") === WizardMode.template ? WizardMode.template : WizardMode.personal;
  return <PracticeWizard mode={mode} />;
};

export default function CreateManualPracticePage() {
  return (
    <Suspense fallback={null}>
      <WizardFromSearchParams />
    </Suspense>
  );
}
