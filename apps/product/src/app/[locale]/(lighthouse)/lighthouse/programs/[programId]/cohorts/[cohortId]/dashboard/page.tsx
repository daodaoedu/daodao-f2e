import { CohortDashboard } from "@/components/lighthouse/cohort-dashboard";

export default async function LighthouseCohortDashboardPage({
  params,
}: PageProps<"/[locale]/lighthouse/programs/[programId]/cohorts/[cohortId]/dashboard">) {
  const { programId, cohortId } = await params;
  return <CohortDashboard programId={Number(programId)} cohortId={Number(cohortId)} />;
}
