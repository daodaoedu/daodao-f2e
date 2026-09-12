import { CohortOutcomeReport } from "@/components/lighthouse/cohort-outcome-report";

export default async function LighthouseCohortOutcomeReportPage({
  params,
}: PageProps<"/[locale]/lighthouse/programs/[programId]/cohorts/[cohortId]/outcome/report">) {
  const { programId, cohortId } = await params;
  return <CohortOutcomeReport programId={Number(programId)} cohortId={Number(cohortId)} />;
}
