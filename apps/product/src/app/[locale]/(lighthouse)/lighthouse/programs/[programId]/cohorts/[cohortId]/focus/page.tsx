import { CohortFocus } from "@/components/lighthouse/cohort-focus";

export default async function LighthouseCohortFocusPage({
  params,
}: PageProps<"/[locale]/lighthouse/programs/[programId]/cohorts/[cohortId]/focus">) {
  const { programId, cohortId } = await params;
  return <CohortFocus programId={Number(programId)} cohortId={Number(cohortId)} />;
}
