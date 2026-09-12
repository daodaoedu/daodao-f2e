import { CohortOutcome } from "@/components/lighthouse/cohort-outcome";

export default async function LighthouseCohortOutcomePage({
  params,
}: PageProps<"/[locale]/lighthouse/programs/[programId]/cohorts/[cohortId]/outcome">) {
  const { programId, cohortId } = await params;
  return <CohortOutcome programId={Number(programId)} cohortId={Number(cohortId)} />;
}
