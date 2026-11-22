import { notFound } from "next/navigation";
import { CohortSharedCheckinPage } from "@/components/cohort/cohort-shared-checkin-page";

const toPositiveId = (value: string) => {
  const id = Number(value);
  return Number.isSafeInteger(id) && id > 0 ? id : null;
};

/** 共用實踐打卡連結：只含 cohortId 與 templateId，依登入者解析本人實踐（daodao-f2e#1194） */
export default async function CohortSharedCheckinRoute({
  params,
}: {
  params: Promise<{ cohortId: string; templateId: string }>;
}) {
  const { cohortId, templateId } = await params;
  const parsedCohortId = toPositiveId(cohortId);
  const parsedTemplateId = toPositiveId(templateId);
  if (parsedCohortId === null || parsedTemplateId === null) notFound();
  return <CohortSharedCheckinPage cohortId={parsedCohortId} templateId={parsedTemplateId} />;
}
